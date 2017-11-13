(function ($) {
    FXStreetWidgets.Widget.LoaderNews = function () {
        var options = {
            WidgetType: "Post",
            WidgetName: "news",
            EndPoint: "post/{filter}/{productfeature}/{tags}/{page}/{take}",
            EndPointTags: "tag/filter/{tags}",
            EndPointTranslation: "widget/localization/",
            EndPointConfiguration: "widget/configuration/",
            DefaultHost: "https://subscriptions.fxstreet.com/",
            Mustaches:
                {
                    "news": "",
                    "news_items":"",
                    "news_filter": ""
                },
            DefaultVersion: "v4",
            CustomJs: [],
            SharedJs: [
                { 
                    Container: "http-push/", 
                    Js: "jquery.signalR-2.2.0.min.js", 
                    CustomLoadedDelegate : function(){
                        return $ !== undefined && $.signalR !== undefined; 
                    }
                },
                { 
                    Container: "http-push/", 
                    Js: "fxspush.js",
                    CustomLoadedDelegate : function(){
                            return window.FXStreetPush !== undefined; 
                        }
                }]
        };

        var parent = FXStreetWidgets.Widget.LoaderBase(options),
            _this = FXStreetWidgets.Util.extendObject(parent);

        parent.initWidgets = function (widgets) {
            $.each(widgets, function (i, news) {
                var jNews = $(news);
                
                var initJson = {
                    Container: jNews,
                    CustomTags: _this.getCustomTags(jNews),
                    Take: jNews.attr("fxs_take") || 5,
                    View: jNews.attr("fxs_view"),
                    Customizable: jNews.attr("fxs_customizable") == "",
                    CustomUrl: jNews.attr("fxs_custom_url") || "",
                    MaxHeight: _this.getMaxHeight(jNews),
                    FreeVersion: jNews.attr("fxs_free") == "",
                    EndPointTags: _this.getEndPointTags(),
                    EndPointConfiguration: _this.getEndPointConfiguration()
                };
                
                var widget = new FXStreetWidgets.Widget.News(_this);
                widget.init(initJson);
            });
        };

        _this.getCustomTags = function (jNews) {
            var customTags = jNews.attr("fxs_tags") || "";
            var tagsList = customTags.split(",");
            if (tagsList.length > 6) {
                customTags = tagsList.slice(0, 6).join(",");
            }

            return customTags;
        };

        _this.getMaxHeight = function (jNews) {
            var maxHeight = jNews.attr("fxs_height") || "";
            if(maxHeight != "" && $.isNumeric(maxHeight)) {
                maxHeight += "px";
            }

            return maxHeight;
        };

        _this.getEndPointTags = function () {
            var container = _this.getContainer();
            var host = _this.getHost(container);
            var version = _this.getVersion(container);
            var culture = FXStreetWidgets.Configuration.getCulture();

            var endPoint = host + "/" + version + "/" + culture + "/" + options.EndPointTags;
            return endPoint;
        };

        _this.getEndPointConfiguration = function () {
            var container = _this.getContainer();
            var host = _this.getHost(container);
            var version = _this.getVersion(container);
            var culture = FXStreetWidgets.Configuration.getCulture();

            var endPoint = host + "/" + version + "/" + culture + "/" + options.EndPointConfiguration;
            return endPoint;
        };

        return _this;
    };

    (function () {
        var loader = new FXStreetWidgets.Widget.LoaderNews();
        loader.init();
    })();
}(FXStreetWidgets.$));