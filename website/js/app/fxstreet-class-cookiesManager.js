(function () {
    FXStreet.Class.Patterns.Singleton.FxsCookiesManager = (function () {
        var instance;

        var fxsCookiesManager = function () {
            var parent = FXStreet.Class.Base(),
                _this = FXStreet.Util.extendObject(parent);


            _this.UpdateCookie = function (cookieKey, value, expires, path) {
                _this.DeleteCookie(cookieKey);
                _this.SaveCookie(cookieKey, value, expires, path);
            };

            _this.SaveCookie = function (cookieKey, value, expires, path) {
                path = path || '/';
                $.cookie(cookieKey, value, { path: path, expires: expires });
            };

            _this.DeleteCookie = function (cookieKey) {
                $.cookie(cookieKey, null, { path: '/' });
                $.removeCookie(cookieKey, { path: '/' });
            };

            _this.GetCookieValue = function (cookieKey) {
                return $.cookie(cookieKey);
            };

            _this.ExistCookie = function (cookieKey) {
                var cookie = $.cookie(cookieKey);
                return cookie != undefined;
            };

            return _this;
        };

        function createInstance() {
            var object = fxsCookiesManager();
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