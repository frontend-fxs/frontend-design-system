(function () {
    FXStreetDesigners.Class.Advertise = function ($, designerModule) {
        var parent = FXStreetDesigners.Class.Base($, designerModule),
        _this = FXStreet.Util.extendObject(parent);

        _this.setAdvertiseLogic = function($scope) {
            $scope.labels = [];

            $scope.addLabel = function () {
                if (!$scope.labelKeyInput || !$scope.labelValueInput) {
                    alert('error');
                    return;
                }
                $scope.labels.push({ Key: $scope.labelKeyInput, Value: $scope.labelValueInput });
                $scope.labelKeyInput = '';
                $scope.labelValueInput = '';
            }

            $scope.removeLabel = function (index) {
                $scope.labels.splice(index, 1);
            };

            $scope.$watchCollection('labels', function () {
                $scope.properties.SerializedLabels.PropertyValue = JSON.stringify($scope.labels);
            });
        }

        parent.configureScope = function ($scope) {
            _this.setAdvertiseLogic($scope);
        }

        parent.onInit = function ($scope, properties) {
            properties.PopupShowIntervalInMinutes.PropertyValue = parseInt(properties.PopupShowIntervalInMinutes.PropertyValue);
            properties.RefreshSeconds.PropertyValue = parseInt(properties.RefreshSeconds.PropertyValue);

            if (properties.SerializedLabels.PropertyValue) {
                $scope.labels = JSON.parse(properties.SerializedLabels.PropertyValue);
            }
            if (properties.LabelKey.PropertyValue && properties.LabelValue.PropertyValue) {
                $scope.labels.push({ Key: properties.LabelKey.PropertyValue, Value: properties.LabelValue.PropertyValue });
                properties.LabelKey.PropertyValue = properties.LabelValue.PropertyValue = "";
            }
            if (properties.Label2Key.PropertyValue && properties.Label2Value.PropertyValue) {
                $scope.labels.push({ Key: properties.Label2Key.PropertyValue, Value: properties.Label2Value.PropertyValue });
                properties.Label2Key.PropertyValue = properties.Label2Value.PropertyValue = "";
            }

            properties.IsWallpaper.PropertyValue = properties.IsWallpaper.PropertyValue === "True" ? true : false;
        }

        return _this;
    }
}());