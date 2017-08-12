(function ($) {
    FXStreetWidgets.Widget.LoaderCalendarEvent = function () {
        var options = {
            WidgetName: "calendarevent",
            EndPoint: "event/",
            EndPointTranslation: "event/localization/",
            DefaultHost: "https://calendar.fxstreet.com/",
            Mustaches:
                {
                    "calendarevent": ""
                },
            CustomJs: ["jquery.countdown.min.js"]
        };

        var parent = FXStreetWidgets.Widget.LoaderBase(options),
            _this = FXStreetWidgets.Util.extendObject(parent);

        parent.initWidgets = function (widgets) {
            $.each(widgets, function (i, calendarevent) {
                var jCalendarEvent = $(calendarevent);

                var initJson = {
                    Container: jCalendarEvent,
                    EventId: jCalendarEvent.attr("fxs_eventid"),
                    ClassSize: jCalendarEvent.attr("fxs_class_size"),                   
                    WidgetId: FXStreetWidgets.Util.guid(),
                    Seo: FXStreetWidgets.Util.isUndefined(jCalendarEvent.attr("fxs_seo")) ? false : true
                };

                if (FXStreetWidgets.Util.isUndefined(initJson.EventId)) {
                    console.log("fxserror unable to create " + _this.config.WidgetName + ", event not valid: " + initJson.EventId);
                } else {
                    var widget = new FXStreetWidgets.Widget.CalendarEvent(_this);
                    widget.init(initJson);
                }
            });
        };
        return _this;
    };

    (function () {
        var loader = new FXStreetWidgets.Widget.LoaderCalendarEvent();
        loader.init();
    })();
}(FXStreetWidgets.$));