(function () {
    FXStreet.Class.Patterns.Singleton.UserPersonalizationManager = (function () {
        var userPersonalizationManagerClass = function () {
            var parent = FXStreet.Class.Base(),
            _this = FXStreet.Util.extendObject(parent);

            var cookieManager = null;
            var isStorageAvailable = false;
            const assetsMultiRateSettingKey = 'assetsMultiRateSetting';
            const assetsRateAndChartFilterKey = 'assetsRateAndChartFilterSetting';
            const cookieRateAndChartFilterKey = 'IsAssetsRateAndChartFilterSetting';

            _this.init = function (json) {
                _this.setSettingsByObject(json);
                _this.setVars();
            };

            _this.setVars = function () {
                isStorageAvailable = FXStreet.Util.isStorageAvailable('localStorage');
                if (!isStorageAvailable) {
                    console.log('localStorage is unavailable');
                }
                cookieManager = FXStreet.Class.Patterns.Singleton.FxsCookiesManager.Instance();
            };

            var getSetting = function (keyStr) {
                var result = null;
                if(isStorageAvailable){
                    result = localStorage.getItem(keyStr);  
                }
                return result;
            };

            var getSettingJson = function (keyStr) {
                var result = {};
                var value = getSetting(keyStr);
                if (value) {
                    result = JSON.parse(value);
                }
                return result;
            };

            var setSetting = function (keyStr, valueStr) {
                if(isStorageAvailable){
                    localStorage.setItem(keyStr, valueStr);
                }
            };

            var removeSetting = function (keyStr) {
                if (isStorageAvailable) {
                    localStorage.removeItem(keyStr);
                }
            };

            var setSettingJson = function (keyStr, valueJson) {
                var valueStr = JSON.stringify(valueJson);
                setSetting(keyStr, valueStr);
            };

            _this.GetAssetsMultiRateSetting = function () {
                var result = getSettingJson(assetsMultiRateSettingKey);
                return result;
            };
            _this.SetAssetsMultiRateSetting = function (valueJson) {
                setSettingJson(assetsMultiRateSettingKey, valueJson);
            };
            _this.RemoveAssetsMultiRateSetting = function () {
                removeSetting(assetsMultiRateSettingKey);
            };

            _this.GetAssetsRateAndChartFilterSetting = function () {
                var result = null;
                if (cookieManager.ExistCookie(cookieRateAndChartFilterKey)) {
                    result = getSettingJson(assetsRateAndChartFilterKey);
                    if (result) {
                        cookieManager.UpdateCookie(cookieRateAndChartFilterKey, 1, 365);
                    }
                    else {
                        cookieManager.DeleteCookie(cookieRateAndChartFilterKey);
                    }
                }
                else {
                    _this.RemoveAssetsRateAndChartFilterSetting();
                }
                return result;
            };
            _this.SetAssetsRateAndChartFilterSetting = function (valueJson) {
                setSettingJson(assetsRateAndChartFilterKey, valueJson);
                cookieManager.UpdateCookie(cookieRateAndChartFilterKey, 1, 365);
            };
            _this.RemoveAssetsRateAndChartFilterSetting = function () {
                removeSetting(assetsRateAndChartFilterKey);
                cookieManager.DeleteCookie(cookieRateAndChartFilterKey);
            };

            return _this;
        };

        var instance;
        function createInstance() {
            var object = userPersonalizationManagerClass();
            object.init({});
            return object;
        };
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