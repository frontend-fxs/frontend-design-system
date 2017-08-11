(function () {
    FXStreet.Class.TextOverCustomImage = function () {
        var parent = FXStreet.Class.Base(),
            _this = FXStreet.Util.extendObject(parent);

        _this.ContainerId = "";
        _this.Container = null;
        _this.Name = "";
        _this.Title = "";
        _this.Summary = "";
        _this.ImageUrl = "";
        _this.TextUrl = "";
        _this.Author = "";
        _this.AuthorUrl = "";
        _this.Sponsored = false;
        _this.SponsoredContent = "";
        _this.ByDisplay = "";

        _this.HtmlTemplateFile = "";
        _this.AlertType = "";

        _this.init = function (json) {
            _this.setSettingsByObject(json);
            _this.setVars();
            _this.htmlRender();
        };

        _this.setVars = function () {
            _this.Container = FXStreet.Util.getjQueryObjectById(_this.ContainerId);
        };

        _this.htmlRender = function () {
            var jsonData = jQuery.extend({}, _this);
            jsonData.HasAuthor = _this.Author !== null && _this.Author !== "";

            FXStreet.Util.loadHtmlTemplate(_this.HtmlTemplateFile).done(function (template) {
                var rendered = FXStreet.Util.renderByHtmlTemplate(template, jsonData);
                _this.Container.html(rendered);
            });
        };

        return _this;
    };
}());