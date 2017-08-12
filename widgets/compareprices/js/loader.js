(function ($) {
    FXStreetWidgets.Widget.LoaderComparePrices = function () {
        var options = {
            WidgetName: "compareprices",
            EndPoint: "compareprices/study/",
            EndPointTranslation: "compareprices/localization/",
            DefaultHost: "https://markettools.fxstreet.com/",
            Mustaches:
                {
                    "compareprices": ""
                },
            DefaultVersion: "v2",
            CustomJs: []
        };

        var parent = FXStreetWidgets.Widget.LoaderBase(options),
            _this = FXStreetWidgets.Util.extendObject(parent);

        parent.initWidgets = function (widgets) {
            $.each(widgets, function (i, cPrices) {
                var jComparePrices = $(cPrices);

                var initJson = {
                    Container: jComparePrices,
                    AssetIds: jComparePrices.attr("fxs_assets"),
                    CurrencyIds: jComparePrices.attr("fxs_currencies"),
                    WidgetId: i,
                    Seo: FXStreetWidgets.Util.isUndefined(jComparePrices.attr("fxs_seo")) ? false : true
                };

                var widget = new FXStreetWidgets.Widget.ComparePrices(_this);
                widget.init(initJson);
            });
        };

        return _this;
    };

    (function () {
        var loader = new FXStreetWidgets.Widget.LoaderComparePrices();
        loader.init();
    })();
}(FXStreetWidgets.$));