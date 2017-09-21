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