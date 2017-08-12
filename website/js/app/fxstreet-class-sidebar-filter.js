(function () {
    FXStreet.Class.Sidebar.Filter = function () {
        var parent = FXStreet.Class.Base(),
          _this = FXStreet.Util.extendObject(parent);

        _this.FindBy_Options = [];
        _this.NewItemCreatedDelegate = null;
        _this.SidebarNewItemsAlertId = "";
        _this.SidebarSeeLatestNewsId = "";
        _this.ShowLeftPushId = "";
        _this.ShowRightPushId = "";
        _this.ShowLeftId = "";
        _this.MenuLeftId = "";
        _this.MenuRightId = "";
        _this.ListViewId = "";
        _this.OptionSelectedDelegate = null;
        _this.TypeaheadJsonInitialization = {};
        _this.IsReferral = false;
        _this.ShowSeeLatest = false;

        _this.HtmlTemplateName = "typeahead_suggestion.html";

        _this.SidebarNewItemsAlert = null;
        _this.SidebarSeeLatestNews = null;
        _this.PageTitle = "";

        _this.PostsCreated = [];

        _this.Resources = FXStreet.Resource.Translations['Sidebar_FilterAndList'];

        _this.init = function (json) {
            _this.setSettingsByObject(json);
            _this.setVars();
            _this.addEvents();
            _this.initTypeahead();
        };

        _this.setVars = function () {
            _this.PageTitle = document.title;

            _this.Suggestions = $('<div/>');
            _this.Suggestions.insertAfter(FXStreet.Util.getjQueryObjectById(_this.TypeaheadJsonInitialization.TypeaheadId));

            _this.SidebarNewItemsAlert = FXStreet.Util.getjQueryObjectById(_this.SidebarNewItemsAlertId);
            _this.SidebarSeeLatestNews = FXStreet.Util.getjQueryObjectById(_this.SidebarSeeLatestNewsId);
            _this.SidebarSeeLatestNews.attr("href", FXStreet.Resource.PageUrl);

            if (_this.IsReferral === true && _this.ShowSeeLatest) {
                _this.SidebarSeeLatestNews.html(_this.Resources.SidebarSeeLatestText);
            }
        };

        _this.addEvents = function () {
            _this.SidebarNewItemsAlert.on("click", _this.sidebarNewItemsAlertClick);
        };

        _this.initTypeahead = function () {
            _this.TypeaheadJsonInitialization.FindBy_Options = _this.FindBy_Options;
            _this.TypeaheadJsonInitialization.CloseDelegated = _this.CloseDelegated;
            _this.TypeaheadJsonInitialization.PlaceholderText = FXStreet.Resource.Translations['Sidebar_FilterAndList'].Filter_Search;

            _this.Typeahead = new FXStreet.Class.Sidebar.Typeahead();
            _this.Typeahead.init(_this.TypeaheadJsonInitialization);
            _this.startObserveTypeahead();
        };

        _this.startObserveTypeahead = function () {
            _this.Typeahead.addObserver(_this.ChangeTypeaheadDelegated);
        };

        _this.stopObserveTypeahead = function () {
            _this.Typeahead.removeObserver(_this.ChangeTypeaheadDelegated);
        };

        _this.resetBody = function () {
            var obj = FXStreet.Class.Sidebar.Util.RenderizableListItems[0];
            if (obj) {
                obj.RenderedItemInPage.resetBody();
            }
        };

        _this.ChangeTypeaheadDelegated = function (option) {
            if (option) {
                _this.OptionSelectedDelegate(option.queryString, option.id);
                _this.DefaultLoaded = false;
            }
        };

        _this.CloseDelegated = function () {
            _this.resetBody();
            _this.loadDefault();
        };

        _this.loadDefault = function () {
            if (!_this.DefaultLoaded && _this.FindBy_Options[0]) {
                _this.OptionSelectedDelegate(_this.FindBy_Options[0].QueryStringKey, _this.SelectedTypeaheadId || null);
                _this.DefaultLoaded = _this.SelectedTypeaheadId === null;
                _this.SelectedTypeaheadId = null;
            }
        };

        _this.getMatches = function (value) {
            value = value.toLowerCase();
            var values = _this.getValuesContainings(value);
            if (values.length > 0) {
                return values;
            }

            values = _this.levenshteinMatches(value);
            return values;
        };

        _this.getValuesContainings = function (valueToMatch) {
            var matcher = new RegExp($.ui.autocomplete.escapeRegex(valueToMatch), "i");
            var values = $.grep(_this.ValuesOptions, function (val) {
                return matcher.test(val.Value.Name);
            });
            values = values.sort(function (a, b) {
                var aValue = a.Value.Name, bValue = b.Value.Name;
                return aValue.indexOf(valueToMatch) - bValue.indexOf(valueToMatch);
            });
            return values;
        };

        _this.removeIfInvalid = function () {
            if (_this.Typeahead.val() === '') {
                return;
            }

            var optionSelected = _this.getTypeaheadSelected();
            if (optionSelected) {
                _this.Typeahead.val(optionSelected.Value.Name);
                return;
            }

            var value = _this.Typeahead.val();
            _this.Typeahead.val(_this.CurrentSelectedItem.Name);
            console.log("'" + value + "' didn't match any item");
        };

        _this.getTypeaheadSelected = function () {
            var value = _this.Typeahead.val(),
                valueLowerCase = value.toLowerCase();

            var result = _this.ValuesOptions.findFirst(function (item) {
                return item.Value.Name.toLowerCase() === valueLowerCase;
            });
            return result;
        };

        _this.sidebarNewItemsAlertClick = function () {
            _this.NewItemCreatedDelegate(_this.PostsCreated);

            _this.PostsCreated = [];
            _this.SidebarNewItemsAlert.empty();
            document.title = _this.PageTitle;

            // Devolvemos false para evitar la acción del elemento a
            return false;
        };

        _this.newPostCreated = function (post) {
            if (_this.IsReferral === true) {
                return;
            }

            if (_this.Typeahead.CurrentSelectedItem === null || _this.Typeahead.CurrentSelectedItem.id.length === 0) {
                _this.renderNewItemCreated(post);
            } else {
                for (var i = 0; i < post.categoriesIds.length; i++) {
                    if (post.categoriesIds[i] === _this.Typeahead.CurrentSelectedItem.id) {
                        _this.renderNewItemCreated(post);
                        break;
                    }
                }
            }
        };

        _this.renderNewItemCreated = function (item) {
            _this.PostsCreated.unshift(item);
            _this.SidebarNewItemsAlert.html(_this.Resources.ItemUpdateTextFormat.format(_this.PostsCreated.length));
            document.title = "({0}) {1}".format(_this.PostsCreated.length, _this.PageTitle);
        };

        return _this;
    };
}());
