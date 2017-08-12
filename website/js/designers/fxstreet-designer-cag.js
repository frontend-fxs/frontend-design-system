(function () {
    FXStreetDesigners.Class.Cag = function ($, designerModule) {
        var parent = FXStreetDesigners.Class.Base($, designerModule),
        _this = FXStreet.Util.extendObject(parent);

        parent.onInit = function ($scope, properties) {
            if (properties.HideFullReportButton) {
                properties.HideFullReportButton.PropertyValue =  true;
            }
        }

        return _this;
    }
}());