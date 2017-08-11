(function () {
    FXStreet.Class.CookiesAlert = function () {
        var parent = FXStreet.Class.Base(),
        _this = FXStreet.Util.extendObject(parent);

        _this.ContainerId = "";
        _this.Title = "";
        _this.Message = "";
        _this.IsModal = false;


        _this.Container = null;
        _this.CookieKey = "CookiesPolicyAccepted";
        _this.HtmlTemplateFile = function () {
            return _this.IsModal ? "cookiesalert_modal.html" : "cookiesalert_default.html";
        }
        _this.CloseButtonId = '';

        _this.init = function (json) {
            _this.setSettingsByObject(json);
            _this.setVars();
            _this.render();
        };

        _this.setVars = function () {
            _this.Container = FXStreet.Util.getjQueryObjectById(_this.ContainerId);
            _this.CloseButtonId = FXStreet.Util.guid();
        };

        _this.render = function () {
            if ($.cookie(_this.CookieKey) !== undefined) {
                _this.Container.hide();
                return;
            }

            _this.Container.addClass('fxs_global_alert fxs_alertCookies fxs_alertTitle_dissmisible fxs_alert_info alert alert-dismissible fade in');

            var jsonData = {
                Title: _this.Title,
                Message: _this.Message,
                CloseButtonId: _this.CloseButtonId
            };

            _this.htmlRender(jsonData);
        };

        _this.htmlRender = function (jsonData) {
            FXStreet.Util.loadHtmlTemplate(_this.HtmlTemplateFile()).done(function (template) {
                var rendered = FXStreet.Util.renderByHtmlTemplate(template, jsonData);
                _this.Container.html(rendered);


                var closeButton = FXStreet.Util.getjQueryObjectById(_this.CloseButtonId);
                closeButton.on('click', _this.onCloseButtonClick);
            });
        };

        _this.onCloseButtonClick = function () {
            var expiration = new Date();
            expiration.setFullYear(expiration.getFullYear() + 2);
            $.cookie(_this.CookieKey, '', { path: '/', expires: expiration });
        }

        return _this;
    };
}());