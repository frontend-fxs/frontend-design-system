(function ($) {
    FXStreetWidgets.Widget.CalendarEventTimer = function (loaderBase) {
        var parent = FXStreetWidgets.Widget.Base(loaderBase),
            _this = FXStreetWidgets.Util.extendObject(parent);
        
        _this.EventId = "";
        _this.WidgetId = "";
        _this.OtherEventsIds = null;
        _this.HoursToShowNextevent = 24;
        _this.TimeZoneName = "";
        _this.CustomURL = "";
        _this.Seo = false;
        _this.Event = null;
        _this.OtherEvents=null;
        _this.TimeZone={};
        _this.DateFormat = "";
        var isHttpPushSubscribed = false;

        _this.init = function (json) {
            _this.setSettingsByObject(json);
            var url = _this.loaderBase.config.EndPoint
                + "eventtimer?hoursToShowActual={hours}&timezone={timeZone}&mainEvent={EventId}&otherEvents={otherEventsIds}";
            url = replaceUrValues(url);
            _this.loadDataFromUrl(url);
        };

        _this.jsonDataIsValid = function (data) {
            var result = FXStreetWidgets.Util.isValid(data);
            return result;
        };

        _this.renderHtml = function () {
            mapEventResponse(_this.data);
            var jsonData = {
                Event: _this.Event,
                OtherEvents:_this.OtherEvents,
                Translations: _this.loaderBase.config.Translations,
                Seo: _this.Seo,
                CultureName: FXStreetWidgets.Configuration.getCulture(),
                CustomURL: _this.CustomURL
            };
            var rendered = FXStreetWidgets.Util.renderByHtmlTemplate(
                _this.loaderBase.config.Mustaches[_this.loaderBase.config.WidgetName], jsonData);
            _this.Container.html(rendered);
            manageRenderedHtml();
            _this.subscribeHttpPush(_this.data.HttpPushServerUrl);
        };

        var replaceUrValues = function (url) {
            var result = url.replace("{hours}", _this.HoursToShowNextevent)
                .replace("{timeZone}", _this.TimeZoneName)
                .replace("{EventId}", _this.EventId)
                .replace("{otherEventsIds}", _this.OtherEventsIds);
            return result;
        };

        var mapEventResponse = function (data) {
            if (!_this.Event) {
                _this.Event = data.Event;
                _this.OtherEvents = data.OtherEvents;
                _this.DateFormat = data.DateFormat;                
            }
            formatDisplayValues();
        };

        var formatDisplayValues = function () {
            if (_this.Event) {
                var formattedDate= FXStreetWidgets.Util.formatDateUtcOffset(_this.Event.EventDate.DateUTC, _this.TimeZone.HourOffset);
                _this.Event.EventDateDisplayDate = _this.DateFormat.replace('{0}', formattedDate);
                setNullValues(_this.Event);
                _this.Event.EventDate.RaisedClass = getRaisedClass(_this.Event);
            }

            $.each(_this.OtherEvents, function (index, otherEvent) {
                formatDates(otherEvent);
                setNullValues(otherEvent);
                otherEvent.EventDate.RaisedClass = getRaisedClass(otherEvent);
            });
        };

        var setNullValues = function (event) {
            var eventDate = event.EventDate;

            var format = (event.Symbol !== '%') ? (event.Symbol + "{0}" + event.PotencySymbol) : ("{0}"+ event.Symbol)

            eventDate.ActualDisplay = $.isNumeric(eventDate.Actual) ? format.replace("{0}", eventDate.Actual) : "n/a";
            eventDate.ConsensusDisplay = $.isNumeric(eventDate.Consensus) ? format.replace("{0}", eventDate.Consensus) : "n/a";
            if ($.isNumeric(eventDate.Revised)) {
                eventDate.PreviousDisplay = format.replace("{0}", eventDate.Revised);
                if ($.isNumeric(eventDate.Previous)) {
                    var revisedFormat = format.replace("{0}", eventDate.Previous);
                    eventDate.RevisedDisplay = _this.loaderBase.config.Translations["RevisedFrom"].replace('{0}', revisedFormat);
                }
            }
            else {
                eventDate.PreviousDisplay = $.isNumeric(eventDate.Previous) ? format.replace("{0}", eventDate.Previous) : "n/a";
            }
        }

        var formatDates = function (otherEvent) {
            otherEvent.EventDateDayDisplay = FXStreetWidgets.Util.formatDateUtcOffset(otherEvent.EventDate.DateUTC, _this.TimeZone.HourOffset, "MMM D");
            var formattedHours= FXStreetWidgets.Util.formatDateUtcOffset(otherEvent.EventDate.DateUTC, _this.TimeZone.HourOffset, "HH:mm");
            otherEvent.EventDateHourDisplay = _this.DateFormat.replace('{0}', formattedHours);
        };


        var manageRenderedHtml = function () {
            if (_this.Event.ShowNextEvent) {
                handleCountDown();
            }                  
        };      

        var handleCountDown = function () {
            if (!FXStreetWidgets.Util.isValid(_this.data) || !FXStreetWidgets.Util.isValid(_this.Event.EventDate.DateUTC)) {
                return;
            }

            var untilTime = new Date(_this.Event.EventDate.DateUTC);

            var display = {
                daysDisplay: _this.loaderBase.config.Translations["Days"].toLowerCase(),
                hoursDisplay: _this.loaderBase.config.Translations["Hours"].toLowerCase(),
                minDisplay: _this.loaderBase.config.Translations["Min"].toLowerCase(),
                secDisplay: _this.loaderBase.config.Translations["Sec"].toLowerCase()
            };

            var finishCountdownDisplay = createSpan('00 :', display.hoursDisplay)
                                        + createSpan('00 :', display.minDisplay)
                                        + createSpan('00', display.secDisplay);

            _this.Container.find('#clock_' + _this.Event.EventId).countdown(untilTime)
                .on('update.countdown', function (event) {
                    var countdownDisplay = getUpdateCountdownDisplay(event, display);
                    $(this).html(event.strftime(countdownDisplay));
                })
                .on('finish.countdown', function (event) {
                    $(this).html(finishCountdownDisplay);
                    showLastEventDate(_this.Event); 
                });
        };

        var getUpdateCountdownDisplay = function (event, display) {
            var result = event.strftime("%D") === '00' ? createSpan('%H :', display.hoursDisplay) + createSpan('%M :', display.minDisplay) + createSpan('%S', display.secDisplay)
                : createSpan('%D :', display.daysDisplay) + createSpan('%H :', display.hoursDisplay) + createSpan('%M', display.minDisplay);
            return result;
        };

        var setShowNextEvent = function (event) {
            event.ShowNextEvent = false;
        }

        var showLastEventDate = function (event) {
            setShowNextEvent(event);
            _this.renderHtml();
        };

        var updateValues = function (recivedEvent, eventToUpdate) {
            if (recivedEvent.Actual) {
                eventToUpdate.EventDate.Actual = recivedEvent.Actual;
            }
            eventToUpdate.IsBetter = recivedEvent.IsBetter;
            if (recivedEvent.Revised) { eventToUpdate.EventDate.Previous = recivedEvent.Revised; }

            showLastEventDate(eventToUpdate);
        };

        var getRaisedClass = function (event) {
            var result = "fxs_black_price";

            if (event.IsBetter) {
                result = "fxs_green_price";
            } else if (event.IsBetter === false) {
                result = "fxs_red_price";
            }

            return result;
        }

        var createSpan = function (symbol, value) {
            return '<span><span class="fxs_widget_custom_data_lable">' + symbol + '</span>' + value + '</span>';
        };

        _this.subscribeHttpPush = function (httpPushServerUrl) {
            if (!isHttpPushSubscribed) {
                if (FXStreetPush !== undefined) {
                    var options = {
                        tokenUrl: httpPushServerUrl + "api/clientkeys",
                        httpPushServerUrl: httpPushServerUrl + "signalr/hubs",
                        culture: FXStreetWidgets.Configuration.getCulture()
                    };
                    var push = FXStreetPush.PushNotification.getInstance(options);
                    push.calendarSubscribe(updateValuesFromPush);
                    isHttpPushSubscribed = true;
                }
                else {
                    console.log("FXStreetPush load failed");
                }
            }
        };

        var updateValuesFromPush = function (recivedEvent) {
            if (!recivedEvent)
                return;

            var otherEventToUpdate = $.grep(_this.OtherEvents, function (otherEvent) {
                return (otherEvent.EventDate.EventDateId === recivedEvent.EventDateId)
            });

            if (otherEventToUpdate[0]  ||recivedEvent.EventDateId == _this.Event.EventDate.EventDateId) {
                var eventToUpdate = (otherEventToUpdate[0]) ? otherEventToUpdate[0] : _this.Event;
                updateValues(recivedEvent, eventToUpdate);
            }
        };

        return _this;
    };
}(FXStreetWidgets.$));