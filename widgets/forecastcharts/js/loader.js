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