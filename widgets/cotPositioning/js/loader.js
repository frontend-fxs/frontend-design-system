(function ($) {
    FXStreetWidgets.Widget.LoaderCot = function () {
        var options = {
            WidgetName: "cotpositioning",
            EndPointV2: "api/v2/cot/netpositioning/",
            EndPointTranslationV2: "api/v2/cultures/{culture}/cot/",
            DefaultHost: "https://markettools.fxstreet.com/",
            Mustaches:
                {
                    "cotpositioning": ""
                },
            DefaultVersion: "v2",
            CustomJs: ["c3.min.js", "d3.min.js"]
        };

        var parent = FXStreetWidgets.Widget.LoaderBase(options),
            _this = FXStreetWidgets.Util.extendObject(parent);

        parent.initWidgets = function (widgets) {
            $.each(widgets, function (i, cotPositioning) {
                var jcotPositioning = $(cotPositioning);

                var initJson = {
                    Container: jcotPositioning,
                    AssetId: jcotPositioning.attr("fxs_asset"),
                    ClassSize: jcotPositioning.attr("fxs_class_size"),
                    HideFullReport: FXStreetWidgets.Util.isUndefined(jcotPositioning.attr("fxs_hide_fullreport")) ? false : true,
                    FullReportUrl: jcotPositioning.attr("fxs_fullreport_url"),
                    WidgetId: FXStreetWidgets.Util.guid(),
                    Seo: FXStreetWidgets.Util.isUndefined(jcotPositioning.attr("fxs_seo")) ? false : true
                };

                if (FXStreetWidgets.Util.isUndefined(initJson.FullReportUrl)) {
                    initJson.FullReportUrl = "/";
                }

                if (FXStreetWidgets.Util.isUndefined(initJson.AssetId) || !initJson.AssetId.startsWith('fxs-')) {
                    console.log("fxserror unable to create " + _this.config.WidgetName + ", asset not valid: " + initJson.AssetId);
                } else {
                    var widget = new FXStreetWidgets.Widget.CotPositioning(_this);
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
        var loader = new FXStreetWidgets.Widget.LoaderCot();
        loader.init();
    })();
}(FXStreetWidgets.$));