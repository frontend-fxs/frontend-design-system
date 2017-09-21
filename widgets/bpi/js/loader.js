(function ($) {
    FXStreetWidgets.Widget.LoaderBpi = function () {
        var options = {
            WidgetType: "MarketTools",
            WidgetName: "bpi",
            EndPointV2: "api/v2/bpi/study/",
            EndPointTranslationV2: "api/v2/cultures/{culture}/bpi/",
            DefaultHost: "https://markettools.fxstreet.com/",
            Mustaches:
                {
                    "bpi": ""
                },
            DefaultVersion: "v2"
        };

        var parent = FXStreetWidgets.Widget.LoaderBase(options),
            _this = FXStreetWidgets.Util.extendObject(parent);

        parent.initWidgets = function (widgets) {
            $.each(widgets, function (i, bpi) {
                var jBpi = $(bpi);

                var initJson = {
                    Container: jBpi,
                    Currencies: jBpi.attr("fxs_currencies"),
                    HideFullReport: FXStreetWidgets.Util.isUndefined(jBpi.attr("fxs_hide_fullreport")) ? false : true,
                    FullReportUrl: jBpi.attr("fxs_fullreport_url")
                };

                if (_this.checkConfiguration(initJson)) {
                    var widget = new FXStreetWidgets.Widget.Bpi(_this);
                    widget.init(initJson);
                }
            });
        };

        _this.checkConfiguration = function (json) {
            if (FXStreetWidgets.Util.isUndefined(json.Currencies)) {
                console.log("fxserror unable to create " + _this.config.WidgetName + ", currency not valid: " + json.Currencies);
                return false;
            }
            return true;
        }

        return _this;
    };

    (function () {
        var loader = new FXStreetWidgets.Widget.LoaderBpi();
        loader.init();
    })();
}(FXStreetWidgets.$));