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
    FXStreetWidgets.Widget.CotPositioning = function (loaderBase) {
        var parent = FXStreetWidgets.Widget.Base(loaderBase),
            _this = FXStreetWidgets.Util.extendObject(parent);

        _this.AssetId = "";
        _this.ClassSize = "";
        _this.HideFullReport = "";
        _this.FullReportUrl = "";
        _this.WidgetId = null;
        _this.Seo = false;

        _this.detailColor = '#1b1c23';

        _this.init = function (json) {
            _this.setSettingsByObject(json);
            var url = this.loaderBase.config.EndPoint + _this.AssetId;
            _this.loadDataFromUrl(url);
        };

        _this.convertToPrettyValue = function (value) {

            var rep = Math.abs(parseInt(value));

            rep = rep + ''; // coerce to string
            if (rep < 1000) {
                return rep; // return the same number
            }
            if (rep < 10000) { // place a comma between
                return rep.charAt(0) + ',' + rep.substring(1);
            }
            // divide and format
            var result = (rep / 1000).toFixed(rep % 1000 != 0) + _this.loaderBase.config.Translations.Kilo;
            if (value < 0) return "-" + result;
            else return result;
        };

        _this.convertToPrettyDate = function(value) {
            return moment(value).format("MMM D");
        };

        _this.formatStudy = function (json) {
            var study = {};

            var nonCommercialLength = json.NonCommercial.length - 1;
            var commercialLength = json.Commercial.length - 1;

            study.NonCommercialLastPrettyValue = _this.convertToPrettyValue(json.NonCommercial[0].Value);
            study.NonCommercialFirstPrettyValue = _this.convertToPrettyValue(json.NonCommercial[nonCommercialLength].Value);
            study.NonCommercialFirstPrettyDate = _this.convertToPrettyDate(json.NonCommercial[nonCommercialLength].Date.Value);

            study.CommercialLastPrettyValue = _this.convertToPrettyValue(json.Commercial[0].Value);
            study.CommercialFirstPrettyValue = _this.convertToPrettyValue(json.Commercial[commercialLength].Value);
            study.CommercialFirstPrettyDate = _this.convertToPrettyDate(json.Commercial[commercialLength].Date.Value);

            study.CommercialLastDate = _this.convertToPrettyDate(json.Commercial[0].Date.Value);

            study = _this.setDatesToJson(study, json.Commercial[0].Date);

            return study;
        };

        _this.renderHtml = function () {
            var studyData = _this.data.Values[0];

            var jsonData = {
                Study: _this.formatStudy(studyData),
                Translations: _this.loaderBase.config.Translations,
                FullReportUrl: _this.FullReportUrl,
                Seo: _this.Seo
            };

            var rendered = FXStreetWidgets.Util.renderByHtmlTemplate(_this.loaderBase.config.Mustaches[_this.loaderBase.config.WidgetName], jsonData);
            _this.Container.html(rendered);

            _this.manageRenderedHtml();
            _this.renderCharts(studyData);
        };

        _this.manageRenderedHtml = function () {
            _this.addSizeClass();
            _this.handleFullReport();
        };

        _this.addSizeClass = function () {
            if (_this.ClassSize) {
                _this.Container.find('.fxs_cot_widget').addClass(_this.ClassSize);
            }
        };

        _this.handleFullReport = function () {
            if (_this.HideFullReport) {
                _this.Container.find('.fxs_btn.fxs_btn_line.fxs_btn_small').remove();
            }
        };

        //#region Charts

        _this.renderCharts = function (studyData) {
            _this.renderChart(1, studyData);
        };

        _this.renderChart = function (chartNumId, values) {
            
            var nonCommercialData = values.NonCommercial;
            var commercialData = values.Commercial;

            var columns = ['x'];            
            var dates = ['noncommercial'];
            
            nonCommercialData.forEach(function (item) {
                var formattedDate = moment(item.Date).format("YYYY-MM-DD");
                columns.push(formattedDate);
                dates.push(item.Value);
            });

            var nonCommercialChart = c3.generate({
                bindto: '#non_commercial',
                data: {
                    x: 'x',
                    columns: [columns,dates],
                    colors: { noncommercial: _this.detailColor },
                    names: { noncommercial: 'Non-Commercial' }
                },
                axis: {
                    x: {
                        show: false,
                        type: 'timeseries',
                        tick: { format: '%Y-%m-%d' }
                    },
                    y: { show: false }
                },
                legend: { show: false },
                size: { height: 47 },
                point: {
                    r: 2.4,
                    focus: {
                        expand: { r: 3 },
                        select: { r: 3 }
                    }
                }
            });

            columns = ['x'];
            dates = ['commercial'];

            commercialData.forEach(function (item) {
                var formattedDate = moment(item.Date).format("YYYY-MM-DD");
                columns.push(formattedDate);
                dates.push(item.Value);
            });

            var commercialChart = c3.generate({
                bindto: '#commercial',
                data: {
                    x: 'x',
                    columns: [columns, dates],
                    colors: { commercial: _this.detailColor },
                    names: { commercial: "Commercial" }
                },
                axis: {
                    x: {
                        show: false,
                        type: 'timeseries',
                        tick: { format: '%Y-%m-%d' }
                    },
                    y: { show: false }
                },
                legend: { show: false },
                size: { height: 47 },
                point: {
                    r: 2.4,
                    focus: {
                        expand: { r: 3 },
                        select: { r: 3 }
                    }
                }
            });
        }

        _this.setToolTip = function () {
            _this.Container.find('[data-toggle="tooltip"]').tooltip();
        };
        
        return _this;
    };
}(FXStreetWidgets.$));
(function ($) {
    FXStreetWidgets.Widget.LoaderCot = function () {
        var options = {
            WidgetType: "MarketTools",
            WidgetName: "cotpositioning",
            EndPointV2: "api/v2/cot/netpositioning/",
            EndPointTranslationV2: "api/v2/cultures/{culture}/cot/",
            DefaultHost: "https://markettools.fxstreet.com/",
            Mustaches:
                {
                    "cotpositioning": ""
                },
            DefaultVersion: "v2",
            CustomJs: ["c3.min.js", "d3.min.js"]
        };

        var parent = FXStreetWidgets.Widget.LoaderBase(options),
            _this = FXStreetWidgets.Util.extendObject(parent);

        parent.initWidgets = function (widgets) {
            $.each(widgets, function (i, cotPositioning) {
                var jcotPositioning = $(cotPositioning);

                var initJson = {
                    Container: jcotPositioning,
                    AssetId: jcotPositioning.attr("fxs_asset"),
                    ClassSize: jcotPositioning.attr("fxs_class_size"),
                    HideFullReport: FXStreetWidgets.Util.isUndefined(jcotPositioning.attr("fxs_hide_fullreport")) ? false : true,
                    FullReportUrl: jcotPositioning.attr("fxs_fullreport_url"),
                    WidgetId: FXStreetWidgets.Util.guid(),
                    Seo: FXStreetWidgets.Util.isUndefined(jcotPositioning.attr("fxs_seo")) ? false : true
                };

                if (FXStreetWidgets.Util.isUndefined(initJson.FullReportUrl)) {
                    initJson.FullReportUrl = "/";
                }

                if (FXStreetWidgets.Util.isUndefined(initJson.AssetId) || !initJson.AssetId.startsWith('fxs-')) {
                    console.log("fxserror unable to create " + _this.config.WidgetName + ", asset not valid: " + initJson.AssetId);
                } else {
                    var widget = new FXStreetWidgets.Widget.CotPositioning(_this);
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
        var loader = new FXStreetWidgets.Widget.LoaderCot();
        loader.init();
    })();
}(FXStreetWidgets.$));