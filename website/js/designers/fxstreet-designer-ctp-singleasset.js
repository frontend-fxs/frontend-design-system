(function () {
    FXStreetDesigners.Class.CtpSingleAsset = function ($, designerModule) {
        var parent = FXStreetDesigners.Class.Base($, designerModule),
        _this = FXStreet.Util.extendObject(parent);

        parent.onInit = function ($scope, properties) {
            if (properties.HideFullReportButton) {
                properties.HideFullReportButton.PropertyValue = properties.HideFullReportButton.PropertyValue === "True" ? true : false;
            }
        }

        return _this;
    }

    //Retrocompability dont remove this until youre shure its not used anymore
    FXStreetDesigners.Class.SingleAsset = function ($, designerModule) {
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