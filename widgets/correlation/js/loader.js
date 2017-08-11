(function ($) {
    FXStreetWidgets.Widget.LoaderCorrelation = function () {
        var options = {
            WidgetName: "correlation",
            EndPointV2: "api/v2/correlation/study/",
            EndPointTranslationV2: "api/v2/cultures/{culture}/correlation/",
            DefaultHost: "https://markettools.fxstreet.com/",
            Mustaches:
                {
                    "correlation": ""
                },
            DefaultVersion: "v2",
            CustomJs: ["c3.min.js", "d3.min.js"]
        };

        var parent = FXStreetWidgets.Widget.LoaderBase(options),
            _this = FXStreetWidgets.Util.extendObject(parent);

        parent.initWidgets = function (widgets) {
            $.each(widgets, function (i, correlation) {
                var jCorrelation = $(correlation);

                var initJson = {
                    Container: jCorrelation,
                    AssetId: jCorrelation.attr("fxs_asset"),
                    NumOfCorrelations: jCorrelation.attr("fxs_numofcorrelations"),
                    HideFullReport: FXStreetWidgets.Util.isUndefined(jCorrelation.attr("fxs_hide_fullreport")) ? false : true,
                    FullReportUrl: jCorrelation.attr("fxs_fullreport_url")
                };

                if (_this.checkConfiguration(initJson)) {
                    var widget = new FXStreetWidgets.Widget.Correlation(_this);
                    widget.init(initJson);
                }
            });
        };

        parent.isReadyCustomCheck = function () {
            var result = parent.chartLibrariesAreLoaded();
            return result;
        };

        _this.checkConfiguration = function (json) {
            if (FXStreetWidgets.Util.isUndefined(json.AssetId) || !json.AssetId.startsWith('fxs-')) {
                console.log("fxserror unable to create " + _this.config.WidgetName + ", asset not valid: " + json.AssetId);
                return false;
            }
            return true;
        }

        return _this;
    };

    (function () {
        var loader = new FXStreetWidgets.Widget.LoaderCorrelation();
        loader.init();
    })();
}(FXStreetWidgets.$));