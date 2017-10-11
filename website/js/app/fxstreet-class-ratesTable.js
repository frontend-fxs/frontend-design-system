(function () {
    FXStreet.Class.RatesTable = function () {
        var parent = FXStreet.Class.Base(),
        _this = FXStreet.Util.extendObject(parent);
        _this.HtmlTemplateFile = "ratestable_default.html";

        var ratesTableDataManager = null;

        _this.init = function (json) {
            _this.setSettingsByObject(json);
            _this.setVars(json);
            _this.htmlRender(json);
        };

        _this.setVars = function (json) {
            _this.ContainerId = json.ContainerId;
            _this.Container = FXStreet.Util.getjQueryObjectById(_this.ContainerId);
        };

        _this.htmlRender = function (json) {
            FXStreet.Util.loadHtmlTemplate(_this.HtmlTemplateFile).done(function (template) {
                renderDefaultTemplate(json, template);
                renderRatesTableItems(json);
            });
        };

        var renderDefaultTemplate = function (json, template) {
            var htmlData = { IsActiveHeader: json.IsActiveHeader, ContainerId: json.ContainerId };
            var rendered = FXStreet.Util.renderByHtmlTemplate(template, htmlData);
            _this.Container.html(rendered);
        };

        var renderRatesTableItems = function (json) {
            if (json.IsActiveHeader) {
                json.MyAssetIds = FXStreet.Class.MyAssetsList.get();
            }

            renderDataManagers(json);

            if (json.IsActiveHeader) {
                renderHeaderManagers(json);
            };
        };

        var renderDataManagers = function (json) {
            ratesTableDataManager = new FXStreet.Class.RatesTableDataManager();
            var jsonObj = $.extend(true, {}, json);

            if (json.MyAssetIds) {
                getMyAssetList(json.MyAssetIds).done(function (data) {
                    jsonObj.Assets = data;
                    ratesTableDataManager.init(jsonObj);
                });
            } else {
                ratesTableDataManager.init(jsonObj);
            }
        };

        var getMyAssetList = function (assetIds) {
            var endpoint = FXStreet.Resource.FxsApiRoutes["RatesTableAssets"];
            var querystring = "?assetIds=";
            $.each(assetIds, function (index, asset) {
                querystring = querystring + asset + ",";
            });

            endpoint = endpoint + querystring.slice(0, -1);

            return $.get(endpoint);
        }

        var renderHeaderManagers = function (json) {
            var jsonData = $.extend(json, { RatesTableDataManager: ratesTableDataManager }, true);

            var ratesTableMenuManager = new FXStreet.Class.RatesTableMenuManager();
            ratesTableMenuManager.init(jsonData);

            jsonData.MainAssets = jsonData.Assets;

            jsonData.AssetsIds = jsonData.Assets.map(function (a) { return a.AssetId });

            var myListAssets = FXStreet.Class.MyAssetsList.get();
            if (myListAssets) {
                jsonData.MyAssetIds = myListAssets;
            }

            jsonData.OnAssetChangedDelegate = ratesTableMenuManager.setMyListViewAssets;

            var ratesTableFilterManager = new FXStreet.Class.RatesTableFilterManager();
            ratesTableFilterManager.init(jsonData);
        };

        return _this;
    };

    FXStreet.Class.RatesTableFilterManager = function () {
        var parent = FXStreet.Class.Base(),
        _this = FXStreet.Util.extendObject(parent);

        _this.HtmlTemplateFile = "ratestable_filter.html";
        _this.ContainerId = "";
        _this.FilterButtonId = "";
        _this.RatesTableDataManager = null;
        _this.FilterContainerId = null;
        _this.FilterDropDown = null;
        _this.MyAssetIds = [];
        _this.AllAssets = [];
        _this.HideElementsCssClass = "fxs_hideElements";
        _this.MainViewItems = null;
        _this.Translations = null;
        _this.TypeAhead = {};
        _this.OnAssetChangedDelegate = null;
        _this.MainAssets = [];

        var temporalMyList = { Assets: [] };

        var mustacheSelectedAssets = null;

        _this.init = function (json) {
            _this.setSettingsByObject(json);
            _this.setVars(json);
            setAllAssets().then(function () { _this.htmlRender(json); });
        };

        _this.setVars = function (json) {
            _this.FilterContainerId = "fxs_header_filter_" + _this.ContainerId;
            _this.FilterOpenDropDownId = "fxs_filter_open_dropdown_button_" + _this.ContainerId;
            _this.FilterCloseDropDownId = "fxs_filter_close_dropdown_button_" + _this.ContainerId;
            
            _this.FilterDropDownId = "fxs_customize_" + _this.ContainerId;
            _this.Container = FXStreet.Util.getjQueryObjectById(_this.FilterContainerId);

            _this.FilterSaveId = "fxs_filter_save_" + _this.ContainerId;
            _this.FilterCancelId = "fxs_filter_cancel_" + _this.ContainerId;

            if (!_this.MyAssetIds) {
                _this.MyAssetIds = json.AssetsIds;
            }
        };

        _this.htmlRender = function (json) {
            FXStreet.Util.loadHtmlTemplate(_this.HtmlTemplateFile).done(function (template) {
                var mustacheSelectedAssetsHtml = template.Template.match(/<main>[\s\S]*<\/main>/g);

                mustacheSelectedAssets = {
                    Template: mustacheSelectedAssetsHtml[0]
                };

                var jsonData = getJsonData(json);
                var rendered = FXStreet.Util.renderByHtmlTemplate(template, jsonData);
                _this.Container.html(rendered);
                _this.addEvents();
                _this.FilterDropDown = FXStreet.Util.getjQueryObjectById(_this.FilterDropDownId);
                initTypeahead(jsonData);
            });
        };

        _this.addEvents = function () {
            addFunctionOnClick(_this.FilterOpenDropDownId, openFilterDropdown);
            addFunctionOnClick(_this.FilterCloseDropDownId, closeFilterDropdown);
            addFunctionOnClick(_this.FilterCancelId, closeFilterDropdown);
            addFunctionOnClick(_this.FilterSaveId, saveFilter);
            addEventCheckboxList();
        };

        var addEventCheckboxList = function () {
            if (temporalMyList.Assets) {
                $.each(temporalMyList.Assets,
                    function (index, item) {
                        addFunctionOnClick("fxs_filter_mylist_" + _this.ContainerId + "_" + item.Id,
                            function (e) { onclickMyListItem(e, this, item); });
                    });
            }
        }

        var initTypeahead = function (json) {
            json.ContainerId = 'fxs_header_typeahead_' + json.ContainerId;
            json.OnSaveDelegate = onTypeaheadSaveDelegate;
            json.ShowLayer = showLayer;
            _this.TypeAhead = new FXStreet.Class.RatesTableFilterTypeAhead();
            _this.TypeAhead.init(json);
        };

        var addFunctionOnClick = function (elementId, callback) {
            var htmItem = FXStreet.Util.getjQueryObjectById(elementId);
            htmItem.click(callback);
        };

        var getJsonData = function (json) {
            var myAssets = getFullAssets(json.AssetsIds);

            var result =
            {
                TypeAheadSettings:
                {
                    TypeaheadId: "fxs_typeahead_" + _this.ContainerId,
                    TypeaheadInputTargetId: "typeaheadTarget_" + _this.ContainerId,
                    TypeaheadFilterButtonId: "fxs_btn_filter_" + _this.ContainerId,
                    TypeaheadCancelButtonId: "fxs_dismissQuery_" + _this.ContainerId,
                    SelectedTypeaheadId: "",
                    PlaceholderText: "Add pairs to list "
                },
                ContainerId: _this.ContainerId,
                MyList: myAssets,
                TemporalMyList: temporalMyList,
                AllAssets: _this.AllAssets,
                Translations: _this.Translations
            };
            return result;
        };

        var getFullAssets = function (assetIds) {
            var result = [];
            $.each(assetIds,
                function (i, id) {
                    var asset = _this.AllAssets.findFirst(function (a) {
                        return a.Id === id;
                    });

                    if (asset) {
                        result.push(asset);
                    } else {
                        console.error('Asset {0} not found in all assets list'.format(id));
                    }
                });
            return result;
        }

        var setAllAssets = function () {
            var getAssetsApiUri = FXStreet.Resource.FxsApiRoutes["GetAssets"] + "?cultureName=" + FXStreet.Resource.CultureName;
            return $.get(getAssetsApiUri).then(
                function (data) {
                    _this.AllAssets = data.Result;
                });
        };

        var openFilterDropdown = function () {
            _this.RatesTableDataManager.hideAllDropDowns();
            getJsonDataAndDisplayFilter();
        };

        var closeFilterDropdown = function () {
            temporalMyList.Assets = [];
            _this.FilterDropDown.addClass(_this.HideElementsCssClass);
        };

        var saveFilter = function (e) {
            e.preventDefault();

            var selectedAssetList = $.grep(temporalMyList.Assets, function (i) {
                return i.Selected;
            });

            _this.MyAssetIds = selectedAssetList.map(function (a) { return a.Id; });

            if (typeof (_this.OnAssetChangedDelegate) !== 'undefined') {
                getMyAssetList(_this.MyAssetIds).then(function (assets) {
                    _this.OnAssetChangedDelegate(assets);
                });
            }

            if (selectedAssetList.length === 0) {
                _this.MyAssetIds = _this.MainAssets.map(function (a) { return a.AssetId; });
            }

            closeFilterDropdown();
        }

        var getMyAssetList = function (assetIds) {
            var endpoint = FXStreet.Resource.FxsApiRoutes["RatesTableAssets"];
            var querystring = "?assetIds=";
            $.each(assetIds, function (index, asset) {
                querystring = querystring + asset + ",";
            });

            endpoint = endpoint + querystring.slice(0, -1);

            return $.get(endpoint);
        }

        var getJsonDataAndDisplayFilter = function () {
            temporalMyList.Assets = getFullAssets(_this.MyAssetIds);
            $.each(temporalMyList.Assets, function () { this.Selected = true; });
            _this.FilterDropDown.removeClass(_this.HideElementsCssClass);
            paintSelectedAssets();
        }

        var onclickMyListItem = function (e, domItem, item) {
            item.Selected = domItem.checked;
        }

        var showLayer = function (isActive) {
            var typeAheadLayer = FXStreet.Util.getjQueryObjectById('fxs_header_filter_layer_' + _this.ContainerId);
            if (isActive) {
                typeAheadLayer.removeClass(_this.HideElementsCssClass);
            } else {
                typeAheadLayer.addClass(_this.HideElementsCssClass);
            }
        };

        var onTypeaheadSaveDelegate = function (modifiedAssets) {
            $.each(Object.keys(modifiedAssets), function (i, a) {
                var asset = temporalMyList.Assets.findFirst(function (i) {
                    return i.Id === a;
                });

                if (!asset) {
                    asset = _this.AllAssets.findFirst(function (i) {
                        return i.Id === a;
                    });
                    temporalMyList.Assets.push(asset);
                }

                asset.Selected = modifiedAssets[a];
            });

            paintSelectedAssets();
        };

        var paintSelectedAssets = function () {
            var jsonData = {
                ContainerId: _this.ContainerId,
                MyList: temporalMyList.Assets
            };

            var main = _this.Container.find('main');
            var mainRendered = FXStreet.Util.renderByHtmlTemplate(mustacheSelectedAssets, jsonData);
            main.replaceWith(mainRendered);

            addEventCheckboxList();
        };

        return _this;
    };

    FXStreet.Class.RatesTableFilterTypeAhead = function () {
        var parent = FXStreet.Class.Base(),
        _this = FXStreet.Util.extendObject(parent);

        _this.ContainerId = "";
        _this.TypeAhead = {};

        _this.OnSaveDelegate = null;
        _this.ShowLayer = null;
        _this.TypeAheadSettings = null;
        _this.FxsHideElementsClass = "fxs_hideElements";

        _this.HtmlTemplateFile = "ratestable_typeahead.html";

        var preSelectedAssetsOnFilter = null;

        var resultsDivId = '';
        var mustacheSelectedAssets = null;
        var assetsModifiedFromTypeahead = [];

        _this.init = function (json) {
            _this.setSettingsByObject(json);
            _this.setVars(json);
            _this.htmlRender(json);
        };

        _this.setVars = function (json) {

            _this.Container = FXStreet.Util.getjQueryObjectById(_this.ContainerId);
            preSelectedAssetsOnFilter = json.TemporalMyList;

            _this.TypeAheadContainerId = "fxs_search_input_" + _this.ContainerId;
            _this.TypeAheadContainer = FXStreet.Util.getjQueryObjectById(_this.ContainerId);

        };

        _this.htmlRender = function (json) {
            FXStreet.Util.loadHtmlTemplate(_this.HtmlTemplateFile).done(function (template) {
                var mustacheSelectedAssetsHtml = template.Template.match(/<ul class="fxs_results">[\s\S]*<\/ul>/g);

                mustacheSelectedAssets = {
                    Template: mustacheSelectedAssetsHtml[0]
                };

                var rendered = FXStreet.Util.renderByHtmlTemplate(template, json);
                _this.Container.html(rendered);
                _this.addEvents();
                initTypeahead();
            });
        };

        _this.addEvents = function () {
            var saveButton = FXStreet.Util.getjQueryObjectById('fxs_typeahead_save_' + _this.ContainerId);
            saveButton.click(onSave);

            var cancelButton = FXStreet.Util.getjQueryObjectById('fxs_typeahead_cancel_' + _this.ContainerId);
            cancelButton.click(onCancel);

            var typeAheadContainer = FXStreet.Util.getjQueryObjectById(_this.TypeAheadSettings.TypeaheadId);
            typeAheadContainer.keypress(function () {
                _this.ShowLayer(true);
            });

        };

        var initTypeahead = function () {
            var typeaheadJsonInitialization = _this.TypeAheadSettings;

            typeaheadJsonInitialization.OnLayoutBuiltBeforeDelegate = onLayoutBuiltBeforeDelegate;

            resultsDivId = 'fxs_searchResults_' + _this.ContainerId;

            typeaheadJsonInitialization.FindBy_Options = [
                {
                    FindBy_FxsApiRoute: 'GetAssets',
                    Template: '<label><input type="checkbox" name="">{{display}}</label>',
                    Title: 'Assets'
                }
            ];

            typeaheadJsonInitialization.TypeaheadBlur = null;

            _this.TypeAhead = new FXStreet.Class.Sidebar.Typeahead();
            _this.TypeAhead.init(typeaheadJsonInitialization);
        };

        var onLayoutBuiltBeforeDelegate = function (node, query, result) {
            var resultsDiv = FXStreet.Util.getjQueryObjectById(resultsDivId);
            if (!query) {
                resultsDiv.hide();
                return;
            }

            var assets = result.map(function (a) {
                var asset = preSelectedAssetsOnFilter.Assets.findFirst(function (i) {
                    return i.Id === a.id;
                });

                if (assetsModifiedFromTypeahead[a.id] !== undefined) {
                    a.Selected = assetsModifiedFromTypeahead[a.id];
                } else if (asset) {
                    a.Selected = asset.Selected;
                }


                return a;
            });

            var json = {
                ContainerId: _this.ContainerId,
                TypeaheadVisibleAssets: assets
            }

            var rendered = FXStreet.Util.renderByHtmlTemplate(mustacheSelectedAssets, json);
            var ul = _this.Container.find('ul');
            ul.replaceWith(rendered);

            _this.Container.find('input[type="checkbox"]').click(onClickOnCheckbox);

            resultsDiv.show();
        };

        var onClickOnCheckbox = function () {
            var assetId = $(this).attr("fxs-assetId");
            delete assetsModifiedFromTypeahead[assetId];
            assetsModifiedFromTypeahead[assetId] = this.checked;
        }

        var onSave = function () {
            _this.ShowLayer(false);
            if (typeof (_this.OnSaveDelegate) === 'function') {
                _this.OnSaveDelegate(assetsModifiedFromTypeahead);
            }
            closeTypeahead();
        };

        var onCancel = function () {
            _this.ShowLayer(false);
            closeTypeahead();
        };

        var closeTypeahead = function () {
            var resultsDiv = FXStreet.Util.getjQueryObjectById(resultsDivId);
            resultsDiv.hide();

            var input = FXStreet.Util.getjQueryObjectById(_this.TypeAheadSettings.TypeaheadInputTargetId);
            input.val('');

            assetsModifiedFromTypeahead = [];
        };

        return _this;
    };

    FXStreet.Class.RatesTableMenuManager = function () {
        var parent = FXStreet.Class.Base(),
        _this = FXStreet.Util.extendObject(parent);

        _this.ContainerId = "";
        _this.HtmlTemplateFile = "ratestablemenu_menu.html";
        _this.MenuContainerId = "";
        _this.MenuItems = null;
        _this.MainViewAssets = null;
        _this.MyAssetIds = [];
        _this.RatesTableDataManager = null;
        _this.Translations = null;
        var hideElementsCssClass = "fxs_hideElements";
        var menuShowMoreDropDownId = "";
        var menuShowMoreDropDown = "";
        var menuShowMoreDropDownButtonId = "";
        var menuShowMoreDropDownCloseButtonId = "";
        var menuShowMoreDropDownButton = null;
        var mainViewItemId = "";
        var myListViewButtonId = '';
        var menuItemsKey = "MenuItems";

        var myListViewButton = null;
        var mainViewButton = null;

        _this.init = function (json) {
            _this.setSettingsByObject(json);
            _this.setVars(json);
            _this.htmlRender();
        };

        _this.setVars = function (json) {
            _this.MenuContainerId = "fxs_header_menu_" + _this.ContainerId;
            menuShowMoreDropDownButtonId = "fxs_menu_show_more_dropdown_button_" + _this.ContainerId;
            menuShowMoreDropDownCloseButtonId = "fxs_menu_show_more_dropdown_close_button_" + _this.ContainerId;
            menuShowMoreDropDownId = "fxs_menu_show_more_dropdown_" + _this.ContainerId;
            myListViewButtonId = "fxs_menu_mylist_" + _this.ContainerId;
            mainViewItemId = "fxs_menu_main_view_" + _this.ContainerId;
            _this.Container = FXStreet.Util.getjQueryObjectById(_this.MenuContainerId);
            _this.MainViewAssets = json.Assets;
            _this.MenuItems = getMenuItems(json);
        };

        _this.htmlRender = function () {
            var jsonData = getJsonData();
            FXStreet.Util.loadHtmlTemplate(_this.HtmlTemplateFile).done(function (template) {
                var rendered = FXStreet.Util.renderByHtmlTemplate(template, jsonData);
                _this.Container.html(rendered);

                myListViewButton = FXStreet.Util.getjQueryObjectById(myListViewButtonId);
                if (!_this.MyAssetIds) {
                    myListViewButton.hide();
                }
                else {
                    updateActiveButton(myListViewButton);
                }

                _this.addEvents();
            });
        };

        _this.addEvents = function () {
            var myListViewButton = FXStreet.Util.getjQueryObjectById(myListViewButtonId);
            myListViewButton.click(function () {
                _this.RatesTableDataManager.getAndRenderAssetData(_this.MyAssetIds);
            });
            mainViewButton = FXStreet.Util.getjQueryObjectById(mainViewItemId);
            mainViewButton.click(function () {
                _this.RatesTableDataManager.renderAssetData(_this.MainViewAssets);
            });
            $.each(_this.MenuItems, function (index, item) {
                var htmlItem = FXStreet.Util.getjQueryObjectById(item.Id);
                htmlItem.click(updateRateTableData);

                if (item.IsDefault) {
                    htmlItem = FXStreet.Util.getjQueryObjectById(item.Id + "_default");
                    htmlItem.click(updateRateTableData);
                }

            });

            menuShowMoreDropDown = FXStreet.Util.getjQueryObjectById(menuShowMoreDropDownId);
            menuShowMoreDropDownButton = FXStreet.Util.getjQueryObjectById(menuShowMoreDropDownButtonId);
            menuShowMoreDropDownButton.click(showMoreAction);
            var menuShowMoreDropDownCloseButton = FXStreet.Util.getjQueryObjectById(menuShowMoreDropDownCloseButtonId);
            menuShowMoreDropDownCloseButton.click(showMoreAction);

            $('#' + _this.MenuContainerId + ' .fxs_btn_table_filter').click(function () {
                if (this.id !== menuShowMoreDropDownButtonId) {
                    var buttonElement = $(this);
                    updateActiveButton(buttonElement);
                    setShowMoreButtonText(_this.Translations.ShowMore);
                }
            });
        };

        var updateActiveButton = function (buttonElement) {
            $('#' + _this.MenuContainerId + ' .fxs_btn_table_filter').removeClass('active');
            buttonElement.addClass('active');
        };

        var setShowMoreButtonText = function (txt) {
            menuShowMoreDropDownButton.empty();
            menuShowMoreDropDownButton.append(txt);
            menuShowMoreDropDownButton.append('<i class="fa fa-caret-down" aria-hidden="true"></i>');
        };

        _this.setMyListViewAssets = function (assets) {
            if (assets.length > 0) {
                var assetIds = assets.map(function (a) { return a.AssetId; });
                _this.MyAssetIds = assetIds;

                _this.RatesTableDataManager.renderAssetData(assets);
                FXStreet.Class.MyAssetsList.set(assetIds);
                myListViewButton.show();

                updateActiveButton(myListViewButton);
            } else {
                _this.MyAssetIds = _this.MainViewAssets.map(function (a) { return a.AssetId; });

                _this.RatesTableDataManager.renderAssetData(_this.MainViewAssets);

                FXStreet.Class.MyAssetsList.remove();
                myListViewButton.hide();

                updateActiveButton(mainViewButton);
            }

            setShowMoreButtonText(_this.Translations.ShowMore);
        }


        var showMoreAction = function () {
            if (menuShowMoreDropDown.hasClass(hideElementsCssClass)) {
                _this.RatesTableDataManager.hideAllDropDowns();
                menuShowMoreDropDown.removeClass(hideElementsCssClass);
            } else {
                menuShowMoreDropDown.addClass(hideElementsCssClass);
            }
        };

        var updateRateTableData = function (event) {
            var id = event.currentTarget.id.replace('_default', '');

            var isShowMoreItem = function () {
                var result = event.currentTarget.tagName === 'P';
                return result;
            }

            if (isShowMoreItem()) {
                updateActiveButton(menuShowMoreDropDownButton);
                setShowMoreButtonText(event.currentTarget.textContent);
            }

            var menuItem = getMenuItemById(id);
            var assets = menuItem.Assets;
            if (!menuShowMoreDropDown.hasClass(hideElementsCssClass))
                menuShowMoreDropDown.addClass(hideElementsCssClass);

            _this.RatesTableDataManager.getAndRenderAssetData(assets);
        };

        var getMenuItemById = function (id) {
            var items = $.grep(_this.MenuItems, function (element) {
                return element.Id === id;
            });

            if (items.length === 0) return null;
            var result = items[0];
            return result;
        };

        var getMenuItems = function (data) {
            var menuItemsString = data.TranslationsConfiguration[menuItemsKey];
            var result = JSON.parse(menuItemsString);
            $.each(result, function (index, item) {
                item.Id = "fxs_" + _this.ContainerId + "_menuitem_" + index;
            });
            return result;
        };

        var getJsonData = function () {
            var result = {
                'MenuItems': _this.MenuItems,
                'Translations': _this.Translations,
                'ContainerId': _this.ContainerId
            };
            return result;
        };

        return _this;
    };

    FXStreet.Class.RatesTableDataManager = function () {
        var parent = FXStreet.Class.Base(),
        _this = FXStreet.Util.extendObject(parent);

        _this.ContainerId = "";
        _this.DataContainerId = "";
        _this.HtmlTemplateFile = "ratestable_data.html";
        _this.RatesTableDataCssManager = null;
        _this.ItemsToRecord = ["Last", "Bid", "Ask", "Change", "ChangePercentWithSymbol", "Open", "High", "Low"];
        _this.Translations = [];
        _this.RatesTableEndPoint = "";
        var noDataText = "N/A";

        _this.DataTableContainerId = "";
        _this.DataTableScrollId = "";
        _this.DataTableScrollStartId = "";
        _this.DataTableScrollMiddleId = "";
        _this.DataTableScrollEndId = "";

        _this.DataTableContainer = null;
        _this.DataTableScrollContailer = null;
        _this.DataTableScrollStartContainer = null;
        _this.DataTableScrollMiddleContainer = null;
        _this.DataTableScrollEndContainer = null;

        var hideElementsCssClass = "fxs_hideElements";
        var activeCssClass = "active";
        var tableDom = { Data: {}, Assets: {} };
        var assetSubscribers = {};
        var pushTTObj;


        _this.init = function (json) {
            _this.setSettingsByObject(json);
            _this.setVars(json);
            _this.htmlRender(json);
        };

        _this.setVars = function () {
            pushTTObj = FXStreet.Class.Patterns.Singleton.PushTT.Instance();
            _this.DataContainerId = "fxs_data_" + _this.ContainerId;
            _this.DataTableContainerId = "fxs_data_table_" + _this.ContainerId;

            _this.DataTableScrollId = "fxs_ratestable_scrollButtons_" + _this.ContainerId;
            _this.DataTableScrollStartId = "fxs_swipeContent_start_" + _this.ContainerId;
            _this.DataTableScrollMiddleId = "fxs_swipeContent_middle_" + _this.ContainerId;
            _this.DataTableScrollEndId = "fxs_swipeContent_end_" + _this.ContainerId;

            _this.RatesTableDataCssManager = new FXStreet.Class.RatesTableDataCssManager();
            _this.RatesTableDataCssManager.init();
        };

        _this.htmlRender = function (json) {
            var jsonData = $.extend(json, {}, true);
            updateAssets(jsonData.Assets);
            FXStreet.Util.loadHtmlTemplate(_this.HtmlTemplateFile).done(function (template) {
                var rendered = FXStreet.Util.renderByHtmlTemplate(template, jsonData);
                _this.Container = FXStreet.Util.getjQueryObjectById(_this.DataContainerId);
                _this.Container.html(rendered);

                _this.DataTableContainer = FXStreet.Util.getjQueryObjectById(_this.DataTableContainerId);
                _this.DataTableScrollContailer = FXStreet.Util.getjQueryObjectById(_this.DataTableScrollId);
                _this.DataTableScrollStartContainer = FXStreet.Util.getjQueryObjectById(_this.DataTableScrollStartId);
                _this.DataTableScrollMiddleContainer = FXStreet.Util.getjQueryObjectById(_this.DataTableScrollMiddleId);
                _this.DataTableScrollEndContainer = FXStreet.Util.getjQueryObjectById(_this.DataTableScrollEndId);

                _this.addEvents();
                loadTables(jsonData.Assets);
            });
        };

        _this.getAndRenderAssetData = function (assetIds) {
            var endpoint = FXStreet.Resource.FxsApiRoutes["RatesTableAssets"];
            var querystring = "?assetIds=";
            $.each(assetIds, function (index, asset) {
                querystring = querystring + asset + ",";
            });

            endpoint = endpoint + querystring.slice(0, -1);

            $.get(endpoint).done(function (data) {
                _this.renderAssetData(data);
            }).fail(function () {

            });
        };

        _this.renderAssetData = function (data) {
            var jsonData = {
                Translations: _this.Translations,
                Assets: data,
                ContainerId: _this.ContainerId
            };
            _this.htmlRender(jsonData);
        };

        _this.hideAllDropDowns = function () {
            var dropDownToHide = FXStreet.Util.getjQueryObjectBySelector('.fxs_ratestable_container .fxs_dropdown');
            if (dropDownToHide) {
                dropDownToHide.addClass('fxs_hideElements');
            }
        };

        var updateAssets = function (arrayAsset) {
            $.each(arrayAsset, function (index, asset) {
                if (asset.Trend) { asset.TrendClass = asset.Trend.toLowerCase(); } else { asset.Trend = noDataText; }
                if (asset.ObOs) { asset.ObOsClass = asset.ObOs.toLowerCase(); } else { asset.ObOs = noDataText; }

                asset.Volatility = asset.Volatility || noDataText;
                asset.Ask = asset.Ask || noDataText;
                asset.Bid = asset.Bid || noDataText;
                asset.Last = asset.Last || noDataText;
                asset.DayHigh = asset.DayHigh || noDataText;
                asset.DayLow = asset.DayLow || noDataText;
                asset.Open = asset.Open || noDataText;
                asset.Change = asset.Change || noDataText;
                asset.ChangePercent = asset.ChangePercent || noDataText;
            });
        };

        var loadTables = function (arrayAsset) {
            unsubscriber();
            tableDom = { Data: {}, Assets: {} };
            $.each(arrayAsset, function (index, asset) {
                try {
                    loadDataTable(asset);
                    loadAssetsTable(asset);
                }
                catch (ex) {

                }
            });
            subscribePushTT(arrayAsset);
        };

        var unsubscriber = function () {
            var symbolsIds = [];
            $.each(assetSubscribers, function (key) {
                symbolsIds.push(key);
            });
            if (symbolsIds.length > 0)
                pushTTObj.Unsubscribe(symbolsIds, priceChangeCallback);
            assetSubscribers = {};
        };

        var priceChangeCallback = function (message) {
            var mapper = assetSubscribers[message.symbolId];
            if (mapper) {
                var dto = mapper.createJsonFromMsg(message);
                pushCallback(dto);
            }
        };

        var loadAssetsTable = function (asset) {
            var providerCode = asset.ProviderCode;
            var objectId = "fxs_" + _this.ContainerId + "_asset_" + asset.ProviderCode;
            var htmlObject = FXStreet.Util.getjQueryObjectById(objectId);
            tableDom.Assets[providerCode] = htmlObject;
        };

        var loadDataTable = function (asset) {
            var providerCode = asset.ProviderCode;
            var dataItems = [];
            _this.ItemsToRecord.forEach(function (elementId) {
                var objectId = "fxs_" + _this.ContainerId + "_data_" + asset.ProviderCode + "_" + elementId;
                var htmlObject = FXStreet.Util.getjQueryObjectById(objectId);
                dataItems[elementId] = htmlObject;
            });
            tableDom.Data[providerCode] = dataItems;
        };

        var createRateMapper = function (asset) {
            var result = new FXStreet.Class.RateMapper();
            result.init({
                'PriceProviderCode': asset.ProviderCode,
                'DecimalPlaces': asset.DecimalPlaces
            });
            return result;
        };

        var subscribePushTT = function (arrayAsset) {
            try {
                var symbols = [];
                $.each(arrayAsset, function (index, asset) {
                    var mapper = createRateMapper(asset);
                    assetSubscribers[asset.ProviderCode] = mapper;
                    symbols.push(asset.ProviderCode);
                });
                pushTTObj.Subscribe(symbols, priceChangeCallback);
            } catch (ex) { }
        };

        var pushCallback = function (dataObject) {
            updateTableAssets(dataObject);
            updateTableData(dataObject);
        };

        var updateTableAssets = function (dataObject) {
            var study = dataObject.Study;
            if (study.PriceStatics.PriceClass) {

                var dataToUpdate = {
                    Property: "PriceClass",
                    DataObject: study.PriceStatics,
                    Element: tableDom.Assets[study.PriceProviderCode]
                };
                _this.RatesTableDataCssManager.setCSSBase(dataToUpdate);
            }
        }

        var updateTableData = function (dataObject) {
            var study = dataObject.Study;
            _this.ItemsToRecord.forEach(function (property) {
                if (study.PriceStatics.hasOwnProperty(property)) {
                    if ((tableDom.Data[study.PriceProviderCode][property]) && (study.PriceStatics[property])) {
                        tableDom.Data[study.PriceProviderCode][property].text(study.PriceStatics[property]);
                        var dataToUpdate = {
                            Property: property,
                            DataObject: study.PriceStatics,
                            Element: tableDom.Data[study.PriceProviderCode][property]
                        };
                        _this.RatesTableDataCssManager.setCSSBase(dataToUpdate);
                    }
                }
            });
        }

        var clearScrollActive = function () {
            _this.DataTableScrollStartContainer.removeClass(activeCssClass);
            _this.DataTableScrollMiddleContainer.removeClass(activeCssClass);
            _this.DataTableScrollEndContainer.removeClass(activeCssClass);
        }

        _this.addEvents = function () {
            setOnScrollEvents();
        };

        var setOnScrollEvents = function () {
            if (FXStreet.Util.isMobileDevice() && FXStreet.Util.isTouchDevice()) {
                _this.DataTableScrollContailer.removeClass(hideElementsCssClass);

                _this.DataTableContainer.scroll(function (event) {
                    var scrollleft = _this.DataTableContainer.scrollLeft();
                    var max = _this.DataTableContainer.find('tbody').width() - _this.DataTableContainer.width();

                    if (scrollleft === 0) {
                        clearScrollActive();
                        _this.DataTableScrollStartContainer.addClass(activeCssClass);
                    } else if (scrollleft < max) {
                        clearScrollActive();
                        _this.DataTableScrollMiddleContainer.addClass(activeCssClass);
                    } else {
                        clearScrollActive();
                        _this.DataTableScrollEndContainer.addClass(activeCssClass);
                    }

                });
            }
        }

        return _this;

    }

    FXStreet.Class.RatesTableDataCssManager = function () {
        var parent = FXStreet.Class.Base(),
        _this = FXStreet.Util.extendObject(parent);
        var cssStrategies = [];

        _this.init = function () {
            cssStrategies = [new PriceStudiesStrategy(), new ChangeValuesStrategy(), new AssetPairStrategy()];
        };

        _this.setCSSBase = function (dataToUpdate) {
            var strategy = $.grep(cssStrategies, function (element) {
                return element.isMatch(dataToUpdate.Property);
            });

            if (strategy.length !== 0)
                return strategy[0].setCSS(dataToUpdate);
        };

        var AssetPairStrategy = function () {
            const allowedElement = "PriceClass";
            const ratesTableDefaultCss = "fxs_widget_ratestable";

            this.isMatch = function (property) {
                return property === allowedElement;
            }

            this.setCSS = function (dataToUpdate) {
                var cssClass = dataToUpdate.DataObject.PriceClass;
                if (cssClass && !dataToUpdate.Element.hasClass(cssClass)) {
                    dataToUpdate.Element[0].className = ratesTableDefaultCss + ' ' + cssClass;
                }
            }
        };

        var PriceStudiesStrategy = function () {
            var allowedElements = ["Bid", "Ask", "Last"];
            const ratesTableChangeBgCss = "fxs_ratestable_change_bg";

            this.isMatch = function (property) {
                return $.inArray(property, allowedElements) !== -1;
            }

            this.setCSS = function (dataToUpdate) {
                var cssClass = dataToUpdate.DataObject[dataToUpdate.Property + "Class"];
                if (cssClass) {
                    dataToUpdate.Element[0].className = ratesTableChangeBgCss + ' ' + cssClass;
                    setTimeout(function () {
                        dataToUpdate.Element[0].className = ratesTableChangeBgCss;
                    }, 600);
                }
            }
        };

        var ChangeValuesStrategy = function () {
            var allowedElements = ["Change", "ChangePercentWithSymbol"];
            const ratesTableChangeCss = "fxs_ratestable_change";

            this.isMatch = function (property) {
                return $.inArray(property, allowedElements) !== -1;
            }

            this.setCSS = function (dataToUpdate) {
                var cssClass = dataToUpdate.DataObject.ChangePercentClass;
                if (cssClass && !dataToUpdate.Element.hasClass(cssClass)) {
                    dataToUpdate.Element[0].className = ratesTableChangeCss + ' ' + cssClass;
                }
            }
        };


        return _this;
    };

    FXStreet.Class.MyAssetsList = function () {
        var parent = FXStreet.Class.Base(),
            _this = FXStreet.Util.extendObject(parent);

        var rateTablesMyListAssetsKey = 'assetsMultiRateSetting';

        _this.get = function () {
            var result = null;
            if (typeof (Storage) !== "undefined") {
                try {
                    var sessionValue = JSON.parse(localStorage.getItem(rateTablesMyListAssetsKey));

                    if (Object.prototype.toString.call(sessionValue) === '[object Object]') {
                        result = Object.keys(sessionValue);
                        _this.set(result);
                    } else {
                        result = sessionValue;
                    }

                } catch (e) { }
            }
            return result;
        };

        _this.set = function (assets) {
            if (Object.prototype.toString.call(assets) === '[object Array]') {
                if (assets.length > 0) {
                    localStorage.setItem(rateTablesMyListAssetsKey, JSON.stringify(assets));
                } else {
                    localStorage.removeItem(rateTablesMyListAssetsKey);
                }
            } else {
                console.warn('You are trying to set a wrong value as a ' +
                    rateTablesMyListAssetsKey +
                    ' in the session storage');
            }
        };

        _this.remove = function () {
            localStorage.removeItem(rateTablesMyListAssetsKey);
        };

        return _this;
    }();

}());