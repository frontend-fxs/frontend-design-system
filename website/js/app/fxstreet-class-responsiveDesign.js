(function () {
    FXStreet.Class.ResponsiveDesign = function () {
        var parent = FXStreet.Class.Base(),
           _this = FXStreet.Util.extendObject(parent);

        var resizeToDeviceObserverSubjects = {};
        var resizeIncreaseToSizeObserverSubjects = [];
        var resizeDecreaseToSizeObserverSubjects = [];

        var desktopWidthLimitPx = 1200;
        var mobileWidthLimitPx = 768;
        var tabletWidthLimitPx = 1024;

        var windowWidth = 0;

        var deviceType = 'Desktop'; // DesktopHD, Desktop, Mobile, Tablet // TODO as enumerable

        _this.getWindowWidth = function () {
            var result = window.innerWidth;
            return result;
        };

        var getDeviceTypeByCurrentWindowWidth = function () {
            windowWidth = _this.getWindowWidth();

            var result = 'DesktopHD'; // DesktopHD, Desktop, Mobile, Tablet
            if (windowWidth < mobileWidthLimitPx) {
                result = 'Mobile';
            }
            else if (windowWidth < tabletWidthLimitPx) {
                result = 'Tablet';
            }
            else if (windowWidth < desktopWidthLimitPx) {
                result = 'Desktop';
            }
            return result;
        };

        var setVars = function () {
            deviceType = getDeviceTypeByCurrentWindowWidth();

            resizeToDeviceObserverSubjects.Mobile = new FXStreet.Class.Patterns.Observer.Subject();
            resizeToDeviceObserverSubjects.Tablet = new FXStreet.Class.Patterns.Observer.Subject();
            resizeToDeviceObserverSubjects.Desktop = new FXStreet.Class.Patterns.Observer.Subject();
            resizeToDeviceObserverSubjects.DesktopHD = new FXStreet.Class.Patterns.Observer.Subject();
        };

        var checkDeviceChange = function () {
            var currentDeviceType = getDeviceTypeByCurrentWindowWidth();
            if (currentDeviceType !== deviceType) {
                deviceType = currentDeviceType;
                var subject = resizeToDeviceObserverSubjects[deviceType];
                if (subject) {
                    subject.notify();
                }
            }
        };

        var checkWidthBreaksChanges = function (currentWidth, lastWidth) {
            var minWidthRange = Math.min(currentWidth, lastWidth);
            var maxWidthRange = Math.max(currentWidth, lastWidth);

            var subjects = currentWidth > lastWidth ? resizeIncreaseToSizeObserverSubjects : resizeDecreaseToSizeObserverSubjects;
            var selelectedSubjects = subjects.filter(function (item, width) {
                return minWidthRange < width && width <= maxWidthRange;
            });
            selelectedSubjects.forEach(function (subject) {
                subject.notify();
            });
        };

        var windowResize = function () {
            var lastWidth = windowWidth;
            windowWidth = _this.getWindowWidth();

            checkDeviceChange();
            checkWidthBreaksChanges(windowWidth, lastWidth);
        };

        var addEvents = function () {
            $(window).resize(windowResize);
        };

        var addObserver = function (subjects, functionDelegate, key) {
            if (typeof functionDelegate === "function") {
                var json = { 'UpdateDelegate': functionDelegate };
                var observer = new FXStreet.Class.Patterns.Observer.Observer();
                observer.init(json);
                var subject = subjects[key];
                if (!subject) {
                    subject = subjects[key] = new FXStreet.Class.Patterns.Observer.Subject();
                }
                subject.addObserver(observer);
            }
        }

        var whenWindowResizesToDevice = function (functionDelegate, deviceType) {
            addObserver(resizeToDeviceObserverSubjects, functionDelegate, deviceType);
        };

        _this.init = function (json) {
            _this.setSettingsByObject(json);
            setVars();
            addEvents();
        };

        _this.IsDesktop = function () {
            var result = deviceType === 'Desktop' || deviceType === 'DesktopHD';
            return result;
        }

        _this.IsMobile = function () {
            var result = deviceType === 'Mobile';
            return result;
        }

        _this.whenWindowResizesToMobile = function (functionDelegate) {
            whenWindowResizesToDevice(functionDelegate, 'Mobile');
        };
        _this.whenWindowResizesToTablet = function (functionDelegate) {
            whenWindowResizesToDevice(functionDelegate, 'Tablet');
        };
        _this.whenWindowResizesToDesktop = function (functionDelegate) {
            whenWindowResizesToDevice(functionDelegate, 'Desktop');
        };
        _this.whenWindowResizesToDesktopHD = function (functionDelegate) {
            whenWindowResizesToDevice(functionDelegate, 'DesktopHD');
        };
        _this.whenWindowDecreaseToSize = function (functionDelegate, width) {
            addObserver(resizeDecreaseToSizeObserverSubjects, functionDelegate, width);
        };
        _this.whenWindowIncreaseToSize = function (functionDelegate, width) {
            addObserver(resizeIncreaseToSizeObserverSubjects, functionDelegate, width);
        };

        return _this;
    };
}());