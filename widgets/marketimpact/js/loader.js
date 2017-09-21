(function ($) {
    FXStreetWidgets.Widget.LoaderMarketImpact = function () {
        var options = {
            WidgetType: "MarketTools",
            WidgetName: "marketimpact",
            EndPointV2: "api/v2/marketImpact/study/",
            EndPointTranslationV2: "api/v2/cultures/{culture}/MarketImpactWidgetI3/",
            DefaultHost: "https://markettools.fxstreet.com/",
            Mustaches:
                {
                    "marketimpact": ""
                },
            DefaultVersion: "v2",
            CustomJs: ["c3.min.js", "d3.min.js", "moment.min.js"]
        };

        var parent = FXStreetWidgets.Widget.LoaderBase(options),
            _this = FXStreetWidgets.Util.extendObject(parent);

        parent.initWidgets = function (widgets) {
            $.each(widgets, function (i, marketimpact) {
                var jMarketImpact = $(marketimpact);

                var assets = jMarketImpact.attr("fxs_assets")
                    ? jMarketImpact.attr("fxs_assets").split(",")
                    : null;

                var url = _this.getHost() + 'api/' + _this.getVersion() + '/marketImpact/' + FXStreetWidgets.Configuration.getCulture() + '/assets/';;

                if (assetsValid(assets)) {
                    url += "?assetIds=" + assets.join(",");
                }

                FXStreetWidgets.Util.ajaxJsonGetter(url)
                    .done(function (data) {
                        var selectedAssets = data.Values;

                        var initJson = {
                            Container: jMarketImpact,
                            AssetId: selectedAssets[0].Id,
                            Assets: selectedAssets,
                            EventId: jMarketImpact.attr("fxs_eventId"),
                            ShownTabs: jMarketImpact.attr("fxs_tabs") || ""
                        };

                        var widget = new FXStreetWidgets.Widget.MarketImpact(_this);
                        widget.init(initJson);
                    })
                    .fail(function () {
                        console.error("fxserror: Couldn't get assets");
                    });
            });
        };

        var assetsValid = function (assets) {
            if (!assets) {
                return false;
            }

            try {
                $.each(assets, function (i, assetId) {
                    if (FXStreetWidgets.Util.isUndefined(assetId) || !assetId.startsWith('fxs-')) {
                        throw assetId;
                    }
                });
                return true;
            } catch (ex) {
                console.log("fxserror unable to create " + _this.config.WidgetName + ", asset not valid: " + ex.message);
                return false;
            }
        };

        return _this;
    };

    (function () {
        var loader = new FXStreetWidgets.Widget.LoaderMarketImpact();
        loader.init();
    })();
}(FXStreetWidgets.$));