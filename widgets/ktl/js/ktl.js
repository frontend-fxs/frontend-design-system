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

    FXStreetWidgets.Widget.Ktl = function (loaderBase) {

        var parent = FXStreetWidgets.Widget.Base(loaderBase),
            _this = FXStreetWidgets.Util.extendObject(parent);

        _this.ContainerId = null;
        _this.WidgetId = null;
        _this.AssetPair = null;
        _this.Calculations = null;
        _this.Range = null;
        _this.NumberOfRows = null;
        _this.PonderationManager = null;
        _this.Height = null;

        _this.KtlSettings = null;
        var periods = null;

        _this.init = function (json) {
            _this.setSettingsByObject(json);
            _this.setVars(json);

            var url = _this.getUrl();
            _this.loadDataFromUrl(url);
        };

        _this.setVars = function (json) {
            _this.PonderationManager = new FXStreetWidgets.Widget.Ktl.PonderationManager();
            _this.PonderationManager.init(json);
            
            _this.KtlSettings = new FXStreetWidgets.Widget.Ktl.Settings();
            _this.KtlSettings.init();

            periods = _this.KtlSettings.Periods;
        };

        _this.getUrl = function () {
            var uriParameters = "/" + _this.AssetPair;

            if (_this.Range && _this.Range.Max && _this.Range.Min) {
                uriParameters = uriParameters + "/" + _this.Range.Max + "/" + _this.Range.Min + "/";
            };

            var result = this.loaderBase.config.EndPoint + uriParameters;
            return result;
        };

        _this.jsonDataIsValid = function (data) {
            var result = (data !== null);
            return result;
        };

        var loadCalculations = function () {
            _this.Calculations = _this.PonderationManager.getData(_this.data,_this.loaderBase.config.Translations);
        };

        var changeTab = function (e) {
            var items = $.grep(periods, function (element) { return element.Id === e.currentTarget.id;});
            if (items.length === 0) return null;

            var item = items[0];
            var id = item.Id;
            var period = item.PeriodName;

            $.each(periods, function (key, value) {
                if (value.Id === id) {
                    value.IsActive = true;
                } else {
                    value.IsActive = false;
                }
            });

           _this.renderHtml(period);
        };

        
        var getTooltipObj = function(e) {
            var rowId = e.currentTarget.getAttribute('fxs-row-id');
            var result = FXStreet.Util.getjQueryObjectById("fxs_ktl_data_row_tooltip_" + rowId,false);
            return result;
        }

        var mouseOverRow = function (e) {
            var tooltip = getTooltipObj(e);
            if (!tooltip) return;
            tooltip.css({ top: e.clientY, left:e.clientX});
        };

        var addEvents = function (rows) {

            $.each(periods, function (key, value) {
                    var tab = FXStreet.Util.getjQueryObjectById(value.Id);
                    tab.click(changeTab);
            });

            $.each(rows,
                function (data, row) {
                    var rowObj = FXStreet.Util.getjQueryObjectById("fxs_ktl_data_row_" + row.Id);
                        rowObj.on('mousemove', mouseOverRow);
                        rowObj.on('scroll', mouseOverRow);
            });
        };

        var getRowsToDrawByPeriod = function (period) {
            var result = (!period) ? _this.Calculations[_this.KtlSettings.getDefaultPeriodType()] : _this.Calculations[period];
            $.each(result, function (key, value) { if (key % 2) value.MaxPrice = ""; });
            return result;
        };

        _this.renderHtml = function (period) {
            if (!_this.Calculations) loadCalculations();

            var rows = getRowsToDrawByPeriod(period);
            var jsonData =
            {
                Periods: periods,
                Data: { Rows: rows },
                Translations: _this.loaderBase.config.Translations,
                Height: _this.Height
            };

            var rendered =
                FXStreetWidgets.Util.renderByHtmlTemplate(
                    _this.loaderBase.config.Mustaches[_this.loaderBase.config.WidgetName],
                    jsonData);
            _this.Container.html(rendered);
            addEvents(rows);
        };

        return _this;
    };

    FXStreetWidgets.Widget.Ktl.PonderationManager = function (loaderBase) {

        var parent = FXStreetWidgets.Widget.Base(loaderBase),
            _this = FXStreetWidgets.Util.extendObject(parent);

        var rangeConfiguration = null;

        _this.PonderationStrategies = null;
        _this.Range = null;
        _this.NumberOfRows = null;
        _this.PeriodSettings = null;
        _this.KtlLogging = null;
        _this.KtlSettings = null;
        _this.Translations = null;

        _this.init = function (json) {
            _this.setSettingsByObject(json);
            _this.setVars(json);
        };

        _this.setVars = function () {
            _this.PonderationStrategies = new FXStreetWidgets.Widget.Ktl.PonderationStrategies();
            _this.PonderationStrategies.init();
            
            _this.KtlLogging = new FXStreetWidgets.Widget.Ktl.Logging();
            _this.KtlLogging.init();

            _this.KtlSettings = new FXStreetWidgets.Widget.Ktl.Settings();
            _this.KtlSettings.init();

            rangeConfiguration = _this.KtlSettings.Range;

        };

        var calculateMaxPonderationValue = function (items) {
            var result = 0;
            $.each(items,
                function (key, value) {
                    if (value.Ponderation.Value > result)
                        result = value.Ponderation.Value;
                });
            return result;
        };

        var setPonderationPercentage = function (result) {
            var maxPonderationValue = calculateMaxPonderationValue(result);
            $.each(result,
                function (key, value) {
                    var percentage = (value.Ponderation.Value / maxPonderationValue) * 100;
                    value.Ponderation.Percentage = (percentage / (1 + (_this.KtlSettings.RowReductionLengthPercentage / 100)));
                });
        };

        var setPonderationColor = function (result) {
            var maxPonderationValue = calculateMaxPonderationValue(result);
            $.each(result,
                function (key, value) {
                    var matches = (!value.Ponderation.Value) ? 1 : value.Ponderation.Value;
                    var color = Math.round((matches / maxPonderationValue) * 10);
                    value.Ponderation.Color = color;
                });
        };

        var getPonderation = function (object, price) {
            var result = [];
            for (var objectName in object) {
                if (object.hasOwnProperty(objectName)) {
                    var calculationObject = object[objectName];

                    var ponderationData = { objectName: objectName, object: calculationObject, price: price };
                    var ponderations = _this.PonderationStrategies.getPonderationBase(ponderationData);

                    if (ponderations.length > 0) { result = ponderations; }
                }
            }
            return result;
        };

        var priceRound = function (price, decimalPlaces) {
            var result = parseFloat(price.toFixed(decimalPlaces));
            return result;
        };

        var priceRoundWithZero = function (price, decimalPlaces) {
            var result = parseFloat(price) || 0;
            return result.toFixed(decimalPlaces);
        };

        var dissipatePonderation = function (ticks, value, tickId) {
            for (var i = 1; i < value; i++) {
                if (ticks[tickId + i])
                    ticks[tickId + i].Ponderation.Value += value - i;

                if (ticks[tickId - i])
                    ticks[tickId - i].Ponderation.Value += value - i;
            }
        };

        var getMinRange = function (data, periodType, decimalPlaces) {
            var lastCandleStick = getLastCandleStick(data);
            var ponderationConfig = rangeConfiguration[periodType];

            var result = parseFloat((lastCandleStick - (lastCandleStick * (ponderationConfig / 2))).toFixed(decimalPlaces));

            _this.KtlLogging.logMinRange(result);
            return result;
        };

        var getMaxRange = function (data, periodType, decimalPlaces) {
            var lastCandleStick = getLastCandleStick(data);
            var ponderationConfig = rangeConfiguration[periodType];

            var result = parseFloat((lastCandleStick + (lastCandleStick * (ponderationConfig / 2))).toFixed(decimalPlaces));
            _this.KtlLogging.logMaxRange(result);
            return result;
        };

        var createTicks = function(data, maxRange, minRange) {

            var ticks = [];
            var asset = data.Asset;
            var pow = Math.pow(10, -asset.DecimalPlaces);

            for (var i = minRange; i < maxRange; i = i + pow) {
                var tick = {
                    Price: priceRound(i, asset.DecimalPlaces),
                    Ponderation: { Matches: 0, Value: 0, Calculations: [] }
                };
                ticks.push(tick);
            };

            return ticks;
        };

        var calculateTicks = function (data, maxRange, minRange) {

            var technicalData = data.TechnicalData;
            var ticks = createTicks(data,maxRange, minRange);

            $.each(ticks, function (tickKey, tick) {
                var ponderations = getPonderation(technicalData, tick.Price);
                $.each(ponderations, function (ponderationKey, ponderation) {

                    if(_this.Translations[ponderation.Translation.Key])
                        tick.Ponderation.Calculations.push(_this.Translations[ponderation.Translation.Key]);

                    tick.Ponderation.Value += ponderation.Value;
                    tick.Ponderation.Matches++;

                    if (ponderation.Value > 1) {
                        dissipatePonderation(ticks, ponderation.Value, tickKey);
                    }

                });

            });
            _this.KtlLogging.logTicks(ticks);
            return ticks;
        };

        var calculateRowData = function(ticks, minPrice, maxPrice) {
            var rowData = { Value: 0, Matches: 0, Calculations: [] };
            $.each(ticks,
                function(key, value) {
                    if (value.Price >= minPrice && value.Price < maxPrice) {
                        _this.KtlLogging.logRowTick(value.Price, value.Ponderation.Value, value.Ponderation.Matches);

                        $.each(value.Ponderation.Calculations, function (key, value) { rowData.Calculations.push(value) });

                        rowData.Value += value.Ponderation.Value;
                        rowData.Matches += value.Ponderation.Matches;
                    };
                });
            return rowData;
        };
        
        var isCurrentPriceInRange = function(data,minRange,maxPrice) {
            var lastCandleStick = getLastCandleStick(data);

            var result = (lastCandleStick >= minRange && lastCandleStick < maxPrice);
            return result;

        };

        var createRow = function(data,ticks,minPrice,maxPrice,asset) {
            var ponderation = calculateRowData(ticks, minPrice, maxPrice);

            var row = {
                Id :FXStreetWidgets.Util.guid(),
                Ponderation: ponderation,
                MaxPrice: priceRoundWithZero(maxPrice, asset.DecimalPlaces),
                MinPrice: priceRoundWithZero(minPrice, asset.DecimalPlaces),
                IsCurrentPriceInRange: isCurrentPriceInRange(data, minPrice, maxPrice)
        };
            return row;
        }

        var calculateRows = function (data, numberOfRows, periodType) {

            _this.KtlLogging.logCalculateRows(periodType,numberOfRows);

            var maxRange = getMaxRange(data, periodType, data.Asset.DecimalPlaces);
            var minRange = getMinRange(data, periodType, data.Asset.DecimalPlaces);

            var rows = [];
            var partitionPrice = ((maxRange - minRange) / numberOfRows);
            var maxPrice = maxRange;
            var ticks = calculateTicks(data, maxRange,minRange);
            var asset = data.Asset;

            for (var i = 0; i < numberOfRows; i++) {

                var minPrice = maxPrice - partitionPrice;
                _this.KtlLogging.logRow(i, minPrice, maxPrice);

                var row = createRow(data, ticks, minPrice, maxPrice, asset);
                rows.push(row);

                maxPrice -= partitionPrice;
            };

            setPonderationPercentage(rows);
            setPonderationColor(rows);
           
            _this.KtlLogging.logSeparator();
            return rows;
        };

        var getLastCandleStick = function (data) {

            var candleStick = $.grep(data.TechnicalData.CandleSticks,
                function (element) {
                    return element.PeriodType === _this.KtlSettings.PeriodTypes.Period15M;
                });

            var result = candleStick[0].Close;
            return result;
        };

        _this.getData = function (data,translations) {
            _this.KtlLogging.logDataReceived(data);
            _this.Translations = translations;

            var result =
            {
                "15M": calculateRows(data, _this.NumberOfRows, _this.KtlSettings.PeriodTypes.Period15M),
                "1H": calculateRows(data, _this.NumberOfRows, _this.KtlSettings.PeriodTypes.Period1H),
                "4H": calculateRows(data, _this.NumberOfRows, _this.KtlSettings.PeriodTypes.Period4H),
                "1D": calculateRows(data, _this.NumberOfRows, _this.KtlSettings.PeriodTypes.Period1D)
            };
            return result;
        };
        return _this;
    };

    FXStreetWidgets.Widget.Ktl.PonderationStrategies = function (loaderBase) {

        var parent = FXStreetWidgets.Widget.Base(loaderBase),
        _this = FXStreetWidgets.Util.extendObject(parent);

        _this.KtlLogging = null;
        _this.KtlSettings = null;

        var ponderationStrategies = [];
        var ponderationSettings = null;

        _this.setVars = function () {

            _this.KtlLogging = new FXStreetWidgets.Widget.Ktl.Logging();
            _this.KtlLogging.init();

            _this.KtlSettings = new FXStreetWidgets.Widget.Ktl.Settings();
            _this.KtlSettings.init();

            ponderationSettings = _this.KtlSettings.Ponderations;
        };

        _this.getPonderationBase = function (data) {
            var strategy = $.grep(ponderationStrategies, function (element) { return element.isMatch(data.objectName); });

            if (strategy.length !== 0)
                return strategy[0].getPonderation(data.objectName, data.object, data.price);
        };

        var CalculationWithPeriodTypes = function (settings) {
            var ponderationSettings = settings;
            var allowedElements = ["CandleSticks", "PivotPoints", "Sma", "BollingerBands", "Fibonacci"];

            this.isMatch = function(property) {
                var result = $.inArray(property, allowedElements) !== -1;
                return result;
            };

            this.getPonderation = function(objectName, object, price) {
                var result = [];
                object.forEach(function(key) {
                    var periodType = key.PeriodType;
                    for (var propertyName in key) {
                        if (propertyName !== "PeriodType") {
                            var value = key[propertyName];
                            if (value === price) {
                                var ponderationValue = getPonderationValue(objectName, periodType, propertyName);
                                if (ponderationValue) {
                                    var ponderation = { Id: propertyName,Value: ponderationValue, Translation: { Key: objectName + "_" + propertyName + "_" + periodType ,Value: "" }};
                                    _this.KtlLogging.logMathOperation(ponderation.Id, ponderation.Value, price);
                                    result.push(ponderation);
                                };
                            };
                        };
                    };

                });
                return result;
            };

            var getPonderationValue = function (objectName, periodType, propertyName) {
                var result = 0;

                var ponderationItems = ponderationSettings[objectName];
                if (!ponderationItems) return result;

                var ponderationItem = null;
                ponderationItems.forEach(function (settings) {
                    if (settings["PeriodType"] === periodType)
                        ponderationItem = settings;
                });
                if (!ponderationItem) return result;

                result = ponderationItem[propertyName];
                return result;
            };

        };

        var CalculationObject = function (settings) {
            var ponderationSettings = settings;
            var allowedElements = ["HistoricalPrice"];

            this.isMatch = function(property) {
                var result = $.inArray(property, allowedElements) !== -1;
                return result;
            };

            this.getPonderation = function(objectName, object, price) {
                var result = [];
                for (var propertyName in object) {
                    if (object[propertyName] === price) {
                        var ponderationValue = getPonderationValue(objectName, propertyName);
                        if (ponderationValue) {
                            var ponderation = { Id: propertyName, Value: ponderationValue, Translation: { Key: objectName+"_" +propertyName,Value: ""}}
                            _this.KtlLogging.logMathOperation(ponderation.Id, ponderation.Value, price);
                            result.push(ponderation);
                        }
                    }

                };
                return result;
            };

            var getPonderationValue = function (objectName, propertyName) {
                var result = 0;

                var ponderationItems = ponderationSettings[objectName];
                if (!ponderationItems) return result;

                var ponderationItem = ponderationItems[propertyName];
                if (!ponderationItem) return result;

                result = ponderationItem;
                return result;
            };

        };

        var CalculationListDoubles = function (settings) {
            var ponderationSettings = settings;

            var allowedElements = ["RoundNumbers"];

            this.isMatch = function(property) {
                var result = $.inArray(property, allowedElements) !== -1;
                return result;
            };

            this.getPonderation = function(objectName, object, price) {
                var result = [];
                for (var propertyName in object) {
                    object[propertyName].forEach(function(value) {
                        if (value === price) {
                            var ponderationValue = getPonderationValue(objectName, propertyName);
                            if (ponderationValue) {
                                var ponderation = { Id: propertyName, Value: ponderationValue, Translation: { Key: objectName + "_" + propertyName, Value: "" } };
                                _this.KtlLogging.logMathOperation(ponderation.Id, ponderation.Value, price);
                                result.push(ponderation);
                            }
                        }
                    });
                };
                return result;
            };

            var getPonderationValue = function (objectName, propertyName) {
                var result = 0;
                var ponderationItems = ponderationSettings[objectName];
                if (!ponderationItems) return result;

                var ponderationItem = ponderationItems[propertyName];
                if (!ponderationItem) return result;

                result = ponderationItem;
                return result;
            };
        };

        _this.init = function (json) {

            _this.setSettingsByObject(json);
            _this.setVars(json);

            ponderationStrategies = [new CalculationWithPeriodTypes(ponderationSettings),
                                     new CalculationListDoubles(ponderationSettings),
                                     new CalculationObject(ponderationSettings)];
        };

        return _this;
    };

    FXStreetWidgets.Widget.Ktl.Logging = function(loaderBase) {

        var parent = FXStreetWidgets.Widget.Base(loaderBase),
        _this = FXStreetWidgets.Util.extendObject(parent);

        _this.loggingEnabled = false;

        _this.init = function (json) {
            _this.setSettingsByObject(json);
            _this.setVars(json);
        };
    
        var logger = function (message) {
            if (_this.loggingEnabled)  console.log(message);
        };

        _this.setVars = function ()
        {
            _this.loggingEnabled = FXStreetWidgets.Util.getQueryStringParameterByName('fxslogging') !== '';
        };

        _this.logDataReceived = function(data) {
            logger("Data Received :" + JSON.stringify(data) );
        };

        _this.logCalculateRows = function (periodType,numberOfRows) {
            logger("[Calculate Rows: # PeriodType " + periodType + " / " + numberOfRows + " rows]");
        };

        _this.logMathOperation = function(id, ponderationValue, price) {
            logger("[MathOperation: " + id + " # PonderationValue: " + ponderationValue + " # Price: " + price + "]");
        };

        _this.logRow = function (i, minPrice, maxPrice) {
            logger("[ROW: " + i + " # From Price : " + minPrice + " # To Price: " + maxPrice);
        };

        _this.logRowTick = function (price, ponderationValue, matches) {
            logger("[ROW_Tick: " + price + " # Ponderation Value : " + ponderationValue + " # Matches: " + matches);
        };

        _this.logMinRange = function(minRange) {
            logger("[MinRange:" + minRange + "]");
        };
       
        _this.logMaxRange = function (maxRange) {
            logger("[MaxRange:" + maxRange + "]");
        };

        _this.logTicks = function(ticks) {
            $.each(ticks, function (key, value) {
                logger("[Tick: " + value.Price + " # Ponderation Value: " + value.Ponderation.Value + " # Matches: " + JSON.stringify(value.Ponderation.Matches));
            });
        };

        _this.logSeparator = function() {
            logger(".......................................................");
        };

        return _this;
    };
    
    FXStreetWidgets.Widget.Ktl.Settings = function (loaderBase) {

        var parent = FXStreetWidgets.Widget.Base(loaderBase),
        _this = FXStreetWidgets.Util.extendObject(parent);

        _this.init = function (json) {
            _this.setSettingsByObject(json);
            _this.setVars(json);
        };

        _this.Ponderations = {
            "HistoricalPrice":
            {
                "LastYearHigh": 7, "LastYearLow": 7,
                "LastMonthHigh": 6, "LastMonthLow": 6,
                "LastWeekHigh": 5, "LastWeekLow": 5,
                "Last1DHigh": 4, "Last1DLow": 4,
                "Last4HHigh": 3, "Last4HLow": 3,
                "Last1HHigh": 2, "Last1HLow": 2,
                "Last15MHigh": 1, "Last15MkLow": 1
            },
            "RoundNumbers":
            {
              "ThreeZeroPattern": 0.75
            },
            "CandleSticks": [
                { "PeriodType": "15M", "High": 1, "Low": 1 },
                { "PeriodType": "1H", "High": 2, "Low": 2 },
                { "PeriodType": "4H", "High": 3, "Low": 3 },
                { "PeriodType": "1D", "High": 4, "Low": 4 }
            ],
            "PivotPoints": [
                { "PeriodType": "1D", "PivotPoint": 4, "R3": 4, "R2": 4, "R1": 4, "S3": 4, "S2": 4, "S1": 4 },
                { "PeriodType": "1W", "PivotPoint": 5, "R3": 5, "R2": 5, "R1": 5, "S3": 5, "S2": 5, "S1": 5 },
                { "PeriodType": "1M", "PivotPoint": 6, "R3": 6, "R2": 6, "R1": 6, "S3": 6, "S2": 6, "S1": 6 }
            ],
            "Sma": [
                { "PeriodType": "15M", "Sma5": 1, "Sma10": 1, "Sma20": 1, "Sma50": 1, "Sma100": 1, "Sma200": 1 },
                { "PeriodType": "1H", "Sma5": 2, "Sma10": 2, "Sma20": 2, "Sma50": 2, "Sma100": 2, "Sma200": 2 },
                { "PeriodType": "4H", "Sma5": 3, "Sma10": 3, "Sma20": 3, "Sma50": 3, "Sma100": 3, "Sma200": 3 },
                { "PeriodType": "1D", "Sma5": 4, "Sma10": 4, "Sma20": 4, "Sma50": 4, "Sma100": 4, "Sma200": 4 }
            ],
            "BollingerBands": [
                { "PeriodType": "15M", "MiddleBand": 1, "UpperBand": 1, "LowerBand": 1 },
                { "PeriodType": "1H", "MiddleBand": 2, "UpperBand": 2, "LowerBand": 2 },
                { "PeriodType": "4H", "MiddleBand": 3, "UpperBand": 3, "LowerBand": 3 },
                { "PeriodType": "1D", "MiddleBand": 4, "UpperBand": 4, "LowerBand": 4 }
            ],
            "Fibonacci": [
                { "PeriodType": "1D", "FiboLevel23": 4, "FiboLevel38": 4, "FiboLevel61": 4, "FiboLevel161": 4 },
                { "PeriodType": "1W", "FiboLevel23": 5, "FiboLevel38": 5, "FiboLevel61": 5, "FiboLevel161": 5 },
                { "PeriodType": "1M", "FiboLevel23": 6, "FiboLevel38": 6, "FiboLevel61": 6, "FiboLevel161": 6 }
            ]
        };

        _this.Range = {
            "15M": 0.01,
            "1H": 0.012,
            "4H": 0.014,
            "1D": 0.026,
            "Weekly": 0.04,
            "Monthly": 0.08,
            "Annually": 0.40
        };

        _this.PeriodTypes = {
            Period15M: "15M",
            Period1H: "1H",
            Period4H: "4H",
            Period1D: "1D",
            PeriodWeekly: "Weekly",
            PeriodMonthly: "Monthly",
            PeriodAnnually: "Annually"
        };

        _this.getDefaultPeriodType = function() {
            var result = _this.PeriodTypes.Period15M;
            return result;
        };

        _this.RowReductionLengthPercentage = 10;

        _this.Periods = [
                {
                    Id: "fxs_period_selection_15M_" + FXStreetWidgets.Util.guid(),
                    IsActive: true,
                    PeriodName: _this.PeriodTypes.Period15M,
                    Translation: "15M"
                },
                {
                    Id: "fxs_period_selection_1H_" + FXStreetWidgets.Util.guid(),
                    IsActive: false,
                    PeriodName: _this.PeriodTypes.Period1H,
                    Translation: "1H"
                },
                {
                    Id: "fxs_period_selection_4H_" + FXStreetWidgets.Util.guid(),
                    IsActive: false,
                    PeriodName: _this.PeriodTypes.Period4H,
                    Translation: "4H"
                },
                {
                    Id: "fxs_period_selection_1D_" + FXStreetWidgets.Util.guid(),
                    IsActive: false,
                    PeriodName: _this.PeriodTypes.Period1D,
                    Translation: "1D"
                }
        ];

        return _this;
    }

}(FXStreetWidgets.$));
(function ($) {
    FXStreetWidgets.Widget.LoaderKtl = function () {
        var options = {
            WidgetType: "MarketTools",
            WidgetName: "ktl",
            EndPointV2: "api/v2/keytechnicals",
            EndPointTranslationV2: "api/v2/cultures/{culture}/ktl/",
            DefaultHost: "http://markettools.fxstreet.com/",
            Mustaches: { "ktl": "" },
            DefaultVersion: "v2"
        };

        var parent = FXStreetWidgets.Widget.LoaderBase(options),
            _this = FXStreetWidgets.Util.extendObject(parent);

        parent.initWidgets = function (widgets) {
            $.each(widgets, function (i, ktl) {
                var jKtl = $(ktl);

                var initJson =
                {
                    Container: jKtl,
                    NumberOfRows: jKtl.attr("fxs_number_of_rows"),
                    AssetPair: jKtl.attr("fxs_pair"),
                    Height: jKtl.attr("fxs_height"),
                    Range: {
                        Min: jKtl.attr("fxs_price_range_min"),
                        Max: jKtl.attr("fxs_price_range_max")
                    }
                };

                if (_this.checkConfiguration(initJson))
                {
                    var widget = new FXStreetWidgets.Widget.Ktl(_this);
                    widget.init(initJson);
                }
            });
        };

        _this.jsonDataIsValid = function(data) {
            return true;
        };
        _this.checkConfiguration = function(json) {
            return true;
        };

        return _this;
    };

    (function () {
        var loader = new FXStreetWidgets.Widget.LoaderKtl();
        loader.init();
    })();
}(FXStreetWidgets.$));