(function () {
    FXStreet.Class.Recaptcha = function () {
        var parent = FXStreet.Class.Base(),
            _this = FXStreet.Util.extendObject(parent);

        _this.ContainerId = "";
        _this.Config = {};
        _this.RecaptchaInitialized = false;
        _this.CaptchaId = "";

        _this.init = function (json) {
            _this.setSettingsByObject(json);
            _this.setVars();
            _this.htmlRender(json);
        };

        _this.setVars = function () {
            _this.Container = FXStreet.Util.getjQueryObjectById(_this.ContainerId);
        };

        _this.htmlRender = function (jsonData) {
            if (_this.RecaptchaInitialized === false) {
                _this.CaptchaId = grecaptcha.render(_this.ContainerId,
                {
                    sitekey: FXStreet.Resource.GoogleReCaptchaSiteKey,                                        
                    callback: _this.Config.Callback,
                    size: 'invisible',
                    badge: 'inline'
                });
                _this.RecaptchaInitialized = true;
            }
        };

        _this.Reset = function () {
            grecaptcha.reset(_this.CaptchaId);
        }

        _this.Execute = function () {
            grecaptcha.execute(_this.CaptchaId);
        }

        _this.GetResponse = function () {
            var response = grecaptcha.getResponse(_this.CaptchaId);
            return (response.length > 0);
        }

        return _this;
    };
}());