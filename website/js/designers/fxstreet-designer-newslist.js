(function () {
    FXStreetDesigners.Class.NewsList = function ($, designerModule) {
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
                                    $scope.CategorySelected = null;

                                    var initHtmlTemplateSelected = function() {
                                        $scope.HtmlTemplateSelected = $scope.HtmlTemplates[0];
                                        if ($scope.properties.NewsListType.PropertyValue !== null ||
                                            $scope.properties.NewsListType.PropertyValue !== undefined) {
                                            var template = $scope.HtmlTemplates
                                                .filter(function(item) {
                                                    return item.Name === $scope.properties.NewsListType.PropertyValue
                                                });
                                            if (template !== undefined && template.length > 0)
                                                $scope.HtmlTemplateSelected = template[0];
                                        }

                                        $scope.CategorySelected = $scope.Categories[0];
                                        if ($scope.properties.NewsListType.PropertyValue !== null ||
                                            $scope.properties.Category.PropertyValue !== undefined) {
                                            var category = $scope.Categories
                                                .filter(function(item) {
                                                    return item.Name === $scope.properties.Category.PropertyValue
                                                });
                                            if (category !== undefined && category.length > 0)
                                                $scope.CategorySelected = category[0];
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
                                $scope.properties.NewsListType.PropertyValue = $scope.HtmlTemplateSelected.Name;
                                $scope.properties.HtmlTemplateFile.PropertyValue = $scope.HtmlTemplateSelected.File;
                                $scope.properties.Category.PropertyValue = $scope.CategorySelected.Id;
                            });
                        })
                        .finally(function() {
                            $scope.feedback.showLoadingIndicator = false;
                        });
                }
            ]);
        }

        return _this;
    }
}());