(function ($) {
    FXStreetWidgets.Widget.LoaderPriceStats = function () {
        var options = {
            WidgetName: "pricestats",
            EndPoints: {
                'v1': "api/ctpsignal/getpricestatics"
            },
            EndPointTranslations: {
                'v1': "api/ctpsignal/gettranslations"
            },
            DefaultHost: "http://ctp.api.fxstreet.com/",
            Mustaches: { "pricestats": "" }
        };

        var parent = FXStreetWidgets.Widget.LoaderBase(options),
            _this = FXStreetWidgets.Util.extendObject(parent);

        parent.initWidgets = function (widgets) {
            $.each(widgets, function (i, priceStats) {
                var jPriceStats = $(priceStats);

                var initJson = {
                    Container: jPriceStats,
                    Pair: jPriceStats.attr("fxs_pair"),
                    PushPriceClassName: jPriceStats.attr('fxs_pushprice_obj'),
                    DataProviderHost: jPriceStats.attr('fxs_dataprovider_host'),
                    TokenProviderHost: jPriceStats.attr('fxs_tokenprovider_host'),
                    WidgetId: FXStreetWidgets.Util.guid()
                };

                if (FXStreetWidgets.Util.isUndefined(initJson.Pair) || initJson.Pair.length !== 6) {
                    console.log("fxserror unable to create " + _this.config.WidgetName + ", pair not valid: " + initJson.Pair);
                } else {
                    var widget = new FXStreetWidgets.Widget.PriceStats(_this);
                    widget.init(initJson);
                }
            });
        };

        return _this;
    };

    (function () {
        var loader = new FXStreetWidgets.Widget.LoaderPriceStats();
        loader.init();
    })();
}(FXStreetWidgets.$));