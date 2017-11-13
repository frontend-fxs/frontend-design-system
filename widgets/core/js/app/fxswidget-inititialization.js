(function () {
    FXStreetWidgets.InitManager = function () {
        var _this = this;

        _this.widgetsLoader = {};
        _this.interval = null;
        _this.isReady = false;

       _this.init = function () {
           if (typeof jQuery === "undefined") {
               var jqueryName = FXStreetWidgets.Configuration.config.JsJqueryName;
               var jqueryUrl = FXStreetWidgets.Configuration.getCoreJsUrl(jqueryName);

               FXStreetWidgets.ResourceManagerObj.load(jqueryName, FXStreetWidgets.ResourceType.Js, jqueryUrl, _this.jqueryLoadedCallback);
           } else {
               _this.jqueryLoadedCallback();
           }
       };

        _this.registerLoader = function (widgetName, loader) {
            if (widgetName && loader) {
                _this.widgetsLoader[widgetName] = loader;
            }
        };
        
        _this.jqueryLoadedCallback = function () {
            FXStreetWidgets.$ = jQuery;
            _this.loadAuthJs();
        };

        _this.loadAuthJs = function () {
            if (!_this.authIsReady()) {
                var authConfig = FXStreetWidgets.Configuration.config.JsAuth;
                var url = FXStreetWidgets.Configuration.createResourceUrl(authConfig.container, authConfig.fileName);

                FXStreetWidgets.ResourceManagerObj.load(authConfig.fileName, FXStreetWidgets.ResourceType.Js,
                    url, _this.authLoadedCallback, _this.authIsReady);
            }
            else {
                _this.authLoaded();
            }
        };

        _this.loadMustache = function () {
            if (!_this.mustacheIsReady()) {
                var mustacheName = FXStreetWidgets.Configuration.config.JsMustacheName;
                var mustacheUrl = FXStreetWidgets.Configuration.getCoreJsUrl(FXStreetWidgets.Configuration.config.JsMustacheName);

                FXStreetWidgets.ResourceManagerObj.load(mustacheName, FXStreetWidgets.ResourceType.Js, mustacheUrl, _this.mustacheLoadedCallback);
            } else {
                _this.mustacheLoaded();
            }
        };

        _this.mustacheLoadedCallback = function () {
            _this.interval = setInterval(function () {
                if (_this.mustacheIsReady()) {
                    clearInterval(_this.interval);
                    _this.mustacheLoaded();
                }
            }, 10);
        };

        _this.authLoadedCallback = function () {
            _this.Interval = setInterval(function () {
                if (_this.authIsReady()) {
                    clearInterval(_this.Interval);
                    _this.authLoaded();
                }
            }, 10);
        };

        _this.authLoaded = function(){
             FXStreetWidgets.Authorization = FXStreetAuth.Authorization.getInstance({
                authorizationUrl: FXStreetWidgets.Configuration.config.AuthorizationUrl
            });
            _this.loadMustache();
        };
    
        _this.mustacheLoaded = function () {
            FXStreetWidgets.ExternalLib.Mustache = Mustache;

            _this.loadJsCores();
            _this.loadCssCores();
            _this.loadFontCores();

            var widgetData = new FXStreetWidgets.InitManager.WidgetData(FXStreetWidgets.$('body'), false);
            _this.loadWidgets(widgetData);
            _this.isReady = true;
        };

        _this.mustacheIsReady = function () {
            var result = typeof Mustache !== "undefined";
            return result;
        };

        _this.authIsReady = function () {
            var result = typeof FXStreetAuth !== "undefined";
            return result;
        };
        
        _this.loadFontCores = function () {
            var fontGoogleName = FXStreetWidgets.Configuration.config.FontGoogle[0];
            var fontGoogleUrl = FXStreetWidgets.Configuration.config.FontGoogle[1];
            FXStreetWidgets.ResourceManagerObj.load(fontGoogleName, FXStreetWidgets.ResourceType.Font, fontGoogleUrl);

            var fontAwesomeName = FXStreetWidgets.Configuration.config.FontAwesome[0];
            var fontAwesomeUrl = FXStreetWidgets.Configuration.config.FontAwesome[1];
            FXStreetWidgets.ResourceManagerObj.load(fontAwesomeName, FXStreetWidgets.ResourceType.Font, fontAwesomeUrl);
        };
        
        _this.loadCssCores = function () {
            for (var i = 0; i < FXStreetWidgets.Configuration.config.CssCores.length; i++) {
                var name = FXStreetWidgets.Configuration.config.CssCores[i];
                var url = FXStreetWidgets.Configuration.getCoreCssUrl(name);
                
                FXStreetWidgets.ResourceManagerObj.load(name, FXStreetWidgets.ResourceType.Css, url);
            }
        };
        
        _this.loadJsCores = function () {
            for (var i = 0; i < FXStreetWidgets.Configuration.config.JsCores.length; i++) {
                var name = FXStreetWidgets.Configuration.config.JsCores[i];
                var url = FXStreetWidgets.Configuration.getCoreJsUrl(name);

                FXStreetWidgets.ResourceManagerObj.load(name, FXStreetWidgets.ResourceType.Js, url);
            }
        };
       
        _this.loadWidgets = function (widgetData) {
            for (var key in widgetData.widgets) {
                var widget = widgetData.widgets[key];                
                if (!_this.widgetsLoader.hasOwnProperty(widget.Name)) {
                    var name = widget.Name;
                    name += FXStreetWidgets.Configuration.config.UseMin ? ".min.js" : ".js";

                    var url = FXStreetWidgets.Configuration.getJsUrl(name, widget.Name);

                    FXStreetWidgets.ResourceManagerObj.load(name, FXStreetWidgets.ResourceType.Js, url);

                    _this.registerLoader(widget.Name, "loading");
                    widget.Loaded = true;                    
                } else {
                    if (widgetData.isDeferred === true) {
                        var loader = _this.widgetsLoader[widget.Name];
                        if (loader !== "loading") {
                            loader.loadDeferred(widgetData.container);
                            widget.Loaded = true;
                        }
                    }
                }
            }
        };

        return _this;
    };

    FXStreetWidgets.InitManager.WidgetData = function (container, isDeferred) {
        var _this = this;

        _this.container = container;
        _this.isDeferred = isDeferred;
        _this.widgets = {};

        (function () {
            var divs = container.find("div[fxs_widget]");
            for (var i = 0; i < divs.length; i++) {
                var name = divs[i].getAttribute("fxs_name");

                if (typeof name === "undefined" || _this.widgets.hasOwnProperty(name)) {
                    continue;
                }

                _this.widgets[name] = {
                    Name: name,
                    Loaded: false
                };
            }
        }());

        return _this;
    };
}());