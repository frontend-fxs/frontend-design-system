(function () {
    FXStreetDesigners.Class.OnAirEvent = function ($, designerModule) {
        var _this = {};
        
        _this.init = function() {
            designerModule.controller('SimpleCtrl',
            [
                '$scope', '$q', '$log', '$http', 'propertyService',
                function($scope, $q, $log, $http, propertyService) {

                    propertyService.get()
                        .then(
                            function(data) {
                                if (data) {
                                    $scope.properties = propertyService.toAssociativeArray(data.Items);

                                    if ($scope.properties.ShowFooterCheckBox) {
                                        $scope.properties.ShowFooterCheckBox
                                            .PropertyValue =
                                            $scope.properties.ShowFooterCheckBox
                                            .PropertyValue ===
                                            "true"
                                            ? true
                                            : false;
                                    }
                                    if ($scope.properties.ExternalContent) {
                                        $scope.properties.ExternalContent
                                            .PropertyValue =
                                            $scope.properties.ExternalContent.PropertyValue === "true" ? true : false;
                                    }
                                }
                            },
                            function(data) {
                                $scope.feedback.showError = true;
                                if (data) {
                                    $scope.feedback.errorMessage = data.Detail;
                                }
                            })
                        .finally(function() {
                            $scope.feedback.showLoadingIndicator = false;

                            var getError = function() {
                                $log.error('Error getting data');
                            }
                        });
                }
            ]);
        }

        return _this;
    }
}());