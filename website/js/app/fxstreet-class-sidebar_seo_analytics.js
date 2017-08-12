(function () {
    FXStreet.Class.Sidebar_SeoAnalytics = function () {
        var parent = FXStreet.Class.Base(),
          _this = FXStreet.Util.extendObject(parent);

        _this.FullPageUrl = '';
        _this.HomeId = '';
        _this.ListSeoClassType = '';
        _this.ListAnalyticsClassType = '';
        _this.HomeSeoClassType = '';
        _this.HomeAnalyticsClassType = '';
        _this.Sidebar_ListObj = null;

        _this.ListSeoObj = null;
        _this.ListAnalyticsObj = null;
        _this.HomeSeoObj = null;
        _this.HomeAnalyticsObj = null;
        _this.HomeSeoLanguageObj = null;
        _this.HomeMetaTagsObj = null;

        _this.init = function (json) {
            _this.setSettingsByObject(json);
            _this.setVars();
        };

        _this.setVars = function () {
            if (FXStreet.Class.Seo[_this.ListSeoClassType])
                _this.ListSeoObj = new FXStreet.Class.Seo[_this.ListSeoClassType]();
            if (FXStreet.Class.Seo[_this.HomeSeoClassType])
                _this.HomeSeoObj = new FXStreet.Class.Seo[_this.HomeSeoClassType]();

            if (FXStreet.Class.Analytics[_this.ListAnalyticsClassType])
                _this.ListAnalyticsObj = new FXStreet.Class.Analytics[_this.ListAnalyticsClassType]();
            if (FXStreet.Class.Analytics[_this.HomeAnalyticsClassType])
                _this.HomeAnalyticsObj = new FXStreet.Class.Analytics[_this.HomeAnalyticsClassType]();

            initHomeMetaTagsObject();
        };

        var initHomeMetaTagsObject = function () {
            var metaTags = findMetaTagsInDocument();
            _this.HomeMetaTagsObj = FXStreet.Class.Patterns.Singleton.SeoMetaTags.Instance();
            _this.HomeMetaTagsObj.initHomeMetaTagsObject(metaTags);
        };

        var findMetaTagsInDocument = function () {
            var result = {
                FullUrl: $("meta[property='og\\:url']").attr('content'),
                Image: $("meta[property='og\\:image']").attr('content'),
                MetaTitle: $("meta[property='og\\:title']").attr('content'),
                Summary: $("meta[property='og\\:description']").attr('content'),
                Keywords: $("meta[property='og\\:keywords']").attr('content')
            };

            return result;
        };

        var ensureHomeSeoObject = function () {
            if (_this.HomeSeoLanguageObj === null) {
                _this.HomeSeoLanguageObj = {};
            }
            _this.HomeSeoLanguageObj.FullUrl = _this.HomeMetaTagsObj.FullUrl;
            _this.HomeSeoLanguageObj.Image = _this.HomeMetaTagsObj.Image;
            _this.HomeSeoLanguageObj.MetaTitle = _this.HomeMetaTagsObj.MetaTitle;
            _this.HomeSeoLanguageObj.Summary = _this.HomeMetaTagsObj.Summary;
            _this.HomeSeoLanguageObj.Keywords = _this.HomeMetaTagsObj.Keywords;
        };

        _this.SetSeo = function (item) {
            if (item.id === _this.HomeId) {
                ensureHomeSeoObject();
                _this.HomeSeoObj.updateMetaTags(_this.HomeSeoLanguageObj);
            } else {
                var section = $(item).find('section');
                var id = section.attr("fxs-it-id");
                var renderizableItem = _this.Sidebar_ListObj.getRenderizableItemById(id);

                if (renderizableItem != null) {
                    _this.ListSeoObj.updateMetaTags(renderizableItem, _this.FullPageUrl);
                }
            }
        };

        _this.SetAnalytics = function (item, byScroll) {
            if (item.id === _this.HomeId) {
                _this.HomeAnalyticsObj.updateDinamicLayer(item);
            } else {
                var section = $(item).find('section');
                var id = section.attr("fxs-it-id");
                var renderizableItem = _this.Sidebar_ListObj.getRenderizableItemById(id);

                if (renderizableItem != null) {
                    _this.ListAnalyticsObj.updateDinamicLayer(item, renderizableItem, byScroll);
                }
            }
        };
        
        return _this;
    };
}());