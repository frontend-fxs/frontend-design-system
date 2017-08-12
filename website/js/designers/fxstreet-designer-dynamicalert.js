(function () {
    FXStreetDesigners.Class.DynamicAlert = function ($, designerModule) {
        var _this = {};

        _this.init = function() {
            designerModule.controller('SimpleCtrl',
            [
                '$scope',
                'propertyService',
                function($scope, propertyService) {
                    $scope.feedback.showLoadingIndicator = true;

                    propertyService.get()
                        .then(function(data) {
                                if (data) {
                                    $scope.properties = propertyService.toAssociativeArray(data.Items);
                                    $scope.HtmlTemplateSelected = null;

                                    var initHtmlTemplateSelected = function() {
                                        $scope.HtmlTemplateSelected = $scope.HtmlTemplates[0];
                                        if ($scope.properties.AlertType.PropertyValue !== null ||
                                            $scope.properties.AlertType.PropertyValue !== undefined) {
                                            var template = $scope.HtmlTemplates
                                                .filter(function(item) {
                                                    return item.Name === $scope.properties.AlertType.PropertyValue
                                                });
                                            if (template !== undefined && template.length > 0)
                                                $scope.HtmlTemplateSelected = template[0];
                                        }
                                    };

                                    initHtmlTemplateSelected();
                                }
                            },
                            function(data) {
                                $scope.feedback.showError = true;
                                if (data)
                                    $scope.feedback.errorMessage = data.Detail;
                            })
                        .then(function() {
                            $scope.feedback.savingHandlers.push(function() {
                                $scope.properties.AlertType.PropertyValue = $scope.HtmlTemplateSelected.Name;
                                $scope.properties.HtmlTemplateFile.PropertyValue = $scope.HtmlTemplateSelected.File;
                            });
                        })
                        .finally(function() {
                            $scope.feedback.showLoadingIndicator = false;
                        });
                }
            ]);
        };

        return _this;
    }
}());