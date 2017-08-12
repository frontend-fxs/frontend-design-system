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
            })
            .error(function () {
                _this.handleJsonInvalidData();
            });
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
            WidgetName: this.options.WidgetName,
            Culture: FXStreetWidgets.Configuration.getCulture(),
            EndPoint: this.getEndPoint(host, version),
            EndPointTranslation: this.getEndPointTranslation(host, version),
            DefaultHost: this.options.DefaultHost,
            CustomJs: customJs,
            SharedJs: sharedJs,
            Mustaches: this.options.Mustaches,
            Translations: {}
        };
    };
    FXStreetWidgets.Widget.LoaderBase.prototype.getContainer = function () {
        var container = $("div[fxs_widget][fxs_name='" + this.options.WidgetName + "']").first();
        return container;
    };
    FXStreetWidgets.Widget.LoaderBase.prototype.getHost = function (container) {
        container = container || this.getContainer();
        var host = container.attr("fxs_host");
        host = FXStreetWidgets.Util.isUndefined(host) ? this.options.DefaultHost : host;
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
        debugger;
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
        debugger;
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
    FXStreetWidgets.Chart.ForecastSpeedometer = function () {
        var parent = FXStreetWidgets.Chart.Base(),
            _this = FXStreetWidgets.Util.extendObject(parent);

        _this.bullish = "Bullish";
        _this.bearish = "Bearish";
        _this.sideways = "Sideways";
        _this.delayTimeForAnimationInSpeedometerResize = 100;
        _this.delayTimeForAnimationInSpeedometerLoad = 250;
       
        _this.Id = "";
        _this.Container = null;
        _this.StaticsColumns = null;
        _this.BullishPercent = null;
        _this.BearishPercent = null;
        _this.SidewaysPercent = null;

        parent.init = function(json) {
            _this.setSettingsByObject(json);
           
            var bullishValue = _this.BullishPercent;
            var bearishValue = bullishValue + _this.BearishPercent;
            var sidewaysValue = 100;

            if (_this.SidewaysPercent === 0) {
                sidewaysValue = 0;
                bearishValue = 100;
            }

            _this.StaticsColumns = [[_this.bullish, bullishValue], [_this.bearish, bearishValue], [_this.sideways, sidewaysValue]];
            _this.Container = $('#' + _this.Id);

            _this.print(_this.getPrintJson());
        };

        parent.delayAnimations = function () {
            setTimeout(function () {
                _this.chart.resize({
                    height: 90,
                    width: undefined
                });
            }, _this.delayTimeForAnimationInSpeedometerResize);
            setTimeout(function () {
                _this.chart.load({
                    columns: _this.StaticsColumns
                });
            }, _this.delayTimeForAnimationInSpeedometerLoad);
        };

        parent.getPrintJson = function () {
            var chartJson = {
                bindto: '#' + _this.Id,
                data: {
                    columns: [[_this.sideways, 0], [_this.bearish, 0], [_this.bullish, 0]],
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
                    pattern: ['#8B8C91', '#CE4735', '#338473']
                },
                size: {
                    height: 90,
                    width: 190
                },
                tooltip: {
                    show: false
                },
                interaction: { enabled: false }
            };

            return chartJson;
        };

        _this.ActiveChange = function () {
            if (_this.Container.closest(".forecast_timeframe_slot").hasClass("active")) {
                _this.chart.flush();
            }
        };

        return _this;
    };
}(FXStreetWidgets.$));
(function ($) {
    FXStreetWidgets.Widget.Forecast = function (loaderBase) {
        var parent = FXStreetWidgets.Widget.Base(loaderBase),
            _this = FXStreetWidgets.Util.extendObject(parent);

        _this.Asset = null;
        _this.Date = null;
        _this.ClassSize = null;
        _this.HideFullReport = false;
        _this.WidgetId = "";
        _this.FullReportUrl = "";
        _this.Seo = false;

        _this.WeekSpeedometerId = "forecast_1w";
        _this.MonthSpeedometerId = "forecast_1m";
        _this.QuarterSpeedometerId = "forecast_1q";

        _this.Charts = [];

        _this.Bullish = "Bullish";
        _this.Bearish = "Bearish";
        _this.Sideways = "Sideways";

        _this.ForecastPeriodTimeType = {
            WEEK: "Week",
            MONTH: "Month",
            QUARTER: "Quarter"
        };

        _this.init = function (json) {
            _this.setSettingsByObject(json);
            var url = this.loaderBase.config.EndPoint + "?assetids=" + _this.Asset

            if (FXStreetWidgets.Util.isValid(_this.Date)) {
                url += "&date=" + _this.Date;
            }

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

            $.each(_this.ForecastPeriodTimeType, function (j, period) {
                var property = period + "Statics";
                studyData[property].BiasDisplay = _this.loaderBase.config.Translations[studyData[property].Bias];
            });

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
            _this.addTabOnClick();
        };

        _this.addSizeClass = function () {
            if (_this.ClassSize) {
                _this.Container.find('.fxs_forecast_widget').addClass(_this.ClassSize);
            }
        };

        _this.handleFullReport = function () {
            if (_this.HideFullReport) {
                _this.Container.find('.fxs_btn.fxs_btn_line.fxs_btn_small').remove();
            }
        };

        _this.addTabOnClick = function () {
            $(document).on('shown.bs.tab', 'a[data-toggle="tab"]', function (e) {
                _this.notifyChartsActiveChange();
            });
        };

        _this.notifyChartsActiveChange = function () {
            $.each(_this.Charts, function (i, chart) {
                chart.ActiveChange();
            });
        };

        //#region Charts

        _this.printCharts = function (studyData) {
            _this.instanciateSpeedpometer(studyData, _this.WeekSpeedometerId, _this.ForecastPeriodTimeType.WEEK);
            _this.instanciateSpeedpometer(studyData, _this.MonthSpeedometerId, _this.ForecastPeriodTimeType.MONTH);
            _this.instanciateSpeedpometer(studyData, _this.QuarterSpeedometerId, _this.ForecastPeriodTimeType.QUARTER);
        };

        _this.instanciateSpeedpometer = function (studyData, speedometerId, type) {
            var statics = studyData[type + "Statics"];

            var newSpeedometerId = speedometerId + _this.WidgetId;
            var chartId = newSpeedometerId + "_chart";

            _this.renderChart(speedometerId, newSpeedometerId, chartId, statics, type);

            var initJsonSpeedometer = {
                BullishPercent: statics.BullishPercent,
                BearishPercent: statics.BearishPercent,
                SidewaysPercent: statics.SidewaysPercent,
                Id: chartId
            };

            var forecastSpeedometer = new FXStreetWidgets.Chart.ForecastSpeedometer();
            forecastSpeedometer.init(initJsonSpeedometer);

            _this.Charts.push(forecastSpeedometer);
        };

        _this.renderChart = function (speedometerId, newSpeedometerId, chartId, statics, type) {
            var html = _this.getSpeedometerHtml(chartId, statics, type);

            var speedometer = _this.Container.find("#" + speedometerId);
            if (speedometer) {
                speedometer.attr("id", newSpeedometerId);
                speedometer.html(html);
            }

            var tab = _this.Container.find("a[href*='" + speedometerId + "']");
            if (tab) {
                var href = "#" + newSpeedometerId;
                tab.attr("href", href);
            }
        };

        _this.getSpeedometerHtml = function (chartId, statics, type) {
            var typeLiteral = _this.loaderBase.config.Translations[type];

            var biasClass = "";
            if (statics.Bias !== _this.Sideways) {
                biasClass = "result_" + statics.Bias.toLocaleLowerCase();
            }

            var mustacheJson = {
                ChartId: chartId,
                Type: typeLiteral,
                Statics: statics,
                Translations: _this.loaderBase.config.Translations,
                BiasClass: biasClass
            };

            var html = FXStreetWidgets.Util.renderByHtmlTemplate(_this.loaderBase.config.Mustaches["forecast_speedometer"], mustacheJson);
            return html;
        };

        //#endregion Charts

        var formatPrices = function (json, decimalPlaces) {
            if (json.WeekStatics.PriceAverage) {
                json.WeekStatics.PriceAverage = json.WeekStatics.PriceAverage.toFixed(decimalPlaces);
            }
            if (json.MonthStatics.PriceAverage) {
                json.MonthStatics.PriceAverage = json.MonthStatics.PriceAverage.toFixed(decimalPlaces);
            }
            if (json.QuarterStatics.PriceAverage) {
                json.QuarterStatics.PriceAverage = json.QuarterStatics.PriceAverage.toFixed(decimalPlaces);
            }
        }

        return _this;
    };
}(FXStreetWidgets.$));
(function ($) {
    FXStreetWidgets.Widget.LoaderForecast = function () {
        var options = {
            WidgetName: "forecast",
            EndPointV2: "api/v2/forecast/study/",
            EndPointTranslationV2: "api/v2/cultures/{culture}/forecast/",
            DefaultHost: "https://markettools.fxstreet.com/",
            Mustaches:
            {
                "forecast": "",
                "forecast_speedometer": ""
            },
            DefaultVersion: "v2",
            CustomJs: ["c3.min.js", "d3.min.js"]
        };

        var parent = new FXStreetWidgets.Widget.LoaderBase(options),
            _this = FXStreetWidgets.Util.extendObject(parent);

        parent.initWidgets = function (widgets) {
            $.each(widgets, function (i, forecast) {
                var jForecast = $(forecast);

                var initJson = {
                    Container: jForecast,
                    Asset: jForecast.attr("fxs_asset"),
                    Date: jForecast.attr("fxs_date"),
                    ClassSize: jForecast.attr("fxs_class_size"),
                    HideFullReport: FXStreetWidgets.Util.isUndefined(jForecast.attr("fxs_hide_fullreport")) ? false : true,
                    FullReportUrl: jForecast.attr("fxs_fullreport_url"),
                    WidgetId: FXStreetWidgets.Util.guid(),
                    Seo: FXStreetWidgets.Util.isUndefined(jForecast.attr("fxs_seo")) ? false : true
                };

                if (FXStreetWidgets.Util.isUndefined(initJson.Asset)) {
                    initJson.Asset = jForecast.attr("fxs_pair");//retrocompability
                }

                if (FXStreetWidgets.Util.isUndefined(initJson.FullReportUrl)) {
                    initJson.FullReportUrl = "/";
                }

                if (FXStreetWidgets.Util.isUndefined(initJson.Asset) || !initJson.Asset.startsWith('fxs-')) {
                    console.log("fxserror unable to create " + _this.config.WidgetName + ", asset not valid: " + initJson.Asset);
                } else {
                    var widget = new FXStreetWidgets.Widget.Forecast(_this);
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
        var loader = FXStreetWidgets.Widget.LoaderForecast();
        loader.init();
    })();
}(FXStreetWidgets.$));