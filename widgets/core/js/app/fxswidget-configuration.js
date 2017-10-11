(function () {
    FXStreetWidgets.ConfigManager = function() {
        var _this = this;

        _this.config = {
            Logging: false,
            UseMin: true,
            ServerName: "https://staticcontent.fxstreet.com/",
            AuthorizationUrl: "https://authorization.fxstreet.com/token",
            StaticContentQueryStringRefresh: "?t=20171006",
            Culture: "en-US",
            StaticContentName: "widgets/",
            JsJqueryName: "jquery-1.11.3.min.js",
            JsMustacheName: "mustache.js",
            JsCores: ["moment.min.js", "bootstrap.min.js"],
            CssCores: ["fxswidget.min.css"],
            FontAwesome: ["font-awesome", "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.4.0/css/font-awesome.min.css"],
            FontGoogle: ["googleapis.com/css", "https://fonts.googleapis.com/css?family=Fira+Sans:300,400,500,700,300italic,400italic,500italic"]            
        };

        _this.init = function () {
            _this.loadCustomConfig();            
        };

        _this.loadCustomConfig = function () {
            if (typeof fxs_widget_config !== "undefined") {
                for (key in fxs_widget_config) {
                    if (fxs_widget_config.hasOwnProperty(key)) {
                        _this.config[key] = fxs_widget_config[key];
                    }
                }
            };
        };

        _this.getHosts = function () {
            if (typeof fxs_widget_hosts_config === "undefined") return null;

            var result = fxs_widget_hosts_config;
            return result;
        };

        _this.getCoreJsUrl = function (jsName) {
            var result = _this.getJsUrl(jsName, "core");
            return result;
        };

        _this.getCoreCssUrl = function (cssName) {
            var result = _this.getCssUrl(cssName, "core");
            return result;
        };

        _this.getCoreFontUrl = function (fontName) {
            var result = _this.getJsUrl(fontName, "core");
            return result;
        };

        _this.getJsUrl = function (jsName, widgetName) {
            var result = _this.createResourceUrl(_this.config.StaticContentName + widgetName + "/js/", jsName);
            return result;
        };

        _this.getMustacheUrl = function (mustacheName, widgetName) {
            var result = _this.createResourceUrl(_this.config.StaticContentName + widgetName + "/mustache/", mustacheName);
            return result;
        };

        _this.getCssUrl = function (cssName, widgetName) {
            var result = _this.createResourceUrl(_this.config.StaticContentName + widgetName + "/css/", cssName);
            return result;
        };

        _this.getFontUrl = function (fontName, widgetName) {
            var result = _this.createResourceUrl(_this.config.StaticContentName + widgetName + "/font/", fontName);
            return result;
        };

        _this.createResourceUrl = function (jsContainerName, jsName) {
            var result = _this.config.ServerName + jsContainerName + jsName + _this.config.StaticContentQueryStringRefresh;
            return result;
        };

        _this.getCulture = function () {
            return _this.config.Culture;
        };

        return _this;
    };
}());