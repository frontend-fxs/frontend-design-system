(function () {
    FXStreetDesigners.Class.PostList = function ($, designerModule) {
        var parent = FXStreetDesigners.Class.Base($, designerModule),
        _this = FXStreet.Util.extendObject(parent);

        parent.onInit = function ($scope, properties) {
            $scope.FilterType = parseInt(properties.FilterType.PropertyValue);
            switch ($scope.FilterType) {
                case 0:
                    $scope.category = properties.FilterValue.PropertyValue;
                    break;
                case 1:
                    $scope.asset = properties.FilterValue.PropertyValue;
                    break;
            }
        };

        parent.configureScope = function ($scope) {
            $scope.filterTypeChange = function () {
                $scope.properties.FilterValue.PropertyValue = null;
                $scope.properties.FilterType.PropertyValue = $scope.FilterType;
                $scope.category = null;
                $scope.asset = null;
            }

            $scope.CategoryChange = function () {
                $scope.properties.FilterValue.PropertyValue = $scope.category;
            }

            $scope.AssetChange = function () {
                $scope.properties.FilterValue.PropertyValue = $scope.asset;
            }
        }

        return _this;
    }
}());