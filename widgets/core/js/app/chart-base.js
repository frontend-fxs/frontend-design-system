(function () {
    FXStreetWidgets.Chart.Base = function () {
        _this = {};

        _this.chart = FXStreetWidgets.Chart.Base.prototype.chart;
        _this.init = FXStreetWidgets.Chart.Base.prototype.init;
        _this.setSettingsByObject = FXStreetWidgets.Chart.Base.prototype.setSettingsByObject;
        _this.getPrintJson = FXStreetWidgets.Chart.Base.prototype.getPrintJson;
        _this.print = FXStreetWidgets.Chart.Base.prototype.print;
        _this.delayAnimations = FXStreetWidgets.Chart.Base.prototype.delayAnimations;
        _this.log = FXStreetWidgets.Chart.Base.prototype.log;

        return _this;
    };
    FXStreetWidgets.Chart.Base.prototype.chart = null;
    FXStreetWidgets.Chart.Base.prototype.init = function (json) {
        this.log("init chart");
        this.setSettingsByObject(json);
        this.print(this.getPrintJson());
    };
    FXStreetWidgets.Chart.Base.prototype.setSettingsByObject = function (json) {
        for (var propName in json) {
            if (json.hasOwnProperty(propName)) {
                if (this[propName] !== undefined) {
                    this[propName] = json[propName];
                }
            }
        }
    };
    FXStreetWidgets.Chart.Base.prototype.getPrintJson = function () { };
    FXStreetWidgets.Chart.Base.prototype.print = function (json) {
        this.log("print chart");
        this.chart = c3.generate(json);
        this.delayAnimations();
    };
    FXStreetWidgets.Chart.Base.prototype.delayAnimations = function () { };
    FXStreetWidgets.Chart.Base.prototype.log = function (msg) {
        FXStreetWidgets.Util.log(msg);
    };
}());