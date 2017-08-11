(function () {
    FXStreet.Class.OnAirEventManager = function () {
        var parent = FXStreet.Class.Base(),
            _this = FXStreet.Util.extendObject(parent);

        _this.ContainerId = "";
        _this.Event = null;
        _this.Text = "";
        _this.AutoPlay = false;
        _this.Translations = null;
        _this.UserInfo = null;
        _this.Subscription = null;
        _this.BackgroundVideo = "";

        _this.BackgroundVideoSrc = "";
        _this.HtmlTemplateFile = "onair_event_default.html";
        _this.HtmlTemplateFilePriceTable = "price_table.html";

        _this.GoogleDriveMgr = {};
        _this.MarketingLeadsManagerManager = {};

        _this.CtaContactChkId = "";
        _this.CtaEnterId = "";
        _this.CtaLoginId = "";
        _this.ShowVideoCurtainId = "";
        _this.ShowVideoButtonId = "";
        _this.VideoContainerId = "";

        var showVideoCurtain = null;
        var videoContainer = null;
 
        _this.init = function (json) {
            _this.setSettingsByObject(json);
            _this.setVars();
            _this.render(json);

            if (_this.AutoPlay && !_this.Event.RegistrationRequired) {
                _this.SendPlayEvent();
            }
        };

        _this.setVars = function () {
            if (_this.ContainerId !== "") {
                _this.Container = FXStreet.Util.getjQueryObjectById(_this.ContainerId, false);
            }
            _this.BackgroundVideoSrc = FXStreet.Resource.StaticContentVideo + _this.BackgroundVideo;

            _this.GoogleDriveMgr = FXStreet.Util.getObjectInstance("GoogleDriveManager");
            _this.MarketingLeadsManagerManager = FXStreet.Util.getObjectInstance("MarketingLeadsManager");

            _this.CtaContactChkId = "accept_contact_chk_on_air";
            _this.CtaEnterId = "fxs_cta_enter_" + _this.Event.Id;
            _this.CtaLoginId = "fxs_cta_login_" + _this.Event.Id;
            _this.ShowVideoCurtainId = "fxs_live_event_marketing_" + _this.Event.Id;
            _this.ShowVideoButtonId = "fxs_cta_show_video_" + _this.Event.Id;
            _this.VideoContainerId = "fxs_live_event_video_container_" + _this.Event.Id;
        };

        _this.render = function (json) {
            if (_this.Container != null) {
                FXStreet.Util.loadHtmlTemplate(_this.HtmlTemplateFile).done(function (template) {
                    var rendered = FXStreet.Util.renderByHtmlTemplate(template, json);
                    _this.Container.html(rendered);

                    if (json.Event.PremiumView) {
                        FXStreet.Util.loadHtmlTemplate(_this.HtmlTemplateFilePriceTable).done(function (templatePriceTable) {
                            var renderedPriceTable = FXStreet.Util.renderByHtmlTemplate(templatePriceTable, json);
                            _this.Container.find('.fxs_row').append(renderedPriceTable);
                        });
                    }

                    _this.addDOMEvents(json);
                });
            }
        };

        _this.addDOMEvents = function () {
            if (_this.Container != null) {
                _this.addLoginEvent();
                _this.addCTAEvents();
                _this.addShowVideoEvents();
            }
        };

        _this.addLoginEvent = function () {
            var userMenu = FXStreet.Util.getObjectInstance("UserMenu");
            if (userMenu == null) {
                return;
            }

            var ctaLogin = FXStreet.Util.getjQueryObjectById(_this.CtaLoginId, false);
            if (ctaLogin != null && ctaLogin.length > 0) {
                ctaLogin.click(function () { userMenu.Login() });
            }
        };

        _this.addShowVideoEvents = function() {
            if (_this.Event.PublicView && _this.Event.RegistrationRequired) {
                showVideoCurtain = FXStreet.Util.getjQueryObjectById(_this.ShowVideoCurtainId, false);
                videoContainer = FXStreet.Util.getjQueryObjectById(_this.VideoContainerId, false);

                var showVideoButton = FXStreet.Util.getjQueryObjectById(_this.ShowVideoButtonId, false);
                showVideoButton.on("click", onShowVideoClick);
            }
        };

        var onShowVideoClick = function () {
            showVideoCurtain.addClass("fxs_hideElements");
            videoContainer.removeClass("fxs_hideElements");
            sendPlayEvent();
        };

        _this.addCTAEvents = function () {
            var ctaEnter = FXStreet.Util.getjQueryObjectById(_this.CtaEnterId, false);
            if (ctaEnter != null && ctaEnter.length > 0) {
                ctaEnter.on("click", _this.enterEventClick);
            }

            var ctaContactChk = FXStreet.Util.getjQueryObjectById(_this.CtaContactChkId, false);
            if (ctaContactChk != null && ctaContactChk.length > 0) {
                ctaContactChk.on("change", _this.contactAcceptChange);
            }
        };

        _this.enterEventClick = function () {
            sendPlayEvent();
            window.open(_this.Event.EventUrl, "_blank");
        };

        _this.pushSuccess = function () {
        };

        _this.contactAcceptChange = function() {
            var accept = this.checked;

            var storageManager = FXStreet.Class.Patterns.Singleton.FxsSessionStorageManager.Instance();
            storageManager.Save(FXStreet.Util.FxsSessionStorage.AcceptContactOnAir, accept);
        };
        
        var sendPlayEvent = function () {
            var event = {
                Title: _this.Event.Title,
                Origin: "on-air",
                Contact: getCheckboxStatus()
            };
            _this.GoogleDriveMgr.SavePlayEvent(event, _this.pushSuccess);
            _this.MarketingLeadsManagerManager.SavePlayEvent(event, _this.pushSuccess);
        };

        var getCheckboxStatus = function() {
            var contactInputId = "accept_contact_chk_on_air_" + _this.Event.Id;
            var contactInput = FXStreet.Util.getjQueryObjectById(contactInputId, false);
            var result = contactInput.val() === "on";
            return result;
        };
        
        return _this;
    };
}());