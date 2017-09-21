if (typeof (TT) == 'undefined') var TT = {};

var events = {};
var THIS = {};

TT.Push = function (startupOptions) {
    THIS = this;
    this._cometd = $.cometd;
    this.tokenCallback = startupOptions.tokenCallback;
    this.securityToken = startupOptions.token;

    this.subscribeStarted = false;
    this.subscribed = false;

    this.events = events;

    this.tempSymbolsList = [];
    this.tempNewsList = [];

    this.tempPushSymbolsList = [];
    this.tempPushNewsList = [];

    this.sameCallbackFunctionList = [];
    this.sameCallbackNewsFunctionList = [];

    this.currentSubscriptions = [];
    this.currentNewsSubscriptions = [];
    this.currentChannelsSubscriptions = [];

    this.merged = {};
    this.mergedNews = {};
    this.mergedChannels = {};

    this.channels = {};
    this.newsChannels = {};
    this.subscriptionChannels = {};

    this.subscriptionQueue = [];
    this.newsSubscriptionQueue = [];

    this.messages = [];

    this.symoblsUnderUnsubscription = [];

    //Different channels are resolved for continuous contracts and for other symbols
    this.getChannelForSymbol = function (symbolId) {
        symbolId = symbolId + ''; //symbolId may be integer, so it has to be converted to string
        var channel = '/teletrader/symbols/';
        if (symbolId.lastIndexOf('cc{') === 0) {
            channel = '/teletrader/cc/';
        }

        return channel;
    }

    this.defaultProperties = {
        'pushurl': 'https://push.ttweb.net/http_push/',
        'symbolfids': ['last', 'dateTime'],
        'newsfids': ['articleId', 'articleText', 'headline', 'dateTime', 'sourceName'],
        'symbolsnapshot': true,
        'pushtype': 'Everything',
        'timezone': 'Europe/Vienna',
        'loglevel': 'none',
        'maxnetworkdelay': 25000,
        'maxbackoff': 20000
    };

    this.properties = {};
};

TT.Push.prototype.start = function () {
    if (this.securityToken == '' || this.securityToken == undefined) {
        this.tokenCallback(this.tokenSuccessCallback);
    } else if (this.securityToken != '' || this.securityToken != undefined) {
        this.handshake(this.securityToken);
    } else {
        this.addMessage('You need to send security token');
    }
};

TT.Push.prototype.tokenSuccessCallback = function (token) {
    THIS.securityToken = token;
    THIS.handshake(THIS.securityToken);
};

TT.Push.prototype.newTokenSuccessCallback = function (token) {
    THIS.securityToken = token;
    var ext = {
        'ext': {
            'teletrader': {
                'SymbolFIDs': THIS.symbolfeeds,
                'NewsFIDs': THIS.newsfeeds,
                'AuthToken': token,
                'SymbolSnapshot': THIS.symbolsnapshot,
                'PushType': THIS.pushtype,
                'TimeZone': THIS.timezone,
                'LibVer': '1.0'
            }
        }

    };
    THIS._cometd.handshake(ext);
};

TT.Push.prototype.handshake = function (token) {
    if (!this._cometd) {
        this.addMessage("Cometd is not instantiated.");
        return;
    }

    this.pushurl = this.GetOption("pushurl") == undefined ? this.GetDefaultOption("pushurl") : this.GetOption("pushurl");
    this.symbolsnapshot = this.GetOption("symbolsnapshot") == undefined ? this.GetDefaultOption("symbolsnapshot") : this.GetOption("symbolsnapshot");
    this.pushtype = this.GetOption("pushtype") == undefined ? this.GetDefaultOption("pushtype") : this.GetOption("pushtype");
    this.timezone = this.GetOption("timezone") == undefined ? this.GetDefaultOption("timezone") : this.GetOption("timezone");
    this.loglevel = this.GetOption("loglevel") == undefined ? this.GetDefaultOption("loglevel") : this.GetOption("loglevel");
    this.maxnetworkdelay = this.GetOption("maxnetworkdelay") == undefined ? this.GetDefaultOption("maxnetworkdelay") : this.GetOption("maxnetworkdelay");
    this.maxbackoff = this.GetOption("maxbackoff") == undefined ? this.GetDefaultOption("maxbackoff") : this.GetOption("maxbackoff");
    this.symbolfeeds = this.getSymbolFIDs().sort().toString();
    this.newsfeeds = this.getNewsFIDs().sort().toString();

    var ext = {
        'ext': {
            'teletrader': {
                'SymbolFIDs': this.symbolfeeds,
                'NewsFIDs': this.newsfeeds,
                'AuthToken': token,
                'SymbolSnapshot': this.symbolsnapshot,
                'PushType': this.pushtype,
                'TimeZone': this.timezone,
                'LibVer': '1.0'
            }
        }

    };

    var initData = {
        url: this.pushurl,
        logLevel: this.loglevel,
        maxNetworkDelay: this.maxnetworkdelay,
        maxBackoff: this.maxbackoff
    };

    this._cometd.configure(initData);
    this._cometd.handshake(ext);

    this.addMessage("Cometd initialization procedure executed successfuly.");

    this._cometd.addListener('/meta/handshake', function (message) {
        //console.log("'/meta/handshake' message: " + JSON.stringify(message));

        THIS.addMessage(JSON.stringify(message) + ' statusType: handshake');

        THIS.subscribed = false;

        if (!message.successful) {
            if (message.error && message.error.indexOf("52") == 0) {

                THIS.currentSubscriptions = [];
                THIS.currentNewsSubscriptions = [];
                THIS.currentChannelsSubscriptions = [];

                THIS.addMessage(JSON.stringify(message) + ' statusType: handshake');

                THIS.tokenCallback(THIS.newTokenSuccessCallback);
            }
        }
        THIS.trigger('status', { message: message, statusType: 'handshake' });
    });

    this._cometd.addListener('/meta/connect', this, function (message) {
        //console.log("'/meta/connect' message: " + JSON.stringify(message));

        THIS.addMessage(JSON.stringify(message) + ' statusType: connect');

        if (!message.successful) {
            if (message.error && message.error.indexOf('1 |') == 0) {
                THIS.subscribed = false;
                THIS.currentSubscriptions = [];
                THIS.currentNewsSubscriptions = [];
                THIS.currentChannelsSubscriptions = [];
            }
        } else {
            if (!THIS.subscribed) {
                THIS.subscribed = true;
                THIS.subscribeSymbols();
                THIS.subscribeNewses();
                THIS.subscribeCustomChannels();
            }
        }
        THIS.trigger('status', { message: message, statusType: 'connect' });
    });

    this._cometd.addListener('/meta/subscribe', function (message) {
        //console.log("'/meta/subscribe' message: " + JSON.stringify(message));

        THIS.addMessage(JSON.stringify(message) + ' statusType: subscribe');

        if (message.successful) {
            var tmp = message.subscription[0].split("/");
            var symbolId = tmp[3];
        }
        THIS.trigger('status', { message: message, statusType: 'subscribe' });
    });

    this._cometd.addListener('/meta/unsubscribe', function (message) {
        THIS.addMessage(JSON.stringify(message) + ' statusType: unsubscribe');


        if (message != undefined) {
            if (message.subscription != undefined) {
                if (message.subscription[0] != undefined) {
                    var tmp = message.subscription[0].split("/");
                    var symbols = tmp[2];
                    var symbolId = tmp[3];

                    if (symbols == 'symbols') {
                        if (symbolId != undefined) {
                            //console.log("META UNSUBSCRIBE: " + JSON.stringify(THIS.symoblsUnderUnsubscription[symbolId]));

                            if (THIS.symoblsUnderUnsubscription[symbolId] != undefined) {
                                THIS.channels[symbolId] = THIS._cometd.subscribe(THIS.getChannelForSymbol(symbolId) + symbolId, THIS.symoblsUnderUnsubscription[symbolId].cback, {
                                    "ext": {
                                        "teletrader": THIS.symoblsUnderUnsubscription[symbolId].fFields
                                    }
                                });

                                delete THIS.symoblsUnderUnsubscription[symbolId];
                            }
                        }
                    }
                }
            }
        }

        THIS.trigger('status', { message: message, statusType: 'unsubscribe' });
    });

    this._cometd.addListener('/meta/disconnect', this, function (message) {
        //console.log("'/meta/disconnect' message: " + JSON.stringify(message));

        if (message.successful) {
            THIS.subscribed = false;
            THIS.channels = {};
            THIS.newsChannels = {};
            THIS.subscriptionChannels = {};
            THIS.subscriptionQueue = [];
            THIS.newsSubscriptionQueue = [];
        }
        THIS.addMessage(JSON.stringify(message) + ' statusType: disconnect');
        THIS.trigger('status', { message: message, statusType: 'disconnect' });
    });

    this._cometd.addListener('/service/disconnect', this, function (message) {
        //console.log("'/service/disconnect' message: " + JSON.stringify(message));

        THIS.subscribed = false;
        THIS.currentSubscriptions = [];
        THIS.currentNewsSubscriptions = [];
        THIS.currentChannelsSubscriptions = [];

        THIS.addMessage(JSON.stringify(message) + ' statusType: service/disconnect');
        THIS.trigger('status', { message: message, statusType: 'service/disconnect' });
    });

    this._cometd.addListener('/service/heartbeat', this, function (message) {
        THIS.addMessage(JSON.stringify(message) + ' statusType: heartbeat');
        THIS.trigger('status', { message: message, statusType: 'heartbeat' });
    });

    this._cometd.addListener('/service/padding', function (message) {
        THIS.addMessage(JSON.stringify(message) + ' statusType: padding');
        THIS.trigger('status', { message: message, statusType: 'padding' });
    });
};

TT.Push.prototype.SetOption = function (name, value) {
    this.properties[name.toLowerCase()] = value;
    this.addMessage('SetOption ' + name.toLowerCase() + ': ' + this.properties[name.toLowerCase()]);
};

TT.Push.prototype.SetOptions = function (c) {
    for (i in c) {
        if (typeof (i) == 'string') {
            this.SetOption(i, c[i]);
        }
    }
    return this;
};

TT.Push.prototype.GetOption = function (name) {
    return this.properties[name.toLowerCase()];
};

TT.Push.prototype.GetDefaultOption = function (name) {
    return this.defaultProperties[name.toLowerCase()];
};

TT.Push.prototype.diagnostic = function (str) {
    THIS.addMessage(JSON.stringify(str));
};

TT.Push.prototype.getComet = function () {
    return this._cometd;
};

TT.Push.prototype.disconnect = function () {
    this.currentSubscriptions = [];
    this.currentNewsSubscriptions = [];
    this.currentChannelsSubscriptions = [];
    return this._cometd.disconnect();
};

TT.Push.prototype.connect = function () {
    if (!this.subscribed) {
        this.subscribed = false;
        this.tokenCallback(this.newTokenSuccessCallback);
    }
};

TT.Push.prototype.subscribeToChannel = function (channel, callback) {
    if (!this.subscribeStarted) {
        this.start();
        this.subscribeStarted = true;
    }

    var mergedChannels = {};
    //this.mergedChannels = {};

    var props = [];

    for (var i = 0; i < this.currentChannelsSubscriptions.length; i++) {
        if (this.currentChannelsSubscriptions[i].channel == channel) {
            console.log("You already subscribe channel: " + channel);
            this.addMessage("You already subscribe channel:" + channel);
            return;
        }
    }

    for (i = 0; i < this.currentChannelsSubscriptions.length; i++) {
        if (this.currentChannelsSubscriptions[i].channel != channel) {
            props.push({ channel: this.currentChannelsSubscriptions[i].channel, callback: this.currentChannelsSubscriptions[i].callback });
        }
    }

    props.push({ channel: channel, callback: callback });

    mergedChannels[channel] = props;

    this.mergedChannels = this.deepExtend(this.mergedChannels, mergedChannels);

    if (this.subscribed) {
        this.subscribeMergedChannels(this.mergedChannels);
    }
};

TT.Push.prototype.subscribeMergedChannels = function (mergedChannels) {

    for (var key in mergedChannels) {
        for (var i = 0; i < mergedChannels[key].length; i++) {

            if (this.subscriptionChannels[mergedChannels[key][i].channel] == undefined) {
                this.subscriptionChannels[mergedChannels[key][i].channel] = this._cometd.subscribe(mergedChannels[key][i].channel, mergedChannels[key][i].callback);

                this.currentChannelsSubscriptions.push({ channel: mergedChannels[key][i].channel, callback: mergedChannels[key][i].callback });
            }
        }
    }
};

TT.Push.prototype.unSubscribeFromChannel = function (channel, callback) {
    for (var j = 0; j < this.currentChannelsSubscriptions.length; j++) {
        var subscribedObj = this.currentChannelsSubscriptions[j];

        if (channel == subscribedObj.channel && callback == subscribedObj.callback) {

            delete this.mergedChannels[channel];

            this._cometd.unsubscribe(this.subscriptionChannels[channel]);
            delete this.subscriptionChannels[channel];

            this.currentChannelsSubscriptions.splice(j, 1);
        }
    }
};

