(function () {
    FXStreet.Class.Seo = {};
    FXStreet.Class.Seo.Base = function () {
        var parent = FXStreet.Class.Base(),
        _this = FXStreet.Util.extendObject(parent);

        _this.updateMetaTags = function (information, pageUrl) {

        };

        _this.setUrlToHistory = function (title, url, informationId) {
            FXStreet.Util.updateUrl(informationId, title, url);
        };

        _this.isValid = function (obj) {
            return obj != null && !_this.isUndefined(obj);
        };

        _this.isUndefined = function (obj) {
            return typeof obj === "undefined";
        };

        return _this;
    };
    FXStreet.Class.Seo.Post = function () {

        var parent = FXStreet.Class.Seo.Base(),
        _this = FXStreet.Util.extendObject(parent);

        var updateBasicMetaTags = function (information) {
            if (information) {
                var seo = information.SEO;

                $("meta[name='description']").attr('content', seo.MetaDescription);
                $("meta[name='keywords']").attr('content', seo.KeyWords);
                document.title = seo.MetaTitle;
            }
        }

        var updateOpenGraph = function (information) {
            if (information) {
                var seo = information.SEO;
                var image = information.Image;

                $("meta[property='og\\:title']").attr('content', seo.MetaTitle);
                $("meta[property='og\\:description']").attr('content', seo.MetaDescription);
                if (_this.isValid(image)){
                    $("meta[property='og\\:image']").attr('content', image.Url_Large);
                }
                
                $("meta[property='og\\:url']").attr('content', seo.FullUrl);
            }
        };
        var updateTwitter = function (information) {
            if (information) {
                var seo = information.SEO;
                var image = information.Image;

                //Twitter
                $("meta[name='twitter\\:title']").attr('content', seo.MetaTitle);
                $("meta[name='twitter\\:description']").attr('content', seo.MetaDescription);
                if (_this.isValid(image)) {
                    $("meta[name='twitter\\:image']").attr('content', image.Url_Small);
                }
                $("meta[name='twitter\\:url']").attr('content', seo.FullUrl);
            }
        };

        var updateUrl = function (information) {
            if (information) {
                var seo = information.SEO;

                var url = seo.FullUrl.replace(/ /g, '-').toLowerCase();

                _this.setUrlToHistory(seo.MetaTitle, url, information.Id);
            }
        };

        var addAmpLink = function (information) {
            if (information.SEO.AmpUrl !== null && information.SEO !== "") {
                if ($('link[rel=amphtml]').length > 0) {
                    $('link[rel=amphtml]').attr('href', information.SEO.AmpUrl);
                }
                else {
                    $('head').append($("<link rel='amphtml' />").attr('href', information.SEO.AmpUrl));
                }
            }
        }


        _this.updateMetaTags = function (item, pageUrl) {

            updateBasicMetaTags(item);
            updateOpenGraph(item);
            updateTwitter(item);
            updateUrl(item);

            parent.updateMetaTags(item, null);
            addAmpLink(item);

        }
        return _this;

    };
    FXStreet.Class.Seo.Home = function () {

        var parent = FXStreet.Class.Seo.Base(),
       _this = FXStreet.Util.extendObject(parent);

        var updateBasicMetaTags = function (homeSeoItemSaved) {
            if (homeSeoItemSaved !== undefined && homeSeoItemSaved !== null) {

                $("meta[name='description']").attr('content', homeSeoItemSaved.Summary);
                $("meta[name='keywords']").attr('content', homeSeoItemSaved.Keywords);
                document.title = homeSeoItemSaved.MetaTitle;
            }
        }
        var updateOpenGraph = function (homeSeoItemSaved) {
            if (homeSeoItemSaved) {
                
                $("meta[property='og\\:title']").attr('content', homeSeoItemSaved.MetaTitle);
                $("meta[property='og\\:description']").attr('content', homeSeoItemSaved.Summary);
                $("meta[property='og\\:image']").attr('content', homeSeoItemSaved.Image ? homeSeoItemSaved.Image.Url_Large : "");
                $("meta[property='og\\:url']").attr('content', homeSeoItemSaved.FullUrl);
            }
        };
        var updateTwitter = function (homeSeoItemSaved) {

            if (homeSeoItemSaved) {
                $("meta[name='twitter\\:title']").attr('content', homeSeoItemSaved.MetaTitle);
                $("meta[name='twitter\\:description']").attr('content', homeSeoItemSaved.Summary);
                $("meta[name='twitter\\:image']").attr('content', homeSeoItemSaved.Image ? homeSeoItemSaved.Image.Url_Small : "");
                $("meta[name='twitter\\:url']").attr('content', homeSeoItemSaved.FullUrl);
            }
        };
        var updateUrl = function (urlHome, id) {
            if (urlHome !== undefined && urlHome !== null) {
                var url = urlHome.replace(/ /g, '-').toLowerCase();
                _this.setUrlToHistory("", url, id);
            }
        };

        _this.updateMetaTags = function (homeItemSaved, pageUrl) {

            updateBasicMetaTags(homeItemSaved);
            updateOpenGraph(homeItemSaved);
            updateTwitter(homeItemSaved);
            updateUrl(FXStreet.Resource.PageUrl, "fxs_home");

            parent.updateMetaTags(null, homeItemSaved);
        };

        return _this;
    };
    FXStreet.Class.Seo.RatesAndCharts = function () {

        var parent = FXStreet.Class.Seo.Base(),
        _this = FXStreet.Util.extendObject(parent);

        var updateBasicMetaTags = function (information) {
            if (information) {
                var seo = information.SEO;

                $("meta[name='description']").attr('content', seo.MetaDescription);
                $("meta[name='keywords']").attr('content', seo.KeyWords);
                document.title = seo.MetaTitle;
            }
        }

        var updateOpenGraph = function (information) {
            if (information) {
                var seo = information.SEO;
                var image = information.Image || {};

                $("meta[property='og\\:title']").attr('content', seo.MetaTitle);
                $("meta[property='og\\:description']").attr('content', seo.MetaDescription);
                if (_this.isValid(image)){
                    $("meta[property='og\\:image']").attr('content', image.Url_Large);
                }
                $("meta[property='og\\:url']").attr('content', seo.FullUrl);
            }
        };
        var updateTwitter = function (information) {
            if (information) {
                var seo = information.SEO;
                var image = information.Image || {};

                //Twitter
                $("meta[name='twitter\\:title']").attr('content', seo.MetaTitle);
                $("meta[name='twitter\\:description']").attr('content', seo.MetaDescription);
                if (_this.isValid(image)) {
                    $("meta[name='twitter\\:image']").attr('content', image.Url_Small);
                }
                $("meta[name='twitter\\:url']").attr('content', seo.FullUrl);
            }
        };

        var updateUrl = function (information) {
            if (information) {
                var seo = information.SEO;

                var url = seo.FullUrl.replace(/ /g, '-').toLowerCase();

                _this.setUrlToHistory(seo.MetaTitle, url, information.Id);
            }
        };

        _this.updateMetaTags = function (item, pageUrl) {
            updateBasicMetaTags(item);
            updateOpenGraph(item);
            updateTwitter(item);
            updateUrl(item);

            parent.updateMetaTags(item, null);


        }
        return _this;
    };
    FXStreet.Class.Seo.Brokers = function () {

        var parent = FXStreet.Class.Seo.Base(),
        _this = FXStreet.Util.extendObject(parent);

        var updateBasicMetaTags = function (information) {
            if (information) {
                var seo = information.SEO;

                $("meta[name='description']").attr('content', seo.MetaDescription);
                $("meta[name='keywords']").attr('content', seo.KeyWords);
                document.title = seo.MetaTitle;
            }
        }

        var updateOpenGraph = function (information) {
            if (information) {
                var seo = information.SEO;
                var image = information.Image || {};

                $("meta[property='og\\:title']").attr('content', seo.MetaTitle);
                $("meta[property='og\\:description']").attr('content', seo.MetaDescription);
                if (_this.isValid(image)){
                    $("meta[property='og\\:image']").attr('content', image.Url_Large);
                }
                $("meta[property='og\\:url']").attr('content', seo.FullUrl);
            }
        };
        var updateTwitter = function (information) {
            if (information) {
                var seo = information.SEO;
                var image = information.Image || {};

                //Twitter
                $("meta[name='twitter\\:title']").attr('content', seo.MetaTitle);
                $("meta[name='twitter\\:description']").attr('content', seo.MetaDescription);
                if (_this.isValid(image)){
                    $("meta[name='twitter\\:image']").attr('content', image.Url_Small);
                }
                $("meta[name='twitter\\:url']").attr('content', seo.FullUrl);
            }
        };

        var updateUrl = function (information, pageUrl) {
            if (information) {
                var url = pageUrl + '/' + information.Url.toLowerCase();
                _this.setUrlToHistory("", url, information.Id);
            }
        };

        _this.updateMetaTags = function (item, pageUrl) {
            updateBasicMetaTags(item);
            updateOpenGraph(item);
            updateTwitter(item);
            updateUrl(item, pageUrl);

            parent.updateMetaTags(item, null);
        }
        return _this;
    };
}());