(function () {
    FXStreetDesigners.Class.Base = function ($, designerModule) {
        var _this = this;

        _this.ControllerName = 'SimpleCtrl';

        _this.init = function () {
            designerModule.controller(_this.ControllerName,
            [
                '$scope',
                'propertyService',
                _this.DesignFunction
            ]);
        };

        _this.configureScope = function ($scope) { };

        _this.onInit = function ($scope, properties) { };

        _this.onPush = function ($scope) { };

        _this.DesignFunction = function ($scope, propertyService) {
            $scope.feedback.showLoadingIndicator = true;

            _this.configureScope($scope);

            propertyService.get()
                .then(function (data) {
                    if (data) {
                        $scope.properties = propertyService.toAssociativeArray(data.Items);
                        _this.onInit($scope, $scope.properties);
                    }
                }, function (data) {
                    $scope.feedback.showError = true;
                    if (data) {
                        $scope.feedback.errorMessage = data.Detail;
                    }
                })
                .then(function () {
                    $scope.feedback.savingHandlers.push(function() {
                        _this.onPush($scope);
                    });
                })
                .finally(function () {
                    $scope.feedback.showLoadingIndicator = false;
                });
        };

        return _this;
    }
}());