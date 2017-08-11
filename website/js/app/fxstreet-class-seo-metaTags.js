(function() {
    FXStreet.Class.Patterns.Singleton.SeoMetaTags = (function() {
        var instance;

        var seoMetaTagsObject = function() {
            var parent = FXStreet.Class.Base(),
               _this = FXStreet.Util.extendObject(parent);

            _this.FullUrl = "";
            _this.Image = "";
            _this.MetaTitle = "";
            _this.Summary = "";
            _this.Keywords = "";

            _this.init = function (json) {
                _this.setSettingsByObject(json);
            };

            _this.initHomeMetaTagsObject = function (data) {
                _this.FullUrl = data.FullUrl;
                _this.Image = data.Image;
                _this.MetaTitle = data.MetaTitle;
                _this.Summary = data.Summary;
                _this.Keywords = data.Keywords;
            };

            return _this;
        };

        function createInstance() {
            var object = seoMetaTagsObject();
            object.init({});
            return object;
        };

        return {
            Instance: function () {
                if (!instance) {
                    instance = createInstance();
                }
                return instance;
            }
        };
    })();
}());