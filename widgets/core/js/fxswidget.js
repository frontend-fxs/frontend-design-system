(function () {
    if (!String.prototype.startsWith) {
        String.prototype.startsWith = function (searchString, position) {
            position = position || 0;
            return this.substr(position, searchString.length) === searchString;
        };
    }
}());
(function () {
    window.FXStreetWidgets = {};
    var FXStreetWidgets = window.FXStreetWidgets;

    FXStreetWidgets.Util = {};
    FXStreetWidgets.Widget = {};
    FXStreetWidgets.Chart = {};
    FXStreetWidgets.Configuration = null;
    FXStreetWidgets.ConfigManager = {};
    FXStreetWidgets.Initialization = null;
    FXStreetWidgets.InitManager = {};
    FXStreetWidgets.Deferred = {};
    FXStreetWidgets.DeferredManager = null;
    FXStreetWidgets.ResourceManager = {};
    FXStreetWidgets.ResourceManagerObj = null;
    FXStreetWidgets.ExternalLib = {};
    FXStreetWidgets.ExternalLib.Mustache = null;
    FXStreetWidgets.Authorization = null;
    FXStreetWidgets.$ = null;

    FXStreetWidgets.Util.guid = function () {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
    };

    FXStreetWidgets.Util.ajaxJsonGetter = function (url, data) {
        var result = FXStreetWidgets.Authorization.getTokenPromise()
            .then(function(token){
                return FXStreetWidgets.$.ajax({
                    type: "GET",
                    url: url,
                    data: data,
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    beforeSend: function (xhr) {
                        xhr.setRequestHeader ("Authorization", token.token_type + ' ' + token.access_token);
                    }
                });
        });
        return result;
    };

    FXStreetWidgets.Util.renderByHtmlTemplate = function (htmlTemplate, jsonData) {
        var result = FXStreetWidgets.ExternalLib.Mustache.render(htmlTemplate, jsonData);
        return result;
    };

    FXStreetWidgets.Util.getQueryStringParameterByName = function (name) {
        name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
        var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
            results = regex.exec(location.search);
        return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
    };

    FXStreetWidgets.Util.extendObject = function (o) {
        var f = function () { };
        f.prototype = o;
        return new f();
    };

    FXStreetWidgets.Util.arrayIsValid = function (obj) {
        return FXStreetWidgets.Util.isValid(obj) && obj.length > 0;
    };

    // TODO: to remove, redundant code
    FXStreetWidgets.Util.isValid = function (obj) {
        return obj != null && !FXStreetWidgets.Util.isUndefined(obj);
    };

    // TODO: to remove, redundant code
    FXStreetWidgets.Util.isUndefined = function (obj) {
        return typeof obj === "undefined";
    };
    
    FXStreetWidgets.Util.formatDate = function (date, format) {
        if (!moment) {
            console.warn("Momentjs is not loaded");
            return date;
        }
        if (!format) {
            format = "MMM D, HH:mm";
        }

        var utc;

        if (date) {
            utc = moment.utc(date);
        } else {
            utc = moment.utc();
        }

        var result = utc.format(format, FXStreetWidgets.Configuration.config.Culture);
        return result;
    };

    FXStreetWidgets.Util.formatDateUtcOffset = function (dateUTC, UtcOffsetHours, format) {

        if (!FXStreetWidgets.Util.isValid(format)) {
            format = "MMM D, HH:mm";
        }

        if (FXStreetWidgets.Util.isValid(dateUTC)) {
            var minutesToAdd = (60 * UtcOffsetHours);
            var dateWithNewTimeZone = moment(dateUTC).utcOffset(minutesToAdd);
        }

        return dateWithNewTimeZone.format(format);
    }

    FXStreetWidgets.Util.log = function (msg) {
        if (FXStreetWidgets.Configuration.config.Logging === false || FXStreetWidgets.Util.isUndefined(window.console)) {
            return;
        }

        var message = "[" + new Date().toTimeString() + "] FXS: " + msg;
        if (window.console.debug) {
            window.console.debug(message);
        } else if (window.console.log) {
            window.console.log(message);
        }
    }

    FXStreetWidgets.Util.async = function (fn) {
        if (!fn || typeof fn !== "function") {
            return;
        }
        setTimeout(function () {
            fn();
        }, 1);
    };
}());
(function () {
    FXStreetWidgets.ResourceType = {
        Js: "Js",
        Css: "Css",
        Font: "Font",
        Mustache: "Mustache"
    };

    FXStreetWidgets.Resource = function (name, type, url, customLoadedDelegate) {
        this.Name = name;
        this.Type = type;
        this.Url = url;
        this.Loaded = false;
        this.Value = "";
        this.CustomLoadedDelegate = customLoadedDelegate;
    };

    FXStreetWidgets.ResourceManager = function () {
        var _this = this;

        var resources = {};

        var addEventListenerCallback = function (element, callback, resourceName) {
            if (element.addEventListener) {
                element.addEventListener('load', function () {
                    callback(resourceName);
                }, false);
            } else {
                element.onreadystatechange = function () {
                    if (this.readyState === "complete" || this.readyState === "loaded") {
                        callback.call(resourceName);
                    }
                };
            }
        };

        var loadJsAsync = function (resource, callback) {
            var js = document.createElement('script');
            js.type = 'text/javascript';
            js.async = true;
            js.src = resource.Url;

            addEventListenerCallback(js, callback, resource.Name);

            var firstScript = document.getElementsByTagName('script')[0];
            firstScript.parentNode.insertBefore(js, firstScript);
        };

        var loadCssAsync = function (resource) {
            FXStreetWidgets.$('<link>').attr('rel', 'stylesheet').attr('type', 'text/css').attr('href', resource.Url).appendTo('head');
        };

        var loadMustacheAsync = function (resource, callback) {
            FXStreetWidgets.$.ajax({
                type: "GET",
                url: resource.Url
            }).then(function (htmlTemplate) {
                resource.Loaded = true;
                resource.Value = htmlTemplate;
                callback.call(resource);
            });
        };

        var callbackWrapper = function (resourceName, callback) {
            resources[resourceName].Loaded = true;
            if (callback && typeof callback === "function") {
                callback.call();
            }
        };

        var alreadyLoaded = function (resource) {
            var result = resources.hasOwnProperty(resource.Name);
            return result;
        };

        var existsInDom = function(resource) {
            var result = false;

            if(resource.CustomLoadedDelegate && resource.CustomLoadedDelegate()){
                return true;
            }

            switch (resource.Type) {
                case FXStreetWidgets.ResourceType.Js:{
                    var scripts = document.getElementsByTagName("script");
                    for (var i = 0; i < scripts.length; i++) {
                        var script = scripts[i];
                        if (script.src === resource.Url || script.src.indexOf(resource.Name) !== -1) {
                            result = true;
                            break;
                        }
                    }
                    break;
                }
                case FXStreetWidgets.ResourceType.Css:{
                    var links = document.getElementsByTagName("link");
                    for (var i = 0; i < links.length; i++) {
                        var link = links[i];
                        if (link.href === resource.Url || link.href.indexOf(resource.Name) !== -1) {
                            result = true;
                            break;
                        }
                    }
                    break;
                }
                case FXStreetWidgets.ResourceType.Font:{
                    var links = document.getElementsByTagName("link");
                    for (var i = 0; i < links.length; i++) {
                        var link = links[i];
                        if (link.href === resource.Url || link.href.indexOf(resource.Url) !== -1) {
                            result = true;
                            break;
                        }
                    }
                    break;
                }
                default:{
                    break;
                }
            }

            return result;
        };

        var load = function (resource, callback) {
            var exists = false;

            if (alreadyLoaded(resource)) {
                exists = true;
                resource.Loaded = true;
            }
            else if (existsInDom(resource)) {
                exists = true;
                resource.Loaded = true;
                resources[resource.Name] = resource;
            }

            if (exists === true && callback && typeof callback === "function") {
                callback(resource);
            }
            else if (exists === false) {
                resources[resource.Name] = resource;

                switch (resource.Type) {
                    case FXStreetWidgets.ResourceType.Js:
                    {
                        loadJsAsync(resource, function (resourceName) {
                            callbackWrapper(resourceName, callback);
                        });
                        break;
                    }
                    case FXStreetWidgets.ResourceType.Css:
                    case FXStreetWidgets.ResourceType.Font:
                    {
                        loadCssAsync(resource);
                        callbackWrapper(resource.Name, callback);
                        break;
                    }
                    case FXStreetWidgets.ResourceType.Mustache:
                    {
                        loadMustacheAsync(resource, function () {
                            callback(resource);
                        });
                        break;
                    }
                    default:
                    {
                        break;
                    }
                }
            }
        };

        _this.load = function (name, type, url, callback, customLoadedDelegate) {
            var resource = new FXStreetWidgets.Resource(name, type, url, customLoadedDelegate);
            return load(resource, callback);
        };

        return _this;
    };
}());
(function () {
    FXStreetWidgets.ConfigManager = function() {
        var _this = this;

        _this.config = {
            Logging: false,
            UseMin: true,
            ServerName: "https://staticcontent.fxstreet.com/",
            AuthorizationUrl: "https://authorization.fxstreet.com/token",
            StaticContentQueryStringRefresh: "?t=20171024",
            Culture: "en-US",
            StaticContentName: "widgets/",
            JsJqueryName: "jquery-1.11.3.min.js",
            JsMustacheName: "mustache.js",
            JsAuth: { container: 'auth/', fileName: "fxsauth.js" },
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
(function () {
    FXStreetWidgets.DeferredManager = function () {
        var _this = this;

        var widgetDataList = [];
        
        var initDeferredWidgets = function () {
            if (FXStreetWidgets.Initialization === null || !FXStreetWidgets.Initialization.isReady) {
                return;
            }

            for (var i = widgetDataList.length - 1; i >= 0 ; i--) {
                var widgetData = widgetDataList[i];
                FXStreetWidgets.Initialization.loadWidgets(widgetData);

                for (var key in widgetData.widgets) {
                    if (widgetData.widgets[key].Loaded === true) {
                        delete widgetData.widgets[key];
                    }
                }
                
                if (Object.keys(widgetData.widgets).length === 0) {
                    widgetDataList.splice(i, 1);
                }
            }
        };

        _this.deferredLoad = function (container) {
            if (container) {
                var widgetData = new FXStreetWidgets.InitManager.WidgetData(container, true);
                widgetDataList.push(widgetData);
            }

            initDeferredWidgets();
        };

        return _this;
    };
}());
(function () {
    window.addEventListener("load", function (event) {
        FXStreetWidgets.ResourceManagerObj = new FXStreetWidgets.ResourceManager();

        FXStreetWidgets.Configuration = new FXStreetWidgets.ConfigManager();
        FXStreetWidgets.Configuration.init();

        FXStreetWidgets.Initialization = new FXStreetWidgets.InitManager();
        FXStreetWidgets.Initialization.init();

        FXStreetWidgets.Deferred = new FXStreetWidgets.DeferredManager();
    });
}());