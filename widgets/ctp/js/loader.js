(function ($) {
    FXStreetWidgets.Widget.LoaderCtp = function () {
        var options = {
            WidgetName: "ctp",
            EndPointV2: "api/v2/ctp/study/",
            EndPointTranslationV2: "api/v2/cultures/{culture}/ctp/",
            DefaultHost: "https://markettools.fxstreet.com/",
            Mustaches:
                {
                    "ctp": ""
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
                    AssetId: jCtp.attr("fxs_asset"),
                    ClassSize: jCtp.attr("fxs_class_size"),
                    HideFullReport: FXStreetWidgets.Util.isUndefined(jCtp.attr("fxs_hide_fullreport")) ? false : true,
                    FullReportUrl: jCtp.attr("fxs_fullreport_url"),
                    WidgetId: FXStreetWidgets.Util.guid(),
                    Seo: FXStreetWidgets.Util.isUndefined(jCtp.attr("fxs_seo")) ? false : true
                };

                if (FXStreetWidgets.Util.isUndefined(initJson.FullReportUrl)) {
                    initJson.FullReportUrl = "/";
                }

                if (FXStreetWidgets.Util.isUndefined(initJson.AssetId) || !initJson.AssetId.startsWith('fxs-')) {
                    console.log("fxserror unable to create " + _this.config.WidgetName + ", asset not valid: " + initJson.AssetId);
                } else {
                    var widget = new FXStreetWidgets.Widget.Ctp(_this);
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
        var loader = new FXStreetWidgets.Widget.LoaderCtp();
        loader.init();
    })();
}(FXStreetWidgets.$));