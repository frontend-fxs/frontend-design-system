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