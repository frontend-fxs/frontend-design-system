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