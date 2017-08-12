(function () {
    FXStreetDesigners.Class.SearchConfigurable = function ($, designerModule) {
        var _this = {};

        _this.init = function() {
            designerModule.controller('SimpleCtrl',
            [
                '$scope', 'propertyService',
                function ($scope, propertyService) {

                    propertyService.get()
                    .then(
                        function (data) {
                            if (data) {
                                $scope.properties = propertyService.toAssociativeArray(data.Items);

                                _this.setCheckboxValue($scope.properties.ShowTitle);
                                _this.setCheckboxValue($scope.properties.ShowClearAll);
                                _this.setCheckboxValue($scope.properties.ShowResultsFound);
                                _this.setCheckboxValue($scope.properties.ShowSearchBox);
                                _this.setCheckboxValue($scope.properties.HideFiltersOnMobile);
                                _this.setCheckboxValue($scope.properties.AllowFiltersCollapse);
                                _this.setCheckboxValue($scope.properties.ShowTagFilter);
                                _this.setCheckboxValue($scope.properties.ShowAuthorFilter);
                                _this.setCheckboxValue($scope.properties.ShowResultImage);
                            }
                        }
                    );
                }
            ]);
        };

        _this.setCheckboxValue = function(property) {
            if (property && typeof property.PropertyValue === "string") {
                property.PropertyValue = property.PropertyValue.toLowerCase();
                property.PropertyValue = property.PropertyValue === "true" ? true : false;
            }
        };

        return _this;
    }
}());