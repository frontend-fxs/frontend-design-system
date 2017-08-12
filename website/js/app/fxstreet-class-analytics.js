(function () {
    FXStreet.Class.Analytics = {};

    FXStreet.Class.Analytics.Base = function () {
        var parent = FXStreet.Class.Base(),
        _this = FXStreet.Util.extendObject(parent);

        _this.updateDinamicLayer = function (html, dataLayerElement, byScroll) {
            var imageInformation = extractImagesInformation(html);
            var widgetInformation = extractWidgetInformation(html);
            var videoInformation = extractVideoInformation(html);
            var alertInformation = extractAlertInformation(html);

            dataLayerElement['images-title'] = imageInformation.titles;
            dataLayerElement['images-count'] = imageInformation.imageCount;
            dataLayerElement['widget-names'] = widgetInformation.widgetNames;
            dataLayerElement['widget-count'] = widgetInformation.widgetCount;
            dataLayerElement['videos-count'] = videoInformation.videoCount;
            dataLayerElement['videos-title'] = videoInformation.videoNames;
            dataLayerElement['alert'] = alertInformation.titles;
            dataLayerElement['byScroll'] = byScroll;
            dataLayerElement['event'] = 'page-item';
           
            var tagManager = FXStreet.Class.Patterns.Singleton.TagManager.Instance();
            tagManager.Push(dataLayerElement);
        };

        var getRemovePosition = function () {

            for (var i = 0, iLen = dataLayer.length; i < iLen; i++) {

                if (dataLayer[i].Id !== undefined && dataLayer[i].element.Id != null && dataLayer[i].element.Id.indexOf("fxs_") > -1)
                    return i;

            }

        };

        var extractImagesInformation = function (html) {

            var imageInformation = {};
            var images = $(html).find('img');

            imageInformation.titles = getImageTitles(images);
            imageInformation.imageCount = images.length.toString();

            return imageInformation;
        };

        var extractWidgetInformation = function (html) {

            var widgetInformation = {};
            var widgets = $(html).find("div[fxs_widget]");
            var widgetsSitefinity = $(html).find("div[fxs_sf_widget]");

            var allWidgets = $.merge($.merge([], widgets), widgetsSitefinity);
            widgetInformation.widgetNames = getWidgetNames(allWidgets);
            widgetInformation.widgetCount = allWidgets.length.toString();

            return widgetInformation;

        };

        var extractVideoInformation = function (html) {
            var videoInformation = {};
            var iframes = $(html).find('iframe');
            var videos = 0;
            for (i = 0; i < iframes.length; i++) {
                var hit = $(html).find('iframe')[i].outerHTML.search("youtu(?:\.be|be\.com)/(?:.*v(?:/|=)|(?:.*/)?)([a-zA-Z0-9-_]+)");
                if (hit > -1) {
                    videos++;
                }

            }

            videoInformation.videoCount = videos.toString();

            return videoInformation;
        };

        var extractAlertInformation = function (html) {
            var alertInformation = {};
            alertInformation.titles = [];

            var alerts = $('.fxs_alertText');

            for (i = 0; i < alerts.length; i++) {
                var alert = FXStreet.Util.getInnerText(alerts[i])
                alertInformation.titles.push(alert);
            }

            return alertInformation.titles.join();
        };

        var getImageTitles = function (images) {

            var imageTitles = [];

            for (i = 0; i < images.length; i++) {
                var lastIndexSlash = $(images[i]).prop('src').lastIndexOf("/");
                var lastIndexDot = $(images[i]).prop('src').lastIndexOf(".");
                var imageName = $(images[i]).prop('src').substring(lastIndexSlash + 1, lastIndexDot);
                imageTitles.push(imageName);

            }
            return imageTitles.join();
        };

        var getWidgetNames = function (widgets) {

            var widgetsNames = [];
            for (i = 0; i < widgets.length; i++) {

                var name = $(widgets[i]).attr("fxs_name");
                widgetsNames.push(name);

            }

            return widgetsNames;

        };

        return _this;
    };
    FXStreet.Class.Analytics.PostHome = function () {

        var parent = FXStreet.Class.Analytics.Base(),
          _this = FXStreet.Util.extendObject(parent);
        
        var getWordCount = function (text) {
            return text.countWords();
        }

        var extractBasicInformation = function (html) {
            var basicInformation = {};
            basicInformation.wordcount = getWordCount(FXStreet.Util.getInnerText(html));
            return basicInformation;
        };

        _this.updateDinamicLayer = function (html) {
            var basicInformation = extractBasicInformation(html);

            var dataLayerElement = {
                "Id": "fxs_home",
                "title": document.title,
                "wordcount": basicInformation.wordcount,
            };

            parent.updateDinamicLayer(html, dataLayerElement);
        }

        return _this;
    };
    FXStreet.Class.Analytics.PostNews = function () {
        var parent = FXStreet.Class.Analytics.Base(),
            _this = FXStreet.Util.extendObject(parent);

        var getCategoryNames = function (tags) {

            var names = tags.map(function (a) { return a.Name; });
            return names.join();

        }

        _this.extractBasicInformation = function (post) {

            var basicInformation = {};

            basicInformation.name = post.SEO.MetaTitle;
            basicInformation.title = post.Title;
            basicInformation.author = post.Author ? post.Author.Name : "";
            basicInformation.company = post.Company ? post.Company.Name : "";
            basicInformation.tags = post.Categories ? getCategoryNames(post.Categories) : "";
            basicInformation.wordcount = post.WordCount ? post.WordCount.toString() : "0";
            basicInformation.titleCount = post.Title.countWords();
            basicInformation.datePublished = post.PublicationDate;
            basicInformation.feedId = post.FeedId;

            return basicInformation;
        };

        return _this;
    };
    FXStreet.Class.Analytics.News = function () {
        var parent = FXStreet.Class.Analytics.PostNews(),
            _this = FXStreet.Util.extendObject(parent);

        _this.updateDinamicLayer = function (html, post, byScroll) {
            var basicInformation = _this.extractBasicInformation(post);

            var dataLayerElement = {
                'Id': "fxs_news",
                'name': basicInformation.name,
                'title': basicInformation.title,
                'author': basicInformation.author,
                'company': basicInformation.company,
                'wordcount': basicInformation.wordcount,
                'tags': basicInformation.tags,
                'title-count': basicInformation.titleCount,
                'datePublished': basicInformation.datePublished
            };

            parent.updateDinamicLayer(html, dataLayerElement, byScroll);
        };

        return _this;
    };
    FXStreet.Class.Analytics.Analysis = function () {
        var parent = FXStreet.Class.Analytics.PostNews(),
            _this = FXStreet.Util.extendObject(parent);

        _this.updateDinamicLayer = function (html, post, byScroll) {
            var basicInformation = _this.extractBasicInformation(post);

            var dataLayerElement = {
                'Id': "fxs_analysis",
                'name': basicInformation.name,
                'title': basicInformation.title,
                'author': basicInformation.author,
                'company': basicInformation.company,
                'wordcount': basicInformation.wordcount,
                'tags': basicInformation.tags,
                'title-count': basicInformation.titleCount,
                'datePublished': basicInformation.datePublished
            };

            parent.updateDinamicLayer(html, dataLayerElement, byScroll);
        };

        return _this;
    };
    FXStreet.Class.Analytics.Education = function () {
        var parent = FXStreet.Class.Analytics.PostNews(),
            _this = FXStreet.Util.extendObject(parent);

        _this.updateDinamicLayer = function (html, post, byScroll) {
            var basicInformation = _this.extractBasicInformation(post);

            var dataLayerElement = {
                'Id': "fxs_education",
                'name': basicInformation.name,
                'title': basicInformation.title,
                'author': basicInformation.author,
                'company': basicInformation.company,
                'wordcount': basicInformation.wordcount,
                'tags': basicInformation.tags,
                'title-count': basicInformation.titleCount,
                'datePublished': basicInformation.datePublished
            };

            parent.updateDinamicLayer(html, dataLayerElement, byScroll);
        };

        return _this;
    };
    FXStreet.Class.Analytics.RatesAndCharts = function () {

        var parent = FXStreet.Class.Analytics.Base(),
        _this = FXStreet.Util.extendObject(parent);

        var extractBasicInformation = function (item) {

            var basicInformation = {};

            basicInformation.name = item.SEO.MetaTitle;
            basicInformation.title = item.Title;
            basicInformation.author = item.Author ? item.Author.Name : "";
            basicInformation.company = item.Company ? item.Company.Name : "";
            basicInformation.tags = item.Categories;
            basicInformation.wordcount = item.WordCount;
            basicInformation.titleCount = item.Title.countWords();
            basicInformation.datePublished = item.PublicationDate;

            return basicInformation;
        };

        _this.updateDinamicLayer = function (html, item) {
            var basicInformation = extractBasicInformation(item);

            var dataLayerElement = {
                'Id': "fxs_post",
                'name': basicInformation.name,
                'title': basicInformation.title,
                'author': basicInformation.author,
                'company': basicInformation.company,
                'wordcount': basicInformation.wordcount,
                'tags': basicInformation.tags,
                'title-count': basicInformation.titleCount,
                'datePublished': basicInformation.datePublished
            };

            parent.updateDinamicLayer(html, dataLayerElement);
        };

        return _this;
    };
    FXStreet.Class.Analytics.HomeBroker = function () {

        var parent = FXStreet.Class.Analytics.Base(),
        _this = FXStreet.Util.extendObject(parent);

        var extractBasicInformation = function (item) {
            var basicInformation = {};

            //basicInformation.name = item.SEO.MetaTitle;
            //basicInformation.title = item.Title;
            //basicInformation.author = item.Author ? item.Author.Name : "";
            //basicInformation.company = item.Company ? item.Company.Name : "";
            //basicInformation.tags = item.Categories;
            //basicInformation.wordcount = item.WordCount;
            //basicInformation.titleCount = item.Title.countWords();
            //basicInformation.datePublished = item.PublicationDate;

            return basicInformation;
        };

        _this.updateDinamicLayer = function (html, item) {
            // TODO
            var basicInformation = extractBasicInformation(item);

            var dataLayerElement = {
            };

            parent.updateDinamicLayer(html, dataLayerElement);
        };

        return _this;
    };
    FXStreet.Class.Analytics.Brokers = function () {

        var parent = FXStreet.Class.Analytics.Base(),
        _this = FXStreet.Util.extendObject(parent);

        var extractBasicInformation = function (item) {
            var basicInformation = {};

            //basicInformation.name = item.SEO.MetaTitle;
            //basicInformation.title = item.Title;
            //basicInformation.author = item.Author ? item.Author.Name : "";
            //basicInformation.company = item.Company ? item.Company.Name : "";
            //basicInformation.tags = item.Categories;
            //basicInformation.wordcount = item.WordCount;
            //basicInformation.titleCount = item.Title.countWords();
            //basicInformation.datePublished = item.PublicationDate;

            return basicInformation;
        };

        _this.updateDinamicLayer = function (html, item) {
            // TODO
            var basicInformation = extractBasicInformation(item);

            var dataLayerElement = {
            };

            parent.updateDinamicLayer(html, dataLayerElement);
        };

        return _this;
    };
    FXStreet.Class.Analytics.Videos = function () {
        var parent = FXStreet.Class.Analytics.PostNews(),
            _this = FXStreet.Util.extendObject(parent);

        _this.updateDinamicLayer = function (html, post, byScroll) {
            var basicInformation = _this.extractBasicInformation(post);

            var dataLayerElement = {
                'Id': "fxs_videos",
                'name': basicInformation.name,
                'title': basicInformation.title,
                'author': basicInformation.author,
                'company': basicInformation.company,
                'wordcount': basicInformation.wordcount,
                'tags': basicInformation.tags,
                'title-count': basicInformation.titleCount,
                'datePublished': basicInformation.datePublished
            };

            parent.updateDinamicLayer(html, dataLayerElement, byScroll);
        };

        return _this;
    };

    FXStreet.Class.HomeAndTopicsAnalytics = function () {
        var parent = FXStreet.Class.Analytics.Base(),
        _this = FXStreet.Util.extendObject(parent);

        _this.Content = null;

        _this.init = function () {
            _this.setVars();
            _this.updateDinamicLayer();
        }

        _this.setVars = function() {
            _this.Content = $('main');
        };

        var extractBasicInformation = function () {
            var basicInformation = {};

            basicInformation.name = document.title;
            basicInformation.title = document.title;

            var text = FXStreet.Util.getInnerText(_this.Content[0]);
            var words = text.match(/\S+/g);
            basicInformation.wordcount = words ? words.length : 0;
            basicInformation.titleCount = document.title.countWords();
            //basicInformation.author = item.Author ? item.Author.Name : "";
            //basicInformation.company = item.Company ? item.Company.Name : "";
            //basicInformation.tags = item.Categories;
            //basicInformation.datePublished = item.PublicationDate;

            return basicInformation;
        };

        _this.updateDinamicLayer = function () {
            var basicInformation = extractBasicInformation();

            var dataLayerElement = {
                "wordcount": basicInformation.wordcount
            };

            var html = _this.Content.html();
            parent.updateDinamicLayer(html, dataLayerElement);
        };

        return _this;
    };
})();
