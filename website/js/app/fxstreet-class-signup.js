(function () {
    FXStreet.Class.SignUp = function () {

        var parent = FXStreet.Class.Base(),
        _this = FXStreet.Util.extendObject(parent);

        _this.ContainerId = "";

        _this.SignupUrl = FXStreet.Resource.FxsApiRoutes["RegisterUserUrl"];
        _this.CountriesApiUrl = FXStreet.Resource.FxsApiRoutes["CountryApiGetAll"];

        _this.EmailSignupTextboxId = 'emailSignupTB';
        _this.PasswordSignupTextboxId = 'passwordSignupTB';
        _this.PhoneSignupTextboxId = 'phoneSignupTB';
        _this.TermsCheckBoxId = 'termsCB';
        _this.FullNameSignupTextboxId = 'fullnameSignupTB';
        _this.PhoneCodeTextboxId = 'phoneCodeSignupTB';
        _this.SignupPasswordEyeId = 'signupPasswordEyeId';
        _this.CountrySignupDropDown = 'countrySignupDDL';
        _this.FormId = 'fxs_signup_form_';
        _this.ResponseSignUpId = "responseSignup";
        _this.SubmitButtonId = 'submitButtonId';

        _this.FullNameContainerId = 'fxs_fullname_container_';
        _this.PhoneContainerId = 'fxs_phone_container_';
        _this.EmailContainerId = 'fxs_email_container_';
        _this.PasswordContainerId = 'fxs_password_container_';
        _this.TermsContainerId = 'fxs_terms_container_';
        _this.EmailServerErrorContainerId = 'fxs_email_server_error_container_';

        _this.SignUpHtmlTemplateFile = "signup.html";
        _this.SignUpOkHtmlTemplateFile = "signup_confirmation.html";
        
        _this.SingupNewslettersSubscription = 'singupNewslettersSubscription';
        _this.FxsUserErrorClass = "fxs_user_field_error";
        _this.FxsDisabledFieldsClass = "fxs_disbale_fields";

        _this.Container = null;
        _this.EmailSignupTextbox = null;
        _this.PasswordSignupTextbox = null;
        _this.PhoneSignupTextbox = null;
        _this.FullNameSignupTextbox = null;
        _this.PhoneCodeTextbox = null;
        _this.SignupPasswordEye = null;
        _this.Form = null;
        _this.Validator = null;
        _this.RegisterData = null;
        _this.PhoneContainer = null;
        _this.EmailContainer = null;
        _this.EmailServerErrorContainer = null;
        _this.PasswordContainer = null;
        _this.SubmitButton = null;
        _this.TermsCheckBox = null;
        _this.Translations = null;

        _this.Messages = { SignupError: '', DuplicatedMail: '', DuplicatedUserName: '', Success: '', InvalidPassword: '' };

        _this.init = function (json) {
            _this.setSettingsByObject(json);
            _this.render(json);
        };

        _this.render = function (jsonData) {
            _this.htmlRender(jsonData);
        };

        _this.htmlRender = function (jsonData) {
            FXStreet.Util.loadHtmlTemplate(_this.SignUpHtmlTemplateFile).done(function (template) {
                var rendered = FXStreet.Util.renderByHtmlTemplate(template, jsonData);

                _this.Container = FXStreet.Util.getjQueryObjectById(_this.ContainerId);
                _this.Container.html(rendered);

                _this.setVars(jsonData);
                _this.addEvents();
            });
        };

        _this.setVars = function (json) {

            _this.EmailSignupTextbox = FXStreet.Util.getjQueryObjectById(_this.EmailSignupTextboxId);
            _this.PasswordSignupTextbox = FXStreet.Util.getjQueryObjectById(_this.PasswordSignupTextboxId);
            _this.PhoneSignupTextbox = FXStreet.Util.getjQueryObjectById(_this.PhoneSignupTextboxId);
            _this.FullNameSignupTextbox = FXStreet.Util.getjQueryObjectById(_this.FullNameSignupTextboxId);
            _this.PhoneCodeTextbox = FXStreet.Util.getjQueryObjectById(_this.PhoneCodeTextboxId);
            _this.CountrySignupSelect = FXStreet.Util.getjQueryObjectById(_this.CountrySignupDropDown);

            _this.SubmitButton = FXStreet.Util.getjQueryObjectById(_this.SubmitButtonId);
            _this.PhoneContainer = FXStreet.Util.getjQueryObjectById(_this.PhoneContainerId);
            _this.EmailContainer = FXStreet.Util.getjQueryObjectById(_this.EmailContainerId);
            _this.EmailServerErrorContainer = FXStreet.Util.getjQueryObjectById(_this.EmailServerErrorContainerId);
            _this.FullNameContainer = FXStreet.Util.getjQueryObjectById(_this.FullNameContainerId);
            _this.PasswordContainer = FXStreet.Util.getjQueryObjectById(_this.PasswordContainerId);
            _this.TermsCheckBox = FXStreet.Util.getjQueryObjectById(_this.TermsCheckBoxId);
            _this.TermsContainer = FXStreet.Util.getjQueryObjectById(_this.TermsContainerId);
            _this.SignupPasswordEye = FXStreet.Util.getjQueryObjectById(_this.SignupPasswordEyeId);

            _this.GetAllUpdatesCheckbox = FXStreet.Util.getjQueryObjectById(_this.SingupNewslettersSubscription);

            _this.Form = FXStreet.Util.getjQueryObjectById(_this.FormId +_this.ContainerId);
            
            _this.LoginRegistering = json.Translations.RegisteringLabel;
            _this.LoginSignUp = json.Translations.SignupNowLabel;
            _this.Translations =json.Translations;

            _this.PhoneValid = false;
            _this.Validator =_this.Form.validate({submitHandler: _this.SubmitForm,
                                                  invalidHandler: _this.InvalidForm,
                                                  errorPlacement: function () {} });
        }
     
        _this.signupSuccess = function (response) {
            switch (response)
            {
                case 'Success':
                    _this.NewslettersSubscribeAtSignUp(_this.RegisterData);

                    var jsonData = {
                        UserName: _this.FullNameSignupTextbox.val(),
                        UserEmail: _this.EmailSignupTextbox.val(),
                        Translations: _this.Translations
                    };
                    FXStreet.Util.loadHtmlTemplate(_this.SignUpOkHtmlTemplateFile).done(function (template) {
                        var rendered = FXStreet.Util.renderByHtmlTemplate(template, jsonData);
                        _this.Container = FXStreet.Util.getjQueryObjectById(_this.ContainerId);
                        _this.Container.html(rendered);
                    });
                    break;
                case 'DuplicateEmail':
                case 'DuplicateUserName':
                    _this.EmailServerErrorContainer.addClass(_this.FxsUserErrorClass);
                    break;
                case 'InvalidPassword':
                    _this.PasswordContainer.addClass(_this.FxsUserErrorClass);
                    break;
                default:
                    //Response Message error by default
                    break;
            }
            _this.SubmitButton.html(_this.LoginSignUp);
        };

        _this.NewslettersSubscribeAtSignUp = function (data) {
            if (_this.GetAllUpdatesCheckbox[0].checked) {
                var newslettersList = _this.GetAllUpdatesCheckbox.data("newsletters-list").split(";");
                var email = data.Email;

                _this.NewsletterSubscriber = new FXStreet.Class.NewslettersSubscriber();
                _this.NewsletterSubscriber.init({});

                _this.NewsletterSubscriber.NewsletterFollow = newslettersList;
                _this.NewsletterSubscriber.NewsletterUnfollow = [];
                _this.NewsletterSubscriber.Email = email;

                _this.NewsletterSubscriber.SendToEventHub();
            }
        };

        var validationElement = function(elementId, container) {
            if (!_this.Validator.element('#' + elementId))
            {
                container.addClass(_this.FxsUserErrorClass);
            } else 
            {
                container.removeClass(_this.FxsUserErrorClass);
            }
        }

        _this.InvalidForm = function () {

            validationElement(_this.FullNameSignupTextboxId, _this.FullNameContainer);
            validationElement(_this.PasswordSignupTextboxId, _this.PasswordContainer);
            validationElement(_this.EmailSignupTextboxId, _this.EmailContainer);
            validationElement(_this.PhoneSignupTextboxId, _this.PhoneContainer);
            validationElement(_this.TermsCheckBoxId, _this.TermsContainer);

            _this.Validator.checkForm();
            _this.RegisterData = null;
        };

        _this.addEvents = function () {
            $(_this.PhoneSignupTextbox).focusout(function () { validatePhoneNumber(); });
            $(_this.PhoneCodeTextbox).focusout(function () { if (_this.PhoneSignupTextbox.val()) { validatePhoneNumber(); } });

            $(_this.CountrySignupSelect).change(function () {
                if (_this.CountrySignupSelect.val()) {
                    _this.PhoneCodeTextbox[0].value = _this.CountrySignupSelect.val();
                    _this.PhoneContainer.removeClass(_this.FxsDisabledFieldsClass);

                    if (_this.PhoneSignupTextbox.val()) {
                        validatePhoneNumber();
                    }
                }
            });

            $(_this.SignupPasswordEye).click(function () {
                $(_this.SignupPasswordEye).toggleClass("active");
                var type = "type";
                var passwordType = "password";
                var textType = "text";

                if ($(_this.PasswordSignupTextbox).attr(type) === passwordType)
                {
                    $(_this.PasswordSignupTextbox).attr(type, textType);
                }
                else
                {
                    $(_this.PasswordSignupTextbox).attr(type, passwordType);
                }
            });

            $(_this.FullNameSignupTextbox).focusout(function () { validationElement(_this.FullNameSignupTextboxId, _this.FullNameContainer); });
            $(_this.PasswordSignupTextbox).focusout(function () { validationElement(_this.PasswordSignupTextboxId, _this.PasswordContainer); });
            $(_this.EmailSignupTextbox).focusout(function () { validationElement(_this.EmailSignupTextboxId, _this.EmailContainer); });
            $(_this.PhoneSignupTextbox).focusout(function () { validationElement(_this.PhoneSignupTextboxId, _this.PhoneContainer); });
            $(_this.TermsCheckBox).click(function () { validationElement(_this.TermsCheckBoxId, _this.TermsContainer); });

            if (_this.CountrySignupSelect.find('option').length === 1)
            {
                $.ajax({
                    type: "GET",
                    url: _this.CountriesApiUrl + '?cultureName=' + FXStreet.Resource.CultureName,
                    contentType: "application/json; charset=utf-8",
                    dataType: "json"
                }).done(function (countries) {
                    $.each(countries, function (key, value) {
                        var phoneCodeStr = '+' + value.PhoneCode;
                        _this.CountrySignupSelect.append($('<option>', { value: phoneCodeStr }).text(value.Title));
                    });
                });
            }
        };

        _this.SubmitForm = function () {
            validatePhoneNumber(submitUserForm);
            return false;
        };

        var getCompletePhoneNumber = function () {
            var phoneCode = _this.PhoneCodeTextbox.val().replace(/[() ]/g, '');

            var result = phoneCode + _this.PhoneSignupTextbox.val();
            return result;
        }

        var validatePhoneNumber = function (callback) {
            var phone = encodeURIComponent(getCompletePhoneNumber());
            
            var auth = FXStreet.Class.Patterns.Singleton.Authorization.Instance();
            auth.getTokenPromise().then(function (token) {
                $.ajax({
                    type: "GET",
                    url: FXStreet.Resource.PhoneServiceUrl.format(phone),
                    beforeSend: function (xhr) {
                        xhr.setRequestHeader("Authorization", token.token_type + ' ' + token.access_token);
                    }
                })
                .done(function (phoneData) {
                    if (phoneData && phoneData.IsPhoneValid) {
                        _this.PhoneContainer.removeClass(_this.FxsUserErrorClass);
                        _this.PhoneValid = true;
                        if (callback) callback(_this.PhoneValid);
                    }})
                .fail(function () {
                    _this.PhoneContainer.addClass(_this.FxsUserErrorClass);
                    _this.PhoneValid = false;
                    if (callback) callback(_this.PhoneValid);
                });
            });
        }

        function getParameterByName(name, url) {
            if (!url) { url = window.location.href; }

            name = name.replace(/[\[\]]/g, "\\$&");
            var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
                results = regex.exec(url);
            if (!results) return null;
            if (!results[2]) return '';
            return decodeURIComponent(results[2].replace(/\+/g, " "));
        }

        var getUriToRedirect = function() {
            var result = getParameterByName('uriToRedirect');
            return result;
        };

        var submitUserForm = function (isValidPhone) {


            _this.SubmitButton.html(_this.LoginRegistering);
            _this.EmailServerErrorContainer.removeClass(_this.FxsUserErrorClass);

            if (!isValidPhone) return;
            _this.RegisterData = {Password: _this.PasswordSignupTextbox.val(),
                                  Email: _this.EmailSignupTextbox.val(),
                                  Phone: getCompletePhoneNumber(),
                                  FullName: _this.FullNameSignupTextbox.val(),
                                  UriToRedirect: getUriToRedirect()
            };
            $.ajax({
                type: "POST",
                url: _this.SignupUrl,
                data: JSON.stringify(_this.RegisterData),
                contentType: "application/json; charset=utf-8",
                dataType: "json"
            }).done(_this.signupSuccess);
        };

        return _this;
    };
}());