(function () {
    FXStreet.Class.Patterns.Observer = {};
    FXStreet.Class.Patterns.Observer.List = function () {
        var parent = FXStreet.Class.Base(),
            _this = FXStreet.Util.extendObject(parent);

        _this.observerList = [];

        _this.add = function (obj) {
            return _this.observerList.push(obj);
        };

        _this.count = function () {
            return _this.observerList.length;
        };

        _this.get = function (index) {
            if (index > -1 && index < this.observerList.length) {
                return this.observerList[index];
            }
            return null;
        };

        _this.indexOf = function (obj, startIndex) {
            var i = startIndex || 0;
            while (i < _this.observerList.length) {
                if (_this.observerList[i] === obj) {
                    return i;
                }
                i++;
            }
            return -1;
        };

        _this.removeAt = function (index) {
            _this.observerList.splice(index, 1);
        };

        return _this;
    };
    FXStreet.Class.Patterns.Observer.Subject = function () {
        var parent = FXStreet.Class.Base(),
            _this = FXStreet.Util.extendObject(parent);

        _this.observers = new FXStreet.Class.Patterns.Observer.List();

        _this.addObserver = function (observer) {
            _this.observers.add(observer);
        };

        _this.removeObserver = function (observer) {
            _this.observers.removeAt(_this.observers.indexOf(observer, 0));
        };

        _this.notify = function (jsonParams) {
            var observerCount = _this.observers.count();
            for (var i = 0; i < observerCount; i++) {
                _this.observers.get(i).update(jsonParams);
            }
        };

        return _this;
    };
    FXStreet.Class.Patterns.Observer.Observer = function () {
        var parent = FXStreet.Class.Base(),
            _this = FXStreet.Util.extendObject(parent);

        _this.UpdateDelegate = null;

        _this.init = function (json) {
            _this.setSettingsByObject(json);
        };

        _this.update = function (jsonParams) {
            if (_this.UpdateDelegate !== null)
                _this.UpdateDelegate(jsonParams);
        };

        return _this;
    };

    FXStreet.Class.Patterns.Singleton = {};
}());