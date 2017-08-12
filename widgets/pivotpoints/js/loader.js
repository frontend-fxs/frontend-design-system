(function ($) {
    FXStreetWidgets.Widget.LoaderPivotPoints = function () {
        var options = {
            WidgetName: "pivotpoints",
            EndPointV2: "api/v2/pivotpoints/study/",
            EndPointTranslationV2: "api/v2/cultures/{culture}/PivotPointsSupportsResistance/",
            DefaultHost: "https://markettools.fxstreet.com/",
            Mustaches:
                {
                    "pivotpoints": ""
                },
            DefaultVersion: "v2"
        };

        var parent = FXStreetWidgets.Widget.LoaderBase(options),
            _this = FXStreetWidgets.Util.extendObject(parent);

        parent.initWidgets = function (widgets) {
            $.each(widgets, function (i, pivotpoints) {
                var jPivotPoints = $(pivotpoints);

                var initJson = {
                    Container: jPivotPoints,
                    AssetId: jPivotPoints.attr("fxs_asset"),
                    ClassSize: jPivotPoints.attr("fxs_class_size"),
                    HideFullReport: FXStreetWidgets.Util.isUndefined(jPivotPoints.attr("fxs_hide_fullreport")) ? false : true,
                    FullReportUrl: jPivotPoints.attr("fxs_fullreport_url")
                };

                if (FXStreetWidgets.Util.isUndefined(initJson.FullReportUrl)) {
                    initJson.FullReportUrl = "/";
                }

                if (FXStreetWidgets.Util.isUndefined(initJson.AssetId) || !initJson.AssetId.startsWith('fxs-')) {
                    console.log("fxserror unable to create " + _this.config.WidgetName + ", asset not valid: " + initJson.AssetId);
                } else {
                    var widget = new FXStreetWidgets.Widget.PivotPoints(_this);
                    widget.init(initJson);
                }
            });
        };

        return _this;
    };

    (function () {
        var loader = new FXStreetWidgets.Widget.LoaderPivotPoints();
        loader.init();
    })();
}(FXStreetWidgets.$));