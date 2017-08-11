(function ($) {
    FXStreetWidgets.Widget.LoaderLastCandle = function () {
        var options = {
            WidgetName: "lastcandle",
            EndPointV2: "api/v2/lastcandle/study/",
            EndPointTranslationV2: "api/v2/cultures/{culture}/lastcandle/",
            DefaultHost: "https://markettools.fxstreet.com/",
            Mustaches:
                {
                    "lastcandle": ""
                },
            DefaultVersion: "v2"
        };

        var parent = FXStreetWidgets.Widget.LoaderBase(options),
            _this = FXStreetWidgets.Util.extendObject(parent);

        parent.initWidgets = function (widgets) {
            $.each(widgets, function (i, lastcandle) {
                var jLastCandle = $(lastcandle);

                var initJson = {
                    Container: jLastCandle,
                    AssetId: jLastCandle.attr("fxs_asset")
                };

                if (FXStreetWidgets.Util.isUndefined(initJson.AssetId) || !initJson.AssetId.startsWith('fxs-')) {
                    console.log("fxserror unable to create " + _this.config.WidgetName + ", asset not valid: " + initJson.AssetId);
                } else {
                    var widget = new FXStreetWidgets.Widget.LastCandle(_this);
                    widget.init(initJson);
                }
            });
        };

        return _this;
    };

    (function () {
        var loader = new FXStreetWidgets.Widget.LoaderLastCandle();
        loader.init();
    })();
}(FXStreetWidgets.$));