(function () {
    FXStreetWidgets.Widget.Base = function (loaderBase) {
        var _this = {};

        _this.Container = FXStreetWidgets.Widget.Base.prototype.Container;
        _this.loaderBase = loaderBase;
        _this.data = FXStreetWidgets.Widget.Base.prototype.data;
        _this.interval = FXStreetWidgets.Widget.Base.prototype.interval;
        _this.init = FXStreetWidgets.Widget.Base.prototype.init;
        _this.setSettingsByObject = FXStreetWidgets.Widget.Base.prototype.setSettingsByObject;
        _this.addEvents = FXStreetWidgets.Widget.Base.prototype.addEvents;
        _this.setVars = FXStreetWidgets.Widget.Base.prototype.setVars;
        _this.loadData = FXStreetWidgets.Widget.Base.prototype.loadData;
        _this.loadDataFromUrl = FXStreetWidgets.Widget.Base.prototype.loadDataFromUrl;
        _this.setDatesToJson = FXStreetWidgets.Widget.Base.prototype.setDatesToJson;
        _this.renderHtml = FXStreetWidgets.Widget.Base.prototype.renderHtml;
        _this.log = FXStreetWidgets.Widget.Base.prototype.log;
        _this.jsonDataIsValid = FXStreetWidgets.Widget.Base.prototype.jsonDataIsValid;
        _this.handleJsonInvalidData = FXStreetWidgets.Widget.Base.prototype.handleJsonInvalidData;

        return _this;
    };
    FXStreetWidgets.Widget.Base.prototype.Container = null;
    FXStreetWidgets.Widget.Base.prototype.loaderBase = null;
    FXStreetWidgets.Widget.Base.prototype.data = null;
    FXStreetWidgets.Widget.Base.prototype.interval = null;
    FXStreetWidgets.Widget.Base.prototype.init = function (json) {
        this.setSettingsByObject(json);
    };
    FXStreetWidgets.Widget.Base.prototype.setSettingsByObject = function (json) {
        for (var propName in json) {
            if (json.hasOwnProperty(propName)) {
                if (this[propName] !== undefined) {
                    this[propName] = json[propName];
                }
            }
        }
    };
    FXStreetWidgets.Widget.Base.prototype.addEvents = function () { };
    FXStreetWidgets.Widget.Base.prototype.setVars = function () { };
    FXStreetWidgets.Widget.Base.prototype.loadData = function (request) {
        this.loadDataFromUrl(this.loaderBase.config.EndPoint, request);
    };
    FXStreetWidgets.Widget.Base.prototype.loadDataFromUrl = function (url, request) {
        var _this = this;
        FXStreetWidgets.Util.ajaxJsonGetter(url, request)
            .done(function (data) {
                if (!_this.jsonDataIsValid(data)) {
                    _this.handleJsonInvalidData();
                    return;
                }
                _this.data = data;
                if (_this.loaderBase.isReady()) {
                    _this.log("start renderHtml for: " + _this.loaderBase.config.WidgetName);
                    _this.renderHtml();
                } else {
                    _this.interval = setInterval(function () {
                        if (_this.loaderBase.isReady()) {
                            clearInterval(_this.interval);
                            _this.log("start renderHtml for: " + _this.loaderBase.config.WidgetName);
                            _this.renderHtml();
                        }
                    }, _this.intervalTimeToWaitForReady);
                }
            });
            //.fail(function () {
            //    _this.handleJsonInvalidData();
            //});
    };
    FXStreetWidgets.Widget.Base.prototype.setDatesToJson = function (json, dateResponse) {
        var date = FXStreetWidgets.Util.formatDate(dateResponse);
        json.LastUpdatedDate = dateResponse;
        json.LastUpdatedHour = date;
        return json;
    };
    FXStreetWidgets.Widget.Base.prototype.renderHtml = function () { };
    FXStreetWidgets.Widget.Base.prototype.log = function(msg) {
        FXStreetWidgets.Util.log(msg);
    };
    FXStreetWidgets.Widget.Base.prototype.jsonDataIsValid = function (data) {
        var result = FXStreetWidgets.Util.isValid(data)
                    && FXStreetWidgets.Util.arrayIsValid(data.Values)
                    && FXStreetWidgets.Util.isValid(data.Values[0]);
        return result;
    };
    FXStreetWidgets.Widget.Base.prototype.handleJsonInvalidData = function () {
        var _this = this;
        var noDataMessage = _this.loaderBase.config.Translations['NoDataAvailable'];
        if (!FXStreetWidgets.Util.isValid(noDataMessage)) {
            noDataMessage = 'No data available';
        }
        _this.Container.html(noDataMessage);
    };
}());
(function ($) {
    FXStreetWidgets.Widget.LoaderBase = function (options) {
        var _this = {};

        _this.options = options;
        _this.config = FXStreetWidgets.Widget.LoaderBase.prototype.config;
        _this.isReady = FXStreetWidgets.Widget.LoaderBase.prototype.isReady;
        _this.isReadyCustomCheck = FXStreetWidgets.Widget.LoaderBase.prototype.isReadyCustomCheck;
        _this.initConfiguration = FXStreetWidgets.Widget.LoaderBase.prototype.initConfiguration;
        _this.getContainer = FXStreetWidgets.Widget.LoaderBase.prototype.getContainer;
        _this.getHost = FXStreetWidgets.Widget.LoaderBase.prototype.getHost;
        _this.getVersion = FXStreetWidgets.Widget.LoaderBase.prototype.getVersion;
        _this.getCustomJs = FXStreetWidgets.Widget.LoaderBase.prototype.getCustomJs;
        _this.getSharedJs = FXStreetWidgets.Widget.LoaderBase.prototype.getSharedJs;
        _this.getEndPoint = FXStreetWidgets.Widget.LoaderBase.prototype.getEndPoint;
        _this.getEndPointTranslation = FXStreetWidgets.Widget.LoaderBase.prototype.getEndPointTranslation;
        _this.initWidgets = FXStreetWidgets.Widget.LoaderBase.prototype.initWidgets;
        _this.log = FXStreetWidgets.Widget.LoaderBase.prototype.log;
        _this.chartLibrariesAreLoaded = FXStreetWidgets.Widget.LoaderBase.prototype.chartLibrariesAreLoaded;
        _this.getDefaultHost = FXStreetWidgets.Widget.LoaderBase.prototype.getDefaultHost;

        _this.mustachesCount = 0;
        _this.mustachesLoadedCount = 0;
        _this.customJsCount = 0;
        _this.customJsLoadedCount = 0;
        _this.sharedJsCount = 0;
        _this.sharedJsLoadedCount = 0;
        _this.translationsLoaded = false;
        _this.haveCustomJs = false;
        _this.haveSharedJs = false;

        _this.init = function () {
            if (!FXStreetWidgets.Util.isValid(_this.options)
                || !FXStreetWidgets.Util.isValid(_this.options.WidgetName)
                || !_this.options.WidgetName.trim()) {
                _this.log("unable to load fxswidget options bad configure.");
                return;
            }

            FXStreetWidgets.Initialization.registerLoader(_this.options.WidgetName, _this);

            _this.initConfiguration();
            _this.loadUtils();

            var widgets = $("div[fxs_widget][fxs_name='" + _this.options.WidgetName + "']");
            FXStreetWidgets.Util.async(function () {
                _this.initWidgets(widgets);
            });
        };

        _this.loadDeferred = function (container) {
            _this.log("loading deferred " + _this.options.WidgetName);
            var widgets = container.find("div[fxs_widget][fxs_name='" + _this.options.WidgetName + "']");
            _this.initWidgets(widgets);
        };

        _this.loadUtils = function () {
            FXStreetWidgets.Util.ajaxJsonGetter(_this.config.EndPointTranslation).done(function (data) {
                _this.translationsLoaded = true;
                _this.config.Translations = data.Values;
            });

            $.each(_this.config.CustomJs, function (index, custom) {
                _this.customJsCount++;
                var url = "";
                var name = "";
                var customLoadedDelegate;

                if (typeof custom === 'string') {
                    name = custom;
                    url = FXStreetWidgets.Configuration.getCoreJsUrl(name);
                }
                else if (custom && typeof custom === 'object') {
                    name = custom.Js;
                    url = FXStreetWidgets.Configuration.getCoreJsUrl(name);
                    customLoadedDelegate = custom.CustomLoadedDelegate;
                }

                FXStreetWidgets.ResourceManagerObj.load(name, FXStreetWidgets.ResourceType.Js, url, function () {
                    _this.customJsLoadedCount++;
                }, customLoadedDelegate);
            });

            $.each(_this.config.SharedJs, function (index, shared) {
                _this.sharedJsCount++;
                var url = FXStreetWidgets.Configuration.createResourceUrl(shared.Container, shared.Js);

                FXStreetWidgets.ResourceManagerObj.load(shared.Js, FXStreetWidgets.ResourceType.Js, url, function () {
                    _this.sharedJsLoadedCount++;
                }, shared.CustomLoadedDelegate);
            });

            $.each(_this.config.Mustaches, function (key, value) {
                _this.mustachesCount++;
                var name = key + ".html";
                var url = FXStreetWidgets.Configuration.getMustacheUrl(name, _this.options.WidgetName);

                FXStreetWidgets.ResourceManagerObj.load(name, FXStreetWidgets.ResourceType.Mustache, url, function (res) {
                    _this.config.Mustaches[key] = res.Value;
                    _this.mustachesLoadedCount++;
                });
            });
        };

        _this.async_loadjs = function (url, callback) {
            var x = document.getElementsByTagName('script')[0],
                s = document.createElement('script');
            s.type = 'text/javascript';
            s.async = true;
            s.src = url;
            if (callback && typeof callback === "function") {
                if (s.addEventListener) {
                    s.addEventListener('load', callback, false);
                } else {
                    s.onreadystatechange = function () {
                        if (this.readyState === "complete" || this.readyState === "loaded") {
                            callback.call();
                        }
                    };
                }
            }
            x.parentNode.insertBefore(s, x);
        };

        return _this;
    };
    FXStreetWidgets.Widget.LoaderBase.prototype.config = {};
    FXStreetWidgets.Widget.LoaderBase.prototype.initWidgets = function (widgets) { };
    FXStreetWidgets.Widget.LoaderBase.prototype.initConfiguration = function () {
        this.log("init configuration for: " + this.options.WidgetName);

        var container = this.getContainer();
        var host = this.getHost(container);
        var version = this.getVersion(container);
        var customJs = this.getCustomJs();
        var sharedJs = this.getSharedJs();

        this.config = {
            WidgetType: this.options.WidgetType,
            WidgetName: this.options.WidgetName,
            Culture: FXStreetWidgets.Configuration.getCulture(),
            EndPoint: this.getEndPoint(host, version),
            EndPointTranslation: this.getEndPointTranslation(host, version),
            DefaultHost: this.getDefaultHost(this.options),
            CustomJs: customJs,
            SharedJs: sharedJs,
            Mustaches: this.options.Mustaches,
            Translations: {}
        };
    };

    FXStreetWidgets.Widget.LoaderBase.prototype.getDefaultHost = function (options) {
        var hosts = FXStreetWidgets.Configuration.getHosts();
        if(!hosts) return options.DefaultHost;

        var defaultHost = hosts[options.WidgetType];
        
        var result = defaultHost || options.DefaultHost;        
        return result;
    };

    FXStreetWidgets.Widget.LoaderBase.prototype.getContainer = function () {
        var container = $("div[fxs_widget][fxs_name='" + this.options.WidgetName + "']").first();
        return container;
    };
    FXStreetWidgets.Widget.LoaderBase.prototype.getHost = function (container) {
        container = container || this.getContainer();
        var host = container.attr("fxs_host");
        host = FXStreetWidgets.Util.isUndefined(host) ? this.getDefaultHost(this.options) : host;
        return host;
    };
    FXStreetWidgets.Widget.LoaderBase.prototype.getVersion = function (container) {
        container = container || this.getContainer();
        var version = container.attr("fxs_version") || this.options.DefaultVersion;
        version = FXStreetWidgets.Util.isUndefined(version) ? "" : version;
        return version;
    };
    FXStreetWidgets.Widget.LoaderBase.prototype.getCustomJs = function () {
        var customJs = [];

        if (FXStreetWidgets.Util.arrayIsValid(this.options.CustomJs)) {
            this.haveCustomJs = true;
            customJs = this.options.CustomJs;
        }

        return customJs;
    };
    FXStreetWidgets.Widget.LoaderBase.prototype.getSharedJs = function () {
        var sharedJs = [];

        if (FXStreetWidgets.Util.arrayIsValid(this.options.SharedJs)) {
            this.haveSharedJs = true;
            sharedJs = this.options.SharedJs;
        }

        return sharedJs;
    };
    var getFormattedEndpoint = function (formatEndpoint, version) {
        var result = formatEndpoint.replace(/{version}/g, version).replace(/{culture}/g, FXStreetWidgets.Configuration.getCulture());
        return result;
    };
    FXStreetWidgets.Widget.LoaderBase.prototype.getEndPoint = function (host, version) {
        var result;
        if (this.options.EndPointV2) {
            var formattedEndpoint = getFormattedEndpoint(this.options.EndPointV2, version);
            result = host + formattedEndpoint;
        } else {
            result = host + (version ? version + '/' : "") + FXStreetWidgets.Configuration.getCulture() + "/" + this.options.EndPoint;
        }
        return result;
    };
    FXStreetWidgets.Widget.LoaderBase.prototype.getEndPointTranslation = function (host, version) {
        var result;
        if (this.options.EndPointTranslationV2) {
            var formattedEndpoint = getFormattedEndpoint(this.options.EndPointTranslationV2, version);
            result = host + formattedEndpoint;
        } else {
            result = host + (version ? version + '/' : "") + FXStreetWidgets.Configuration.getCulture() + "/" + this.options.EndPointTranslation;
        }
        return result;
    };
    FXStreetWidgets.Widget.LoaderBase.prototype.isReady = function () {
        var result = this.translationsLoaded === true
            && ((this.haveCustomJs === false) || (this.haveCustomJs === true && this.customJsLoadedCount >= this.customJsCount))
            && ((this.haveSharedJs === false) || (this.haveSharedJs === true && this.sharedJsLoadedCount >= this.sharedJsCount))
            && this.mustachesLoadedCount === this.mustachesCount;

        result = result && this.isReadyCustomCheck();

        if (result === true) {
            this.log("loader ready for: " + this.options.WidgetName);
        }

        return result;
    };
    FXStreetWidgets.Widget.LoaderBase.prototype.isReadyCustomCheck = function () {
        return true;
    };
    FXStreetWidgets.Widget.LoaderBase.prototype.chartLibrariesAreLoaded = function () {
        var result = typeof (d3) !== "undefined" && typeof (c3) !== "undefined";
        return result;
    };
    FXStreetWidgets.Widget.LoaderBase.prototype.log = function (msg) {
        FXStreetWidgets.Util.log(msg);
    };
}(FXStreetWidgets.$));
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
            _this.subscribeHttpPush(_this.data);
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

        _this.subscribeHttpPush = function (data) {
            debugger;
            if (!isHttpPushSubscribed) {
                if (FXStreetPush) {
                    FXStreetWidgets.Util.getTokenByDomain().then(function (token) {
                        var options = {
                            token: token,
                            tokenUrl: data.AuthorizationUrl,
                            httpPushServerUrl: data.HttpPushServerUrl + "signalr/hubs",
                            culture: FXStreetWidgets.Configuration.getCulture()
                        };
                        var push = FXStreetPush.PushNotification.getInstance(options);
                        push.calendarSubscribe(updateValuesFromPush);
                        isHttpPushSubscribed = true;
                    });
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
(function ($) {
    FXStreetWidgets.Widget.LoaderCalendarEventTimer = function () {
        var options = {
            WidgetType: "Calendar",
            WidgetName: "calendareventtimer",
            EndPoint: "",
            EndPointTranslation: "eventtimer/localization",
            DefaultHost: "https://calendar.fxstreet.com/",
            Mustaches:
                {
                    "calendareventtimer": ""
                },
            CustomJs: [
                { 
                    Js: "jquery.countdown.min.js", 
                    CustomLoadedDelegate : function(){
                        return $ !== undefined && $.fn.countdown !== undefined;
                    }
                }
            ],
            SharedJs: [
                { 
                    Container: "http-push/", 
                    Js: "jquery.signalR-2.2.0.min.js", 
                    CustomLoadedDelegate : function(){
                        return $ !== undefined && $.signalR !== undefined; 
                    }
                },
                { 
                    Container: "http-push/", 
                    Js: "fxspush.js",
                    CustomLoadedDelegate : function(){
                            return window.FXStreetPush !== undefined; 
                    }
                }]
        };

        var parent = FXStreetWidgets.Widget.LoaderBase(options),
            _this = FXStreetWidgets.Util.extendObject(parent);

        parent.initWidgets = function (widgets) {
            $.each(widgets, function (i, calendareventtimer) {
                var jCalendarEventTimer = $(calendareventtimer);

                var initJson = {
                    Container: jCalendarEventTimer,
                    EventId: jCalendarEventTimer.attr("fxs_eventid"),
                    OtherEventsIds: jCalendarEventTimer.attr("fxs_other_events_ids"),
                    HoursToShowNextevent: jCalendarEventTimer.attr("fxs_hours_to_show_next_event"),
                    TimeZoneName: jCalendarEventTimer.attr("fxs_time_zone"),
                    CustomURL: jCalendarEventTimer.attr("fxs_custom_url"),
                    WidgetId: FXStreetWidgets.Util.guid(),
                    Seo: FXStreetWidgets.Util.isUndefined(jCalendarEventTimer.attr("fxs_seo")) ? false : true
                };

                if (FXStreetWidgets.Util.isUndefined(initJson.EventId)) {
                    console.log("fxserror unable to create " + _this.config.WidgetName + ", event not valid: " + initJson.EventId);
                } else {
                    var widget = new FXStreetWidgets.Widget.CalendarEventTimer(_this);
                    widget.init(initJson);
                }
            });
        };
        return _this;
    };

    (function () {
        var loader = new FXStreetWidgets.Widget.LoaderCalendarEventTimer();
        loader.init();
    })();
}(FXStreetWidgets.$));