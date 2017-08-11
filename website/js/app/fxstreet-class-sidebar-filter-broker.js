(function () {
    FXStreet.Class.Sidebar.FilterBroker = function () {
        var parent = FXStreet.Class.Base(),
          _this = FXStreet.Util.extendObject(parent);

        //#region Json properties

        _this.Brokers = [];
        _this.FilterChangeDelegate = null;
        _this.ApplyFiltersBtnId = "";
        _this.CancelBtnId = "";
        _this.BusinessNatureSelectId = "";
        _this.RegulationsCheckBoxGroupId = "";
        _this.MinDepositInputId = "";
        _this.MaxLeverageInputId = "";
        _this.FilterBtnId = "";
        _this.FilterHeaderContainerId = "";

        //#endregion

        //#region Html elements

        _this.ApplyFiltersBtn = null;
        _this.CancelBtn = null;
        _this.BusinessNatureSelect = null;
        _this.RegulationsCheckBoxGroup = null;
        _this.MinDepositInput = null;
        _this.MaxLeverageInput = null;
        _this.FilterBtnId = null;
        _this.FilterHeaderContainer = null;

        //#endregion

        //#region Filter options

        _this.FilteredBrokers = [];
        _this.BusinessNatures = [];
        _this.Regulations = [];

        _this.BusinessNatureSelected = [];
        _this.RegulationsSelected = [];
        _this.MinDepositSelected = 0;
        _this.MaxLeverageSelected = 0;

        //#endregion

        //#region Initialization

        _this.init = function (json) {
            _this.setSettingsByObject(json);
            _this.setVars();
            _this.addEvents();
        };

        _this.setVars = function () {
            _this.Brokers = _this.Brokers.slice();
            _this.ApplyFiltersBtn = FXStreet.Util.getjQueryObjectById(_this.ApplyFiltersBtnId);
            _this.CancelBtn = FXStreet.Util.getjQueryObjectById(_this.CancelBtnId);
            _this.BusinessNatureSelect = FXStreet.Util.getjQueryObjectById(_this.BusinessNatureSelectId);
            _this.RegulationsCheckBoxGroup = FXStreet.Util.getjQueryObjectById(_this.RegulationsCheckBoxGroupId);
            _this.MinDepositInput = FXStreet.Util.getjQueryObjectById(_this.MinDepositInputId);
            _this.MaxLeverageInput = FXStreet.Util.getjQueryObjectById(_this.MaxLeverageInputId);
            _this.FilterBtn = FXStreet.Util.getjQueryObjectById(_this.FilterBtnId);
            _this.FilterHeaderContainer = FXStreet.Util.getjQueryObjectById(_this.FilterHeaderContainerId);

            _this.fillDefaultData();
            _this.populateFields();
        };

        _this.addEvents = function () {
            _this.ApplyFiltersBtn.click(_this.ApplyFiltersBtnClick);
            _this.CancelBtn.click(_this.cancelBtnClick);
            _this.BusinessNatureSelect.change(_this.businessNatureSelectChange);
            _this.MinDepositInput.blur(_this.minDepositInputOnBlur);
            _this.MaxLeverageInput.blur(_this.maxLeverageInputOnBlur);
            _this.RegulationsCheckBoxGroup.find("input[type=checkbox]").click(_this.regulationsCheckClick);
            _this.FilterBtn.click(_this.filterBtnClick);
        };

        //#endregion

        //#region Events

        _this.ApplyFiltersBtnClick = function () {
            _this.FilteredBrokers = _this.Brokers.slice();
            _this.FilteredBrokers = _this.filterByBusinessNature(_this.FilteredBrokers);
            _this.FilteredBrokers = _this.filterByRegulations(_this.FilteredBrokers);
            _this.FilteredBrokers = _this.filterByMinDeposit(_this.FilteredBrokers);
            _this.FilteredBrokers = _this.filterByMaxLeverage(_this.FilteredBrokers);
            _this.FilterChangeDelegate(_this.FilteredBrokers.slice());
        };

        _this.cancelBtnClick = function () {
            _this.FilterHeaderContainer.toggleClass("active");
        };

        _this.filterBtnClick = function () {
            _this.FilterHeaderContainer.toggleClass("active");
        };

        _this.businessNatureSelectChange = function () {
            var option = _this.BusinessNatureSelect.find("option:selected");
            if (!option || option.val() === "" || option.index() === 0) {
                _this.BusinessNatureSelected = [];
                return;
            }

            _this.BusinessNatureSelected.push(option.val());
        };

        _this.regulationsCheckClick = function () {
            var value = $(this).val();

            if (this.checked === true) {
                _this.RegulationsSelected.push(value);
            } else {
                _this.RegulationsSelected = $.grep(_this.RegulationsSelected, function (regulation) {
                    return regulation !== value;
                });
            }
        }; 

        _this.minDepositInputOnBlur = function () {
            var value = _this.MinDepositInput.val();
            if ($.isNumeric(value)) {
                _this.MinDepositSelected = parseFloat(value);
            } else {
                _this.MinDepositSelected = 0;
            }
        };

        _this.maxLeverageInputOnBlur = function () {
            var value = _this.MaxLeverageInput.val();
            if ($.isNumeric(value)) {
                _this.MaxLeverageSelected = parseInt(value);
            } else {
                _this.MaxLeverageSelected = 0;
            }
        };

        //#endregion

        _this.fillDefaultData = function () {
            $.each(_this.Brokers, function (index, broker) {
                if (broker.BusinessNature !== null && broker.BusinessNature && broker.BusinessNature.length > 0) {
                    _this.BusinessNatures = $.merge(_this.BusinessNatures, broker.BusinessNature);
                }
                if (broker.Regulated !== null && broker.Regulated && broker.Regulated.length > 0) {
                    _this.Regulations = $.merge(_this.Regulations, broker.Regulated);
                }
            });

            _this.BusinessNatures = $.unique(_this.BusinessNatures);
            _this.Regulations = $.unique(_this.Regulations);
        };

        _this.populateFields = function () {
            $.each(_this.BusinessNatures, function (index, value) {
                _this.BusinessNatureSelect.append($('<option></option>').val(value).html(value));
            });

            var regulationHtml = "";
            $.each(_this.Regulations, function (index, value) {
                regulationHtml += '<label class="fxs_checkboxGroup"><input type="checkbox" value="' + value + '"/>' + value + '</label>';
            });
            _this.RegulationsCheckBoxGroup.html(regulationHtml);
        };

        _this.filterByBusinessNature = function (filteredBrokers) {
            if (_this.BusinessNatureSelected === null || _this.BusinessNatureSelected.length === 0) {
                return filteredBrokers;
            }

            filteredBrokers = $.grep(filteredBrokers, function (broker, i) {
                if (!broker.BusinessNature) {
                    return false;
                }

                var hasBusinessNature = $(broker.BusinessNature).filter(_this.BusinessNatureSelected).length > 0;
                return hasBusinessNature;
            });

            return filteredBrokers;
        };

        _this.filterByRegulations = function (filteredBrokers) {
            if (_this.RegulationsSelected === null || _this.RegulationsSelected.length === 0) {
                return filteredBrokers;
            }

            filteredBrokers = $.grep(filteredBrokers, function (broker, i) {
                if (!broker.Regulated) {
                    return false;
                }

                var hasRegulations = $(broker.Regulated).filter(_this.RegulationsSelected).length > 0;
                return hasRegulations;
            });

            return filteredBrokers;
        };

        _this.filterByMinDeposit = function (filteredBrokers) {
            if (_this.MinDepositSelected === 0) {
                return filteredBrokers;
            }

            filteredBrokers = $.grep(filteredBrokers, function (broker, i) {
                if (!broker.AccountTypes) {
                    return false;
                }

                var hasMinDeposit = $.grep(broker.AccountTypes, function (accounType, j) {
                    var minPriceStr = /\d+(?:\.\d+)?/.exec(accounType.MinPrice);
                    if (minPriceStr.length > 0) {
                        minPriceStr = minPriceStr[0].replace(',', '.');
                    } else {
                        minPriceStr = "0";
                    }
                    var minPrice = parseFloat(minPriceStr);
                    return minPrice >= _this.MinDepositSelected;
                });

                return hasMinDeposit.length > 0;
            });

            return filteredBrokers;
        };

        _this.filterByMaxLeverage = function (filteredBrokers) {
            if (_this.MaxLeverageSelected === 0) {
                return filteredBrokers;
            }

            filteredBrokers = $.grep(filteredBrokers, function (broker, i) {
                var hasMaxLeverage = broker.Leverage >= _this.MaxLeverageSelected;
                return hasMaxLeverage;
            });

            return filteredBrokers;
        };

        return _this;
    };
}());
