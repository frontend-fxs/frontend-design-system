(function ($) {
    FXStreetWidgets.Widget.LoaderKtlTable = function () {
        var options = {
            WidgetType: "MarketTools",
            WidgetName: "ktltable",
            EndPointV2: "api/v2.1/keytechnicals",
            EndPointTranslationV2: "api/v2/cultures/{culture}/ktltable/",
            DefaultHost: "http://markettools.fxstreet.com/",
            Mustaches: { "ktltable": "", "ktltablecontent": "", "ktltablecontent_mock": "", "ktltablefilters": "" },
            DefaultVersion: "v2.1"
        };

        var parent = FXStreetWidgets.Widget.LoaderBase(options),
            _this = FXStreetWidgets.Util.extendObject(parent);

        parent.initWidgets = function (widgets) {
            $.each(widgets, function (i, ktlTable) {
                var jKtlTable = $(ktlTable);

                var initJson =
                    {
                        WidgetId: FXStreetWidgets.Util.guid(),
                        Container: jKtlTable
                    };

                if (_this.checkConfiguration(initJson)) {
                    var widget = new FXStreetWidgets.Widget.KtlTable.Manager(_this);
                    widget.init(initJson);
                }
            });
        };

        _this.jsonDataIsValid = function (data) {
            return true;
        };
        _this.checkConfiguration = function (json) {
            return true;
        };

        return _this;
    };

    (function () {
        var loader = new FXStreetWidgets.Widget.LoaderKtlTable();
        loader.init();
    })();
}(FXStreetWidgets.$));