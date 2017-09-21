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