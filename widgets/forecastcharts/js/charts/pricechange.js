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