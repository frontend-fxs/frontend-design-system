(function ($) {
    FXStreetWidgets.Widget.LoaderCtpContributors = function () {
        var options = {
            WidgetType: "MarketTools",
            WidgetName: "ctpcontributors",
            EndPointV2: "api/v2/ctp/{culture}/study/",
            EndPointTranslationV2: "api/v2/cultures/{culture}/ctp/",
            DefaultHost: "https://markettools.fxstreet.com/",
            Mustaches:
                {
                    "ctpcontributors": ""
                },
            DefaultVersion: "v2"
        };

        var parent = FXStreetWidgets.Widget.LoaderBase(options),
            _this = FXStreetWidgets.Util.extendObject(parent);

        parent.initWidgets = function (widgets) {
            $.each(widgets, function (i, ctp) {
                var jCtp = $(ctp);

                var initJson = {
                    Container: jCtp,
                    AssetId: jCtp.attr("fxs_asset")
                };

                if (FXStreetWidgets.Util.isUndefined(initJson.AssetId) || !initJson.AssetId.startsWith('fxs-')) {
                    console.log("fxserror unable to create " + _this.config.WidgetName + ", asset not valid: " + initJson.AssetId);
                } else {
                    var widget = new FXStreetWidgets.Widget.CtpContributors(_this);
                    widget.init(initJson);
                }
            });
        };

        return _this;
    };

    (function () {
        var loader = new FXStreetWidgets.Widget.LoaderCtpContributors();
        loader.init();
    })();
}(FXStreetWidgets.$));