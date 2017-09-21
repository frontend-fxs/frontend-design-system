(function () {
    FXStreet.Class.Menu = function () {
        var parent = FXStreet.Class.Base(),
         _this = FXStreet.Util.extendObject(parent);

        _this.VerticalMenuId = '';
        _this.HorizontalMenuId = '';

        _this.VerticalMenu = null;
        _this.HorizontalMenu = null;
        _this.responsiveDesignObj = null;

        _this.HideElementClass = "fxs_hideElements";
        _this.SectionEntrySelector = "a[fxs-desktop-menu-entry]";
        _this.ItemEntrySelector = "a[fxs-desktop-menu-item-entry]";
        _this.MouseOverClass = "fxs_item_active";
        _this.ActiveMenuEntryClass = "active";
        _this.SectionSelector = "[fxs-section-entry]";
        _this.DesktopMatchSize = "(min-width: 1024px)";
        _this.MenuBarSelector = "#fxs_nav_position";
        _this.LogoSelector = "#fxs_logo_reduced";
        _this.HeaderSelector = ".fxs_header";
        _this.PositionFixedClass = "fxs_positionFixed";
        _this.WallpaperSelector = ".fxs_wallpaper_wrap";
        _this.SideBarSelector = ".fxs_listView";
        _this.MobileMenuContainerSelector = "#cbp-spmenu-s1";
        _this.MobileMenuBlockClass = "fxs_dBlock";
        _this.MobileMenuCloseClass = "fa-times";
        _this.MobileMenuOpenClass = "fa-bars";
        _this.MobileMenuButtonSelector = "#fxs_showLeftPush";
        _this.MobileMenuPushToRight = "cbp-spmenu-push-toright";
        _this.HeaderScrolledClass = "fxs_header_scrolled";

        var menuSizeLimit = 1024;

        _this.init = function (json) {
            _this.setSettingsByObject(json);
            _this.setVars();
            _this.addEvents();
            _this.setActiveSection();
        };

        _this.setVars = function () {
            _this.VerticalMenu = FXStreet.Util.getjQueryObjectById(_this.VerticalMenuId);
            _this.HorizontalMenu = FXStreet.Util.getjQueryObjectById(_this.HorizontalMenuId);
        };

        _this.addEvents = function () {
            _this.responsiveDesignObj = FXStreet.Util.getObjectInstance("ResponsiveDesign");
            if (_this.responsiveDesignObj) {
                _this.responsiveDesignObj.whenWindowDecreaseToSize(function () { _this.toggleMenu(false); }, menuSizeLimit);
                _this.responsiveDesignObj.whenWindowIncreaseToSize(function () { _this.toggleMenu(true); }, menuSizeLimit);
            }
            if (FXStreet.Util.isMobileDevice()) {
                _this.mobileMenuEvents();
            }
            else {
                _this.loadScrollEvents();
            }
        };

        _this.toggleMenu = function (horizontalVisible) {
            _this.VerticalMenu.toggleClass(_this.HideElementClass, horizontalVisible);
            _this.HorizontalMenu.toggleClass(_this.HideElementClass, !horizontalVisible);
            if (!horizontalVisible) {
                _this.mobileMenuEvents();
            } else {
                _this.MobileMenuActions(false);
                _this.loadScrollEvents();
            }
        };

        _this.setActiveSection = function () {

            var sections = $(_this.SectionEntrySelector);
            if (!sections) return;
            $(sections).removeClass(_this.ActiveMenuEntryClass);

            var pathName = window.location.pathname;
            var section = _this.matchSectionUrl(pathName) || _this.matchItemUrl(pathName);
            if (!section || section.length === 0) return;

            $(section).addClass(_this.ActiveMenuEntryClass);
        }

        _this.matchSectionUrl = function (pathName) {
            var result = null;
            var sections = $(_this.SectionEntrySelector);
            sections.each(function(e, f) {
                var sectionHref = $(f).attr('href');
                if (_this.isHomePath(sectionHref)) {
                    if (pathName == sectionHref){
                        result = f;
                        return false;
                    };
                } else {
                    if (pathName.indexOf(sectionHref) === 0) {
                        result = f;
                        return false;
                    };
                }
            });
            if (!result||result.length === 0) return result;

            result = $(result).parents(_this.SectionSelector);
            return result;
        }

        _this.isHomePath = function(pathName) {
            return pathName === '/';
        };

        _this.matchItemUrl = function(pathName) {
            var item = $(_this.ItemEntrySelector + '[href="' + pathName + '"]');
            if (!item || item.length === 0) return null;

            var result = $(item).parents(_this.SectionSelector);
            return result;
        };

        _this.loadScrollEvents = function() {
            $(window).scroll(function() {
                _this.scrollActions();
            });
        };

        _this.scrollActions = function () {
            var desktop = window.matchMedia(_this.DesktopMatchSize);
            var menuBar = $(_this.MenuBarSelector);
            var logoCustom = $(_this.LogoSelector);
            var header = $(_this.HeaderSelector);
            var body = $("body");
            var wallpaper = $('.fxs_wallpaper_wrap');
            var listView = $('.fxs_listView');

            if (desktop.matches) {
                if ($(window).scrollTop() > 80) {
                    body.addClass(_this.HeaderScrolledClass);
                    menuBar.addClass(_this.PositionFixedClass);
                    wallpaper.css({ 'top': '47px' });
                    listView.css({ 'top': '47px' });
                } else {
                    menuBar.removeClass(_this.PositionFixedClass);
                    body.removeClass(_this.HeaderScrolledClass);
                    wallpaper.css({ 'top': (121 - $(window).scrollTop()) + 'px' });
                    listView.css({ 'top': (121 - $(window).scrollTop()) + 'px' });
                }
            } else {
                header.css("position", "fixed");
                logoCustom.addClass(_this.HideElementClass);
            };
        };

        _this.mobileMenuEvents = function () {
            $(_this.MobileMenuButtonSelector).off("click").on("click", function () {
                var visible = $(_this.MobileMenuContainerSelector).hasClass(_this.MobileMenuBlockClass);
                _this.MobileMenuActions(!visible);
            });
        };

        _this.MobileMenuActions = function (open) {
            var container = $(_this.MobileMenuContainerSelector);
            var icon = $(_this.MobileMenuButtonSelector).find("i");
            var body = $("body");

            if (open) {
                container.addClass(_this.MobileMenuBlockClass);
                icon.removeClass(_this.MobileMenuOpenClass).addClass(_this.MobileMenuCloseClass);
                $(body).addClass(_this.MobileMenuPushToRight);
            } else {
                container.removeClass(_this.MobileMenuBlockClass);
                icon.removeClass(_this.MobileMenuCloseClass).addClass(_this.MobileMenuOpenClass);
                $(body).removeClass(_this.MobileMenuPushToRight);
            }
        };

        return _this;
    };

}());