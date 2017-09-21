(function () {
    FXStreet.Class.Patterns.Singleton.PushTT = (function () {
        var instance;

        var pushTT = function () {
            var parent = FXStreet.Class.Base(),
               _this = FXStreet.Util.extendObject(parent);

            var Symbols = []; //{ symbolId: '', pushType: '', callbacks:[], lastValue: '' }

            var securityTokenUrl = FXStreet.Resource.TeletraderSecurityUrl;
            var ttPush = null;
            var initializedCallBackList = [];

            _this.init = function (json) {
                _this.setSettingsByObject(json);
                start();
            };

            var start = function () {
                tokenCallback(ttPushInitialize);
            };

            var tokenCallback = function (tokenSuccessCallback) {
                var auth = FXStreet.Class.Patterns.Singleton.Authorization.Instance();
                auth.getTokenPromise()
                    .then(function (token) {
                        $.ajax({
                            type: "GET",
                            url: securityTokenUrl,
                            beforeSend: function (xhr) {
                                xhr.setRequestHeader("Authorization", token.token_type + ' ' + token.access_token);
                            }
                        }).done(function (token) {
                            tokenSuccessCallback(token.Token);
                        });
                });
            };
            
            var ttPushInitialize = function (token) {
                var timeZoneManager = FXStreet.Class.Patterns.Singleton.TimeZoneManager.Instance();
                var ttTZValue = timeZoneManager.GetTTTimeZoneValue();

                ttPush = new FXStreet.ExternalLib.Teletrader.Push({
                    token: token,
                    tokenCallback: tokenCallback
                });
                ttPush.SetOptions({
                    'pushurl': FXStreet.Resource.DataProviderUrl,
                    'symbolfids': getFidsByPushType(),
                    'timeZone': ttTZValue
                    //,'loglevel': 'debug'
                });

                ttPush.addEventListener("status", function (status) {
                    var aloji = status;
                    //console.log('status.statusType: ' + status.statusType + ", status.message: " + JSON.stringify(status.message));
                    //if (status.message.error) {
                    //    console.log('status.message.error: ' + status.message.error);
                    //}
                });

                if (initializedCallBackList.length > 0) {
                    ttPush.startBatch();
                    for (var i = 0; i < initializedCallBackList.length; i++) {
                        subscribePrivate([initializedCallBackList[i]]);
                    }
                    ttPush.endBatch();
                    initializedCallBackList = [];
                }
            };

            _this.Subscribe = function (symbolIds, priceChangeCallback, elementType) {
                var symbolToSubscribe = [];
                for (var i = 0; i < symbolIds.length; i++) {
                    var symbol = getOrCreateSymbol(symbolIds[i], elementType);
                    addCallback(symbol, priceChangeCallback);
                    if (symbol.lastValue !== null) {
                        priceChangeCallback($.extend({}, symbol.lastValue));
                    }
                    else {
                        symbolToSubscribe.push(symbol);
                    }
                }
                if (symbolToSubscribe.length > 0 && initialized()) {
                    ttPush.startBatch();
                    subscribePrivate(symbolToSubscribe);
                    ttPush.endBatch();
                }
                else {
                    for (var i = 0; i < symbolToSubscribe.length; i++) {
                        initializedCallBackList.push(symbolToSubscribe[i]);
                    }
                }
            };

            var initialized = function () {
                return ttPush !== null;
            };

            var getOrCreateSymbol = function (symbolId, elementType) {
                var symbol = {};
                var symbolValues = $.grep(Symbols, function (symbol) {
                    return symbol.symbolId === symbolId;
                });
                if (symbolValues.length > 0) {
                    symbol = symbolValues[0];
                }
                else{
                    var pushType = getPushType(elementType);
                    var symbol = {
                        'symbolId': symbolId,
                        'callbacks': [],
                        'pushType': pushType,
                        'elementType':elementType,
                        'lastValue': null
                    };
                    Symbols.push(symbol);
                }
                return symbol;
            };

            var addCallback = function (symbol, priceChangeCallback) {
                var callbackValues = $.grep(symbol.callbacks, function (c) {
                    return c === priceChangeCallback;
                });
                if (callbackValues.length === 0) {
                    symbol.callbacks.push(priceChangeCallback);
                }
            };

            var getPushType = function(elementType) {
                if (elementType === "fxs_widget_full" || elementType === "fxs_widget_bigToolbar") {
                    return 'Everything';
                }
                return 'Snapshot';
            };

            _this.Unsubscribe = function (symbolIds, priceChangeCallback) {
                var symbolToUnsubscribe = [];
                for (var i = 0; i < symbolIds.length; i++) {
                    var symbol = Symbols.findFirst(function (s) {
                        return s.symbolId === symbolIds[i];
                    });
                    if (symbol) {
                        var callbackValues = $.grep(symbol.callbacks, function (c) {
                            return c !== priceChangeCallback;
                        });
                        if (callbackValues.length === 0) {
                            Symbols = $.grep(Symbols, function (s) {
                                return s !== symbol;
                            });
                            symbolToUnsubscribe.push(symbol);
                        }
                        else {
                            symbol.callbacks = callbackValues;
                        }
                    }
                }
                if (symbolToUnsubscribe.length > 0 && initialized()) {
                    ttPush.startBatch();
                    unsubscribePrivate(symbolToUnsubscribe);
                    ttPush.endBatch();
                }
            };

            var unsubscribePrivate = function (symbols) {
                var mainSymbols = [];
                for (var i = 0; i < symbols.length; i++) {
                    if (symbols[i] !== undefined && symbols[i].symbolId !== undefined) {
                        mainSymbols.push(getMainSymbolFormat(symbols[i].symbolId));
                    }
                }
                ttPush.unsubscribe([{
                    symbolID: mainSymbols,
                    callback: ttCallback,
                }]);
            };

            var subscribePrivate = function (symbols) {
                if (symbols.length == 0) {
                    return;
                }
                var mainSymbols = [];
                for (var i = 0; i < symbols.length; i++) {
                    if (symbols[i] !== undefined && symbols[i].symbolId !== undefined) {
                        mainSymbols.push(getMainSymbolFormat(symbols[i].symbolId));
                    }
                }
                ttPush.subscribe([{
                    symbolID: mainSymbols,
                    callback: ttCallback,
                    filterFields: {
                        FIDs: getFidsByPushType(symbols[0]),
                        SymbolSnapshot: getSymbolSnapshot(symbols[0]),
                        PushType: symbols[0].pushType
                    }
                }]);
            };

            var getFidsByPushType = function (symbol) {
                if (symbol && symbol.pushType === 'Everything') {
                    return ["last", "dateTime", "tradeVolume"];
                }
                else {
                    return ["high", "open", "bid", "ask", "last", "low", "change", "changePercent", "dateTime", "volume", "tradeVolume"];
                }
            };

            var getSymbolSnapshot = function (symbol) {
                return symbol.pushType !== 'Everything';
            }

            var getMainSymbolFormat = function (symbolId) {
                var result = !symbolId.match("cc{(.*)}")? symbolId.substring(4) : symbolId;
                return result;
            }

            var ttCallback = function (msg) {
                var json = convert(msg);
                var symbolValues = $.grep(Symbols, function (s) {
                    return s.symbolId === json.symbolId;
                });
                for (var i = 0; i < symbolValues.length; i++) {
                    executeCallbacksForSymbol(symbolValues[i], json);
                };
            };

            var executeCallbacksForSymbol = function(symbolItem, json) {
                updateLastValue(symbolItem, json);
                for (var i = 0; i < symbolItem.callbacks.length; i++) {
                    symbolItem.callbacks[i]($.extend({}, symbolItem.lastValue));
                };
            };

            var convert = function (msg) {
                var updateDateTime = function () {
                    if (msg.data.dateTime) {
                        var dateTime = msg.data.dateTime;

                        var spaceArr = dateTime.split(" ");
                        var d = spaceArr[0];
                        var t = spaceArr[1];

                        var dateArr = d.split(".");
                        var day = dateArr[0];
                        var month = dateArr[1] - 1;
                        var year = dateArr[2];

                        var timeArr = t.split(":");
                        var hours = timeArr[0];
                        var minutes = timeArr[1];
                        var seconds = timeArr[2];

                        var date = new Date(year, month, day, hours, minutes, seconds);
                        result.dateTime = date;
                    }
                }

                var updateCandleData = function () {
                    var data = msg.data.bar ? msg.data.bar : msg.data;
                    if (data.volume) {
                        result.volume = data.volume;
                    }
                    if (data.close) {
                        result.close = data.close;
                    }
                    if (data.open) {
                        result.open = data.open;
                    }
                    if (data.low) {
                        result.low = data.low;
                    }
                    if (data.high) {
                        result.high = data.high;
                    }
                };

                var updateTickData = function () {
                    if (msg.data.last) {
                        result.last = msg.data.last;
                    }
                    if (msg.data.bid) {
                        result.bid = msg.data.bid;
                    }
                    if (msg.data.ask) {
                        result.ask = msg.data.ask;
                    }
                    if (msg.data.change) {
                        result.change = msg.data.change;
                    }
                    if (msg.data.changePercent) {
                        result.changePercent = msg.data.changePercent;
                    }
                    if (msg.data.tradeVolume) {
                        result.tradeVolume = msg.data.tradeVolume;
                    }
                };

                var result = {
                    symbolId: "tts-" + msg.data.symbolId
                };

                updateCandleData();
                updateTickData();
                updateDateTime();

                return result;
            };

            var updateLastValue = function (symbolItem, msgJson) {
                if (!symbolItem.lastValue) {
                    symbolItem.lastValue = {};
                }
                $.each(msgJson, function (key, value) {
                    symbolItem.lastValue[key] = value;
                });
            };

            return _this;
        };

        function createInstance() {
            var object = pushTT();
            object.init({});
            return object;
        }

        return {
            Instance: function () {
                if (!instance) {
                    instance = createInstance();
                }
                return instance;
            }
        };
    })();
}());