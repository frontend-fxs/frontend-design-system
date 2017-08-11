(function() {
    FXStreet.Class.LiveEventManager = function() {
        var parent = FXStreet.Class.Base(),
            _this = FXStreet.Util.extendObject(parent);

        _this.Event = {};
        _this.EventId = "";
        _this.ContainerId = "";
        _this.ContainerId = "";
        _this.EventUrl = "";

        _this.BackgroundVideo = "Live2.mp4";
        _this.HtmlTemplateFile = "live_event_default.html";
        _this.HtmlTemplateFilePriceTable = "price_table.html";
        _this.Translations = null;
        _this.UserInfo = null;
        _this.Subscription = null;
        _this.Following=false;

        _this.counterTemplate = ''
                    + '<span><span class="fxs_widget_custom_data_lable">{0} :</span>days</span>'
                    + '<span><span class="fxs_widget_custom_data_lable">{1} :</span>hours</span>'
                    + '<span><span class="fxs_widget_custom_data_lable">{2} :</span>min</span>'
                    + '<span><span class="fxs_widget_custom_data_lable">{3}</span>sec</span>';

        _this.init = function (json) {
            _this.setSettingsByObject(json);
            _this.setVars();
            _this.render();
        };

        _this.setVars = function () {            
            if (_this.ContainerId !== "") {
                _this.Container = FXStreet.Util.getjQueryObjectById(_this.ContainerId, false);
            }
            if (_this.EventId == undefined || _this.EventId === "") {
                _this.EventId = _this.Event.Id;
                _this.EventUrl = _this.Event.Url;
            }
            _this.counterTemplate = _this.counterTemplate
                .replace('days', _this.Translations.Days)
                .replace('hours', _this.Translations.Hours)
                .replace('min', _this.Translations.Minutes)
                .replace('sec', _this.Translations.Seconds);
        };

        _this.render = function () {
            var jsonToRender = _this.getJsonForRenderHtml();
            _this.htmlRender(jsonToRender);
        };

        _this.htmlRender = function (json) {
            if (_this.Container != null) {
                _this.Following = _this.getInitialFollowingValue();
                FXStreet.Util.loadHtmlTemplate(_this.HtmlTemplateFile).done(function (template) {
                    var rendered = FXStreet.Util.renderByHtmlTemplate(template, json);
                    _this.Container.html(rendered);

                    if (json.Event.PremiumView) {
                        FXStreet.Util.loadHtmlTemplate(_this.HtmlTemplateFilePriceTable).done(function(templatePriceTable) {
                            var renderedPriceTable = FXStreet.Util.renderByHtmlTemplate(templatePriceTable, json);
                            _this.Container.find('.fxs_row').append(renderedPriceTable);
                        });
                    }
                    _this.addDOMEvents();

                    if (_this.Following) {
                        _this.changeSubscribeButtonClass();
                    }
                });
            }
        };

        _this.getInitialFollowingValue = function () {
            var result = false;
            if (_this.UserInfo.Personalization) {
                var eventFollowing = $.grep(_this.UserInfo.Personalization.EventsFollowing, function (event) {
                    return event.PostId === _this.EventId;
                });
                if (eventFollowing.length > 0) {                  
                    result = true;
                }
            }
            return result;
        }

        _this.addDOMEvents = function () {
            if (_this.Container != null) {
                _this.initCountDown(_this.Container);
                _this.addLoginEvent();
                _this.addSubscriptionEvent();
            }
        };

        _this.initCountDown = function (target) {
            var clock = target.find('[countdown-date]');
            var untilDate = FXStreet.Util.dateStringToDateUTC(_this.Event.StartDateUtc);
            clock.countdown(untilDate)
                .on('update.countdown', function (event) {
                    $(this).html(event.strftime(_this.counterTemplate
                        .replace('{0}', '%D')
                        .replace('{1}', '%H')
                        .replace('{2}', '%M')
                        .replace('{3}', '%S')
                        ));
                })
                .on('finish.countdown', function (event) {
                    var obj = $(this).html(_this.counterTemplate
                        .replace('{0}', '00')
                        .replace('{1}', '00')
                        .replace('{2}', '00')
                        .replace('{3}', '00'));

                    var startDate = new Date(_this.Event.StartDateUtc);

                    var endDate;
                    if (_this.Event.EndDateUtc) {
                        endDate = new Date(_this.Event.EndDateUtc);
                    } else {
                        endDate = new Date();
                    }

                    var now = new Date();
                    var actualDate = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds());

                    if (actualDate >= startDate && actualDate <= endDate) {
                        obj.closest('.fxs_live_event_module').addClass("on_air");
                    } else {
                        obj.closest('.fxs_live_event_module').addClass("finished_event");
                    }
                });
        };

        _this.getJsonForRenderHtml = function () {
            var event = _this.getEventData();

            var json = {
                Translations: _this.Translations,
                UserInfo: _this.UserInfo,
                Subscription: _this.Subscription,
                Event: event,
                BackgroundVideoSrc: FXStreet.Resource.StaticContentVideo + _this.BackgroundVideo
            }

            return json;
        };

        _this.addLoginEvent = function () {
            var userMenu = FXStreet.Util.getObjectInstance("UserMenu");
            if (userMenu == null) {
                return;
            }
            var ctaRegisterId = "fxs_cta_login_" + _this.EventId;

            var ctaRegister = FXStreet.Util.getjQueryObjectById(ctaRegisterId, false);
            if (ctaRegister != null && ctaRegister.length > 0 && userMenu != null) {
                ctaRegister.click(function () { userMenu.Login() });
            }
        };
        
        _this.addSubscriptionEvent = function () {

            var ctaSubscriptionId = "fxs_cta_subscribe_" + _this.EventId;
            var ctaSubscription = FXStreet.Util.getjQueryObjectById(ctaSubscriptionId, false);
            
            if (ctaSubscription != null && ctaSubscription.length > 0 && !_this.Following) {
                ctaSubscription.on("click", _this.pushSubscription);
            }
        };

        _this.pushSubscription = function() {
            if (!_this.UserInfo.IsLogged) {
                var userMenu = FXStreet.Util.getObjectInstance("UserMenu");
                if (userMenu == null) {
                    return;
                }
                userMenu.Login();
            }
            else {
                var data = {
                    "PostId": _this.EventId
                };

                var tagManager = FXStreet.Class.Patterns.Singleton.TagManager.Instance();
                tagManager.PushToEventhub(data, "EventFollow");
                _this.changeSubscribeButtonClass();
            }
        };

        _this.changeSubscribeButtonClass = function() {
            var ctaSubscriptionId = "fxs_cta_subscribe_" + _this.EventId;
            var ctaSubscription = FXStreet.Util.getjQueryObjectById(ctaSubscriptionId, false);

            ctaSubscription.addClass("active");
            
        }

        _this.getEventData = function () {
            return _this.Event;
        };

        return _this;
    };
}());