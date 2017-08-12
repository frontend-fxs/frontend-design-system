(function () {
    FXStreet.Class.Sidebar.Typeahead = function () {
        var parent = FXStreet.Class.Base(),
          _this = FXStreet.Util.extendObject(parent);

        // Json properties
        _this.ValuesOptions = {};
        _this.FindBy_Options = [];
        _this.TypeaheadId = "";
        _this.TypeaheadInputTargetId = "";
        _this.TypeaheadFilterButtonId = "";
        _this.TypeaheadCancelButtonId = "";
        _this.CloseDelegated = null;
        _this.SelectedTypeaheadId = null;
        // End json properties

        _this.TypeaheadObserverSubject = null;

        _this.TypeaheadContainer = null;
        _this.TypeaheadInput = null;
        _this.CurrentSelectedItem = null;
        _this.Suggestions = null;
        _this.OptionSelectedDelegate = null;
        _this.TypeaheadFilterButton = null;
        _this.TypeaheadCancelButton = null;
        _this.PlaceholderText = "";

        _this.OnLayoutBuiltBeforeDelegate = null;
       
        _this.OnClickBeforeDelegate = null;

        _this.Changed = false;

        _this.init = function (json) {
            _this.setSettingsByObject(json);
            _this.setVars();
            _this.addEvents();
            _this.loadValuesOptions();
        };

        _this.setVars = function () {
            _this.TypeaheadContainer = FXStreet.Util.getjQueryObjectById(_this.TypeaheadId);
            _this.TypeaheadInput = FXStreet.Util.getjQueryObjectById(_this.TypeaheadInputTargetId);
            _this.TypeaheadFilterButton = FXStreet.Util.getjQueryObjectById(_this.TypeaheadFilterButtonId);
            _this.TypeaheadCancelButton = FXStreet.Util.getjQueryObjectById(_this.TypeaheadCancelButtonId);

            _this.TypeaheadObserverSubject = new FXStreet.Class.Patterns.Observer.Subject();
        };

        _this.addEvents = function () {
            _this.TypeaheadFilterButton.on('click', _this.TypeaheadFilterButtonClick);
            _this.TypeaheadCancelButton.on('click', _this.TypeaheadCancelButtonClick);
            _this.TypeaheadInput.on('blur', _this.TypeaheadBlur);
            _this.TypeaheadInput.focusin(_this.TypeaheadFocusIn);
        };

        _this.TypeaheadFilterButtonClick = function (e) {
            _this.Changed = false;
            if (e) {
                e.stopPropagation();
            }
        };

        _this.TypeaheadCancelButtonClick = function (e) {
            var div = _this.TypeaheadContainer.find('.fxs_typeaheadContainer');

            div.removeClass("result");
            div.removeClass("hint");
            div.removeClass("backdrop");

            $('.fxs_queryResults').removeClass("fxs_selectedQuery");

            _this.TypeaheadCancelButton.addClass('fxs_dismissQuery_disabled');

            _this.CurrentSelectedItem = null;
            if (_this.Changed) {
                _this.CloseDelegated();
            }
            if (e) {
                e.stopPropagation();
            }
        };

        _this.loadValuesOptions = function () {
            var promises = [];
            for (var i = 0; i < _this.FindBy_Options.length; i++) {
                promises.push(_this.loadOption(i, _this.FindBy_Options[i]));
            }
            $.when.apply($, promises).done(function () {
                _this.createTypeahead();
                _this.enabledTypeahead();
            });
        };

        _this.loadOption = function (i, option) {
            var actionUrl = FXStreet.Util.createUrl(FXStreet.Resource.FxsApiRoutes[option.FindBy_FxsApiRoute], []);
            if (!actionUrl) {
                console.error('The typeahead url is invalid');
                return $.when();
            }
            return $.getJSON(actionUrl, function (data) {
                _this.ValuesOptions[option.QueryStringKey] = data.Result;
                _this.ValuesOptions[option.QueryStringKey].Template = option.Template;
                _this.ValuesOptions[option.QueryStringKey].Index = i;
                _this.ValuesOptions[option.QueryStringKey].Title = option.Title;
            });
        };

        _this.createTypeahead = function () {
            var data = {};
            var groups = [];
            var groupDisplay = {};
            $.each(_this.ValuesOptions, function (key, element) {
                data[element.Title] = {
                    data: $.map(element, function (val) {
                        if (!val) return null;
                        return {
                            id: val.Id,
                            display: val.Title || val.Name,
                            queryString: key,
                            decimalPlaces: val.DecimalPlaces,
                            url: val.Url,
                            priceProviderCode: val.PriceProviderCode,
                            priceStatics: val.PriceStatics
                        };
                    }),
                    template: element.Template
                };
                groups.push({ key: key, title: element.Title, index: element.Index });
                groupDisplay[key] = element.Title;
            });

            groups.sort(function (a, b) { return a.index - b.index; });
            var groupsOrder = groups.map(function (item) { return item.title });

            if (_this.ValuesOptions.CategoryId) {
                _this.CurrentSelectedItem = _this.ValuesOptions.CategoryId.findFirst(function (item) {
                    return _this.SelectedTypeaheadId && item.Id.toLowerCase() === _this.SelectedTypeaheadId.toLowerCase();
                });
            }

            _this.TypeaheadInput.typeahead({
                minLength: 1,
                group: false,
                groupMaxItem: 6,
                maxItem: 30,
                groupOrder: groupsOrder,
                hint: true,
                dropdownFilter: false,
                emptyTemplate: 'No result for "{{query}}"',
                source: data,
                debug: true,
                cache: false,
                selector: {
                    container: "fxs_typeaheadContainer",
                    group: "fxs_typeaheadGroup",
                    result: "typeahead-result",
                    list: "fxs_typeaheadList fxs_fieldset fxs_scrollable_list",
                    display: "typeahead-display",
                    query: "fxs_typeaheadQuery"
                },
                filter: function (item, displayKey) {
                    if (this.query) {
                        if (displayKey.toLowerCase().includes(this.query.toLowerCase()) ||
                            _this.levenshteinAlgorithm(this.query.toLowerCase(),displayKey.toLowerCase()) <= 2)
                            return item;
                    }
                },
                callback: {
                    onInit: null,
                    onReady: function () {
                        if (_this.CurrentSelectedItem) {
                            _this.TypeaheadInput.val(_this.CurrentSelectedItem.Title);
                            _this.TypeaheadFilterButtonClick();
                        }
                    },      // -> New callback, when the Typeahead initial preparation is completed
                    onSearch: null,     // -> New callback, when data is being fetched & analyzed to give search results
                    onResult: null,
                    onLayoutBuiltBefore: _this.OnLayoutBuiltBeforeDelegate,  // -> New callback, when the result HTML is build, modify it before it get showed
                    onLayoutBuiltAfter: null,   // -> New callback, modify the dom right after the results gets inserted in the result container
                    onNavigate: null,   // -> New callback, when a key is pressed to navigate the results
                    onMouseEnter: null,
                    onMouseLeave: null,
                    onClick: _this.onSuggestionClick,
                    onClickBefore: null,// -> Improved feature, possibility to e.preventDefault() to prevent the Typeahead behaviors
                    onClickAfter: null, // -> New feature, happens after the default clicked behaviors has been executed
                    onSubmit: null,
                    onCacheSave: function (node, data, group, path) {
                        var t = data;
                    }

                }

            });
        };

        _this.getTextValue = function () {
            return _this.TypeaheadInput.val();
        };

        _this.getSelectedItem = function () {
            var value = _this.getTextValue().toLowerCase();
            var selected = null;
            $.each(_this.ValuesOptions, function (key) {
                selected = _this.ValuesOptions[key].findFirst(function (item) {
                    return (item.Title || item.Name).toLowerCase() === value;
                });
                if (selected) {
                    return false;
                }
            });
            return selected;
        }

        _this.onSuggestionClick = function (input, value, selectedItem, event) {
            var isInserted;
            if (typeof (_this.OnClickBeforeDelegate) === 'function') {
                isInserted = _this.OnClickBeforeDelegate(input, value, selectedItem, event);
            }
            if (isInserted === "true") {
                if (_this.CurrentSelectedItem === selectedItem) {

                    return;
                }

                _this.TypeaheadCancelButton.removeClass('fxs_dismissQuery_disabled');

                _this.CurrentSelectedItem = selectedItem;
                _this.Changed = true;

                //var hiddenLi = $("#fxs_selected_assets").find("li:hidden").length;
                //var selectedLi = $("#fxs_selected_assets li").length;
                //$('.fxs_assets_number').html((selectedLi - hiddenLi) + " assets");

               // _this.SettAssetCounter();
                _this.TypeaheadObserverSubject.notify(_this.CurrentSelectedItem);
            } else {
                if (_this.CurrentSelectedItem === selectedItem) {
                    return;
                }

                _this.TypeaheadCancelButton.removeClass('fxs_dismissQuery_disabled');

                _this.CurrentSelectedItem = selectedItem;
                _this.Changed = true;

                _this.TypeaheadObserverSubject.notify(_this.CurrentSelectedItem);
            }
        };

        _this.TypeaheadBlur = function () {
            var selected = _this.getSelectedItem();

            if ((!_this.CurrentSelectedItem && !selected) || (_this.CurrentSelectedItem && selected && _this.CurrentSelectedItem.id === selected.Id)) {
                _this.TypeaheadInput.val('');
                return;
            }
            if (selected) {
                var value = _this.getTextValue().toLowerCase();
                var options = $('.fxs_typeaheadList .fxs_typeaheadTxt').filter(function () {
                    return FXStreet.Util.getInnerText(this).toLowerCase() === value;
                });
                if (options && options.length > 0) {
                    options[0].click();
                } else {
                    _this.TypeaheadInput.val('');
                    _this.TypeaheadCancelButton.addClass('fxs_dismissQuery_disabled');
                }
            }
            else if (_this.CurrentSelectedItem) {
                _this.TypeaheadInput.val('');
                //if (_this.CurrentSelectedItem.Title === undefined) {
               //    _this.TypeaheadInput.val(_this.CurrentSelectedItem.display);
               //} else {
               //    _this.TypeaheadInput.val(_this.CurrentSelectedItem.Title);
               //}
            } else {
                _this.TypeaheadInput.val('');
                _this.TypeaheadCancelButton.addClass('fxs_dismissQuery_disabled');
            }
        };

        _this.TypeaheadFocusIn = function () {
            _this.TypeaheadCancelButton.removeClass('fxs_dismissQuery_disabled');
        };

        _this.enabledTypeahead = function () {
            _this.TypeaheadInput.attr('placeholder', _this.PlaceholderText);
            _this.TypeaheadInput.prop('disabled', false);
        };

        _this.addObserver = function (notifyCallback) {
            if (notifyCallback !== undefined && notifyCallback !== null) {
                var json = {
                    'UpdateDelegate': notifyCallback
                };

                var observer = new FXStreet.Class.Patterns.Observer.Observer();
                observer.init(json);
                _this.TypeaheadObserverSubject.addObserver(observer);
            }
        };

        _this.removeObserver = function (notifyCallback) {
            if (notifyCallback !== undefined && notifyCallback !== null) {
                _this.TypeaheadObserverSubject.removeObserver(notifyCallback);
            }
        };

        _this.levenshteinAlgorithm = function (a, b) {
            if (a.length === 0) return b.length;
            if (b.length === 0) return a.length;

            if (a.length > b.length) {
                var tmp = a;
                a = b;
                b = tmp;
            }
            var row = [];
            for (var i = 0; i <= a.length; i++) {
                row[i] = i;
            }

            for (var i = 1; i <= b.length; i++) {
                var prev = i;
                for (var j = 1; j <= a.length; j++) {
                    var val;
                    if (b.charAt(i - 1) === a.charAt(j - 1)) {
                        val = row[j - 1];
                    } else {
                        val = Math.min(row[j - 1] + 1, prev + 1, row[j] + 1);
                    }
                    row[j - 1] = prev;
                    prev = val;
                }
                row[a.length] = prev;
            }

            return row[a.length];
        }
        return _this;
    };
}());