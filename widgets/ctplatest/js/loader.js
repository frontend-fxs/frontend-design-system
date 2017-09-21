(function ($) {
    FXStreetWidgets.Widget.LoaderCtpLatest = function () {
        var options = {
            WidgetType: "MarketTools",
            WidgetName: "ctplatest",
            EndPointV2: "api/v2/ctp/{culture}/lastestentries/",
            EndPointTranslationV2: "api/v2/cultures/{culture}/ctp/",
            DefaultHost: "https://markettools.fxstreet.com/",
            Mustaches:
                {
                    "ctplatest": ""
                },
            DefaultVersion: "v2",
            CustomJs: []
        };

        var parent = FXStreetWidgets.Widget.LoaderBase(options),
            _this = FXStreetWidgets.Util.extendObject(parent);

        parent.initWidgets = function (widgets) {
            $.each(widgets, function (i, ctp) {
                var jCtp = $(ctp);

                var initJson = {
                    Container: jCtp,
                    Take: jCtp.attr("fxs_take"),
                    FullReportUrl: jCtp.attr("fxs_fullreport_url"),
                    FullStudyUrl: jCtp.attr("fxs_fullstudy_url"),
                    HideFullReport: FXStreetWidgets.Util.isUndefined(jCtp.attr("fxs_hide_fullreport")) ? false : true,
                    Seo: FXStreetWidgets.Util.isUndefined(jCtp.attr("fxs_seo")) ? false : true
                };

                if (FXStreetWidgets.Util.isUndefined(initJson.FullReportUrl)) {
                    initJson.FullReportUrl = "/";
                }
                if (FXStreetWidgets.Util.isUndefined(initJson.FullStudyUrl)) {
                    initJson.FullStudyUrl = "/";
                }

                var widget = new FXStreetWidgets.Widget.CtpLatest(_this);
                widget.init(initJson);
            });
        };

        return _this;
    };

    (function () {
        var loader = new FXStreetWidgets.Widget.LoaderCtpLatest();
        loader.init();
    })();
}(FXStreetWidgets.$));