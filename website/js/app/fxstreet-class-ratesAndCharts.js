(function () {

    FXStreet.Class.Patterns.Singleton.LoadAssets = (function () {
        var instance;

        var assetLoadClass = function () {
            var assets;
            var promise;
            var apiAssetGetAssets = "/api/assetapi/getassets";

            this.getAssets = function () {
                if (assets) {
                    return $.when(assets);
                }
                else {
                    if (!promise) {
                        promise = $.ajax({
                            type: "GET",
                            url: FXStreet.Util.createUrl(apiAssetGetAssets),
                            cache: true
                        }).then(function (data) {
                            assets = data;
                            promise = null;
                            return assets;
                        });
                    }
                    return promise;
                }
            };
        };

        return {
            getInstance: function () {
                if (!instance) {
                    instance = new assetLoadClass();
                }
                return instance;
            }
        };
    })();

    FXStreet.Class.RateMapper = function () {
        var parent = FXStreet.Class.Base(),
           _this = FXStreet.Util.extendObject(parent);

        _this.PairName = '';
        _this.PriceProviderCode = '';
        _this.DecimalPlaces = 4;
        _this.LastPrice = null;
        _this.LastBid = null;
        _this.LastAsk = null;
        _this.LastClose = null;
        const priceUpCssClass = "price_up";
        const priceDownCssClass = "price_down";
        const changeTendencyUpCssClass = "up";
        const changeTendencyDownCssClass = "down";
        const changePercentUpCssClass = "fxs_chg_up";
        const changePercentDownCssClass = "fxs_chg_down";

        _this.createJsonFromMsg = function (msg) {
            var bidMsg = msg.bid ? msg.bid : msg.last;
            var askMsg = msg.ask ? msg.ask : msg.last;

            var result =
            {
                Study:
                {
                    PairName: _this.PairName,
                    PriceProviderCode: _this.PriceProviderCode,
                    PriceStatics:
                    {
                        Volume: msg.volume,
                        Open: getValueFormat(msg.open),
                        Close: getValueFormat(msg.close),
                        High: getValueFormat(msg.high),
                        Low: getValueFormat(msg.low),
                        Last: msg.last,
                        Bid: msg.bid,
                        Ask: msg.ask,
                        BidAsk: null,
                        Change: msg.change,
                        BidBigFigure: getBigFigure(bidMsg),
                        BidSmallFigure: getSmallFigure(bidMsg),
                        AskBigFigure: getBigFigure(askMsg),
                        AskSmallFigure: getSmallFigure(askMsg),
                        ChangePercent: changePercentRounded(msg.changePercent),
                        ChangePercentWithSymbol: changePercentWithSymbol(msg.changePercent),
                        ChangePercentDisplay: changePercentDisplayFormated(msg.changePercent),
                        ChangePercentClass: msg.changePercent > 0 ? changePercentUpCssClass : changePercentDownCssClass,
                        LastClass: getPriceClass(_this.LastPrice, msg.last),
                        BidClass: getPriceClass(_this.LastBid, msg.bid),
                        AskClass: getPriceClass(_this.LastAsk, msg.ask),
                        PriceClass: msg.changePercent > 0 ? priceUpCssClass : priceDownCssClass,
                        ChangeTendencyClass: getChangeTendencyClass(msg.last)
                    }
                }
            };
            updateBidAsk(result.Study.PriceStatics, bidMsg);
            _this.LastPrice = msg.last;
            _this.LastBid = msg.bid;
            _this.LastAsk = msg.ask;
            _this.LastClose = msg.close;

            return result;
        };

        var getPriceClass = function (oldValue, newValue) {
            if (!oldValue || !newValue)
                return;
            var result = parseFloat(newValue) > parseFloat(oldValue) ? priceUpCssClass : priceDownCssClass;
            return result;
        };

        var updateBidAsk = function (priceStatics, msgBid) {
            var lenBig = priceStatics.BidBigFigure != null ? priceStatics.BidBigFigure.length : 0;
            var lenSmall = priceStatics.BidSmallFigure != null ? priceStatics.BidSmallFigure.length : 0;
            var lenTotal = lenBig + lenSmall;
            priceStatics.BidAsk = msgBid.substring(0, msgBid.length - lenTotal);
        };

        var getBigFigure = function (str) {
            var result = null;
            var length = str.length;
            if (hasSmallFigure(str)) {
                length = length - 1;
            }
            var min = Math.min(length, 2);
            result = str.substring(length - min, length);

            return result;
        };
        var getSmallFigure = function (str) {
            var result = null;
            if (hasSmallFigure(str)) {
                result = str.substring(str.length - 1, str.length);
            }
            return result;
        };
        var hasSmallFigure = function (str) {
            var result = str.length > 3;
            return result;
        };
        var changePercentRounded = function (value) {
            if (value) {
                return Math.round(value * 100) / 100;
            }
        };

        var changePercentWithSymbol = function (value) {
            var changePercent = changePercentRounded(value);
            if (changePercent !== undefined) { return changePercent + '%'; }
        };

        var changePercentDisplayFormated = function (value) {
            var changePercent = changePercentRounded(value);
            if (changePercent !== undefined) {
                return '(' + changePercent + '%)';
            }
        };
        var getChangeTendencyClass = function (last) {
            var result = "";
            if (_this.LastPrice !== null &&
                _this.LastPrice !== "" &&
                last !== "" &&
                _this.LastPrice !== last) {
                result = parseFloat(_this.LastPrice) > parseFloat(last)
                    ? changeTendencyUpCssClass : changeTendencyDownCssClass;
            }
            return result;
        };

        var getValueFormat = function (str) {
            if (str) {
                var result = str;
                var indexOf = str.indexOf(".");
                if (indexOf > -1) {
                    result = str.substr(0, (indexOf + 1) + _this.DecimalPlaces);
                }
                return result;
            }
        };

        return _this;
    };
    FXStreet.Class.RateService = function () {
        var parent = FXStreet.Class.Base(),
            _this = FXStreet.Util.extendObject(parent);

        _this.PairName = '';
        _this.PriceProviderCode = '';
        _this.AlreadySubscribed = false;
        _this.ChangeCallback = null;
        _this.DecimalPlaces = 4;

        _this.PushTTObj = null;

        _this.RateMapper = null;

        _this.init = function (json) {
            _this.setSettingsByObject(json);
            _this.setVars();
            _this.RateMapper.init(json);
        };

        _this.setVars = function () {
            _this.PushTTObj = FXStreet.Class.Patterns.Singleton.PushTT.Instance();
            _this.RateMapper = new FXStreet.Class.RateMapper();
        };

        _this.subscribeToChannel = function () {
            _this.PushTTObj.Subscribe([_this.PriceProviderCode], _this.priceChangeCallback);
        };

        _this.unsubscribeToChannel = function () {
            _this.PushTTObj.Unsubscribe([_this.PriceProviderCode], _this.priceChangeCallback);
        };

        _this.initializedCallBack = function () {
            _this.subscribeToChannel();
        };

        _this.priceChangeCallback = function (message) {
            var json = _this.RateMapper.createJsonFromMsg(message);
            if (typeof _this.ChangeCallback === 'function') {
                _this.ChangeCallback(json);
            }
        };
        return _this;
    };
    FXStreet.Class.SingleRateManager = function () {
        var parent = FXStreet.Class.Base(),
            _this = FXStreet.Util.extendObject(parent);

        _this.ContainerId = "";
        _this.HtmlTemplateFile = "";
        _this.PairName = "";
        _this.PriceProviderCode = "";
        _this.MustSubscribeAtInit = false;
        _this.RenderAtInit = false;
        _this.DecimalPlaces = 4;
        _this.SEO = {};
        _this.Translations = {};
        _this.Data = null;

        _this.RateService = null;

        _this.init = function (json) {
            _this.setSettingsByObject(json);
            _this.setVars();
            if (_this.RenderAtInit) {
                _this.render();
            }
            if (_this.MustSubscribeAtInit) {
                _this.Subscribe();
            }
        };

        _this.setVars = function () {
            if (_this.Data != null) {
                _this.PairName = _this.Data.Value.Title;
                _this.PriceProviderCode = _this.Data.Value.PriceProviderCode;
                _this.DecimalPlaces = _this.Data.Value.DecimalPlaces;
            } else {
                _this.Data = {
                    Value: {
                        Title: _this.PairName,
                        PriceProviderCode: _this.PriceProviderCode,
                        SEO: _this.SEO
                    },
                    Translations: _this.Translations
                };
            }

            _this.RateService = _this.createRateService(_this.PairName, _this.PriceProviderCode);
        };

        _this.render = function (jsonRateData) {
            if (jsonRateData != undefined) {
                _this.UpdateRateData(jsonRateData);
            }
            _this.htmlRender(_this.Data);
        };

        _this.htmlRender = function (json) {
            if (_this.ContainerId !== "") {
                _this.Container = FXStreet.Util.getjQueryObjectById(_this.ContainerId, false);

                if (_this.Container && _this.Container.length > 0) {
                    FXStreet.Util.loadHtmlTemplate(_this.HtmlTemplateFile).done(function (template) {
                        var rendered = FXStreet.Util.renderByHtmlTemplate(template, json);
                        var elementToRender = _this.Container.children("[fxs-ratedata-widget]");
                        if (elementToRender.length > 0) {
                            elementToRender[0].outerHTML = rendered;
                        } else {
                            _this.Container.html(rendered);
                        }
                    });
                }
            }
        };

        _this.SingleRateCallback = function (jsonRateData) {
            _this.render(jsonRateData);
        };

        _this.createRateService = function (pairName, priceProviderCode) {
            var rateService = new FXStreet.Class.RateService();
            rateService.init({
                'PairName': pairName,
                'PriceProviderCode': priceProviderCode,
                'DecimalPlaces': _this.DecimalPlaces,
                'ChangeCallback': _this.SingleRateCallback
            });

            return rateService;
        };

        _this.Subscribe = function () {
            _this.RateService.subscribeToChannel();
        };

        _this.Unsubscribe = function () {
            if (_this.RateService != null)
                _this.RateService.unsubscribeToChannel();
        };

        _this.UpdateRateData = function (jsonRateData) {
            if (_this.Data.RateData === undefined) {
                _this.Data.RateData = jsonRateData;
            } else {
                var priceStatics = jsonRateData.Study.PriceStatics;
                for (var data in priceStatics) {
                    if (priceStatics.hasOwnProperty(data) && priceStatics[data] !== undefined) {
                        _this.Data.RateData.Study.PriceStatics[data] = priceStatics[data];
                    }
                }
            }
        };

        return _this;
    };
    FXStreet.Class.MultiRateManager = function () {
        var parent = FXStreet.Class.Base(),
            _this = FXStreet.Util.extendObject(parent);

        _this.ContainerId = "";
        _this.TablePricesId = "fxs_table_prices";
        _this.HtmlTemplateFile = "";
        _this.AssetList = [];
        _this.DefaultAssetList = [];
        _this.MustSubscribeAtInit = false;
        _this.Translations = {};
        _this.DataList = [];

        _this.TitleContainerId = "";
        _this.Title = "";
        _this.ShowHeaders = false;
        _this.Filter = {};
        _this.FilterJson = {};
        _this.FilterManager = null;
        _this.InitialFilterValues = [];
        var userPersonalizationManager = null;

        _this.init = function (json) {
            _this.setSettingsByObject(json);
            _this.setVars();
            _this.render();

            if (_this.MustSubscribeAtInit) {
                subscribe();
            }
        };

        _this.setVars = function () {
            _this.TitleContainerId = "fxs_rate_widget_title_" + _this.ContainerId;

            userPersonalizationManager = FXStreet.Class.Patterns.Singleton.UserPersonalizationManager.Instance();

            $.each(_this.AssetList, function (index, value) {
                value.Service = createRateService(value)
            });

            if (_this.Filter && _this.Filter.ShowFilter) {
                _this.DefaultAssetList = _this.AssetList;
                createFilter();
                _this.AssetList = getAssetListByUserSetting();
            }
            loadData();
        };

        var getAssetListByUserSetting = function () {
            var result = _this.AssetList;
            if (_this.FilterManager != null) {
                var assets = getAssetsUserSetting();
                if (assets && Object.keys(assets).length > 0) {
                    result = convertToAssetList(assets);
                }
            }
            return result;
        };

        var getAssetsUserSetting = function () {
            var result = userPersonalizationManager.GetAssetsMultiRateSetting();
            return result;
        };

        var convertToAssetList = function (assets) {
            var result = [];
            Object.values(assets).forEach(function (asset) {
                var data = convertToDataAsset(asset);
                result.push(data);
            });
            return result;
        };

        var convertToDataAsset = function (data) {
            var baseUrl = _this.DefaultAssetList[0].SEO.FullUrl;
            var result = {
                AssetId: data.id,
                DecimalPlaces: data.decimalPlaces,
                PairName: data.display,
                PriceProviderCode: data.priceProviderCode,
                SEO: {
                    FullUrl: baseUrl.substr(0, baseUrl.lastIndexOf("/") + 1).concat(data.url),
                    MetaDescription: data.display,
                    MetaTitle: data.display,
                    KeyWords: null
                },
                PriceStatics: []
            };
            result.Service = createRateService(result);
            return result;
        };

        var createRateService = function (asset) {
            var result = new FXStreet.Class.RateService();
            result.init({
                'PairName': asset.PairName,
                'PriceProviderCode': asset.PriceProviderCode,
                'DecimalPlaces': asset.DecimalPlaces,
                'ChangeCallback': _this.SingleRateCallback
            });
            return result;
        };

        var loadData = function () {
            _this.DataList = [];
            for (var i = 0; i < _this.AssetList.length; i++) {
                var asset = _this.AssetList[i];
                var data = getDataListItem(asset);
                _this.DataList.push(data);
            }
        };

        var getDataListItem = function (asset) {
            var result = {
                Value: {
                    Title: asset.PairName,
                    PriceProviderCode: asset.PriceProviderCode,
                    DecimalPlaces: asset.DecimalPlaces,
                    SEO: asset.SEO
                },
                Translations: _this.Translations,
                RateData: {
                    Study: {
                        PriceStatics: asset.PriceStatics
                    }
                }
            };
            return result;
        };

        var createFilter = function () {
            var filterSectionId = "price-filter-block_" + _this.ContainerId;
            _this.FilterJson = {
                DefaultAssets: getDefaultValues(),
                FindBy_Options: _this.Filter.FindOptions,
                SelectedAssetsId: "fxs_selected_assets_" + _this.ContainerId,
                ApplyFilterId: "fxs_apply_filter_" + _this.ContainerId,
                ClearFilterId: "fxs_clear_filter_" + _this.ContainerId,
                AdvancedFilterId: "fxs_advanced_filter_" + _this.ContainerId,
                CloseAdvancedFilterId: "fxs_close_filter_" + _this.ContainerId,
                FilterSectionId: filterSectionId,
                GetAssetsUserSettingDelegate: getAssetsUserSetting,
                OptionSelectedDelegate: _this.filterChanged,
                TablePricesId: _this.TablePricesId,
                TypeaheadJsonInitialization:
                {
                    TypeaheadId: "fxs_typeahead_" + _this.ContainerId,
                    TypeaheadInputTargetId: "typeaheadTarget_" + _this.ContainerId,
                    TypeaheadFilterButtonId: "fxs_btn_filter_" + _this.ContainerId,
                    TypeaheadCancelButtonId: "fxs_dismissQuery_" + _this.ContainerId,
                    SelectedTypeaheadId: "",
                    PlaceholderText: _this.Translations.AddPairsToList
                },
                Translations: _this.Translations,
                AssetsAddedId: "fxs_filter_assets_added" + _this.ContainerId,
                ModalContainerId: "fxs_filter_modal" + _this.ContainerId,
                PopupContainerId: "fxs_filter_popup" + _this.ContainerId,
                PopupApplyId: "fxs_filter_popup_apply" + _this.ContainerId,
                PopupCancelId: "fxs_filter_popup_cancel" + _this.ContainerId,
                FilterStateLabelId: _this.TitleContainerId,
                DefaultWidgetTitle: _this.Title
            }

            _this.FilterManager = new FXStreet.Class.RatesFilter();
        };

        var getDefaultValues = function () {
            var result = {};
            $.each(_this.DefaultAssetList, function (index, value) {
                result[value.AssetId] = {
                    display: value.PairName,
                    priceProviderCode: value.PriceProviderCode,
                    decimalPlaces: value.DecimalPlaces,
                    id: value.AssetId,
                    url: value.Url
                };
            });
            return result;
        };

        var initFilter = function () {
            convertFindOptions();
            _this.FilterManager.init(_this.FilterJson);
        };

        var convertFindOptions = function () {
            $.each(_this.Filter.FindOptions,
                function (index, option) {
                    option.FindBy_FxsApiRoute = option.Route;
                });
        };

        _this.filterChanged = function (selectedAssets) {
            var assets = (selectedAssets && Object.keys(selectedAssets).length > 0)
                ? selectedAssets : getDefaultValues();
            removeItemsInAssetList(assets);
            addItemsToAssetList(assets);
            saveUserSetting(selectedAssets);
            loadData();
            renderList();
        };

        var removeItemsInAssetList = function (selectedAssets) {
            $.each(_this.AssetList, function (i, assetItem) {
                if (!selectedAssets.hasOwnProperty(assetItem.AssetId)) {
                    assetItem.Service.unsubscribeToChannel();
                }
            });
            _this.AssetList = [];
        };

        var addItemsToAssetList = function (selectedAssets) {
            $.each(selectedAssets, function (key, value) {
                if ($.grep(_this.AssetList, function (asset) { return asset.AssetId === key; }).length === 0) {
                    var data = convertToDataAsset(value);
                    _this.AssetList.push(data);
                    data.Service.subscribeToChannel();
                }
            });
        };

        var saveUserSetting = function (selectedAssets) {
            if (selectedAssets && Object.keys(selectedAssets).length > 0) {
                var setting = {};
                $.each(selectedAssets, function (key, value) {
                    setting[key] = {
                        display: value.display,
                        decimalPlaces: value.decimalPlaces,
                        priceProviderCode: value.priceProviderCode,
                        id: key,
                        url: value.url
                    };
                });
                userPersonalizationManager.SetAssetsMultiRateSetting(setting);
            }
            else {
                userPersonalizationManager.RemoveAssetsMultiRateSetting();
            }
        };

        var subscribe = function () {
            _this.AssetList.forEach(function (item) {
                item.Service.subscribeToChannel();
            });
        };

        _this.render = function () {
            var json = {
                TitleContainerId: _this.TitleContainerId,
                Title: _this.Title,
                TablePricesId: _this.TablePricesId,
                ShowFilter: _this.Filter.ShowFilter,
                FilterJson: _this.FilterJson,
                ShowHeaders: _this.ShowHeaders,
                Translations: _this.Translations
            };

            if (_this.ContainerId !== "") {
                _this.Container = FXStreet.Util.getjQueryObjectById(_this.ContainerId, false);

                if (_this.Container != null) {
                    var templateFile = _this.HtmlTemplateFile;

                    FXStreet.Util.loadHtmlTemplate(templateFile).done(function (template) {
                        var rendered = FXStreet.Util.renderByHtmlTemplate(template, json);

                        var elementToRender = _this.Container.children("[fxs-ratedata-widget]");
                        if (elementToRender.length > 0) {
                            elementToRender[0].outerHTML = rendered;
                        } else {
                            _this.Container.html(rendered);
                        }
                        if (_this.FilterManager != null) {
                            initFilter();
                        }

                        renderList();
                    });
                }
            }
        };

        var renderRateData = function (jsonRateData) {
            if (jsonRateData != undefined) {
                var datas = $.grep(_this.DataList,
                    function (current) {
                        return current.Value.Title === jsonRateData.Study.PairName;
                    });
                if (datas.length > 0) {
                    var dataToUpdate = datas[0];
                    if (dataToUpdate.RateData === undefined) {
                        dataToUpdate.RateData = jsonRateData;
                    }
                    else {
                        var priceStatics = jsonRateData.Study.PriceStatics;
                        for (var data in priceStatics) {
                            if (priceStatics.hasOwnProperty(data) && priceStatics[data] !== undefined) {
                                dataToUpdate.RateData.Study.PriceStatics[data] = priceStatics[data];
                            }
                        }
                        dataToUpdate.RateData.Study.PriceStatics.DataAvailable = true;
                    }
                    renderAsset(dataToUpdate);
                }
            }
        };

        var renderList = function () {
            if (_this.ContainerId !== "") {
                _this.Container = FXStreet.Util.getjQueryObjectById(_this.ContainerId, false);

                if (_this.Container != null) {
                    _this.Container.find("tbody tr").remove();
                }
            }
            for (var j = 0; j < _this.DataList.length; j++) {
                var data = _this.DataList[j];
                data.ShowHeaders = _this.ShowHeaders;
                renderAsset(data);
            }
        };

        var trEventClick = function () {
            var rows = _this.Container.find(".fxs_widget_price");
            rows.unbind();
            rows.click(function () {
                var href = $(this).data("href");
                if (href) {
                    window.location = href;
                }
            });
        };

        var renderAsset = function (data) {
            if (_this.ContainerId !== "") {
                _this.Container = FXStreet.Util.getjQueryObjectById(_this.ContainerId, false);

                if (_this.Container != null) {
                    var assetName = data.Value.Title;
                    var templateFile = _this.HtmlTemplateFile.replace("multi", "single");
                    FXStreet.Util.loadHtmlTemplate(templateFile).done(function (template) {
                        var json = $.extend(true, data, _this.Translations);

                        var rendered = FXStreet.Util.renderByHtmlTemplate(template, json);

                        var trAsset = _this.Container.find("tr[data-asset-title='" + assetName + "']");
                        if (trAsset.length === 0) {
                            trAsset = $(rendered);
                            _this.Container.find("table").append(trAsset);

                        } else {
                            trAsset[0].outerHTML = rendered;
                        }
                        trEventClick();
                    });
                }
            }
        }

        _this.SingleRateCallback = function (jsonRateData) {
            if (_this.FilterManager == null || !_this.FilterManager.IsOpened) {
                renderRateData(jsonRateData);
            }
        };

        return _this;
    };
    FXStreet.Class.CtpButton = function () {

        _this.Render = function () {
            var result = $('<li>',
            {
                html: 'Current Trading Position',
                click: function () {
                    var idprefix = "ctp_signal_entry_";
                    var idprefixStopLoss = "ctp_signal_entry_stopLoss_";
                    var idprefixTakeProfit1 = "ctp_signal_entry_takeprofit1_";
                    var idprefixTakeProfit2 = "ctp_signal_entry_takeprofit2_";
                    var idprefixTakeProfit3 = "ctp_signal_entry_takeprofit3_";

                    if (ctpSignals.length > 0) {
                        $.each(ctpSignals,
                            function (i, signal) {
                                var line = _this.Chart.tradingLines.getTradingLineById(idprefix + signal.Id);
                                line.remove();
                                if (signal.StopLoss) {
                                    line = _this.Chart.tradingLines.getTradingLineById(idprefixStopLoss + signal.Id);
                                    line.remove();
                                }
                                if (signal.TakeProfit1) {
                                    line = _this.Chart.tradingLines.getTradingLineById(idprefixTakeProfit1 + signal.Id);
                                    line.remove();
                                }
                                if (signal.TakeProfit2) {
                                    line = _this.Chart.tradingLines.getTradingLineById(idprefixTakeProfit2 + signal.Id);
                                    line.remove();
                                }
                                if (signal.TakeProfit3) {
                                    line = _this.Chart.tradingLines.getTradingLineById(idprefixTakeProfit3 + signal.Id);
                                    line.remove();
                                }
                            });
                        ctpSignals = [];
                    } else {
                        var asset = getCurrentAsset();
                        if (asset) {
                            var url = _this.MarketToolsBaseUrl + 'v1/en/ctp/study/?assetids=' + asset.Id;
                            $.ajax(url).done(function (data) {
                                if (data) {
                                    ctpSignals = data.Values[0].Entries;
                                    $.each(ctpSignals,
                                        function (i, signal) {
                                            var isSell = signal.OrderDirection === "SELL" ||
                                                signal.OrderDirection === "SHORT";

                                            var line = _this.Chart.tradingLines
                                                .addLine({ id: idprefix + signal.Id, price: signal.Entry });
                                            var entryCssClass = isSell ? 'fxs_lineChart_sell' : 'fxs_lineChart_buy';
                                            line.settings.setOption("class", entryCssClass);

                                            var objetiveCssClass = !isSell ? 'fxs_lineChart_sell' : 'fxs_lineChart_buy';
                                            if (signal.StopLoss) {
                                                line = _this.Chart.tradingLines
                                                    .addLine({
                                                        id: idprefixStopLoss + signal.Id,
                                                        price: signal.StopLoss
                                                    });
                                                line.settings.setOption("class", objetiveCssClass);
                                            }
                                            if (signal.TakeProfit1) {
                                                line = _this.Chart.tradingLines
                                                    .addLine({
                                                        id: idprefixTakeProfit1 + signal.Id,
                                                        price: signal.TakeProfit1
                                                    });
                                                line.settings.setOption("class", objetiveCssClass);
                                            }
                                            if (signal.TakeProfit2) {
                                                line = _this.Chart.tradingLines
                                                    .addLine({
                                                        id: idprefixTakeProfit2 + signal.Id,
                                                        price: signal.TakeProfit2
                                                    });
                                                line.settings.setOption("class", objetiveCssClass);
                                            }
                                            if (signal.TakeProfit3) {
                                                line = _this.Chart.tradingLines
                                                    .addLine({
                                                        id: idprefixTakeProfit3 + signal.Id,
                                                        price: signal.TakeProfit3
                                                    });
                                                line.settings.setOption("class", objetiveCssClass);
                                            }
                                        });
                                }
                            });
                        }
                    }
                }
            });
            return result;
        };
        return _this;
    };
    FXStreet.Class.ChartService = function () {

        var parent = FXStreet.Class.Base(),
        _this = FXStreet.Util.extendObject(parent);


        _this.Symbols = null;

        _this.ChartId = "";
        _this.PairName = "";
        _this.PriceProviderCode = "";
        _this.WidgetType = "";
        _this.ChartOptions = null;
        _this.EnableCalendar = false;
        _this.EnableNews = false;
        _this.DisplayRSI = false;
        _this.DisplaySMA = false;
        _this.DisplayHistory = false;
        _this.ChartConfiguration = "";
        _this.SoundUrl = "";
        _this.MarketToolsBaseUrl = "";
        _this.PostI3ApiBaseUrl = "";
        _this.CalendarI3ApiBaseUrl = "";
        _this.CustomExtensions = null;
        _this.Chart = null;
        _this.PushTTObj = null;
        _this.loadedChart = false;
        _this.Assets = [];

        _this.init = function (json) {
            if (!FXStreet.ExternalLib.TTChart) {
                console.error("TTChartLibrary is not loaded");
                return;
            }
            _this.CustomExtensions = FXStreet.Class.ChartExtensions();
            _this.setSettingsByObject(json);
            _this.loadAssets();
        };

        _this.loadCalendar = function () {
            _this.CustomExtensions.LoadCalendar();
        }

        _this.loadNews = function (priceProviderCode) {
            _this.CustomExtensions.LoadNews(priceProviderCode);
        }

        _this.mapAssetsToSymbols = function (assets) {
            _this.Symbols = [['*|search|*', '']];
            for (var i = 0; i < assets.length; i++) {
                _this.Symbols.push([assets[i].Name, assets[i].PriceProviderCode]);
            }
        };

        _this.setVars = function () {
            _this.PushTTObj = FXStreet.Class.Patterns.Singleton.PushTT.Instance();
        };

        _this.loadChart = function () {
            _this.setVars();
            initializeChart().then(function () {
                _this.addEvents();
                _this.chartDisplay();

                var customExtensionsSettings = {
                    Assets: _this.Assets,
                    ChartId: _this.ChartId,
                    Chart: _this.Chart,
                    PostI3ApiBaseUrl: _this.PostI3ApiBaseUrl,
                    CalendarI3ApiBaseUrl: _this.CalendarI3ApiBaseUrl,
                    PriceProviderCode: _this.PriceProviderCode,
                    SoundUrl: _this.SoundUrl
                };

                _this.CustomExtensions.init(customExtensionsSettings);
            });
        };

        _this.chartDisplay = function () {
            if (_this.ChartConfiguration) {
                loadChartConfiguration(_this.ChartConfiguration);
            } else {
                _this.Chart.display();
            }
        };

        function loadChartConfiguration(url) {
            $.get(url).done(function (data) {
                _this.Chart.loadChartFromJSON(data);
            });
        }

        function initializeChart() {
            var chartCreationPromise = $.Deferred();
            if (FXStreet.ExternalLib.TTChart) {
                var chart = FXStreet.ExternalLib.TTChart.create({ id: _this.ChartId });
                chartCreationPromise.resolve(chart);
            } else {
                console.log("TTChart as deferred");
                FXStreet.Util.Deferreds.PendingTTChart.push({
                    Deferred: chartCreationPromise,
                    ChartId: _this.ChartId
                });
            }

            return chartCreationPromise.then(function (chart) {
                _this.Chart = chart;
                _this.ChartOptions["dialogs.limitingElementId"] = _this.ChartId;
                _this.ChartOptions["global.verticalAxisZoom"] = true;

                setTimezone();
                _this.Chart.setOptions(_this.ChartOptions);
                _this.Chart.setOption("history.show", _this.DisplayHistory);
                _this.setChartToolbar();
                _this.Chart.symbols.setMainSymbol(_this.PriceProviderCode, _this.PairName);
                _this.addChartIndicators();
            });
        };

        function setTimezone() {
            var timeZoneManager = FXStreet.Class.Patterns.Singleton.TimeZoneManager.Instance();
            var ttTZValue = timeZoneManager.GetTTTimeZoneValue();
            if (ttTZValue) {
                _this.Chart.setOption("data.timeZone", ttTZValue);
            }
        };

        _this.setChartToolbar = function () {
            if (_this.WidgetType === "fxs_widget_full" || _this.WidgetType === "fxs_widget_bigToolbar") {
                _this.Chart.setOption("toolbar.symbols", _this.Symbols);
                _this.Chart.setOption("toolbar.comparisons", _this.Symbols);
                _this.Chart.setOption("toolbar.dateRanges", FXStreet.Util.ChartWidgetConfig.toolbar.dateRanges);
                _this.Chart.setOption("toolbar.file", FXStreet.Util.ChartWidgetConfig.toolbar.file);
                var backgroundImageOpt = FXStreet.Util.ChartWidgetConfig.getBackgroundImage();
                if(backgroundImageOpt){
                    _this.Chart.setOption("main.background.image", backgroundImageOpt);
                }
                _this.Chart.addSettingListener("data.period", _this.periodChanged);
            }
        };

        _this.addChartIndicators = function () {
            if (_this.DisplaySMA === true) {
                _this.Chart.symbols.addIndicator("sma", { period: 100, shift: 0 });
            }
            if (_this.DisplayRSI === true) {
                _this.Chart.symbols.addIndicator("rsi", "14", "70", "30", "1");
            }
        };

        _this.addEvents = function () {
            if (_this.WidgetType === "fxs_widget_full" || _this.WidgetType === "fxs_widget_bigToolbar") {
                _this.Chart.addEventListener("setMainSymbol", _this.setMainSymbol);
                _this.Chart.addEventListener("addComparison", _this.addComparison);
                _this.Chart.addEventListener("comparisonRemove", _this.comparisonRemove);
                _this.Chart.addEventListener("newBarCreated", _this.newBarCreated);
            }
            _this.Chart.addEventListener("eventClicked", _this.CustomExtensions.OnEventClicked);
            _this.Chart.addTemporaryEventListener('display', _this.display);
             _this.Chart.addEventListener("symbolRequested", _this.symbolRequested);
        };

        _this.symbolRequested = function (e) {
            if (console)
                console.log(e);

            var auth = FXStreetAuth.Authorization.getInstance({
                authorizationUrl: FXStreet.Resource.AuthorizationUrl
            });
            auth.getTokenPromise()
                .then(function (token) {
                    var timeZone = _this.Chart.getOption("data.timeZone");
                    var url = FXStreet.Resource.TeletraderPriceProviderUrl
                        + "?request=HISTORY" + ' ' + e.symbolId + ' ' + e.period + ' ' + e.numberOfBars + ' ' + e.dateRange
                        + '&dataLoader=ttws&timeZone=' + encodeURIComponent(timeZone);

                    $.ajax({
                        type: "GET",
                        url: url,
                        beforeSend: function (xhr) {
                            xhr.setRequestHeader("Authorization", token.token_type + ' ' + token.access_token);
                        }
                    }).then(function (historicData) {
                        var candles = [];
                        var candleSplit = historicData.split('\n');
                        for (var i = 1; i < candleSplit.length - 1; i++) {
                            try {
                                const barParts = candleSplit[i].split(';');
                                const isTickFormat = barParts.length < 5;
                                const dt = barParts[0].split('-');

                                var candle = {
                                    dateTime: new Date(dt[0], dt[1] - 1, dt[2], dt[3], dt[4], dt[5] || 0, dt[6] || 0),
                                    open: parseFloat(barParts[1]),
                                    high: parseFloat(barParts[isTickFormat ? 1 : 2]),
                                    low: parseFloat(barParts[isTickFormat ? 1 : 3]),
                                    close: parseFloat(barParts[isTickFormat ? 1 : 4]),
                                    volume: parseFloat(barParts[isTickFormat ? 2 : 5]),
                                    openInterest: parseInt(barParts[6])
                                };
                                candles.push(candle);
                            }
                            catch (ex) {
                                console.log(ex);
                            }
                        }
                        e.setHistory({
                            data: candles
                        });
                    }, function (error) {
                        console.log(error);
                    });
                });
        };

        _this.display = function () {
            if (!_this.loadedChart) {
                _this.loadedChart = true;
                _this.PushTTObj.Subscribe([_this.PriceProviderCode], _this.addTick, _this.WidgetType);
                if (_this.WidgetType === "fxs_widget_full" || _this.WidgetType === "fxs_widget_bigToolbar") {
                    $('div.tt_fullscreen').on('click', fullScreenClick);
                    addChartExportSettingToFile();
                    _this.CustomExtensions.AddButtons();
                }
            }
        };

        _this.hide = function () {
            if (_this.loadedChart) {
                _this.loadedChart = false;
                _this.PushTTObj.Unsubscribe([_this.PriceProviderCode], _this.addTick);
            }
        };

        var fullScreenClick = function () {
            if ($('div.tt_fullscreen').attr('data-checked') === "on") {
                $('.tt_chartContainer').css({
                    "top": "0",
                    "bottom": "0"
                });
                $('.fxs_modal_wrap').css("top", "0");
                $('.fxs_bgHeader').css("z-index", "0");
                $('.fxs_modal_footer').css("z-index", "0");
            } else {
                $('.fxs_modal_wrap').css("top", "45px");
                $('.fxs_bgHeader').css("z-index", "6");
                $('.fxs_modal_footer').css("z-index", "6");
            }
        };

        var addChartExportSettingToFile = function () {
            if (FXStreet.Resource.UserInfo.IsBackendUser === true) {
                var fileMenu = $('.tt_file ul');
                if (fileMenu) {
                    var downloadLi = $('<li/>', { html: 'Download Config' });
                    downloadLi.click(exportConfig);
                    fileMenu.append(downloadLi);
                }
            }
        };

        _this.newBarCreated = function () {
            _this.CustomExtensions.ActivateSound();
        };

        var exportConfig = function () {
            var config = _this.Chart.getChartAsJSON();
            var date = new Date().getTime();
            var fileName = _this.PairName.replace(/\//g, '_') + '_' + date + '.json';

            FXStreet.Util.DownloadFileFromJsonObject(fileName, config);
        };

        _this.addTick = function (msg) {
            if (_this.Chart != null && _this.loadedChart) {
                var tickmsg = {
                    symbolId: msg.symbolId,
                    last: msg.last,
                    dateTime: msg.dateTime,
                    volume: msg.tradeVolume
                };
                _this.Chart.addTick(tickmsg);
                updatePageTitle(msg);
            }
        };

        var updatePageTitle = function (msg) {
            if (_this.WidgetType === "fxs_widget_full" && msg.symbolId === _this.PriceProviderCode) {
                var title = _this.PairName + ': ' + msg.last;
                if (!isNaN(msg.changePercent)) {
                    if (msg.changePercent < 0)
                        title += ' ▼ ';
                    else {
                        title += ' ▲ ';
                    }
                    title += Number(msg.changePercent).toFixed(2) + '%';
                }
                document.title = title + ' - FXStreet';
            }
        };

        _this.setMainSymbol = function (objValue) {
            if (objValue !== "" && objValue != undefined) {
                if (objValue.oldId != undefined) {
                    _this.Chart.clearAllEvents();

                    _this.Chart.setOption("markers.load", false);
                    _this.Chart.setOption("markers.visibleTypes", null);
                    _this.PushTTObj.Unsubscribe([objValue.oldId], _this.addTick);
                    _this.PushTTObj.Subscribe([objValue.id], _this.addTick, _this.WidgetType);

                    _this.PriceProviderCode = objValue.id;
                    _this.PairName = objValue.name;
                }
            }
            _this.CustomExtensions.SetMainSymbol(_this.PriceProviderCode);
            _this.CustomExtensions.ClearExtensions();
        };

        _this.addComparison = function (objValue) {
            if (objValue !== "") {
                _this.PushTTObj.Subscribe([objValue.id.substring(4)], _this.addTick);
            }
        };

        _this.comparisonRemove = function (objValue) {
            if (objValue !== "") {
                _this.PushTTObj.Unsubscribe([objValue.id.substring(4)], _this.addTick);
            }
        };

        _this.periodChanged = function (e) {
            var newRanges = getRangesForPeriod(e.value);
            _this.Chart.setOption("data.dateRange", newRanges.dateRange);
            _this.Chart.setOption("zoom.dateRange", newRanges.zoomRange);
        };

        var getRangesForPeriod = function (period) {
            var numberOfBars = 120;
            var hours = -1;
            var dateRange = '';

            if (period.indexOf('INTRADAY') !== -1) {
                var periodStringSplitted = period.split(' ');
                if (periodStringSplitted.length > 1) {
                    var periodInMinutes = periodStringSplitted[1];
                    var numberOfPeriods = (numberOfBars * 0.8) * parseInt(periodInMinutes);
                    hours = Math.round(numberOfPeriods / 60);
                }
                dateRange = '6m';
            } else if (period === 'DAILY') {
                hours = numberOfBars * 24;
                dateRange = '40y';
            } else if (period === 'WEEKLY') {
                hours = numberOfBars * 7 * 24;
                dateRange = '40y';
            } else if (period === 'MONTHLY') {
                hours = numberOfBars * 30 * 24;
                dateRange = '40y';
            }

            var tickByTickRange = '1d';

            var result = {
                dateRange: dateRange,
                zoomRange: hours === -1
                    ? tickByTickRange
                    : getRangeFromHours(hours)
            }

            return result;
        };

        var getRangeFromHours = function (hours) {
            if (hours < 24) {
                return '1d';
            }

            var days = Math.round(hours / 24);
            if (days < 30) {
                return days.toString() + 'd';
            }

            var months = Math.round(days / 30);
            if (months < 12) {
                return months.toString() + 'm';
            } else {
                var years = Math.round(months / 12);
                return years.toString() + 'y';
            }
        };

        _this.loadAssets = function () {
            FXStreet.Class.Patterns.Singleton.LoadAssets.getInstance()
                .getAssets().then(function (data) {
                    _this.Assets = data.Result;
                    _this.mapAssetsToSymbols(data.Result);
                    _this.loadChart();

                    if (_this.EnableCalendar) _this.loadCalendar();
                    if (_this.EnableNews) _this.loadNews(_this.PriceProviderCode);
                },
                function () {
                    console.error("Error getting assets");

                });
        };

        return _this;
    };
    FXStreet.Class.SingleChartManager = function () {
        var parent = FXStreet.Class.Base(),
            _this = FXStreet.Util.extendObject(parent);

        _this.ContainerId = "";
        _this.WidgetType = "";
        _this.PairName = "";
        _this.PriceProviderCode = "";
        _this.HtmlTemplateFile = "";
        _this.BigChartUrl = "";
        _this.DisplayRSI = false;
        _this.DisplaySMA = false;
        _this.DisplayBigChartUrl = false;
        _this.EnableZoomOnChart = false;
        _this.TouchAvailable = false;
        _this.ExternalUrl = "";
        _this.DisplayHistory = false;
        _this.ChartConfiguration = "";
        _this.SoundUrl = "";
        _this.MarketToolsBaseUrl = "";
        _this.PostI3ApiBaseUrl = "";
        _this.CalendarI3ApiBaseUrl = "";
        _this.Translations = null;
        _this.CustomChartHigh = 0;
        _this.EnableCalendar = false;
        _this.EnableNews = false;
        _this.AssetId = "";

        _this.ChartService = null;
        _this.ChartId = "";
        _this.AlreadySubscribed = false;

        _this.init = function (json) {
            _this.setSettingsByObject(json);
            _this.setVars();
            _this.preRender();
        };

        _this.setVars = function () {
            _this.ChartId = "fxs_chartwidget_" + _this.ContainerId;
            if (_this.WidgetType === null || _this.WidgetType === "") {
                _this.WidgetType = _this.getWidgetTypeByHtmlTemplate(_this.HtmlTemplateFile);
            }
            if (_this.HtmlTemplateFile === null || _this.HtmlTemplateFile === "") {
                _this.HtmlTemplateFile = FXStreet.Util.ChartWidgetConfig.WidgetHtmlTemplateFile[_this.WidgetType];
            }
        };

        _this.getWidgetTypeByHtmlTemplate = function (htmlTemplateFile) {
            var widgetType = "";
            var files = FXStreet.Util.ChartWidgetConfig.WidgetHtmlTemplateFile;
            for (var type in files) {
                if (files.hasOwnProperty(type) && files[type] === htmlTemplateFile) {
                    widgetType = type;
                }
            }
            return widgetType;
        };

        _this.preRender = function () {
            if (_this.ContainerId) {
                _this.Container = FXStreet.Util.getjQueryObjectById(_this.ContainerId, false);
                var externalUrl = "";


                if (_this.ExternalUrl)
                    externalUrl = _this.ExternalUrl.toLowerCase();
                //externalUrl = FXStreet.Util.isMobileDevice() === false ? _this.ExternalUrl.toLowerCase() : FXStreet.Util.getBigChartMobileUrl(_this.ExternalUrl, _this.PriceProviderCode)

                var translations = (FXStreet.Resource.Translations["ChartSingleAsset_Widget"])
                                        ? FXStreet.Resource.Translations["ChartSingleAsset_Widget"]
                                        : _this.Translations;
                var json = {
                    Value: {
                        ContainerId: _this.ContainerId,
                        ChartId: _this.ChartId,
                        BigChartUrl: _this.BigChartUrl.toLowerCase(),
                        //BigChartUrl: FXStreet.Util.isMobileDevice() === false ? _this.BigChartUrl.toLowerCase() : FXStreet.Util.getBigChartMobileUrl(_this.BigChartUrl, _this.PriceProviderCode),
                        DisplayBigChartUrl: _this.DisplayBigChartUrl,
                        EnableZoomOnChart: _this.EnableZoomOnChart,
                        TouchAvailable: _this.TouchAvailable,
                        ExternalUrl: externalUrl,
                        BrowserHeight: _this.getBrowserHeight(),
                        CustomChartHigh: _this.CustomChartHigh
                    },
                    Translations: translations
                };

                if (_this.Container) {
                    FXStreet.Util.loadHtmlTemplate(_this.HtmlTemplateFile).done(function (template) {
                        var rendered = FXStreet.Util.renderByHtmlTemplate(template, json);
                        _this.Container[0].outerHTML = rendered;
                        _this.ForceRefresh();
                    });
                }
            }
        };

        _this.getBrowserHeight = function () {

            var footerAdWidget = 30;
            var menusSiteHeight = 51;
            var alertHeight = 50;
            var heightOffset = 50;

            if ($('.fxs_global_alert.in').length>0){
                heightOffset += alertHeight;
            }

            var result = $(window).height() - (menusSiteHeight + footerAdWidget + heightOffset);
            return result;
        }

        _this.chartServiceInit = function () {
            _this.ChartService = FXStreet.Class.ChartService();

            var chartConfig = FXStreet.Util.ChartWidgetConfig.WidgetOptions[_this.WidgetType];

            _this.ChartService.init({
                'ChartId': _this.ChartId,
                'ChartOptions': chartConfig,
                'PairName': _this.PairName,
                'PriceProviderCode': _this.PriceProviderCode,
                'WidgetType': _this.WidgetType,
                'DisplayRSI': _this.DisplayRSI,
                'DisplaySMA': _this.DisplaySMA,
                'DisplayHistory': _this.DisplayHistory,
                'ChartConfiguration': _this.ChartConfiguration,
                'AssetTagId': _this.AssetTagId,
                'SoundUrl': _this.SoundUrl,
                'MarketToolsBaseUrl': _this.MarketToolsBaseUrl,
                'PostI3ApiBaseUrl': _this.PostI3ApiBaseUrl,
                'CalendarI3ApiBaseUrl': _this.CalendarI3ApiBaseUrl,
                'EnableCalendar': _this.EnableCalendar,
                'EnableNews': _this.EnableNews
            });
        };

        _this.ForceRefresh = function () {
            var interval = setInterval(function () {
                if ($('#' + _this.ChartId).is(':visible')) {
                    _this.chartServiceInit();
                    clearInterval(interval);
                }
            }, 2500);
        };

        _this.display = function (display) {
            if (_this.ChartService) {
                if (display) {
                    _this.ChartService.display();
                }
                else {
                    _this.ChartService.hide();
                }
            }
        };

        return _this;
    };
    FXStreet.Util.ChartWidgetConfig = {
        getBackgroundImage: function(){
            var result;
            if(FXStreet.Resource.StaticContentImage){
                result = { 
                    filename: FXStreet.Resource.StaticContentImage + "icons/logo_watermark_FXS.png", 
                    alpha: 0.5, 
                    valign: 'bottom', 
                    paddingLeft: 15, 
                    align: 'left', 
                    paddingBottom: 15
                }
            }
            return result;
        },
        WidgetOptions: {
            fxs_widget_default: {
                "global.locale": "en",
                "data.period": 'INTRADAY 60',
                "data.numberOfBars": 200,
                "grid.show": true,
                "main.chartType": 'candle',
                "main.lineColor": "rgba(206, 71, 53, 1)",
                "main.areaColors": ["rgba(206, 71, 53, 1)", "rgba(206, 71, 53, 0)"],
                "main.risingColor": "#338473",
                "main.fallingColor": "#D25746",
                "volume.show": false,
                "history.show": false,
                "history.sliderBorderColor": "#fff",
                "dataInfo.show": false,
                "toolbar.top.show": false,
                "toolbar.left.show": false,
                "toolbar.top.items": [],
                "toolbar.left.items": [],
                "contextMenu.show": false,
                "data.usePush": false,
                "panel.background.color": "#F7F7F7",
                "data.maxAdditionalBars": 200,
                'data.emptySpaceRight': false,
                'data.dynamicHistoryLoading': false,
                'dialogs.limitingElementId': '',
                "markers.eventTypes": ["news", "calendarEvents"]
            },
            fxs_widget_big: {
                "global.locale": "en",
                "data.period": 'INTRADAY 60',
                "data.numberOfBars": 200,
                "grid.show": true,
                "main.chartType": 'candle',
                "main.lineColor": "rgba(206, 71, 53, 1)",
                "main.areaColors": ["rgba(206, 71, 53, 1)", "rgba(206, 71, 53, 0)"],
                "main.risingColor": "#338473",
                "main.fallingColor": "#D25746",
                "volume.show": false,
                "history.show": false,
                "history.sliderBorderColor": "#fff",
                "dataInfo.show": false,
                "toolbar.top.show": false,
                "toolbar.left.show": false,
                "toolbar.top.items": [],
                "toolbar.left.items": [],
                "contextMenu.show": false,
                "data.usePush": false,
                "panel.background.color": "#F7F7F7",
                "data.maxAdditionalBars": 200,
                'data.emptySpaceRight': false,
                'data.dynamicHistoryLoading': false,
                'dialogs.limitingElementId': '',
                "markers.eventTypes": ["news", "calendarEvents"]
            },
            fxs_widget_mini: {
                "global.locale": "en",
                "data.period": 'INTRADAY 60',
                "data.numberOfBars": 200,
                "grid.show": true,
                "main.chartType": 'candle',
                "main.lineColor": "rgba(206, 71, 53, 1)",
                "main.areaColors": ["rgba(206, 71, 53, 1)", "rgba(206, 71, 53, 0)"],
                "volume.show": false,
                "history.show": false,
                "history.sliderBorderColor": "#fff",
                "dataInfo.show": false,
                "toolbar.top.show": false,
                "toolbar.left.show": false,
                "toolbar.top.items": [],
                "toolbar.left.items": [],
                "contextMenu.show": false,
                "data.usePush": false,
                "panel.background.color": "#F7F7F7",
                "data.maxAdditionalBars": 200,
                'data.dynamicHistoryLoading': false,
                'dialogs.limitingElementId': '',
                'data.emptySpaceRight': false,
                "markers.eventTypes": ["news", "calendarEvents"]
            },
            fxs_widget_full: {
                "global.locale": "en",
                "data.period": 'INTRADAY 15',
                "data.numberOfBars": 5000,
                "data.dateRange": '6m',
                "grid.show": true,
                "main.chartType": 'candle',
                "main.lineColor": "rgba(206, 71, 53, 1)",
                "main.areaColors": ["rgba(206, 71, 53, 1)", "rgba(206, 71, 53, 0)"],
                "main.risingColor": "#338473",
                "main.fallingColor": "#D25746",
                "volume.show": false,
                "history.show": false,
                "history.sliderBorderColor": "#fff",
                "dataInfo.show": true,
                "toolbar.top.show": true,
                "toolbar.left.show": true,
                "toolbar.top.items": ["file", "symbols", "periods", "chartType", "comparisons", "logarithmicScale", "relativeScale", "zeroPointTool", ["volume", "history", "dataInfo", "showMinMax"], ["last", "crosshair", "crosshairlast"], , "indicators", 'reload', 'zoomIn', 'zoomOut', 'print', 'exportPng', /*'popup', */ 'fullscreen'],
                "toolbar.left.items": ["dt_hand", ["dt_line", "dt_horizLine", "dt_trendChannel"], ["dt_rectangle", "dt_circle"], ["dt_fibFan", "dt_fibVertRet", "dt_fibRet", "dt_fibArc"], "dt_andrewsPitch", ["dt_regressionLine", "dt_regressionChannel"], ["dt_arrow_up", "dt_arrow_down"], "dt_text", 'dt_delete', 'dt_drawRepeatedly'],
                "contextMenu.show": false,
                "data.usePush": false,
                "panel.background.color": "#F7F7F7",
                "data.maxAdditionalBars": 1000,
                'data.dynamicHistoryLoading': true,
                'zoom.dateRange': '1d',
                'dialogs.limitingElementId': '',
                "markers.load": true,
                "markers.eventTypes": ["news", "calendarEvents"],
                'data.extendedTimeRegion': 5,
                'data.emptySpaceRight': true
            },
            fxs_widget_bigToolbar: {
                "global.locale": "en",
                "data.period": 'INTRADAY 15',
                "data.numberOfBars": 1000,
                "data.dateRange": '6m',
                "grid.show": true,
                "main.chartType": 'candle',
                "main.lineColor": "rgba(206, 71, 53, 1)",
                "main.areaColors": ["rgba(206, 71, 53, 1)", "rgba(206, 71, 53, 0)"],
                "main.risingColor": "#338473",
                "main.fallingColor": "#D25746",
                "volume.show": false,
                "history.show": false,
                "history.sliderBorderColor": "#fff",
                "dataInfo.show": true,
                "toolbar.top.show": true,
                "toolbar.left.show": true,
                "toolbar.top.items": ["file", "symbols", "periods", "chartType", "comparisons", "logarithmicScale", "relativeScale", "zeroPointTool", ["volume", "history", "dataInfo", "showMinMax"], ["last", "crosshair", "crosshairlast"], , "indicators", 'reload', 'zoomIn', 'zoomOut', 'print', 'exportPng', /*'popup', */ 'fullscreen'],
                "toolbar.left.items": ["dt_hand", ["dt_line", "dt_horizLine", "dt_trendChannel"], ["dt_rectangle", "dt_circle"], ["dt_fibFan", "dt_fibVertRet", "dt_fibRet", "dt_fibArc"], "dt_andrewsPitch", ["dt_regressionLine", "dt_regressionChannel"], ["dt_arrow_up", "dt_arrow_down"], "dt_text", 'dt_delete', 'dt_drawRepeatedly'],
                "contextMenu.show": false,
                "data.usePush": false,
                "panel.background.color": "#F7F7F7",
                "data.maxAdditionalBars": 1000,
                'data.dynamicHistoryLoading': true,
                'zoom.dateRange': '1d',
                'dialogs.limitingElementId': '',
                "markers.load": true,
                "markers.eventTypes": ["news", "calendarEvents"],
                'data.extendedTimeRegion': 5,
                'data.emptySpaceRight': true
            },
            fxs_widget_cag: {
                "global.locale": "en",
                "data.period": 'INTRADAY 15',
                "data.numberOfBars": 50,
                "grid.show": true,
                "main.chartType": 'candle',
                "main.lineColor": "rgba(206, 71, 53, 1)",
                "main.areaColors": ["rgba(206, 71, 53, 1)", "rgba(206, 71, 53, 0)"],
                "main.risingColor": "#338473",
                "main.fallingColor": "#D25746",
                "volume.show": false,
                "history.show": false,
                "history.sliderBorderColor": "#fff",
                "dataInfo.show": false,
                "toolbar.top.show": false,
                "toolbar.left.show": false,
                "toolbar.top.items": [],
                "toolbar.left.items": [],
                "contextMenu.show": false,
                "data.usePush": false,
                "panel.background.color": "#F7F7F7",
                "data.maxAdditionalBars": 200,
                'data.emptySpaceRight': false,
                'data.dynamicHistoryLoading': false,
                'dialogs.limitingElementId': '',
                "markers.eventTypes": ["news", "calendarEvents"]
            },
        },
        WidgetHtmlTemplateFile: {
            fxs_widget_default: "chartwidget_default.html",
            fxs_widget_big: "chartwidget_big.html",
            fxs_widget_bigToolbar: "chartwidget_bigToolbar.html",
            fxs_widget_mini: "chartwidget_mini.html",
            fxs_widget_full: "chartwidget_full.html",
            fxs_widget_cag: "chartwidget_cag.html"
        },
        toolbar: {
            comparisons: "",
            file: [['*|menu_load|*', 'load'], ['*|menu_save|*', 'saveDefault']]
        }
    };
    FXStreet.Class.ChartExtensions = function () {

        var parent = FXStreet.Class.Base(),
            _this = FXStreet.Util.extendObject(parent);

        _this.SoundUrl = null;
        _this.Chart = null;
        _this.ChartId = null;
        _this.Assets = null;
        _this.PostI3ApiBaseUrl = null;
        _this.CalendarI3ApiBaseUrl = null;

        _this.NewsExtension = null;
        _this.CalendarExtension = null;
        _this.SoundExtension = null;
        _this.PriceProviderCode = null;

        //Translations:>
        _this.CalendarEventsButtonText = " Calendar";
        _this.NewsExtensionText = " News";

        _this.EventExtensions = null;

        _this.init = function (json) {
            _this.setSettingsByObject(json);
            _this.setVars();
        };

        _this.setVars = function () {

            _this.NewsExtension = FXStreet.Class.NewsExtension();
            var newsJson = {
                Chart: _this.Chart,
                ChartId: _this.ChartId,
                Assets: _this.Assets,
                PostI3ApiBaseUrl: _this.PostI3ApiBaseUrl,
                NewsExtensionText: _this.NewsExtensionText,
                PriceProviderCode: _this.PriceProviderCode
            };

            _this.NewsExtension.init(newsJson);

            _this.CalendarExtension = FXStreet.Class.CalendarExtension();
            var calendarEventJson = {
                Chart: _this.Chart,
                ChartId: _this.ChartId,
                Assets: _this.Assets,
                CalendarI3ApiBaseUrl: _this.CalendarI3ApiBaseUrl,
                CalendarEventsButtonText: _this.CalendarEventsButtonText
            };

            _this.CalendarExtension.init(calendarEventJson);
            _this.SoundExtension = FXStreet.Class.SoundExtension();

            _this.EventExtensions = FXStreet.Class.EventExtensions();

            var chartEventExtension = { Chart: _this.Chart };
            _this.EventExtensions.init(chartEventExtension);

        }

        _this.LoadCalendar = function () {
            _this.CalendarExtension.LoadCalendarEvents();
        }

        _this.LoadNews = function (priceProviderCode) {
            _this.NewsExtension.LoadNews(priceProviderCode);
        }

        _this.OnEventClicked = function (obj) {
            if (obj.type === _this.NewsExtension.EventType) _this.NewsExtension.OnClickedEvent(obj);
            if (obj.type === _this.CalendarExtension.EventType) _this.CalendarExtension.OnClickedEvent();
        };

        _this.AddButtons = function () {
            var ttTopToolbar = FXStreet.Util.getjQueryObjectById(_this.ChartId).find('.tt_topToolbar');
            if (ttTopToolbar) {
                var fxsNewsExtension = _this.NewsExtension.Render();
                $('.tt_addIndicator').after(fxsNewsExtension);
            }
            var fxsSound = _this.SoundExtension.Render();
            ttTopToolbar.append(fxsSound);
        };

        _this.ActivateSound = function () {
            _this.SoundExtension.ActivateSound();
        };

        _this.SetMainSymbol = function (symbol) {
            _this.NewsExtension.SetMainSymbol(symbol);
        }
        _this.ClearExtensions = function () {
            _this.NewsExtension.Clear();
            _this.CalendarExtension.Clear();
        }

        return _this;
    };
    FXStreet.Class.EventExtensions = function () {

        var parent = FXStreet.Class.Base(),
        _this = FXStreet.Util.extendObject(parent);
        _this.Chart = null;

        _this.init = function (json) {
            _this.setSettingsByObject(json);
        };

        _this.DisplayEvents = function (eventType) {
            var visibleTypes = _this.Chart.getOption("markers.visibleTypes");
            if (!visibleTypes) visibleTypes = [];

            if (visibleTypes.indexOf(eventType) === -1) { visibleTypes.push(eventType); }

            _this.Chart.setOption("markers.visibleTypes", visibleTypes);
            _this.Chart.display();
        }

        _this.HideEvents = function (eventType) {
            var visibleTypes = _this.Chart.getOption("markers.visibleTypes");
            if (!visibleTypes) visibleTypes = [];

            var indexEventType = visibleTypes.indexOf(eventType);
            if (indexEventType > -1) { visibleTypes.splice(indexEventType, 1); }

            _this.Chart.setOption("markers.visibleTypes", visibleTypes);
            _this.Chart.display();
        }

        return _this;
    };
    FXStreet.Class.NewsExtension = function () {

        var parent = FXStreet.Class.Base(),
            _this = FXStreet.Util.extendObject(parent);

        _this.news = [];
        _this.NewsExtensionText = "";
        _this.IsActive = false;
        _this.Chart = null;
        _this.Assets = null;
        _this.PostI3ApiBaseUrl = null;
        _this.EventType = "news";
        _this.PriceProviderCode = null;
        _this.EventExtensions = null;

        _this.init = function (json) {
            _this.setSettingsByObject(json);
            _this.setVars();
        };

        _this.setVars = function () {
            _this.EventExtensions = FXStreet.Class.EventExtensions();

            var data = { Chart: _this.Chart };
            _this.EventExtensions.init(data);
        }

        _this.SetMainSymbol = function (symbol) {
            _this.PriceProviderCode = symbol;
        };

        _this.OnClickedEvent = function (obj) {
            var markers = $.grep(_this.news, function (item) { return item.PostId === obj.id; });
            if (markers.length > 0) {
                window.open(markers[0].Url);
            }
        };

        _this.Clear = function () {
            _this.IsActive = false;
            _this.news = [];
        }

        _this.LoadNews = function (priceProviderCode) {
            if (priceProviderCode) _this.PriceProviderCode = priceProviderCode;
            _this.EventExtensions.DisplayEvents(_this.EventType);

            var asset = getCurrentAsset();

            if (asset && asset.TagIds !== undefined && asset.TagIds.length > 0) {
                var url = _this.PostI3ApiBaseUrl + '/v3/en/article/filter/GeneralFeed/' + asset.TagIds[0];

                $.ajax(url).done(function (data) {
                    if (data) {
                        var markers = [];
                        _this.news = data.Articles;
                        $.each(_this.news,
                            function (i, newsItem) {
                                var date = FXStreet.Util
                                    .ConvertUtcDateToCurrentTimeZone(newsItem.PublishDate);
                                markers.push({
                                    'id': newsItem.PostId,
                                    'type': _this.EventType,
                                    'dateTime': date,
                                    'text': newsItem.Title
                                });
                            });

                        var jsonStr = JSON.stringify(markers);

                        _this.Chart.addEvents(jsonStr, _this.PriceProviderCode);
                        _this.Chart.setOption("markers.news.displayLetter", 'N');
                        _this.Chart.display();
                    }
                });
            }
        }
        _this.Render = function () {

            var newsText = _this.NewsExtensionText;
            var newsIcon = $('<i>').addClass('fa fa-newspaper-o fa-lg').attr('aria-hidden', 'true');

            var result = $('<div>',
            {
                click: function () {
                    if (_this.IsActive) {
                        _this.IsActive = false;
                        _this.EventExtensions.HideEvents(_this.EventType);
                    } else {
                        _this.IsActive = true;
                        if (!_this.news || _this.news.length === 0) {
                            _this.LoadNews();
                        } else {
                            _this.EventExtensions.DisplayEvents(_this.EventType);
                        }
                    }
                },
                "class": 'fxs_chart_icon'
            }).append(newsIcon).append(newsText);
            return result;
        };

        var getCurrentAsset = function () {
            var result = null;
            var assets = $.grep(_this.Assets,
                function (item) { return item.PriceProviderCode === _this.PriceProviderCode; });
            if (assets.length > 0) {
                result = assets[0];
            }
            return result;
        };

        return _this;
    };
    FXStreet.Class.SoundExtension = function () {

        var parent = FXStreet.Class.Base(),
        _this = FXStreet.Util.extendObject(parent);

        var soundObj = null;
        var soundIsActive = false;

        _this.Render = function () {
            var result = $('<div>', {
                title: 'Sound alert on closed candle',
                style: 'background-image:url(' + FXStreet.Resource.StaticContentImage + 'icons/icon_volume_off.png' + ')',
                click: function () {
                    soundIsActive = !soundIsActive;
                    if (soundIsActive) {
                        result.css('background-image', 'url(' + FXStreet.Resource.StaticContentImage + 'icons/icon_volume_on.png' + ')');
                    }
                    else {
                        result.css('background-image', 'url(' + FXStreet.Resource.StaticContentImage + 'icons/icon_volume_off.png' + ')');
                    }
                }
            });
            return result;
        };

        _this.ActivateSound = function () {
            if (soundIsActive) {
                if (soundObj === null) {
                    soundObj = new FXStreet.Class.Sound();
                    soundObj.init({ SoundUrl: _this.SoundUrl });
                }
                soundObj.playSound();
            }
        };

        return _this;
    };
    FXStreet.Class.CalendarExtension = function () {

        var parent = FXStreet.Class.Base(),
        _this = FXStreet.Util.extendObject(parent);

        _this.calendarEvents = [];
        _this.Chart = null;
        _this.IsActive = false;
        _this.ChartId = null;
        _this.CalendarI3ApiBaseUrl = null;
        _this.EventExtensions = null;

        _this.CalendarEventsButtonText = "";
        _this.EventType = "calendarEvents";

        _this.init = function (json) {
            _this.setSettingsByObject(json);
            _this.setVars();
        };

        _this.setVars = function () {
            _this.EventExtensions = FXStreet.Class.EventExtensions();

            var data = { Chart: _this.Chart };
            _this.EventExtensions.init(data);
        }

        _this.OnClickedEvent = function () {
            //window.open();
        };

        _this.Clear = function () {
            _this.IsActive = false;
            _this.calendarEvents = [];
        }

        _this.LoadCalendarEvents = function () {
            var currentCulture = FXStreet.Resource.CultureName;

            var url = _this.CalendarI3ApiBaseUrl + 'eventdate/?view=day&f=json&culture=' + currentCulture;
            _this.Chart.setOption("markers.calendarEvents.displayLetter", 'E');

            $.ajax(url).done(function (data) {
                if (data) {
                    var markers = [];
                    _this.calendarEvents = data;
                    $.each(_this.calendarEvents,
                        function (i, calendarEvent) {
                            var date = FXStreet.Util.ConvertUtcDateToCurrentTimeZone(calendarEvent.DateTime.Date);
                            markers.push({
                                'id': calendarEvent.IdEcoCalendarDate,
                                'type': _this.EventType,
                                'dateTime': date,
                                'text': calendarEvent.Country + ': ' + calendarEvent.Name
                            });
                        });
                    var jsonStr = JSON.stringify(markers);
                    _this.Chart.addEvents(jsonStr, _this.PriceProviderCode);
                    _this.EventExtensions.DisplayEvents(_this.EventType);
                }

            });
        }

        _this.Render = function () {
            var calendarText = _this.CalendarEventsButtonText;
            var calendarIcon = $('<i>').addClass('fa fa-calendar fa-lg').attr('aria-hidden', 'true');
            var result = $('<div>',
                {
                    click: function () {
                        if (_this.IsActive) {
                            _this.IsActive = false;
                            _this.EventExtensions.HideEvents(_this.EventType);
                        } else {
                            _this.IsActive = true;
                            if (!_this.calendarEvents || _this.calendarEvents.length === 0) {
                                _this.LoadCalendarEvents();
                            } else {
                                _this.EventExtensions.DisplayEvents(_this.EventType);
                            }
                        }
                    },
                    "class": 'fxs_chart_icon'
                }).append(calendarIcon).append(calendarText);
            return result;
        };
        return _this;
    };
}());