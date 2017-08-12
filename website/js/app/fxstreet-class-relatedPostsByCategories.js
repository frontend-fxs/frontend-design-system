(function () {
    FXStreet.Class.RelatedPostsByCategories = function () {
        var parent = FXStreet.Class.Base(),
            _this = FXStreet.Util.extendObject(parent);

        // ----- begin json properties -----
        _this.ContainerId = "";
        _this.ContentId = "";
        // ----- end json properties -----
        _this.Container = null;
        _this.HtmlTemplateFile = "relatedpostsbycategories_default.html";
        _this.RelatedPosts = [];

        _this.init = function (json) {
            _this.setSettingsByObject(json);
            _this.setVars();
            _this.renderData();
        };

        _this.setVars = function () {
            _this.Container = FXStreet.Util.getjQueryObjectById(_this.ContainerId);
        };

        _this.renderData = function () {

            if (_this.RelatedPosts !== null && _this.RelatedPosts !== undefined)
            {
                if(_this.RelatedPosts.length <= 0) {
                    _this.hideRelatedContent();
                    return;
                }
            
                _this.RelatedPosts.forEach(function (item) {
                    item.HasVideo = (item.JsType == "VideoItem");
                });
            

                var jsonData = {
                    "RelatedPosts": _this.RelatedPosts
                };

                _this.renderHtml(jsonData);
            }
             
        };

        _this.renderHtml = function (jsonData) {
            FXStreet.Util.loadHtmlTemplate(_this.HtmlTemplateFile).done(function (template) {
                var rendered = FXStreet.Util.renderByHtmlTemplate(template, jsonData);
                _this.Container.append(rendered);
            });
        };

        _this.hideRelatedContent = function () {
            var footer = $("article[fxs-it-id='" + _this.ContentId + "']").find("footer").first();
            if (footer) {
                footer.hide();
            }
        };

        return _this;
    };
}());