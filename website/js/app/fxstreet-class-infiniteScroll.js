(function () {
    FXStreet.Class.InfiniteScroll = function () {
        var parent = FXStreet.Class.Base(),
            _this = FXStreet.Util.extendObject(parent);

        _this.IsLoading = false;

        // Json properties
        _this.ScrollingContent = null;
        _this.LoadFollowingDelegatePromise = null;
        _this.LoadPreviousDelegatePromise = null;
        _this.ScrollingElement = null;
        _this.LoadingMoreId = '';
        // End json properties

        _this.LastScroll = 0;
        _this.Initialized = false;
        _this.Scrolling = false;
        _this.NotMoreContent = false;
        _this.LoadingMore = null;
        _this.AvoidScroll = false;
        _this.endOfList = false;

        _this.actionBottomToPx = 100;

        _this.MoveUpDirection = false;

        _this.ScrollActionDelegatePromise_ObserverSubject = null;

        _this.init = function (json) {
            _this.setSettingsByObject(json);
            _this.setVars();
            _this.InitPaginator();
        };

        _this.setVars = function () {
            _this.LoadingMore = FXStreet.Util.getjQueryObjectById(_this.LoadingMoreId);
            _this.LoadingMore !== null ? _this.LoadingMore.show() : null;
            _this.ScrollActionDelegatePromise_ObserverSubject = new FXStreet.Class.Patterns.Observer.Subject();
        };

        var loadFollowing = function () {
            _this.IsLoading = true;
            _this.MoveUpDirection = false;
            _this.LoadFollowingDelegatePromise().then(function () {
                _this.IsLoading = false;
            });
        };

        var loadPrevious = function () {
            _this.IsLoading = true;
            _this.MoveUpDirection = true;
            _this.LoadPreviousDelegatePromise().then(function () {
                _this.IsLoading = false;
            });
        };

        var scrollFunction = function () {
            _this.ScrollActionDelegatePromise_ObserverSubject.notify();
        };

        _this.InitPaginator = function () {
            _this.ScrollingContent.on('scroll', _this.ScrollAction);
        };

        _this.ScrollAction = function () {
            _this.MoveUpDirection = false;
            if (_this.IsLoading || _this.AvoidScroll) {
                return;
            }

            var scrollPosition = _this.getScrollPosition();
            _this.MoveUpDirection = scrollPosition <= _this.LastScroll;
            _this.LastScroll = scrollPosition;

            scrollFunction();

            if (_this.NotMoreContent)
                return;

            if (scrollPosition === 0 && _this.LoadPreviousDelegatePromise !== null) {
                loadPrevious();
            } else if (_this.ScrollIsOnBottomZone()) {
                loadFollowing();
            }
        };

        _this.ScrollIsOnBottomZone = function () {
            var scrollPos = _this.getScrollPosition();
            return scrollPos >= -_this.actionBottomToPx + (_this.ScrollingElement.height() - _this.ScrollingContent.height());
        };

        _this.ScrollIsOnTop = function () {
            var scrollPos = _this.getScrollPosition();
            return scrollPos === 0;
        };

        _this.ScrollIsOnBottom = function () {
            var scrollPos = _this.getScrollPosition();
            return scrollPos >= (_this.ScrollingElement.height() - _this.ScrollingContent.height());
        };

        _this.getScrollPosition = function () {
            return _this.ScrollingContent.scrollTop();
        };

        _this.moveToPosition = function (positionTop) {
            _this.ScrollingContent.scrollTop(positionTop);
        };

        _this.MoveScroll = function (pixels) {
            var pos = _this.getScrollPosition();
            _this.moveToPosition(pos + pixels);
        };

        _this.animateToPosition = function (positionTop) {
            // Stopping the animation: if the scroll is already in movement, we must to stop it avoiding stacking the animations
            _this.ScrollingContent.stop();
            _this.ScrollingContent.animate({ scrollTop: positionTop }, 1000);
        };

        _this.endedList = function () {
            _this.endOfList = true;
            _this.LoadingMore.hide();
        };

        _this.setAvoidScroll = function (value) {
            _this.AvoidScroll = value;
        };

        _this.whenScroll = function (functionDelegate) {
            var observer = null;
            if (typeof functionDelegate === 'function') {
                var json = { 'UpdateDelegate': functionDelegate };
                observer = new FXStreet.Class.Patterns.Observer.Observer();
                observer.init(json);
                _this.ScrollActionDelegatePromise_ObserverSubject.addObserver(observer);
            } else {
                console.error('The functionDelegate provided is not a function');
            }
            return observer;
        };

        _this.unsubscribeScroll = function (observer) {
            var observers = _this.ScrollActionDelegatePromise_ObserverSubject.observers;
            var observerIndex = observers.indexOf(observer);
            if (observerIndex > -1) {
                observers.removeAt(observerIndex);
            }
        }

        return _this;
    };
    FXStreet.Class.InfiniteScrollPage = function () {
        var parent = FXStreet.Class.InfiniteScroll(),
          _this = FXStreet.Util.extendObject(parent);

        _this.LoadContentDelegatePromise_ObserverSubject = null;

        _this.init = function (json) {
            parent.init(json);
            _this.setSettingsByObject(json);
            _this.setVars();
        };

        _this.setVars = function () {
            parent.setVars();
            _this.LoadContentDelegatePromise_ObserverSubject = new FXStreet.Class.Patterns.Observer.Subject();
        };

        _this.whenLoadContent = function (functionDelegate) {
            if (functionDelegate !== undefined && functionDelegate !== null) {
                var json = { 'UpdateDelegate': functionDelegate };
                var observer = new FXStreet.Class.Patterns.Observer.Observer();
                observer.init(json);
                _this.LoadContentDelegatePromise_ObserverSubject.addObserver(observer);
            }
        };

        parent.LoadFollowingDelegatePromise = function () {
            return $.when(_this.LoadContentDelegatePromise_ObserverSubject.notify());
        };

        parent.LoadPreviousDelegatePromise = function () {
            return $.when(_this.LoadContentDelegatePromise_ObserverSubject.notify());
        };

        return _this;
    };
}());