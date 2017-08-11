(function () {
    FXStreet.Class.Patterns.Singleton.TagManager = (function () {
        var instance;

        var tagManager = function () {
            var parent = FXStreet.Class.Base(),
           _this = FXStreet.Util.extendObject(parent);

            _this.Push = function (json) {
                if (json !== null) {
                    json['userId'] = FXStreet.Resource.UserId;
                    json['userSessionId'] = getUserSessionId();

                    dataLayer.push(json);
                }
            };

            _this.PushToEventhub = function (data, type) {
                if (data != null) {
                    data['LoggedUserEmail'] = FXStreet.Resource.UserInfo.Email;
                    data['UserSessionId'] = getUserSessionId();
                    data['CountryCode'] = FXStreet.Resource.UserInfo.CountryCode;
                    
                    var json = {
                        "event": "eventhub",
                        "eventHubData": data,
                        "eventType": type
                    };

                    dataLayer.push(json);
                }     
            };

            var getUserSessionId = function () {
                var cookieManager = FXStreet.Class.Patterns.Singleton.FxsCookiesManager.Instance();
                var result = cookieManager.GetCookieValue(FXStreet.Util.FxsCookie.UserSessionId);
                return result;
            };

            return _this;
        };

        function createInstance() {
            var object = tagManager();
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