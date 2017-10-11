(function () {
    FXStreet.Class.TemplateBase = function () {
        var parent = FXStreet.Class.Base(),
               _this = FXStreet.Util.extendObject(parent);

        _this.SidebarLeft_ShowButtonId = '';
        _this.SidebarLeft_ContainerId = '';
        _this.VerticalMenuId = '';
        _this.HorizontalMenuId = '';

        _this.SidebarLeft_ShowButton = null;
        _this.SidebarLeft_Container = null;
        _this.Body = null;

        _this.WallpaperWrap = null;

        _this.ResponsiveDesignObj = null;
        _this.ScrollPosition = 0;
        _this.CheckScrollPosition = true;
        _this.Content = null;

        var designTeamLimit = 1200;

        _this.init = function (json) {
            _this.setSettingsByObject(json);
            _this.setVars();
            _this.addEvents();
            _this.windowsSubscriber();
            _this.setSticky();
        };

        _this.setVars = function () {
            _this.SidebarLeft_ShowButton = FXStreet.Util.getjQueryObjectById(_this.SidebarLeft_ShowButtonId);
            _this.SidebarLeft_Container = FXStreet.Util.getjQueryObjectById(_this.SidebarLeft_ContainerId);

            _this.Body = $('body');

            _this.ResponsiveDesignObj = FXStreet.Util.getObjectInstance("ResponsiveDesign");

            FXStreet.Util.initObject({
                objType: 'Menu',
                json: {
                    VerticalMenuId: _this.VerticalMenuId,
                    HorizontalMenuId: _this.HorizontalMenuId
                }
            });

            _this.WallpaperWrap = $('.fxs_wallpaper_wrap');
            _this.Content = $('#fxs_content');
        };

        _this.addEvents = function () {
            _this.SidebarLeft_ShowButton.on('click', _this.SidebarLeft_ShowButton_Click);
        };

        function updateScrollPosition(increment) {
            var scrollHeight = _this.Content[0].scrollHeight - _this.Content.height();
            _this.ScrollPosition += increment;
            if (_this.ScrollPosition < 0) {
                _this.ScrollPosition = 0;
            } else if (_this.ScrollPosition > scrollHeight) {
                _this.ScrollPosition = scrollHeight;
            }

            _this.CheckScrollPosition = false;
            _this.Content.stop().animate({ scrollTop: _this.ScrollPosition }, {
                duration: 200,
                done: function () {
                    _this.CheckScrollPosition = true;
                }
            });
        };

        _this.WallpaperWrapMouseWheelEvent = function (e) {
            var scrollIncrement = 100;
            if (e.originalEvent.wheelDelta / 120 > 0) {
                scrollIncrement = -scrollIncrement;
            }
            updateScrollPosition(scrollIncrement);
        };

        _this.WindowKeyDown = function (e) {
            if ((e.which !== 38 && e.which !== 40) || !$(document.activeElement).hasClass('fxs_wallpaper_wrap')) {
                return;
            }

            var up = e.which === 38;
            var scrollIncrement = 90;
            if (up) {
                scrollIncrement = -scrollIncrement;
            }
            updateScrollPosition(scrollIncrement);
        };

        _this.windowsSubscriber = function () {
            if (_this.ResponsiveDesignObj) {
                _this.ResponsiveDesignObj.whenWindowResizesToMobile(_this.ResizeToMobile);
                _this.ResponsiveDesignObj.whenWindowResizesToTablet(_this.ResizeToMobile);
                _this.ResponsiveDesignObj.whenWindowResizesToDesktop(_this.ResizeToDesktop);
            }
        };

        _this.setSticky = function () {
            var minWidthForMobile = 680;
            var isStickyMobileMode = _this.ResponsiveDesignObj.getWindowWidth() < minWidthForMobile;

            function mobileSticky() {
                var mobileStickyButton = FXStreet.Util.getjQueryObjectBySelector('.fxs_stickyAd-mobile-btn');
                mobileStickyButton.on('click',
                    function () {
                        var mobileSticky = FXStreet.Util.getjQueryObjectBySelector('.fxs_stickyAd-mobile');
                        mobileSticky.remove();
                    });

                var jsonAd = {
                    "ContainerId": "fxs_stickyFooterAd",
                    "SlotName": FXStreet.Resource.DfpSlots.FooterMobile,
                    "AdvertiseType": "normal",
                    "RefreshSeconds": 0,
                    "MobileSize": "[320, 50]"
                };
                new FXStreet.Class.AdvertiseNormal().init(jsonAd);
            }


            if (isStickyMobileMode) {
                mobileSticky();
            } else {
                var stickyManager = FXStreet.Class.Patterns.Singleton.StickyManager.Instance();
                stickyManager.setSticky();
            }
        };

        _this.ResizeToMobile = function () {
            _this.setTouch();
        };

        _this.ResizeToDesktop = function () {
            if (typeof _this.removeTouch === "function") {
                _this.removeTouch();
            }
        };

        _this.disableAll = function () {
            _this.SidebarLeft_ShowButton.toggleClass('disable');
        };

        _this.setTouch = function () {
            _this.Body.addClass('fxs_touch');
        };

        _this.removeTouch = function () {
            _this.Body.removeClass('fxs_touch');
        };

        return _this;
    };


    FXStreet.Class.TemplateList = function () {
        var parent = FXStreet.Class.TemplateBase(),
          _this = FXStreet.Util.extendObject(parent);

        _this.ListLeft_ShowButtonId = '';
        _this.ListLeft_ContainerId = '';
        _this.ScrollingContentId = '';
        _this.ScrollingElementSelector = '';
        _this.LoadingMoreId = 'pageLoading';
        _this.HasInfiniteScrollPage = false;

        _this.ListLeft_ShowButton = null;
        _this.ListLeft_Container = null;
        _this.ScrollingContent = null;

        _this.Resources = FXStreet.Resource.Translations['Sidebar_FilterAndList'];

        _this.init = function (json) {
            _this.setSettingsByObject(json);
            parent.init(json);
        };

        _this.setVarsParent = parent.setVars;
        parent.setVars = function () {
            _this.setVarsParent();

            _this.ListLeft_ShowButton = FXStreet.Util.getjQueryObjectById(_this.ListLeft_ShowButtonId);
            _this.ListLeft_Container = FXStreet.Util.getjQueryObjectById(_this.ListLeft_ContainerId);

            if (_this.HasInfiniteScrollPage) {
                FXStreet.Util.initObject({
                    objType: 'InfiniteScrollPage',
                    json: {
                        ScrollingElement: FXStreet.Util.getjQueryObjectBySelector(_this.ScrollingElementSelector),
                        ScrollingContent: _this.ScrollingContent || FXStreet.Util.getjQueryObjectById(_this.ScrollingContentId),
                        LoadingMoreId: _this.LoadingMoreId
                    }
                });
            }

            if (_this.Resources.ShowListLeftButton) {
                _this.ListLeft_ShowButton.find('span').text(_this.Resources.ShowListLeftButton);
            } else {
                console.warn('The ShowListLeftButton field is empty');
            }
        };

        _this.addEventParent = parent.addEvents;
        parent.addEvents = function () {
            _this.addEventParent();
            _this.ListLeft_ShowButton.on('click', _this.ListLeft_ShowButton_Click);
        };

        _this.ListLeft_ShowButton_Click = function () {
            _this.ListLeft_ShowButton.toggleClass('active');
            _this.ListLeft_Container.toggleClass('cbp-spmenu-open');
            _this.SidebarLeft_ShowButton.toggleClass('disabled');
        };

        _this.SidebarLeft_ShowButton_ClickParent = parent.SidebarLeft_ShowButton_Click;
        parent.SidebarLeft_ShowButton_Click = function () {
            _this.SidebarLeft_ShowButton_ClickParent();
            _this.ListLeft_Container.removeClass('cbp-spmenu-open');
            _this.ListLeft_ShowButton.removeClass('active');
            _this.ListLeft_ShowButton.toggleClass('disabled');
        };

        _this.resetMenuParent = parent.resetMenu;
        parent.resetMenu = function () {
            _this.resetMenuParent();
            _this.ListLeft_Container.removeClass('cbp-spmenu-open');
        };

        _this.removeSwipeParent = parent.removeSwipe;
        parent.removeSwipe = function () {
            _this.removeSwipeParent();
            _this.ListLeft_Container.off('swipeleft');
        };

        _this.setSwipeParent = parent.setSwipe;
        parent.setSwipe = function () {
            _this.setSwipeParent();
            if (!_this.ResponsiveDesignObj.IsDesktop()) {
                _this.ListLeft_ShowButton.on('swipeleft', _this.ListLeft_ShowButton_Click);
            }
        };

        return _this;
    };
}());