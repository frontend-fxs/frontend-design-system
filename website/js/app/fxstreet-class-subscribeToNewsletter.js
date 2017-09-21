(function () {
    FXStreet.Class.NewslettersSubscriber = function () {
        var parent = FXStreet.Class.Base(),
            _this = FXStreet.Util.extendObject(parent);

        _this.Email = "";
        _this.CountryCode = "";
        _this.FollowingClass = "";
        _this.NewsletterFollow = [];
        _this.NewsletterUnfollow = [];

        _this.init = function (json) {
            _this.setSettingsByObject(json);
        };

        _this.SendToEventHub = function () {
            var data = {
                "ActionEmail": _this.Email,
                "LanguageId": FXStreet.Resource.LanguageId,
                "NewsletterFollow": _this.NewsletterFollow,
                "NewsletterUnfollow": _this.NewsletterUnfollow,
                "CountryCode": _this.CountryCode
            };

            var tagManager = FXStreet.Class.Patterns.Singleton.TagManager.Instance();
            tagManager.PushToEventhub(data, "Newsletter");
        };

        return _this;
    };
    FXStreet.Class.SubscribeToNewsletter = function () {
        var parent = FXStreet.Class.Base(),
            _this = FXStreet.Util.extendObject(parent);

        _this.ContainerId = '';
        _this.NewsletterFollow = [];
        _this.NewsletterUnfollow = [];
        _this.Email = '';
        _this.CountryCode = '';
        _this.WidgetType = '';
        _this.DefaultNewslettersIds = [];
        _this.Newsletters = [];

        _this.CheckNewslettersBeforeSend = null;
        _this.CheckboxGetAll = null;
        _this.Container = null;
        _this.TextBox = null;
        _this.SuccessMessageDiv = null;
        _this.ErrorMessageDiv = null;
        _this.SubmitButton = null;
        _this.CheckboxItems = null;
        _this.CheckboxGroup = 'newsletters';
        _this.CheckboxGetAllId = '00000000-0000-0000-0000-000000000000';
        _this.SaveSubscribedNewslettersCookie = null;
        _this.Recaptcha = null;

        var hideDropdownClass = "";

        _this.init = function (json) {
            _this.setSettingsByObject(json);
            _this.setVars();
            _this.htmlRender(json);
        };

        _this.setVars = function () {
            if (!_this.WidgetType) {
                _this.WidgetType = 'fxs_widget_default';
            };
            _this.Container = FXStreet.Util.getjQueryObjectById(_this.ContainerId);
            _this.HtmlTemplateFile = getTemplateName(_this.WidgetType);
            _this.DefaultNewslettersIds = getDefaultNewslettersIds();
            setInitialCheckedNewsletters();

            if (_this.WidgetType === 'fxs_widget_light') {
                hideDropdownClass = 'fxs_hideElements';
            } else {
                hideDropdownClass = 'fxs_dBlock';
            }
        };

        var getTemplateName = function (widgetType) {
            var templates = {
                'fxs_widget_mini': 'subscribe_mini.html',
                'fxs_widget_default': 'subscribe_default.html',
                'fxs_widget_big': 'subscribe_big.html',
                'fxs_widget_tab': 'subscribe_tab.html',
                'fxs_widget_light': 'subscribe_light.html'
            };
            return templates[widgetType];
        }

        var setInitialCheckedNewsletters = function () {
            var subscribedNewsletters = $.grep(_this.Newsletters, function (newsletter) {
                return newsletter.Subscribed;
            });
            if (subscribedNewsletters.length === 0 && !_this.Email) {
                $.each(_this.Newsletters, function () {
                    this.Subscribed = true;
                });
            }
        }

        var getDefaultNewslettersIds = function () {
            var defaultNewsletters = $.grep(_this.Newsletters, function (newsletter) {
                return newsletter.Default;
            });
            return defaultNewsletters.map(function (newsletter) { return newsletter.Id; });
        }

        _this.addEvents = function () {
            _this.TextBox.on('keydown', _this.textBoxKeyDown);
            _this.SubmitButton.on('click', _this.Submit);
            _this.CheckboxGetAll.on('change', _this.selectAll);
            _this.CheckboxItems.on('change', _this.unSelectAll);
            if (_this.DropdownButton) {
                _this.DropdownButton.on('click',
                    function () {
                        _this.DropDownNewsletters.toggleClass(hideDropdownClass);
                    });
            }
        };

        var initExternalComponents = function () {
            initSubscribeToNewsletter();
            initRecaptcha();
        }

        _this.htmlRender = function (jsonData) {
            FXStreet.Util.loadHtmlTemplate(_this.HtmlTemplateFile).done(function (template) {
                _this.onRendered(template, jsonData);
            });
        };

        _this.onRendered = function (template, jsonData) {
            var rendered = FXStreet.Util.renderByHtmlTemplate(template, jsonData);
            _this.Container.html(rendered);
            _this.TextBox = FXStreet.Util.getjQueryObjectById('inputMail_' + _this.ContainerId);
            _this.TextBox.val(_this.Email);
            _this.SubmitButton = FXStreet.Util.getjQueryObjectById('submit_' + _this.ContainerId);
            _this.CheckboxGetAll = _this.Container.find("input:checkbox[name=" + _this.CheckboxGroup + "][value=" + _this.CheckboxGetAllId + "]");
            _this.CheckboxItems = _this.Container.find("input:checkbox[name=" + _this.CheckboxGroup + "][value!=" + _this.CheckboxGetAllId + "]");
            _this.SuccessMessageDiv = _this.Container.find('#successMessageDiv_' + _this.ContainerId);
            _this.ErrorMessageDiv = _this.Container.find('#errorMessageDiv_' + _this.ContainerId);
            _this.ErrorCaptchaMessageDiv = _this.Container.find('#errorCaptchaMessageDiv_' + _this.ContainerId);

            if ($('#dropdownNewsletters_' + _this.ContainerId).length > 0) {
                _this.DropDownNewsletters = FXStreet.Util.getjQueryObjectById('dropdownNewsletters_' + _this.ContainerId);
                _this.DropdownButton = FXStreet.Util.getjQueryObjectById('dropdownButton_' + _this.ContainerId);
            }
            _this.addEvents();
            initExternalComponents();
        };


        var initSubscribeToNewsletter = function () {
            var json = {
                Email: _this.Email,
                CountryCode: _this.CountryCode
            };

            _this.NewsletterSubscriber = new FXStreet.Class.NewslettersSubscriber();
            _this.NewsletterSubscriber.init(json);
        };


        var initRecaptcha = function () {
            var data = {
                ContainerId: 'recaptcha_' + _this.ContainerId,
                Config: {
                    Callback: _this.Subscribe
                }
            }
            _this.Recaptcha = new FXStreet.Class.Recaptcha();
            _this.Recaptcha.init(data);
        };


        _this.selectAll = function () {
            _this.CheckboxItems.each(function (index, element) {
                element.checked = _this.CheckboxGetAll.prop('checked');
            });
        }

        _this.unSelectAll = function () {
            if (_this.CheckboxGetAll.prop('checked')) {
                $(_this.CheckboxGetAll.prop('checked', false));
            }
        }

        _this.textBoxKeyDown = function (e) {
            if (e.keyCode === 13) {
                _this.textBoxEnter();
            }
        };

        _this.Submit = function (e) {
            if (_this.DropDownNewsletters) {
                if (_this.WidgetType === 'fxs_widget_light') {
                    _this.DropDownNewsletters.addClass(hideDropdownClass);
                } else {
                    _this.DropDownNewsletters.removeClass(hideDropdownClass);
                }
            }
            if (preSubmit()) {
                _this.Recaptcha.Execute();
            }
            return false;
        }

        _this.Subscribe = function () {
            if (preSubscribe()) {
                _this.NewsletterSubscriber.SendToEventHub();
                postSubscribe();
            }
            _this.Recaptcha.Reset();
        }

        var preSubmit = function () {
            $(_this.SuccessMessageDiv).hide();
            $(_this.ErrorMessageDiv).hide();
            $(_this.ErrorCaptchaMessageDiv).hide();


            if (_this.TextBox.valid()) {
                _this.Email = _this.TextBox.val();
                return true;
            } else {
                $(_this.ErrorMessageDiv).show();
                return false;
            }
        };

        var preSubscribe = function () {
            if (!_this.Recaptcha.GetResponse()) {
                $(_this.ErrorCaptchaMessageDiv).show();
                return false;
            }

            checkNewslettersBeforeSend();
            _this.NewsletterSubscriber.NewsletterFollow = _this.NewsletterFollow;
            _this.NewsletterSubscriber.NewsletterUnfollow = _this.NewsletterUnfollow;
            _this.NewsletterSubscriber.Email = _this.Email;

            return preSubmit();
        };

        var postSubscribe = function () {
            saveSubscribedNewslettersCookie();
            $(_this.SuccessMessageDiv).show().delay(5000).hide(0);
            _this.Recaptcha.Reset();
        };

        var checkNewslettersBeforeSend = function () {
            _this.NewsletterFollow = [];
            _this.NewsletterUnfollow = [];
            _this.Container.find("input:checkbox[name=" + _this.CheckboxGroup + "]").each(function () {
                if ($(this).attr('value') !== _this.CheckboxGetAllId) {
                    if ($(this).is(':checked')) {
                        _this.NewsletterFollow.push($(this).attr('value'));
                    }
                    else {
                        _this.NewsletterUnfollow.push($(this).attr('value'));
                    }
                }
            });

            addDefaultNewsletters();
        };

        var addDefaultNewsletters = function () {
            if (_this.NewsletterFollow.length > 0) {
                _this.NewsletterFollow = $.merge(_this.DefaultNewslettersIds, _this.NewsletterFollow);
            } else {
                _this.NewsletterUnfollow = $.merge(_this.DefaultNewslettersIds, _this.NewsletterUnfollow);
            }
        }

        var saveSubscribedNewslettersCookie = function () {
            var cookieManager = FXStreet.Class.Patterns.Singleton.FxsCookiesManager.Instance();
            cookieManager.UpdateCookie(FXStreet.Util.FxsCookie.SubscribedNewsletters, JSON.stringify(_this.NewsletterFollow), 20 * 365);
        }


        _this.textBoxEnter = function () {
            _this.SubmitButton.click();
        };

        return _this;
    };
}());