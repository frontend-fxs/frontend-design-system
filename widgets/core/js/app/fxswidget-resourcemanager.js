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