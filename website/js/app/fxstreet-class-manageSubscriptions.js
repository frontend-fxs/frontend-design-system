(function () {
    FXStreet.Class.ManageSubscription = function () {
        var parent = FXStreet.Class.Base(),
             _this = FXStreet.Util.extendObject(parent);

        _this.ContainerId = "";
        _this.UserPersonalization = {};
        _this.Translations = {};

        _this.HtmlTemplateFile = "manage_subscriptions.html";
        _this.Container = null;

        _this.NewsletterSubscriber = null;
        _this.ActiveClass = "active";

        _this.init = function (json) {
            _this.setSettingsByObject(json);
            _this.setVars(json);
            _this.render(json);
        };

        _this.setVars = function (json) {
            _this.Container = FXStreet.Util.getjQueryObjectById(_this.ContainerId);

            json.AuthorsActiveClass = json.AuthorsActive ? _this.ActiveClass : "";
            json.NewslettersActiveClass = json.NewslettersActive ? _this.ActiveClass : "";
        };

        _this.render = function (jsonData) {
            FXStreet.Util.loadHtmlTemplate(_this.HtmlTemplateFile).done(function (template) {
                var rendered = FXStreet.Util.renderByHtmlTemplate(template, jsonData);
                _this.Container.html(rendered);

                _this.addEvents();
            });
        };

        _this.addEvents = function () {
            $("[subscription-tab]").on("click", _this.selectTab);


            _this.initSubscribeToNewsletter();

            FXStreet.Resource.UserId = _this.UserPersonalization.UserId;
            var authors = _this.UserPersonalization.Authors;
            authors.forEach(function (data) {
                _this.initAuthorFollowController(data.Author);
            });
            var suggestedAuthors = _this.UserPersonalization.SuggestedAuthors;
            suggestedAuthors.forEach(function (data) {
                _this.initAuthorFollowController(data.Author);
            });

            if (!_this.UserPersonalization.UserEmail) {
                _this.addLoginEvent();
            }
        };

        _this.addLoginEvent = function () {
            var userMenu = FXStreet.Util.getObjectInstance("UserMenu");
            if (userMenu == null) {
                return;
            }
            
            var ctaLoginId = "fxs_cta_login_" + _this.ContainerId;

            var ctaLogin = FXStreet.Util.getjQueryObjectById(ctaLoginId, false);
            if (ctaLogin != null && ctaLogin.length > 0) {
                ctaLogin.click(function () { userMenu.Login();  });
            }
        };

        _this.CheckSelectedNewsleters = function () {
            _this.NewsletterSubscriber.NewsletterFollow = [];
            _this.NewsletterSubscriber.NewsletterUnfollow = [];
            _this.Container.find("input:checkbox[name=newsletters]").each(function () {
                if ($(this).is(':checked')) {
                    _this.NewsletterSubscriber.NewsletterFollow.push($(this).attr('value'));
                }
                else {
                    _this.NewsletterSubscriber.NewsletterUnfollow.push($(this).attr('value'));
                }
            });

            return true;
        };

        _this.ShowSuccessMessage = function () {
            $("#success_message_" + _this.ContainerId).show().delay(5000).hide(0);
        };

        _this.initAuthorFollowController = function (authorData) {
            var json = {
                UserInfo: {
                    Email: _this.UserPersonalization.UserEmail,
                    IsLogged: true,
                    Personalization: _this.UserPersonalization
                },
                Author: authorData,
                FollowButtonId: "fxs_cta_authorfollow_" + authorData.Id
            }
            var authorFollowObj = new FXStreet.Class.AuthorFollow();
            authorFollowObj.init(json);
        };

        _this.initSubscribeToNewsletter = function () {
            var json = {
                WidgetType: 'fxs_widget_tab',
                Email: _this.UserPersonalization.UserEmail,
                CountryCode: _this.UserPersonalization.CountryCode,
                Newsletters: _this.UserPersonalization.Newsletters,
                ContainerId: 'newsletters_' + _this.ContainerId,
                EmailPlaceholderText: _this.Translations["EmailPlaceholderText"],
                SubscribeButtonText: _this.Translations["ButtonUpdate"],
                CongratsAlertLabel: _this.Translations["CongratsAlertLabel"],
                CongratsAlertText: _this.Translations["CongratsAlertText"],
                ErrorAlertLabel: _this.Translations["ErrorAlertLabel"],
                ErrorAlertText: _this.Translations["ErrorAlertText"],
                ErrorAlertLabel: _this.Translations["ErrorAlertLabel"],
                ErrorCaptchaAlertText: _this.Translations["ErrorCaptchaAlertText"],
            };

            _this.SubscribeToNewsletter = new FXStreet.Class.SubscribeToNewsletter();
            _this.SubscribeToNewsletter.init(json);
        };

        _this.selectTab = function (e) {
            var tabButton = $(e.target);
            var tabSelector = tabButton.data("tabselector");

            tabButton.parent().addClass(_this.ActiveClass).siblings().removeClass(_this.ActiveClass);

            $(tabSelector).show().siblings().hide();

            return false;
        };

        return _this;

    };
}());