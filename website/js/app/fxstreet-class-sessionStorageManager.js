(function () {
    FXStreet.Class.Patterns.Singleton.FxsSessionStorageManager = (function () {
        var instance;

        var fxsSessionStorageManager = function () {
            var parent = FXStreet.Class.Base(),
                _this = FXStreet.Util.extendObject(parent);

            _this.Save = function (key, value) {
                sessionStorage.setItem(key, value);
            };

            _this.Delete = function (key) {
                sessionStorage.removeItem(key);
            };

            _this.Get = function (key) {
                return sessionStorage.getItem(key);
            };

            _this.Exist = function (key) {
                var val = _this.GetValue(key);
                return val != null;
            };

            return _this;
        };

        function createInstance() {
            var object = fxsSessionStorageManager();
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