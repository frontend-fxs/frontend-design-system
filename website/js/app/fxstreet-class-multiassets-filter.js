(function () {
    FXStreet.Class.MultiAssetsFilter = function () {
        var parent = FXStreet.Class.Base(),
            _this = FXStreet.Util.extendObject(parent);

        _this.SelectedAssetsId = "";
        _this.ApplyFilterId = "";
        _this.DefaultAssets = {};
        _this.ClearFilterId = "";
        _this.AdvancedFilterId = "";
        _this.CloseAdvancedFilterId = "";
        _this.AssetsAddedId = "";
        _this.FilterSectionId = "";
        _this.FindBy_Options = [];
        _this.OptionSelectedDelegate = null;
        _this.GetAssetsUserSettingDelegate = null;
        _this.TypeaheadJsonInitialization = {};
        _this.Translations = {};

        _this.SelectedAssetsContainer = null;
        _this.ApplyFilter = null;
        _this.AdvancedFilter = null;
        _this.CloseAdvancedFilter = null;
        _this.FilterSection = null;
        _this.AssetsAddedContainer = null;
        _this.PreSelectedAssets = {};
        _this.SelectedAssets = {};

        _this.IsOpened = false;

        var searchedQuery = null;
        var typeaheadObj = null;

        _this.init = function (json) {
            _this.setSettingsByObject(json);
            _this.SetVarsEvents();
        };

        _this.SetVarsEvents = function () {
            _this.setVars();
            _this.addEvents();
            initTypeahead();
        };

        _this.setVars = function () {
            _this.SelectedAssetsContainer = FXStreet.Util.getjQueryObjectById(_this.SelectedAssetsId, false);
            _this.ApplyFilter = FXStreet.Util.getjQueryObjectById(_this.ApplyFilterId, false);
            _this.ClearFilter = FXStreet.Util.getjQueryObjectById(_this.ClearFilterId, false);
            _this.AdvancedFilter = FXStreet.Util.getjQueryObjectById(_this.AdvancedFilterId, false);
            _this.CloseAdvancedFilter = FXStreet.Util.getjQueryObjectById(_this.CloseAdvancedFilterId, false);
            _this.FilterSection = FXStreet.Util.getjQueryObjectById(_this.FilterSectionId, false);
            _this.AssetsAddedContainer = FXStreet.Util.getjQueryObjectById(_this.AssetsAddedId, false);

            _this.SelectedAssets = _this.GetAssetsUserSettingDelegate();
        };

        _this.addEvents = function () {
            _this.ApplyFilter.click(_this.applyFilterOnClick);
            _this.ClearFilter.click(_this.cancelFilterOnClick);
            _this.AdvancedFilter.click(_this.customFilterOnClick);
            _this.CloseAdvancedFilter.click(_this.applyNoneFilterOnClick);
        };

        var renderPreSelectedAssets = function () {
            _this.SelectedAssetsContainer.html('');
            for (var assetId in _this.PreSelectedAssets) {
                if (_this.PreSelectedAssets.hasOwnProperty(assetId)) {
                    var asset = _this.PreSelectedAssets[assetId];
                    var li = getPreSelectedAssetElement(asset);
                    _this.SelectedAssetsContainer.append(li);   
                }
            }
            updateCounter(_this.PreSelectedAssets);
        };

        var getPreSelectedAssetElement = function (asset) {
            var i = $('<i>')
                .addClass('fa fa-minus-circle')
                    .attr('aria-hidden', 'true');

            var div = $('<div>').html(asset.display);
            var li = $('<li>').append(div).append(i);
            li.click(function () { removePreSelectedAsset(asset, li); });
            return li;
        };

        var removePreSelectedAsset = function (asset, element) {
            delete _this.PreSelectedAssets[asset.id];
            element.remove();
            updateCounter(_this.PreSelectedAssets);
        };

        var updateCounter = function (assetsObj) {
            var numberOfAssets = (Object.keys(assetsObj).length);
            var assetCounter = _this.Translations.AssetCounterNumber.replace("{0}", numberOfAssets);
            $('.fxs_assets_number').html(assetCounter);
        };

        _this.applyFilterOnClick = function () {
            _this.showAssetsChangedMessage();

            _this.SelectedAssets = $.extend(true, {}, _this.PreSelectedAssets);
            _this.OptionSelectedDelegate(_this.SelectedAssets);
            _this.toggleFilterVisibility(false);
        };

        _this.cancelFilterOnClick = function () {
            _this.toggleFilterVisibility(false);
        };

        _this.customFilterOnClick = function () {
            typeaheadObj.TypeaheadInput["0"].value = "";
            _this.SelectedAssets = _this.GetAssetsUserSettingDelegate();
            _this.PreSelectedAssets = {};

            if (!_this.SelectedAssets || (Object.keys(_this.SelectedAssets).length === 0
                && Object.keys(_this.DefaultAssets).length > 0)) {
                _this.SelectedAssets = $.extend(true, {}, _this.DefaultAssets);
            }

            _this.PreSelectedAssets = $.extend(true, {}, _this.SelectedAssets);

            _this.toggleFilterVisibility(true);

            renderPreSelectedAssets();
        };

        _this.applyNoneFilterOnClick = function () {
            _this.showCustomSettingsRemovedMessage();

            _this.SelectedAssets = {};
            _this.OptionSelectedDelegate(_this.SelectedAssets);

            _this.toggleFilterVisibility(false);
        };
        
        _this.showAssetsChangedMessage = function () {
            _this.AssetsAddedContainer[0].textContent = _this.Translations.FilterAssetsAdded;
            _this.AssetsAddedContainer.show().delay(2000).fadeOut();
        };

        _this.showCustomSettingsRemovedMessage = function () {
            _this.AssetsAddedContainer[0].textContent = _this.Translations.CustomAssetsRemoved;
            _this.AssetsAddedContainer.show().delay(2000).fadeOut();
        };

        _this.toggleFilterVisibility = function (display) {
            _this.AdvancedFilter.toggle(!display);
            _this.CloseAdvancedFilter.toggle(display);
            _this.FilterSection.toggleClass("active", display);
            $('.fxs_listView_blockWrapper').toggleClass('fxs_blur_effect', display);
            _this.IsOpened = display;
        };

        var initTypeahead = function () {
            _this.TypeaheadJsonInitialization.FindBy_Options = _this.FindBy_Options;
            _this.TypeaheadJsonInitialization.CloseDelegated = closeDelegated;
            _this.TypeaheadJsonInitialization.OnLayoutBuiltBeforeDelegate = onLayoutBuiltBeforeDelegate;
            _this.TypeaheadJsonInitialization.OnClickBeforeDelegate = onClickBeforeDelegate;
            typeaheadObj = new FXStreet.Class.Sidebar.Typeahead();
            typeaheadObj.init(_this.TypeaheadJsonInitialization);
        };

        var closeDelegated = function () { 
        };

        var onLayoutBuiltBeforeDelegate = function (node, query, result, resultHtmlList) {
            searchedQuery = query;
            $('#typeaheadTarget').html(searchedQuery);
            if (resultHtmlList != null && resultHtmlList.children().length >= 1 && !resultHtmlList.children().first().hasClass('typeahead__empty')) {
                resultHtmlList.children().each(function (index, item) {
                    renderTypeaheadItem($(item).find('a'));
                });
            }
            return resultHtmlList;
        };

        var renderTypeaheadItem = function (typeaheadItem) {
            var span = $('<span>')
                .attr('aria-hidden', 'true')
                .addClass('fa');

            var spanClass = "fa-plus-circle";

            if (_this.PreSelectedAssets !== null) {
                for (var assetId in _this.PreSelectedAssets) {
                    if (_this.PreSelectedAssets.hasOwnProperty(assetId)) {
                        var asset = _this.PreSelectedAssets[assetId];
                        if (asset.display === typeaheadItem.text()) {
                            spanClass = "fa-check";
                            break;
                        }
                    }
                }
            }
            span.addClass(spanClass);
            typeaheadItem.append(span);

            typeaheadItem.click(function () {
                span.toggleClass("fa-plus-circle fa-check");
            });
        };

        var onClickBeforeDelegate = function (node, a, item, event) {
            event.preventDefault();

            if (_this.PreSelectedAssets[item.id]) {
                delete _this.PreSelectedAssets[item.id];
            }
            else {
                _this.PreSelectedAssets[item.id] = item;
            }
            renderPreSelectedAssets();
            return true;
        };

        return _this;
    };

    FXStreet.Class.SideBarMultiassetFilter = function() {
        var parent = FXStreet.Class.MultiAssetsFilter(),
          _this = FXStreet.Util.extendObject(parent);

        _this.FilterStateLabelId = "";

        var filterStateLabel = null;
        var filterStateLabelText = "";

        var filterState = {
            Default: 1,
            Opened: 2,
            Customized: 3,
            Canceled: 4
        };

        _this.init = function (json) {
            parent.init(json);
            _this.setSettingsByObject(json);
            _this.setVars();
        };

        _this.setVars = function() {
            filterStateLabel = FXStreet.Util.getjQueryObjectById(_this.FilterStateLabelId, false);
            if (filterStateLabel != null) {
                filterStateLabelText = filterStateLabel[0].textContent;
            }
        };

        var parentApplyFilterOnClick = parent.applyFilterOnClick;
        parent.applyFilterOnClick = function () {
            parentApplyFilterOnClick();
            changedFilterState(filterState.Customized);
        };

        var parentCancelFilterOnClick = parent.cancelFilterOnClick;
        parent.cancelFilterOnClick = function () {
            parentCancelFilterOnClick();
            changedFilterState(filterState.Canceled);
        };

        var parentCustomFilterOnClick = parent.customFilterOnClick;
        parent.customFilterOnClick = function () {
            parentCustomFilterOnClick();
            changedFilterState(filterState.Opened);
        };

        var parentApplyNoneFilterOnClick = parent.applyNoneFilterOnClick;
        parent.applyNoneFilterOnClick = function () {
            parentApplyNoneFilterOnClick();
            changedFilterState(filterState.Default);
        };

        var changedFilterState = function (state) {
            var text = "";
            switch (state) {
                case filterState.Customized:
                    text = _this.Translations["Filter_Customized"];
                    filterStateLabelText = text;
                    break;
                case filterState.Opened:
                    text = _this.Translations["Filter_Opened"];
                    break;
                case filterState.Canceled:
                    text = filterStateLabelText;
                    if (text === _this.Translations["Assets"]) {
                        text += " " + buildTooltip();
                    }
                    break;
                case filterState.Default:
                default:
                    text = _this.Translations["Assets"] + " " + buildTooltip();
                    filterStateLabelText = text;
                    break;
            }
            if (filterStateLabel != null) {
                filterStateLabel[0].innerHTML = text;
                FXStreet.Util.SetTooltip();
            }
        };

        var buildTooltip = function() {
            var tooltipTemplate = "<i class=\"fa fa-info-circle\" data-toggle=\"tooltip\" data-placement=\"bottom\" title=\"{0}\" data-original-title=\"{1}\"></i>";
            var result = tooltipTemplate.replace('{0}', _this.Translations["Filter_Description"])
                                        .replace('{1}', _this.Translations["Filter_Description"]);
            return result;
        };

        return _this;
    };

    FXStreet.Class.RatesFilter = function () {
        var parent = FXStreet.Class.MultiAssetsFilter(),
          _this = FXStreet.Util.extendObject(parent);

        _this.ModalContainerId = "";
        _this.PopupContainerId = "";
        _this.PopupApplyId = "";
        _this.PopupCancelId = "";
        _this.FilterStateLabelId = "";
        _this.DefaultWidgetTitle = "";

        _this.ModalContainer = null;
        _this.PopupContainer = null;
        _this.PopupApply = null;
        _this.PopupCancel = null;

        var filterStateLabel = null;
        var filterStateLabelText = "";

        var filterState = {
            Default: 1,
            Customized: 2
        };

        _this.init = function (json) {
            parent.init(json);
            _this.setSettingsByObject(json);
            _this.setVars();
            _this.addEvents();
        };

        _this.setVars = function () {
            _this.ModalContainer = FXStreet.Util.getjQueryObjectById(_this.ModalContainerId, false);
            _this.PopupContainer = FXStreet.Util.getjQueryObjectById(_this.PopupContainerId, false);
            _this.PopupApply = FXStreet.Util.getjQueryObjectById(_this.PopupApplyId, false);
            _this.PopupCancel = FXStreet.Util.getjQueryObjectById(_this.PopupCancelId, false);

            filterStateLabel = FXStreet.Util.getjQueryObjectById(_this.FilterStateLabelId, false);
            if (Object.keys(_this.SelectedAssets).length > 0) {
                changedFilterState(filterState.Customized);
            }
        };

        _this.addEvents = function() {
            _this.PopupApply.click(onPopupApplyClick);
            _this.PopupCancel.click(onPopupCancelClick);
        };

        var parentApplyFilterOnClick = parent.applyFilterOnClick;
        parent.applyFilterOnClick = function () {
            parentApplyFilterOnClick();
            changedFilterState(filterState.Customized);
        };

        var parentApplyNoneFilterOnClick = parent.applyNoneFilterOnClick;
        parent.applyNoneFilterOnClick = function () {
            if (hasToShowPopup()) {
                togglePopupVisibility(true);
            } else {
                parentApplyNoneFilterOnClick();
                changedFilterState(filterState.Default);
            }
        };

        var changedFilterState = function (state) {
            var text = "";
            switch (state) {
                case filterState.Customized:
                    text = _this.Translations["Filter_Customized"];
                    filterStateLabelText = text;
                    break;
                case filterState.Default:
                default:
                    text = _this.DefaultWidgetTitle;
                    break;
            }
            if (filterStateLabel != null) {
                filterStateLabel[0].textContent = text;
            }
        };

        var hasToShowPopup = function () {
            var result = FXStreet.Util.haveSameProperties(_this.SelectedAssets, _this.DefaultAssets);
            return !result;
        };

        var onPopupApplyClick = function () {
            togglePopupVisibility(false);
            changedFilterState(filterState.Default);
            parentApplyNoneFilterOnClick();
        };

        var onPopupCancelClick = function () {
            togglePopupVisibility(false);
        };

        parent.toggleFilterVisibility = function (display) {
            _this.FilterSection.toggleClass("fxs_hideElements", !display);
            _this.IsOpened = display;
        };

        var togglePopupVisibility = function(display) {
            _this.ModalContainer.toggleClass("fxs_hideElements", display);
            _this.PopupContainer.toggleClass("fxs_hideElements", !display);
        };

        return _this;
    };
}());
