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