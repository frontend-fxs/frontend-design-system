(function ($) {
    FXStreetWidgets.Widget.LoaderForecastContributors = function () {
        var options = {
            WidgetType: "MarketTools",
            WidgetName: "forecastcontributors",
            EndPointV2: "api/v2/forecast/{culture}/study/",
            EndPointTranslationV2: "api/v2/cultures/{culture}/forecast/",
            DefaultHost: "https://markettools.fxstreet.com/",
            Mustaches: { "forecastcontributors": "" },
            DefaultVersion: "v2"
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
                    FullReportUrl: jForecast.attr("fxs_fullreport_url"),
                    AllowComments: FXStreetWidgets.Util.isUndefined(jForecast.attr("fxs_allow_comments")) ? false : $.parseJSON(jForecast.attr("fxs_allow_comments"))
                };

                if (FXStreetWidgets.Util.isUndefined(initJson.Asset)) {
                    initJson.Asset = jForecast.attr("fxs_pair");//retrocompability
                }

                if (FXStreetWidgets.Util.isUndefined(initJson.FullReportUrl)) {
                    initJson.FullReportUrl = "/";
                };

                if (FXStreetWidgets.Util.isUndefined(initJson.Asset) || !initJson.Asset.startsWith('fxs-')) {
                    console.log("fxserror unable to create " + _this.config.WidgetName + ", asset not valid: " + initJson.Asset);
                } else {
                    var widget = new FXStreetWidgets.Widget.ForecastContributors(_this);
                    widget.init(initJson);
                }
            });
        };

        return _this;
    };

    (function () {
        var loader = FXStreetWidgets.Widget.LoaderForecastContributors();
        loader.init();
    })();
}(FXStreetWidgets.$));