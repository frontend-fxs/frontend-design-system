
(function () {
    FXStreet.Class.Login = function () {

        var parent = FXStreet.Class.Base(),
            _this = FXStreet.Util.extendObject(parent);

        _this.ContainerId = "";
        _this.Container = null;
        _this.HtmlTemplateFile = "login.html";
        _this.SignupPasswordEyeId = "signupPasswordEyeId";
        _this.FxsUserErrorClass = "fxs_user_field_error";
        _this.UsernameLoginTextboxId = "";
        _this.PasswordLoginTextboxId = "";

        _this.UsernameLoginTextbox = null;
        _this.PasswordLoginTextbox = null;
        _this.SignupPasswordEye = null;
        _this.UserContainer = null;
        _this.PasswordContainer = null;

        _this.LoginUrl = FXStreet.Resource.FxsApiRoutes["LoginUrl"];
        _this.Form = null;

        _this.init = function (json) {
            _this.setSettingsByObject(json);
            _this.setVars(json);
            _this.render(json);
        };

        _this.addEvents = function () {
            $(_this.SignupPasswordEye).click(function () {
                $(_this.SignupPasswordEye).toggleClass("active");
                var type = "type";
                var passwordType = "password";
                var textType = "text";
                if ($(_this.PasswordLoginTextbox).attr(type) === passwordType) {
                    $(_this.PasswordLoginTextbox).attr(type, textType);
                }
                else {
                    $(_this.PasswordLoginTextbox).attr(type, passwordType);
                }
            });
        };

        _this.setVars = function (json) {
            _this.Container = FXStreet.Util.getjQueryObjectById(_this.ContainerId);
            _this.UsernameLoginTextboxId = 'fxs_login_username_' + _this.ContainerId;
            _this.PasswordLoginTextboxId = 'fxs_login_password_' +_this.ContainerId;
            _this.FormLoginId = 'fxs_login_form_' +_this.ContainerId;
            _this.UserContainerId = 'fxs_username_container_' +_this.ContainerId;
            _this.PasswordContainerId = 'fxs_password_container_' +_this.ContainerId;
        };

        _this.render = function (jsonData) {
            _this.htmlRender(jsonData);
        };

        _this.htmlRender = function (jsonData) {
            FXStreet.Util.loadHtmlTemplate(_this.HtmlTemplateFile).done(function (template) {

                jsonData.LoginUrl = _this.LoginUrl;

                var rendered = FXStreet.Util.renderByHtmlTemplate(template, jsonData);
                _this.Container.html(rendered);
                _this.Container.find(".fxs_close").on('click', function () {
                    _this.Container.hide();
                });

                _this.UsernameLoginTextbox = FXStreet.Util.getjQueryObjectById(_this.UsernameLoginTextboxId);
                _this.PasswordLoginTextbox = FXStreet.Util.getjQueryObjectById(_this.PasswordLoginTextboxId);

                _this.UserContainer = FXStreet.Util.getjQueryObjectById(_this.UserContainerId);
                _this.PasswordContainer = FXStreet.Util.getjQueryObjectById(_this.PasswordContainerId);

                _this.Form = FXStreet.Util.getjQueryObjectById(_this.FormLoginId);
                _this.Form.validate({ invalidHandler: _this.InvalidForm, errorPlacement: function () { } });

                _this.SignupPasswordEye = FXStreet.Util.getjQueryObjectById(_this.SignupPasswordEyeId);
                _this.addEvents();
                _this.loadData();
            });
        };

        _this.loadData = function () {
            var userName = getParameterByName('username');
            if (userName) {
                _this.UsernameLoginTextbox.val(userName);
            }

            var error = getParameterByName('error');
            if (error) {
                $(_this.UserContainer).addClass(_this.FxsUserErrorClass);
                $(_this.PasswordContainer).addClass(_this.FxsUserErrorClass);
            }

        };

        _this.SubmitForm = function () {
            _this.Form.submit();
        };

        function getParameterByName(name, url) {
            if (!url) { url = window.location.href; }

            name = name.replace(/[\[\]]/g, "\\$&");
            var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
                results = regex.exec(url);
            if (!results) return null;
            if (!results[2]) return '';
            return decodeURIComponent(results[2].replace(/\+/g, " "));
        }

        return _this;
    };
}());