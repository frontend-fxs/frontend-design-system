(function () {
    FXStreet.Class.Patterns.Singleton.StickyManager = (function () {
        var instance;

        var stickyManager = function () {
            var parent = FXStreet.Class.Base(),
            _this = FXStreet.Util.extendObject(parent);

            _this.StickyItemsClass = '.sticky';
            _this.StickyContentSelector = '.sticky-holder';

            var responsiveDesignObj = null;
            var minWidthForSticky = 680;
            var stickyTopPx = 55;

            _this.init = function (json) {
                _this.setSettingsByObject(json);
                _this.setVars();
            };

            _this.setVars = function () {
                responsiveDesignObj = FXStreet.Util.getObjectInstance("ResponsiveDesign");
            };

            _this.setSticky = function (stickyElements, stickyContentSlctor) {
                var width = responsiveDesignObj ? responsiveDesignObj.getWindowWidth() : minWidthForSticky;

                if (width >= minWidthForSticky) {
                    var elementsToStick = stickyElements || $(_this.StickyItemsClass);
                    var scc = stickyContentSlctor || _this.StickyContentSelector;

                    var fixedClass = 'fxs-fixto-fixed';
                    elementsToStick = elementsToStick.not('.' + fixedClass);

                    if (elementsToStick.length > 0) {
                        elementsToStick.fixTo(scc, { top: stickyTopPx });
                        elementsToStick.addClass(fixedClass);
                    }
                }
            }

            return _this;
        };

        function createInstance() {
            var object = stickyManager();
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
}());