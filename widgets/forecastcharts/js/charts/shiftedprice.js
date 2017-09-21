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