TT.Push.prototype.subscribeCustomChannels = function () {
    for (var key in this.mergedChannels) {
        for (var i = 0; i < this.mergedChannels[key].length; i++) {
            this.subscriptionChannels[this.mergedChannels[key][i].channel] = this._cometd.subscribe(this.mergedChannels[key][i].channel, this.mergedChannels[key][i].callback);

            this.currentChannelsSubscriptions.push({ channel: this.mergedChannels[key][i].channel, callback: this.mergedChannels[key][i].callback });
        }
    }
};

TT.Push.prototype.createGuid = function () {
    var s4 = function () {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    };

    return (s4() + s4() + "-" + s4() + "-" + s4() + "-" + s4() + "-" + s4() + s4() + s4());
};

/* SYMBOLS START */
TT.Push.prototype.subscribe = function (symbolsData) {
    if (!this.subscribeStarted) {
        this.start();
        this.subscribeStarted = true;
    }

    this.subscribeStart(symbolsData);
};

TT.Push.prototype.subscribeStart = function (symbolsData) {
    //console.log(" --- subscribeStart --- ");
    if (typeof (symbolsData) == 'object') {
        for (var key in symbolsData) {
            var obj = symbolsData[key];

            for (var prop in obj) {
                if (obj.hasOwnProperty(prop)) {
                    var property = obj[prop];

                    if (prop == 'symbolID') {

                        var tmpObj = {};
                        tmpObj = this.deepExtend(tmpObj, obj);

                        for (var i = 0; i < property.length; i++) {
                            if (this.isSymbolCallbackInCurrentSubscriptionsArray(this.currentSubscriptions, property[i], tmpObj['callback'])) {
                                console.log("You already subscribe function: " + this.parseFunctionName(tmpObj['callback']));
                                this.addMessage("You already subscribe function:" + this.parseFunctionName(tmpObj['callback']));
                                return;
                            }
                        }

                        this.tempSymbolsList[tmpObj['callback']] = {};

                        var symbols = [];
                        for (i = 0; i < property.length; i++) {
                            if (obj['filterFields'] == undefined) {
                                obj['filterFields'] = {};
                                obj['filterFields'].FIDs = this.getSymbolFIDs();
                            }
                            if (obj['filterFields'].FIDs == undefined) {
                                obj['filterFields'].FIDs = this.getSymbolFIDs();
                            }
                            obj['filterFields'].FIDs = obj['filterFields'].FIDs.sort();

                            symbols.push(property[i]);
                        }

                        this.tempSymbolsList[tmpObj['callback']].symbolIDs = symbols;
                        this.tempSymbolsList[tmpObj['callback']].filterFields = obj['filterFields'];

                        this.tempSymbolsList[tmpObj['callback']].callback = tmpObj['callback'];
                    }
                }
            }
        }
    }

    for (key in this.tempSymbolsList) {
        if (!this.alreayInTheArrayList(this.tempPushSymbolsList, this.tempSymbolsList[key], "symbols") && JSON.stringify(this.tempSymbolsList[key]) != undefined) {
            this.tempPushSymbolsList.push(this.tempSymbolsList[key]);
        }
    }

    for (key in this.tempSymbolsList) {
        if (this.tempSymbolsList.hasOwnProperty(key)) {
            delete this.tempSymbolsList[key];
        }
    }

    this.tempSymbolsList = [];
    var sameCallbackList = [];
    for (i = 0; i < this.tempPushSymbolsList.length; i++) {
        var callabckArray = [];
        for (var j = i + 1; j < this.tempPushSymbolsList.length; j++) {
            if (this.tempPushSymbolsList[i].callback == this.tempPushSymbolsList[j].callback) {
                if (!this.alreayInTheList(sameCallbackList, this.tempPushSymbolsList[i], "symbols")) {
                    callabckArray.push(this.tempPushSymbolsList[i]);
                }
                if (!this.alreayInTheList(sameCallbackList, this.tempPushSymbolsList[j], "symbols")) {
                    callabckArray.push(this.tempPushSymbolsList[j]);
                }
            }
        }

        if (callabckArray.length > 0) {
            sameCallbackList.push(callabckArray);
        }

        if (callabckArray.length == 0) {
            if (!this.alreayInTheList(sameCallbackList, this.tempPushSymbolsList[i], "symbols")) {
                callabckArray.push(this.tempPushSymbolsList[i]);
                sameCallbackList.push(callabckArray);
            }
        }
    }

    //Remove duplicates
    for (i = 0; i < sameCallbackList.length; i++) {
        var sameList = sameCallbackList[i];
        for (j = 0; j < sameList.length; j++) {
            for (var k = j + 1; k < sameList.length; k++) {
                if (this.assertObjectEqual(sameList[j], sameList[k], "symbols")) {
                    sameCallbackList[i].splice(k, 1);
                }
            }
        }
    }

    this.sameCallbackFunctionList = sameCallbackList;

    this.prepareForMerge('subscribe');
};

TT.Push.prototype.prepareForMerge = function (type, sym, functionCallback, filterFields, canDeleteFids, pushType) {
    var symbols = [];

    for (var i = 0; i < this.sameCallbackFunctionList.length; i++) {

        var sameCfList = this.sameCallbackFunctionList[i];
        for (var j = 0; j < sameCfList.length; j++) {
            var symbolIDs = sameCfList[j].symbolIDs;
            if (symbolIDs != undefined) {
                for (var k = 0; k < symbolIDs.length; k++) {
                    symbols.push({ symbolID: symbolIDs[k], callback: sameCfList[j]['callback'], filterFields: sameCfList[j]['filterFields'] });
                }
            }
        }
    }
    var sameSymbols = [];

    for (i = 0; i < symbols.length; i++) {
        for (j = i + 1; j < symbols.length; j++) {
            if (symbols[i].symbolID == symbols[j].symbolID) {
                if (!this.alreayInTheArrayList(sameSymbols, symbols[i], "symbols")) {
                    sameSymbols.push(symbols[i]);
                }
                if (!this.alreayInTheArrayList(sameSymbols, symbols[j], "symbols")) {
                    sameSymbols.push(symbols[j]);
                }
            }
        }
    }

    var preMerge = {};

    for (i = 0; i < sameSymbols.length; i++) {
        if (!preMerge[sameSymbols[i].symbolID]) {
            var propArr = [];
            for (j = 0; j < sameSymbols.length; j++) {
                if (sameSymbols[i].symbolID == sameSymbols[j].symbolID) {
                    propArr.push({ callback: sameSymbols[j].callback, filterFields: sameSymbols[j].filterFields });
                }
            }
            preMerge[sameSymbols[i].symbolID] = propArr;
        }
    }

    for (i = 0; i < symbols.length; i++) {
        if (!preMerge[symbols[i].symbolID]) {
            propArr = [];
            propArr.push({ callback: symbols[i].callback, filterFields: symbols[i].filterFields });
            preMerge[symbols[i].symbolID] = propArr;
        }
    }

    this.merge(preMerge, type, sym, functionCallback, filterFields, canDeleteFids, pushType);
};

TT.Push.prototype.merge = function (preMerge, type, sym, functionCallback, filterFields, canDeleteFids, pushType) {
    var merged = {};
    this.merged = {};

    for (var key in preMerge) {

        var props = [];
        var preMergeFields = [];
        var preMergeCallbacks = [];

        for (var i = 0; i < preMerge[key].length; i++) {
            preMergeFields.push(preMerge[key][i].filterFields);
            preMergeCallbacks.push(preMerge[key][i].callback);
        }

        var mergedFilterFields = this.mergeFilterFields(preMergeFields, type, sym, functionCallback, filterFields, pushType);
        var mergedCallbacks = this.mergeCallbacks(preMergeCallbacks);

        props.push({ callback: mergedCallbacks, filterFields: mergedFilterFields });

        merged[key] = props;
    }

    this.merged = this.deepExtend(this.merged, merged);

    if (this.subscribed) {
        if (type == "subscribe") {
            this.subscribeMergedSymbols(this.merged);
        } else {
            this.unsubscribeMergedSymbols(this.merged, type, sym, functionCallback, filterFields, canDeleteFids, pushType);
        }
    }
};

