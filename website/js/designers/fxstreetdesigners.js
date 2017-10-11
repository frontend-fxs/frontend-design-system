(function () {
    window.FXStreetDesigners = {};
    FXStreetDesigners.Class = {};
}());
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
(function () {
    FXStreetDesigners.Class.SearchConfigurable = function ($, designerModule) {
        var _this = {};

        _this.init = function() {
        };

        return _this;
    }
}());
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
(function () {
    FXStreetDesigners.Class.BrokerDetails = function ($, designerModule) {
        var _this = {};

        _this.init = function () {
            designerModule.directive('ngEnter', function () {
                return function (scope, element, attrs) {
                    element.bind("keydown keypress", function (event) {
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
                        .then(
                            function (data) {
                                if (data) {
                                    $scope.properties = propertyService.toAssociativeArray(data.Items);
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

                            var getBrokers = function () {
                                var apiUrl = '/api/brokerapi/getitems?culturename=en&page=1&take=1000';
                                return $http({ method: 'GET', cache: true, url: apiUrl }).error(getError);
                            }
                            var getPairs = function () {
                                var apiUrl = '/api/assetapi/getassets?culturename=en';
                                return $http({ method: 'GET', cache: true, url: apiUrl }).error(getError);
                            }

                            $q.all([
                                getBrokers(),
                                getPairs()
                            ]).then(
                                function (arrayResponse) {
                                    $scope.Brokers = arrayResponse[0].data;
                                    $scope.Pairs = arrayResponse[1].data.Result;
                                });

                            $scope.PairIds = $.parseJSON($scope.properties.PairIds.PropertyValue) || [];

                            var updatePairs = function () {
                                $scope.properties.PairIds.PropertyValue = JSON.stringify($scope.PairIds);
                            }

                            $scope.GetPairsSelected = function () {
                                var result = [];
                                if ($scope.Pairs && $scope.PairIds) {
                                    result = $.grep($scope.Pairs, function (item) {
                                        return $scope.PairIds.findFirst(function (i) { return i === item.Id });
                                    });
                                }
                                return result;
                            }
                            $scope.AddPair = function () {
                                var pair = $scope.pairSelected;
                                if (pair) {
                                    var index = $scope.PairIds.indexOf(pair.Id);
                                    var exist = $scope.Pairs.indexOf(pair);
                                    if (index === -1 && exist !== -1) {
                                        $scope.PairIds.push(pair.Id);
                                        updatePairs();
                                    }
                                    $scope.pairSelected = null;
                                };
                            };
                            $scope.RemovePair = function (pair) {
                                var index = $scope.PairIds.indexOf(pair.Id);
                                if (index > -1) {
                                    $scope.PairIds.splice(index, 1);
                                    updatePairs();
                                }
                            }
                        });
                }
            ]);
        }

        return _this;
    }
}());
(function () {
    FXStreetDesigners.Class.BrokersList = function ($, designerModule) {
        var _this = {};

        _this.init = function() {
            designerModule.directive('ngEnter',
                function() {
                    return function(scope, element, attrs) {
                        element.bind("keydown keypress",
                            function(event) {
                                if (event.which === 13) {
                                    scope.$apply(function() {
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
                function($scope, $q, $log, $http, propertyService) {

                    propertyService.get()
                        .then(
                            function(data) {
                                if (data) {
                                    $scope.properties = propertyService.toAssociativeArray(data.Items);
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

                            var getPairs = function() {
                                var apiUrl = '/api/assetapi/getassets?culturename=en';
                                return $http({ method: 'GET', cache: true, url: apiUrl }).error(getError);
                            }

                            $q.all([
                                getPairs()
                            ]).then(
                                function(arrayResponse) {
                                    $scope.Pairs = arrayResponse[0].data.Result;
                                });

                            $scope.PairIds = $.parseJSON($scope.properties.PairIds.PropertyValue) || [];

                            var updatePairs = function() {
                                $scope.properties.PairIds.PropertyValue = JSON.stringify($scope.PairIds);
                            }

                            $scope.GetPairsSelected = function() {
                                var result = [];
                                if ($scope.Pairs && $scope.PairIds) {
                                    result = $.grep($scope.Pairs,
                                        function(item) {
                                            return $scope.PairIds.findFirst(function(i) { return i === item.Id });
                                        });
                                }
                                return result;
                            }
                            $scope.AddPair = function() {
                                var pair = $scope.pairSelected;
                                if (pair) {
                                    var index = $scope.PairIds.indexOf(pair.Id);
                                    var exist = $scope.Pairs.indexOf(pair);
                                    if (index === -1 && exist !== -1) {
                                        $scope.PairIds.push(pair.Id);
                                        updatePairs();
                                    }
                                    $scope.pairSelected = null;
                                };
                            };
                            $scope.RemovePair = function(pair) {
                                var index = $scope.PairIds.indexOf(pair.Id);
                                if (index > -1) {
                                    $scope.PairIds.splice(index, 1);
                                    updatePairs();
                                }
                            }
                        });
                }
            ]);
        }

        return _this;
    }
}());
(function () {
    FXStreetDesigners.Class.BrokerSpreads = function ($, designerModule) {
        var _this = {};

        _this.init = function() {
            designerModule.directive('ngEnter',
                function() {
                    return function(scope, element, attrs) {
                        element.bind("keydown keypress",
                            function(event) {
                                if (event.which === 13) {
                                    scope.$apply(function() {
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
                function($scope, $q, $log, $http, propertyService) {

                    propertyService.get()
                        .then(function(data) {
                                if (data) {
                                    $scope.properties = propertyService.toAssociativeArray(data.Items);
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
                            var getBrokers = function() {
                                var apiUrl = '/api/brokerapi/getitems?culturename=en&page=1&take=1000';
                                return $http({ method: 'GET', cache: true, url: apiUrl }).error(getError);
                            }
                            var getPairs = function() {
                                var apiUrl = '/api/assetapi/getassets?culturename=en';
                                return $http({ method: 'GET', cache: true, url: apiUrl }).error(getError);
                            }

                            $q.all([
                                getBrokers(),
                                getPairs()
                            ]).then(
                                function(arrayResponse) {
                                    $scope.Brokers = arrayResponse[0].data;
                                    $scope.Pairs = arrayResponse[1].data.Result;
                                });

                            $scope.showAllSpreadsButton = $
                                .parseJSON($scope.properties.ShowAllSpreadsButton.PropertyValue.toLowerCase());

                            $scope.SetShowAllSpreadsButton = function() {
                                $scope.properties.ShowAllSpreadsButton.PropertyValue = JSON
                                    .stringify($scope.showAllSpreadsButton);
                            }

                            $scope.Take = ($scope.properties.Take.PropertyValue);
                            $scope.BrokerIds = $.parseJSON($scope.properties.BrokerIds.PropertyValue) || [];
                            $scope.PairIds = $.parseJSON($scope.properties.PairIds.PropertyValue) || [];

                            var updateBrokers = function() {
                                $scope.properties.BrokerIds.PropertyValue = JSON.stringify($scope.BrokerIds);
                            }
                            var updatePairs = function() {
                                $scope.properties.PairIds.PropertyValue = JSON.stringify($scope.PairIds);
                            }
                            $scope.GetBrokersSelected = function() {
                                var result = [];
                                if ($scope.Brokers && $scope.BrokerIds) {
                                    result = $.grep($scope.Brokers,
                                        function(item) {
                                            return !!$scope.BrokerIds.findFirst(function(i) { return i === item.Id });
                                        });
                                }
                                return result;
                            }
                            $scope.AddBroker = function() {
                                var broker = $scope.brokerSelected;
                                if (broker) {
                                    var index = $scope.BrokerIds.indexOf(broker.Id);
                                    var exist = $scope.Brokers.indexOf(broker);
                                    if (index === -1 && exist !== -1) {
                                        $scope.BrokerIds.push(broker.Id);
                                        updateBrokers();
                                    }
                                    $scope.brokerSelected = null;
                                };
                            };
                            $scope.RemoveBroker = function(broker) {
                                var index = $scope.BrokerIds.indexOf(broker.Id);
                                if (index > -1) {
                                    $scope.BrokerIds.splice(index, 1);
                                    updateBrokers();
                                }
                            }

                            $scope.GetPairsSelected = function() {
                                var result = [];
                                if ($scope.Pairs && $scope.PairIds) {
                                    result = $.grep($scope.Pairs,
                                        function(item) {
                                            return $scope.PairIds.findFirst(function(i) { return i === item.Id });
                                        });
                                }
                                return result;
                            }
                            $scope.AddPair = function() {
                                var pair = $scope.pairSelected;
                                if (pair) {
                                    var index = $scope.PairIds.indexOf(pair.Id);
                                    var exist = $scope.Pairs.indexOf(pair);
                                    if (index === -1 && exist !== -1) {
                                        $scope.PairIds.push(pair.Id);
                                        updatePairs();
                                    }
                                    $scope.pairSelected = null;
                                };
                            };
                            $scope.RemovePair = function(pair) {
                                var index = $scope.PairIds.indexOf(pair.Id);
                                if (index > -1) {
                                    $scope.PairIds.splice(index, 1);
                                    updatePairs();
                                }
                            }
                        });
                }
            ]);
        }

        return _this;
    }
}());
(function () {
    FXStreetDesigners.Class.Cag = function ($, designerModule) {
        var parent = FXStreetDesigners.Class.Base($, designerModule),
        _this = FXStreet.Util.extendObject(parent);

        parent.onInit = function ($scope, properties) {
            if (properties.HideFullReportButton) {
                properties.HideFullReportButton.PropertyValue =  true;
            }
        }

        return _this;
    }
}());
(function () {
    FXStreetDesigners.Class.Calendar = function ($, designerModule) {
        var parent = FXStreetDesigners.Class.Base($, designerModule),
        _this = FXStreet.Util.extendObject(parent);

        var countryFilterList = [];

        parent.onInit = function ($scope, properties) {
            if (properties.CountryCode.PropertyValue !== undefined && properties.CountryCode.PropertyValue !== null && properties.CountryCode.PropertyValue !== "") {
                var list = properties.CountryCode.PropertyValue.split(",");
                list.forEach(function (code) {
                    var index = countryFilterList.indexOf(code);

                    if (index === -1) {
                        countryFilterList.push(code);
                    }
                });
            }
        };

        var getCountryByCode = function (countries, code) {
            var country = $.grep(countries, function (country) {
                return country.InternationalCode === code;
            });

            if (country.length > 0)
                return country[0];
            else
                return null;
        };

        parent.configureScope = function($scope) {
            $scope.CountryInsert = function() {
                var index = -1;
                var country = getCountryByCode($scope.CalendarCountries, $scope.country.InternationalCode);

                if (country !== null && country !== undefined) {
                    index = countryFilterList.indexOf(country.InternationalCode);
                }

                if (index === -1) {
                    countryFilterList.push(country.InternationalCode);
                    $scope.country = null;
                    $scope.properties.CountryCode.PropertyValue = countryFilterList.join();
                }
            };

            $scope.SelectableItems = function () {
                var result = $.grep($scope.CalendarCountries, function (country) {
                    return countryFilterList.indexOf(country.InternationalCode) === -1;
                });
                return result;
            };

            $scope.GetCountriesSelected = function () {
                var selectedList = [];
                countryFilterList.forEach(function (code) {
                    var country = getCountryByCode($scope.CalendarCountries, code);
                    selectedList.push(country);
                });
                return selectedList;
            };
            
            $scope.RemoveCountry = function (code) {
                var index = countryFilterList.indexOf(code);

                if (index > -1) {
                    countryFilterList.splice(index, 1);
                    $scope.properties.CountryCode.PropertyValue = countryFilterList.join();
                }
            }
        };

        return _this;
    }
}());
(function () {
    FXStreetDesigners.Class.ContentBlock = function ($, designerModule) {
        var parent = FXStreetDesigners.Class.Base($, designerModule),
                _this = FXStreet.Util.extendObject(parent);

        parent.ControllerName = 'CustomCtrl';

        _this.setAdvertiseLogic = function ($scope) {
            $scope.AdsSelector = function () {
                $scope.Ads_Popup.open();
            };

            $scope.AdsInsert = function () {
                if ($scope.RefreshSeconds !== 0 && $scope.AddsMinValidTimeInSecondsToRefresh > $scope.RefreshSeconds) {
                    alert("RefreshSeconds must be greatest than or equal to " + $scope.AddsMinValidTimeInSecondsToRefresh);
                    return;
                }

                var containerId = FXStreet.Util.guid();

                var json = {
                    "ContainerId": containerId,
                    "SlotName": $scope.SlotName,
                    "Labels": $scope.labels,
                    "MobileSize": $scope.MobileSize,
                    "TabletSize": $scope.TabletSize,
                    "DesktopSize": $scope.DesktopSize,
                    "DesktopHdSize": $scope.DesktopHdSize,
                    "RawSize": $scope.RawSize,
                    "RefreshSeconds": $scope.RefreshSeconds
                };

                var html = $("<div>")
                    .attr("id", containerId)
                    .attr("fxs_createevent", "load")
                    .attr("fxs_objtype", "Advertise" + $scope.AdvertiseType)
                    .attr("fxs_json", FXStreet.Util.serializeJsonForAttr(json));

                var range = editor.getRange();
                editor.exec("insertHtml", { html: html[0].outerHTML, split: true, range: range });
                $scope.Ads_Popup.close();
            };

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
        };

        _this.setImageLogic = function ($scope) {
            $scope.ImageSelector = function () {
                $scope.Image_Popup.open();
            };

            var setSizeOnImage = function (url, size) {
                var index = url.lastIndexOf(".");

                var result = url.substr(0, index) + "_" + size + url.substr(index, url.length);
                //result = result.replace(/\/images-input\//g, '/images/');
                return result;
            };

            $scope.OnImageSelected = function ($model) {

                var imageUrl = $model.Url;
                var imageSize = $scope.EditorialImageSizeToDisplayByDefault;

                if (imageUrl) {
                    $scope.ImageUrl = imageUrl;
                    $scope.ImageUrlThumbprint = setSizeOnImage(imageUrl, imageSize);
                }
            };

            $scope.ImageInsert = function () {

                var imageUrl = $scope.ImageUrl;
                var imageSize = $scope.ImageSize;
                var imageCaption = $scope.ImageCaption;

                var imageSelected = setSizeOnImage(imageUrl, imageSize);

                var imageHtml = $("<img>").attr("src", imageSelected).attr("alt", imageCaption);
                var html = $("<div>").attr("class", "fxs_entryFeatured_img").html(imageHtml);

                var range = editor.getRange();
                editor.exec("insertHtml", { html: html[0].outerHTML, split: true, range: range });
                $scope.Image_Popup.close();
            };

            $scope.RefreshImageList = function () {
                $.get($scope.EditorialImageRefreshMemoryCacheApiUrl).success(
                    function (data) {
                        $scope.ImageUrls = data;
                    }
                ).error(function (data) { });

            };

            $scope.dividerSelector = function () {
                $scope.Divider_Popup.open();
            };
        };

        _this.setDividersLogic = function ($scope) {
            $scope.DividerInsert = function () {
                var dividerClass = $scope.dividerType;

                var html = $("<hr>").attr("class", dividerClass);

                var range = editor.getRange();
                editor.exec("insertHtml", { html: html[0].outerHTML, split: true, range: range });
                $scope.Divider_Popup.close();
            };
        };

        parent.configureScope = function ($scope) {
            $scope.$on('kendoWidgetCreated', function (event, widget) {
                if (widget.wrapper && widget.wrapper.is('.k-editor')) {
                    editor = widget;
                }
            });

            _this.setAdvertiseLogic($scope);
            _this.setImageLogic($scope);
            _this.setDividersLogic($scope);
        };

        return _this;
    }
}());
(function () {
    FXStreetDesigners.Class.CtpSingleAsset = function ($, designerModule) {
        var parent = FXStreetDesigners.Class.Base($, designerModule),
        _this = FXStreet.Util.extendObject(parent);

        parent.onInit = function ($scope, properties) {
            if (properties.HideFullReportButton) {
                properties.HideFullReportButton.PropertyValue = properties.HideFullReportButton.PropertyValue === "True" ? true : false;
            }
        }

        return _this;
    }

    //Retrocompability dont remove this until youre shure its not used anymore
    FXStreetDesigners.Class.SingleAsset = function ($, designerModule) {
        var parent = FXStreetDesigners.Class.Base($, designerModule),
        _this = FXStreet.Util.extendObject(parent);

        parent.onInit = function ($scope, properties) {
            if (properties.HideFullReportButton) {
                properties.HideFullReportButton.PropertyValue = properties.HideFullReportButton.PropertyValue === "True" ? true : false;
            }
        }

        return _this;
    }
}());
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
(function () {
    FXStreetDesigners.Class.ForecastSingleAsset = function ($, designerModule) {
        var parent = FXStreetDesigners.Class.Base($, designerModule),
        _this = FXStreet.Util.extendObject(parent);

        parent.onInit = function ($scope, properties) {
            // Ignored
        }

        return _this;
    }
}());
(function () {
    FXStreetDesigners.Class.ForecastSingleAsset = function ($, designerModule) {
        var parent = FXStreetDesigners.Class.Base($, designerModule),
        _this = FXStreet.Util.extendObject(parent);

        parent.onInit = function ($scope, properties) {
            if (properties.HideFullReportButton) {
                properties.HideFullReportButton.PropertyValue = properties.HideFullReportButton.PropertyValue === "True" ? true : false;
            }
        }

        return _this;
    }
}());
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
(function () {
    FXStreetDesigners.Class.Latest = function ($, designerModule) {
        var parent = FXStreetDesigners.Class.Base($, designerModule),
        _this = FXStreet.Util.extendObject(parent);

        parent.onInit = function ($scope, properties) {
            if (properties.HideFullReportButton) {
                properties.HideFullReportButton.PropertyValue = properties.HideFullReportButton.PropertyValue === "True" ? true : false;
            }
        }

        return _this;
    }
}());
(function () {
    FXStreetDesigners.Class.MultiAsset = function ($, designerModule) {
        designerModule.directive('ngEnter', function () {
            return function (scope, element, attrs) {
                element.bind("keydown keypress", function (event) {
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
            '$scope',
            'propertyService',
            function ($scope, propertyService) {
                $scope.feedback.showLoadingIndicator = true;
                var assetFilterList = [];

                propertyService.get()
                    .then(function (data) {
                        if (data) {
                            $scope.properties = propertyService.toAssociativeArray(data.Items);
                            if ($scope.properties.HideFullReportButton) {
                                $scope.properties.HideFullReportButton.PropertyValue = $scope.properties.HideFullReportButton.PropertyValue === "True" ? true : false;
                            }

                            if ($scope.properties.ShowFilter) {
                                $scope.properties.ShowFilter.PropertyValue = $scope.properties.ShowFilter.PropertyValue === "True" ? true : false;
                            }
                            
                            if ($scope.properties.ShowHeaders) {
                                $scope.properties.ShowHeaders.PropertyValue = $scope.properties.ShowHeaders.PropertyValue === "True" ? true : false;
                            }
                            
                            if ($scope.properties.Assets.PropertyValue) {
                                assetFilterList = $scope.properties.Assets.PropertyValue.split(',');
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
                            $scope.properties.Assets.PropertyValue = assetFilterList.join(",");
                        });
                    })
                    .finally(function () {
                        $scope.feedback.showLoadingIndicator = false;
                    });

                $scope.AssetInsert = function () {
                    var index = -1;
                    var asset = GetAssetByName($scope.asset);

                    if (asset !== null) {
                        index = assetFilterList.indexOf(asset.Id);
                    }

                    if (index === -1) {
                        assetFilterList.push(asset.Id);
                        $scope.asset = null;
                    }
                }

                $scope.GetAssetsSelected = function () {
                    var selectedList = [];
                    assetFilterList.forEach(function (item) {
                        var asset = GetAssetById(item);
                        if (asset !== null)
                            selectedList.push(asset.Name);
                    });
                    return selectedList;
                }

                $scope.RemoveAsset = function (asset) {
                    var index = -1;
                    var asset = GetAssetByName(asset);
                    if (asset !== null) {
                        index = assetFilterList.indexOf(asset.Id);
                    }

                    if (index > -1) assetFilterList.splice(index, 1);
                }

                var GetAssetByName = function (name) {
                    var asset = $.grep($scope.Assets, function (e) { return e.Name === name; });

                    if (asset.length > 0)
                        return asset[0];
                    else
                        return null;
                };

                var GetAssetById = function (assetId) {
                    var asset = $.grep($scope.Assets, function (e) { return e.Id === assetId; });

                    if (asset.length > 0)
                        return asset[0];
                    else
                        return null;
                };

                $scope.SelectableItems = function () {
                    var result = $.grep($scope.Assets, function (asset) {
                        return assetFilterList.indexOf(asset.Id) === -1;
                    });
                    return result;
                };
            }
        ]);
    }
    FXStreetDesigners.Class.MultiAssetCurrencies = function ($, designerModule) {
        designerModule.directive('ngEnter', function () {
            return function (scope, element, attrs) {
                element.bind("keydown keypress", function (event) {
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
            '$scope',
            'propertyService',
            function ($scope, propertyService) {
                $scope.feedback.showLoadingIndicator = true;
                var assetFilterList = [];
                var currenciesFilterList = [];

                propertyService.get()
                    .then(function (data) {
                        if (data) {
                            $scope.properties = propertyService.toAssociativeArray(data.Items);
                            if ($scope.properties.HideFullReportButton) {
                                $scope.properties.HideFullReportButton.PropertyValue = $scope.properties.HideFullReportButton.PropertyValue === "True" ? true : false;
                            }

                            if ($scope.properties.Assets.PropertyValue) {
                                assetFilterList = $scope.properties.Assets.PropertyValue.split(',');
                            }
                            if ($scope.properties.Currencies.PropertyValue) {
                                currenciesFilterList = $scope.properties.Currencies.PropertyValue.split(',');
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
                            $scope.properties.Assets.PropertyValue = assetFilterList.join(",");
                            $scope.properties.Currencies.PropertyValue = currenciesFilterList.join(",");
                        });
                    })
                    .finally(function () {
                        $scope.feedback.showLoadingIndicator = false;
                    });

                $scope.AssetInsert = function () {
                    var index = -1;
                    var asset = GetAssetByName($scope.asset);

                    if (asset !== null) {
                        index = assetFilterList.indexOf(asset.Id);
                    }

                    if (index === -1) {
                        assetFilterList.push(asset.Id);
                        $scope.asset = null;
                    }
                }

                $scope.GetAssetsSelected = function () {
                    var selectedList = [];
                    assetFilterList.forEach(function (item) {
                        var asset = GetAssetById(item);
                        if (asset !== null)
                            selectedList.push(asset.Name);
                    });
                    return selectedList;
                }

                $scope.RemoveAsset = function (asset) {
                    var index = -1;
                    var asset = GetAssetByName(asset);
                    if (asset !== null) {
                        index = assetFilterList.indexOf(asset.Id);
                    }

                    if (index > -1) assetFilterList.splice(index, 1);
                }

                var GetAssetByName = function (name) {
                    var asset = $.grep($scope.Assets, function (e) { return e.Name === name; });

                    if (asset.length > 0)
                        return asset[0];
                    else
                        return null;
                };

                var GetAssetById = function (assetId) {
                    var asset = $.grep($scope.Assets, function (e) { return e.Id === assetId; });

                    if (asset.length > 0)
                        return asset[0];
                    else
                        return null;
                };

                $scope.SelectableItems = function () {
                    var result = $.grep($scope.Assets, function (asset) {
                        return assetFilterList.indexOf(asset.Id) === -1;
                    });
                    return result;
                };

                $scope.CurrencyInsert = function () {
                    var index = -1;
                    var currency = GetCurrencyByName($scope.currency);

                    if (currency !== null) {
                        index = currenciesFilterList.indexOf(currency.Id);
                    }

                    if (index === -1) {
                        currenciesFilterList.push(currency.Id);
                        $scope.currency = null;
                    }
                }

                $scope.GetCurrenciesSelected = function () {
                    var selectedList = [];
                    currenciesFilterList.forEach(function (item) {
                        var currency = GetCurrencyById(item);
                        if (currency !== null)
                            selectedList.push(currency.Name);
                    });
                    return selectedList;
                }

                $scope.RemoveCurrency = function (currency) {
                    var index = -1;
                    var currency = GetCurrencyByName(currency);
                    if (currency !== null) {
                        index = currenciesFilterList.indexOf(currency.Id);
                    }

                    if (index > -1) currenciesFilterList.splice(index, 1);
                }

                var GetCurrencyByName = function (name) {
                    var currency = $.grep($scope.Currencies, function (e) { return e.Name === name; });

                    if (currency.length > 0)
                        return currency[0];
                    else
                        return null;
                };

                var GetCurrencyById = function (currencyId) {
                    var currency = $.grep($scope.Currencies, function (e) { return e.Id === currencyId; });

                    if (currency.length > 0)
                        return currency[0];
                    else
                        return null;
                };

                $scope.SelectableItemsCurrencies = function () {
                    var result = $.grep($scope.Currencies, function (currency) {
                        return currenciesFilterList.indexOf(currency.Id) === -1;
                    });
                    return result;
                };
            }
        ]);
    }
}());
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
(function () {
    FXStreetDesigners.Class.PostListMultiFeed = function ($, designerModule) {
        var parent = FXStreetDesigners.Class.Base($, designerModule),
            _this = FXStreet.Util.extendObject(parent);

        var tags = [];
        var feeds = [];
        
        var insertItem = function (itemId, allItems, selectedItems) {
            if (!itemId) {
                alert('You have to select an item');
                return;
            }

            var itemFinded = $.grep(allItems, function (e) { return e.Id === itemId; });
            if (itemFinded.length <= 0) {
                alert('Invalid item');
                return;
            }

            var item = itemFinded[0];

            var exists = $.grep(selectedItems, function (e) { return e.Id === item.Id; }).length > 0;

            if (exists) {
                alert('The item already exists');
                return;
            }

            selectedItems.push(item);
        };

        var removeSelectedItem = function (item, selectedItems) {
            var result = $.grep(selectedItems, function (e) {
                return e.Id !== item.Id;
            });

            return result;
        };

        var getItemById = function (items, id) {
            var item = $.grep(items, function (e) {
                return e.Id === id;
            });

            var result = item.length > 0 ? item[0] : null;
            return result;
        };

        var initializeItems = function (ids, allItems, selectedItems) {
            for (var i = 0; i < ids.length; i++) {
                var id = ids[i];
                if (!id) {
                    continue;
                }

                var item = getItemById(allItems, id);

                if (selectedItems !== null) {
                    selectedItems.push(item);
                }
            }
        };

        var getItemPropertyValue = function (selectedItems) {
            var value = null;
            if (selectedItems.length > 0) {
                value = selectedItems[0].Id;

                for (var i = 1; i < selectedItems.length; i++) {
                    value += ',' + selectedItems[i].Id;
                }
            }

            return value;
        };

        parent.onPush = function ($scope) {
            $scope.properties.TagIds.PropertyValue = getItemPropertyValue(tags);
            $scope.properties.FeedIds.PropertyValue = getItemPropertyValue(feeds);
        };

        parent.onInit = function ($scope, properties) {
            if ($scope.properties.HighlightedFirstItem) {
                $scope.properties.HighlightedFirstItem.PropertyValue = $scope.properties.HighlightedFirstItem.PropertyValue === "True" ? true : false;
            }

            if ($scope.properties.WithImage) {
                $scope.properties.WithImage.PropertyValue = $scope.properties.WithImage.PropertyValue === "True" ? true : false;
            }

            if ($scope.properties.Take) {
                $scope.properties.Take.PropertyValue = parseInt($scope.properties.Take.PropertyValue);
            } else {
                $scope.properties.Take.PropertyValue = 0;
            }

            if ($scope.properties.TagIds) {
                var tagIds = $scope.properties.TagIds.PropertyValue.split(',');
                initializeItems(tagIds, $scope.Tags, tags);
            }

            if ($scope.properties.FeedIds) {
                var feedIds = $scope.properties.FeedIds.PropertyValue.split(',');
                initializeItems(feedIds, $scope.Feeds, feeds);
            }

            if ($scope.properties.SizeId) {
                $scope.size = $scope.properties.SizeId.PropertyValue;
            }
        };

        parent.configureScope = function ($scope) {
            $scope.TagInsert = function() {
                insertItem($scope.tag, $scope.Tags, tags);
            };
            $scope.GetTagsSelected = function () {
                return tags;
            };
            $scope.RemoveTag = function (tag) {
                tags = removeSelectedItem(tag, tags);
            };

            $scope.FeedInsert = function () {
                insertItem($scope.feed, $scope.Feeds, feeds);
            };
            $scope.GetFeedsSelected = function () {
                return feeds;
            };
            $scope.RemoveFeed = function (feed) {
                feeds = removeSelectedItem(feed, feeds);
            };

            $scope.SizeChange = function () {
                $scope.properties.SizeId.PropertyValue = $scope.size;
            };
        };

        return _this;
    }
}());
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
(function () {
    FXStreetDesigners.Class.SearchConfigurable = function ($, designerModule) {
        var _this = {};

        _this.init = function() {
            designerModule.controller('SimpleCtrl',
            [
                '$scope', 'propertyService',
                function ($scope, propertyService) {

                    propertyService.get()
                    .then(
                        function (data) {
                            if (data) {
                                $scope.properties = propertyService.toAssociativeArray(data.Items);

                                _this.setCheckboxValue($scope.properties.ShowTitle);
                                _this.setCheckboxValue($scope.properties.ShowClearAll);
                                _this.setCheckboxValue($scope.properties.ShowResultsFound);
                                _this.setCheckboxValue($scope.properties.ShowSearchBox);
                                _this.setCheckboxValue($scope.properties.HideFiltersOnMobile);
                                _this.setCheckboxValue($scope.properties.AllowFiltersCollapse);
                                _this.setCheckboxValue($scope.properties.ShowTagFilter);
                                _this.setCheckboxValue($scope.properties.ShowAuthorFilter);
                                _this.setCheckboxValue($scope.properties.ShowResultImage);
                            }
                        }
                    );
                }
            ]);
        };

        _this.setCheckboxValue = function(property) {
            if (property && typeof property.PropertyValue === "string") {
                property.PropertyValue = property.PropertyValue.toLowerCase();
                property.PropertyValue = property.PropertyValue === "true" ? true : false;
            }
        };

        return _this;
    }
}());
(function () {
    FXStreetDesigners.Class.SingleAsset = function ($, designerModule) {
        var parent = FXStreetDesigners.Class.Base($, designerModule),
        _this = FXStreet.Util.extendObject(parent);

        parent.onInit = function ($scope, properties) {
            if (properties.HideFullReportButton) {
                properties.HideFullReportButton.PropertyValue = properties.HideFullReportButton.PropertyValue === "True" ? true : false;
            }
        }

        return _this;
    }
}());
(function () {
    FXStreetDesigners.Class.StaticAlert = function ($, designerModule) {
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
                            }).then(function() {
                            $scope.feedback.savingHandlers.push(function() {
                                $scope.properties.AlertType.PropertyValue = $scope.HtmlTemplateSelected.Name;
                            });
                        }).finally(function() {
                            $scope.feedback.showLoadingIndicator = false;
                        });
                }
            ]);
        }

        return _this;
    }
}());
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
(function () {
    FXStreetDesigners.Class.TextOverCustomImage = function ($, designerModule) {
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
                                        if ($scope.properties.TextOverType.PropertyValue !== null ||
                                            $scope.properties.TextOverType.PropertyValue !== undefined) {
                                            var template = $scope.HtmlTemplates
                                                .filter(function(item) {
                                                    return item.Name === $scope.properties.TextOverType.PropertyValue
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
                                $scope.properties.TextOverType.PropertyValue = $scope.HtmlTemplateSelected.Name;
                                $scope.properties.HtmlTemplateFile.PropertyValue = $scope.HtmlTemplateSelected.File;
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
(function () {
    FXStreetDesigners.Class.AssetTranslationsWidget = function ($, designerModule) {
        var parent = FXStreetDesigners.Class.Base($, designerModule),
        _this = FXStreet.Util.extendObject(parent);

        parent.onInit = function ($scope, properties) {
        
        }

        return _this;
    }
}());