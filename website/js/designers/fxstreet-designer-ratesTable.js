(function () {
    FXStreetDesigners.Class.RatesTable = function ($, designerModule) {
        var _this = {};

        _this.init = function () {
            designerModule.directive('ngEnter',
                function () {
                    return function (scope, element, attrs) {
                        element.bind("keydown keypress",
                            function (event) {
                                if (event.which === 13) {
                                    scope.$apply(function () {
                                        scope.$eval(attrs.ngEnter);
                                    });

                                    event.preventDefault();
                                }
                            });
                    };
                });

            designerModule.controller('SimpleCtrl',
            [
                '$scope', '$q', '$log', '$http', 'propertyService',
                function ($scope, $q, $log, $http, propertyService) {

                    propertyService.get()
                        .then(function (data) {
                            if (data) {
                                $scope.properties = propertyService.toAssociativeArray(data.Items);
                                _this.setCheckboxValue($scope.properties.IsActiveHeader);
                            }
                        },
                            function (data) {
                                $scope.feedback.showError = true;
                                if (data) {
                                    $scope.feedback.errorMessage = data.Detail;
                                }
                            })
                        .finally(function () {
                            $scope.feedback.showLoadingIndicator = false;

                            var getError = function () {
                                $log.error('Error getting data');
                            }
                            var getPairs = function () {
                                var apiUrl = '/api/assetapi/getassets?culturename=en';
                                return $http({ method: 'GET', cache: true, url: apiUrl }).error(getError);
                            }

                            $q.all([
                                getPairs()
                            ]).then(
                                function (arrayResponse) {
                                    $scope.Pairs = arrayResponse[0].data.Result;
                                });

                            $scope.AssetsIds = $.parseJSON($scope.properties.AssetsIds.PropertyValue) || [];

                            var updatePairs = function () {
                                $scope.properties.AssetsIds.PropertyValue = JSON.stringify($scope.AssetsIds);
                            }

                            $scope.GetPairsSelected = function () {
                                var result = [];
                                if ($scope.Pairs && $scope.AssetsIds) {
                                    $.each($scope.AssetsIds,
                                        function (i, id) {
                                            result.push($scope.Pairs.findFirst(function (i) { return i.Id === id }));
                                        });
                                }
                                return result;
                            }
                            $scope.AddPair = function () {
                                var pair = $scope.pairSelected;
                                if (pair) {
                                    var index = $scope.AssetsIds.indexOf(pair.Id);
                                    var exist = $scope.Pairs.indexOf(pair);
                                    if (index === -1 && exist !== -1) {
                                        $scope.AssetsIds.push(pair.Id);
                                        updatePairs();
                                    }
                                    $scope.pairSelected = null;
                                };
                            };
                            $scope.RemovePair = function (pair) {
                                var index = $scope.AssetsIds.indexOf(pair.Id);
                                if (index > -1) {
                                    $scope.AssetsIds.splice(index, 1);
                                    updatePairs();
                                }
                            }
                            var moveItem = function (array, oldIndex, newIndex) {
                                if (newIndex >= array.length) {
                                    var k = newIndex - array.length;
                                    while ((k--) + 1) {
                                        array.push(undefined);
                                    }
                                }
                                array.splice(newIndex, 0, array.splice(oldIndex, 1)[0]);
                                updatePairs();
                            };

                            $scope.moveUp = function (index) {
                                moveItem($scope.AssetsIds, index, index - 1);
                            }

                            $scope.moveDown = function (index) {
                                moveItem($scope.AssetsIds, index, index + 1);
                            }
                        });
                }
            ]);
        }

        _this.setCheckboxValue = function (property) {
            if (property && typeof property.PropertyValue === "string") {
                property.PropertyValue = property.PropertyValue.toLowerCase();
                property.PropertyValue = property.PropertyValue === "true" ? true : false;
            }
        };

        return _this;
    }
}());