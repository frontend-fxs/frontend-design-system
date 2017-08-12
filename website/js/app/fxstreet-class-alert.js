
(function () {
    FXStreet.Class.Alert = function () {
        var parent = FXStreet.Class.Base(),
        _this = FXStreet.Util.extendObject(parent);

        _this.ContainerId = "";
        _this.Container = null;
        _this.Summary = "";
        _this.IsWide = false;
        _this.Title = "";
        _this.HtmlTemplateFile = "staticalert_default.html";
        _this.AlertType = "";

        _this.init = function (json) {
            _this.setSettingsByObject(json);
            _this.setVars();
            _this.render();
        };

        _this.setVars = function () {
            _this.Container = FXStreet.Util.getjQueryObjectById(_this.ContainerId);
        };

        _this.render = function () {
            var jsonData = {
                CssSuffix: _this.AlertType.toLowerCase(),
                Title: _this.Title,
                Summary: _this.Summary,
                IsWide: _this.IsWide
            };

            _this.htmlRender(jsonData);
        };

        _this.htmlRender = function (jsonData) {
            FXStreet.Util.loadHtmlTemplate(_this.HtmlTemplateFile).done(function (template) {
                var rendered = FXStreet.Util.renderByHtmlTemplate(template, jsonData);
                _this.Container.html(rendered);
                _this.Container.find(".fxs_close").on('click', function () {
                    _this.Container.hide();
                });
            });
        };

        return _this;
    };
}());