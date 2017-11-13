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
                FXStreetWidgets.Authorization.getTokenPromise().then(function (token) {
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