TT.Push.prototype.subscribeMergedSymbols = function (merged) {
    for (var key in merged) {
        for (var i = 0; i < merged[key].length; i++) {
            if (!this.isSymbolInCurrentSubscriptionsArray(this.currentSubscriptions, key, merged)) {

                var fidsExt = merged[key][i].filterFields.FIDs.toString();
                var snashotExt = merged[key][i].filterFields.SymbolSnapshot;
                var pushTypeExt = merged[key][i].filterFields.PushType;

                var filterFields = {};
                filterFields['FIDs'] = fidsExt;

                if (snashotExt != undefined) {
                    filterFields['SymbolSnapshot'] = snashotExt;
                } else {
                    filterFields['SymbolSnapshot'] = this.symbolsnapshot;
                }

                if (pushTypeExt != undefined) {
                    filterFields['PushType'] = pushTypeExt;
                } else {
                    filterFields['PushType'] = this.pushtype;
                }

                this.addToBatch('subscribe', key, this.subscribeCallback, filterFields);

                this.currentSubscriptions.push({ symbolID: key, filterFields: merged[key][i].filterFields, callback: merged[key][i].callback });
            } else {

                for (var j = 0; j < this.currentSubscriptions.length; j++) {
                    if (this.currentSubscriptions[j].symbolID == key) {

                        if (!this.areFilterFieldsAndCallBackTheSame(this.currentSubscriptions, key, merged[key][i])) {

                            if (!this.areFilterFieldsTheSame(this.currentSubscriptions, key, merged[key][i])) {

                                if (!this.areCallBackTheSame(this.currentSubscriptions, key, merged[key][i])) {

                                    var msg = this.currentSubscriptions[j].msg;

                                    this.addToBatch('unsubscribe', key, this.currentSubscriptions[j].callback, this.currentSubscriptions[j].filterFields);

                                    this.currentSubscriptions.splice(j, 1);

                                    fidsExt = merged[key][i].filterFields.FIDs.toString();
                                    snashotExt = merged[key][i].filterFields.SymbolSnapshot;
                                    pushTypeExt = merged[key][i].filterFields.PushType;

                                    filterFields = {};
                                    filterFields['FIDs'] = fidsExt;

                                    if (snashotExt != undefined) {
                                        filterFields['SymbolSnapshot'] = snashotExt;
                                    } else {
                                        filterFields['SymbolSnapshot'] = this.symbolsnapshot;
                                    }

                                    if (pushTypeExt != undefined) {
                                        filterFields['PushType'] = pushTypeExt;
                                    } else {
                                        filterFields['PushType'] = this.pushtype;
                                    }

                                    this.addToBatch('subscribe', key, this.subscribeCallback, filterFields);

                                    this.currentSubscriptions.push({ symbolID: key, filterFields: merged[key][i].filterFields, callback: merged[key][i].callback, msg: msg });
                                }
                            } else {

                                if (!this.areCallBackTheSame(this.currentSubscriptions, key, merged[key][i])) {
                                    this.currentSubscriptions[j].callback = merged[key][i].callback;
                                    for (var k = 0; k < this.currentSubscriptions[j]['callback'].length; k++) {
                                        if (THIS.currentSubscriptions[j]['msg'] != undefined) {
                                            this.currentSubscriptions[j]['callback'][k](THIS.currentSubscriptions[j]['msg']);
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
};

TT.Push.prototype.unsubscribeMergedSymbols = function (merged, type, sym, functionCallback, filterFields, canDeleteFids, pushType) {
    //console.log(" --- unsubscribeMergedSymbols --- ");

    for (var i = 0; i < sym.length; i++) {
        var unsubscribeLastSymbol = false;
        var lastSymbolIndex;
        for (var j = 0; j < this.currentSubscriptions.length; j++) {

            var subscribedObj = this.currentSubscriptions[j];
            if (sym[i] == subscribedObj.symbolID) {

                var callbacksArray = subscribedObj.callback;

                if (callbacksArray.length > 1) {

                    var unsubscribeSymbol = false;
                    var feedsArray = subscribedObj.filterFields.FIDs;

                    for (var m = 0; m < canDeleteFids.length; m++) {
                        for (var k = 0; k < feedsArray.length; k++) {
                            if (feedsArray[k] == canDeleteFids[m]) {
                                feedsArray.splice(k, 1);
                                unsubscribeSymbol = true;
                            }
                        }
                    }

                    var pType = subscribedObj.filterFields.PushType;

                    if (merged[subscribedObj.symbolID] != undefined) {
                        for (k = 0; k < merged[subscribedObj.symbolID].length; k++) {
                            pType = merged[subscribedObj.symbolID][k].filterFields.PushType;
                        }

                        if (pType != pushType) {
                            unsubscribeSymbol = true;
                        }
                    }

                    for (k = 0; k < callbacksArray.length; k++) {
                        if (callbacksArray[k] == functionCallback) {
                            callbacksArray.splice(k, 1);
                        }
                    }

                    //console.log("unsubscribeSymbol: " + unsubscribeSymbol);

                    if (unsubscribeSymbol) {
                        var newSubscription = this.currentSubscriptions[j];

                        var msg = this.currentSubscriptions[j].msg;

                        this.addToBatch('unsubscribe', newSubscription.symbolID, newSubscription.callback, newSubscription.filterFields);

                        this.currentSubscriptions.splice(j, 1);

                        var fidsExt = newSubscription.filterFields.FIDs.toString();
                        var snashotExt = newSubscription.filterFields.SymbolSnapshot;

                        /*if (pushType != '') {
                        newSubscription.filterFields.PushType = pushType;
                        }*/

                        if (merged[newSubscription.symbolID] != undefined) {
                            for (k = 0; k < merged[newSubscription.symbolID].length; k++) {
                                pushType = merged[newSubscription.symbolID][k].filterFields.PushType;
                            }
                        }
                        newSubscription.filterFields.PushType = pushType;

                        var pushTypeExt = newSubscription.filterFields.PushType;

                        filterFields = {};
                        filterFields['FIDs'] = fidsExt;

                        if (fidsExt == "") {
                            for (k = 0; k < merged[newSubscription.symbolID].length; k++) {
                                fidsExt = merged[newSubscription.symbolID][k].filterFields.FIDs.toString();
                            }
                            filterFields['FIDs'] = fidsExt;
                        }

                        if (snashotExt != undefined) {
                            filterFields['SymbolSnapshot'] = snashotExt;
                        } else {
                            filterFields['SymbolSnapshot'] = this.symbolsnapshot;
                        }

                        if (pushTypeExt != undefined) {
                            filterFields['PushType'] = pushTypeExt;
                        } else {
                            filterFields['PushType'] = this.pushtype;
                        }

                        this.addToBatch('subscribe', newSubscription.symbolID, this.subscribeCallback, filterFields);

                        this.currentSubscriptions.push({ symbolID: newSubscription.symbolID, filterFields: newSubscription.filterFields, callback: newSubscription.callback, msg: msg });
                    }
                } else {
                    for (k = 0; k < this.currentSubscriptions[j].callback.length; k++) {
                        if (this.currentSubscriptions[j].callback[k] == functionCallback) {
                            unsubscribeLastSymbol = true;
                            lastSymbolIndex = j;
                        }

                    }
                }
                if (unsubscribeLastSymbol) {
                    if (lastSymbolIndex != undefined) {
                        this.addToBatch('unsubscribe', this.currentSubscriptions[lastSymbolIndex].symbolID, this.currentSubscriptions[lastSymbolIndex].callback, this.currentSubscriptions[lastSymbolIndex].filterFields);

                        this.currentSubscriptions.splice(lastSymbolIndex, 1);
                    }
                }
            }
        }
    }
};

TT.Push.prototype.subscribeSymbols = function () {
    //console.log(" --- subscribeSymbols --- this.merged: " + JSON.stringify(this.merged));

    for (var key in this.merged) {
        for (var i = 0; i < this.merged[key].length; i++) {

            if (!this.isSymbolInCurrentSubscriptionsArray(this.currentSubscriptions, key, this.merged)) {

                var fidsExt = this.merged[key][i].filterFields.FIDs.toString();
                var snashotExt = this.merged[key][i].filterFields.SymbolSnapshot;
                var pushTypeExt = this.merged[key][i].filterFields.PushType;

                var filterFields = {};
                filterFields['FIDs'] = fidsExt;

                if (snashotExt != undefined) {
                    filterFields['SymbolSnapshot'] = snashotExt;
                } else {
                    filterFields['SymbolSnapshot'] = this.symbolsnapshot;
                }

                if (pushTypeExt != undefined) {
                    filterFields['PushType'] = pushTypeExt;
                } else {
                    filterFields['PushType'] = this.pushtype;
                }

                this.addToBatch('subscribe', key, this.subscribeCallback, filterFields);

                this.currentSubscriptions.push({ symbolID: key, filterFields: this.merged[key][i].filterFields, callback: this.merged[key][i].callback });
            }
        }
    }
    this.endBatch('');
};

TT.Push.prototype.unsubscribe = function (symbolsData) {
    var symbols = [];
    var functionCallback = '';
    var filterFields = {};

    var cantDeleteFids = [];
    var canDeleteFids = [];

    var pushTypes = [];
    var pushType = '';

    if (typeof (symbolsData) == 'object') {
        for (var key in symbolsData) {
            var obj = symbolsData[key];
            for (var prop in obj) {
                if (obj.hasOwnProperty(prop)) {
                    var property = obj[prop];
                    if (prop == 'symbolID') {

                        var tmpObj = {};
                        tmpObj = this.deepExtend(tmpObj, obj);

                        for (var i = 0; i < property.length; i++) {
                            symbols.push(property[i]);
                            functionCallback = tmpObj['callback'];

                            for (var j = 0; j < this.sameCallbackFunctionList.length; j++) {
                                var sameCfList = this.sameCallbackFunctionList[j];
                                for (var k = 0; k < sameCfList.length; k++) {
                                    var symbolsArr = sameCfList[k].symbolIDs;
                                    if (this.isInStrArray(symbolsArr, property[i]) && sameCfList[k]['callback'] == tmpObj['callback']) {
                                        if (symbolsArr.length > 1) {
                                            for (var l = 0; l < symbolsArr.length; l++) {
                                                if (symbolsArr[l] == property[i]) {
                                                    symbolsArr.splice(l, 1);
                                                }
                                            }
                                        } else {
                                            sameCfList.splice(k, 1);
                                        }
                                    }

                                }
                            }

                            filterFields = tmpObj['filterFields'];

                            if (filterFields == undefined) {
                                for (var m = 0; m < this.tempPushSymbolsList.length; m++) {
                                    if (this.tempPushSymbolsList[m].symbolIDs != undefined) {
                                        for (var n = 0; n < this.tempPushSymbolsList[m].symbolIDs.length; n++) {
                                            if (this.tempPushSymbolsList[m].callback == functionCallback) {
                                                filterFields = this.tempPushSymbolsList[m].filterFields;
                                            }
                                        }
                                    }
                                }
                            }

                            if (filterFields == undefined) return;

                            filterFields.FIDs.sort();

                            for (j = 0; j < this.tempPushSymbolsList.length; j++) {
                                var tempPushObj = this.tempPushSymbolsList[j];
                                if (tempPushObj.filterFields != undefined) {
                                    if (tempPushObj.filterFields.FIDs != undefined) {
                                        tempPushObj.filterFields.FIDs.sort();
                                    }
                                }
                            }

                            for (m = 0; m < this.tempPushSymbolsList.length; m++) {
                                if (this.tempPushSymbolsList[m].symbolIDs != undefined) {
                                    for (n = 0; n < this.tempPushSymbolsList[m].symbolIDs.length; n++) {
                                        //if (property[i] == this.tempPushSymbolsList[m].symbolIDs[n] && !this.compare(filterFields.FIDs.sort(), this.tempPushSymbolsList[m].filterFields.FIDs.sort())) {
                                        if (property[i] == this.tempPushSymbolsList[m].symbolIDs[n] && this.tempPushSymbolsList[m].callback != functionCallback) {
                                            var tempFiDs = this.tempPushSymbolsList[m].filterFields.FIDs.sort();

                                            for (k = 0; k < tempFiDs.length; k++) {
                                                if (!this.isInStrArray(cantDeleteFids, tempFiDs[k])) {
                                                    cantDeleteFids.push(tempFiDs[k]);
                                                }
                                            }


                                        }

                                        if (property[i] == this.tempPushSymbolsList[m].symbolIDs[n]) {
                                            pushTypes.push(this.tempPushSymbolsList[m].filterFields.PushType);
                                        }

                                    }
                                }
                            }

                            cantDeleteFids.sort();
                            canDeleteFids = this.arrDiff(filterFields.FIDs.sort(), cantDeleteFids.sort());

                            for (k = 0; k < cantDeleteFids.length; k++) {
                                for (n = 0; n < canDeleteFids.length; n++) {
                                    if (cantDeleteFids[k] == canDeleteFids[n]) {
                                        canDeleteFids.splice(n, 1);
                                    }
                                }
                            }

                            if (pushTypes.length > 0) {
                                pushType = pushTypes[pushTypes.length - 1];
                            }

                            var index;
                            for (m = 0; m < this.tempPushSymbolsList.length; m++) {
                                if (this.tempPushSymbolsList[m].symbolIDs != undefined) {
                                    for (n = 0; n < this.tempPushSymbolsList[m].symbolIDs.length; n++) {
                                        if (property[i] == this.tempPushSymbolsList[m].symbolIDs[n] && this.tempPushSymbolsList[m].callback == functionCallback && this.assertObjectEqual(filterFields, this.tempPushSymbolsList[m].filterFields, "symbols")) {
                                            index = m;
                                        }
                                    }

                                    if (index != undefined) {
                                        this.tempPushSymbolsList.splice(index, 1);
                                        index = undefined;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    //console.log("unsubscribe symbols: " + symbols + " --- filterFields: " + JSON.stringify(filterFields) + " --- canDeleteFids: " + canDeleteFids + " --- pushType: " + pushType);

    this.prepareForMerge('unsubscribe', symbols, functionCallback, filterFields, canDeleteFids, pushType);
};

TT.Push.prototype.startBatch = function () {
    this.subscriptionQueue = [];
};

TT.Push.prototype.addToBatch = function (type, id, cback, fFields) {
    this.subscriptionQueue.push({
        'type': type,
        'cback': cback,
        'fFields': fFields,
        'id': id
    });
};

TT.Push.prototype.endBatch = function (from) {
    //console.log(" --- endBatch --- ");

    var unsubsObj = {};
    var subsObj = {};
    var usubLen = 0;
    var subLen = 0;

    //console.log(" --- endBatch --- : " + this.subscriptionQueue.length);

    for (var i = 0; i < this.subscriptionQueue.length; i++) {
        if (this.subscriptionQueue[i].type == 'unsubscribe') {
            unsubsObj[this.subscriptionQueue[i].id] = this.subscriptionQueue[i];
        }
        if (this.subscriptionQueue[i].type == 'subscribe') {
            subsObj[this.subscriptionQueue[i].id] = this.subscriptionQueue[i];
        }
    }

    for (var key in unsubsObj) {
        usubLen++;
    }

    for (key in subsObj) {
        if (unsubsObj[key] != undefined) {
            if (unsubsObj[key].id == subsObj[key].id) {

                var fieldsObj = {};
                fieldsObj = this.deepExtend(fieldsObj, unsubsObj[key].fFields);
                fieldsObj.FIDs = fieldsObj.FIDs.toString();
                if (this.assertObjectEqual(fieldsObj, subsObj[key].fFields, "symbols")) {
                    var inSubscription = false;
                    for (var j = 0; j < this.currentSubscriptions.length; j++) {
                        var currentObj = this.currentSubscriptions[j];
                        if (currentObj['symbolID'] == subsObj[key].id) {
                            inSubscription = true;
                        }
                    }

                    if (!inSubscription) {
                        delete subsObj[key];
                    }
                }
            }
        }
    }

    for (key in subsObj) {
        subLen++;
    }

    if (usubLen > 0) {
        if (this._cometd.getTransport() != 'callback-polling') {
            this._cometd.startBatch();
        }
    }

    for (key in unsubsObj) {
        var unobj = unsubsObj[key];
        //console.log(" --- endBatch --- unobj: " + JSON.stringify(unobj));
        if (this.channels[unobj.id] != undefined) {
            this._cometd.unsubscribe(this.channels[unobj.id]);
            delete this.channels[unobj.id];
        }
    }

    if (usubLen > 0) {
        if (this._cometd.getTransport() != 'callback-polling') {
            this._cometd.endBatch();
        }
    }

    if (subLen > 0) {
        if (this._cometd.getTransport() != 'callback-polling') {
            this._cometd.startBatch();
        }
    }

    for (key in subsObj) {
        var suobj = subsObj[key];
        //console.log(" --- endBatch --- unsubsObj[key]: " + JSON.stringify(unsubsObj[key]));

        if (unsubsObj[key] != undefined && this.channels[suobj.id] != undefined) {
            this.symoblsUnderUnsubscription[suobj.id] = suobj;
        } else {
            this.channels[suobj.id] = this._cometd.subscribe(THIS.getChannelForSymbol(suobj.id) + suobj.id, suobj.cback, {
                "ext": {
                    "teletrader": suobj.fFields
                }
            });
        }

        /*this.channels[suobj.id] = this._cometd.subscribe(THIS.getChannelForSymbol(suobj.id) + suobj.id, suobj.cback, {
            "ext": {
                "teletrader": suobj.fFields
            }
        });*/
    }

    if (subLen > 0) {
        if (this._cometd.getTransport() != 'callback-polling') {
            this._cometd.endBatch();
        }
    }

    this.subscriptionQueue = [];
};

TT.Push.prototype.mergeFilterFields = function (preMergeFields, type, sym, functionCallback, filterFields, pushType) {
    //console.log(" --- mergeFilterFields --- ");

    var feeds = {};
    var pushs = {};
    var snapshots = {};

    var obj = {};

    for (var i = 0; i < preMergeFields.length; i++) {
        var feedsArray = preMergeFields[i].FIDs;
        for (var j = 0; j < feedsArray.length; j++) {
            if (!feeds[feedsArray[j]]) {
                feeds[feedsArray[j]] = feedsArray[j];
            }
        }

        if (preMergeFields[i].PushType != undefined) {
            if (!pushs[preMergeFields[i].PushType]) {
                pushs[preMergeFields[i].PushType] = preMergeFields[i].PushType;
            }
        }

        if (preMergeFields[i].SymbolSnapshot != undefined) {
            if (!snapshots[preMergeFields[i].SymbolSnapshot]) {
                snapshots[preMergeFields[i].SymbolSnapshot] = preMergeFields[i].SymbolSnapshot;
            }
        }
    }

    var mergedFeeds = [];

    for (var key in feeds) {
        mergedFeeds.push(key);
    }

    obj.FIDs = mergedFeeds;

    var mergedPushTypes = [];

    for (var pushkey in pushs) {
        mergedPushTypes.push(pushkey);
    }

    /*if (mergedPushTypes.length > 0) {
        var thereIsPushTypeEverything = 'SnapshotBar';
        for (var k = 0; k < mergedPushTypes.length; k++) {

            console.log("mergedPushTypes[k]: " + mergedPushTypes[k]);

            if (mergedPushTypes[k] == 'Everything') {
                thereIsPushTypeEverything = 'Everything';
            }
        }
        obj.PushType = thereIsPushTypeEverything;
    }*/

    if (mergedPushTypes.length > 0) {
        var pType = 'Snapshot';

        for (var k = 0; k < mergedPushTypes.length; k++) {
            if (mergedPushTypes[k] == 'Everything') {
                pType = 'Everything';
            }
        }

        if (pType != 'Everything') {
            for (k = 0; k < mergedPushTypes.length; k++) {
                if (mergedPushTypes[k] == 'SnapshotBar') {
                    pType = 'SnapshotBar';
                }
            }
        }

        obj.PushType = pType;
    }

    /*if (mergedPushTypes.length > 0) {
    obj.PushType = mergedPushTypes[mergedPushTypes.length - 1];
    }*/

    var mergedSymbolSnapshots = [];

    for (key in snapshots) {
        mergedSymbolSnapshots.push(key);
    }

    if (mergedSymbolSnapshots.length > 0) {
        var thereIsSnapshots = 'false';
        for (k = 0; k < mergedSymbolSnapshots.length; k++) {
            if (mergedSymbolSnapshots[k] == 'true') {
                thereIsSnapshots = 'true';
            }
        }
        obj.SymbolSnapshot = thereIsSnapshots;
    }

    /*if (mergedSymbolSnapshots.length > 0) {
    obj.SymbolSnapshot = mergedSymbolSnapshots[mergedSymbolSnapshots.length - 1];
    }*/

    //console.log("obj: " + JSON.stringify(obj));

    return obj;
};

TT.Push.prototype.mergeCallbacks = function (preMergeCallbacks) {
    var mergedCallbacks = [];
    for (var i = 0; i < preMergeCallbacks.length; i++) {
        mergedCallbacks.push(preMergeCallbacks[i]);
    }

    return mergedCallbacks;
};

/* SYMBOLS END */

/* NEWS START */
TT.Push.prototype.subscribeNews = function (newsData) {
    if (!this.subscribeStarted) {
        this.start();
        this.subscribeStarted = true;
    }

    if (typeof (newsData) == 'object') {
        for (var key in newsData) {
            var obj = newsData[key];
            for (var prop in obj) {
                if (obj.hasOwnProperty(prop)) {
                    var property = obj[prop];

                    if (prop == 'callback') {

                        var guid = this.createGuid();

                        var tmpObj = {};
                        tmpObj = this.deepExtend(tmpObj, obj);

                        if (this.isNewsCallbackInCurrentSubscriptionsArray(this.currentNewsSubscriptions, tmpObj['callback'])) {
                            console.log("You already subscribe function: " + this.parseFunctionName(tmpObj['callback']));
                            this.addMessage("You already subscribe function:" + this.parseFunctionName(tmpObj['callback']));
                            return;
                        }

                        this.tempNewsList[tmpObj['callback']] = {};

                        if (obj['filterFields'] == undefined) {
                            obj['filterFields'] = {};
                            obj['filterFields'].NewsFIDs = this.getNewsFIDs();
                        }
                        if (obj['filterFields'].NewsFIDs == undefined) {
                            obj['filterFields'].NewsFIDs = this.getNewsFIDs();
                        }
                        obj['filterFields'].NewsFIDs.sort();

                        this.tempNewsList[tmpObj['callback']].guID = guid;
                        this.tempNewsList[tmpObj['callback']].filterFields = obj['filterFields'];
                        this.tempNewsList[tmpObj['callback']].callback = tmpObj['callback'];
                    }
                }
            }
        }
    }

    for (key in this.tempNewsList) {
        if (!this.alreayInTheArrayList(this.tempPushNewsList, this.tempNewsList[key], "news") && JSON.stringify(this.tempNewsList[key]) != undefined) {
            this.tempPushNewsList.push(this.tempNewsList[key]);
        }
    }

    for (key in this.tempNewsList) {
        if (this.tempNewsList.hasOwnProperty(key)) {
            delete this.tempNewsList[key];
        }
    }

    this.tempNewsList = [];
    var sameCallbackList = [];
    for (var i = 0; i < this.tempPushNewsList.length; i++) {

        var callabckArray = [];
        for (var j = i + 1; j < this.tempPushNewsList.length; j++) {
            if (this.tempPushNewsList[i].callback == this.tempPushNewsList[j].callback) {
                if (!this.alreayInTheList(sameCallbackList, this.tempPushNewsList[i], "news")) {
                    callabckArray.push(this.tempPushNewsList[i]);
                }
                if (!this.alreayInTheList(sameCallbackList, this.tempPushNewsList[j], "news")) {
                    callabckArray.push(this.tempPushNewsList[j]);
                }
            }
        }

        if (callabckArray.length > 0) {
            sameCallbackList.push(callabckArray);
        }

        if (callabckArray.length == 0) {
            if (!this.alreayInTheList(sameCallbackList, this.tempPushNewsList[i], "news")) {
                callabckArray.push(this.tempPushNewsList[i]);
                sameCallbackList.push(callabckArray);
            }
        }
    }

    //Remove duplicates
    for (i = 0; i < sameCallbackList.length; i++) {
        var sameList = sameCallbackList[i];
        for (j = 0; j < sameList.length; j++) {
            for (var k = j + 1; k < sameList.length; k++) {
                if (this.assertObjectEqual(sameList[j], sameList[k], "news")) {
                    sameCallbackList[i].splice(k, 1);
                }
            }
        }
    }

    this.sameCallbackNewsFunctionList = sameCallbackList;

    this.prepareNewsForMerge('subscribe');
};

TT.Push.prototype.subscribeMergedNews = function (mergedNews) {
    for (var key in mergedNews) {
        for (var i = 0; i < mergedNews[key].length; i++) {
            if (!this.isNewsInCurrentSubscriptionsArray(this.currentNewsSubscriptions, key, mergedNews)) {
                var fidsExt = mergedNews[key][i].filterFields.NewsFIDs.toString();

                var branchesExt = '';
                if (mergedNews[key][i].filterFields.Branches != undefined) {
                    branchesExt = mergedNews[key][i].filterFields.Branches.toString();
                }

                var categoriesExt = '';
                if (mergedNews[key][i].filterFields.Categories != undefined) {
                    categoriesExt = mergedNews[key][i].filterFields.Categories.toString();
                }

                var languagesExt = '';
                if (mergedNews[key][i].filterFields.Languages != undefined) {
                    languagesExt = mergedNews[key][i].filterFields.Languages.toString();
                }

                var packagesExt = '';
                if (mergedNews[key][i].filterFields.Packages != undefined) {
                    packagesExt = mergedNews[key][i].filterFields.Packages.toString();
                }

                var segmentsExt = '';
                if (mergedNews[key][i].filterFields.Segments != undefined) {
                    segmentsExt = mergedNews[key][i].filterFields.Segments.toString();
                }

                var sourcesExt = '';
                if (mergedNews[key][i].filterFields.Sources != undefined) {
                    sourcesExt = mergedNews[key][i].filterFields.Sources.toString();
                }

                var isinsExt = '';
                if (mergedNews[key][i].filterFields.Isins != undefined) {
                    isinsExt = mergedNews[key][i].filterFields.Isins.toString();
                }

                var keywordsExt = '';
                if (mergedNews[key][i].filterFields.Keywords != undefined) {
                    keywordsExt = mergedNews[key][i].filterFields.Keywords.toString();
                }

                var countriesExt = '';
                if (mergedNews[key][i].filterFields.Countries != undefined) {
                    countriesExt = mergedNews[key][i].filterFields.Countries.toString();
                }

                var regionsExt = '';
                if (mergedNews[key][i].filterFields.Regions != undefined) {
                    regionsExt = mergedNews[key][i].filterFields.Regions.toString();
                }

                var filterFields = {};
                filterFields['NewsFIDs'] = fidsExt;

                if (branchesExt != '') {
                    filterFields['Branches'] = branchesExt;
                }

                if (categoriesExt != '') {
                    filterFields['Categories'] = categoriesExt;
                }

                if (languagesExt != '') {
                    filterFields['Languages'] = languagesExt;
                }

                if (packagesExt != '') {
                    filterFields['Packages'] = packagesExt;
                }

                if (segmentsExt != '') {
                    filterFields['Segments'] = segmentsExt;
                }

                if (sourcesExt != '') {
                    filterFields['Sources'] = sourcesExt;
                }

                if (isinsExt != '') {
                    filterFields['Isins'] = isinsExt;
                }

                if (keywordsExt != '') {
                    filterFields['Keywords'] = keywordsExt;
                }

                if (countriesExt != '') {
                    filterFields['Countries'] = countriesExt;
                }

                if (regionsExt != '') {
                    filterFields['Regions'] = regionsExt;
                }

                this.addToNewsBatch('subscribe', key, this.subscribeNewsCallback, filterFields);

                this.currentNewsSubscriptions.push({ guID: key, filterFields: mergedNews[key][i].filterFields, callback: mergedNews[key][i].callback });
            } else {
                for (var j = 0; j < this.currentNewsSubscriptions.length; j++) {
                    if (this.currentNewsSubscriptions[j].guID == key) {

                        if (!this.areNewsFilterFieldsAndCallBackTheSame(this.currentNewsSubscriptions, key, mergedNews[key][i])) {

                            if (!this.areNewsFilterFieldsTheSame(this.currentNewsSubscriptions, key, mergedNews[key][i])) {
                                if (!this.areNewsCallBackTheSame(this.currentNewsSubscriptions, key, mergedNews[key][i])) {

                                    this.addToNewsBatch('unsubscribe', key, this.currentNewsSubscriptions[j].callback, this.currentNewsSubscriptions[j].filterFields);

                                    this.currentNewsSubscriptions.splice(j, 1);

                                    fidsExt = mergedNews[key][i].filterFields.FIDs.toString();

                                    branchesExt = '';
                                    if (mergedNews[key][i].filterFields.Branches != undefined) {
                                        branchesExt = mergedNews[key][i].filterFields.Branches.toString();
                                    }

                                    categoriesExt = '';
                                    if (mergedNews[key][i].filterFields.Categories != undefined) {
                                        categoriesExt = mergedNews[key][i].filterFields.Categories.toString();
                                    }

                                    languagesExt = '';
                                    if (mergedNews[key][i].filterFields.Languages != undefined) {
                                        languagesExt = mergedNews[key][i].filterFields.Languages.toString();
                                    }

                                    packagesExt = '';
                                    if (mergedNews[key][i].filterFields.Packages != undefined) {
                                        packagesExt = mergedNews[key][i].filterFields.Packages.toString();
                                    }

                                    segmentsExt = '';
                                    if (mergedNews[key][i].filterFields.Segments != undefined) {
                                        segmentsExt = mergedNews[key][i].filterFields.Segments.toString();
                                    }

                                    sourcesExt = '';
                                    if (mergedNews[key][i].filterFields.Sources != undefined) {
                                        sourcesExt = mergedNews[key][i].filterFields.Sources.toString();
                                    }

                                    isinsExt = '';
                                    if (mergedNews[key][i].filterFields.Isins != undefined) {
                                        isinsExt = mergedNews[key][i].filterFields.Isins.toString();
                                    }

                                    keywordsExt = '';
                                    if (mergedNews[key][i].filterFields.Keywords != undefined) {
                                        keywordsExt = mergedNews[key][i].filterFields.Keywords.toString();
                                    }

                                    countriesExt = '';
                                    if (mergedNews[key][i].filterFields.Countries != undefined) {
                                        countriesExt = mergedNews[key][i].filterFields.Countries.toString();
                                    }

                                    regionsExt = '';
                                    if (mergedNews[key][i].filterFields.Regions != undefined) {
                                        regionsExt = mergedNews[key][i].filterFields.Regions.toString();
                                    }

                                    filterFields = {};
                                    filterFields['NewsFIDs'] = fidsExt;

                                    if (branchesExt != '') {
                                        filterFields['Branches'] = branchesExt;
                                    }

                                    if (categoriesExt != '') {
                                        filterFields['Categories'] = categoriesExt;
                                    }

                                    if (languagesExt != '') {
                                        filterFields['Languages'] = languagesExt;
                                    }

                                    if (packagesExt != '') {
                                        filterFields['Packages'] = packagesExt;
                                    }

                                    if (segmentsExt != '') {
                                        filterFields['Segments'] = segmentsExt;
                                    }

                                    if (sourcesExt != '') {
                                        filterFields['Sources'] = sourcesExt;
                                    }

                                    if (isinsExt != '') {
                                        filterFields['Isins'] = isinsExt;
                                    }

                                    if (keywordsExt != '') {
                                        filterFields['Keywords'] = keywordsExt;
                                    }

                                    if (countriesExt != '') {
                                        filterFields['Countries'] = countriesExt;
                                    }

                                    if (regionsExt != '') {
                                        filterFields['Regions'] = regionsExt;
                                    }

                                    this.addToNewsBatch('subscribe', key, this.subscribeNewsCallback, filterFields);

                                    this.currentNewsSubscriptions.push({ guID: key, filterFields: mergedNews[key][i].filterFields, callback: mergedNews[key][i].callback });
                                }
                            } else {
                                if (!this.areNewsCallBackTheSame(this.currentNewsSubscriptions, key, mergedNews[key][i])) {
                                    this.currentNewsSubscriptions[j].callback = mergedNews[key][i].callback;

                                }
                            }
                        }
                    }
                }
            }
        }
    }
};

TT.Push.prototype.unsubscribeMergedNews = function (merged, type, sym, functionCallback) {
    for (var i = 0; i < sym.length; i++) {
        var unsubscribeLastNews = false;
        var lastNewsIndex;

        for (var j = 0; j < this.currentNewsSubscriptions.length; j++) {

            var subscribedObj = this.currentNewsSubscriptions[j];

            if (sym[i] == subscribedObj.guID) {

                for (var k = 0; k < this.currentNewsSubscriptions[j].callback.length; k++) {
                    if (this.currentNewsSubscriptions[j].callback[k] == functionCallback) {
                        unsubscribeLastNews = true;
                        lastNewsIndex = j;
                    }
                }

                if (unsubscribeLastNews) {
                    if (lastNewsIndex != undefined) {

                        var newSubscription = this.currentNewsSubscriptions[j];

                        this.addToNewsBatch('unsubscribe', newSubscription.guID, newSubscription.callback, newSubscription.filterFields);
                        this.currentNewsSubscriptions.splice(lastNewsIndex, 1);
                    }
                }
            }
        }
    }
};

TT.Push.prototype.prepareNewsForMerge = function (type, sym, functionCallback) {
    var newses = [];

    for (var i = 0; i < this.sameCallbackNewsFunctionList.length; i++) {

        var sameCfList = this.sameCallbackNewsFunctionList[i];
        for (var j = 0; j < sameCfList.length; j++) {
            var guIDs = sameCfList[j].guID;

            if (guIDs != undefined) {
                newses.push({ guID: guIDs, callback: sameCfList[j]['callback'], filterFields: sameCfList[j]['filterFields'] });
            }
        }
    }
    var sameSymbols = [];

    for (i = 0; i < newses.length; i++) {
        for (j = i + 1; j < newses.length; j++) {
            if (newses[i].guID == newses[j].guID) {
                if (!this.alreayInTheArrayList(sameSymbols, newses[i], "news")) {
                    sameSymbols.push(newses[i]);
                }
                if (!this.alreayInTheArrayList(sameSymbols, newses[j], "news")) {
                    sameSymbols.push(newses[j]);
                }
            }
        }
    }

    var preMerge = {};

    for (i = 0; i < sameSymbols.length; i++) {
        if (!preMerge[sameSymbols[i].guID]) {
            var propArr = [];
            for (j = 0; j < sameSymbols.length; j++) {
                if (sameSymbols[i].guID == sameSymbols[j].guID) {
                    propArr.push({ callback: sameSymbols[j].callback, filterFields: sameSymbols[j].filterFields });
                }
            }
            preMerge[sameSymbols[i].guID] = propArr;
        }
    }

    for (i = 0; i < newses.length; i++) {
        if (!preMerge[newses[i].guID]) {
            propArr = [];
            propArr.push({ callback: newses[i].callback, filterFields: newses[i].filterFields });
            preMerge[newses[i].guID] = propArr;
        }
    }

    this.mergeNews(preMerge, type, sym, functionCallback);
};

TT.Push.prototype.mergeNews = function (preMerge, type, sym, functionCallback) {
    //console.log(" --- mergeNews --- ");
    //console.log("preMerge: " + JSON.stringify(preMerge));

    var merged = {};
    this.mergedNews = {};

    for (var key in preMerge) {
        var props = [];
        var preMergeFields = [];
        var preMergeCallbacks = [];

        for (var i = 0; i < preMerge[key].length; i++) {
            preMergeFields.push(preMerge[key][i].filterFields);
            preMergeCallbacks.push(preMerge[key][i].callback);
        }

        var mergedFilterFields = this.mergeNewsFilterFields(preMergeFields);
        var mergedCallbacks = this.mergeCallbacks(preMergeCallbacks);

        props.push({ callback: mergedCallbacks, filterFields: mergedFilterFields });

        merged[key] = props;
    }

    this.mergedNews = this.deepExtend(this.mergedNews, merged);

    /*for (key in this.mergedNews) {
        for (i = 0; i < this.mergedNews[key].length; i++) {
            console.log("this.mergedNews[key][i]: " + JSON.stringify(this.mergedNews[key][i]));
        }
    }*/

    if (this.subscribed) {
        if (type == "subscribe") {
            this.subscribeMergedNews(this.mergedNews);
        } else {
            this.unsubscribeMergedNews(this.merged, type, sym, functionCallback);
        }
    }
};

TT.Push.prototype.subscribeNewses = function () {
    //console.log(" --- subscribeNewses --- ");

    /*for (key in this.mergedNews) {
        for (i = 0; i < this.mergedNews[key].length; i++) {
            console.log("this.mergedNews[key][i]: " + JSON.stringify(this.mergedNews[key][i]));
        }
    }*/

    for (var key in this.mergedNews) {
        for (var i = 0; i < this.mergedNews[key].length; i++) {
            if (!this.isNewsInCurrentSubscriptionsArray(this.currentNewsSubscriptions, key, this.mergedNews)) {

                var fidsExt = this.mergedNews[key][i].filterFields.NewsFIDs.toString();

                var branchesExt = '';
                if (this.mergedNews[key][i].filterFields.Branches != undefined) {
                    branchesExt = this.mergedNews[key][i].filterFields.Branches.toString();
                }

                var categoriesExt = '';
                if (this.mergedNews[key][i].filterFields.Categories != undefined) {
                    categoriesExt = this.mergedNews[key][i].filterFields.Categories.toString();
                }

                var languagesExt = '';
                if (this.mergedNews[key][i].filterFields.Languages != undefined) {
                    languagesExt = this.mergedNews[key][i].filterFields.Languages.toString();
                }

                var packagesExt = '';
                if (this.mergedNews[key][i].filterFields.Packages != undefined) {
                    packagesExt = this.mergedNews[key][i].filterFields.Packages.toString();
                }

                var segmentsExt = '';
                if (this.mergedNews[key][i].filterFields.Segments != undefined) {
                    segmentsExt = this.mergedNews[key][i].filterFields.Segments.toString();
                }

                var sourcesExt = '';
                if (this.mergedNews[key][i].filterFields.Sources != undefined) {
                    sourcesExt = this.mergedNews[key][i].filterFields.Sources.toString();
                }

                var isinsExt = '';
                if (this.mergedNews[key][i].filterFields.Isins != undefined) {
                    isinsExt = this.mergedNews[key][i].filterFields.Isins.toString();
                }

                var keywordsExt = '';
                if (this.mergedNews[key][i].filterFields.Keywords != undefined) {
                    keywordsExt = this.mergedNews[key][i].filterFields.Keywords.toString();
                }

                var countriesExt = '';
                if (this.mergedNews[key][i].filterFields.Countries != undefined) {
                    countriesExt = this.mergedNews[key][i].filterFields.Countries.toString();
                }

                var regionsExt = '';
                if (this.mergedNews[key][i].filterFields.Regions != undefined) {
                    regionsExt = this.mergedNews[key][i].filterFields.Regions.toString();
                }

                var filterFields = {};

                filterFields['NewsFIDs'] = fidsExt;

                if (branchesExt != '') {
                    filterFields['Branches'] = branchesExt;
                }

                if (categoriesExt != '') {
                    filterFields['Categories'] = categoriesExt;
                }

                if (languagesExt != '') {
                    filterFields['Languages'] = languagesExt;
                }

                if (packagesExt != '') {
                    filterFields['Packages'] = packagesExt;
                }

                if (segmentsExt != '') {
                    filterFields['Segments'] = segmentsExt;
                }

                if (sourcesExt != '') {
                    filterFields['Sources'] = sourcesExt;
                }

                if (isinsExt != '') {
                    filterFields['Isins'] = isinsExt;
                }

                if (keywordsExt != '') {
                    filterFields['Keywords'] = keywordsExt;
                }

                if (countriesExt != '') {
                    filterFields['Countries'] = countriesExt;
                }

                if (regionsExt != '') {
                    filterFields['Regions'] = regionsExt;
                }

                this.addToNewsBatch('subscribe', key, this.subscribeNewsCallback, filterFields);

                this.currentNewsSubscriptions.push({ guID: key, filterFields: this.mergedNews[key][i].filterFields, callback: this.mergedNews[key][i].callback });
            }
        }
    }
    this.endNewsBatch('');
};

TT.Push.prototype.unsubscribeNews = function (symbolsData) {
    var newses = [];
    var functionCallback = '';
    var filterFields = {};

    var subscribedFids = [];
    var cantDeleteFids = [];
    var canDeleteFids = [];

    if (typeof (symbolsData) == 'object') {
        for (var key in symbolsData) {
            var obj = symbolsData[key];
            for (var prop in obj) {
                if (obj.hasOwnProperty(prop)) {
                    var property = obj[prop];
                    if (prop == 'callback') {

                        var guid = this.getGuidFromSubscribedNewsList(property);

                        var tmpObj = {};
                        tmpObj = this.deepExtend(tmpObj, obj);

                        if (guid != undefined && guid != '') {
                            newses.push(guid);
                            functionCallback = tmpObj['callback'];

                            for (var j = 0; j < this.sameCallbackNewsFunctionList.length; j++) {
                                var sameCfList = this.sameCallbackNewsFunctionList[j];

                                for (var k = 0; k < sameCfList.length; k++) {
                                    var guidsArr = sameCfList[k].guID;
                                    if ((guidsArr == guid) && sameCfList[k]['callback'] == functionCallback) {
                                        sameCfList.splice(k, 1);
                                    }

                                }
                            }

                            filterFields = tmpObj['filterFields'];

                            if (filterFields == undefined) {
                                for (var m = 0; m < this.tempPushNewsList.length; m++) {
                                    if (this.tempPushNewsList[m].guID != undefined) {
                                        if (this.tempPushNewsList[m].callback == functionCallback) {
                                            filterFields = this.tempPushNewsList[m].filterFields;
                                        }
                                    }
                                }
                            }

                            if (filterFields == undefined) return;

                            for (j = 0; j < this.tempPushNewsList.length; j++) {
                                var tempPushObj = this.tempPushNewsList[j];
                                if (tempPushObj.guID != undefined) {
                                    if (guid == tempPushObj.guID && !this.compare(filterFields.NewsFIDs.sort(), tempPushObj.filterFields.NewsFIDs.sort())) {

                                        var tempPushObjFidsArray = tempPushObj.filterFields.NewsFIDs.sort();

                                        for (m = 0; m < tempPushObjFidsArray.length; m++) {
                                            if (!this.isInStrArray(subscribedFids, tempPushObjFidsArray[m])) {
                                                subscribedFids.push(tempPushObjFidsArray[m]);
                                            }
                                        }

                                        var filterFidsArray = filterFields.NewsFIDs.sort();
                                        for (k = 0; k < filterFidsArray.length; k++) {
                                            if (this.isInStrArray(subscribedFids, filterFidsArray[k])) {
                                                if (!this.isInStrArray(cantDeleteFids, filterFidsArray[k])) {
                                                    cantDeleteFids.push(filterFidsArray[k]);
                                                }
                                            }
                                        }

                                    }
                                }
                            }

                            cantDeleteFids.sort();
                            canDeleteFids = this.arrDiff(filterFields.NewsFIDs, cantDeleteFids);

                            var index;
                            for (m = 0; m < this.tempPushNewsList.length; m++) {
                                if (this.tempPushNewsList[m].guID != undefined) {
                                    if (guid == this.tempPushNewsList[m].guID && this.tempPushNewsList[m].callback == functionCallback && this.assertObjectEqual(filterFields, this.tempPushNewsList[m].filterFields, "news")) {
                                        index = m;
                                    }

                                    if (index != undefined) {
                                        this.tempPushNewsList.splice(index, 1);
                                        index = undefined;
                                    }
                                }
                            }
                        } else {
                            console.log("You did not subscribe function: " + this.parseFunctionName(tmpObj['callback']));
                            this.addMessage("You did not subscribe function." + this.parseFunctionName(tmpObj['callback']));
                        }
                    }
                }
            }
        }
    }

    //console.log("newses: " + newses + " --- functionCallback: " + functionCallback + " --- JSON.stringify(filterFields): " + JSON.stringify(filterFields) + " --- canDeleteFids: " + canDeleteFids);

    this.prepareNewsForMerge('unsubscribe', newses, functionCallback);
};

TT.Push.prototype.startNewsBatch = function () {
    this.subscriptionQueue = [];
};

TT.Push.prototype.addToNewsBatch = function (type, id, cback, fFields) {
    this.newsSubscriptionQueue.push({
        'type': type,
        'cback': cback,
        'fFields': fFields,
        'id': id
    });
};

TT.Push.prototype.endNewsBatch = function (from) {
    var unsubsObj = {};
    var subsObj = {};
    var usubLen = 0;
    var subLen = 0;

    for (var i = 0; i < this.newsSubscriptionQueue.length; i++) {
        if (this.newsSubscriptionQueue[i].type == 'unsubscribe') {
            unsubsObj[this.newsSubscriptionQueue[i].id] = this.newsSubscriptionQueue[i];
            usubLen++;
        }
        if (this.newsSubscriptionQueue[i].type == 'subscribe') {
            subsObj[this.newsSubscriptionQueue[i].id] = this.newsSubscriptionQueue[i];
            subLen++;
        }
    }

    if (usubLen > 0) {
        if (this._cometd.getTransport() != 'callback-polling') {
            this._cometd.startBatch();
        }
    }

    for (key in unsubsObj) {
        var unobj = unsubsObj[key];
        if (this.newsChannels[unobj.id] != undefined) {
            this._cometd.unsubscribe(this.newsChannels[unobj.id]);
            delete this.newsChannels[unobj.id];
        }
    }

    if (usubLen > 0) {
        if (this._cometd.getTransport() != 'callback-polling') {
            this._cometd.endBatch();
        }
    }

    if (subLen > 0) {
        if (this._cometd.getTransport() != 'callback-polling') {
            this._cometd.startBatch();
        }
    }

    for (key in subsObj) {
        var suobj = subsObj[key];
        this.newsChannels[suobj.id] = this._cometd.subscribe('/teletrader/news/custom/' + suobj.id, suobj.cback, {
            "ext": {
                "teletrader": suobj.fFields
            }
        });
    }

    if (subLen > 0) {
        if (this._cometd.getTransport() != 'callback-polling') {
            this._cometd.endBatch();
        }
    }

    this.newsSubscriptionQueue = [];
};

TT.Push.prototype.mergeNewsFilterFields = function (preMergeFields) {
    //console.log(" --- mergeNewsFilterFields --- ");
    var feeds = {};

    var branches = {};
    var categories = {};
    var languages = {};
    var packages = {};

    var segments = {};
    var sources = {};

    var isins = {};
    var keywords = {};

    var countries = {};
    var regions = {};

    var obj = {};

    for (var i = 0; i < preMergeFields.length; i++) {
        var feedsArray = preMergeFields[i].NewsFIDs;
        for (var j = 0; j < feedsArray.length; j++) {
            if (!feeds[feedsArray[j]]) {
                feeds[feedsArray[j]] = feedsArray[j];
            }
        }

        if (preMergeFields[i].Keywords != undefined) {
            var keywordsArray = preMergeFields[i].Keywords;
            for (j = 0; j < keywordsArray.length; j++) {
                if (!keywords[keywordsArray[j]]) {
                    keywords[keywordsArray[j]] = keywordsArray[j];
                }
            }
        }

        if (preMergeFields[i].Countries != undefined) {
            var countriesArray = preMergeFields[i].Countries;
            for (j = 0; j < countriesArray.length; j++) {
                if (!countries[countriesArray[j]]) {
                    countries[countriesArray[j]] = countriesArray[j];
                }
            }
        }

        if (preMergeFields[i].Regions != undefined) {
            var regionsArray = preMergeFields[i].Regions;
            for (j = 0; j < regionsArray.length; j++) {
                if (!regions[regionsArray[j]]) {
                    regions[regionsArray[j]] = regionsArray[j];
                }
            }
        }

        if (preMergeFields[i].Sources != undefined) {
            var sourcesArray = preMergeFields[i].Sources;
            for (j = 0; j < sourcesArray.length; j++) {
                if (!sources[sourcesArray[j]]) {
                    sources[sourcesArray[j]] = sourcesArray[j];
                }
            }
        }

        if (preMergeFields[i].Isins != undefined) {
            var isinsArray = preMergeFields[i].Isins;
            for (j = 0; j < isinsArray.length; j++) {
                if (!isins[isinsArray[j]]) {
                    isins[isinsArray[j]] = isinsArray[j];
                }
            }
        }

        if (preMergeFields[i].Segments != undefined) {
            var segmentsArray = preMergeFields[i].Segments;
            for (j = 0; j < segmentsArray.length; j++) {
                if (!segments[segmentsArray[j]]) {
                    segments[segmentsArray[j]] = segmentsArray[j];
                }
            }
        }

        if (preMergeFields[i].Packages != undefined) {
            var packagesArray = preMergeFields[i].Packages;
            for (j = 0; j < packagesArray.length; j++) {
                if (!packages[packagesArray[j]]) {
                    packages[packagesArray[j]] = packagesArray[j];
                }
            }
        }

        if (preMergeFields[i].Languages != undefined) {
            var languagesArray = preMergeFields[i].Languages;
            for (j = 0; j < languagesArray.length; j++) {
                if (!languages[languagesArray[j]]) {
                    languages[languagesArray[j]] = languagesArray[j];
                }
            }
        }

        if (preMergeFields[i].Branches != undefined) {
            var branchesArray = preMergeFields[i].Branches;
            for (j = 0; j < branchesArray.length; j++) {
                if (!branches[branchesArray[j]]) {
                    branches[branchesArray[j]] = branchesArray[j];
                }
            }
        }

        if (preMergeFields[i].Categories != undefined) {
            var categoriesArray = preMergeFields[i].Categories;
            for (j = 0; j < categoriesArray.length; j++) {
                if (!categories[categoriesArray[j]]) {
                    categories[categoriesArray[j]] = categoriesArray[j];
                }
            }
        }
    }

    var mergedFeeds = [];

    for (var key in feeds) {
        mergedFeeds.push(key);
    }

    obj.NewsFIDs = mergedFeeds;

    var mergedBranches = [];

    for (key in branches) {
        mergedBranches.push(key);
    }

    if (mergedBranches.length > 0) obj.Branches = mergedBranches;

    var mergedCategories = [];

    for (key in categories) {
        mergedCategories.push(key);
    }

    if (mergedCategories.length > 0) obj.Categories = mergedCategories;

    var mergedLanguages = [];

    for (key in languages) {
        mergedLanguages.push(key);
    }

    if (mergedLanguages.length > 0) obj.Languages = mergedLanguages;

    var mergedPackages = [];

    for (key in packages) {
        mergedPackages.push(key);
    }

    if (mergedPackages.length > 0) obj.Packages = mergedPackages;

    var mergedSegments = [];

    for (key in segments) {
        mergedSegments.push(key);
    }

    if (mergedSegments.length > 0) obj.Segments = mergedSegments;

    var mergedSources = [];

    for (key in sources) {
        mergedSources.push(key);
    }

    if (mergedSources.length > 0) obj.Sources = mergedSources;

    var mergedIsins = [];

    for (key in isins) {
        mergedIsins.push(key);
    }

    if (mergedIsins.length > 0) obj.Isins = mergedIsins;

    var mergedKeywords = [];

    for (key in keywords) {
        mergedKeywords.push(key);
    }

    if (mergedKeywords.length > 0) obj.Keywords = mergedKeywords;

    var mergedCountries = [];

    for (key in countries) {
        mergedCountries.push(key);
    }

    if (mergedCountries.length > 0) obj.Countries = mergedCountries;

    var mergedRegions = [];

    for (key in regions) {
        mergedRegions.push(key);
    }

    if (mergedRegions.length > 0) obj.Regions = mergedRegions;

    //console.log("obj: " + JSON.stringify(obj));

    return obj;
};

/* NEWS END*/

TT.Push.prototype.addMessage = function (message) {
    this.messages.push({ message: message, timestamp: (new Date()).getTime() });
    //this.messages.push({ message: message, timestamp: Date.now() });
};

TT.Push.prototype.getLog = function () {
    for (var j = 0; j < this.currentSubscriptions.length; j++) {
        var currentObj = this.currentSubscriptions[j];
        this.addMessage("symbolID: " + currentObj['symbolID'] + ", " + JSON.stringify(currentObj['filterFields']) + ", msg: " + JSON.stringify(currentObj['msg'])); //+ ", callback: " + this.parseFunctionName(currentObj['callback']));
    }

    for (j = 0; j < this.currentNewsSubscriptions.length; j++) {
        currentObj = this.currentNewsSubscriptions[j];
        this.addMessage("News guID: " + currentObj['guID'] + ", " + JSON.stringify(currentObj['filterFields'])); // + ", callback: " + this.parseFunctionName(currentObj['callback']));
    }

    for (j = 0; j < this.currentChannelsSubscriptions.length; j++) {
        currentObj = this.currentChannelsSubscriptions[j];
        this.addMessage("Subscribed Custom Channel: " + currentObj['channel']); // + ", callback: " + this.parseFunctionName(currentObj['callback']));
    }

    var logString = "";
    for (var i = 0; i < this.messages.length; i++) {
        logString += THIS.formatDate(new Date(this.messages[i].timestamp), 'yyyy-MM-dd hh:mm:ss.ms') + '\t' + this.messages[i].message + '\n';
    }
    return logString;
};

TT.Push.prototype.formatDate = function (dateTime, format) {
    var pattern = /\w+/g;

    var year = dateTime.getFullYear();
    var date = dateTime.getDate();
    var month = dateTime.getMonth() + 1;
    //var monthName = ut.months(chart)[dateTime.getMonth()];
    //var day = ut.days(chart)[dateTime.getDay()];

    var hour = dateTime.getHours();
    var minutes = dateTime.getMinutes();
    var seconds = dateTime.getSeconds();
    var milliseconds = dateTime.getMilliseconds();

    var dateParts = {
        yyyy: year,
        yy: year.toString().substring(2, 4),
        M: month,
        MM: ("0" + month).substr(-2),
        //MMM: monthName,
        d: date,
        dd: ("0" + date).substr(-2),
        //ddd: day,
        h: hour,
        hh: ("0" + hour).substr(-2),
        m: minutes,
        mm: ("0" + minutes).substr(-2),
        s: seconds,
        ss: ("0" + seconds).substr(-2),
        ms: ('0' + milliseconds).substr(-3)
    };

    var matches = format.match(pattern);

    for (var i = 0; i < matches.length; i++) {
        format = format.replace(matches[i], dateParts[matches[i]]);
    }

    return format;
};

TT.Push.prototype.parseFunctionName = function (functionName) {
    var fname = "";
    var str = functionName.toString().split("{");
    if (str.length > 0) {
        fname = str[0].replace("function ", "");
    }
    return fname;
};

TT.Push.prototype.getMergedSymbolsList = function () {
    for (var i = 0; i < this.sameCallbackFunctionList.length; i++) {
        var sameCfList = this.sameCallbackFunctionList[i];
        for (var j = 0; j < sameCfList.length; j++) {
            console.log('getMergedSymbolsList sameCallbackFunctionList: ' + JSON.stringify(sameCfList[j]) + " --- callback: " + sameCfList[j].callback);
        }
    }
};

TT.Push.prototype.getSubscribedSymbolsList = function () {
    for (var j = 0; j < this.currentSubscriptions.length; j++) {
        var currentObj = this.currentSubscriptions[j];
        //console.log('getSubscribedSymbolsList currentSubscriptions symbolID: ' + currentObj['symbolID'] + ' --- filterFields: ' + JSON.stringify(currentObj['filterFields']) + " --- msg: " + JSON.stringify(currentObj['msg']) + " --- callback: " + currentObj['callback']);

        console.log('getSubscribedSymbolsList currentSubscriptions symbolID: ' + currentObj['symbolID'] + ' --- filterFields: ' + JSON.stringify(currentObj['filterFields']) + " --- callback: " + currentObj['callback']); // + " --- msg: " + JSON.stringify(currentObj['msg']));
    }
};

TT.Push.prototype.getTempPushSymbolsList = function () {
    for (var i = 0; i < this.tempPushSymbolsList.length; i++) {
        console.log("getTempPushSymbolsList --- tempPushSymbolsList: " + JSON.stringify(this.tempPushSymbolsList[i]) + " --- callback: " + this.tempPushSymbolsList[i].callback);
    }
};

TT.Push.prototype.getSubscribedChannels = function () {
    for (var key in this.channels) {
        console.log("getSubscribedChannels --- key: " + key + " --- this.channels[key]: " + JSON.stringify(this.channels[key]));
    }
};

TT.Push.prototype.getSubscribedNewsChannels = function () {
    for (var key in this.newsChannels) {
        console.log("getSubscribedNewsChannels --- key: " + key + " --- this.channels[key]: " + JSON.stringify(this.newsChannels[key]));
    }
};

TT.Push.prototype.getTempPushNewsList = function () {
    for (var i = 0; i < this.tempPushNewsList.length; i++) {
        console.log("getTempPushNewsList --- tempPushNewsList: " + JSON.stringify(this.tempPushNewsList[i])); // + " --- callback: " + this.parseFunctionName(this.tempPushNewsList[i].callback));
    }
};

TT.Push.prototype.getMergedNewsList = function () {
    for (var i = 0; i < this.sameCallbackNewsFunctionList.length; i++) {
        var sameCfList = this.sameCallbackNewsFunctionList[i];
        for (var j = 0; j < sameCfList.length; j++) {
            console.log('getMergedNewsList sameCallbackNewsFunctionList: ' + JSON.stringify(sameCfList[j])); // + " --- callback: " + this.parseFunctionName(sameCfList[j].callback)); // + ' -- callback: ' + sameCfList[j]['callback']

        }
    }
};

TT.Push.prototype.getSubscribedNewsList = function () {
    for (var j = 0; j < this.currentNewsSubscriptions.length; j++) {
        var currentObj = this.currentNewsSubscriptions[j];
        console.log('getSubscribedNewsList currentNewsSubscriptions guID: ' + currentObj['guID'] + ' --- filterFields: ' + JSON.stringify(currentObj['filterFields'])); // + " --- callback: " + this.parseFunctionName(currentObj['callback']));
    }
};

TT.Push.prototype.getTempPushNewsList = function () {
    for (var i = 0; i < this.tempPushNewsList.length; i++) {
        console.log("getTempPushNewsList --- tempPushNewsList: " + JSON.stringify(this.tempPushNewsList[i])); // + " --- this.tempPushNewsList[i].callback: " + this.parseFunctionName(this.tempPushNewsList[i].callback));
    }
};

TT.Push.prototype.getGuidFromSubscribedNewsList = function (property) {
    var guid;
    for (var i = 0; i < this.tempPushNewsList.length; i++) {
        if (property == this.tempPushNewsList[i].callback) {
            guid = this.tempPushNewsList[i].guID;
        }
    }
    return guid;
};

TT.Push.prototype.subscribeCallback = function (msg) {
    for (var i = 0; i < THIS.currentSubscriptions.length; i++) {
        var currentObj = THIS.currentSubscriptions[i];
        if (currentObj['symbolID'] == msg.data.symbolId) {
            THIS.updateLastValue(currentObj['symbolID'], msg);
            for (var j = 0; j < currentObj['callback'].length; j++) {
                currentObj['callback'][j](msg);
            }
        }
    }
};

TT.Push.prototype.subscribeNewsCallback = function (msg) {
    for (var i = 0; i < THIS.currentNewsSubscriptions.length; i++) {
        var currentObj = THIS.currentNewsSubscriptions[i];
        var guid = msg.channel.split("/");
        if (currentObj['guID'] == guid[guid.length - 1]) {
            for (var j = 0; j < currentObj['callback'].length; j++) {
                currentObj['callback'][j](msg);
            }
        }
    }
};

TT.Push.prototype.updateLastValue = function (symbolId, msg) {
    for (var i = 0; i < THIS.currentSubscriptions.length; i++) {
        var currentObj = THIS.currentSubscriptions[i];
        if (currentObj['symbolID'] == msg.data.symbolId) {
            //console.log("currentObj['msg']: " + JSON.stringify(currentObj['msg']));
            if (currentObj['msg'] == undefined) {
                currentObj['msg'] = msg;
            } else {
                if (typeof (currentObj['msg']) == 'object') {
                    var currentObjMsgData = currentObj['msg'].data;
                    var msgData = msg.data;

                    for (var key in currentObjMsgData) {
                        if (!THIS.isInStrArray(currentObj['filterFields'].FIDs, key) && key != "symbolId") {
                            delete currentObjMsgData[key];
                        }
                    }

                    for (var attrname in msgData) {
                        currentObjMsgData[attrname] = msgData[attrname];
                    }

                    currentObjMsgData['symbolSnapshot'] = 'wrapper';
                }
            }
        }
    }
};

TT.Push.prototype.areFilterFieldsAndCallBackTheSame = function (currentSubscriptions, match, merged) {
    for (var i = 0; i < currentSubscriptions.length; i++) {
        var currentObj = currentSubscriptions[i];
        if (currentObj['symbolID'] == match) {
            for (var key in currentObj) {
                if (this.assertObjectEqual(currentObj['filterFields'], merged.filterFields, "symbols")) {
                    if (this.compare(currentObj['callback'], merged.callback)) {
                        return true;
                    } else {
                        return false;
                    }

                } else {
                    return false;
                }
            }
        }
    }
    return false;
};

TT.Push.prototype.areNewsFilterFieldsAndCallBackTheSame = function (currentSubscriptions, match, merged) {
    for (var i = 0; i < currentSubscriptions.length; i++) {
        var currentObj = currentSubscriptions[i];
        if (currentObj['guID'] == match) {
            for (var key in currentObj) {
                if (this.assertObjectEqual(currentObj['filterFields'], merged.filterFields, "news")) {
                    if (this.compare(currentObj['callback'], merged.callback)) {
                        return true;
                    } else {
                        return false;
                    }

                } else {
                    return false;
                }
            }
        }
    }
    return false;
};

TT.Push.prototype.areNewsFilterFieldsTheSame = function (currentSubscriptions, match, merged) {
    for (var i = 0; i < currentSubscriptions.length; i++) {
        var currentObj = currentSubscriptions[i];
        if (currentObj['guID'] == match) {
            for (var key in currentObj) {
                if (this.assertObjectEqual(currentObj['filterFields'], merged.filterFields, "news")) {
                    return true;
                } else {
                    return false;
                }
            }
        }
    }
    return false;
};

TT.Push.prototype.areFilterFieldsTheSame = function (currentSubscriptions, match, merged) {
    for (var i = 0; i < currentSubscriptions.length; i++) {
        var currentObj = currentSubscriptions[i];
        if (currentObj['symbolID'] == match) {
            for (var key in currentObj) {
                if (this.assertObjectEqual(currentObj['filterFields'], merged.filterFields, "symbols")) {
                    return true;
                } else {
                    return false;
                }
            }
        }
    }
    return false;
};

TT.Push.prototype.areCallBackTheSame = function (currentSubscriptions, match, merged) {
    for (var i = 0; i < currentSubscriptions.length; i++) {
        var currentObj = currentSubscriptions[i];
        if (currentObj['symbolID'] == match) {
            for (var key in currentObj) {

                if (this.compare(currentObj['callback'], merged.callback)) {
                    return true;
                } else {
                    return false;
                }

            }
        }
    }
    return false;
};

TT.Push.prototype.areNewsCallBackTheSame = function (currentSubscriptions, match, merged) {
    for (var i = 0; i < currentSubscriptions.length; i++) {
        var currentObj = currentSubscriptions[i];
        if (currentObj['guID'] == match) {
            for (var key in currentObj) {
                if (this.compare(currentObj['callback'], merged.callback)) {
                    return true;
                } else {
                    return false;
                }

            }
        }
    }
    return false;
};

TT.Push.prototype.arrDiff = function (a1, a2) {
    var a = [], diff = [];
    for (var i = 0; i < a1.length; i++)
        a[a1[i]] = true;
    for (i = 0; i < a2.length; i++)
        if (a[a2[i]]) delete a[a2[i]];
        else a[a2[i]] = true;
    for (var k in a)
        diff.push(k);
    return diff;
};

/* compare two arrays */
TT.Push.prototype.compare = function (a, array) {
    if (!array)
        return false;

    if (a.length != array.length)
        return false;

    a.sort();
    array.sort();

    for (var i = 0; i < this.length; i++) {
        if (a[i] instanceof Array && array[i] instanceof Array) {
            if (!a[i].compare(array[i]))
                return false;
        } else if (a[i] != array[i]) {
            return false;
        }
    }
    return true;
};

TT.Push.prototype.isSymbolInCurrentSubscriptionsArray = function (currentSubscriptions, match) {
    for (var i = 0; i < currentSubscriptions.length; i++) {
        var currentObj = currentSubscriptions[i];
        if (currentObj['symbolID'] == match) {
            return true;
            break;
        }
    }
    return false;
};

TT.Push.prototype.isNewsInCurrentSubscriptionsArray = function (currentSubscriptions, match) {
    for (var i = 0; i < currentSubscriptions.length; i++) {
        var currentObj = currentSubscriptions[i];
        if (currentObj['guID'] == match) {
            return true;
            break;
        }
    }
    return false;
};

TT.Push.prototype.isSymbolCallbackInCurrentSubscriptionsArray = function (currentSubscriptions, match, callback) {
    for (var i = 0; i < currentSubscriptions.length; i++) {
        var currentObj = currentSubscriptions[i];
        if (currentObj['symbolID'] == match) {
            for (var k = 0; k < currentObj.callback.length; k++) {
                if (currentObj.callback[k] == callback) {
                    return true;
                    break;
                }
            }
        }
    }
    return false;
};

TT.Push.prototype.isNewsCallbackInCurrentSubscriptionsArray = function (currentSubscriptions, callback) {
    for (var i = 0; i < currentSubscriptions.length; i++) {
        var currentObj = currentSubscriptions[i];
        for (var k = 0; k < currentObj.callback.length; k++) {
            if (currentObj.callback[k] == callback) {
                return true;
                break;
            }
        }
    }
    return false;
};

TT.Push.prototype.isInStrArray = function (arr, match) {
    if (arr != undefined) {
        for (var i = 0; i < arr.length; i++) {
            //if (arr[i].toString().toLowerCase().indexOf(match.toString().toLowerCase()) != -1) {
            if (arr[i].toString().toLowerCase() == match.toString().toLowerCase()) {
                return true;
                break;
            }
        }
    }
    return false;
};

TT.Push.prototype.alreayInTheArrayList = function (sameSymbols, obj, subtype) {
    for (var j = 0; j < sameSymbols.length; j++) {
        if (this.assertObjectEqual(sameSymbols[j], obj, subtype) && sameSymbols[j]['callback'] == obj['callback']) {
            return true;
            break;
        }
    }
    return false;
};

TT.Push.prototype.alreayInTheList = function (sameCallbackList, obj, subtype) {
    for (var i = 0; i < sameCallbackList.length; i++) {
        var sameList = sameCallbackList[i];
        for (var j = 0; j < sameList.length; j++) {
            if (this.assertObjectEqual(sameList[j], obj, subtype) && sameList[j]['callback'] == obj['callback']) {
                return true;
                break;
            }
        }
    }
    return false;
};

TT.Push.prototype.getSymbolFIDs = function () {
    this.symbolfids = this.GetOption("symbolfids") == undefined ? this.GetDefaultOption("symbolfids").sort() : this.GetOption("symbolfids").sort();
    return this.symbolfids;
};

TT.Push.prototype.getNewsFIDs = function () {
    this.newsfids = this.GetOption("newsfids") == undefined ? this.GetDefaultOption("newsfids").sort() : this.GetOption("newsfids").sort();
    return this.newsfids;
};

/* addEventListener */
TT.Push.prototype.addEventListener = function (type, handler, priority) {
    if (!(typeof type == 'string') || !handler) {
        throw new TypeError('Required .addEventListener() parameters are missing.');
    }
    if (!priority) {
        priority = 'normal';
    }
    //this enables to bind to more events at once
    var split = type.split(' ');
    if (split.length >= 2) {
        var removeFuncs = [];
        for (var i = 0; i < split.length; i++) {
            removeFuncs.push(this.addEventListener(split[i], handler, priority));
        }
        return function () {
            removeFuncs.forEach(function (f) { f(); });
        };
    }

    //actual binding
    if (!events[type]) {
        events[type] = {};
    }
    if (!events[type][priority]) {
        events[type][priority] = [];
    }

    if (events[type][priority].indexOf(handler) == -1) {
        //see trigger() for why we use unshift()
        events[type][priority].unshift(handler);
    }

    return function () {
        removeEventListener(type, handler, priority);
    };
};

/* removeEventListener */
TT.Push.prototype.removeEventListener = function (type, handler, priority) {
    if (!(typeof type == 'string') || !handler) {
        throw new TypeError('Required EventManager.removeEventListener() parameters are missing.');
    }
    if (!priority) {
        priority = 'normal';
    }

    if (events[type] && events[type][priority]) {
        var handlerIndex = events[type][priority].indexOf(handler);
        if (handlerIndex != -1) {
            events[type][priority].splice(handlerIndex, 1);
        }
    }
};

/* trigger */
TT.Push.prototype.trigger = function (type, data) {
    var dataArr;
    if (typeof type == 'object') {
        dataArr = type.dataArr;
        type = type.type;
    }

    //console.log('Event:\t' + type);

    if (!type) {
        throw new TypeError('Required .trigger() parameters are missing.');
    }
    if (!dataArr) {

        if (data === undefined) {
            data = {};
        }

        dataArr = [data];
    }
    if (events[type] && events[type]['normal']) {
        for (var i = events[type]['normal'].length; i--;) {
            if (!events[type]['normal'][i]) { continue; }
            //console.log('Handler executed for event "' + type + '" with priority "' + 'normal' + '"', 2);
            events[type]['normal'][i].apply(null, dataArr);
        }
    }
};

TT.Push.prototype.deepExtend = function (destination, source) {
    for (var property in source) {
        if (source[property] && source[property].constructor && source[property].constructor === Object) {
            destination[property] = destination[property] || {};
            arguments.callee(destination[property], source[property]);
        } else {
            destination[property] = source[property];
        }
    }
    return destination;
};

TT.Push.prototype.assertNewsObjectEqual = function (a, b) {
    if (typeof (a) == 'object' && typeof (b) == 'object') {

        /*if (Object.keys(a).length != Object.keys(b).length) {
            return false;
        }*/

        var lengtha = 0;
        for (var propa in a) {
            if (a.hasOwnProperty(propa))
                lengtha++;
        }

        var lengthb = 0;
        for (var propb in b) {
            if (b.hasOwnProperty(propb))
                lengthb++;
        }

        if (lengtha != lengthb) {
            return false;
        }

        for (var keya in a) {
            if (b.hasOwnProperty(keya)) {
                var obja = a[keya];
                var objb = b[keya];

                if (keya.toLowerCase() == "guid") {
                    if (obja.length == objb.length) {
                        for (var i = 0; i < obja.length; i++) {
                            if (objb.indexOf(obja[i]) == -1) {
                                return false;
                            }
                        }
                    } else {
                        return false;
                    }
                }

                if (keya.toLowerCase() == "filterfields") {
                    obja = a[keya];
                    objb = b[keya];

                    for (var fieldskeya in obja) {
                        if (objb.hasOwnProperty(fieldskeya)) {
                            var fieldsobja = obja[fieldskeya];
                            var fieldsobjb = objb[fieldskeya];

                            if (fieldskeya.toLowerCase() == "newsfids") {
                                if (fieldsobja.length == fieldsobjb.length) {
                                    for (i = 0; i < fieldsobja.length; i++) {
                                        if (fieldsobjb.indexOf(fieldsobja[i]) == -1) {
                                            return false;
                                        }
                                    }
                                } else {
                                    return false;
                                }
                            }

                            if (fieldskeya.toLowerCase() == "branches") {
                                if (fieldsobja.length == fieldsobjb.length) {
                                    for (i = 0; i < fieldsobja.length; i++) {
                                        if (fieldsobjb.indexOf(fieldsobja[i]) == -1) {
                                            return false;
                                        }
                                    }
                                } else {
                                    return false;
                                }
                            }

                            if (fieldskeya.toLowerCase() == "categories") {
                                if (fieldsobja.length == fieldsobjb.length) {
                                    for (i = 0; i < fieldsobja.length; i++) {
                                        if (fieldsobjb.indexOf(fieldsobja[i]) == -1) {
                                            return false;
                                        }
                                    }
                                } else {
                                    return false;
                                }
                            }

                            if (fieldskeya.toLowerCase() == "languages") {
                                if (fieldsobja.length == fieldsobjb.length) {
                                    for (i = 0; i < fieldsobja.length; i++) {
                                        if (fieldsobjb.indexOf(fieldsobja[i]) == -1) {
                                            return false;
                                        }
                                    }
                                } else {
                                    return false;
                                }
                            }

                            if (fieldskeya.toLowerCase() == "packages") {
                                if (fieldsobja.length == fieldsobjb.length) {
                                    for (i = 0; i < fieldsobja.length; i++) {
                                        if (fieldsobjb.indexOf(fieldsobja[i]) == -1) {
                                            return false;
                                        }
                                    }
                                } else {
                                    return false;
                                }
                            }

                            if (fieldskeya.toLowerCase() == "segments") {
                                if (fieldsobja.length == fieldsobjb.length) {
                                    for (i = 0; i < fieldsobja.length; i++) {
                                        if (fieldsobjb.indexOf(fieldsobja[i]) == -1) {
                                            return false;
                                        }
                                    }
                                } else {
                                    return false;
                                }
                            }

                            if (fieldskeya.toLowerCase() == "sources") {
                                if (fieldsobja.length == fieldsobjb.length) {
                                    for (i = 0; i < fieldsobja.length; i++) {
                                        if (fieldsobjb.indexOf(fieldsobja[i]) == -1) {
                                            return false;
                                        }
                                    }
                                } else {
                                    return false;
                                }
                            }

                            if (fieldskeya.toLowerCase() == "isins") {
                                if (fieldsobja.length == fieldsobjb.length) {
                                    for (i = 0; i < fieldsobja.length; i++) {
                                        if (fieldsobjb.indexOf(fieldsobja[i]) == -1) {
                                            return false;
                                        }
                                    }
                                } else {
                                    return false;
                                }
                            }

                            if (fieldskeya.toLowerCase() == "keywords") {
                                if (fieldsobja.length == fieldsobjb.length) {
                                    for (i = 0; i < fieldsobja.length; i++) {
                                        if (fieldsobjb.indexOf(fieldsobja[i]) == -1) {
                                            return false;
                                        }
                                    }
                                } else {
                                    return false;
                                }
                            }

                            if (fieldskeya.toLowerCase() == "countries") {
                                if (fieldsobja.length == fieldsobjb.length) {
                                    for (i = 0; i < fieldsobja.length; i++) {
                                        if (fieldsobjb.indexOf(fieldsobja[i]) == -1) {
                                            return false;
                                        }
                                    }
                                } else {
                                    return false;
                                }
                            }

                            if (fieldskeya.toLowerCase() == "regions") {
                                if (fieldsobja.length == fieldsobjb.length) {
                                    for (i = 0; i < fieldsobja.length; i++) {
                                        if (fieldsobjb.indexOf(fieldsobja[i]) == -1) {
                                            return false;
                                        }
                                    }
                                } else {
                                    return false;
                                }
                            }

                        } else {
                            return false;
                        }
                    }
                }

                if (keya.toLowerCase() == "callback") {
                    obja = a[keya];
                    objb = b[keya];

                    if (obja != objb) {
                        return false;
                    }
                }

                if (keya.toLowerCase() == "newsfids") {
                    obja = a[keya];
                    objb = b[keya];

                    if (obja.length == objb.length) {
                        for (i = 0; i < obja.length; i++) {
                            if (objb.indexOf(obja[i]) == -1) {
                                return false;
                            }
                        }
                    } else {
                        return false;
                    }
                }

                if (keya.toLowerCase() == "branches") {
                    obja = a[keya];
                    objb = b[keya];

                    if (obja.length == objb.length) {
                        for (i = 0; i < obja.length; i++) {
                            if (objb.indexOf(obja[i]) == -1) {
                                return false;
                            }
                        }
                    } else {
                        return false;
                    }
                }

                if (keya.toLowerCase() == "categories") {
                    obja = a[keya];
                    objb = b[keya];

                    if (obja.length == objb.length) {
                        for (i = 0; i < obja.length; i++) {
                            if (objb.indexOf(obja[i]) == -1) {
                                return false;
                            }
                        }
                    } else {
                        return false;
                    }
                }

                if (keya.toLowerCase() == "languages") {
                    obja = a[keya];
                    objb = b[keya];

                    if (obja.length == objb.length) {
                        for (i = 0; i < obja.length; i++) {
                            if (objb.indexOf(obja[i]) == -1) {
                                return false;
                            }
                        }
                    } else {
                        return false;
                    }
                }

                if (keya.toLowerCase() == "packages") {
                    obja = a[keya];
                    objb = b[keya];

                    if (obja.length == objb.length) {
                        for (i = 0; i < obja.length; i++) {
                            if (objb.indexOf(obja[i]) == -1) {
                                return false;
                            }
                        }
                    } else {
                        return false;
                    }
                }

                if (keya.toLowerCase() == "segments") {
                    obja = a[keya];
                    objb = b[keya];

                    if (obja.length == objb.length) {
                        for (i = 0; i < obja.length; i++) {
                            if (objb.indexOf(obja[i]) == -1) {
                                return false;
                            }
                        }
                    } else {
                        return false;
                    }
                }

                if (keya.toLowerCase() == "sources") {
                    obja = a[keya];
                    objb = b[keya];

                    if (obja.length == objb.length) {
                        for (i = 0; i < obja.length; i++) {
                            if (objb.indexOf(obja[i]) == -1) {
                                return false;
                            }
                        }
                    } else {
                        return false;
                    }
                }

                if (keya.toLowerCase() == "isins") {
                    obja = a[keya];
                    objb = b[keya];

                    if (obja.length == objb.length) {
                        for (i = 0; i < obja.length; i++) {
                            if (objb.indexOf(obja[i]) == -1) {
                                return false;
                            }
                        }
                    } else {
                        return false;
                    }
                }

                if (keya.toLowerCase() == "keywords") {
                    obja = a[keya];
                    objb = b[keya];

                    if (obja.length == objb.length) {
                        for (i = 0; i < obja.length; i++) {
                            if (objb.indexOf(obja[i]) == -1) {
                                return false;
                            }
                        }
                    } else {
                        return false;
                    }
                }

                if (keya.toLowerCase() == "countries") {
                    obja = a[keya];
                    objb = b[keya];

                    if (obja.length == objb.length) {
                        for (i = 0; i < obja.length; i++) {
                            if (objb.indexOf(obja[i]) == -1) {
                                return false;
                            }
                        }
                    } else {
                        return false;
                    }
                }

                if (keya.toLowerCase() == "regions") {
                    obja = a[keya];
                    objb = b[keya];

                    if (obja.length == objb.length) {
                        for (i = 0; i < obja.length; i++) {
                            if (objb.indexOf(obja[i]) == -1) {
                                return false;
                            }
                        }
                    } else {
                        return false;
                    }
                }
            } else {
                return false;
            }
        }
    } else {
        return false;
    }

    return true;
};

TT.Push.prototype.assertSymbolsObjectEqual = function (a, b) {
    if (typeof (a) == 'object' && typeof (b) == 'object') {

        /*if (Object.keys(a).length != Object.keys(b).length) {
            return false;
        }*/

        var lengtha = 0;
        for (var propa in a) {
            if (a.hasOwnProperty(propa))
                lengtha++;
        }

        var lengthb = 0;
        for (var propb in b) {
            if (b.hasOwnProperty(propb))
                lengthb++;
        }

        if (lengtha != lengthb) {
            return false;
        }

        for (var keya in a) {
            if (b.hasOwnProperty(keya)) {
                var obja = a[keya];
                var objb = b[keya];

                if (keya.toLowerCase() == "symbolids") {
                    if (obja.length == objb.length) {
                        for (var i = 0; i < obja.length; i++) {
                            if (objb.indexOf(obja[i]) == -1) {
                                return false;
                            }
                        }
                    } else {
                        return false;
                    }
                }

                if (keya.toLowerCase() == "symbolid") {
                    obja = a[keya];
                    objb = b[keya];

                    if (obja != objb) {
                        return false;
                    }
                }

                if (keya.toLowerCase() == "filterfields") {
                    obja = a[keya];
                    objb = b[keya];

                    for (var fieldskeya in obja) {
                        if (objb.hasOwnProperty(fieldskeya)) {
                            var fieldsobja = obja[fieldskeya];
                            var fieldsobjb = objb[fieldskeya];

                            if (fieldskeya.toLowerCase() == "fids") {
                                if (fieldsobja.length == fieldsobjb.length) {
                                    for (i = 0; i < fieldsobja.length; i++) {
                                        if (fieldsobjb.indexOf(fieldsobja[i]) == -1) {
                                            return false;
                                        }
                                    }
                                } else {
                                    return false;
                                }
                            }

                            if (fieldskeya.toLowerCase() == "pushtype") {
                                if (fieldsobja != fieldsobjb) {
                                    return false;
                                }
                            }

                            if (fieldskeya.toLowerCase() == "symbolsnapshot") {
                                if (fieldsobja != fieldsobjb) {
                                    return false;
                                }
                            }
                        } else {
                            return false;
                        }
                    }
                }

                if (keya.toLowerCase() == "callback") {
                    obja = a[keya];
                    objb = b[keya];

                    if (obja != objb) {
                        return false;
                    }
                }

                if (keya.toLowerCase() == "fids") {
                    obja = a[keya];
                    objb = b[keya];

                    if (obja.length == objb.length) {
                        for (i = 0; i < obja.length; i++) {
                            if (objb.indexOf(obja[i]) == -1) {
                                return false;
                            }
                        }
                    } else {
                        return false;
                    }
                }

                if (keya.toLowerCase() == "pushtype") {
                    obja = a[keya];
                    objb = b[keya];

                    if (obja != objb) {
                        return false;
                    }
                }

                if (keya.toLowerCase() == "symbolsnapshot") {
                    obja = a[keya];
                    objb = b[keya];

                    if (obja != objb) {
                        return false;
                    }
                }
            } else {
                return false;
            }
        }
    } else {
        return false;
    }
    return true;
};

/* assertObjectEqual - check if two objects are equal */
TT.Push.prototype.assertObjectEqual = function (a, b, subtype) {
    //console.log("assertObjectEqual: " + subtype);
    if (subtype == "symbols") {
        return this.assertSymbolsObjectEqual(a, b);
    }

    if (subtype == "news") {
        return this.assertNewsObjectEqual(a, b);
    }
    return false;
};

if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function (elt /*, from*/) {
        var len = this.length >>> 0;

        var from = Number(arguments[1]) || 0;
        from = (from < 0)
         ? Math.ceil(from)
         : Math.floor(from);
        if (from < 0)
            from += len;

        for (; from < len; from++) {
            if (from in this &&
          this[from] === elt)
                return from;
        }
        return -1;
    };
}