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
(function () {
    FXStreetWidgets.Chart.Base = function () {
        _this = {};

        _this.chart = FXStreetWidgets.Chart.Base.prototype.chart;
        _this.init = FXStreetWidgets.Chart.Base.prototype.init;
        _this.setSettingsByObject = FXStreetWidgets.Chart.Base.prototype.setSettingsByObject;
        _this.getPrintJson = FXStreetWidgets.Chart.Base.prototype.getPrintJson;
        _this.print = FXStreetWidgets.Chart.Base.prototype.print;
        _this.delayAnimations = FXStreetWidgets.Chart.Base.prototype.delayAnimations;
        _this.log = FXStreetWidgets.Chart.Base.prototype.log;

        return _this;
    };
    FXStreetWidgets.Chart.Base.prototype.chart = null;
    FXStreetWidgets.Chart.Base.prototype.init = function (json) {
        this.log("init chart");
        this.setSettingsByObject(json);
        this.print(this.getPrintJson());
    };
    FXStreetWidgets.Chart.Base.prototype.setSettingsByObject = function (json) {
        for (var propName in json) {
            if (json.hasOwnProperty(propName)) {
                if (this[propName] !== undefined) {
                    this[propName] = json[propName];
                }
            }
        }
    };
    FXStreetWidgets.Chart.Base.prototype.getPrintJson = function () { };
    FXStreetWidgets.Chart.Base.prototype.print = function (json) {
        this.log("print chart");
        this.chart = c3.generate(json);
        this.delayAnimations();
    };
    FXStreetWidgets.Chart.Base.prototype.delayAnimations = function () { };
    FXStreetWidgets.Chart.Base.prototype.log = function (msg) {
        FXStreetWidgets.Util.log(msg);
    };
}());
(function ($) {
    FXStreetWidgets.Chart.CtpSpeedometer = function () {
        var parent = FXStreetWidgets.Chart.Base(),
            _this = FXStreetWidgets.Util.extendObject(parent);

        _this.delayTimeForAnimationInSpeedometerResize = 100;
        _this.delayTimeForAnimationInSpeedometerLoad = 250;
        _this.SellStaticsPercent = null;
        _this.Id = "";
    
        parent.delayAnimations = function () {
            setTimeout(function () {
                _this.chart.resize({
                    columns: [
                    ['Buy', 100],
                    ['Sell', undefined]
                    ]
                });
            }, _this.delayTimeForAnimationInSpeedometerResize);
            
            setTimeout(function () {
                _this.chart.load({
                    columns: [
                    ['Buy', 100],
                    ['Sell', _this.SellStaticsPercent]
                    ]
                });
            }, _this.delayTimeForAnimationInSpeedometerLoad);
        };

        parent.getPrintJson = function () {
            var pattern = _this.SellStaticsPercent < 100 ? ['#CE4735', '#CE4735', '#328372'] : ['#CE4735'];
            var chartJson = {
                bindto: '#' + _this.Id,
                data: {
                    columns: [
                        ['Buy', 0],
                        ['Sell', 0]
                    ],
                    type: 'gauge'
                },
                zoom: {
                    enabled: false
                },
                gauge: {
                    label: {
                        show: false
                    },
                    units: ' %',
                    width: 6
                },
                color: {
                    pattern: pattern,
                    threshold: {
                        values: [0, 100]
                    }
                },
                size: {
                    height: 100,
                    width: 190
                },
                tooltip: {
                    show: false
                },
                interaction: { enabled: false }
            };
            return chartJson;
        };

        return _this;
    };
}(FXStreetWidgets.$));
(function ($) {
    FXStreetWidgets.Chart.CtpBars = function () {
        var parent = FXStreetWidgets.Chart.Base(),
            _this = FXStreetWidgets.Util.extendObject(parent);

        _this.DelayTimeForAnimationInBars = 1000;
       
        _this.Id = "";
        _this.Signals = {};
        _this.Translations = {};

        _this.SellArray = [];
        _this.BuyArray = [];
        _this.SellArrayEmpty = [];
        _this.BuyArrayEmpty = [];
        _this.SignalsArray = [];

        parent.init = function (json) {
            _this.setSettingsByObject(json);

            _this.SignalsArray = ["x"];
            _this.SellArray = [_this.Translations.Sell];
            _this.BuyArray = [_this.Translations.Buy];
            _this.SellArrayEmpty = [_this.Translations.Sell];
            _this.BuyArrayEmpty = [_this.Translations.Buy];

            var valuesToPrint = []; // Dictionaty<EntryValue, IsSell>

            $.each(_this.Signals, function (i, signal) {
                var isSell = signal.OrderDirection === "SELL" || signal.OrderDirection === "SHORT";
                valuesToPrint.push({ Value: signal.Entry, IsSell: isSell });
                if (signal.StopLoss)
                    valuesToPrint.push({ Value: signal.StopLoss, IsSell: !isSell });
                if (signal.TakeProfit1)
                    valuesToPrint.push({ Value: signal.TakeProfit1, IsSell: !isSell });
                if (signal.TakeProfit2)
                    valuesToPrint.push({ Value: signal.TakeProfit2, IsSell: !isSell });
                if (signal.TakeProfit3)
                    valuesToPrint.push({ Value: signal.TakeProfit3, IsSell: !isSell });
            });

            valuesToPrint.sort(function (a, b) { return parseFloat(a.Value) - parseFloat(b.Value); });
            _this.handleEqualValues(valuesToPrint);

            $.each(valuesToPrint, function (i, signal) {
                _this.SellArrayEmpty.push(0);
                _this.BuyArrayEmpty.push(0);

                _this.SignalsArray.push(signal.Value);
                if (signal.IsSell) {
                    _this.SellArray.push(1);
                    _this.BuyArray.push(0);
                } else {
                    _this.SellArray.push(0);
                    _this.BuyArray.push(1);
                }
            });

            _this.print(_this.getPrintJson());
        };

        _this.handleEqualValues = function (valuesToPrint) {
            if (valuesToPrint !== null) {
                for (var i = 0; i < valuesToPrint.length; i++) {
                    var appearances = 0;
                    for (var j = i+1; j < valuesToPrint.length; j++) {
                        if (i !== j && parseFloat(valuesToPrint[i].Value) === parseFloat(valuesToPrint[j].Value)) {
                            var incrementalValue = (+(0.00001 + (appearances / 100000)).toFixed(5));
                            valuesToPrint[j].Value = (parseFloat(valuesToPrint[j].Value) + incrementalValue).toFixed(5).toString();
                            appearances++;
                        }
                    };
                }
            }
        };

        parent.delayAnimations = function () {
            setTimeout(function () {
                _this.chart.load({
                    columns: [
                        _this.BuyArray,
                        _this.SellArray
                    ]
                });
            }, _this.DelayTimeForAnimationInBars);
        };

        parent.getPrintJson = function () {
            var colorsJson = {};
            colorsJson[_this.Translations.Sell] = '#CE4735';
            colorsJson[_this.Translations.Buy] = '#338473';

            var chartJson = {
                bindto: '#' + _this.Id,
                data: {
                    x: 'x',
                    columns: [
                        _this.SignalsArray,
                        _this.SellArrayEmpty,
                        _this.BuyArrayEmpty
                    ],
                    type: 'bar',
                    colors: colorsJson
                },
                bar: {
                    width: 2
                },
                padding: {
                    left: 16
                },
                size: {
                    height: 105
                },
                tooltip: {
                    show: true,
                    format: {
                        title: function (d) { return d; },
                        value: function (value, ratio, id) {
                            return ratio;
                        }
                    }
                },
                axis: {
                    y: {
                        show: false
                    },
                    x: {
                        tick: {
                            values: _this.getTickValues(_this.SignalsArray.slice(1, _this.SignalsArray.length))
                        }
                    }
                },
                legend: {
                    position: 'right'
                }
            };

            return chartJson;
        };

        _this.getSignalsAvg = function(values) {
            var avg = 0;
            var valLength = values[0].length;
            for (var i = 0; i < values.length; i++) {
                var val = parseFloat(values[i]);
                avg = avg + val;
            }

            return (avg / values.length).toString().slice(0, valLength);
        };

        _this.getTickValues = function (values) {
            values.sort();
            return [values[0], _this.getSignalsAvg(values), values[values.length - 1]];
        };

        return _this;
    };
}(FXStreetWidgets.$));
(function ($) {
    FXStreetWidgets.Widget.Ctp = function (loaderBase) {
        var parent = FXStreetWidgets.Widget.Base(loaderBase),
            _this = FXStreetWidgets.Util.extendObject(parent);

        _this.AssetId = "";
        _this.ClassSize = "";
        _this.HideFullReport = "";
        _this.FullReportUrl = "";
        _this.WidgetId = null;
        _this.Seo = false;

        _this.ChartSpeedometerId = "gauge_chart";
        _this.ChartBarsId = "orders_chart";

        _this.init = function (json) {
            _this.setSettingsByObject(json);
            var url = this.loaderBase.config.EndPoint + "?assetids=" + _this.AssetId;
            _this.loadDataFromUrl(url);
        };

        var parentJsonDataIsValid = parent.jsonDataIsValid;
        _this.jsonDataIsValid = function (data) {
            var result = parentJsonDataIsValid(data)
                         && FXStreetWidgets.Util.arrayIsValid(data.Values[0].Entries);

            return result;
        };

        _this.renderHtml = function () {
            var studyData = _this.data.Values[0];

            formatPrices(studyData, studyData.Asset.DecimalPlaces);

            var jsonData = {
                Study: studyData,
                Translations: _this.loaderBase.config.Translations,
                FullReportUrl: _this.FullReportUrl.toLowerCase(),
                Seo: _this.Seo
            };

            jsonData = _this.setDatesToJson(jsonData, studyData.Date);

            var rendered = FXStreetWidgets.Util.renderByHtmlTemplate(_this.loaderBase.config.Mustaches[_this.loaderBase.config.WidgetName], jsonData);
            _this.Container.html(rendered);

            _this.manageRenderedHtml();
            _this.printCharts(studyData);
        };

        _this.manageRenderedHtml = function () {
            _this.addSizeClass();
            _this.handleFullReport();
        };

        _this.addSizeClass = function () {
            if (_this.ClassSize) {
                _this.Container.find('.fxs_ctp_widget').addClass(_this.ClassSize);
            }
        };

        _this.handleFullReport = function () {
            if (_this.HideFullReport) {
                _this.Container.find('.fxs_btn.fxs_btn_line.fxs_btn_small').remove();
            }
        };

        //#region Charts

        _this.printCharts = function (studyData) {
            _this.instanciateSpeedpometer(studyData);
            _this.instanciateBars(studyData);
        };

        _this.instanciateSpeedpometer = function (studyData) {
            var newSpeedometerId = _this.ChartSpeedometerId + _this.WidgetId;

            var speedometer = _this.Container.find("#" + _this.ChartSpeedometerId);
            if (speedometer) {
                speedometer.attr("id", newSpeedometerId);
            }

            var initJsonSpeedometer = {
                SellStaticsPercent: studyData.SellStatics.Percent,
                Id: newSpeedometerId
            };

            var ctpSpeedometer = new FXStreetWidgets.Chart.CtpSpeedometer();
            ctpSpeedometer.init(initJsonSpeedometer);
        };

        _this.instanciateBars = function (studyData) {
            var newBarsId = _this.ChartBarsId + _this.WidgetId;

            var bars = _this.Container.find("#" + _this.ChartBarsId);
            if (bars) {
                bars.attr("id", newBarsId);
            }

            var initJsonBars = {
                Id: newBarsId,
                Signals: studyData.Entries,
                Translations: _this.loaderBase.config.Translations
            };

            var ctpBars = new FXStreetWidgets.Chart.CtpBars();
            ctpBars.init(initJsonBars);
        };

        //#endregion Charts

        var formatPrices = function (data, decimalPlaces) {
            data.Entries.forEach(function (e) {
                if (e.Entry) {
                    e.Entry = e.Entry.toFixed(decimalPlaces);
                }
                if (e.StopLoss) {
                    e.StopLoss = e.StopLoss.toFixed(decimalPlaces);
                }
                if (e.TakeProfit1) {
                    e.TakeProfit1 = e.TakeProfit1.toFixed(decimalPlaces);
                }
                if (e.TakeProfit2) {
                    e.TakeProfit2 = e.TakeProfit2.toFixed(decimalPlaces);
                }
                if (e.TakeProfit3) {
                    e.TakeProfit3 = e.TakeProfit3.toFixed(decimalPlaces);
                }
            });

            data.BuyStatics.AveragePrice = $.isNumeric(data.BuyStatics.AveragePrice) ? data.BuyStatics.AveragePrice.toFixed(decimalPlaces) : data.BuyStatics.AveragePrice;
            data.SellStatics.AveragePrice = $.isNumeric(data.SellStatics.AveragePrice) ? data.SellStatics.AveragePrice.toFixed(decimalPlaces) : data.SellStatics.AveragePrice;
        }

        return _this;
    };
}(FXStreetWidgets.$));
(function ($) {
    FXStreetWidgets.Widget.LoaderCtp = function () {
        var options = {
            WidgetType: "MarketTools",
            WidgetName: "ctp",
            EndPointV2: "api/v2/ctp/{culture}/study/",
            EndPointTranslationV2: "api/v2/cultures/{culture}/ctp/",
            DefaultHost: "https://markettools.fxstreet.com/",            
            Mustaches:
                {
                    "ctp": ""
                },
            DefaultVersion: "v2",
            CustomJs: ["c3.min.js", "d3.min.js"]
        };

        var parent = FXStreetWidgets.Widget.LoaderBase(options),
            _this = FXStreetWidgets.Util.extendObject(parent);

        parent.initWidgets = function (widgets) {
            $.each(widgets, function (i, ctp) {
                var jCtp = $(ctp);

                var initJson = {
                    Container: jCtp,
                    AssetId: jCtp.attr("fxs_asset"),
                    ClassSize: jCtp.attr("fxs_class_size"),
                    HideFullReport: FXStreetWidgets.Util.isUndefined(jCtp.attr("fxs_hide_fullreport")) ? false : true,
                    FullReportUrl: jCtp.attr("fxs_fullreport_url"),
                    WidgetId: FXStreetWidgets.Util.guid(),
                    Seo: FXStreetWidgets.Util.isUndefined(jCtp.attr("fxs_seo")) ? false : true
                };

                if (FXStreetWidgets.Util.isUndefined(initJson.FullReportUrl)) {
                    initJson.FullReportUrl = "/";
                }

                if (FXStreetWidgets.Util.isUndefined(initJson.AssetId) || !initJson.AssetId.startsWith('fxs-')) {
                    console.log("fxserror unable to create " + _this.config.WidgetName + ", asset not valid: " + initJson.AssetId);
                } else {
                    var widget = new FXStreetWidgets.Widget.Ctp(_this);
                    widget.init(initJson);
                }
            });
        };

        parent.isReadyCustomCheck = function () {
            var result = parent.chartLibrariesAreLoaded();
            return result;
        };

        return _this;
    };

    (function () {
        var loader = new FXStreetWidgets.Widget.LoaderCtp();
        loader.init();
    })();
}(FXStreetWidgets.$));