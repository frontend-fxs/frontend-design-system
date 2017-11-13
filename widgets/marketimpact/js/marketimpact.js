(function () {
    FXStreetWidgets.Widget.Base = function (loaderBase) {
        var _this = {};

        _this.Container = FXStreetWidgets.Widget.Base.prototype.Container;
        _this.loaderBase = loaderBase;
        _this.data = FXStreetWidgets.Widget.Base.prototype.data;
        _this.interval = FXStreetWidgets.Widget.Base.prototype.interval;
        _this.init = FXStreetWidgets.Widget.Base.prototype.init;
        _this.setSettingsByObject = FXStreetWidgets.Widget.Base.prototype.setSettingsByObject;
        _this.addEvents = FXStreetWidgets.Widget.Base.prototype.addEvents;
        _this.setVars = FXStreetWidgets.Widget.Base.prototype.setVars;
        _this.loadData = FXStreetWidgets.Widget.Base.prototype.loadData;
        _this.loadDataFromUrl = FXStreetWidgets.Widget.Base.prototype.loadDataFromUrl;
        _this.setDatesToJson = FXStreetWidgets.Widget.Base.prototype.setDatesToJson;
        _this.renderHtml = FXStreetWidgets.Widget.Base.prototype.renderHtml;
        _this.log = FXStreetWidgets.Widget.Base.prototype.log;
        _this.jsonDataIsValid = FXStreetWidgets.Widget.Base.prototype.jsonDataIsValid;
        _this.handleJsonInvalidData = FXStreetWidgets.Widget.Base.prototype.handleJsonInvalidData;

        return _this;
    };
    FXStreetWidgets.Widget.Base.prototype.Container = null;
    FXStreetWidgets.Widget.Base.prototype.loaderBase = null;
    FXStreetWidgets.Widget.Base.prototype.data = null;
    FXStreetWidgets.Widget.Base.prototype.interval = null;
    FXStreetWidgets.Widget.Base.prototype.init = function (json) {
        this.setSettingsByObject(json);
    };
    FXStreetWidgets.Widget.Base.prototype.setSettingsByObject = function (json) {
        for (var propName in json) {
            if (json.hasOwnProperty(propName)) {
                if (this[propName] !== undefined) {
                    this[propName] = json[propName];
                }
            }
        }
    };
    FXStreetWidgets.Widget.Base.prototype.addEvents = function () { };
    FXStreetWidgets.Widget.Base.prototype.setVars = function () { };
    FXStreetWidgets.Widget.Base.prototype.loadData = function (request) {
        this.loadDataFromUrl(this.loaderBase.config.EndPoint, request);
    };
    FXStreetWidgets.Widget.Base.prototype.loadDataFromUrl = function (url, request) {
        var _this = this;
        FXStreetWidgets.Util.ajaxJsonGetter(url, request)
            .done(function (data) {
                if (!_this.jsonDataIsValid(data)) {
                    _this.handleJsonInvalidData();
                    return;
                }
                _this.data = data;
                if (_this.loaderBase.isReady()) {
                    _this.log("start renderHtml for: " + _this.loaderBase.config.WidgetName);
                    _this.renderHtml();
                } else {
                    _this.interval = setInterval(function () {
                        if (_this.loaderBase.isReady()) {
                            clearInterval(_this.interval);
                            _this.log("start renderHtml for: " + _this.loaderBase.config.WidgetName);
                            _this.renderHtml();
                        }
                    }, _this.intervalTimeToWaitForReady);
                }
            });
            //.fail(function () {
            //    _this.handleJsonInvalidData();
            //});
    };
    FXStreetWidgets.Widget.Base.prototype.setDatesToJson = function (json, dateResponse) {
        var date = FXStreetWidgets.Util.formatDate(dateResponse);
        json.LastUpdatedDate = dateResponse;
        json.LastUpdatedHour = date;
        return json;
    };
    FXStreetWidgets.Widget.Base.prototype.renderHtml = function () { };
    FXStreetWidgets.Widget.Base.prototype.log = function(msg) {
        FXStreetWidgets.Util.log(msg);
    };
    FXStreetWidgets.Widget.Base.prototype.jsonDataIsValid = function (data) {
        var result = FXStreetWidgets.Util.isValid(data)
                    && FXStreetWidgets.Util.arrayIsValid(data.Values)
                    && FXStreetWidgets.Util.isValid(data.Values[0]);
        return result;
    };
    FXStreetWidgets.Widget.Base.prototype.handleJsonInvalidData = function () {
        var _this = this;
        var noDataMessage = _this.loaderBase.config.Translations['NoDataAvailable'];
        if (!FXStreetWidgets.Util.isValid(noDataMessage)) {
            noDataMessage = 'No data available';
        }
        _this.Container.html(noDataMessage);
    };
}());
(function ($) {
    FXStreetWidgets.Widget.LoaderBase = function (options) {
        var _this = {};

        _this.options = options;
        _this.config = FXStreetWidgets.Widget.LoaderBase.prototype.config;
        _this.isReady = FXStreetWidgets.Widget.LoaderBase.prototype.isReady;
        _this.isReadyCustomCheck = FXStreetWidgets.Widget.LoaderBase.prototype.isReadyCustomCheck;
        _this.initConfiguration = FXStreetWidgets.Widget.LoaderBase.prototype.initConfiguration;
        _this.getContainer = FXStreetWidgets.Widget.LoaderBase.prototype.getContainer;
        _this.getHost = FXStreetWidgets.Widget.LoaderBase.prototype.getHost;
        _this.getVersion = FXStreetWidgets.Widget.LoaderBase.prototype.getVersion;
        _this.getCustomJs = FXStreetWidgets.Widget.LoaderBase.prototype.getCustomJs;
        _this.getSharedJs = FXStreetWidgets.Widget.LoaderBase.prototype.getSharedJs;
        _this.getEndPoint = FXStreetWidgets.Widget.LoaderBase.prototype.getEndPoint;
        _this.getEndPointTranslation = FXStreetWidgets.Widget.LoaderBase.prototype.getEndPointTranslation;
        _this.initWidgets = FXStreetWidgets.Widget.LoaderBase.prototype.initWidgets;
        _this.log = FXStreetWidgets.Widget.LoaderBase.prototype.log;
        _this.chartLibrariesAreLoaded = FXStreetWidgets.Widget.LoaderBase.prototype.chartLibrariesAreLoaded;
        _this.getDefaultHost = FXStreetWidgets.Widget.LoaderBase.prototype.getDefaultHost;

        _this.mustachesCount = 0;
        _this.mustachesLoadedCount = 0;
        _this.customJsCount = 0;
        _this.customJsLoadedCount = 0;
        _this.sharedJsCount = 0;
        _this.sharedJsLoadedCount = 0;
        _this.translationsLoaded = false;
        _this.haveCustomJs = false;
        _this.haveSharedJs = false;

        _this.init = function () {
            if (!FXStreetWidgets.Util.isValid(_this.options)
                || !FXStreetWidgets.Util.isValid(_this.options.WidgetName)
                || !_this.options.WidgetName.trim()) {
                _this.log("unable to load fxswidget options bad configure.");
                return;
            }

            FXStreetWidgets.Initialization.registerLoader(_this.options.WidgetName, _this);

            _this.initConfiguration();
            _this.loadUtils();

            var widgets = $("div[fxs_widget][fxs_name='" + _this.options.WidgetName + "']");
            FXStreetWidgets.Util.async(function () {
                _this.initWidgets(widgets);
            });
        };

        _this.loadDeferred = function (container) {
            _this.log("loading deferred " + _this.options.WidgetName);
            var widgets = container.find("div[fxs_widget][fxs_name='" + _this.options.WidgetName + "']");
            _this.initWidgets(widgets);
        };

        _this.loadUtils = function () {
            FXStreetWidgets.Util.ajaxJsonGetter(_this.config.EndPointTranslation).done(function (data) {
                _this.translationsLoaded = true;
                _this.config.Translations = data.Values;
            });

            $.each(_this.config.CustomJs, function (index, custom) {
                _this.customJsCount++;
                var url = "";
                var name = "";
                var customLoadedDelegate;

                if (typeof custom === 'string') {
                    name = custom;
                    url = FXStreetWidgets.Configuration.getCoreJsUrl(name);
                }
                else if (custom && typeof custom === 'object') {
                    name = custom.Js;
                    url = FXStreetWidgets.Configuration.getCoreJsUrl(name);
                    customLoadedDelegate = custom.CustomLoadedDelegate;
                }

                FXStreetWidgets.ResourceManagerObj.load(name, FXStreetWidgets.ResourceType.Js, url, function () {
                    _this.customJsLoadedCount++;
                }, customLoadedDelegate);
            });

            $.each(_this.config.SharedJs, function (index, shared) {
                _this.sharedJsCount++;
                var url = FXStreetWidgets.Configuration.createResourceUrl(shared.Container, shared.Js);

                FXStreetWidgets.ResourceManagerObj.load(shared.Js, FXStreetWidgets.ResourceType.Js, url, function () {
                    _this.sharedJsLoadedCount++;
                }, shared.CustomLoadedDelegate);
            });

            $.each(_this.config.Mustaches, function (key, value) {
                _this.mustachesCount++;
                var name = key + ".html";
                var url = FXStreetWidgets.Configuration.getMustacheUrl(name, _this.options.WidgetName);

                FXStreetWidgets.ResourceManagerObj.load(name, FXStreetWidgets.ResourceType.Mustache, url, function (res) {
                    _this.config.Mustaches[key] = res.Value;
                    _this.mustachesLoadedCount++;
                });
            });
        };

        _this.async_loadjs = function (url, callback) {
            var x = document.getElementsByTagName('script')[0],
                s = document.createElement('script');
            s.type = 'text/javascript';
            s.async = true;
            s.src = url;
            if (callback && typeof callback === "function") {
                if (s.addEventListener) {
                    s.addEventListener('load', callback, false);
                } else {
                    s.onreadystatechange = function () {
                        if (this.readyState === "complete" || this.readyState === "loaded") {
                            callback.call();
                        }
                    };
                }
            }
            x.parentNode.insertBefore(s, x);
        };

        return _this;
    };
    FXStreetWidgets.Widget.LoaderBase.prototype.config = {};
    FXStreetWidgets.Widget.LoaderBase.prototype.initWidgets = function (widgets) { };
    FXStreetWidgets.Widget.LoaderBase.prototype.initConfiguration = function () {
        this.log("init configuration for: " + this.options.WidgetName);

        var container = this.getContainer();
        var host = this.getHost(container);
        var version = this.getVersion(container);
        var customJs = this.getCustomJs();
        var sharedJs = this.getSharedJs();

        this.config = {
            WidgetType: this.options.WidgetType,
            WidgetName: this.options.WidgetName,
            Culture: FXStreetWidgets.Configuration.getCulture(),
            EndPoint: this.getEndPoint(host, version),
            EndPointTranslation: this.getEndPointTranslation(host, version),
            DefaultHost: this.getDefaultHost(this.options),
            CustomJs: customJs,
            SharedJs: sharedJs,
            Mustaches: this.options.Mustaches,
            Translations: {}
        };
    };

    FXStreetWidgets.Widget.LoaderBase.prototype.getDefaultHost = function (options) {
        var hosts = FXStreetWidgets.Configuration.getHosts();
        if(!hosts) return options.DefaultHost;

        var defaultHost = hosts[options.WidgetType];
        
        var result = defaultHost || options.DefaultHost;        
        return result;
    };

    FXStreetWidgets.Widget.LoaderBase.prototype.getContainer = function () {
        var container = $("div[fxs_widget][fxs_name='" + this.options.WidgetName + "']").first();
        return container;
    };
    FXStreetWidgets.Widget.LoaderBase.prototype.getHost = function (container) {
        container = container || this.getContainer();
        var host = container.attr("fxs_host");
        host = FXStreetWidgets.Util.isUndefined(host) ? this.getDefaultHost(this.options) : host;
        return host;
    };
    FXStreetWidgets.Widget.LoaderBase.prototype.getVersion = function (container) {
        container = container || this.getContainer();
        var version = container.attr("fxs_version") || this.options.DefaultVersion;
        version = FXStreetWidgets.Util.isUndefined(version) ? "" : version;
        return version;
    };
    FXStreetWidgets.Widget.LoaderBase.prototype.getCustomJs = function () {
        var customJs = [];

        if (FXStreetWidgets.Util.arrayIsValid(this.options.CustomJs)) {
            this.haveCustomJs = true;
            customJs = this.options.CustomJs;
        }

        return customJs;
    };
    FXStreetWidgets.Widget.LoaderBase.prototype.getSharedJs = function () {
        var sharedJs = [];

        if (FXStreetWidgets.Util.arrayIsValid(this.options.SharedJs)) {
            this.haveSharedJs = true;
            sharedJs = this.options.SharedJs;
        }

        return sharedJs;
    };
    var getFormattedEndpoint = function (formatEndpoint, version) {
        var result = formatEndpoint.replace(/{version}/g, version).replace(/{culture}/g, FXStreetWidgets.Configuration.getCulture());
        return result;
    };
    FXStreetWidgets.Widget.LoaderBase.prototype.getEndPoint = function (host, version) {
        var result;
        if (this.options.EndPointV2) {
            var formattedEndpoint = getFormattedEndpoint(this.options.EndPointV2, version);
            result = host + formattedEndpoint;
        } else {
            result = host + (version ? version + '/' : "") + FXStreetWidgets.Configuration.getCulture() + "/" + this.options.EndPoint;
        }
        return result;
    };
    FXStreetWidgets.Widget.LoaderBase.prototype.getEndPointTranslation = function (host, version) {
        var result;
        if (this.options.EndPointTranslationV2) {
            var formattedEndpoint = getFormattedEndpoint(this.options.EndPointTranslationV2, version);
            result = host + formattedEndpoint;
        } else {
            result = host + (version ? version + '/' : "") + FXStreetWidgets.Configuration.getCulture() + "/" + this.options.EndPointTranslation;
        }
        return result;
    };
    FXStreetWidgets.Widget.LoaderBase.prototype.isReady = function () {
        var result = this.translationsLoaded === true
            && ((this.haveCustomJs === false) || (this.haveCustomJs === true && this.customJsLoadedCount >= this.customJsCount))
            && ((this.haveSharedJs === false) || (this.haveSharedJs === true && this.sharedJsLoadedCount >= this.sharedJsCount))
            && this.mustachesLoadedCount === this.mustachesCount;

        result = result && this.isReadyCustomCheck();

        if (result === true) {
            this.log("loader ready for: " + this.options.WidgetName);
        }

        return result;
    };
    FXStreetWidgets.Widget.LoaderBase.prototype.isReadyCustomCheck = function () {
        return true;
    };
    FXStreetWidgets.Widget.LoaderBase.prototype.chartLibrariesAreLoaded = function () {
        var result = typeof (d3) !== "undefined" && typeof (c3) !== "undefined";
        return result;
    };
    FXStreetWidgets.Widget.LoaderBase.prototype.log = function (msg) {
        FXStreetWidgets.Util.log(msg);
    };
}(FXStreetWidgets.$));
(function ($) {
    FXStreetWidgets.Widget.MarketImpact = function (loaderBase) {
        var parent = FXStreetWidgets.Widget.Base(loaderBase),
            _this = FXStreetWidgets.Util.extendObject(parent);
        var a = "";
        var tabs = {
            DeviationHistory: 1,
            TrueRange: 2,
            VolatilityRatio: 3,
            DeviationImpact: 4
        }

        _this.ContainerId = "";
        _this.AssetId = "";
        _this.Assets = [];
        _this.EventId = "";
        _this.ShownTabs = "";
        _this.SelectedTab = tabs.DeviationHistory;

        var shownTabs = {
            DeviationHistory: true,
            TrueRange: true,
            VolatilityRatio: true,
            DeviationImpact: true
        }

        var deviationHistoryTab = null;
        var trueRangeTab = null;
        var volatilityRatioTab = null;
        var deviationImpactTab = null;

        var deviationHistoryContainer = null;
        var trueRangeContainer = null;
        var volatilityRatioContainer = null;
        var deviationImpactContainer = null;

        var trueRangeDropdown = null;
        var volatilityRatioDropdown = null;
        var scatterPlotDropdown = null;

        var maxEvents = 40;

        _this.init = function (json) {
            _this.setSettingsByObject(json);

            _this.ContainerId = _this.EventId;
            initShownTabs();
            initSelectedTab();

            var assetIds = $.map(_this.Assets, function(value){ 
                    return value.Id; 
            });
            
            var url = this.loaderBase.config.EndPoint + _this.EventId + "/" + _this.AssetId + "?assets=" + assetIds.join(",");
            _this.loadDataFromUrl(url);
        };

        _this.jsonDataIsValid = function (data) {
            var result = FXStreetWidgets.Util.isValid(data);
            return result;
        };

        _this.renderHtml = function () {
            var asset = _this.Assets.find(function (asset) { return asset.Id === _this.AssetId });

            var jsonData = {
                ContainerId: _this.ContainerId,
                Value: _this.data,
                Translations: _this.loaderBase.config.Translations,
                SelectedTab: {
                    DeviationHistory: _this.SelectedTab === tabs.DeviationHistory,
                    TrueRange: _this.SelectedTab === tabs.TrueRange,
                    VolatilityRatio: _this.SelectedTab === tabs.VolatilityRatio,
                    DeviationImpact: _this.SelectedTab === tabs.DeviationImpact
                },
                ShownTabs: shownTabs,
                DropdownAssets: _this.Assets,
                SelectedAsset: asset
            };

            var rendered = FXStreetWidgets.Util.renderByHtmlTemplate(_this.loaderBase.config.Mustaches[_this.loaderBase.config.WidgetName], jsonData);
            _this.Container.html(rendered);

            setObjectReferences();

            _this.createGraph(jsonData);
        };

        var initShownTabs = function() {
            if (_this.ShownTabs) {
                var shownTabsSettings = _this.ShownTabs.split(",");
                if (shownTabsSettings.indexOf("deviationhistory") < 0) {
                    shownTabs.DeviationHistory = false;
                }
                if (shownTabsSettings.indexOf("truerange") < 0) {
                    shownTabs.TrueRange = false;
                }
                if (shownTabsSettings.indexOf("volatilityratio") < 0) {
                    shownTabs.VolatilityRatio = false;
                }
                if (shownTabsSettings.indexOf("deviationimpact") < 0) {
                    shownTabs.DeviationImpact = false;
                }
            }
        };

        var initSelectedTab = function() {
            if (_this.SelectedTab === tabs.DeviationHistory && !shownTabs.DeviationHistory) {
                _this.SelectedTab = tabs.TrueRange;
            }

            if (_this.SelectedTab === tabs.TrueRange && !shownTabs.TrueRange) {
                _this.SelectedTab = tabs.VolatilityRatio;
            }

            if (_this.SelectedTab === tabs.VolatilityRatio && !shownTabs.VolatilityRatio) {
                _this.SelectedTab = tabs.DeviationImpact;
            }
        };

        var setObjectReferences = function () {
            setTabReferences();
            setContainersReferences();
            setDropdownReferences();
        };

        var setTabReferences = function () {
            var deviationHistoryTabId = "deviation_history_tab_" + _this.ContainerId;
            var trueRangeTabId = "true_range_tab_" + _this.ContainerId;
            var volatilityRatioTabId = "volatility_ratio_tab_" + _this.ContainerId;
            var deviationImpactTabId = "deviation_impact_tab_" + _this.ContainerId;

            deviationHistoryTab = _this.Container.find("#" + deviationHistoryTabId);
            trueRangeTab = _this.Container.find("#" + trueRangeTabId);
            volatilityRatioTab = _this.Container.find("#" + volatilityRatioTabId);
            deviationImpactTab = _this.Container.find("#" + deviationImpactTabId);

            deviationHistoryTab.on("click", function () {
                _this.SelectedTab = tabs.DeviationHistory;
            });
            trueRangeTab.on("click", function () {
                _this.SelectedTab = tabs.TrueRange;
            });
            volatilityRatioTab.on("click", function () {
                _this.SelectedTab = tabs.VolatilityRatio;
            });
            deviationImpactTab.on("click", function () {
                _this.SelectedTab = tabs.DeviationImpact;
            });
        };

        var setContainersReferences = function () {
            var deviationHistoryContainerId = "deviation_history_container_" + _this.ContainerId;
            var trueRangeContainerId = "true_range_container_" + _this.ContainerId;
            var volatilityRatioContainerId = "volatility_ratio_container_" + _this.ContainerId;
            var deviationImpactContainerId = "deviation_impact_container_" + _this.ContainerId;

            deviationHistoryContainer = _this.Container.find("#" + deviationHistoryContainerId);
            trueRangeContainer = _this.Container.find("#" + trueRangeContainerId);
            volatilityRatioContainer = _this.Container.find("#" + volatilityRatioContainerId);
            deviationImpactContainer = _this.Container.find("#" + deviationImpactContainerId);
        };

        var setDropdownReferences = function () {
            var trueRangeDropdownId = "true_range_dropdown_" + _this.ContainerId;
            var volatilityRatioDropdownId = "volatility_ratio_dropdown_" + _this.ContainerId;
            var scatterPlotDropdownId = "scatter_plot_dropdown_" + _this.ContainerId;

            trueRangeDropdown = _this.Container.find("#" + trueRangeDropdownId);
            volatilityRatioDropdown = _this.Container.find("#" + volatilityRatioDropdownId);
            scatterPlotDropdown = _this.Container.find("#" + scatterPlotDropdownId);

            trueRangeDropdown.on("change", function () {
                var assetId = trueRangeDropdown.val();
                onDropdownClick(assetId);
            });
            volatilityRatioDropdown.on("change", function () {
                var assetId = volatilityRatioDropdown.val();
                onDropdownClick(assetId);
            });
            scatterPlotDropdown.on("change", function () {
                var assetId = scatterPlotDropdown.val();
                onDropdownClick(assetId);
            });
        };

        var onDropdownClick = function (assetId) {
            console.log("Selected pair: " + assetId);

            var jsonInit = {
                AssetId: assetId
            }
            _this.init(jsonInit);
        };

        _this.createGraph = function (data) {
            var asset = _this.Assets.find(function (asset) { return asset.Id === _this.AssetId });
            var eventId = data.Value.Event.EventId;

            if (typeof eventId === 'undefined') {
                console.error("MarketImpact: eventId is undefined");
                return;
            }

            loadDeviationHistory(data);
            loadTrueRange(data, asset);
            loadVolatilityRatio(data, asset);
            loadDeviationImpact(data, asset);
        };

        var calculateMagnitude = function(decimalPlaces) {
            var result = Math.pow(10, decimalPlaces);
            return result;
        };

        var getTimeseriesAxis = function(values) {
            var result = new Array();

            result.push('x');
            $.each(values, function(j, value) {
                result.push(moment(value.Date).format('MM/DD/YYYY'));
            });
            return result;
        };

        var getRow = function (values, title, propertyName, magnitude, decimals) {
            magnitude = magnitude || 0;
            decimals = decimals || 2;

            var result = new Array();

            result.push(title);
            $.each(values, function(j, value) {
                var valuePushed = value[propertyName] ? (value[propertyName] * calculateMagnitude(magnitude)).toFixed(decimals) : null;
                result.push(valuePushed);
            });
            return result;
        };

        var loadDeviationHistory = function (data) {
            var numEvents = Math.min(data.Value.Values.length, maxEvents);
            var values = data.Value.Values.slice(0, numEvents);

            var timeseriesAxis = getTimeseriesAxis(values);
            var deviationRow = getRow(values, "Deviation_Row", "StandardDeviationRatio");
            var consensusRow = getRow(values, "Consensus_Row", "Consensous");
            var actualRow = getRow(values, "Actual_Row", "Actual");

            var columns = new Array();
            columns.push(timeseriesAxis);
            columns.push(deviationRow);
            columns.push(consensusRow);
            columns.push(actualRow);

            c3.generate({
                bindto: '#chart_deviation',
                data: {
                    x: 'x',
                    xFormat: '%m/%d/%Y', // 'xFormat' can be used as custom format of 'x'
                    columns: columns, // Caution! Placing only "columns," works for FF and Chrome but not for Safari!
                    types: {
                        Deviation_Row: 'bar',
                        Consensus_Row: 'line',
                        Actual_Row: 'line'
                    },
                    names: {
                        Deviation_Row: data.Translations.Deviation_Text,
                        Consensus_Row: data.Translations.Consensus_Text,
                        Actual_Row: data.Translations.Actual_Text
                    },
                    colors: {
                        Deviation_Row: '#efb871',
                        Consensus_Row: '#dc8623',
                        Actual_Row: '#5aa1d9'

                    },
                    axes: {
                        Deviation_Row: 'y',
                        Consensus_Row: 'y2',
                        Actual_Row: 'y2'
                    }
                },
                bar: {
                    width: {
                        ratio: 0.5
                    }
                },
                axis: {
                    x: {
                        type: 'timeseries',
                        tick: {
                            format: '%m/%d/%Y',
                            culling: {
                                max: 4 // the number of tick texts will be adjusted to less than this value
                            }
                        },
                        label: {
                            position: 'outer-center'
                        }
                    },
                    y: {
                        label: {
                            text: data.Translations.Deviation_Axis_Label,
                            position: 'outer-middle' // text in the middle and outher of graph 
                        }

                    },
                    y2: {
                        show: true,
                        label: {
                            text: data.Translations.Actual_And_Consensus_Axis_Label,
                            position: 'outer-middle'
                        },
                        tick: {
                            format: d3.format(".1f") // esto formatea el valor recibido y muestra 1 decimale
                        }
                    }

                },
                grid: {
                    x: {
                        show: false
                    },
                    y: {
                        tick: {
                            opacity: 0
                        },
                        lines: [
                            { value: 0, text: '' }
                        ]
                    },
                    focus: {
                        show: true
                    }
                },
                point: {
                    show: false
                }
            });
        };

        var loadTrueRange = function (data, asset) {
            trueRangeDropdown.val(asset.Id);

            var numEvents = Math.min(data.Value.Values.length, maxEvents);
            var values = data.Value.Values.slice(0, numEvents);

            var timeseriesAxis = getTimeseriesAxis(values);
            var trueRange15minRow = getRow(values, "True_Range_15min", "TrueRange15Min", asset.DecimalPlaces, 0);
            var trueRange4hRow = getRow(values, "True_Range_4h", "TrueRange4h", asset.DecimalPlaces, 0);
            var avgTrueRange15minRow = getRow(values, "Avg_True_Range_15min", "TrueRangeMean15Min", asset.DecimalPlaces, 0);
            var avgTrueRange4hRow = getRow(values, "Avg_True_Range_4h", "TrueRangeMean4h", asset.DecimalPlaces, 0);

            var columns = new Array();
            columns.push(timeseriesAxis);
            columns.push(trueRange15minRow);
            columns.push(trueRange4hRow);
            columns.push(avgTrueRange15minRow);
            columns.push(avgTrueRange4hRow);

            c3.generate({
                bindto: '#chart_true_range',
                data: {
                    x: 'x',
                    xFormat: '%m/%d/%Y',
                    columns: columns, // Caution! Placing only "columns," works for FF and Chrome but not for Safari!
                    //type: 'bar',
                    types: {
                        True_Range_15min: 'bar', // To assign type individually, the names must start by letters and with no blank spaces.
                        True_Range_4h: 'bar',
                        Avg_True_Range_15m: 'spline',
                        Avg_True_Range_4h: 'spline'
                    },
                    names: { // custom the var names without undercore
                        True_Range_15min: data.Translations.TrueRange15min_Legend,
                        True_Range_4h: data.Translations.TrueRange4h_Legend,
                        Avg_True_Range_15m: data.Translations.TrueRangeAveraged15min_Legend,
                        Avg_True_Range_4h: data.Translations.TrueRangeAveraged4h_Legend
                    },
                    colors: {
                        True_Range_15min: '#efb877',
                        True_Range_4h: '#9bc7ea',
                        Avg_True_Range_15m: '#e4881b',
                        Avg_True_Range_4h: '#5aa5df'
                    }
                },
                bar: {
                    width: {
                        ratio: 0.5 // this makes bar width 50% of length between ticks
                    }
                },
                axis: {
                    x: {
                        type: 'timeseries',
                        tick: {
                            format: '%m/%d/%Y',
                            culling: {
                                max: 4 // the number of tick texts will be adjusted to less than this value
                            }
                        },
                        label: {
                            position: 'outer-center'
                        }
                    },
                    y: {
                        label: {
                            text: data.Translations.TrueRangePipsAxis_Text,
                            position: 'outer-middle'

                        }
                    }
                },
                grid: {
                    x: {
                        show: false
                    },
                    y: {
                        show: false,
                        tick: {
                            opacity: 0
                        }
                    },
                    focus: {
                        show: true
                    }
                },
                point: {
                    show: false
                }
            });
        };

        var loadVolatilityRatio = function (data, asset) {
            volatilityRatioDropdown.val(asset.Id);

            var numEvents = Math.min(data.Value.Values.length, maxEvents);
            var values = data.Value.Values.slice(0, numEvents);

            var timeseriesAxis = getTimeseriesAxis(values);
            var volatilityRatio15minRow = getRow(values, "Volatility_Ratio_15min", "VolatilityRatio15Min");
            var volatilityRatio4hRow = getRow(values, "Volatility_Ratio_4h", "VolatilityRatio4h");
            var avgVolatilityRatio15minRow = getRow(values, "Avg_Volatility_Ratio_15min", "VolatilityRatioMean15Min");
            var avgVolatilityRatio4hRow = getRow(values, "Avg_Volatility_Ratio_4h", "VolatilityRatioMean4h");

            var columns = new Array();
            columns.push(timeseriesAxis);
            columns.push(volatilityRatio15minRow);
            columns.push(volatilityRatio4hRow);
            columns.push(avgVolatilityRatio15minRow);
            columns.push(avgVolatilityRatio4hRow);

            c3.generate({
                bindto: '#chart_volatility_ratio',
                data: {
                    x: 'x',
                    xFormat: '%m/%d/%Y', // 'xFormat' can be used as custom format of 'x'
                    columns: columns, // Caution! Placing only "columns," works for FF and Chrome but not for Safari!
                    //type: 'bar',
                    types: {
                        Volatility_Ratio_15min: 'bar',
                        Volatility_Ratio_4h: 'bar',
                        Avg_Volatility_Ratio_15min: 'spline',
                        Avg_Volatility_Ratio_4h: 'spline'
                    },
                    names: { // custom the var names without undercore
                        Volatility_Ratio_15min: data.Translations.VolatilityRatio15min_Legend,
                        Volatility_Ratio_4h: data.Translations.VolatilityRatio4h_Legend,
                        Avg_Volatility_Ratio_15min: data.Translations.VolatilityRatioAveraged15min_Legend,
                        Avg_Volatility_Ratio_4h: data.Translations.VolatilityRatioAveraged4h_Legend
                    },
                    colors: {
                        Volatility_Ratio_15min: '#f7b56b',
                        Volatility_Ratio_4h: '#a1c8e7',
                        Avg_Volatility_Ratio_15min: '#e88319',
                        Avg_Volatility_Ratio_4h: '#57a5e3'
                    }
                },
                axis: {
                    x: {
                        type: 'timeseries',
                        tick: {
                            format: '%m/%d/%Y',
                            culling: {
                                max: 4 // the number of tick texts will be adjusted to less than this value
                            }
                        },
                        label: {
                            position: 'outer-center'
                        }
                    },
                    y: {
                        label: {
                            text: data.Translations.VolatilityRatioAxis_Label,
                            position: 'outer-middle'

                        }
                    }
                },
                grid: {
                    x: {
                        show: false
                    },
                    y: {
                        show: false,
                        tick: {
                            opacity: 0
                        }
                    },
                    focus: {
                        show: true
                    }
                },
                point: {
                    show: false
                }
            });
        };

        var loadDeviationImpact = function (data, asset) {
            scatterPlotDropdown.val(asset.Id);

            var columnsAux = new Array();
            var numRows = 2;
            var numCols = Math.min(data.Value.Values.length, maxEvents); // We load the data.Value in a c3.js 'columns' matrix first for the x-axis of TRs:
            for (var i = 0; i < numRows; i++) {
                columnsAux[i] = new Array(); // each row is an array of columns

                for (var j = 0; j < numCols + 1; j++) { // We add one value to the array to be able to add the row tag at the beginning (e.g. EURUSD_x)
                    if (i === 0) {
                        if (j === 0) {
                            columnsAux[i][j] = "15m_True_Range_x";
                        }
                        else {
                            if (!data.Value.Values[j - 1].TrueRange15Min){
                                columnsAux[i][j] = null;
                            } else {
                                columnsAux[i][j] = ((data.Value.Values[j - 1].TrueRange15Min) * calculateMagnitude(asset.DecimalPlaces));
                            }
                        }
                    }
                    if (i === 1) {
                        if (j === 0) {
                            columnsAux[i][j] = "4h_True_Range_x";
                        }
                        else {
                            if (!data.Value.Values[j - 1].TrueRange4h){
                                columnsAux[i][j] = null;
                            } else {
                                columnsAux[i][j] = ((data.Value.Values[j - 1].TrueRange4h) * calculateMagnitude(asset.DecimalPlaces));
                            }
                        }
                    }
                }
            }


            var columnsAux2 = new Array();

            // Now we load the data.Value in a c3.js 'columns' matrix  for the y-axis of Deviation Ratios:
            for (var i = 0; i < numRows; i++) {
                columnsAux2[i] = new Array(); // each row is an array of columns

                for (var j = 0; j < numCols + 1; j++) { // We add one value to the array to be able to add the y-axis row tag at the beginning (e.g. EURUSD)
                    if (i === 0) {
                        if (j === 0) {
                            columnsAux2[i][j] = data.Translations.DeviationImpactTrueRange15min_Legend;
                        }
                        else {
                            if (!data.Value.Values[j - 1].StandardDeviationRatio){
                                columnsAux2[i][j] = null;
                            } else {
                                columnsAux2[i][j] = (data.Value.Values[j - 1].StandardDeviationRatio);
                            }
                        }
                    }
                    if (i === 1) {
                        if (j === 0) {
                            columnsAux2[i][j] = data.Translations.DeviationImpactTrueRange4h_Legend;
                        }
                        else {
                            if (!data.Value.Values[j - 1].StandardDeviationRatio){
                                columnsAux2[i][j] = null;
                            } else {
                                columnsAux2[i][j] = (data.Value.Values[j - 1].StandardDeviationRatio); // We have the same data.Value from the previous row because it's the same eventDates from the same event.
                            }
                        }
                    }
                }
            }
            var columns = columnsAux.concat(columnsAux2); // We merge the auxiliar columns to the final one for plotting

            var xs = new Object(); // We create the xs object for placing it as a property in 'data.Value' for associating the y-axis PAIRs with their x-axis PAIR_x

            for (var i = 0; i < numRows; i++) {
                xs[columnsAux2[i][0]] = String(columnsAux[i][0]); // It must be an string even if its null!
            }

            function returnInfoTooltip(value, ratio, id) {
                var info = '';
                for (var j = 0; j < numCols; j++) {
                    if (String(data.Value.Values[j].StandardDeviationRatio) === value) {
                        if (id.endsWith('m')) {
                            info = 'Surprise Factor: ' + Number(value).toFixed(2) + ' | Volatility Ratio: ' + data.Value.Values[j].VolatilityRatio15Min.toFixed(2) + ' | ' + String(data.Value.Values[j].Date);
                        }
                        else {
                            info = 'Surprise Factor: ' + Number(value).toFixed(2) + ' | Volatility Ratio: ' + data.Value.Values[j].VolatilityRatio4h.toFixed(2) + ' | ' + String(data.Value.Values[j].Date);
                        }
                        break; // We exit the loop for efficiency.
                    }
                }

                return (info);
            }

            c3.generate({
                bindto: '#chart_scatter',
                data: {
                    xs: xs, // Caution! Placing only "xs," works for FF and Chrome but not for Safari!
                    columns: columns, // Caution! Placing only "columns," works for FF and Chrome but not for Safari!
                    type: 'scatter'
                },
                axis: {
                    x: {
                        tick: {
                            fit: false,
                            culling: {
                                max: 4 // the number of tick texts will be adjusted to less than this value
                            }
                        },
                        label: {
                            text: data.Translations.TrueRangePipsAxis_Text,
                            position: 'inner-right'
                        }
                    },
                    y: {
                        label: {
                            text: data.Translations.DeviationImpactAxis_Label, // Deviation Ratio
                            position: 'outer-middle'

                        }
                    }
                },
                grid: {
                    x: {
                        show: false
                    },
                    y: {
                        show: false,
                        tick: {
                            opacity: 0
                        }
                    }
                }, point: {
                    r: 8
                },
                tooltip: {
                    format: {
                        title: function (d) {
                            return ' True Range: ' + d.toFixed(0);
                        },
                        name: function (name) {
                            return name;
                        },
                        value: function (value, ratio, id, index) { // id = PAIR / index = column number / value = Deviation Ratio / Ratio will be undefined if the chart is not donut/pie/gauge.
                            value = value.toString();
                            value = returnInfoTooltip(value, ratio, id, index); //get info from parsed JSON data.Value[index];
                            return value;
                        }
                    }
                }
            });
        };

        return _this;
    };
}(FXStreetWidgets.$));
(function ($) {
    FXStreetWidgets.Widget.LoaderMarketImpact = function () {
        var options = {
            WidgetType: "MarketTools",
            WidgetName: "marketimpact",
            EndPointV2: "api/v2/marketImpact/study/",
            EndPointTranslationV2: "api/v2/cultures/{culture}/MarketImpactWidgetI3/",
            DefaultHost: "https://markettools.fxstreet.com/",
            Mustaches:
                {
                    "marketimpact": ""
                },
            DefaultVersion: "v2",
            CustomJs: ["c3.min.js", "d3.min.js", "moment.min.js"]
        };

        var parent = FXStreetWidgets.Widget.LoaderBase(options),
            _this = FXStreetWidgets.Util.extendObject(parent);

        parent.initWidgets = function (widgets) {
            $.each(widgets, function (i, marketimpact) {
                var jMarketImpact = $(marketimpact);

                var assets = jMarketImpact.attr("fxs_assets")
                    ? jMarketImpact.attr("fxs_assets").split(",")
                    : null;

                var url = _this.getHost() + 'api/' + _this.getVersion() + '/marketImpact/' + FXStreetWidgets.Configuration.getCulture() + '/assets/';;

                if (assetsValid(assets)) {
                    url += "?assetIds=" + assets.join(",");
                }

                FXStreetWidgets.Util.ajaxJsonGetter(url)
                    .done(function (data) {
                        var selectedAssets = data.Values;

                        var initJson = {
                            Container: jMarketImpact,
                            AssetId: selectedAssets[0].Id,
                            Assets: selectedAssets,
                            EventId: jMarketImpact.attr("fxs_eventId"),
                            ShownTabs: jMarketImpact.attr("fxs_tabs") || ""
                        };

                        var widget = new FXStreetWidgets.Widget.MarketImpact(_this);
                        widget.init(initJson);
                    })
                    .fail(function () {
                        console.error("fxserror: Couldn't get assets");
                    });
            });
        };

        var assetsValid = function (assets) {
            if (!assets) {
                return false;
            }

            try {
                $.each(assets, function (i, assetId) {
                    if (FXStreetWidgets.Util.isUndefined(assetId) || !assetId.startsWith('fxs-')) {
                        throw assetId;
                    }
                });
                return true;
            } catch (ex) {
                console.log("fxserror unable to create " + _this.config.WidgetName + ", asset not valid: " + ex.message);
                return false;
            }
        };

        return _this;
    };

    (function () {
        var loader = new FXStreetWidgets.Widget.LoaderMarketImpact();
        loader.init();
    })();
}(FXStreetWidgets.$));