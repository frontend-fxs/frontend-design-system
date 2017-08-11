(function () {
    FXStreet.Class.BrokerCallMe = function () {
        var parent = FXStreet.Class.Base(),
            _this = FXStreet.Util.extendObject(parent);

        _this.BrokerId = "";
       
        _this.Container = null;
        _this.CallMeBtn = null;
        _this.FirstSlide = null;
        _this.SecondSlide = null;
        _this.FirstSlideNextBtn = null;
        _this.SecondSlideCallMeBtn = null;

        _this.FullNameInput = null;
        _this.CountrySelect = null;
        _this.PhoneCodeInput = null;
        _this.PhoneInput = null;

        _this.ErrorDiv = null;
        _this.ErrorDivLabel = null;
        _this.SuccessDiv = null;
        _this.SuccessDivLabel = null;
        _this.ReCaptchaDiv = null;

        _this.ErrorMessageFullNameNotValid = "";
        _this.ErrorMessagePhoneNumberNotValid = "";
        
        _this.CallMeData = {};

        _this.init = function (json) {
            _this.setSettingsByObject(json);
            _this.setVars();
            _this.addEvents();
            recaptchaInit();
        };

        _this.setVars = function () {
            _this.Container = $("#" + _this.BrokerId);
            _this.CallMeBtn = _this.Container.find('.fxs_btn_content_toggle_collapse');
            _this.FirstSlide = _this.Container.find('.fxs_contact_broker_slide').eq(0);
            _this.SecondSlide = _this.Container.find('.fxs_contact_broker_slide').eq(1);
            _this.FirstSlideNextBtn = _this.FirstSlide.find('button');
            _this.SecondSlideCallMeBtn = _this.SecondSlide.find('button');

            _this.FullNameInput = _this.Container.find("#fullname-" + _this.BrokerId);
            _this.CountrySelect = _this.Container.find("#select-" + _this.BrokerId);
            _this.PhoneCodeInput = _this.Container.find("#phone-code-" + _this.BrokerId);
            _this.PhoneInput = _this.Container.find("#phone-" + _this.BrokerId);

            _this.ErrorDiv = _this.Container.find("#error-" + _this.BrokerId);
            _this.ErrorDivLabel = _this.ErrorDiv.find("p");
            _this.SuccessDiv = _this.Container.find("#success-" + _this.BrokerId);
            _this.SuccessDivLabel = _this.SuccessDiv.find("span");
            _this.ReCaptchaDiv = _this.Container.find("#recaptcha-" + _this.BrokerId);

            $('[data-toggle="tooltip"]').tooltip();
            _this.CallMeBtn.addClass('collapsed');

            var translations = FXStreet.Resource.Translations['Sidebar_FilterAndList'];
            _this.ErrorMessageFullNameNotValid = translations.CallMeFormErrorEnterValidFullName;
            _this.ErrorMessagePhoneNumberNotValid = translations.CallMeFormErrorEnterValidPhoneNumber;
            _this.ErrorMessageInvalidCaptcha = translations.ErrorCaptchaAlert;

            _this.resetData();
            _this.countrySelectChange();
        };

        _this.addEvents = function () {
            _this.CallMeBtn.click(_this.callMeBtnClick);
            _this.FirstSlideNextBtn.click(_this.firstSlideBtnClick);
            _this.SecondSlideCallMeBtn.click(_this.secondSlideBtnClick);
            _this.CountrySelect.change(_this.countrySelectChange);
        };

        _this.callMeBtnClick = function () {           
            _this.FirstSlide.addClass("active");
            _this.SecondSlide.removeClass("active");
            recaptchaExecute();
        };

        var recaptchaExecute = function () {
            _this.Recaptcha.Execute();
        }

        _this.firstSlideBtnClick = function () {
            _this.hideErrorMessage();

            var fullName = _this.FullNameInput.val();
            if (!_this.validateFullName(fullName)) {
                _this.showErrorMessage(_this.ErrorMessageFullNameNotValid);
                return;
            }

            _this.CallMeData.UserName = fullName;

            _this.FirstSlide.removeClass("active");
            _this.SecondSlide.addClass("active");
        };

        _this.secondSlideBtnClick = function () {
            _this.hideErrorMessage();
            if (!_this.Recaptcha.GetResponse()) {
                _this.showErrorMessage(_this.ErrorMessageInvalidCaptcha);
                return;
            }
           
            var phone = _this.PhoneInput.val();
            if (!_this.validatePhoneNumber(phone)) {
                _this.showErrorMessage(_this.ErrorMessagePhoneNumberNotValid);
                return;
            }

            _this.CallMeData.PhoneNumber = phone;
            _this.CallMeData.PhoneCode = _this.PhoneCodeInput.text();
            _this.CallMeData.CountryName = _this.CountrySelect.find("option:selected").text();

            _this.postData();
        };

        _this.countrySelectChange = function () {
            var phoneCode = "(+" + _this.CountrySelect.find("option:selected").val() + ")";
            _this.PhoneCodeInput.text(phoneCode);
        };
 

      var recaptchaInit = function () {
            var data = {
                ContainerId: 'recaptcha-' + _this.BrokerId,
                Config: {
                    Callback: _this.recaptchaCallback
                }
            }
            _this.Recaptcha = new FXStreet.Class.Recaptcha();
            _this.Recaptcha.init(data);
        };

        _this.recaptchaCallback = function () {
            _this.SecondSlideCallMeBtn.prop('disabled', false);
        };
        
        _this.postData = function () {
            $.ajax({
                type: "POST",
                url: FXStreet.Resource.FxsApiRoutes["BrokerCallMe"],
                data: JSON.stringify(_this.CallMeData),
                contentType: "application/json; charset=utf-8",
                dataType: "json"
            }).done(_this.postDataSuccess)
            .error(_this.postDataError);
        };

        _this.postDataSuccess = function () {
            _this.push();
            _this.resetData();
            _this.CallMeBtn.hide();
            _this.showSuccess();
            _this.Recaptcha.Reset();
        };

        _this.push = function () {
            var tagManager = FXStreet.Class.Patterns.Singleton.TagManager.Instance();
            tagManager.PushToEventhub(_this.CallMeData, "BrokerCallMe");
        };

        _this.postDataError = function (jqXHR, exception) {
            var msg = '';
            if (jqXHR.status === 0) {
                msg = 'Not connect.\n Verify Network.';
            } else if (jqXHR.status == 404) {
                msg = 'Requested page not found. [404]';
            } else if (jqXHR.status == 500) {
                msg = 'Internal Server Error [500].';
            } else if (exception === 'parsererror') {
                msg = 'Requested JSON parse failed.';
            } else if (exception === 'timeout') {
                msg = 'Time out error.';
            } else if (exception === 'abort') {
                msg = 'Ajax request aborted.';
            } else {
                msg = 'Uncaught Error.\n' + jqXHR.responseText;
            }
            _this.showErrorMessage(msg);
        };

        _this.resetData = function () {
            _this.CallMeData = {
                "Culture": FXStreet.Resource.CultureName,
                "BrokerId": _this.BrokerId,
                "UserName": "",
                "CountryName":  "",
                "PhoneCode": "",
                "PhoneNumber": ""
            };

            _this.FirstSlide.removeClass("active");
            _this.SecondSlide.removeClass("active");
            _this.FullNameInput.val('');
            _this.hideErrorMessage();
            _this.hideSuccess();
        };

        _this.validateFullName = function(fullName) {
            return /^[a-z ,.'-]+$/i.test(fullName);
        };

        _this.validatePhoneNumber = function (phone) {
            return phone.match('[0-9\-\(\)\s]+');
        };

        _this.showErrorMessage = function (message) {
            _this.ErrorDiv.show();
            _this.ErrorDivLabel.text(message);
        };

        _this.hideErrorMessage = function () {
            _this.ErrorDiv.hide();
            _this.ErrorDivLabel.text('');
        };
        
        _this.showSuccess = function () {
            _this.SuccessDiv.show();
        };

        _this.hideSuccess = function () {
            _this.SuccessDiv.hide();
        };

        return _this;
    };
}());