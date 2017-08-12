(function () {
    FXStreetDesigners.Class.Latest = function ($, designerModule) {
        var parent = FXStreetDesigners.Class.Base($, designerModule),
        _this = FXStreet.Util.extendObject(parent);

        parent.onInit = function ($scope, properties) {
            if (properties.HideFullReportButton) {
                properties.HideFullReportButton.PropertyValue = properties.HideFullReportButton.PropertyValue === "True" ? true : false;
            }
        }

        return _this;
    }
}());