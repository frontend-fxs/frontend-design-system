(function () {
    FXStreet.Class.GlobalAlert = function () {
        var parent = FXStreet.Class.Base(),
        _this = FXStreet.Util.extendObject(parent);

        _this.ContainerId = "";
        _this.Title = "";
        _this.Message = "";
        _this.IsModal = false;
        _this.GlobalAlertKey = "GlobalAlertRemainHide";


        _this.Container = null;      
        _this.HtmlTemplateFile = function () {
            return _this.IsModal ? "globalalert_modal.html" : "globalalert_default.html";
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
            if ($.cookie(_this.GlobalAlertKey) !== undefined) {
                _this.Container.hide();
                return;
            }

            _this.Container.addClass('fxs_global_alert fxs_alert_featured alert alert-dismissible fade in');

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
            expiration.setDate(expiration.getDate() + 1);
            $.cookie(_this.GlobalAlertKey, '', { path: '/', expires: expiration });
        }

        return _this;
    };
}());