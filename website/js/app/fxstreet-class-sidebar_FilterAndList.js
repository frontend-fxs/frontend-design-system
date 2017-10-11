(function () {
    FXStreet.Class.Sidebar_FilterAndListFactory = function () {
        var parent = FXStreet.Class.Base(),
          _this = FXStreet.Util.extendObject(parent);

        _this.init = function (json) {
            var objectType = "Sidebar_FilterAndList" + json.ContentType;
            if (!FXStreet.Class[objectType]) {
                objectType = "Sidebar_FilterAndListBase";
            }
            FXStreet.Util.createObject(objectType, json);
        };

        return _this;
    };

    FXStreet.Class.Sidebar_FilterAndListBase = function () {
        var parent = FXStreet.Class.Base(),
           _this = FXStreet.Util.extendObject(parent);
        
        _this.ContainerItemsInPageId = "";
        _this.SidebarListJsonInitialization = {};
        _this.FilterJsonInitialization = {};
        _this.SeoAnalyticsJsonInitialization = {};
        _this.CurrentQueryStringValues = [];
        _this.ListDataServerResponse = [];
        _this.ContentType = "";
        _this.StickAdSidebar = '';

        _this.currentVisible = null;

        _this.Sidebar_FilterObj = null;
        _this.Sidebar_ListObj = null;
        _this.InfiniteScrollPageObj = null;
        _this.ContainerItemsInPage = null;
        _this.SeoAnalyticsObj = null;
        _this.PostNotificationsObj = null;
        _this.SoundObj = null;
        _this.TakeElements = {}

        _this.init = function (json) {
            _this.setSettingsByObject(json);
            _this.setVars();
            _this.addEvents();
            _this.fillSpace();
            _this.sendSeo();
        };

        _this.setVars = function () {
            _this.ContainerItemsInPage = FXStreet.Util.getjQueryObjectById(_this.ContainerItemsInPageId);
            _this.createSideBarList();
            _this.initSeoAnalytics();
            _this.createFilter();
            _this.initNotifications();
            _this.createInfiniteScrollPageObj();
            _this.currentVisible = _this.GetMostVisibleItem();
            _this.createStickAdObj();
            //_this.createSoundObj();
        };

        _this.createSoundObj = function () {
            _this.SoundObj = FXStreet.Util.getObjectInstance('Sound');
            if (_this.PostNotificationsObj && _this.SoundObj) {
                //_this.PostNotificationsObj.registerObserver(_this.SoundObj.playSound);
            }
        };

        _this.createStickAdObj = function () {
            if (_this.StickAdSidebar !== undefined && _this.StickAdSidebar !== '') {
                var ads = new FXStreet.Class.AdvertiseNormal();
                ads.init({
                    "ContainerId": _this.StickAdSidebar,
                    "SlotName": FXStreet.Resource.DfpSlots.SponsorBroker,
                    "AdvertiseType": "normal",
                    "RefreshSeconds": 0,
                    "MobileSize": "[320, 40]",
                    "TabletSize": "[320, 40]",
                    "DesktopSize": "[320, 40]",
                    "DesktopHdSize": "[320, 40]",
                    "Labels": [
                    {
                        'Key': 'pos',
                        'Value': 'sponsor'
                    }]
                });
            }
        };

        _this.initNotifications = function () {
            _this.PostNotificationsObj = FXStreet.Util.getObjectInstance('PostNotifications');
            if (_this.PostNotificationsObj) {
                _this.PostNotificationsObj.registerObserver(_this.Sidebar_FilterObj.newPostCreated);
            }
        };

        _this.fillSpace = function () {
            FXStreet.Util.fillPageSpace();
        };

        _this.sendSeo = function () {
            _this.SeoAnalyticsObj.SetAnalytics(_this.currentVisible);
        };

        _this.createInfiniteScrollPageObj = function() {
            _this.InfiniteScrollPageObj = FXStreet.Util.getObjectInstance('InfiniteScrollPage');
        };

        _this.createSideBarList = function () {
            if (FXStreet.Class.Sidebar.List[_this.ContentType]) {
                _this.Sidebar_ListObj = new FXStreet.Class.Sidebar.List[_this.ContentType]();
            }
            else {
                _this.Sidebar_ListObj = new FXStreet.Class.Sidebar.List.Base();
            }

            _this.SidebarListJsonInitialization.CurrentQueryStringValues = _this.CurrentQueryStringValues;
            _this.SidebarListJsonInitialization.ListDataServerResponse = _this.ListDataServerResponse;
            _this.SidebarListJsonInitialization.ContentType = _this.ContentType;
            _this.SidebarListJsonInitialization.TakeElements = _this.TakeElements;
            _this.SidebarListJsonInitialization.OnClickDelegate = _this.setCurrentVisible; // TODO: clean this!
            
            _this.Sidebar_ListObj.init(_this.SidebarListJsonInitialization);
        };

        _this.initSeoAnalytics = function () {
            _this.SeoAnalyticsJsonInitialization.Sidebar_ListObj = _this.Sidebar_ListObj;
            _this.SeoAnalyticsObj = new FXStreet.Class.Sidebar_SeoAnalytics();
            _this.SeoAnalyticsObj.init(_this.SeoAnalyticsJsonInitialization);
        };

        _this.createFilter = function () {
            if (FXStreet.Class.Sidebar.Filter[_this.ContentType]) {
                _this.Sidebar_FilterObj = new FXStreet.Class.Sidebar.Filter[_this.ContentType]();
            }
            else {
                _this.Sidebar_FilterObj = new FXStreet.Class.Sidebar.Filter();
            }
         
            _this.Sidebar_FilterObj.init(_this.getJsonFilter());
        };

        _this.addEvents = function () {
            if (_this.InfiniteScrollPageObj) {
                _this.InfiniteScrollPageObj.whenLoadContent(_this.scrollPageLoadFollowing);
                _this.InfiniteScrollPageObj.whenScroll(_this.scrollPageAction);
            }

            $(window).on("popstate", popState);
        };

        _this.getJsonFilter = function () {
            _this.FilterJsonInitialization.OptionSelectedDelegate = _this.filterChanged;
            _this.FilterJsonInitialization.NewItemCreatedDelegate = _this.newItemCreated;

            return _this.FilterJsonInitialization;
        };

        _this.filterChanged = function (optionSelected, valueSelected) {
            if (optionSelected) {
                if (_this.InfiniteScrollPageObj) {
                    _this.InfiniteScrollPageObj.setAvoidScroll(true);
                }

                _this.resetBody();

                _this.Sidebar_ListObj.clearListValues();
                var queryString = _this.CurrentQueryStringValues;
                queryString = $.grep(queryString, function (item) {
                    return item.Key.toLowerCase() !== 'page' && item.Key.toLowerCase() !== 'take';
                });
                if (_this.Sidebar_ListObj.InfiniteScroll) {
                    _this.Sidebar_ListObj.InfiniteScroll.NotMoreContent = false;
                }
                if (valueSelected !== null) {
                    queryString.push({
                        Key: optionSelected, Value: valueSelected
                    });
                }

                _this.Sidebar_ListObj.Render(queryString).done(function () {
                    _this.Sidebar_ListObj.AfterTypeheadChangedDelegate();
                    if (_this.InfiniteScrollPageObj) {
                        _this.InfiniteScrollPageObj.setAvoidScroll(false);
                    }
                });
            }
        };

        _this.resetBody = function () {
            var obj = FXStreet.Class.Sidebar.Util.RenderizableListItems[0];
            if (obj) {
                obj.RenderedItemInPage.resetBody();
            }
        };

        _this.newItemCreated = function (postsCreated) {
            _this.Sidebar_ListObj.LoadNewItemsCreated(postsCreated);
        };

        _this.scrollPageLoadFollowing = function () {
            if (_this.InfiniteScrollPageObj.MoveUpDirection) {
                _this.Sidebar_ListObj.loadPrevious();
            } else {
                _this.Sidebar_ListObj.loadNext();
            }
        };

        _this.GetMostVisibleItem = function () {
            var items = _this.ContainerItemsInPage.children('div[fxs_section]:visible');
            items.each(function (i, it) {
                it.visibleHeight = FXStreet.Util.VisibleHeight(it);
            });
            items = items.filter(function (i, it) {
                return it.visibleHeight > 0;
            });
            items.sort(function (a, b) {
                return b.visibleHeight - a.visibleHeight;
            });
            var result = items[0];
            return result;
        }

        _this.scrollPageAction = function () {
            var visibleItems = _this.ContainerItemsInPage.children('div[fxs_section]:visible');
            var firstVisibleItem = visibleItems[0];
            var lastVisibleItem = visibleItems[visibleItems.length - 1];

            var firstItem = FXStreet.Class.Sidebar.Util.RenderizableListItems[0];

            var mostVisibleItem = _this.GetMostVisibleItem();

            if (mostVisibleItem && _this.currentVisible !== mostVisibleItem) {
                _this.setCurrentVisible(mostVisibleItem, true);
            } else {
                var position;
                if (_this.InfiniteScrollPageObj.ScrollIsOnBottom() && !_this.Sidebar_ListObj.InfiniteScroll.endOfList) {
                    if (lastVisibleItem && !FXStreet.Class.Sidebar.Util.IsLastVisibleItem()) {
                        position = FXStreet.Util.getItemPosition(lastVisibleItem);
                        _this.Sidebar_ListObj.loadItems(position + 1);
                    } else {
                        _this.InfiniteScrollPageObj.endedList();
                    }
                } else if (_this.InfiniteScrollPageObj.ScrollIsOnTop() && mostVisibleItem !== firstItem && firstItem !== firstVisibleItem) {
                    position = FXStreet.Util.getItemPosition(firstVisibleItem);
                    _this.Sidebar_ListObj.loadItems(position - 1);
                }
            }
        };

        _this.setCurrentVisible = function (item, byScroll) {
            _this.currentVisible = item;
            _this.SeoAnalyticsObj.SetSeo(item);
            _this.SeoAnalyticsObj.SetAnalytics(item, byScroll);

            var position = FXStreet.Util.getItemPosition(item);
            _this.Sidebar_ListObj.setCurrent(position);
        };

        var popState = function (e) {
            if (e.originalEvent.state !== null) {
                var id = e.originalEvent.state.Id;
                var li = $('li[id="' + id + '"');
                if (li[0]) {
                    li[0].click();
                } else {
                    window.location.reload();
                }
            }
        };

        return _this;
    };

    FXStreet.Class.Sidebar_FilterAndListRatesAndCharts = function () {
        var parent = FXStreet.Class.Sidebar_FilterAndListBase(),
          _this = FXStreet.Util.extendObject(parent);
            
        var userPersonalizationManager = null;
        var assetQueryStringKey = 'asset';

        _this.init = function (json) {
            parent.init(json);
            loadUserSetting();
        };

        var loadUserSetting = function () {
            var userSettings = getAssetsUserSetting();
            if (!isReferral() && userSettings) {
                filter(userSettings);
            }
        };

        var parentSetVars = _this.setVars;
        parent.setVars = function () {
            userPersonalizationManager = FXStreet.Class.Patterns.Singleton.UserPersonalizationManager.Instance();
            if (!isReferral() && getAssetsUserSetting()) {
                parent.ListDataServerResponse = [];
                parent.SidebarListJsonInitialization.LoadInitialDataServer = false;
            }
            parentSetVars();
        };

        var isReferral = function () {
            return _this.FilterJsonInitialization.IsReferral;
        }

        var getAssetsUserSetting = function () {
            var result = userPersonalizationManager.GetAssetsRateAndChartFilterSetting();
            return result;
        };

        var saveUserSetting = function (selectedAssets) {
            if (selectedAssets && Object.keys(selectedAssets).length > 0) {
                var setting = {};
                $.each(selectedAssets, function (key, value) {
                    setting[key] = {
                        display: value.display,
                        decimalPlaces: value.decimalPlaces,
                        priceProviderCode: value.priceProviderCode,
                        id: key
                    };
                });
                userPersonalizationManager.SetAssetsRateAndChartFilterSetting(setting);
            }
            else {
                userPersonalizationManager.RemoveAssetsRateAndChartFilterSetting();
            }
        };

        _this.filterChangedCustom = function (selectedAssets) {
            if (selectedAssets) {
                saveUserSetting(selectedAssets);
                parent.Sidebar_ListObj.clearListValues();
                filter(selectedAssets);
            }
        };

        var filter = function (selectedAssets) {
            var numberOfAssets = (Object.keys(selectedAssets).length);
            if (numberOfAssets > 0) {
                parent.Sidebar_ListObj.LoadDefaultTake(numberOfAssets);
            }

            var queryString = parent.CurrentQueryStringValues;
            queryString = $.grep(queryString, function (item) {
                return item.Key.toLowerCase() !== 'page' && item.Key.toLowerCase() !== 'take';
            });

            if (parent.Sidebar_ListObj.InfiniteScroll) {
                parent.Sidebar_ListObj.InfiniteScroll.NotMoreContent = numberOfAssets > 0;
            }

            $.each(selectedAssets, function (key, value) {
                queryString.push({
                    Key: assetQueryStringKey,
                    Value: key
                });
            });

            parent.Sidebar_ListObj.Render(queryString).done(function () {
                parent.Sidebar_ListObj.LoadDefaultTake();
                parent.Sidebar_ListObj.AfterTypeheadChangedDelegate();
            });
        };

        parent.getJsonFilter = function () {
            parent.FilterJsonInitialization.OptionSelectedDelegate = _this.filterChangedCustom;
            parent.FilterJsonInitialization.GetAssetsUserSettingDelegate = getAssetsUserSetting;
            return parent.FilterJsonInitialization;
        };

        parent.createFilter = function () {
            _this.Sidebar_FilterObj = new FXStreet.Class.SideBarMultiassetFilter();
            _this.Sidebar_FilterObj.init(_this.getJsonFilter());
        };

        return _this;
    };
}());