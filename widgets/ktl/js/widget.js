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
            _this.Calculations = _this.PonderationManager.getData(_this.data, _this.loaderBase.config.Translations);
        };

        var changeTab = function (e) {
            var items = $.grep(periods, function (element) { return element.Id === e.currentTarget.id; });
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


        var getTooltipObj = function (e) {
            var rowId = e.currentTarget.getAttribute('fxs-row-id');
            var result = FXStreet.Util.getjQueryObjectById("fxs_ktl_data_row_tooltip_" + rowId, false);
            return result;
        }

        var mouseOverRow = function (e) {
            var tooltip = getTooltipObj(e);
            if (!tooltip) return;
            tooltip.css({ top: e.clientY, left: e.clientX });
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

        var createTicks = function (data, maxRange, minRange) {

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
            var ticks = createTicks(data, maxRange, minRange);

            $.each(ticks, function (tickKey, tick) {
                var ponderations = getPonderation(technicalData, tick.Price);
                $.each(ponderations, function (ponderationKey, ponderation) {

                    if (_this.Translations[ponderation.Translation.Key])
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

        var calculateRowData = function (ticks, minPrice, maxPrice) {
            var rowData = { Value: 0, Matches: 0, Calculations: [] };
            $.each(ticks,
                function (key, value) {
                    if (value.Price >= minPrice && value.Price < maxPrice) {
                        _this.KtlLogging.logRowTick(value.Price, value.Ponderation.Value, value.Ponderation.Matches);

                        $.each(value.Ponderation.Calculations, function (key, value) { rowData.Calculations.push(value) });

                        rowData.Value += value.Ponderation.Value;
                        rowData.Matches += value.Ponderation.Matches;
                    };
                });
            return rowData;
        };

        var isCurrentPriceInRange = function (data, minRange, maxPrice) {
            var lastCandleStick = getLastCandleStick(data);

            var result = (lastCandleStick >= minRange && lastCandleStick < maxPrice);
            return result;

        };

        var createRow = function (data, ticks, minPrice, maxPrice, asset) {
            var ponderation = calculateRowData(ticks, minPrice, maxPrice);

            var row = {
                Id: FXStreetWidgets.Util.guid(),
                Ponderation: ponderation,
                MaxPrice: priceRoundWithZero(maxPrice, asset.DecimalPlaces),
                MinPrice: priceRoundWithZero(minPrice, asset.DecimalPlaces),
                IsCurrentPriceInRange: isCurrentPriceInRange(data, minPrice, maxPrice)
            };
            return row;
        }

        var calculateRows = function (data, numberOfRows, periodType) {

            _this.KtlLogging.logCalculateRows(periodType, numberOfRows);

            var maxRange = getMaxRange(data, periodType, data.Asset.DecimalPlaces);
            var minRange = getMinRange(data, periodType, data.Asset.DecimalPlaces);

            var rows = [];
            var partitionPrice = ((maxRange - minRange) / numberOfRows);
            var maxPrice = maxRange;
            var ticks = calculateTicks(data, maxRange, minRange);
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
                    return element.PeriodType === _this.KtlSettings.PeriodTypes.IntraDay15;
                });

            var result = candleStick[0].Close;
            return result;
        };

        _this.getData = function (data, translations) {
            _this.KtlLogging.logDataReceived(data);
            _this.Translations = translations;

            var result =
            {
                "IntraDay15": calculateRows(data, _this.NumberOfRows, _this.KtlSettings.PeriodTypes.IntraDay15),
                "IntraDay60": calculateRows(data, _this.NumberOfRows, _this.KtlSettings.PeriodTypes.IntraDay60),
                "IntraDay240": calculateRows(data, _this.NumberOfRows, _this.KtlSettings.PeriodTypes.IntraDay240),
                "Daily": calculateRows(data, _this.NumberOfRows, _this.KtlSettings.PeriodTypes.Daily)
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

            this.isMatch = function (property) {
                var result = $.inArray(property, allowedElements) !== -1;
                return result;
            };

            this.getPonderation = function (objectName, object, price) {
                var result = [];
                object.forEach(function (key) {
                    var periodType = key.PeriodType;
                    for (var propertyName in key) {
                        if (propertyName !== "PeriodType") {
                            var value = key[propertyName];
                            if (value === price) {
                                var ponderationValue = getPonderationValue(objectName, periodType, propertyName);
                                if (ponderationValue) {
                                    var ponderation = { Id: propertyName, Value: ponderationValue, Translation: { Key: objectName + "_" + propertyName + "_" + periodType, Value: "" } };
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

            this.isMatch = function (property) {
                var result = $.inArray(property, allowedElements) !== -1;
                return result;
            };

            this.getPonderation = function (objectName, object, price) {
                var result = [];
                for (var propertyName in object) {
                    if (object[propertyName] === price) {
                        var ponderationValue = getPonderationValue(objectName, propertyName);
                        if (ponderationValue) {
                            var ponderation = { Id: propertyName, Value: ponderationValue, Translation: { Key: objectName + "_" + propertyName, Value: "" } }
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

            this.isMatch = function (property) {
                var result = $.inArray(property, allowedElements) !== -1;
                return result;
            };

            this.getPonderation = function (objectName, object, price) {
                var result = [];
                for (var propertyName in object) {
                    object[propertyName].forEach(function (value) {
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

    FXStreetWidgets.Widget.Ktl.Logging = function (loaderBase) {

        var parent = FXStreetWidgets.Widget.Base(loaderBase),
            _this = FXStreetWidgets.Util.extendObject(parent);

        _this.loggingEnabled = false;

        _this.init = function (json) {
            _this.setSettingsByObject(json);
            _this.setVars(json);
        };

        var logger = function (message) {
            if (_this.loggingEnabled) console.log(message);
        };

        _this.setVars = function () {
            _this.loggingEnabled = FXStreetWidgets.Util.getQueryStringParameterByName('fxslogging') !== '';
        };

        _this.logDataReceived = function (data) {
            logger("Data Received :" + JSON.stringify(data));
        };

        _this.logCalculateRows = function (periodType, numberOfRows) {
            logger("[Calculate Rows: # PeriodType " + periodType + " / " + numberOfRows + " rows]");
        };

        _this.logMathOperation = function (id, ponderationValue, price) {
            logger("[MathOperation: " + id + " # PonderationValue: " + ponderationValue + " # Price: " + price + "]");
        };

        _this.logRow = function (i, minPrice, maxPrice) {
            logger("[ROW: " + i + " # From Price : " + minPrice + " # To Price: " + maxPrice);
        };

        _this.logRowTick = function (price, ponderationValue, matches) {
            logger("[ROW_Tick: " + price + " # Ponderation Value : " + ponderationValue + " # Matches: " + matches);
        };

        _this.logMinRange = function (minRange) {
            logger("[MinRange:" + minRange + "]");
        };

        _this.logMaxRange = function (maxRange) {
            logger("[MaxRange:" + maxRange + "]");
        };

        _this.logTicks = function (ticks) {
            $.each(ticks, function (key, value) {
                logger("[Tick: " + value.Price + " # Ponderation Value: " + value.Ponderation.Value + " # Matches: " + JSON.stringify(value.Ponderation.Matches));
            });
        };

        _this.logSeparator = function () {
            logger(".......................................................");
        };

        return _this;
    };

    FXStreetWidgets.Widget.Ktl.Settings = function(loaderBase) {

        var parent = FXStreetWidgets.Widget.Base(loaderBase),
            _this = FXStreetWidgets.Util.extendObject(parent);

        _this.init = function(json) {
            _this.setSettingsByObject(json);
            _this.setVars(json);
        };

        _this.Ponderations = {
            "HistoricalPrice":
            {
                "LastYearHigh": 7,
                "LastYearLow": 7,
                "LastMonthHigh": 6,
                "LastMonthLow": 6,
                "LastWeekHigh": 5,
                "LastWeekLow": 5,
                "Last1DHigh": 4,
                "Last1DLow": 4,
                "Last4HHigh": 3,
                "Last4HLow": 3,
                "Last1HHigh": 2,
                "Last1HLow": 2,
                "Last15MHigh": 1,
                "Last15MkLow": 1
            },
            "RoundNumbers":
            {
                "ThreeZeroPattern": 0.75
            },
            "CandleSticks": [
                { "PeriodType": "IntraDay15", "High": 1, "Low": 1 },
                { "PeriodType": "IntraDay60", "High": 2, "Low": 2 },
                { "PeriodType": "IntraDay240", "High": 3, "Low": 3 },
                { "PeriodType": "Daily", "High": 4, "Low": 4 }
            ],
            "PivotPoints": [
                { "PeriodType": "Daily", "PivotPoint": 4, "R3": 4, "R2": 4, "R1": 4, "S3": 4, "S2": 4, "S1": 4 },
                { "PeriodType": "Weekly", "PivotPoint": 5, "R3": 5, "R2": 5, "R1": 5, "S3": 5, "S2": 5, "S1": 5 },
                { "PeriodType": "Monthly", "PivotPoint": 6, "R3": 6, "R2": 6, "R1": 6, "S3": 6, "S2": 6, "S1": 6 }
            ],
            "Sma": [
                { "PeriodType": "IntraDay15", "Sma5": 1, "Sma10": 1, "Sma20": 1, "Sma50": 1, "Sma100": 1, "Sma200": 1 },
                { "PeriodType": "IntraDay60", "Sma5": 2, "Sma10": 2, "Sma20": 2, "Sma50": 2, "Sma100": 2, "Sma200": 2 },
                {
                    "PeriodType": "IntraDay240",
                    "Sma5": 3,
                    "Sma10": 3,
                    "Sma20": 3,
                    "Sma50": 3,
                    "Sma100": 3,
                    "Sma200": 3
                },
                { "PeriodType": "Daily", "Sma5": 4, "Sma10": 4, "Sma20": 4, "Sma50": 4, "Sma100": 4, "Sma200": 4 }
            ],
            "BollingerBands": [
                { "PeriodType": "IntraDay15", "MiddleBand": 1, "UpperBand": 1, "LowerBand": 1 },
                { "PeriodType": "IntraDay60", "MiddleBand": 2, "UpperBand": 2, "LowerBand": 2 },
                { "PeriodType": "IntraDay240", "MiddleBand": 3, "UpperBand": 3, "LowerBand": 3 },
                { "PeriodType": "Daily", "MiddleBand": 4, "UpperBand": 4, "LowerBand": 4 }
            ],
            "Fibonacci": [
                { "PeriodType": "Daily", "FiboLevel23": 4, "FiboLevel38": 4, "FiboLevel61": 4, "FiboLevel161": 4 },
                { "PeriodType": "Weekly", "FiboLevel23": 5, "FiboLevel38": 5, "FiboLevel61": 5, "FiboLevel161": 5 },
                { "PeriodType": "Monthly", "FiboLevel23": 6, "FiboLevel38": 6, "FiboLevel61": 6, "FiboLevel161": 6 }
            ]
        };

        _this.Range = {
            "IntraDay15": 0.01,
            "IntraDay60": 0.012,
            "IntraDay240": 0.014,
            "Daily": 0.026,
            "Weekly": 0.04,
            "Monthly": 0.08,
            "Annually": 0.40
        };

        _this.PeriodTypes = {
            IntraDay15: "IntraDay15",
            IntraDay60: "IntraDay60",
            IntraDay240: "IntraDay240",
            Daily: "Daily",
            PeriodWeekly: "Weekly",
            PeriodMonthly: "Monthly",
            PeriodAnnually: "Annually"
        };

        _this.getDefaultPeriodType = function() {
            var result = _this.PeriodTypes.IntraDay15;
            return result;
        };

        _this.RowReductionLengthPercentage = 10;

        _this.Periods = [
            {
                Id: "fxs_period_selection_IntraDay15_" + FXStreetWidgets.Util.guid(),
                IsActive: true,
                PeriodName: _this.PeriodTypes.IntraDay15,
                Translation: "15M"
            },
            {
                Id: "fxs_period_selection_IntraDay60_" + FXStreetWidgets.Util.guid(),
                IsActive: false,
                PeriodName: _this.PeriodTypes.IntraDay60,
                Translation: "1H"
            },
            {
                Id: "fxs_period_selection_IntraDay240_" + FXStreetWidgets.Util.guid(),
                IsActive: false,
                PeriodName: _this.PeriodTypes.IntraDay240,
                Translation: "4H"
            },
            {
                Id: "fxs_period_selection_Daily_" + FXStreetWidgets.Util.guid(),
                IsActive: false,
                PeriodName: _this.PeriodTypes.Daily,
                Translation: "1D"
            }
        ];
        return _this;
    };

}(FXStreetWidgets.$));