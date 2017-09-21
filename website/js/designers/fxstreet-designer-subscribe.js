(function () {
    FXStreetDesigners.Class.SubscribeToNewsletter = function ($, designerModule) {
        var _this = {};

        _this.init = function () {
            designerModule.controller('SimpleCtrl',
            [
                '$scope',
                'propertyService',
                function ($scope, propertyService) {
                    $scope.feedback.showLoadingIndicator = true;
                    $scope.benefits = [];

                    propertyService.get()
                        .then(function (data) {
                            if (data) {
                                $scope.properties = propertyService.toAssociativeArray(data.Items);
                                if ($scope.properties.SubscriptionBenefits.PropertyValue) {
                                    $scope.benefits = $scope.properties.SubscriptionBenefits.PropertyValue.split('|');
                                    $scope.customizeBenefits = true;
                                }
                            }
                        },
                            function (data) {
                                $scope.feedback.showError = true;
                                if (data)
                                    $scope.feedback.errorMessage = data.Detail;
                            })
                        .then(function () {
                            $scope.feedback.savingHandlers.push(function () {
                                if ($scope.customizeBenefits) {
                                    $scope.properties.SubscriptionBenefits.PropertyValue = $scope.benefits.join('|');
                                } else {
                                    $scope.properties.SubscriptionBenefits.PropertyValue = undefined;
                                }
                            });
                        })
                        .finally(function () {
                            $scope.feedback.showLoadingIndicator = false;
                        });

                    $scope.addBenefit = function () {
                        if (!$scope.benefitInput) {
                            alert('error');
                            return;
                        }
                        $scope.benefits.push($scope.benefitInput);
                        $scope.benefitInput = '';
                    }

                    $scope.removeIndex = function (index) {
                        $scope.benefits.splice(index, 1);
                    };

                    var moveItem = function (array, oldIndex, newIndex) {
                        if (newIndex >= array.length) {
                            var k = newIndex - array.length;
                            while ((k--) + 1) {
                                array.push(undefined);
                            }
                        }
                        array.splice(newIndex, 0, array.splice(oldIndex, 1)[0]);
                    };

                    $scope.moveUp = function (index) {
                        moveItem($scope.benefits, index, index - 1);
                    }

                    $scope.moveDown = function (index) {
                        moveItem($scope.benefits, index, index + 1);
                    }
                }
            ]);
        }

        return _this;
    }
}());