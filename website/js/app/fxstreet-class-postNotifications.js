(function () {
    FXStreet.Class.PostNotifications = function () {
        var parent = FXStreet.Class.Base(),
        _this = FXStreet.Util.extendObject(parent);

        //#region Json props
        _this.HttpPushServerUrl = '';
        _this.HttpPushServerKeysUrl = '';

        _this.ContentType = '';
        _this.PushNotificationChannel = '';
        //#endregion
        _this.PostCreated_ObserverSubject = null;

        var async = function (fn) {
            setTimeout(function () {
                try {
                    fn();
            } catch (e) { console.log('cannot stablish connection'); }
            }, 2000);
        }

        _this.init = function (json) {
            _this.setSettingsByObject(json);
            createObserverSubject();
            async(stablishHubConnection);
        };

        _this.registerObserver = function (updateDelegate) {
            if (updateDelegate !== undefined && updateDelegate !== null) {
                var json = {
                    'UpdateDelegate': updateDelegate
                };
                var observer = new FXStreet.Class.Patterns.Observer.Observer();
                    observer.init(json);

                _this.PostCreated_ObserverSubject.addObserver(observer);
            }
        };

        var createObserverSubject = function () {
            _this.PostCreated_ObserverSubject = new FXStreet.Class.Patterns.Observer.Subject();
        };

        var stablishHubConnection = function () {
            var auth = FXStreet.Class.Patterns.Singleton.Authorization.Instance();
            auth.getTokenPromise().then(function (token) {
                var instance = FXStreetPush.PushNotification.getInstance({
                    token: token,
                    culture: FXStreet.Resource.CultureName,
                    tokenUrl: _this.HttpPushServerKeysUrl,
                    httpPushServerUrl: _this.HttpPushServerUrl
                });
                instance.postSubscribe([_this.PushNotificationChannel], postCreatedOnServer);
            });
        }

        var postCreatedOnServer = function (post) {
            var shouldNotify =
                    post !== null
                    && post !== undefined
                    && FXStreet.Resource.CultureName === post.Language.CultureName
                    && FXStreet.Util.ContentTypeMapping[post.ContentTypeId].FxsContentType === _this.ContentType;

            if (shouldNotify) {
                var postNotify = getPostNotify(post);
                _this.PostCreated_ObserverSubject.notify(postNotify);
            }
        };

        var getPostNotify = function (post) {
            var minutesAgo = FXStreet.Resource.Translations['Sidebar_FilterAndList'].MinutesAgo;
            var time = timeSince(new Date(post.PublicationDate));

            var fields = {
                IsPushNotifed: true,
                PublicationDateDisplay: time.toString().concat(minutesAgo),
                Author: {
                    ImageResponse: post.Author.Image
                }
            };
            var result = $.extend(true, fields, post);
            return result;
        };

        var timeSince = function (date) {
            var seconds = Math.floor((new Date() - date) / 1000);
            var result = Math.floor(seconds / 60);
            return result;
        };

        return _this;
    };
}());

