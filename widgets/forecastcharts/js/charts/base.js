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