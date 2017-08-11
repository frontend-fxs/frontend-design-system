(function () {
    FXStreetDesigners.Class.Topics = function ($, designerModule) {
        var _this = {};

        _this.init = function() {
            designerModule.controller('SimpleCtrl',
            [
                '$scope',
                'propertyService',
                function($scope, propertyService) {
                    $scope.feedback.showLoadingIndicator = true;
                    $scope.topics = [];

                    propertyService.get()
                        .then(function(data) {
                                if (data) {
                                    $scope.properties = propertyService.toAssociativeArray(data.Items);
                                    if ($scope.properties.SerializedEntires.PropertyValue) {
                                        $scope.topics = JSON.parse($scope.properties.SerializedEntires.PropertyValue);
                                    }
                                    if ($scope.properties.Topic1
                                        .PropertyValue &&
                                        $scope.properties.Link1.PropertyValue) {
                                        $scope.topics.push({
                                            Label: $scope.properties.Topic1.PropertyValue,
                                            Link: $scope.properties.Link1.PropertyValue
                                        });
                                    }
                                    if ($scope.properties.Topic2
                                        .PropertyValue &&
                                        $scope.properties.Link2.PropertyValue) {
                                        $scope.topics.push({
                                            Label: $scope.properties.Topic2.PropertyValue,
                                            Link: $scope.properties.Link2.PropertyValue
                                        });
                                    }
                                    if ($scope.properties.Topic3
                                        .PropertyValue &&
                                        $scope.properties.Link3.PropertyValue) {
                                        $scope.topics.push({
                                            Label: $scope.properties.Topic3.PropertyValue,
                                            Link: $scope.properties.Link3.PropertyValue
                                        });
                                    }
                                    if ($scope.properties.Topic4
                                        .PropertyValue &&
                                        $scope.properties.Link4.PropertyValue) {
                                        $scope.topics.push({
                                            Label: $scope.properties.Topic4.PropertyValue,
                                            Link: $scope.properties.Link4.PropertyValue
                                        });
                                    }
                                    if ($scope.properties.Topic5
                                        .PropertyValue &&
                                        $scope.properties.Link5.PropertyValue) {
                                        $scope.topics.push({
                                            Label: $scope.properties.Topic5.PropertyValue,
                                            Link: $scope.properties.Link5.PropertyValue
                                        });
                                    }

                                    if ($scope.properties.Topic6
                                       .PropertyValue &&
                                       $scope.properties.Link6.PropertyValue) {
                                        $scope.topics.push({
                                            Label: $scope.properties.Topic6.PropertyValue,
                                            Link: $scope.properties.Link6.PropertyValue
                                        });
                                    }

                                    if ($scope.properties.Topic7
                                      .PropertyValue &&
                                      $scope.properties.Link7.PropertyValue) {
                                        $scope.topics.push({
                                            Label: $scope.properties.Topic7.PropertyValue,
                                            Link: $scope.properties.Link7.PropertyValue
                                        });
                                    }
                                }
                            },
                            function(data) {
                                $scope.feedback.showError = true;
                                if (data)
                                    $scope.feedback.errorMessage = data.Detail;
                            })
                        .then(function() {
                            $scope.feedback.savingHandlers.push(function() {
                                $scope.properties.SerializedEntires.PropertyValue = JSON.stringify($scope.topics);
                                $scope.properties.Topic1.PropertyValue =
                                    $scope.properties.Topic2.PropertyValue =
                                    $scope.properties.Topic3.PropertyValue =
                                    $scope.properties.Topic4.PropertyValue =
                                    $scope.properties.Topic5.PropertyValue =
                                    $scope.properties.Topic6.PropertyValue =
                                    $scope.properties.Topic7.PropertyValue =
                                    $scope.properties.Link1.PropertyValue =
                                    $scope.properties.Link2.PropertyValue =
                                    $scope.properties.Link3.PropertyValue =
                                    $scope.properties.Link4.PropertyValue =
                                    $scope.properties.Link5.PropertyValue =
                                    $scope.properties.Link6.PropertyValue =
                                    $scope.properties.Link7.PropertyValue = null;
                            });
                        })
                        .finally(function() {
                            $scope.feedback.showLoadingIndicator = false;
                        });

                    $scope.addTopic = function() {
                        if (!$scope.linkInput || !$scope.labelInput) {
                            alert('error');
                            return;
                        }
                        $scope.topics.push({ Label: $scope.labelInput, Link: $scope.linkInput });
                        $scope.linkInput = '';
                        $scope.labelInput = '';
                    }

                    $scope.removeIndex = function(index) {
                        $scope.topics.splice(index, 1);
                    };

                    var moveItem = function(array, oldIndex, newIndex) {
                        if (newIndex >= array.length) {
                            var k = newIndex - array.length;
                            while ((k--) + 1) {
                                array.push(undefined);
                            }
                        }
                        array.splice(newIndex, 0, array.splice(oldIndex, 1)[0]);
                    };

                    $scope.moveUp = function(index) {
                        moveItem($scope.topics, index, index - 1);
                    }

                    $scope.moveDown = function(index) {
                        moveItem($scope.topics, index, index + 1);
                    }
                }
            ]);
        }

        return _this;
    }
}());