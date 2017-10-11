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
    FXStreetWidgets.ForecastChartC3JsonBuilder = function () {
        var _this = {};

        var showPoint = false;
        var tooltipDelegate = function (d) {
            var parseDate = d3.time.format("%B %d, %Y");
            return parseDate(d);
        };
        var tooltipValueDelegate = null;
        var tooltipNameDelegate = null;
        var tooltipContentsDelegate = null;

        var assetDecimalPlaces = 2;

        var axisTooltipDelegate = function (d) {
            var parseDate = d3.time.format("%B %d, %Y");
            return parseDate(d);
        };

        var scatterPointRadDelegate = function (d) {
            return 1;
        };

        var decimalAxisDelegate = function (d) {
            var expression = '.{0}f'.replace('{0}', assetDecimalPlaces);
            var result = d3.format(expression);
            return result(d);
        };

        var dataRowConfigs = [];
        var barWidth = 0.0;
        var area = {
            hasArea: false,
            zerobased: false
        };
        var showY = false;
        var showY2 = true;
        var tooltipGrouped = true;
        var order = {
            hasOrder: false,
            value: false
        };
        var groups = [];
        var axisToModifyOrAdd = [];
        var rightPadding = 50;
        var leftPadding = 50;

        _this.withShowPoint = function (show) {
            showPoint = show;
            return _this;
        };

        _this.withTooltipDelegate = function (delegate) {
            tooltipDelegate = delegate;
            return _this;
        };

        _this.withRadiusDelegate = function (delegate) {
            scatterPointRadDelegate = delegate;
            return _this;
        };

        _this.withAxisTooltipDelegate = function (delegate) {
            axisTooltipDelegate = delegate;
            return _this;
        };

        _this.withTooltipValueDelegate = function (delegate) {
            tooltipValueDelegate = delegate;
            return _this;
        };

        _this.withTooltipContentsDelegate = function (delegate) {
            tooltipContentsDelegate = delegate;
            return _this;
        };

        _this.withTooltipNameDelegate = function (delegate) {
            tooltipNameDelegate = delegate;
            return _this;
        };

        _this.addDataColumnConfig = function (config) {
            dataRowConfigs.push(config);
            return _this;
        };

        _this.withBar = function (width) {
            barWidth = width;
            return _this;
        };

        _this.withAxis = function (axis) {
            axisToModifyOrAdd.push(axis);
            return _this;
        };

        _this.withArea = function (zerobased) {
            area.hasArea = true;
            area.zerobased = zerobased;
            return _this;
        };

        _this.withGroup = function () {
            var group = Array.from(arguments);
            groups.push(group);
            return _this;
        };

        _this.withOrder = function (value) {
            order.hasOrder = true;
            order.value = value;
            return _this;
        };

        _this.withShowY = function (value) {
            showY = value;
            return _this;
        };

        _this.withShowY2 = function (value) {
            showY2 = value;
            return _this;
        };

        _this.withTooltipGrouped = function (value) {
            tooltipGrouped = value;
            return _this;
        };

        _this.withRightPadding = function (padding) {
            rightPadding = padding;
            return _this;
        };

        _this.withLeftPadding = function (padding) {
            leftPadding = padding;
            return _this;
        };

        _this.build = function (columns, bindToSelector, assetDecimals) {
            if (!columns || !bindToSelector) {
                console.error("FXStreetWidgets: Invalid data. Couldn't build forecastcharts.");
                return {};
            }

            if (typeof assetDecimals !== 'undefined' && assetDecimals !== null) {
                assetDecimalPlaces = assetDecimals;
            }

            var result = {
                bindto: bindToSelector,
                data: {
                    xs: {},
                    xFormat: '%m/%d/%Y',
                    columns: columns,
                    axes: {},
                    names: {},
                    colors: {},
                    types: {},
                    classes: {},
                    groups: []
                },
                grid: {
                    x: {
                        show: true
                    },
                    y: {
                        show: true
                    }
                },
                axis: {
                    x: {
                        type: 'timeseries',
                        tick: {
                            format: '%b %Y',
                            culling: { max: 12 }
                        },
                        padding: {
                            right: rightPadding * 10000000,
                            left: leftPadding * 10000000
                        }
                    },
                    y: {
                        show: showY,
                        tick: {
                            format: decimalAxisDelegate
                        }
                    },
                    y2: {
                        show: showY2,
                        tick: {
                            format: decimalAxisDelegate
                        }
                    },
                    tooltip: {
                        format: {
                            title: axisTooltipDelegate
                        }
                    }
                },
                point: {
                    show: showPoint,
                    r: scatterPointRadDelegate
                },
                tooltip: {
                    format: {
                        title: tooltipDelegate
                    },
                    grouped: tooltipGrouped
                },
                legend: {
                    hide: []
                }
            };

            $.each(dataRowConfigs, function (i, config) {
                if (!config) return;

                if (config.axes) {
                    result.data.axes[config.name] = config.axes;
                }

                if (config.xs) {
                    result.data.xs[config.name] = config.xs;
                } else {
                    result.data.xs[config.name] = 'x';
                }

                if (config.names) {
                    result.data.names[config.name] = config.names;
                }

                if (config.colors) {
                    result.data.colors[config.name] = config.colors;
                }

                if (config.types) {
                    result.data.types[config.name] = config.types;
                }

                if (config.classes) {
                    result.data.classes[config.name] = config.classes;
                }

                if (config.hideLegend) {
                    result.legend.hide.push(config.name);
                }
            });

            $.each(groups, function (i, group) {
                result.data.groups.push(group);
            });

            if (order.hasOrder) {
                result.data.order = order.value;
            }

            if (barWidth > 0.0) {
                result.bar = {
                    width: {
                        ratio: barWidth
                    }
                };
            }

            $.each(axisToModifyOrAdd, function (i, axis) {
                result.axis[axis.name] = axis.value;
            });

            if (area.hasArea) {
                result.area = {
                    zerobased: area.zerobased
                };
            }

            if (tooltipValueDelegate) {
                result.tooltip.format.value = tooltipValueDelegate;
            }
            if (tooltipNameDelegate) {
                result.tooltip.format.name = tooltipNameDelegate;
            }
            if (tooltipContentsDelegate) {
                result.tooltip.contents = tooltipContentsDelegate;
            }

            return result;
        };

        return _this;
    };
})(FXStreetWidgets.$);
(function($) {
    FXStreetWidgets.Widget.ForecastChart = {};
    FXStreetWidgets.Widget.ForecastChart.Base = function () {
        var _this = {};

        _this.Data = null;
        _this.WidgetId = "";
        _this.Translations = null;
        _this.JsonC3 = {};

        _this.init = function (json) {
            _this.setSettingsByObject(json);
            _this.initJsonC3();
        };

        _this.initJsonC3 = function () {
            $.each(_this.ForecastPeriodType, function (key, periodType) {
                var periodTypeStatics = periodType.Statics;

                var timeseriesConfigs = _this.getTimeseriesConfigs(periodTypeStatics);
                var timeseries = _this.getMultipleTimeseries(timeseriesConfigs);

                var valuesConfigs = _this.getColumnsConfigsByPeriodType(periodTypeStatics);
                var values = _this.getColumns(valuesConfigs);

                var columns = timeseries.concat(values);

                var json = _this.buildJson(columns, key);
                _this.JsonC3[periodTypeStatics] = json;
            });
        };

        _this.getTimeseriesConfigs = function () {
            var result = [{ AxisName: 'x', Values: _this.Data.Values }];
            return result;
        };

        _this.getColumnsConfigsByPeriodType = function (periodType) {
            return [];
        };

        _this.buildJson = function (columns, key) { };

        _this.render = function () {
            renderChart(_this.JsonC3);
        };

        _this.setSettingsByObject = function (json) {
            for (var propName in json) {
                if (json.hasOwnProperty(propName)) {
                    if (this[propName] !== undefined) {
                        this[propName] = json[propName];
                    }
                }
            }
        };

        _this.ForecastPeriodType = {
            week: {
                Statics: "WeekStatics",
                Value: "WeekValue",
                Type: "WeekType",
                Order: 0
            },
            month: {
                Statics: "MonthStatics",
                Value: "MonthValue",
                Type: "MonthType",
                Order: 1
            },
            quarter: {
                Statics: "QuarterStatics",
                Value: "QuarterValue",
                Type: "QuarterType",
                Order: 2
            }
        };

        _this.getColumns = function (columnConfigs) {
            var columns = new Array();
            columnConfigs.forEach(function (columnConfig) {
                var row = getSingleColumn(columnConfig);
                columns.push(row);
            });
            return columns;
        };

        _this.getOffsetByForecastPeriodType = function (periodType) {

            if (periodType === _this.ForecastPeriodType.week.Statics) {
                return 1;
            }

            if (periodType === _this.ForecastPeriodType.month.Statics) {
                return 4;
            }

            if (periodType === _this.ForecastPeriodType.quarter.Statics) {
                return 12;
            }

            return 0;
        };

        _this.getValuesWithTimeOffset = function (values, offset, checkDateAfter, dateToCompare) {
            var shiftedValues = values.map(function (value) {
                date = moment(value.Date).add(offset, 'weeks').toDate();
                var newValue = $.extend(true, {}, value);
                newValue.Date = date.toISOString();
                return newValue;
            }).filter(function (value) {
                var result;
                if (checkDateAfter) {
                    result = moment(value.Date).isSameOrAfter(dateToCompare, 'day');
                } else {
                    result = moment(dateToCompare).isSameOrAfter(value.Date, 'day');
                }
                return result;
            });
            return shiftedValues;
        };

        _this.getMultipleTimeseries = function (timeseriesConfigs) {
            var timeseries = new Array();

            timeseriesConfigs.forEach(function (timeseriesConfig) {
                var timeseriesAxis = getTimeseriesAxis(timeseriesConfig.AxisName, timeseriesConfig.Values);
                timeseries.push(timeseriesAxis);
            });

            return timeseries;
        };

        _this.getAssetDecimalPlaces = function () {
            if (_this.Data.Values.length === 0) {
                return 2;
            }
            var firstResult = _this.Data.Values[0];
            return firstResult.Asset.DecimalPlaces;
        };

        var getSingleColumn = function (config) {
            var values = config.Values ? config.Values : _this.Data.Values;
            var result = new Array();

            result.push(config.RowTitle);

            for (var i = 0; i < values.length; i++) {
                var offsetValue = values[i];
                var value = config.ForecastType ? offsetValue[config.ForecastType][config.PropertyName] : offsetValue[config.PropertyName];
                var valuePushed = (value || value === 0) ? value : null;
                result.push(valuePushed);
            }

            return result;
        };

        var getTimeseriesAxis = function (name, values) {
            var result = new Array();

            var dateFormat = 'MM/DD/YYYY';
            result.push(name);
            $.each(values, function (j, value) {
                result.push(moment(value.Date).format(dateFormat));
            });

            return result;
        };

        var renderChart = function (json) {
            $.each(json, function (key, periodTimeData) {
                c3.generate(periodTimeData);
            });
        };

        return _this;
    };
})(FXStreetWidgets.$);
(function($) {
    FXStreetWidgets.Widget.ForecastChart.Overview = function () {
        var parent = FXStreetWidgets.Widget.ForecastChart.Base(),
            _this = FXStreetWidgets.Util.extendObject(parent);

        _this.ForecastData = null;
        _this.TooltipTemplate = "";

        var forecastStudies = null;

        _this.init = function (json) {
            _this.setSettingsByObject(json);
            parent.init(json);
        };

        parent.initJsonC3 = function () {
            setLocalVariables();
            var values = getColumnValues();
            var json = buildOverviewJson(values);
            _this.JsonC3['WeekStatics'] = json;
        };

        var setLocalVariables = function () {
            forecastStudies = getForecastEntries();
        };

        var getColumnValues = function () {
            var configTimeseries = [];
            var configColumns = [];

            var scatterColumns = getScatterColumns(forecastStudies);
            var lastDate = _this.Data.Values[0].Date;
            var firstDate = _this.Data.Values[_this.Data.Values.length - 1].Date;

            var closePriceConfig = {
                RowTitle: "ClosePrice_Row",
                PropertyName: "ClosePrice"
            };
            configColumns.push(closePriceConfig);

            $.each(_this.ForecastPeriodType, function (key, periodType) {
                var offset = _this.getOffsetByForecastPeriodType(periodType.Statics);
                var shiftedValues = _this.getValuesWithTimeOffset(_this.Data.Values, offset, true, moment(firstDate).add(12, 'weeks').format());

                configTimeseries.push({ AxisName: key + '_x', Values: shiftedValues });

                var entries = scatterColumns[periodType.Order];
                var transformedValues = entries.map(function () {
                    var value = {
                        Date: moment(lastDate).add(offset, 'weeks').format()
                    };
                    return value;
                });
                configTimeseries.push({ AxisName: key + '_scatter_x', Values: transformedValues });

                var averagePerPeriodConfig = {
                    Values: shiftedValues,
                    RowTitle: key + "_Average_Row",
                    PropertyName: "PriceAverage",
                    ForecastType: periodType.Statics
                };
                configColumns.push(averagePerPeriodConfig);
            });

            var xValues = _this.getValuesWithTimeOffset(_this.Data.Values, 0, true, moment(firstDate).add(12, 'weeks').format());
            configTimeseries.push({ AxisName: 'x', Values: xValues });

            var timeseries = _this.getMultipleTimeseries(configTimeseries);
            var columns = _this.getColumns(configColumns, false);

            var result = timeseries.concat(columns).concat(scatterColumns);
            return result;
        };

        var buildOverviewJson = function (values) {
            var cssClass = '#fxs_forecast_charts_overview_' + _this.WidgetId;
            var cssClassGraph = 'fxs_overview';
            var assetDecimals = _this.getAssetDecimalPlaces();

            var result = new FXStreetWidgets.ForecastChartC3JsonBuilder()
                .addDataColumnConfig({
                    name: "week_Average_Row",
                    axes: "y2",
                    xs: 'week_x',
                    names: '1 Week',
                    colors: "#04aab2",
                    classes: cssClassGraph + "_week"
                })
                .addDataColumnConfig({
                    name: "month_Average_Row",
                    axes: "y2",
                    xs: 'month_x',
                    names: '1 Month',
                    colors: "#304c70",
                    classes: cssClassGraph + "_month"
                })
                .addDataColumnConfig({
                    name: "quarter_Average_Row",
                    axes: "y2",
                    xs: 'quarter_x',
                    names: '3 Months',
                    colors: "#e4871b",
                    classes: cssClassGraph + "_quarter"
                })
                .addDataColumnConfig({
                    name: "week_Scatter_Row",
                    axes: "y2",
                    xs: "week_scatter_x",
                    names: "Last Week Forecast",
                    colors: "#04aab2",
                    classes: cssClassGraph + "_week_scatter",
                    types: "scatter",
                    hideLegend: true
                })
                .addDataColumnConfig({
                    name: "month_Scatter_Row",
                    axes: "y2",
                    xs: "month_scatter_x",
                    names: "Last Month Forecast",
                    colors: "#304c70",
                    classes: cssClassGraph + "_week_scatter",
                    types: "scatter",
                    hideLegend: true
                })
                .addDataColumnConfig({
                    name: "quarter_Scatter_Row",
                    axes: "y2",
                    xs: "quarter_scatter_x",
                    names: "Last Quarter Forecast",
                    colors: "#e4871b",
                    classes: cssClassGraph + "_week_scatter",
                    types: "scatter",
                    hideLegend: true
                })
                .addDataColumnConfig({
                    name: "ClosePrice_Row",
                    axes: "y2",
                    names: _this.Translations.ClosePrice,
                    colors: "#1b1c23",
                    classes: cssClassGraph + "_closeprice"
                })
                .withRadiusDelegate(scatterPointRadiusDelegate)
                .withTooltipContentsDelegate(tooltipContentsDelegate)
                .withTooltipGrouped(false)
                .withRightPadding(100)
                .build(values, cssClass, assetDecimals);
            return result;
        };

        var scatterPointRadiusDelegate = function (d) {
            if (d.id.indexOf('Scatter') === -1) { return 1; }

            var column = getColumnByName(forecastStudies, d.id);
            var rangeValue = column[d.index + 1];

            return rangeValue.TotalEntries * 3;
        };

        var tooltipContentsDelegate = function (d, defaultTitleFormat, defaultValueFormat, color) {
            var decimals = _this.getAssetDecimalPlaces();
            var decimalsFormat = ",.{0}f".replace("{0}", decimals);
            defaultValueFormat = d3.format(decimalsFormat);
            for (var i = 0; i < d.length; i++) {
                if (d[i].id.indexOf('Scatter') === -1) {
                    return this.getTooltipContent(d, defaultTitleFormat, defaultValueFormat, color);
                } else {
                    var column = getColumnByName(forecastStudies, d[i].id);
                    var forecastValue = column[d[i].index + 1];
                    var sentiment = forecastValue.SentimentType;
                    var totalAnalysts = forecastValue.TotalEntries;
                    var tooltipValue = forecastValue.TooltipValue || d[i].value;

                    var jsonData = {
                        Translations: _this.Translations,
                        Value: defaultValueFormat(tooltipValue),
                        Sentiment: sentiment,
                        TotalAnalysts: totalAnalysts
                    };
                    var rendered = FXStreetWidgets.Util.renderByHtmlTemplate(_this.TooltipTemplate, jsonData);
                    return rendered;
                }
            }
            return null;
        };

        var getColumnByName = function (columns, name) {
            for (var i = 0; i < columns.length; i++) {
                var column = columns[i];
                var columnName = column[0];
                if (typeof columnName === 'string') {
                    if (columnName === name) {
                        return column;
                    }
                }
            }
            return null;
        };

        var getForecastEntries = function () {
            var columnsResult = [];
            $.each(_this.ForecastPeriodType, function (key, periodType) {
                var column = [];
                var ranges = getScatterRanges(periodType);
                column.push(key + '_Scatter_Row');
                $.each(_this.ForecastData.Entries, function (index, entry) {
                    if (entry[periodType.Value]) {
                        var periodEntry = {
                            SentimentType: entry[periodType.Type],
                            Value: entry[periodType.Value]
                        };
                        column.push(periodEntry);
                    }
                });

                var mappedColumn = mapForecastEntriesInScatterRanges(column, ranges);
                columnsResult.push(mappedColumn);
            });
            return columnsResult;
        };

        var mapForecastEntriesInScatterRanges = function (column, ranges) {
            var result = [];
            result.push(column[0]);
            $.each(ranges, function (index, range) {
                var values = $.grep(column, function (forecastPeriodEntry) {
                    if (index < ranges.length - 1) {
                        return forecastPeriodEntry.Value >= ranges[index] && forecastPeriodEntry.Value < ranges[index + 1];
                    }

                    return forecastPeriodEntry.Value >= ranges[index];
                });

                if (values.length > 0) {
                    var forecastRangeEntry = {
                        Value: ranges[index],
                        TooltipValue: (index < ranges.length - 1) ? ((ranges[index + 1] - ranges[index]) / 2) + ranges[index] : ranges[index],
                        TotalEntries: values.length,
                        SentimentType: values[0].SentimentType
                    };
                    result.push(forecastRangeEntry);
                }
            });

            return result;

        };

        var getScatterRanges = function (periodType) {
            var forecastEntryValuesWithNulls = _this.ForecastData.Entries
                .map(function (entry) { return entry[periodType.Value]; });

            var forecastEntryValues = $.grep(forecastEntryValuesWithNulls, function (value) { return value !== null });

            var lastValuesByPeriod = _this.Data.Values[0][periodType.Statics];
            var lastPipsRange = lastValuesByPeriod.PipsRange;
            var lastLowPrice = Math.min.apply(Math, forecastEntryValues);
            var lastHighPrice = Math.max.apply(Math, forecastEntryValues);

            var result = [];
            for (var i = lastLowPrice; i <= lastHighPrice; i = i + lastPipsRange) {
                result.push(i);
            }

            return result;
        };

        var getScatterColumns = function (studies) {
            var result = new Array();
            $.each(studies, function (i, periodTypeStudy) {
                var entryValues = $.map(periodTypeStudy, function (entry, j) {
                    if (j === 0) {
                        return entry;
                    }
                    return entry.Value;
                });
                result.push(entryValues);
            });
            return result;
        };

        return _this;
    };
})(FXStreetWidgets.$);
(function($) {
    FXStreetWidgets.Widget.ForecastChart.Bias = function () {
        var parent = FXStreetWidgets.Widget.ForecastChart.Base(),
            _this = FXStreetWidgets.Util.extendObject(parent);

        parent.getColumnsConfigsByPeriodType = function (periodTypeStatics) {
            var closePriceConfig = {
                RowTitle: "ClosePrice_Row",
                PropertyName: "ClosePrice"
            };
            var priceAverageConfig = {
                RowTitle: "PriceAverage_Row",
                PropertyName: "PriceAverage",
                ForecastType: periodTypeStatics
            };
            var bullishConfig = {
                RowTitle: "Bullish_Row",
                PropertyName: "BullishPercent",
                ForecastType: periodTypeStatics
            };
            var bearishConfig = {
                RowTitle: "Bearish_Row",
                PropertyName: "BearishPercent",
                ForecastType: periodTypeStatics
            };
            var sidewaysConfig = {
                RowTitle: "Sideways_Row",
                PropertyName: "SidewaysPercent",
                ForecastType: periodTypeStatics
            };

            var result = [closePriceConfig, bearishConfig, sidewaysConfig, bullishConfig, priceAverageConfig];
            return result;
        };

        parent.buildJson = function (columns, key) {
            var cssClass = '#fxs_' + key + '_' + _this.WidgetId;
            var cssClassGraph = 'fxs_bias_' + key;
            var assetDecimals = _this.getAssetDecimalPlaces();

            var result = new FXStreetWidgets.ForecastChartC3JsonBuilder()
                .addDataColumnConfig({
                    name: "Bullish_Row",
                    axes: "y2",
                    names: _this.Translations.Bullish,
                    colors: "#338473",
                    classes: cssClassGraph + "_bullish",
                    types: "area"
                })
                .addDataColumnConfig({
                    name: "Sideways_Row",
                    axes: "y2",
                    names: _this.Translations.Sideways,
                    colors: "#a3a3a8",
                    classes: cssClassGraph + "_sideways",
                    types: "area"
                })
                .addDataColumnConfig({
                    name: "Bearish_Row",
                    axes: "y2",
                    names: _this.Translations.Bearish,
                    colors: "#d25746",
                    classes: cssClassGraph + "_bearish",
                    types: "area"
                })
                .addDataColumnConfig({
                    name: "ClosePrice_Row",
                    axes: "y",
                    names: _this.Translations.ClosePrice,
                    colors: "#1b1c23",
                    classes: cssClassGraph + "_closeprice"
                })
                .addDataColumnConfig({
                    name: "PriceAverage_Row",
                    axes: "y",
                    names: _this.Translations.Mean,
                    colors: "#04aab2",
                    classes: cssClassGraph + "_priceAverage"
                })
                .withArea(true)
                .withGroup("Bullish_Row", "Sideways_Row", "Bearish_Row")
                .withOrder(false)
                .withShowY(true)
                .withAxis({
                    name: "y2",
                    value: {
                        show: true,
                        tick: {
                            format: function (d) {
                                var result = d + "%";
                                return result;
                            }
                        },
                        min: 0,
                        max: 100,
                        padding: {
                            top: 0,
                            bottom: 0
                        }
                    }
                })
                .withLeftPadding(0)
                .withRightPadding(0)
                .withTooltipValueDelegate(function (value, ratio, id) {
                    if (id === "Bullish_Row" || id === "Sideways_Row" || id === "Bearish_Row") {
                        var result = value + "%";
                        return result;
                    }
                    return value;
                })
                .build(columns, cssClass, assetDecimals);
            return result;
        };

        return _this;
    };
})(FXStreetWidgets.$);
(function($) {
    FXStreetWidgets.Widget.ForecastChart.Averages = function () {
        var parent = FXStreetWidgets.Widget.ForecastChart.Base(),
            _this = FXStreetWidgets.Util.extendObject(parent);

        parent.getColumnsConfigsByPeriodType = function (periodTypeStatics) {
            var closePriceConfig = {
                RowTitle: "ClosePrice_Row",
                PropertyName: "ClosePrice"
            };

            var meanConfig = {
                RowTitle: "Mean_Row",
                PropertyName: "PriceAverage",
                ForecastType: periodTypeStatics
            };
            var medianConfig = {
                RowTitle: "Median_Row",
                PropertyName: "PriceMedian",
                ForecastType: periodTypeStatics
            };
            var modeConfig = {
                RowTitle: "Mode_Row",
                PropertyName: "PriceMode",
                ForecastType: periodTypeStatics
            };

            var result = [closePriceConfig, meanConfig, medianConfig, modeConfig];
            return result;
        };

        parent.buildJson = function (columns, key) {
            var cssClass = '#fxs_' + key + '_' + _this.WidgetId;
            var cssClassGraph = 'fxs_averages_' + key;
            var assetDecimals = _this.getAssetDecimalPlaces();

            var result = new FXStreetWidgets.ForecastChartC3JsonBuilder()
                .addDataColumnConfig({
                    name: "ClosePrice_Row",
                    axes: "y2",
                    names: _this.Translations.ClosePrice,
                    colors: "#1b1c23",
                    classes: cssClassGraph + "_closeprice"
                })
                .addDataColumnConfig({
                    name: "Mean_Row",
                    axes: "y2",
                    names: _this.Translations.Mean,
                    colors: "#04aab2",
                    classes: cssClassGraph + "_mean"
                })
                .addDataColumnConfig({
                    name: "Median_Row",
                    axes: "y2",
                    names: _this.Translations.Median,
                    colors: "#e4871b",
                    classes: cssClassGraph + "_median"
                })
                .addDataColumnConfig({
                    name: "Mode_Row",
                    axes: "y2",
                    names: _this.Translations.Mode,
                    colors: "#d1495b",
                    classes: cssClassGraph + "_mode"
                })
                .build(columns, cssClass, assetDecimals);
            return result;
        };

        return _this;
    };
})(FXStreetWidgets.$);
(function($) {
    FXStreetWidgets.Widget.ForecastChart.ShiftedPrice = function () {
        var parent = FXStreetWidgets.Widget.ForecastChart.Base(),
            _this = FXStreetWidgets.Util.extendObject(parent);

        var shiftedValues = {};

        _this.init = function (json) {
            _this.setSettingsByObject(json);
            setShiftedValues();
            parent.init(json);
        };

        var setShiftedValues = function () {
            $.each(_this.ForecastPeriodType, function (key, periodType) {
                var offset = _this.getOffsetByForecastPeriodType(periodType.Statics);
                var values = _this.getValuesWithTimeOffset(_this.Data.Values, -offset, true, _this.Data.Values[_this.Data.Values.length - 1].Date);
                shiftedValues[periodType.Statics] = values;
            });
        };

        parent.getTimeseriesConfigs = function (periodTypeStatics) {
            var shiftedAxisConfig = {
                AxisName: 'shifted_x',
                Values: shiftedValues[periodTypeStatics]
            };
            var defaultAxis = {
                AxisName: 'x',
                Values: _this.Data.Values
            };

            var result = [shiftedAxisConfig, defaultAxis];
            return result;
        };

        parent.getColumnsConfigsByPeriodType = function (periodTypeStatics) {
            var shiftedPriceConfig = {
                Values: shiftedValues[periodTypeStatics],
                RowTitle: "PreviousClose_Row",
                PropertyName: "ClosePrice"
            };

            var meanConfig = {
                RowTitle: "Mean_Row",
                PropertyName: "PriceAverage",
                ForecastType: periodTypeStatics
            };
            var medianConfig = {
                RowTitle: "Median_Row",
                PropertyName: "PriceMedian",
                ForecastType: periodTypeStatics
            };
            var modeConfig = {
                RowTitle: "Mode_Row",
                PropertyName: "PriceMode",
                ForecastType: periodTypeStatics
            };

            var result = [shiftedPriceConfig, meanConfig, medianConfig, modeConfig];
            return result;
        };

        parent.buildJson = function (columns, key) {
            var cssClass = '#fxs_' + key + '_' + _this.WidgetId;
            var cssClassGraph = 'fxs_shiftedprice_' + key;
            var assetDecimals = _this.getAssetDecimalPlaces();

            var result = new FXStreetWidgets.ForecastChartC3JsonBuilder()
                .addDataColumnConfig({
                    xs: 'shifted_x',
                    name: "PreviousClose_Row",
                    axes: "y2",
                    names: _this.Translations.ShiftedPrice,
                    colors: "#1b1c23",
                    classes: cssClassGraph + "_previousclose"
                })
                .addDataColumnConfig({
                    name: "Mean_Row",
                    axes: "y2",
                    names: _this.Translations.Mean,
                    colors: "#04aab2",
                    classes: cssClassGraph + "_mean"
                })
                .addDataColumnConfig({
                    name: "Median_Row",
                    axes: "y2",
                    names: _this.Translations.Median,
                    colors: "#e4871b",
                    classes: cssClassGraph + "_median"
                })
                .addDataColumnConfig({
                    name: "Mode_Row",
                    axes: "y2",
                    names: _this.Translations.Mode,
                    colors: "#d1495b",
                    classes: cssClassGraph + "_mode"
                })
                .build(columns, cssClass, assetDecimals);
            return result;
        }

        return _this;
    };
})(FXStreetWidgets.$);
(function($) {
    FXStreetWidgets.Widget.ForecastChart.PriceChange = function () {
        var parent = FXStreetWidgets.Widget.ForecastChart.Base(),
            _this = FXStreetWidgets.Util.extendObject(parent);

        parent.getColumnsConfigsByPeriodType = function (periodTypeStatics) {
            var weeklyPriceChangeConfig = {
                RowTitle: "PriceChange_Row",
                PropertyName: "WeeklyPriceChange"
            };
            var meanConfig = {
                RowTitle: "Mean_Row",
                PropertyName: "PriceAverage",
                ForecastType: periodTypeStatics
            };
            var medianConfig = {
                RowTitle: "Median_Row",
                PropertyName: "PriceMedian",
                ForecastType: periodTypeStatics
            };
            var modeConfig = {
                RowTitle: "Mode_Row",
                PropertyName: "PriceMode",
                ForecastType: periodTypeStatics
            };

            var result = [weeklyPriceChangeConfig, meanConfig, medianConfig, modeConfig];
            return result;
        };

        parent.buildJson = function (columns, key) {
            var cssClass = '#fxs_' + key + '_' + _this.WidgetId;
            var cssClassGraph = 'fxs_pricechange_' + key;
            var assetDecimals = _this.getAssetDecimalPlaces();

            var result = new FXStreetWidgets.ForecastChartC3JsonBuilder()
                .addDataColumnConfig({
                    name: "PriceChange_Row",
                    axes: "y",
                    names: _this.Translations.PriceChange,
                    types: "bar",
                    colors: "#a3a3a8",
                    classes: cssClassGraph + "_pricechange"
                })
                .addDataColumnConfig({
                    name: "Mean_Row",
                    axes: "y2",
                    names: _this.Translations.Mean,
                    colors: "#04aab2",
                    classes: cssClassGraph + "_mean"
                })
                .addDataColumnConfig({
                    name: "Median_Row",
                    axes: "y2",
                    names: _this.Translations.Median,
                    colors: "#e4871b",
                    classes: cssClassGraph + "_median"
                })
                .addDataColumnConfig({
                    name: "Mode_Row",
                    axes: "y2",
                    names: _this.Translations.Mode,
                    colors: "#d1495b",
                    classes: cssClassGraph + "_mode"
                })
                .withAxis({
                    name: "y",
                    value: {
                        show: true,
                        tick: {
                            format: function (v) { return v.toFixed(2) + '%'; },
                            count: 5
                        }
                    }
                })
                .withBar(0.5)
                .build(columns, cssClass, assetDecimals);
            return result;
        };

        return _this;
    };
})(FXStreetWidgets.$);
(function($) {
    FXStreetWidgets.Widget.ForecastChart.SmoothAverage = function () {
        var parent = FXStreetWidgets.Widget.ForecastChart.Base(),
            _this = FXStreetWidgets.Util.extendObject(parent);

        parent.getColumnsConfigsByPeriodType = function (periodTypeStatics) {
            var closePriceConfig = {
                RowTitle: "ClosePrice_Row",
                PropertyName: "ClosePrice"
            };
            var smoothAverageConfig = {
                RowTitle: "Average_Row",
                PropertyName: "Average",
                ForecastType: periodTypeStatics
            };

            var result = [closePriceConfig, smoothAverageConfig];
            return result;
        };

        parent.buildJson = function (columns, key) {
            var cssClass = '#fxs_' + key + '_' + _this.WidgetId;
            var cssClassGraph = 'fxs_smoothaverage_' + key;
            var assetDecimals = _this.getAssetDecimalPlaces();

            var result = new FXStreetWidgets.ForecastChartC3JsonBuilder()
                .addDataColumnConfig({
                    name: "Average_Row",
                    axes: "y2",
                    names: _this.Translations.SmoothAverage,
                    colors: "#8C2BD8",
                    classes: cssClassGraph + "_average"
                })
                .addDataColumnConfig({
                    name: "ClosePrice_Row",
                    axes: "y2",
                    names: _this.Translations.ClosePrice,
                    colors: "#1b1c23",
                    classes: cssClassGraph + "_closeprice"
                })
                .build(columns, cssClass, assetDecimals);
            return result;
        }

        return _this;
    };
})(FXStreetWidgets.$);
(function($) {
    FXStreetWidgets.Widget.ForecastChart.MinMax = function () {
        var parent = FXStreetWidgets.Widget.ForecastChart.Base(),
            _this = FXStreetWidgets.Util.extendObject(parent);

        parent.getColumnsConfigsByPeriodType = function (periodTypeStatics) {
            var closePriceConfig = {
                RowTitle: "ClosePrice_Row",
                PropertyName: "ClosePrice"
            };
            var highPriceConfig = {
                RowTitle: "HighPrice_Row",
                PropertyName: "HighPrice",
                ForecastType: periodTypeStatics
            };
            var lowPriceConfig = {
                RowTitle: "LowPrice_Row",
                PropertyName: "LowPrice",
                ForecastType: periodTypeStatics
            };

            var result = [closePriceConfig, highPriceConfig, lowPriceConfig];
            return result;
        };

        parent.buildJson = function (columns, key) {
            var cssClass = '#fxs_' + key + '_' + _this.WidgetId;
            var cssClassGraph = 'fxs_minmax_' + key;
            var assetDecimals = _this.getAssetDecimalPlaces();

            var result = new FXStreetWidgets.ForecastChartC3JsonBuilder()
                .addDataColumnConfig({
                    name: "HighPrice_Row",
                    axes: "y2",
                    names: _this.Translations.Max,
                    colors: "#338473",
                    classes: cssClassGraph + "_max"
                })
                .addDataColumnConfig({
                    name: "LowPrice_Row",
                    axes: "y2",
                    names: _this.Translations.Minim,
                    colors: "#D25746",
                    classes: cssClassGraph + "_min"
                })
                .addDataColumnConfig({
                    name: "ClosePrice_Row",
                    axes: "y2",
                    names: _this.Translations.ClosePrice,
                    colors: "#1b1c23",
                    classes: cssClassGraph + "_closeprice"
                })
                .build(columns, cssClass, assetDecimals);
            return result;
        };

        return _this;
    };
})(FXStreetWidgets.$);
(function ($) {
    FXStreetWidgets.Widget.ForecastChartsManager = function (loaderBase) {
        var parent = FXStreetWidgets.Widget.Base(loaderBase),
            _this = FXStreetWidgets.Util.extendObject(parent);

        _this.Asset = null;
        _this.ClassSize = null;
        _this.WidgetId = "";
        _this.Seo = false;
        _this.ForecastData = null;
        _this.TooltipMustacheName = "";
        _this.jsonData = {};

        var Translations = {};
        var filterButtons = {};
        var activeContainerClass = "";

        var charts = {};

        _this.init = function (json) {
            _this.setSettingsByObject(json);
            _this.setVars();
        };

        _this.setVars = function () {
            var url = getUrl();
            _this.loadDataFromUrl(url);
        };

        _this.renderHtml = function () {
            initJsonData();
            var mustache = _this.loaderBase.config.Mustaches[_this.loaderBase.config.WidgetName];
            var rendered = FXStreetWidgets.Util.renderByHtmlTemplate(mustache, _this.jsonData);
            _this.Container.html(rendered);

            initChartObjects();
            initFilters();
            charts["Overview"].render();
        };

        var getUrl = function () {
            var currentDate = new Date();
            var UTCdateNow = currentDate.toISOString();

            currentDate.setMonth(currentDate.getMonth() - 12);
            var UTCdateFrom = currentDate.toISOString();

            var result = _this.loaderBase.config.EndPoint + "?assetIds=" + _this.Asset + "&dateFrom=" + UTCdateFrom + "&dateTo=" + UTCdateNow;
            return result;
        };

        var initJsonData = function () {
            Translations = _this.loaderBase.config.Translations;

            _this.jsonData = {
                Values: {},
                Filters: {},
                Translations: Translations,
                WidgetId: _this.WidgetId
            };
            setFiltersToJson();
        };

        var initChartObjects = function() {
            var json = {
                Data: _this.data,
                WidgetId: _this.WidgetId,
                ForecastData: _this.ForecastData,
                TooltipTemplate: _this.loaderBase.config.Mustaches[_this.TooltipMustacheName],
                Translations: Translations
            };

            $.each(_this.jsonData.Filters, function (index, filter) {
                var obj = new FXStreetWidgets.Widget.ForecastChart[filter.Selector]();
                obj.init(json);
                charts[filter.Selector] = obj;
            });
        };

        var setFiltersToJson = function () {
            _this.jsonData.Filters =
            [
                {
                    'Title': Translations.Overview,
                    'Selector': 'Overview'
                }, {
                    'Title': Translations.Bias,
                    'Selector': 'Bias'
                }, {
                    'Title': Translations.Averages,
                    'Selector': 'Averages'
                }, {
                    'Title': Translations.ShiftedPrice,
                    'Selector': 'ShiftedPrice'
                }, {
                    'Title': Translations.PriceChange,
                    'Selector': 'PriceChange'
                }, {
                    'Title': Translations.SmoothAverage,
                    'Selector': 'SmoothAverage'
                }, {
                    'Title': Translations.MinimMax,
                    'Selector': 'MinMax'
                }
            ];
        };

        var initFilters = function () {
            $.each(_this.jsonData.Filters,
                function (i, filter) {
                    var selector = "#forecast_charts_filter_{0}_{1}".replace('{0}', filter.Selector).replace('{1}', _this.WidgetId);
                    var filterBtn = _this.Container.find(selector);

                    filterBtn.click(function () {
                        onFilterClick(filter);
                    });

                    if (filter.Selector === 'Overview') {
                        filterBtn.addClass('active');
                        var containerClass = "fxs_forecast_charts_container_" + filter.Selector;
                        _this.Container.addClass(containerClass);
                        activeContainerClass = containerClass;
                    }

                    filterButtons[filter.Selector] = filterBtn;
                });
        };

        var onFilterClick = function (filter) {
            for (var objKey in filterButtons) {
                if (filterButtons.hasOwnProperty(objKey)) {
                    filterButtons[objKey].removeClass('active');
                }
            }
            filterButtons[filter.Selector].addClass('active');

            var containerClass = "fxs_forecast_charts_container_" + filter.Selector;
            _this.Container.removeClass(activeContainerClass);
            _this.Container.addClass(containerClass);
            activeContainerClass = containerClass;

            charts[filter.Selector].render();
        };

        return _this;
    };
}(FXStreetWidgets.$));
(function ($) {
    FXStreetWidgets.Widget.LoaderForecastCharts = function () {
        var options = {
            WidgetType: "MarketTools",
            WidgetName: "forecastcharts",
            EndPointV2: "api/v2/forecast/historic",
            EndPointTranslationV2: "api/v2/cultures/{culture}/forecast/", 
            DefaultHost: "https://markettools.fxstreet.com/",
            DefaultVersion: "v2",
            Mustaches: { "forecastcharts": "", "forecastcharts_tooltip": "" },
            CustomJs: ["c3.min.js", "d3.min.js"]
        };

        var parent = new FXStreetWidgets.Widget.LoaderBase(options),
            _this = FXStreetWidgets.Util.extendObject(parent);

        parent.initWidgets = function (widgets) {
            $.each(widgets, function (i, forecast) {
                var jForecast = $(forecast);
                var assetId = jForecast.attr("fxs_asset");
                
                var url = _this.getHost() + 'api/' + _this.getVersion() + '/forecast/' + FXStreetWidgets.Configuration.getCulture() + '/study/';

                if (assetValid(assetId)) {
                    url += "?assetIds=" + assetId;
                }

                FXStreetWidgets.Util.ajaxJsonGetter(url)
                    .done(function (forecastData) {
                        var initJson = {
                            Container: jForecast,
                            Asset: assetId,
                            ClassSize: jForecast.attr("fxs_class_size"),
                            WidgetId: FXStreetWidgets.Util.guid(),
                            Seo: FXStreetWidgets.Util.isUndefined(jForecast.attr("fxs_seo")) ? false : true,
                            ForecastData: forecastData.Values.length > 0 ? forecastData.Values[0] : null,
                            TooltipMustacheName: "forecastcharts_tooltip"
                        };

                        var widget = new FXStreetWidgets.Widget.ForecastChartsManager(_this);
                        widget.init(initJson);
                    })
                    .fail(function () {
                        console.error("fxserror: Couldn't get forecast data");
                    });
            });
        };

        var assetValid = function (assetId) {
            if (!assetId) {
                return false;
            }

            try {
                if (FXStreetWidgets.Util.isUndefined(assetId) || !assetId.startsWith('fxs-')) {
                    throw assetId;
                }
                return true;
            } catch (ex) {
                console.log("fxserror unable to create " + _this.config.WidgetName + ", asset not valid: " + ex.message);
                return false;
            }
        };

        return _this;
    };

    (function () {
        var loader = FXStreetWidgets.Widget.LoaderForecastCharts();
        loader.init();
    })();
}(FXStreetWidgets.$));