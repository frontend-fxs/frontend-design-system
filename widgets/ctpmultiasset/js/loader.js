(function ($) {
    FXStreetWidgets.Widget.LoaderCtpMultiAsset = function () {
        var options = {
            WidgetType: "MarketTools",
            WidgetName: "ctpmultiasset",
            EndPointV2: "api/v2/ctp/{culture}/study/",
            EndPointTranslationV2: "api/v2/cultures/{culture}/ctp/",
            DefaultHost: "https://markettools.fxstreet.com/",
            Mustaches:
                {
                    "ctpmultiasset": ""
                },
            DefaultVersion: "v2",
            CustomJs: ["c3.min.js", "d3.min.js"]
        };

        var parent = FXStreetWidgets.Widget.LoaderBase(options),
            _this = FXStreetWidgets.Util.extendObject(parent);

        parent.initWidgets = function (widgets) {
            $.each(widgets, function (i, ctp) {
                var jCtp = $(ctp);

                var initJson = {
                    Container: jCtp,
                    AssetIds: jCtp.attr("fxs_assets"),
                    ClassSize: jCtp.attr("fxs_class_size"),
                    FullReportUrl: jCtp.attr("fxs_fullreport_url"),
                    FullStudyUrl: jCtp.attr("fxs_fullstudy_url"),
                    HideFullReport: FXStreetWidgets.Util.isUndefined(jCtp.attr("fxs_hide_fullreport")) ? false : true,
                    WidgetId: FXStreetWidgets.Util.guid(),
                    Seo: FXStreetWidgets.Util.isUndefined(jCtp.attr("fxs_seo")) ? false : true
                };

                if (FXStreetWidgets.Util.isUndefined(initJson.FullReportUrl)) {
                    initJson.FullReportUrl = "/";
                }
                if (FXStreetWidgets.Util.isUndefined(initJson.FullStudyUrl)) {
                    initJson.FullStudyUrl = "/";
                }

                var widget = new FXStreetWidgets.Widget.CtpMultiAsset(_this);
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
        var loader = new FXStreetWidgets.Widget.LoaderCtpMultiAsset();
        loader.init();
    })();
}(FXStreetWidgets.$));