(function () {
    FXStreetWidgets.Widget.Base = function (loaderBase) {
        var _this = {};

        _this.Container = FXStreetWidgets.Widget.Base.prototype.Container;
        _this.loaderBase = loaderBase;
        _this.data = FXStreetWidgets.Widget.Base.prototype.data;
        _this.interval = FXStreetWidgets.Widget.Base.prototype.interval;
        _this.init = FXStreetWidgets.Widget.Base.prototype.init;
        _this.setSettingsByObject = FXStreetWidgets.Widget.Base.prototype.setSettingsByObject;
        _this.addEvents = FXStreetWidgets.Widget.Base.prototype.addEvents;
        _this.setVars = FXStreetWidgets.Widget.Base.prototype.setVars;
        _this.loadData = FXStreetWidgets.Widget.Base.prototype.loadData;
        _this.loadDataFromUrl = FXStreetWidgets.Widget.Base.prototype.loadDataFromUrl;
        _this.setDatesToJson = FXStreetWidgets.Widget.Base.prototype.setDatesToJson;
        _this.renderHtml = FXStreetWidgets.Widget.Base.prototype.renderHtml;
        _this.log = FXStreetWidgets.Widget.Base.prototype.log;
        _this.jsonDataIsValid = FXStreetWidgets.Widget.Base.prototype.jsonDataIsValid;
        _this.handleJsonInvalidData = FXStreetWidgets.Widget.Base.prototype.handleJsonInvalidData;

        return _this;
    };
    FXStreetWidgets.Widget.Base.prototype.Container = null;
    FXStreetWidgets.Widget.Base.prototype.loaderBase = null;
    FXStreetWidgets.Widget.Base.prototype.data = null;
    FXStreetWidgets.Widget.Base.prototype.interval = null;
    FXStreetWidgets.Widget.Base.prototype.init = function (json) {
        this.setSettingsByObject(json);
    };
    FXStreetWidgets.Widget.Base.prototype.setSettingsByObject = function (json) {
        for (var propName in json) {
            if (json.hasOwnProperty(propName)) {
                if (this[propName] !== undefined) {
                    this[propName] = json[propName];
                }
            }
        }
    };
    FXStreetWidgets.Widget.Base.prototype.addEvents = function () { };
    FXStreetWidgets.Widget.Base.prototype.setVars = function () { };
    FXStreetWidgets.Widget.Base.prototype.loadData = function (request) {
        this.loadDataFromUrl(this.loaderBase.config.EndPoint, request);
    };
    FXStreetWidgets.Widget.Base.prototype.loadDataFromUrl = function (url, request) {
        var _this = this;
        FXStreetWidgets.Util.ajaxJsonGetter(url, request)
            .done(function (data) {
                if (!_this.jsonDataIsValid(data)) {
                    _this.handleJsonInvalidData();
                    return;
                }
                _this.data = data;
                if (_this.loaderBase.isReady()) {
                    _this.log("start renderHtml for: " + _this.loaderBase.config.WidgetName);
                    _this.renderHtml();
                } else {
                    _this.interval = setInterval(function () {
                        if (_this.loaderBase.isReady()) {
                            clearInterval(_this.interval);
                            _this.log("start renderHtml for: " + _this.loaderBase.config.WidgetName);
                            _this.renderHtml();
                        }
                    }, _this.intervalTimeToWaitForReady);
                }
            });
            //.fail(function () {
            //    _this.handleJsonInvalidData();
            //});
    };
    FXStreetWidgets.Widget.Base.prototype.setDatesToJson = function (json, dateResponse) {
        var date = FXStreetWidgets.Util.formatDate(dateResponse);
        json.LastUpdatedDate = dateResponse;
        json.LastUpdatedHour = date;
        return json;
    };
    FXStreetWidgets.Widget.Base.prototype.renderHtml = function () { };
    FXStreetWidgets.Widget.Base.prototype.log = function(msg) {
        FXStreetWidgets.Util.log(msg);
    };
    FXStreetWidgets.Widget.Base.prototype.jsonDataIsValid = function (data) {
        var result = FXStreetWidgets.Util.isValid(data)
                    && FXStreetWidgets.Util.arrayIsValid(data.Values)
                    && FXStreetWidgets.Util.isValid(data.Values[0]);
        return result;
    };
    FXStreetWidgets.Widget.Base.prototype.handleJsonInvalidData = function () {
        var _this = this;
        var noDataMessage = _this.loaderBase.config.Translations['NoDataAvailable'];
        if (!FXStreetWidgets.Util.isValid(noDataMessage)) {
            noDataMessage = 'No data available';
        }
        _this.Container.html(noDataMessage);
    };
}());
(function ($) {
    FXStreetWidgets.Widget.LoaderBase = function (options) {
        var _this = {};

        _this.options = options;
        _this.config = FXStreetWidgets.Widget.LoaderBase.prototype.config;
        _this.isReady = FXStreetWidgets.Widget.LoaderBase.prototype.isReady;
        _this.isReadyCustomCheck = FXStreetWidgets.Widget.LoaderBase.prototype.isReadyCustomCheck;
        _this.initConfiguration = FXStreetWidgets.Widget.LoaderBase.prototype.initConfiguration;
        _this.getContainer = FXStreetWidgets.Widget.LoaderBase.prototype.getContainer;
        _this.getHost = FXStreetWidgets.Widget.LoaderBase.prototype.getHost;
        _this.getVersion = FXStreetWidgets.Widget.LoaderBase.prototype.getVersion;
        _this.getCustomJs = FXStreetWidgets.Widget.LoaderBase.prototype.getCustomJs;
        _this.getSharedJs = FXStreetWidgets.Widget.LoaderBase.prototype.getSharedJs;
        _this.getEndPoint = FXStreetWidgets.Widget.LoaderBase.prototype.getEndPoint;
        _this.getEndPointTranslation = FXStreetWidgets.Widget.LoaderBase.prototype.getEndPointTranslation;
        _this.initWidgets = FXStreetWidgets.Widget.LoaderBase.prototype.initWidgets;
        _this.log = FXStreetWidgets.Widget.LoaderBase.prototype.log;
        _this.chartLibrariesAreLoaded = FXStreetWidgets.Widget.LoaderBase.prototype.chartLibrariesAreLoaded;
        _this.getDefaultHost = FXStreetWidgets.Widget.LoaderBase.prototype.getDefaultHost;

        _this.mustachesCount = 0;
        _this.mustachesLoadedCount = 0;
        _this.customJsCount = 0;
        _this.customJsLoadedCount = 0;
        _this.sharedJsCount = 0;
        _this.sharedJsLoadedCount = 0;
        _this.translationsLoaded = false;
        _this.haveCustomJs = false;
        _this.haveSharedJs = false;

        _this.init = function () {
            if (!FXStreetWidgets.Util.isValid(_this.options)
                || !FXStreetWidgets.Util.isValid(_this.options.WidgetName)
                || !_this.options.WidgetName.trim()) {
                _this.log("unable to load fxswidget options bad configure.");
                return;
            }

            FXStreetWidgets.Initialization.registerLoader(_this.options.WidgetName, _this);

            _this.initConfiguration();
            _this.loadUtils();

            var widgets = $("div[fxs_widget][fxs_name='" + _this.options.WidgetName + "']");
            FXStreetWidgets.Util.async(function () {
                _this.initWidgets(widgets);
            });
        };

        _this.loadDeferred = function (container) {
            _this.log("loading deferred " + _this.options.WidgetName);
            var widgets = container.find("div[fxs_widget][fxs_name='" + _this.options.WidgetName + "']");
            _this.initWidgets(widgets);
        };

        _this.loadUtils = function () {
            FXStreetWidgets.Util.ajaxJsonGetter(_this.config.EndPointTranslation).done(function (data) {
                _this.translationsLoaded = true;
                _this.config.Translations = data.Values;
            });

            $.each(_this.config.CustomJs, function (index, custom) {
                _this.customJsCount++;
                var url = "";
                var name = "";
                var customLoadedDelegate;

                if (typeof custom === 'string') {
                    name = custom;
                    url = FXStreetWidgets.Configuration.getCoreJsUrl(name);
                }
                else if (custom && typeof custom === 'object') {
                    name = custom.Js;
                    url = FXStreetWidgets.Configuration.getCoreJsUrl(name);
                    customLoadedDelegate = custom.CustomLoadedDelegate;
                }

                FXStreetWidgets.ResourceManagerObj.load(name, FXStreetWidgets.ResourceType.Js, url, function () {
                    _this.customJsLoadedCount++;
                }, customLoadedDelegate);
            });

            $.each(_this.config.SharedJs, function (index, shared) {
                _this.sharedJsCount++;
                var url = FXStreetWidgets.Configuration.createResourceUrl(shared.Container, shared.Js);

                FXStreetWidgets.ResourceManagerObj.load(shared.Js, FXStreetWidgets.ResourceType.Js, url, function () {
                    _this.sharedJsLoadedCount++;
                }, shared.CustomLoadedDelegate);
            });

            $.each(_this.config.Mustaches, function (key, value) {
                _this.mustachesCount++;
                var name = key + ".html";
                var url = FXStreetWidgets.Configuration.getMustacheUrl(name, _this.options.WidgetName);

                FXStreetWidgets.ResourceManagerObj.load(name, FXStreetWidgets.ResourceType.Mustache, url, function (res) {
                    _this.config.Mustaches[key] = res.Value;
                    _this.mustachesLoadedCount++;
                });
            });
        };

        _this.async_loadjs = function (url, callback) {
            var x = document.getElementsByTagName('script')[0],
                s = document.createElement('script');
            s.type = 'text/javascript';
            s.async = true;
            s.src = url;
            if (callback && typeof callback === "function") {
                if (s.addEventListener) {
                    s.addEventListener('load', callback, false);
                } else {
                    s.onreadystatechange = function () {
                        if (this.readyState === "complete" || this.readyState === "loaded") {
                            callback.call();
                        }
                    };
                }
            }
            x.parentNode.insertBefore(s, x);
        };

        return _this;
    };
    FXStreetWidgets.Widget.LoaderBase.prototype.config = {};
    FXStreetWidgets.Widget.LoaderBase.prototype.initWidgets = function (widgets) { };
    FXStreetWidgets.Widget.LoaderBase.prototype.initConfiguration = function () {
        this.log("init configuration for: " + this.options.WidgetName);

        var container = this.getContainer();
        var host = this.getHost(container);
        var version = this.getVersion(container);
        var customJs = this.getCustomJs();
        var sharedJs = this.getSharedJs();

        this.config = {
            WidgetType: this.options.WidgetType,
            WidgetName: this.options.WidgetName,
            Culture: FXStreetWidgets.Configuration.getCulture(),
            EndPoint: this.getEndPoint(host, version),
            EndPointTranslation: this.getEndPointTranslation(host, version),
            DefaultHost: this.getDefaultHost(this.options),
            CustomJs: customJs,
            SharedJs: sharedJs,
            Mustaches: this.options.Mustaches,
            Translations: {}
        };
    };

    FXStreetWidgets.Widget.LoaderBase.prototype.getDefaultHost = function (options) {
        var hosts = FXStreetWidgets.Configuration.getHosts();
        if(!hosts) return options.DefaultHost;

        var defaultHost = hosts[options.WidgetType];
        
        var result = defaultHost || options.DefaultHost;        
        return result;
    };

    FXStreetWidgets.Widget.LoaderBase.prototype.getContainer = function () {
        var container = $("div[fxs_widget][fxs_name='" + this.options.WidgetName + "']").first();
        return container;
    };
    FXStreetWidgets.Widget.LoaderBase.prototype.getHost = function (container) {
        container = container || this.getContainer();
        var host = container.attr("fxs_host");
        host = FXStreetWidgets.Util.isUndefined(host) ? this.getDefaultHost(this.options) : host;
        return host;
    };
    FXStreetWidgets.Widget.LoaderBase.prototype.getVersion = function (container) {
        container = container || this.getContainer();
        var version = container.attr("fxs_version") || this.options.DefaultVersion;
        version = FXStreetWidgets.Util.isUndefined(version) ? "" : version;
        return version;
    };
    FXStreetWidgets.Widget.LoaderBase.prototype.getCustomJs = function () {
        var customJs = [];

        if (FXStreetWidgets.Util.arrayIsValid(this.options.CustomJs)) {
            this.haveCustomJs = true;
            customJs = this.options.CustomJs;
        }

        return customJs;
    };
    FXStreetWidgets.Widget.LoaderBase.prototype.getSharedJs = function () {
        var sharedJs = [];

        if (FXStreetWidgets.Util.arrayIsValid(this.options.SharedJs)) {
            this.haveSharedJs = true;
            sharedJs = this.options.SharedJs;
        }

        return sharedJs;
    };
    var getFormattedEndpoint = function (formatEndpoint, version) {
        var result = formatEndpoint.replace(/{version}/g, version).replace(/{culture}/g, FXStreetWidgets.Configuration.getCulture());
        return result;
    };
    FXStreetWidgets.Widget.LoaderBase.prototype.getEndPoint = function (host, version) {
        var result;
        if (this.options.EndPointV2) {
            var formattedEndpoint = getFormattedEndpoint(this.options.EndPointV2, version);
            result = host + formattedEndpoint;
        } else {
            result = host + (version ? version + '/' : "") + FXStreetWidgets.Configuration.getCulture() + "/" + this.options.EndPoint;
        }
        return result;
    };
    FXStreetWidgets.Widget.LoaderBase.prototype.getEndPointTranslation = function (host, version) {
        var result;
        if (this.options.EndPointTranslationV2) {
            var formattedEndpoint = getFormattedEndpoint(this.options.EndPointTranslationV2, version);
            result = host + formattedEndpoint;
        } else {
            result = host + (version ? version + '/' : "") + FXStreetWidgets.Configuration.getCulture() + "/" + this.options.EndPointTranslation;
        }
        return result;
    };
    FXStreetWidgets.Widget.LoaderBase.prototype.isReady = function () {
        var result = this.translationsLoaded === true
            && ((this.haveCustomJs === false) || (this.haveCustomJs === true && this.customJsLoadedCount >= this.customJsCount))
            && ((this.haveSharedJs === false) || (this.haveSharedJs === true && this.sharedJsLoadedCount >= this.sharedJsCount))
            && this.mustachesLoadedCount === this.mustachesCount;

        result = result && this.isReadyCustomCheck();

        if (result === true) {
            this.log("loader ready for: " + this.options.WidgetName);
        }

        return result;
    };
    FXStreetWidgets.Widget.LoaderBase.prototype.isReadyCustomCheck = function () {
        return true;
    };
    FXStreetWidgets.Widget.LoaderBase.prototype.chartLibrariesAreLoaded = function () {
        var result = typeof (d3) !== "undefined" && typeof (c3) !== "undefined";
        return result;
    };
    FXStreetWidgets.Widget.LoaderBase.prototype.log = function (msg) {
        FXStreetWidgets.Util.log(msg);
    };
}(FXStreetWidgets.$));
(function ($) {
    FXStreetWidgets.Widget.News = function (loaderBase) {
        var parent = FXStreetWidgets.Widget.Base(loaderBase),
            _this = FXStreetWidgets.Util.extendObject(parent);

        //Parameters
        _this.Container = null;
        _this.Tags = "";
        _this.CustomTags = "";
        _this.Take = 0;
        _this.Customizable = true;
        _this.FreeVersion = false;
        _this.CustomUrl = "";
        _this.View = "";
        _this.EndPointTags = "";
        _this.EndPointConfiguration = "";
        _this.MaxHeight = "";

        _this.FilterEndpointMap = {
            "free": "filtermini",
            "default": "filter",
            "full": "filterfull"
        };

        _this.ContentType = {
            Free: "free",
            Default: "default",
            Full: "full"
        };

        _this.Views = {
            Minimal: "minimal",
            Simple: "simple",
            Complete: "complete"
        };

        //Vars
        _this.WidgetId = FXStreetWidgets.Util.guid();
        _this.Page = 1;
        _this.WidgetTemplate = "news";
        _this.FilterTemplate = "news_filter";
        _this.ItemsTemplate = "news_items";
        _this.ProductFeature = "generalfeed";
        _this.Configuration = {};

        //DOM Selectors
        _this.FilterTagsSelector = "input[data-tag-option]";
        _this.FilterViewsSelector = "input[data-view-option]";
        _this.ItemsAreaSelector = "#news_items_" + _this.WidgetId;
        _this.FilterContainerSelector = "#news_filter_" + _this.WidgetId;
        _this.FilterObjSelector = "#news_filter_" + _this.WidgetId;
        _this.ShowFilterObSelectorj = "#news_show_filter_" + _this.WidgetId;
        _this.CloseFilterObjSelector = "#news_close_filter_" + _this.WidgetId;
        _this.ClearFilterObjSelector = "#news_clear_filter_" + _this.WidgetId;
        _this.ApplyFilterObjSelector = "#news_apply_filter_" + _this.WidgetId;
        _this.LoadMoreObjSelector = "#news_loadmore_" + _this.WidgetId;
        _this.PreLoadObjSelector = "#news_preload_" + _this.WidgetId;
        _this.AlertObjSelector = "#news_alert_" + _this.WidgetId;
        _this.ItemSummaryObjSelectorPrefix = "#news_item_summary_" + _this.WidgetId + "_";
        _this.ItemContentObjSelectorPrefix = "#news_item_content_" + _this.WidgetId + "_";
        _this.ItemObjSelector = "a[data-item-id]";

        //Classes & Attributes
        _this.HideElementClass = "fxs_hideElements";
        _this.DisableElementAttr = "disabled";

        //Translations
        _this.VisualizationMinimalText = "";
        _this.VisualizationSimpleText = "";
        _this.VisualizationCompleteText = "";
        _this.LoadingText = "";
        _this.NoMoreContentText = "";

        //DOM Objects
        _this.FilterObj = null;
        _this.ShowFilterObj = null;
        _this.CloseFilterObj = null;
        _this.ClearFilterObj = null;
        _this.ApplyFilterObj = null;
        _this.LoadMoreObj = null;
        _this.PreLoadObj = null;
        _this.AlertObj = null;

        _this.init = function (json) {
            _this.setSettingsByObject(json);
            if (!_this.View) {
                _this.View = _this.Views.Simple;
            }

            _this.getConfiguration()
                .done(function (data) {
                    if (!_this.jsonDataIsValid(data)) {
                        _this.handleJsonInvalidData();
                        return;
                    }
                    _this.Configuration = data;

                    _this.setTags();

                    var url = _this.buildEndPointUrlFromParams(_this.loaderBase.config.EndPoint, _this.Tags);
                    _this.loadDataFromUrl(url);
                })
                .fail(function () {
                    _this.handleJsonInvalidData();
                });
        };

        _this.setTags = function () {
            if (_this.getShowFilter() && !_this.CustomTags) {
                _this.CustomTags = _this.Configuration.DefaultTags;
            }
            if (!_this.getShowFilter() && _this.CustomTags) {
                _this.Tags = _this.CustomTags;
            }
        };

        _this.setVars = function () {
            _this.VisualizationMinimalText = _this.loaderBase.config.Translations["Visualization_" + _this.Views.Minimal];
            _this.VisualizationSimpleText = _this.loaderBase.config.Translations["Visualization_" + _this.Views.Simple];
            _this.VisualizationCompleteText = _this.loaderBase.config.Translations["Visualization_" + _this.Views.Complete];
            _this.LoadingText = _this.loaderBase.config.Translations["Loading"];
            _this.NoMoreContentText = _this.loaderBase.config.Translations["NoMoreContent"];
        };

        _this.getDomObjects = function () {
            _this.FilterObj = $(_this.FilterObjSelector);
            _this.ShowFilterObj = $(_this.ShowFilterObjSelector);
            _this.CloseFilterObj = $(_this.CloseFilterObjSelector);
            _this.ClearFilterObj = $(_this.ClearFilterObjSelector);
            _this.ApplyFilterObj = $(_this.ApplyFilterObjSelector);
            _this.LoadMoreObj = $(_this.LoadMoreObjSelector);
            _this.PreLoadObj = $(_this.PreLoadObjSelector);
            _this.AlertObj = $(_this.AlertObjSelector);
            _this.ItemObj = $(_this.ItemObjSelector);
        };

        _this.addFilterEvents = function () {
            _this.getDomObjects();
            _this.ShowFilterObj.on('click', function () {
                _this.FilterObj.addClass('cbp-spmenu-open');
            });
            _this.CloseFilterObj.on('click', function () {
                _this.FilterObj.removeClass('cbp-spmenu-open');
            });
            _this.ApplyFilterObj.on('click', function () {
                _this.applyFilter();
            });
            _this.ClearFilterObj.on('click', function () {
                _this.clearFilter();
            });
        };

        _this.addItemsEvents = function () {
            _this.getDomObjects();
            _this.LoadMoreObj.on('click', function () {
                _this.loadMore();
            });
            _this.AlertObj.on('click', function () {
                _this.renderPushedNews();
            });
            if (_this.getShowContent()) {
                _this.ItemObj.on('click', function (itemTitle) {
                    var id = $(itemTitle.target).data("item-id");
                    var summarySelector = _this.ItemSummaryObjSelectorPrefix + id;
                    var contentSelector = _this.ItemContentObjSelectorPrefix + id;

                    if (!_this.isVisible($(contentSelector))) {
                        _this.hideObj($(summarySelector));
                        _this.showObj($(contentSelector));
                    }
                    else {
                        _this.showObj($(summarySelector));
                        _this.hideObj($(contentSelector));
                    }
                });
            }
        };

        _this.subscribeHttpPush = function () {
            if (FXStreetPush) {
                FXStreetWidgets.Util.getTokenByDomain().then(function (token) {
                    var options = {
                        token: token,
                        tokenUrl: _this.Configuration.AuthorizationUrl,
                        httpPushServerUrl: _this.Configuration.HttpPushServer + "signalr/hubs",
                        culture: FXStreetWidgets.Configuration.getCulture()
                    };
                    var push = FXStreetPush.PushNotification.getInstance(options);

                    var channels = [_this.Configuration.NewsHttpPushFeature];
                    push.postSubscribe(channels,
                        function (news) {
                            _this.newsNotify(news);
                        }
                    );
                });
            }
            else {
                console.log("FXStreetPush load failed");
            }
        };

        _this.newsNotify = function (news) {
            if (!_this.newsContainsTags(news.Tags)) return;

            _this.data.Values.unshift(news);
            _this.showObj(_this.AlertObj);
        };

        _this.newsContainsTags = function (newsTags) {
            if (_this.Tags == "") return true;

            var contains = false;
            $.each(newsTags, function (index, tag) {
                if (_this.Tags.indexOf(tag.Id) >= 0) {
                    contains = true;
                    return false;
                }
            });
            return contains;
        };

        _this.renderPushedNews = function () {
            _this.hideObj(_this.AlertObj);

            _this.renderItems();
        };

        _this.buildEndPointUrlFromParams = function (endpointUrl, tags) {
            var url = endpointUrl;
            var filterType = _this.FreeVersion ? _this.ContentType.Free : (_this.getShowContent() ? _this.ContentType.Full : _this.ContentType.Default);

            url = url.replace("{filter}", _this.FilterEndpointMap[filterType]);
            url = url.replace("{productfeature}", _this.ProductFeature);
            url = url.replace("{page}", _this.Page);
            url = url.replace("{take}", _this.Take);
            if (_this.FreeVersion || !tags) {
                url = url.replace("{tags}/", "");
            }
            else {
                url = url.replace("{tags}", tags);
            }

            return url;
        };

        _this.jsonDataIsValid = function (data) {
            var result = FXStreetWidgets.Util.isValid(data);
            return result;
        };

        _this.renderHtml = function () {
            _this.setVars();

            var jsonData = {
                WidgetId: _this.WidgetId,
                ShowFilter: _this.getShowFilter(),
                Translations: _this.loaderBase.config.Translations
            };

            var rendered = FXStreetWidgets.Util.renderByHtmlTemplate(_this.loaderBase.config.Mustaches[_this.WidgetTemplate], jsonData);
            _this.Container.html(rendered);

            _this.renderFilter();
            _this.renderItems();

            _this.subscribeHttpPush();
        };

        _this.renderItems = function () {
            _this.setProperties();
            var items = _this.Container.find(_this.ItemsAreaSelector);
            if (items.length > 0) {
                var jsonData = {
                    WidgetId: _this.WidgetId,
                    ShowFilter: _this.getShowFilter(),
                    ShowBrand: _this.FreeVersion,
                    ShowImage: _this.getShowImage(),
                    ShowSummary: _this.getShowSummary(),
                    ShowTags: _this.getShowTags(),
                    ShowContent: _this.getShowContent(),
                    HasNews: _this.data.Values.length > 0,
					NoFollow: _this.CustomUrl == "",
                    Values: _this.data.Values,
                    Translations: _this.loaderBase.config.Translations,
                    MaxHeight: _this.MaxHeight
                };

                var rendered = FXStreetWidgets.Util.renderByHtmlTemplate(_this.loaderBase.config.Mustaches[_this.ItemsTemplate], jsonData);
                items.html(rendered);

                _this.addItemsEvents();

            }
        };

        _this.renderFilter = function () {
            if (_this.Customizable && _this.getShowFilter()) {
                _this.getTags().done(function (data) {
                    if (!_this.jsonDataIsValid(data)) {
                        _this.handleJsonInvalidData();
                        return;
                    }

                    var tags = data.Tags;
                    var filter = _this.Container.find(_this.FilterContainerSelector);
                    if (filter.length > 0) {
                        var jsonData = {
                            WidgetId: _this.WidgetId,
                            Tags: tags,
                            Visualizations: _this.getVisualizations(),
                            Translations: _this.loaderBase.config.Translations
                        };

                        var rendered = FXStreetWidgets.Util.renderByHtmlTemplate(_this.loaderBase.config.Mustaches[_this.FilterTemplate], jsonData);
                        filter.html(rendered);

                        _this.addFilterEvents();
                        _this.initFilter();
                    }
                })
               .fail(function () {
                   _this.handleJsonInvalidData();
               });
            }
        };



        _this.getTags = function () {
            var url = _this.buildEndPointUrlFromParams(_this.EndPointTags, _this.CustomTags);
            return FXStreetWidgets.Util.ajaxJsonGetter(url);
        };

        _this.getConfiguration = function () {
            var configurationUrl = _this.buildEndPointUrlFromParams(_this.EndPointConfiguration);
            return FXStreetWidgets.Util.ajaxJsonGetter(configurationUrl);
        };

        _this.getVisualizations = function () {
            var result = [];
            result.push({ Name: _this.VisualizationMinimalText, Id: _this.Views.Minimal });
            result.push({ Name: _this.VisualizationSimpleText, Id: _this.Views.Simple });
            result.push({ Name: _this.VisualizationCompleteText, Id: _this.Views.Complete });

            return result;
        };

        _this.setProperties = function () {
            $.each(_this.data.Values, function (index, post) {
                if (_this.CustomUrl != "") {
                    post.CustomUrl = _this.CustomUrl + post.Id;
                }
                post.PublicationDate = FXStreetWidgets.Util.formatDateUtcOffset(post.PublicationDate, 0, "MMM D, HH:mm") + " GMT";
            });
        };

        _this.loadMore = function () {
            _this.LoadMoreObj.html(_this.LoadingText);

            _this.Page++;

            var url = _this.buildEndPointUrlFromParams(_this.loaderBase.config.EndPoint, _this.Tags);

            FXStreetWidgets.Util.ajaxJsonGetter(url)
                .done(function (data) {
                    if (!_this.jsonDataIsValid(data)) {
                        _this.handleJsonInvalidData();
                        return;
                    }

                    if (data.Values.length > 0) {
                        _this.data.Values = _this.data.Values.concat(data.Values);
                        _this.renderItems();
                    }
                    else {
                        _this.LoadMoreObj.attr(_this.DisableElementAttr, true).html(_this.NoMoreContentText);
                    }
                })
                .fail(function () {
                    _this.handleJsonInvalidData();
                });
        };

        _this.showObj = function (obj) {
            obj.removeClass(_this.HideElementClass);
        };

        _this.hideObj = function (obj) {
            obj.addClass(_this.HideElementClass);
        };

        _this.isVisible = function (obj) {
            return !obj.hasClass(_this.HideElementClass);
        };

        _this.applyFilter = function () {
            _this.CloseFilterObj.click();

            var selectedTags = _this.getTagsFromFilter();
            var selectedView = _this.getViewFromFilter();

            if (selectedTags == _this.Tags && selectedView == _this.View) return;


            _this.Page = 1;
            _this.View = selectedView;

            if (selectedTags != _this.Tags) {
                _this.showObj(_this.PreLoadObj);
                _this.Tags = selectedTags;

                var url = _this.buildEndPointUrlFromParams(_this.loaderBase.config.EndPoint, _this.Tags);

                FXStreetWidgets.Util.ajaxJsonGetter(url)
                    .done(function (data) {
                        if (!_this.jsonDataIsValid(data)) {
                            _this.handleJsonInvalidData();
                            return;
                        }

                        _this.data.Values = data.Values;
                        _this.renderItems();

                        _this.hideObj(_this.PreLoadObj);
                    })
                    .fail(function () {
                        _this.handleJsonInvalidData();
                    });
            }
            else {
                _this.renderItems();
            }
        };

        _this.clearFilter = function () {
            var tags = _this.Container.find(_this.FilterTagsSelector);
            tags.each(function (index, tag) {
                if (tag.checked) {
                    tag.checked = false;
                }
            });
        };

        _this.initFilter = function () {
            var tags = _this.Container.find(_this.FilterTagsSelector);
            //tags.each(function (index, tag) {
            //    tag.checked = (_this.Tags.indexOf(tag.value) >= 0);
            //});

            var views = _this.Container.find(_this.FilterViewsSelector);
            views.each(function (index, view) {
                view.checked = (view.value == _this.View);
            });
        };

        _this.getShowFilter = function () {
            return _this.Customizable && !_this.FreeVersion;
        };

        _this.getShowImage = function () {
            return _this.View != _this.Views.Minimal;
        };

        _this.getShowSummary = function () {
            return _this.View == _this.Views.Complete;
        };

        _this.getShowContent = function () {
            return _this.CustomUrl == "" && !_this.FreeVersion;
        };

        _this.getShowTags = function () {
            return _this.View != _this.Views.Minimal;
        };

        _this.getTagsFromFilter = function () {
            var options = _this.Container.find(_this.FilterTagsSelector);
            var result = [];

            options.each(function (index, tag) {
                if (tag.checked) {
                    result.push(tag.value);
                }
            });

            return result.join(",");
        };

        _this.getViewFromFilter = function () {
            var options = _this.Container.find(_this.FilterViewsSelector);
            var result = "";

            options.each(function (index, view) {
                if (view.checked) {
                    result = view.value;

                    return result;
                }
            });

            return result;
        };

        return _this;
    };
}(FXStreetWidgets.$));
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

            var endPoint = host + version + "/" + culture + "/" + options.EndPointTags;
            return endPoint;
        };

        _this.getEndPointConfiguration = function () {
            var container = _this.getContainer();
            var host = _this.getHost(container);
            var version = _this.getVersion(container);
            var culture = FXStreetWidgets.Configuration.getCulture();

            var endPoint = host + version + "/" + culture + "/" + options.EndPointConfiguration;
            return endPoint;
        };

        return _this;
    };

    (function () {
        var loader = new FXStreetWidgets.Widget.LoaderNews();
        loader.init();
    })();
}(FXStreetWidgets.$));