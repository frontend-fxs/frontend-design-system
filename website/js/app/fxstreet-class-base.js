(function () {
    /*
    Name: 
    Base
    Param:
    None
    Return: 
    An instance of Base Class
    Functionality:
    This is the base class that most objects inherit from
    */
    FXStreet.Class.Base = function () {
        var thisBase = this;

        thisBase.init = FXStreet.Class.Base.prototype.init;
        thisBase.setSettingsByObject = FXStreet.Class.Base.prototype.setSettingsByObject;
        thisBase.addEvents = FXStreet.Class.Base.prototype.addEvents;
        thisBase.setVars = FXStreet.Class.Base.prototype.setVars;

        return thisBase;
    };
    FXStreet.Class.Base.prototype.init = function (json) {
        this.setSettingsByObject(json);
    };
    FXStreet.Class.Base.prototype.setSettingsByObject = function (json) {
        for (var propName in json) {
            if (json.hasOwnProperty(propName)) {
                if (this[propName] !== undefined) {
                    this[propName] = json[propName];
                }
            }
        }
    };
    FXStreet.Class.Base.prototype.addEvents = function () { };
    FXStreet.Class.Base.prototype.setVars = function () { };
}());