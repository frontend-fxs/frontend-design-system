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