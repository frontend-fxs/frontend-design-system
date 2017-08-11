(function () {
    FXStreet.Class.Patterns.Singleton.AdvertiseManager = (function () {
        var instance;

        var advertiseManager = function () {
            var parent = FXStreet.Class.Base(),
               _this = FXStreet.Util.extendObject(parent);

            var slots = {};
            var googleTag = FXStreet.ExternalLib.GoogleTag;

            _this.init = function (json) {
                _this.setSettingsByObject(json);
            };

            _this.Add = function (groupKey, slot) {
                if (!slots[groupKey]) {
                    slots[groupKey] = [];
                }
                slots[groupKey].push(slot);
            };

            _this.RefreshGroup = function (groupKey) {
                googleTag.pubads().refresh(slots[groupKey]);
            };

            return _this;
        };

        function createInstance() {
            var object = advertiseManager();
            object.init({});
            return object;
        }

        return {
            Instance: function () {
                if (!instance) {
                    instance = createInstance();
                }
                return instance;
            }
        };
    })();

    FXStreet.Class.AdvertiseBase = function () {
        var parent = FXStreet.Class.Base(),
            _this = FXStreet.Util.extendObject(parent);

        // ----- begin json properties -----

        _this.ContainerId = "";
        _this.SlotName = "";
        _this.Labels = [];
        _this.LabelKey = "";
        _this.LabelValue = "";
        _this.Label2Key = "";
        _this.Label2Value = "";
        _this.MobileSize = [];
        _this.TabletSize = [];
        _this.DesktopSize = [];
        _this.DesktopHdSize = [];
        _this.RefreshSeconds = 0;
        _this.Async = false;
        _this.GroupKey = "";

        // ----- end json properties -----

        _this.Container = null;
        _this.GoogleTag = FXStreet.ExternalLib.GoogleTag;
        _this.ResponsiveSeparator = '-';
        _this.Slot = null;

        _this.AdvertiseManagerObj = null;

        _this.MinMobileSize = [0, 0];
        _this.MinTabletSize = [768, 0];
        _this.MinDesktopSize = [1025, 0];
        _this.MinDesktopHdSize = [1480, 0];

        _this.responsiveDesignObj = null;

        _this.init = function (json) {
            _this.setSettingsByObject(json);
            _this.setVars();
            _this.addEvents();
            _this.setAdvertise();
        };

        _this.setVars = function () {
            _this.Container = FXStreet.Util.getjQueryObjectById(_this.ContainerId);
            _this.MobileSize = _this.getSize(_this.MobileSize);
            _this.TabletSize = _this.getSize(_this.TabletSize);
            _this.DesktopSize = _this.getSize(_this.DesktopSize);
            _this.DesktopHdSize = _this.getSize(_this.DesktopHdSize);
            _this.responsiveDesignObj = FXStreet.Util.getObjectInstance("ResponsiveDesign");

            if (_this.LabelKey && _this.LabelValue && !_this.Labels.findFirst(function (item) { return item === _this.LabelKey })) {
                _this.Labels.push({ Key: _this.LabelKey, Value: _this.LabelValue });
            }
            if (_this.Label2Key && _this.Label2Value && !_this.Labels.findFirst(function (item) { return item === _this.Label2Key })) {
                _this.Labels.push({ Key: _this.Label2Key, Value: _this.Label2Value });
            }

            _this.Labels.push({ Key: "url", Value: window.location.hostname + window.location.pathname });

            _this.Async = FXStreet.Global.AsyncDfp;

            _this.AdvertiseManagerObj = FXStreet.Class.Patterns.Singleton.AdvertiseManager.Instance();
        };

        _this.getSize = function (size) {
            var result = [];

            try {
                if (size !== null && size && size.length > 0) {
                    result = $.parseJSON(size);
                }
            } catch (e) {
                console.log('cannot map size: ' + size + ' for advertize: ' + _this.ContainerId);
            }

            return result;
        };

        _this.setAdvertise = function () {
            if (_this.Async) {
                _this.setAdvertiseAsync();
            } else {
                _this.setAdvertiseSync();
            }
        };

        _this.setAdvertiseAsync = function () {
            _this.GoogleTag.cmd.push(function () {
                _this.createSlot();
                if (_this.GroupKey) {
                    _this.AdvertiseManagerObj.Add(_this.GroupKey, _this.Slot);
                }
            });
        };

        _this.setAdvertiseSync = function () {
            _this.createSlot();
        };

        _this.renderAdvertise = function (onAdvertiseRendered) {
            if (_this.Async) {
                _this.renderAdvertiseAsync(onAdvertiseRendered);
            } else {
                _this.renderAdvertiseSync(onAdvertiseRendered);
            }
        };

        _this.renderAdvertiseAsync = function (onAdvertiseRendered) {
            _this.GoogleTag.cmd.push(function () {
                _this.setSlotRenderEndedEvent(onAdvertiseRendered);

                _this.GoogleTag.display(_this.ContainerId);

                _this.refreshAd();

                if (!_this.GroupKey) {
                    if (_this.RefreshSeconds > 0) {
                        setInterval(function () {
                            _this.GoogleTag.pubads().refresh([_this.Slot]);
                        }, _this.RefreshSeconds * 1000);
                    }
                }
            });
        };

        _this.renderAdvertiseSync = function (onAdvertiseRendered) {
            _this.setSlotRenderEndedEvent(onAdvertiseRendered);

            _this.GoogleTag.pubads().enableSyncRendering();
            _this.GoogleTag.enableServices();
            _this.GoogleTag.display(_this.ContainerId);
        };

        _this.setSlotRenderEndedEvent = function (delegate) {
            if (typeof delegate === 'function') {
                _this.GoogleTag.pubads().addEventListener('slotRenderEnded', delegate);
            }
        }

        _this.createSlot = function () {
            _this.Slot = _this.GoogleTag.defineSlot(_this.SlotName, [], _this.ContainerId);
            if (_this.Slot) {
                _this.Slot.ContainerId = _this.ContainerId;
                _this.Slot.addService(_this.GoogleTag.pubads());
                _this.setTargeting();
                _this.setResponsive();
            } else {
                console.warn('Cannot be created the ad in the container ' + _this.ContainerId);
            }
        };

        _this.setTargeting = function () {
            _this.Labels.forEach(function (label) {
                if (label.Key && label.Value) {
                    _this.Slot.setTargeting(label.Key, label.Value);
                }
            });

        };

        _this.setResponsive = function () {
            var mapping;

            mapping = _this.GoogleTag.sizeMapping().
            addSize(_this.MinMobileSize, _this.MobileSize)
            .addSize(_this.MinTabletSize, _this.TabletSize)
            .addSize(_this.MinDesktopSize, _this.DesktopSize)
            .addSize(_this.MinDesktopHdSize, _this.DesktopHdSize)
            .build();

            _this.Slot.defineSizeMapping(mapping);
        };

        _this.containerOuterHtml = function () {
            return _this.Container[0].outerHTML;
        };

        _this.addEvents = function () {
            if (_this.responsiveDesignObj) {
                _this.responsiveDesignObj.whenWindowResizesToMobile(_this.refreshAd);
                _this.responsiveDesignObj.whenWindowResizesToTablet(_this.refreshAd);
                _this.responsiveDesignObj.whenWindowResizesToDesktop(_this.refreshAd);
                _this.responsiveDesignObj.whenWindowResizesToDesktopHD(_this.refreshAd);
            }
        };

        _this.refreshAd = function () {
            if (_this.GroupKey) {
                _this.AdvertiseManagerObj.RefreshGroup(_this.GroupKey);
            } else {
                _this.GoogleTag.pubads().refresh([_this.Slot]);
            }
        };

        return _this;
    };
    FXStreet.Class.AdvertiseNormal = function () {
        var parent = FXStreet.Class.AdvertiseBase(),
            _this = FXStreet.Util.extendObject(parent);

        _this.init = function (json) {
            parent.init(json);
            _this.renderAdvertise();
        };

        return _this;
    };

    FXStreet.Class.AdvertisePopup = function () {
        var parent = FXStreet.Class.AdvertiseBase(),
            _this = FXStreet.Util.extendObject(parent);

        _this.PopupShowIntervalInMinutes = 0;
        _this.CookieGroup = "";
        _this.IsRendered = false;
        _this.CookieName = "";
        _this.MobileCookieName = "";

        _this.init = function (json) {
            _this.setSettingsByObject(json);
            _this.setVars();
            if (!$.cookie(_this.CookieName)) {
                parent.init(json);
                if (_this.responsiveDesignObj.IsMobile()) {
                    if (!$.cookie(_this.MobileCookieName)) {
                        document.addEventListener("click", showAdvertisePopUpOnClick);
                    } else {
                        _this.renderAdvertise(_this.onAdvertiseRendered);
                    }
                } else {
                    _this.renderAdvertise(_this.onAdvertiseRendered);
                }
            }
        };

        function showAdvertisePopUpOnClick() {
            _this.setMobileCookie();
            document.removeEventListener("click", showAdvertisePopUpOnClick); 
        }

        _this.setVars = function () {
            _this.CookieName = 'PopupAd_' + _this.CookieGroup;
            _this.MobileCookieName = 'PopupMobileAd_' + _this.CookieGroup;
        };

        _this.createPopup = function () {
            var popupHtml = '<div class="fxs_modal_wrap modal"><button type="button" class="fxs_modal_close fxs_btn_icon fxs_btn_functional close" data-dismiss="modal" aria-label="Close Modal"><i class="fa fa-times"></i><span class="fxs_skip">Close Modal</span></button><div class="fxs_modal_content fxs_modal_roadblock_sponsor"><div class="fxs_detail"><a href="link sponsor" title="sponsor name"><advertise /></a></div></div></div>';
            var popup = $(popupHtml);
            $('body').append(popup);
            var advertise = popup.find('advertise');
            advertise.replaceWith(_this.Container);
            popup.modal('show');
        }

        _this.onAdvertiseRendered = function (e) {
            if (e.slot.ContainerId !== _this.ContainerId || _this.IsRendered) {
                return;
            }

            if (e.isEmpty) {
                _this.Container.hide();
            } else {
                _this.IsRendered = true;
                _this.setCookie();
                _this.createPopup();
                _this.refreshAd();
                _this.removeMobileCookie();
            }
        };

        _this.setCookie = function () {
            var cacheExpirationInDays = _this.PopupShowIntervalInMinutes / 24 / 60;
            $.cookie(_this.CookieName, true, { expires: cacheExpirationInDays, path: '/' });
        }

        _this.setMobileCookie = function () {
            var cacheExpirationInDays = _this.PopupShowIntervalInMinutes / 24 / 60;
            $.cookie(_this.MobileCookieName, true, { expires: cacheExpirationInDays, path: '/' });
        }

        _this.removeMobileCookie = function () {
            $.removeCookie(_this.MobileCookieName, { path: '/' });
        }

        return _this;
    };

}());