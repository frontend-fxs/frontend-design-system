(function ($) {
    FXStreetWidgets.Widget.LoaderForecastMultiasset = function () {
        var options = {
            WidgetType: "MarketTools",
            WidgetName: "forecastmultiasset",
            EndPointV2: "api/v2/forecast/{culture}/study/",
            EndPointTranslationV2: "api/v2/cultures/{culture}/forecast/",
            DefaultHost: "https://markettools.fxstreet.com/",
            Mustaches:
            {
                "forecastmultiasset": "",
                "forecastmultiasset_bars": ""
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
                    Assets: jForecast.attr("fxs_assets"),
                    ClassSize: jForecast.attr("fxs_class_size"),
                    HideFullReport: FXStreetWidgets.Util.isUndefined(jForecast.attr("fxs_hide_fullreport")) ? false : true,
                    FullReportUrl: jForecast.attr("fxs_fullreport_url"),
                    FullStudyUrl: jForecast.attr("fxs_fullstudy_url"),
                    WidgetId: i,
                    Seo: FXStreetWidgets.Util.isUndefined(jForecast.attr("fxs_seo")) ? false : true
                };

                if (FXStreetWidgets.Util.isUndefined(initJson.Assets)) {
                    initJson.Assets = jForecast.attr("fxs_pairs");//retrocompability
                }

                if (FXStreetWidgets.Util.isUndefined(initJson.FullReportUrl)) {
                    initJson.FullReportUrl = "/";
                }
                if (FXStreetWidgets.Util.isUndefined(initJson.FullStudyUrl)) {
                    initJson.FullStudyUrl = "/";
                }

                var widget = new FXStreetWidgets.Widget.ForecastMultiasset(_this);
                widget.init(initJson);
            });
        };

        parent.isReadyCustomCheck = function () {
            var result = parent.chartLibrariesAreLoaded();
            return result;
        };

        return _this;
    };

    (function () {
        var loader = FXStreetWidgets.Widget.LoaderForecastMultiasset();
        loader.init();
    })();
}(FXStreetWidgets.$));