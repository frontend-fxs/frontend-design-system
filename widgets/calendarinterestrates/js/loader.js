(function ($) {
    FXStreetWidgets.Widget.LoaderCalendarInterestRates = function () {
        var options = {
            WidgetName: "calendarinterestrates",
            EndPoint: "interest-rates/central-banks",
            EndPointTranslation: "interest-rates/localization/",
            DefaultHost: "https://calendar.fxstreet.com/",
            Mustaches:
                {
                    "calendarinterestrates": ""
                }
        };

        var parent = FXStreetWidgets.Widget.LoaderBase(options),
            _this = FXStreetWidgets.Util.extendObject(parent);

        parent.initWidgets = function (widgets) {
            $.each(widgets, function (i, calendarinterestRates) {
                var jCalendarInterestRates = $(calendarinterestRates);

                var initJson = {
                    Container: jCalendarInterestRates,
                    WidgetId: FXStreetWidgets.Util.guid(),
                    ClassSize: jCalendarInterestRates.attr("fxs_class_size"),
                    ButtonUrl: jCalendarInterestRates.attr("fxs_button_url"),
                    Seo: FXStreetWidgets.Util.isUndefined(jCalendarInterestRates.attr("fxs_seo")) ? false : true
                };

                var widget = new FXStreetWidgets.Widget.CalendarInterestRates(_this);
                widget.init(initJson);
            });
        };
        return _this;
    };

    (function () {
        var loader = new FXStreetWidgets.Widget.LoaderCalendarInterestRates();
        loader.init();
    })();
}(FXStreetWidgets.$));