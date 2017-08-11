(function () {
    FXStreet.Class.Sidebar.RenderedItemInPage.Base = function () {
        var parent = FXStreet.Class.Base(),
            _this = FXStreet.Util.extendObject(parent);

        _this.ContainerBodyId = 'fxs_it_detail';
        _this.LoadingLock = false;
        _this.Loaded = false; // Tenemos el elemento en Memory
        _this.Rendered = false; // El elemento esta en DOM
        _this.Visible = false; // El elemento esta en el DOM & esta visible
        _this.PositionInRenderizableListItems = -1;
        _this.ContainerBody = null;
        _this.ContainerItem = null;
        _this.ContainerClass = '';
        _this.HtmlTemplateData = {};
        _this.SetHtmlTemplateDataCallback = null;

        _this.InternalWidgetsLoaded = false;
        _this.IsRenderByUser = false;

        _this.init = function (json) {
            _this.setSettingsByObject(json);
            _this.HtmlTemplateData = json;
            _this.setVars();
        };

        _this.setVars = function () {
            _this.ContainerBody = FXStreet.Util.getjQueryObjectById(_this.ContainerBodyId);
        };

        _this.CreateContainer = function () {
            //_this.ContainerItem = $("<section>");
            _this.ContainerItem = $("<div>");
            _this.ContainerItem.css('display', 'none');
            _this.ContainerItem.attr('fxs_section', '');
            _this.ContainerItem.addClass('fxs_detail');
            _this.ContainerItem.addClass(_this.ContainerClass);
        };

        var loadPrivate = function () {
            _this.LoadingLock = true;
            var promise = _this.renderPromise();
            return promise.then(function () {
                _this.Loaded = true;
                _this.LoadingLock = false;

                _this.onLoad();

                return $.when();
            });
        };

        _this.Load = function () {
            if (_this.LoadingLock || _this.Loaded) {
                return $.when();
            }

            var promise = loadPrivate();
            return promise;
        };

        _this.Render = function () {
            if (_this.LoadingLock) {
                return $.when();
            }

            var renderPromise = _this.Load().then(_this.renderPrivate);
            return renderPromise;
        };

        _this.appendContainer = function () {
            _this.appendContainerPrivate();
        };
        
        _this.appendContainerPrivate = function () {
            var sections = _this.ContainerBody.find('div[fxs_section]');
            var result = null;
            sections.sort(function (a, b) {
                return $(a).attr('fxs_it_position') - $(b).attr('fxs_it_position');
            });
            sections.each(function (i, item) {
                if ($(item).attr('fxs_it_position') > _this.PositionInRenderizableListItems) {
                    result = item;
                    return false;
                }
            });

            if (result) {
                _this.ContainerItem.insertBefore(result);
            } else {
                _this.ContainerBody.append(_this.ContainerItem);
            }
            _this.LoadInternalWidgets();
        };

        function setSticky() {
            var stickyManager = FXStreet.Class.Patterns.Singleton.StickyManager.Instance();
            var elementsToStick = _this.ContainerItem.find(stickyManager.StickyItemsClass);
            var stickHolder = _this.ContainerItem.find(stickyManager.StickyContentSelector);
            stickyManager.setSticky(elementsToStick, stickHolder);
        }

        _this.onShow = function () {
            setSticky();
        };

        _this.onLoad = function () { };

        _this.renderPrivate = function () {
            if (!_this.IsRenderByUser) {
                return _this.renderByScroll();
            }

            _this.IsRenderByUser = false;
            return _this.renderByUser();
        };

        _this.renderByScroll = function () {
            if (_this.Visible) {
                return $.when();
            }
            if (!_this.Rendered) {
                _this.ContainerItem.hide();
                _this.appendContainer();
                _this.Rendered = true;
            }

            var dfd = new $.Deferred();
            _this.ContainerItem.show({
                duration: 0, done: function () {
                    _this.onShow();
                    _this.Visible = true;
                    dfd.resolve();
                }
            });
            return dfd.promise();
        };

        _this.renderByUser = function () {
            _this.appendContainer();
            _this.ContainerItem.show({
                duration: 0,
                done: function () {
                    _this.onShow();
                }
            });
            _this.Rendered = true;
            _this.Visible = true;
        };

        _this.resetBody = function () {
            FXStreet.Class.Sidebar.Util.RenderizableListItems.forEach(function (item) {
                item.RenderedItemInPage.setRendered(false);
                item.RenderedItemInPage.setVisible(false);
            });
            _this.ContainerBody.empty();
        };

        _this.renderPromise = function () {
            console.error('renderPromise() is not implemented');
        };

        _this.setOnParent = function (property, value) {
            _this[property] = value;
        };

        // Necesitamos estas funciones ya que sinó al asignar des de un hijo, el set settea en el hijo, ignorando el padre
        _this.setPositionInRenderizableListItems = function (position) {
            _this.PositionInRenderizableListItems = position;
            _this.ContainerItem.attr('fxs_it_position', position);
        };

        _this.setVisible = function (value) {
            _this.Visible = value;
            if (value === false) {
                _this.UnLoadInternalWidgets();
            }
        };

        _this.setContainerItem = function (value) {
            _this.ContainerItem = value;
        };

        _this.setAsVisible = function () {
            _this.Loaded = true;
            _this.Rendered = true;
            _this.Visible = true;
        };

        _this.setRendered = function (value) {
            _this.Rendered = value;
        };

        _this.IsVisible = function () {
            return _this.Visible;
        };

        _this.IncreasePosition = function (increase) {
            _this.PositionInRenderizableListItems += increase;
            _this.ContainerItem.attr('fxs_it_position', _this.PositionInRenderizableListItems);
        };

        _this.getJsonForRenderHtml = function () {
            var json = {
                Value: _this.HtmlTemplateData,
                Translations: jQuery.extend(true, {}, FXStreet.Resource.Translations['Sidebar_FilterAndList']),
                UserInfo: {
                    IsLogged: jQuery.extend(true, {}, FXStreet.Resource.UserInfo.IsLogged),
                    IsPremium: jQuery.extend(true, {}, FXStreet.Resource.UserInfo.IsPremium)
                }
            };
            return json;
        };

        _this.setHtmlTemplateData = function (jsonData) {
            _this.HtmlTemplateData = jsonData;
            if (typeof _this.SetHtmlTemplateDataCallback === 'function') {
                _this.SetHtmlTemplateDataCallback(_this.HtmlTemplateData);
            }
        };

        _this.setRenderByUser = function (value) {
            _this.IsRenderByUser = value;
        };

        _this.LoadInternalWidgets = function () {
            if (_this.InternalWidgetsLoaded === false) {
                _this.InternalWidgetsLoaded = true;
                _this.privateLoadInternalWidgets();
            }
        };

        _this.privateLoadInternalWidgets = function () { };

        _this.UnLoadInternalWidgets = function () {
            if (_this.InternalWidgetsLoaded === true) {
                _this.InternalWidgetsLoaded = false;
                _this.privateUnLoadInternalWidgets();
            }
        };

        _this.privateUnLoadInternalWidgets = function () { };

        return _this;
    };
    FXStreet.Class.Sidebar.RenderedItemInPage.BaseScrollable = function () {
        var parent = FXStreet.Class.Sidebar.RenderedItemInPage.Base(),
         _this = FXStreet.Util.extendObject(parent);

        _this.InfiniteScrollPageObj = null;

        _this.init = function (json) {
            parent.init(json);
            _this.setSettingsByObject(json);
            _this.setVars();
        };

        _this.setVars = function () {
            _this.InfiniteScrollPageObj = FXStreet.Util.getObjectInstance("InfiniteScrollPage");
        };

        _this.moveScrollAtTop = function () {
            _this.InfiniteScrollPageObj.moveToPosition(1);
        };

        _this.positionateScrollWhenGoUp = function () {
            var height = _this.ContainerItem.outerHeight();
            var containerOffSet = _this.ContainerBody.offset().top;
            var position = height - containerOffSet;
            if (position < 1) {
                position = 1;
            }
            _this.InfiniteScrollPageObj.moveToPosition(position);
        };

        var parentSetRenderByUser = parent.setRenderByUser;
        parent.setRenderByUser = function (value) {
            parentSetRenderByUser(value);
            _this.InfiniteScrollPageObj.setAvoidScroll(true);
            _this.moveScrollAtTop();
        };

        var parentResetBody = parent.resetBody;
        _this.resetBody = function () {
            parentResetBody();
            _this.moveScrollAtTop();
        };

        var parentOnShow = parent.onShow;
        _this.setOnParent('onShow', function () {
            if (_this.InfiniteScrollPageObj.MoveUpDirection && !_this.InfiniteScrollPageObj.AvoidScroll) {
                _this.positionateScrollWhenGoUp();
            }
            parentOnShow();
        });

        return _this;
    }

    FXStreet.Class.Sidebar.RenderedItemInPage.PostBaseItem = function (scrollable) {
        var parent = scrollable ? FXStreet.Class.Sidebar.RenderedItemInPage.BaseScrollable() : FXStreet.Class.Sidebar.RenderedItemInPage.Base(),
         _this = FXStreet.Util.extendObject(parent);

        _this.Id = ""; //PostId
        _this.HtmlTemplateFile = "";
        _this.RelatedContentUrl = "";
        _this.GetPostByUrlApi = "";
        _this.SocialMediaType = function () {
            console.error('Render promise is not implemented');
        };

        parent.ContainerClass = 'fxs_page_news';

        _this.init = function (json) {
            parent.init(json);
            _this.setSettingsByObject(json);
            _this.CreateContainer();
        };

        var parentCreateContainerParent = parent.CreateContainer;
        parent.CreateContainer = function () {
            var article = $("#fxs_content section[fxs-it-id='" + _this.Id + "']");
            if (article && article.length > 0) {
                _this.setOnParent('ContainerItem', article.parent());
                _this.setAsVisible();
                _this.LoadInternalWidgets();
                _this.onShow();
            }
            else {
                parentCreateContainerParent();
            }
        };

        var getOrLoadJsonForRenderHtmlPromise = function () {
            if (_this.HtmlTemplateData.IsPushNotifed) {
                return $.get(_this.GetPostByUrlApi, { culture: FXStreet.Resource.CultureName, url: _this.HtmlTemplateData.Url })
                    .then(function (postResponse) {
                        _this.setHtmlTemplateData(postResponse);
                        return _this.getJsonForRenderHtml();
                    });
            } else {
                return $.when().then(function () {
                    return _this.getJsonForRenderHtml();
                });
            }
        };

        _this.setOnParent('renderPromise', function () {
            return $.when(FXStreet.Util.loadHtmlTemplate(_this.HtmlTemplateFile), getOrLoadJsonForRenderHtmlPromise())
                .done(function (template, json) {
                    _this.renderHtml(template, json);
                });
        });

        _this.renderHtml = function (template, json) {
            var rendered = FXStreet.Util.renderByHtmlTemplate(template, json);
            _this.ContainerItem.append(rendered);
        };

        var parentOnShow = parent.onShow;
        _this.setOnParent('onShow', function () {
            parentOnShow();
            var jsonAds = _this.getJsonAds();
            if (jsonAds) {
                jsonAds.forEach(function (item) {
                    var selector = "#" + item.ContainerId;
                    if ($(selector).length > 0) {
                        var ads = new FXStreet.Class.AdvertiseNormal();
                        ads.init(item);
                    }
                });
            } else {
                console.warn('The jsonAds are not defined');
            }
        });

        parent.appendContainer = function () {
            _this.appendContainerPrivate();
            _this.LoadInternalWidgets();
        };
        
        var parentPrivateLoadInternalWidgets = parent.privateLoadInternalWidgets;
        _this.setOnParent('privateLoadInternalWidgets', function () {
            parentPrivateLoadInternalWidgets();
            if (_this.RelatedContentUrl !== "") {
                var categoriesIds = [];
                if (_this.HtmlTemplateData.Categories !== undefined
                    && _this.HtmlTemplateData.Categories !== null) {
                    for (var i = 0; i < _this.HtmlTemplateData.Categories.length; i++) {
                        categoriesIds.push(_this.HtmlTemplateData.Categories[i].Id);
                    }
                }
                var jsonRelatedPosts = {
                    "ContainerId": "fxs_article_related_" + _this.Id,
                    "ContentId": _this.Id,
                    "RelatedPosts": _this.HtmlTemplateData.RelatedPosts
                };
                var relatedPosts = new FXStreet.Class.RelatedPostsByCategories();
                relatedPosts.init(jsonRelatedPosts);
            }
            var jsonSocialMediaBar = {
                "ContainerId": "fxs_socialmedia_bar_" + _this.Id,
                "ItemUrl": _this.HtmlTemplateData.SEO !== undefined ? _this.HtmlTemplateData.SEO.FullUrl : _this.HtmlTemplateData.Seo.FullUrl,
                "ItemTitle": _this.HtmlTemplateData.Title
            };

            if (_this.SocialMediaType() !== null) {
                var socialMediaBar = new _this.SocialMediaType();
                socialMediaBar.init(jsonSocialMediaBar);
            }
        });

        _this.getJsonAds = function () { };

        _this.initAuthorFollow = function () {
            var authorData = _this.HtmlTemplateData.Author;
            if (authorData == null) {
                return;
            }
            var json = {
                UserInfo: FXStreet.Resource.UserInfo,
                Author: authorData,
                FollowButtonId: "fxs_cta_authorfollow_" + _this.Id,
                FollowingMessageBoxId: "fxs_alert_author_follow",
                UnFollowingMessageBoxId: "fxs_alert_author_unfollow"
            }
            var authorFollow = new FXStreet.Class.AuthorFollow();
            authorFollow.init(json);
        };

        return _this;
    };

    FXStreet.Class.Sidebar.RenderedItemInPage.PieceOfNews = function () {
        var parent = FXStreet.Class.Sidebar.RenderedItemInPage.PostBaseItem(true),
         _this = FXStreet.Util.extendObject(parent);


        parent.SocialMediaType = function () {
            return FXStreet.Class.SocialMediaBarDefault();
        }

        parent.HtmlTemplateFile = "newsdetails_default.html";
        parent.RelatedContentUrl = FXStreet.Resource.FxsApiRoutes["NewsItemGetRelated"];
        parent.GetPostByUrlApi = FXStreet.Resource.FxsApiRoutes["NewsItemGetItemByUrl"];
        parent.getJsonAds = function () {
            var result = [];
            result.push({
                "ContainerId": "fxs_leaderboard_ad_" + parent.Id,
                "SlotName": "/7138/FXS30/News",
                "AdvertiseType": "normal",
                "RefreshSeconds": 0,
                "MobileSize": "[320, 50]",
                "TabletSize": "[728, 90]",
                "DesktopSize": "[728, 90]",
                "DesktopHdSize": "[728, 90]",
                "Labels": [
                    {
                        'Key': 'ros',
                        'Value': ['leader']
                    }
                ]
            });
            result.push({
                "ContainerId": "fxs_article_ad_" + parent.Id,
                "SlotName": "/7138/FXS30/News",
                "AdvertiseType": "normal",
                "RefreshSeconds": 0,
                "MobileSize": "[250, 250]",
                "TabletSize": "[250, 250]",
                "DesktopSize": "[300, 250]",
                "DesktopHdSize": "[300, 250]",
                "Labels": [
                    {
                        'Key': 'ros',
                        'Value': ['horizontal']
                    }
                ]
            });
            return result;
        };

        var parentPrivateLoadInternalWidgets = parent.privateLoadInternalWidgets;
        _this.setOnParent('privateLoadInternalWidgets', function ()
        {
            parentPrivateLoadInternalWidgets();
            var cagContainerId = "fxs_cag_widget_" + parent.Id;
            var cagContainer = FXStreet.Util.getjQueryObjectById(cagContainerId, false);

            if (((cagContainer) && (cagContainer.length > 0)) && (parent.HtmlTemplateData.CagAsset)) {

                var cagApiGetModel = FXStreet.Resource.FxsApiRoutes["CagApiGetModel"];
                $.get(cagApiGetModel + "?assetId=" + parent.HtmlTemplateData.CagAsset)
                         .then(function (data) {
                             var chartUrl = data.BigChartUrl.toLowerCase();
                             var jsonCagWidget = {
                                 'JsCreateEvent': "load",
                                 'JsName': "Cag",
                                 'MarketToolsWebApiBaseUrl': data.MarketToolsWebApiBaseUrl,
                                 'Asset': data.Asset,
                                 'BigChartUrl': chartUrl,
                                 'ContainerId': "fxs_cag_widget_" + _this.Id,
                                 'DecimalPlaces': data.DecimalPlaces,
                                 'PairName': data.PairName,
                                 'PriceProviderCode': data.PriceProviderCode,
                                 'Translations': data.Translations,
                                 'AssetUrl': data.AssetUrl
                             };
                             _this.CagWidgetManagerObj = new FXStreet.Class.Cag();
                             _this.CagWidgetManagerObj.init(jsonCagWidget);
                         });
            }
        });
        return _this;
    };
    FXStreet.Class.Sidebar.RenderedItemInPage.AnalysisItem = function () {
        var parent = FXStreet.Class.Sidebar.RenderedItemInPage.PostBaseItem(true),
         _this = FXStreet.Util.extendObject(parent);

        var parentOnShow = parent.onShow;
        _this.setOnParent('onShow', function () {
            parentOnShow();
            parent.initAuthorFollow();
        });      
       
        parent.SocialMediaType = function () {
            return FXStreet.Class.SocialMediaBarDefault();
        }

        parent.HtmlTemplateFile = "analysisItemdetails_default.html";
        parent.RelatedContentUrl = FXStreet.Resource.FxsApiRoutes["AnalysisItemGetRelated"];
        parent.GetPostByUrlApi = FXStreet.Resource.FxsApiRoutes["AnalysisItemGetItemByUrl"];
        parent.getJsonAds = function () {
            var result = [];
            result.push({
                "ContainerId": "fxs_leaderboard_ad_" + parent.Id,
                "SlotName": "/7138/FXS30/Analysis",
                "AdvertiseType": "normal",
                "RefreshSeconds": 0,
                "MobileSize": "[320, 50]",
                "TabletSize": "[728, 90]",
                "DesktopSize": "[728, 90]",
                "DesktopHdSize": "[728, 90]",
                "Labels": [
                    {
                        'Key': 'ros',
                        'Value': ['leader']
                    }
                ]
            });
            result.push({
                "ContainerId": "fxs_article_ad_" + parent.Id,
                "SlotName": "/7138/FXS30/Analysis",
                "AdvertiseType": "normal",
                "RefreshSeconds": 0,
                "MobileSize": "[250, 250]",
                "TabletSize": "[250, 250]",
                "DesktopSize": "[300, 250]",
                "DesktopHdSize": "[300, 250]",
                "Labels": [
                    {
                        'Key': 'ros',
                        'Value': ['horizontal']
                    }
                ]
            });
            return result;
        };
        return _this;
    };
    FXStreet.Class.Sidebar.RenderedItemInPage.EducationItem = function () {
        var parent = FXStreet.Class.Sidebar.RenderedItemInPage.PostBaseItem(true),
         _this = FXStreet.Util.extendObject(parent);

        var parentOnShow = parent.onShow;
        _this.setOnParent('onShow', function () {
            parentOnShow();
            parent.initAuthorFollow();
        });

        parent.SocialMediaType = function () {
            return FXStreet.Class.SocialMediaBarDefault();
        }

        parent.HtmlTemplateFile = "educationItemdetails_default.html";
        parent.RelatedContentUrl = FXStreet.Resource.FxsApiRoutes["EducationItemGetRelated"];
        parent.GetPostByUrlApi = FXStreet.Resource.FxsApiRoutes["EducationItemGetItemByUrl"];
        parent.getJsonAds = function () {
            var result = [];
            result.push({
                "ContainerId": "fxs_leaderboard_ad_" + parent.Id,
                "SlotName": "/7138/FXS30/Education",
                "AdvertiseType": "normal",
                "RefreshSeconds": 0,
                "MobileSize": "[320, 50]",
                "TabletSize": "[728, 90]",
                "DesktopSize": "[728, 90]",
                "DesktopHdSize": "[728, 90]",
                "Labels": [
                    {
                        'Key': 'ros',
                        'Value': ['leader']
                    }
                ]
            });
            result.push({
                "ContainerId": "fxs_article_ad_" + parent.Id,
                "SlotName": "/7138/FXS30/Education",
                "AdvertiseType": "normal",
                "RefreshSeconds": 0,
                "MobileSize": "[250, 250]",
                "TabletSize": "[250, 250]",
                "DesktopSize": "[300, 250]",
                "DesktopHdSize": "[300, 250]",
                "Labels": [
                    {
                        'Key': 'ros',
                        'Value': ['horizontal']
                    }
                ]
            });
            return result;
        };
        return _this;
    };
    FXStreet.Class.Sidebar.RenderedItemInPage.AjaxPage = function () {
        var parent = FXStreet.Class.Sidebar.RenderedItemInPage.Base(),
         _this = FXStreet.Util.extendObject(parent);

        _this.Url = "";
        _this.CookieInfo = null;

        _this.HomeMetaTagsObj = null;

        _this.init = function (json) {
            parent.init(json);
            _this.setSettingsByObject(json);
            _this.CreateContainer();
        };

        var parentCreateContainer = parent.CreateContainer;
        _this.CreateContainer = function () {
            parentCreateContainer();
            _this.ContainerItem.attr('id', 'fxs_home');
        };

        _this.setOnParent('renderPromise', function () {
            return $.ajax({ url: _this.Url }).done(_this.renderSuccess);
        });

        _this.renderSuccess = function (data) {
            var html = _this.getHtmlBody(data);
            _this.ContainerItem.html(html);

            var metaTags = parseStringToFindMetaTags(data);
            _this.HomeMetaTagsObj = FXStreet.Class.Patterns.Singleton.SeoMetaTags.Instance();
            _this.HomeMetaTagsObj.initHomeMetaTagsObject(metaTags);
        };

        _this.getHtmlBody = function (data) {
            var html = $(data).find('#fxs_home').html();
            return html;
        };

        var parseStringToFindMetaTags = function (data) {
            var result = {};
            var regexp =
                /<meta[ \t\r\n]+property="og:([a-z0-9:\/._ \-\t\n\r]*)"[ \r\n]+content="([a-z0-9:\/._ \-\t\n\r]+( [a-z0-9:\/._ \-\t\n\r]+)*)"[ \r\n]+\/>/gi;

            var match = regexp.exec(data);
            while (match != null) {
                var property = match[1];
                var content = match[2];

                if (property === "url") {
                    result.FullUrl = content;
                } else if (property === "image") {
                    result.Image = content;
                } else if (property === "title") {
                    result.MetaTitle = content;
                } else if (property === "description") {
                    result.Summary = content;
                } else if (property === "keywords") {
                    result.Keywords = content;
                }

                match = regexp.exec(data);
            }

            return result;
        };

        var parentOnShow = parent.onShow;
        _this.setOnParent('onShow', function () {
            parentOnShow();

            try {
                FXStreetWidgets.Deferred.deferredLoad(_this.ContainerItem);
            } catch (e) {
                console.error("FXStreetWidgets not initialize");
            }

            FXStreet.Util.initObjects('all');
            FXStreet.Util.registerDynamicObjs(_this.ContainerItem);
            if (_this.CookieInfo && _this.CookieInfo.CookieKey) {
                var cacheExpirationInDays = (3 / 24);
                if (_this.CookieInfo.RefreshTimeInDays && _this.CookieInfo.RefreshTimeInDays > 0) {
                    cacheExpirationInDays = _this.CookieInfo.RefreshTimeInDays;
                }
                $.cookie(_this.CookieInfo.CookieKey, true, { expires: cacheExpirationInDays });
            }
        });

        return _this;
    };
    FXStreet.Class.Sidebar.RenderedItemInPage.TransitionDetail = function () {

        var parent = FXStreet.Class.Sidebar.RenderedItemInPage.BaseScrollable(),
        _this = FXStreet.Util.extendObject(parent);

        _this.Id = "";
        _this.Content = "";

        _this.init = function (json) {
            parent.init(json);
            _this.setSettingsByObject(json);
            _this.CreateContainer();
        };

        _this.setOnParent('renderPromise', function () {
            _this.ContainerItem.html($('<section>' + _this.Content + '</section>'));
            return $.when();
        });

        var parentOnShow = parent.onShow;
        _this.setOnParent('onShow', function () {
            parentOnShow();
            FXStreet.Util.registerDynamicObjs(_this.ContainerItem);
        });

        return _this;
    };
    FXStreet.Class.Sidebar.RenderedItemInPage.RatesAndChartsItem = function () {
        var parent = FXStreet.Class.Sidebar.RenderedItemInPage.PostBaseItem(),
        _this = FXStreet.Util.extendObject(parent);

        _this.RateManagerObj = null;
        parent.HtmlTemplateFile = "ratesandchartsdetails_default.html";

        _this.SingleChartManagerObj = null;
        _this.CagWidgetManagerObj = null;

        _this.init = function (json) {
            parent.init(json);
            _this.setSettingsByObject(json);
        };

        _this.createRateManager = function () {
            _this.RateManagerObj = new FXStreet.Class.SingleRateManager();
            _this.RateManagerObj.init({
                "ContainerId": "fxs_ratedata_" + _this.HtmlTemplateData.Id,
                "HtmlTemplateFile": "ratesandcharts_header.html",
                "Data": _this.getJsonForRenderHtml()
            });
        };

        parent.SocialMediaType = function () {
            return null;
        };

        var parentOnShow = parent.onShow;
        _this.setOnParent('onShow', function () {
            parentOnShow();
            _this.createRateManager();
            try
            {
                FXStreetWidgets.Deferred.deferredLoad(_this.ContainerItem);
            } catch (e) {
                
            }
            _this.Subscribe();
            _this.Refresh();
        });

        var parentPrivateLoadInternalWidgets = parent.privateLoadInternalWidgets;

        _this.setOnParent('privateLoadInternalWidgets', function ()
        {
            parentPrivateLoadInternalWidgets();

            var chartUrl = parent.HtmlTemplateData.BigChartUrl.toLowerCase();
            var cagContainer = FXStreet.Util.getjQueryObjectById("fxs_cag_widget_" + _this.Id, false);
            if ((cagContainer) &&(cagContainer.length > 0)) {

                var cagContainerId = "fxs_cag_widget_" + _this.Id;
                var jsonCagWidget =
                {
                    'JsCreateEvent': "load",
                    'JsName': "Cag",
                    'MarketToolsWebApiBaseUrl': parent.HtmlTemplateData.MarketToolsWebApiBaseUrl,
                    'Asset': parent.HtmlTemplateData.Id,
                    'BigChartUrl': chartUrl,
                    'ContainerId': cagContainerId,
                    'DecimalPlaces': parent.HtmlTemplateData.DecimalPlaces,
                    'PairName': parent.HtmlTemplateData.Title,
                    'PriceProviderCode':  parent.HtmlTemplateData.PriceProviderCode,
                    'Translations': parent.HtmlTemplateData.Translations
                };

                  _this.CagWidgetManagerObj = new FXStreet.Class.Cag();
                  _this.CagWidgetManagerObj.init(jsonCagWidget);
            }else{
                var chartContainer = FXStreet.Util.getjQueryObjectById("fxs_chartdata_default_" + _this.Id, false);
                if (chartContainer.length > 0) {
                    var widgetType = "fxs_widget_default";
                    var jsonChartWidget = {
                        'ContainerId': chartContainer[0].id,
                        'PairName': parent.HtmlTemplateData.Title,
                        'PriceProviderCode': parent.HtmlTemplateData.PriceProviderCode,
                        'WidgetType': widgetType,
                        'BigChartUrl': chartUrl,
                        'DisplayRSI': false,
                        'DisplaySMA': true,
                        'DisplayBigChartUrl': true,
                        'TouchAvailable': false,
                        'ExternalUrl': chartUrl
                    };
                  _this.SingleChartManagerObj = new FXStreet.Class.SingleChartManager();
                  _this.SingleChartManagerObj.init(jsonChartWidget);
                }
            }

            var jsonSocialMediaObj = new FXStreet.Class.SocialMediaBarBoxed();
            jsonSocialMediaObj.init({
                'ContainerId': 'fxs_socialmedia_bar_header_' + _this.HtmlTemplateData.Id,
                'PageUrl': _this.HtmlTemplateData.SEO !== undefined ? _this.HtmlTemplateData.SEO.FullUrl : "",
                'ItemTitle': _this.HtmlTemplateData.SEO !== undefined ? _this.HtmlTemplateData.SEO.MetaTitle : ""
            });
            if (_this.HtmlTemplateData.TagId) {
                var relatedNewsMediaObj = new FXStreet.Class.NewsList();
                relatedNewsMediaObj.init({
                    'ContainerId': 'fxs_related_news_' + _this.HtmlTemplateData.Id,
                    'Category': _this.HtmlTemplateData.TagId,
                    'Take': 5
                });

                var relatedAnalysisMediaObj = new FXStreet.Class.AnalysisList();
                relatedAnalysisMediaObj.init({
                    'ContainerId': 'fxs_related_analysis_' + _this.HtmlTemplateData.Id,
                    'Category': _this.HtmlTemplateData.TagId,
                    'Take': 5
                });
            }
            jsonSpreads().done(function (data) {
                var brokerSpreadsObj = new FXStreet.Class.BrokersSpreads();
                brokerSpreadsObj.init({
                    'ContainerId': 'fxs_brokerspreads_' + _this.HtmlTemplateData.Id,
                    'HtmlTemplateFile': 'brokersspreads_big.html',
                    'Brokers': data.Brokers,
                    'Pairs': data.Pairs
                });
            });
        });

        _this.setOnParent('privateUnLoadInternalWidgets', function () {
            _this.Unsubscribe();
        });

        var jsonSpreads = function () {
            var data = {
                "culture": FXStreet.Resource.CultureName,
                "pairs": 'fxs-3212164,fxs-3212166,fxs-3212155,fxs-3212172,fxs-3212322',
                "take": 5
            };

            return $.ajax({
                type: "GET",
                url: FXStreet.Resource.FxsApiRoutes["BrokersSpreadsRandom"],
                data: data,
                contentType: "application/json; charset=utf-8",
                dataType: "json"
            });
        }
        parent.getJsonAds = function () {
            var result = [];
            result.push({
                "ContainerId": "fxs_leaderboard_ad_" + parent.Id,
                "SlotName": "/7138/FXS30/Rates_Charts",
                "AdvertiseType": "normal",
                "RefreshSeconds": 0,
                "MobileSize": "[320, 50]",
                "TabletSize": "[728, 90]",
                "DesktopSize": "[728, 90]",
                "DesktopHdSize": "[728, 90]",
                "Labels": [
                    {
                        'Key': 'ros',
                        'Value': ['leader']
                    }
                ]
            });
            result.push({
                "ContainerId": "fxs_ad_" + parent.Id,
                "SlotName": "/7138/FXS30/Rates_Charts",
                "AdvertiseType": "normal",
                "RefreshSeconds": 0,
                "MobileSize": "[250, 250]",
                "TabletSize": "[250, 250]",
                "DesktopSize": "[300, 250]",
                "DesktopHdSize": "[300, 250]",
                "Labels": [
                    {
                        'Key': 'ros',
                        'Value': ['horizontal']
                    }
                ]
            });
            result.push({
                "ContainerId": "fxs_ad_2_" + parent.Id,
                "SlotName": "/7138/FXS30/Rates_Charts",
                "AdvertiseType": "normal",
                "RefreshSeconds": 0,
                "MobileSize": "[250, 250]",
                "TabletSize": "[250, 250]",
                "DesktopSize": "[300, 250]",
                "DesktopHdSize": "[300, 250]",
                "Labels": [
                    {
                        'Key': 'ros',
                        'Value': ['horizontal']
                    }
                ]
            });
            result.push({
                "ContainerId": "fxs_starttrading_ad_" + parent.Id,
                "SlotName": "/7138/FXS30/Rates_Charts",
                "AdvertiseType": "normal",
                "RefreshSeconds": 0,
                "MobileSize": "[200, 28]",
                "TabletSize": "[200, 28]",
                "DesktopSize": "[200, 28]",
                "DesktopHdSize": "[200, 28]"
            });
            return result;
        };

        _this.Subscribe = function () {
            _this.RateManagerObj.Subscribe();
        };

        _this.Unsubscribe = function () {
            if (_this.SingleChartManagerObj) {
                _this.SingleChartManagerObj.display(false);
            }
            if (_this.RateManagerObj) {
                _this.RateManagerObj.Unsubscribe();
            }
        };

        _this.Refresh = function () {
            FXStreet.Util.SetTooltip();
        };

        var parentGetJsonForRenderHtml = parent.getJsonForRenderHtml;
        _this.setOnParent('getJsonForRenderHtml', function () {
            var jsonData = parentGetJsonForRenderHtml();

            jsonData.Translations.RelatedNewsTitle = jsonData.Translations.RelatedNewsTitle.replace(/\{0\}/g, _this.HtmlTemplateData.Title);
            jsonData.Translations.RelatedAnalysisTitle = jsonData.Translations.RelatedAnalysisTitle.replace(/\{0\}/g, _this.HtmlTemplateData.Title);

            return jsonData;
        });

        return _this;
    };
    FXStreet.Class.Sidebar.RenderedItemInPage.VideoItem = function () {
        var parent = FXStreet.Class.Sidebar.RenderedItemInPage.PostBaseItem(true),
         _this = FXStreet.Util.extendObject(parent);

        _this.Video = null;
        _this.Title = "";

        parent.HtmlTemplateFile = "videoItemdetails_default.html";
        parent.RelatedContentUrl = FXStreet.Resource.FxsApiRoutes["VideoItemGetRelated"];
        parent.GetPostByUrlApi = FXStreet.Resource.FxsApiRoutes["VideosGetItemByUrl"];
        _this.HtmlTemplateFilePriceTable = "price_table.html";

        var googleDriveManager = {};
        var marketingLeadsManagerManager = {};

        var ctaRegister = null;
        var showVideoCurtain = null;
        var videoContainer = null;

        _this.init = function (json) {
            parent.init(json);
            _this.setSettingsByObject(json);
            _this.setVars();
            _this.addEvents();
        };

        _this.setVars = function() {
            googleDriveManager = FXStreet.Util.getObjectInstance("GoogleDriveManager");
            marketingLeadsManagerManager = FXStreet.Util.getObjectInstance("MarketingLeadsManager");
        };

        _this.addEvents = function () {
            setRegisterEvents();
            setCurtainEvents();
        };

        var setRegisterEvents = function () {
            var userMenu = FXStreet.Util.getObjectInstance("UserMenu");
            if (userMenu == null) {
                return;
            }
            var ctaRegisterId = "fxs_cta_register_" + _this.Id;

            if (ctaRegister === null) {
                ctaRegister = FXStreet.Util.getjQueryObjectById(ctaRegisterId, true, false);
                if (ctaRegister != null && ctaRegister.length > 0) {
                    ctaRegister.click(function () { userMenu.Login() });
                }
            }
        };

        var setCurtainEvents = function () {
            if (_this.Video !== null && _this.Video.RegistrationRequired) {
                var showVideoCurtainId = "fxs_live_video_show_" + _this.Id;
                var showVideoButtonId = "fxs_cta_show_video_" + _this.Id;
                var videoContainerId = "fxs_live_video_container_" + _this.Id;

                showVideoCurtain = FXStreet.Util.getjQueryObjectById(showVideoCurtainId, false);
                videoContainer = FXStreet.Util.getjQueryObjectById(videoContainerId, false);
                var showVideoButton = FXStreet.Util.getjQueryObjectById(showVideoButtonId, false);

                showVideoButton.on("click", onShowVideoClick);
            }
        };

        //_this.createPlayer = function() {
        //    if (typeof YT !== "undefined" && typeof onYouTubeIframeAPIReady !== "undefined") {
        //        onYouTubeIframeAPIReady();
        //    }
        //};

        var parentOnShow = parent.onShow;
        parent.setOnParent('onShow', function () {
            parentOnShow();
            parent.initAuthorFollow();
            try {
                FXStreetWidgets.Deferred.deferredLoad(_this.ContainerItem);
            } catch (e) {
                //console.error("FXStreetWidgets not initialize");
            }

            _this.addEvents();
            //_this.createPlayer();
        });

        var onShowVideoClick = function () {
            showVideoCurtain.addClass("fxs_hideElements");
            videoContainer.removeClass("fxs_hideElements");
            sendPlayEvent();
        };

        var sendPlayEvent = function () {
            var event = {
                Title: _this.Title,
                Origin: "live-video",
                Contact: true
            };
            googleDriveManager.SavePlayEvent(event, pushSuccess);
            marketingLeadsManagerManager.SavePlayEvent(event, pushSuccess);
        };

        var pushSuccess = function() {
        };

        parent.SocialMediaType = function () {
            return FXStreet.Class.SocialMediaBarDefault();
        };

        parent.renderHtml = function (template, json) {
            var rendered = FXStreet.Util.renderByHtmlTemplate(template, json);
            _this.ContainerItem.append(rendered);

            if (json.Value.Video.PremiumView) {
                json.Subscription = json.Value.Video.Subscription;
                FXStreet.Util.loadHtmlTemplate(_this.HtmlTemplateFilePriceTable).done(function (templatePriceTable) {
                    var renderedPriceTable = FXStreet.Util.renderByHtmlTemplate(templatePriceTable, json);
                    _this.ContainerItem.find('.fxs_row').html(renderedPriceTable);
                });
            }
        };

        parent.getJsonAds = function () {
            var result = [];
            result.push({
                "ContainerId": "fxs_leaderboard_ad_" + parent.Id,
                "SlotName": "/7138/FXS30/LiveVideo",
                "AdvertiseType": "normal",
                "RefreshSeconds": 0,
                "MobileSize": "[320, 50]",
                "TabletSize": "[728, 90]",
                "DesktopSize": "[728, 90]",
                "DesktopHdSize": "[728, 90]",
                "Labels": [
                    {
                        'Key': 'ros',
                        'Value': ['leader']
                    }
                ]
            });
            result.push({
                "ContainerId": "fxs_article_ad_" + parent.Id,
                "SlotName": "/7138/FXS30/LiveVideo",
                "AdvertiseType": "normal",
                "RefreshSeconds": 0,
                "MobileSize": "[250, 250]",
                "TabletSize": "[250, 250]",
                "DesktopSize": "[300, 250]",
                "DesktopHdSize": "[300, 250]",
                "Labels": [
                    {
                        'Key': 'ros',
                        'Value': ['horizontal']
                    }
                ]
            });
            return result;
        };

        return _this;
    };
    FXStreet.Class.Sidebar.RenderedItemInPage.NoMoreContent = function () {
        var parent = FXStreet.Class.Sidebar.RenderedItemInPage.BaseScrollable(),
        _this = FXStreet.Util.extendObject(parent);

        _this.Id = "";
        _this.Content = "";

        _this.HtmlTemplateFile = "nomorecontentinpage.html";

        _this.init = function (json) {
            parent.init(json);
            _this.setSettingsByObject(json);
            _this.CreateContainer();
        };

        _this.setOnParent('renderPromise', function () {
            _this.ContainerItem.removeClass('fxs_detail');
            return FXStreet.Util.loadHtmlTemplate(_this.HtmlTemplateFile).done(function (template) {
                var rendered = FXStreet.Util.renderByHtmlTemplate(template, {
                    Translations: FXStreet.Resource.Translations['Sidebar_FilterAndList']
                });
                _this.ContainerItem.append(rendered);
            });
        });

        var parentOnShow = parent.onShow;
        _this.setOnParent('onShow', function () {
            parentOnShow();
            _this.ContainerItem.find('.fxs_feedbackLoading_msg').show();
            $('#pageLoading').hide();
        });

        return _this;
    };
}());