(function () {
    FXStreetDesigners.Class.HighlightedPost = function ($, designerModule) {
        var _this = {};

        _this.init = function() {
            designerModule.controller('SimpleCtrl',
            [
                '$scope',
                '$log',
                '$http',
                'propertyService',
                function($scope, $log, $http, propertyService) {
                    $scope.feedback.showLoadingIndicator = true;

                    propertyService.get()
                        .then(function(data) {
                                if (data) {
                                    $scope.properties = propertyService.toAssociativeArray(data.Items);

                                    $scope.PostTypes = [
                                        {
                                            Text: 'News',
                                            HtmlTemplates: 'HtmlNewsTemplates',
                                            Url: FXStreet.Resource.FxsApiRoutes['NewsItemGetItemByUrl']
                                        },
                                        {
                                            Text: 'Analysis',
                                            HtmlTemplates: 'HtmlAnalysisTemplates',
                                            Url: FXStreet.Resource.FxsApiRoutes['AnalysisItemGetItemByUrl']
                                        },
                                        {
                                            Text: 'Video',
                                            HtmlTemplates: 'HtmlVideoTemplates',
                                            Url: FXStreet.Resource.FxsApiRoutes['VideosGetItemByUrl']
                                        },
                                        {
                                            Text: 'Education',
                                            HtmlTemplates: 'HtmlEducationTemplates',
                                            Url: FXStreet.Resource.FxsApiRoutes['EducationItemGetItemByUrl']
                                        }
                                    ];

                                    if ($scope.properties.SerializatedPost &&
                                        $scope.properties.SerializatedPost.PropertyValue) {
                                        $scope.Post = JSON.parse($scope.properties.SerializatedPost.PropertyValue);
                                        $scope.Url = $scope.Post.Url;
                                    }
                                    if ($scope.properties.PostType && $scope.properties.PostType.PropertyValue) {
                                        $scope.postType = $scope.PostTypes
                                            .findFirst(function(item) {
                                                return item.Text === $scope.properties.PostType.PropertyValue;
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
                                $scope.properties.SerializatedPost.PropertyValue = JSON.stringify($scope.Post);
                            });
                        })
                        .finally(function() {
                            $scope.feedback.showLoadingIndicator = false;
                        });

                    var getPostError = function(codeStatus) {
                        if (codeStatus === 200) {
                            alert('The post cannot be found');
                        } else {
                            $log.error('Error getting data');
                        }
                    }

                    var postLoaded = function(response) {
                        if (!response || !response.data) {
                            getPostError(response.status);
                            return;
                        }
                        $scope.Post = response.data;
                    }

                    var urlSimplify = function(url) {
                        var result = url;
                        var regex = /(.*fxstreet\.[^\/]+\/[^\/]+\/)?(.+)/;
                        var match = regex.exec(url);

                        if (match !== null) {
                            result = match[2];
                        }
                        return result;
                    };

                    $scope.loadPost = function() {
                        if (!$scope.Url) {
                            alert('The url is required');
                            return;
                        }
                        if (!$scope.postType) {
                            alert('The post type is required');
                            return;
                        }
                        $scope.Url = urlSimplify($scope.Url);
                        var apiUrl = $scope.postType.Url;
                        apiUrl += "?";
                        apiUrl += "url=" + $scope.Url;
                        apiUrl += "&culture=" + $scope.CultureName;
                        $http({ method: 'GET', cache: true, url: apiUrl }).then(postLoaded, getPostError);
                    }

                    $scope.getHtmlTemplates = function() {
                        if ($scope.postType) {
                            var result = $scope[$scope.postType.HtmlTemplates];
                            return result;
                        }
                    }

                    $scope.changePostType = function() {
                        $scope.properties.HtmlTemplate.PropertyValue = null;
                        $scope.properties.PostType.PropertyValue = $scope.postType.Text;
                        $scope.Post = null;
                        $scope.Url = null;
                    }
                }
            ]);
        }

        return _this;
    }
}());