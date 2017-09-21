(function ($) {
    FXStreetWidgets.Widget.LoaderForecast = function () {
        var options = {
            WidgetType: "MarketTools",
            WidgetName: "forecast",
            EndPointV2: "api/v2/forecast/{culture}/study/",
            EndPointTranslationV2: "api/v2/cultures/{culture}/forecast/",
            DefaultHost: "https://markettools.fxstreet.com/",
            Mustaches:
            {
                "forecast": "",
                "forecast_speedometer": ""
            },
            DefaultVersion: "v2",
            CustomJs: ["c3.min.js", "d3.min.js"]
        };

        var parent = new FXStreetWidgets.Widget.LoaderBase(options),
            _this = FXStreetWidgets.Util.extendObject(parent);

        parent.initWidgets = function (widgets) {
            $.each(widgets, function (i, forecast) {
                var jForecast = $(forecast);

                var initJson = {
                    Container: jForecast,
                    Asset: jForecast.attr("fxs_asset"),
                    Date: jForecast.attr("fxs_date"),
                    ClassSize: jForecast.attr("fxs_class_size"),
                    HideFullReport: FXStreetWidgets.Util.isUndefined(jForecast.attr("fxs_hide_fullreport")) ? false : true,
                    FullReportUrl: jForecast.attr("fxs_fullreport_url"),
                    WidgetId: FXStreetWidgets.Util.guid(),
                    Seo: FXStreetWidgets.Util.isUndefined(jForecast.attr("fxs_seo")) ? false : true
                };

                if (FXStreetWidgets.Util.isUndefined(initJson.Asset)) {
                    initJson.Asset = jForecast.attr("fxs_pair");//retrocompability
                }

                if (FXStreetWidgets.Util.isUndefined(initJson.FullReportUrl)) {
                    initJson.FullReportUrl = "/";
                }

                if (FXStreetWidgets.Util.isUndefined(initJson.Asset) || !initJson.Asset.startsWith('fxs-')) {
                    console.log("fxserror unable to create " + _this.config.WidgetName + ", asset not valid: " + initJson.Asset);
                } else {
                    var widget = new FXStreetWidgets.Widget.Forecast(_this);
                    widget.init(initJson);
                }
            });
        };

        parent.isReadyCustomCheck = function () {
            var result = parent.chartLibrariesAreLoaded();
            return result;
        };

        return _this;
    };

    (function () {
        var loader = FXStreetWidgets.Widget.LoaderForecast();
        loader.init();
    })();
}(FXStreetWidgets.$));