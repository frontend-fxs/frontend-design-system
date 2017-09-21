(function ($) {
    FXStreetWidgets.Widget.LoaderKtl = function () {
        var options = {
            WidgetType: "MarketTools",
            WidgetName: "ktl",
            EndPointV2: "api/v2/keytechnicals",
            EndPointTranslationV2: "api/v2/cultures/{culture}/ktl/",
            DefaultHost: "http://markettools.fxstreet.com/",
            Mustaches: { "ktl": "" },
            DefaultVersion: "v2"
        };

        var parent = FXStreetWidgets.Widget.LoaderBase(options),
            _this = FXStreetWidgets.Util.extendObject(parent);

        parent.initWidgets = function (widgets) {
            $.each(widgets, function (i, ktl) {
                var jKtl = $(ktl);

                var initJson =
                {
                    Container: jKtl,
                    NumberOfRows: jKtl.attr("fxs_number_of_rows"),
                    AssetPair: jKtl.attr("fxs_pair"),
                    Height: jKtl.attr("fxs_height"),
                    Range: {
                        Min: jKtl.attr("fxs_price_range_min"),
                        Max: jKtl.attr("fxs_price_range_max")
                    }
                };

                if (_this.checkConfiguration(initJson))
                {
                    var widget = new FXStreetWidgets.Widget.Ktl(_this);
                    widget.init(initJson);
                }
            });
        };

        _this.jsonDataIsValid = function(data) {
            return true;
        };
        _this.checkConfiguration = function(json) {
            return true;
        };

        return _this;
    };

    (function () {
        var loader = new FXStreetWidgets.Widget.LoaderKtl();
        loader.init();
    })();
}(FXStreetWidgets.$));