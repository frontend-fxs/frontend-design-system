(function ($) {
    FXStreetWidgets.Widget.LoaderHeatMap = function () {
        var options = {
            WidgetName: "heatmap",
            EndPointV2: "api/v2/heatmap/study/",
            EndPointTranslationV2: "api/v2/cultures/{culture}/heatmap/",
            DefaultHost: "https://markettools.fxstreet.com/",
            Mustaches:
                {
                    "heatmap": ""
                },
            DefaultVersion: "v2"
        };

        var parent = FXStreetWidgets.Widget.LoaderBase(options),
             _this = FXStreetWidgets.Util.extendObject(parent);

        parent.initWidgets = function (widgets) {
            $.each(widgets, function (i, heatmap) {
                var jHeatMap = $(heatmap);

                var initJson = {
                    Container: jHeatMap,
                    AssetIds: jHeatMap.attr("fxs_assets"),
                    FormatUrl: jHeatMap.attr("fxs_format_url")
                };

                if (!FXStreetWidgets.Util.isUndefined(initJson.AssetIds)) {
                    var validAssets = true;
                    initJson.AssetIds.split(',').forEach(function (asset) {
                        if (!asset.startsWith('fxs-')) {
                            console.log("fxserror unable to create " + _this.config.WidgetName + ", asset not valid: " + asset);
                            validAssets = false;
                        }
                    });
                    if (validAssets) {
                        var widget = new FXStreetWidgets.Widget.HeatMap(_this);
                        widget.init(initJson);
                    }
                } else {
                    console.log("fxserror unable to create " + _this.config.WidgetName + ", assets value cannot be empty");
                }
            });
        };
        return _this;
    };
    (function () {
        var loader = new FXStreetWidgets.Widget.LoaderHeatMap();
        loader.init();
    })();
}(FXStreetWidgets.$));