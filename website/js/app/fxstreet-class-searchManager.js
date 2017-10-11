(function () {
    FXStreet.Class.SearchManager = function () {
        var parent = FXStreet.Class.Base(),
            _this = FXStreet.Util.extendObject(parent);

        _this.ContainerId = '';
        _this.SearchIconId = '';
        _this.IndexId = '';
        _this.Translations = null;

        _this.HtmlTemplate = 'search';
        _this.HtmlTemplateIndex = 'search-index';
        _this.SearchInputSelector = '#fxs-search-input';
        _this.ResultsContainerId = 'fxs-search-results';
        _this.IndexContainerId = 'index-data';
        _this.Container = null;
        _this.ResultsContainer = null;
        _this.SearchInput = null;
        _this.SearchIcon = null;
        _this.ApiManager = null;

        _this.init = function (json) {
            _this.setSettingsByObject(json);
            _this.setVars(json);
            if (_this.ApiManager != null) {
                _this.enableSearch(json);
            }
            else {
                _this.disableSearch();
            }
        };

        _this.setVars = function (data) {
            if (_this.ContainerId !== '') {
                _this.Container = FXStreet.Util.getjQueryObjectById(_this.ContainerId, false);
            }
            if (_this.SearchIconId !== '') {
                _this.SearchIcon = FXStreet.Util.getjQueryObjectById(_this.SearchIconId, false);
            }
            var algoliaApiClient = algoliasearch(data.ApiAccount, data.ApiKey, { protocol: location.protocol });
            _this.ApiManager = algoliaApiClient.initIndex(_this.IndexId);            
        };

        _this.render = function (data) {
            FXStreet.Util.loadHtmlTemplate(_this.HtmlTemplate).done(function (template) {
                var rendered = FXStreet.Util.renderByHtmlTemplate(template, data);
                _this.Container.html(rendered);
                _this.rendered(data);
            });            
        };

        _this.rendered = function (data) {
            _this.SearchInput = FXStreet.Util.getjQueryObjectBySelector(_this.SearchInputSelector, false);

            _this.addEvents();
        };

        _this.addEvents = function () {
            if (_this.SearchInput != null) {
                _this.SearchInput.on('keyup paste', _this.onSearchUpdated);
            }
            _this.SearchIcon.on('click', function() {
                _this.Container.toggleClass('fxs_dBlock');
            });
        };

        _this.onSearchUpdated = function (arg) {
            var query = _this.SearchInput.val();
            _this.search(query);
        };

        _this.search = function (query) {
            if (query !== '') {
                var params= {
                    hitsPerPage: 50,
                    maxValuesPerFacet: 3,
                    filters: 'CultureName:' + FXStreet.Resource.CultureName
                }

                _this.ApiManager.search(query, params, _this.searchDone);
            }
            else {
                _this.searchOff();
            }
        };

        _this.searchDone = function (err, content) {
            if (err == null) {
                var suggestions = content.hits;
                _this.CalculatePublicationDate(suggestions)
                var indexJson = {
                    Index: _this.IndexId,
                    Suggestions: suggestions,
                    Translations: _this.Translations,
                    Query: content.query
                };
                _this.renderIndex(indexJson);
            }
            else {
                var indexJson = {
                    Index: _this.IndexId,
                    Suggestions: [],
                    Translations: _this.Translations
                };
                _this.renderIndex(indexJson);
                console.log(err.message);
            }
            _this.ResultsContainer = FXStreet.Util.getjQueryObjectById(_this.ResultsContainerId, false);
            if(_this.ResultsContainer != null){
                _this.ResultsContainer.show();
            }
        };

        _this.searchOff = function () {
            var indexContainer = FXStreet.Util.getjQueryObjectById(_this.IndexContainerId, false);
            if (indexContainer != null) {
                indexContainer.empty();
            }
        };

        _this.renderIndex = function (indexJson) {
            var indexContainer = FXStreet.Util.getjQueryObjectById(_this.IndexContainerId, false);

            FXStreet.Util.loadHtmlTemplate(_this.HtmlTemplateIndex).done(function (template) {
                var html = FXStreet.Util.renderByHtmlTemplate(template, indexJson);
                if (indexContainer != null) {
                    indexContainer.html(html);
                    indexContainer.find('.fxs_it_close').click(_this.searchOff);
                }
            });
        };

        _this.enableSearch = function (json) {
            _this.render(json);
        };

        _this.disableSearch = function () {
            _this.SearchIcon.remove();
            _this.Container.remove();
        };

        _this.CalculatePublicationDate = function (suggestions) {
            suggestions.forEach(function (suggestion) {
                if (suggestion.PublicationTime != undefined) {
                    suggestion.Publication = _this.GetUserDateByUnix(suggestion.PublicationTime);
                }
            });
        };

        _this.GetUserDateByUnix = function (timestamp) {
            var result = FXStreet.Class.Patterns.Singleton.TimeZoneManager.Instance().GetUserDateByUnix(timestamp);

            return result;
        };

        return _this;
    };
    FXStreet.Class.AdvancedSearchManager = function () {
        var parent = FXStreet.Class.Base(),
            _this = FXStreet.Util.extendObject(parent);

        _this.ContainerId = '';
        _this.IndexId = '';
        _this.CategoryFiltered = '';
        _this.ShowTitle = true;
        _this.ShowClearAll = true;
        _this.ShowSearchBox = true;
        _this.SearchPlaceholder = '';
        _this.HideFiltersOnMobile = false;
        _this.AllowFiltersCollapse = true;
        _this.ShowTagFilter = true;
        _this.TagsTitle = '';
        _this.TagsPlaceholder = '';
        _this.TagsLimit = 0;
        _this.ShowAuthorFilter = true;
        _this.AuthorsTitle = '';
        _this.AuthorsPlaceholder = '';
        _this.AuthorsLimit = 0;
        _this.DefaultStatsFilter = '';
        _this.ShowResultImage = true;
        _this.DisplayGrid = true;
        _this.Translations = null;
        _this.HttpPushServerUrl = '';
        _this.HttpPushServerKeysUrl = '';
        _this.HttpPushFeatures = [];

        _this.HtmlTemplate = 'search_configurable';
        _this.HtmlTemplateFilter = 'advanced_search_filter';
        _this.HtmlTemplateResults = 'advanced_search_results';

        _this.Container = null;

        _this.ApiManager = null;
        _this.Widgets = null;
        _this.HitsWidget = null;

        _this.Templates = 
            {
                Filter:
                    {
                        ClearAll: { Template: 'advanced_search_filter_clear_all', Content: '' },
                        RefinementListHeader: { Template: 'advanced_search_filter_refinement_list_header', Content: '' },
                        RefinementListNoResults: { Template: 'advanced_search_filter_refinement_list_no_results', Content: '' },
                        RefinementListItem: { Template: 'advanced_search_filter_refinement_list_item', Content: '' }
                    },
                Results:
                    {
                        Hit: { Template: 'advanced_search_results_hit', Content: '' },
                        HitEmpty: { Template: 'advanced_search_results_hit_empty', Content: '' },
                        PaginationPrevious: { Template: 'advanced_search_results_pagination_previous', Content: '' },
                        PaginationNext: { Template: 'advanced_search_results_pagination_next', Content: '' }
                    },
                Stats:
                    {
                        AboutResults: { Template: 'advanced_search_stats_about', Content: '' }
                    }
            };

        _this.Alert = null;
        _this.AlertCloseButton = null;
        
        _this.init = function (json) {
            _this.setSettingsByObject(json);
            _this.setVars(json);
            _this.render(json);
            subscribeHttpPush();
        };

        _this.setVars = function (data) {
            _this.ApiManager = instantsearch({
                appId: data.ApiAccount,
                apiKey: data.ApiKey,
                indexName: _this.IndexId,
                urlSync: true,
                protocol: location.protocol,
                searchParameters: {
                    filters: getFilters()
                }
            });

            if (_this.ContainerId !== '') {
                _this.Container = FXStreet.Util.getjQueryObjectById(_this.ContainerId, false);
            }

            _this.Widgets = {
                Categories: { ContainerSelector: '#filter-categories', Name: 'Category', Title: _this.Translations["CategoriesTitle"], PlaceHolder: _this.Translations["CategoriesPlaceHolder"], Typeahead: false },
                Tags: { ContainerSelector: '#filter-tags', Name: 'Tags', Title: _this.TagsTitle, PlaceHolder: _this.TagsPlaceholder, Typeahead: true, Limit: _this.TagsLimit },
                Authors: { ContainerSelector: '#filter-authors', Name: 'AuthorName', Title: _this.AuthorsTitle, PlaceHolder: _this.AuthorsPlaceholder, Typeahead: true, Limit: _this.AuthorsLimit },
                ClearAll: { ContainerSelector: '#clear-all', Title: _this.Translations["ClearAllTitle"] },
                SearchBox: { ContainerSelector: '#q', PlaceHolder: _this.SearchPlaceholder},
                Stats: { ContainerSelector: '#stats' },
                Hits: { ContainerSelector: '#hits' },
                Pagination: { ContainerSelector: '#pagination' },
                ItemsPerPage: { ContainerSelector: '#items-per-page-selector' }
            };
        };

        var getFilters = function () {
            var result = 'CultureName:' + FXStreet.Resource.CultureName;
            if (_this.CategoryFiltered !== '') {
                result += " AND Category:'" + _this.CategoryFiltered + "'";
            }
            return result;
        };

        _this.render = function (json) {
            FXStreet.Util.loadHtmlTemplate(_this.HtmlTemplate).done(function(template) {
                var rendered = FXStreet.Util.renderByHtmlTemplate(template, json);
                _this.Container.html(rendered);

                loadTemplates(json);

                initFilter(json);
                initResults(json);
                initAlert();
            });
        };

        var loadTemplates = function (json) {
            var templates = [
                _this.Templates.Filter.ClearAll,
                _this.Templates.Filter.RefinementListHeader,
                _this.Templates.Filter.RefinementListNoResults,
                _this.Templates.Filter.RefinementListItem,

                _this.Templates.Results.Hit,
                _this.Templates.Results.HitEmpty,
                _this.Templates.Results.PaginationPrevious,
                _this.Templates.Results.PaginationNext,

                _this.Templates.Stats.AboutResults
            ];

            loadTemplateRecursive(templates, 0, json);
        };

        var loadTemplateRecursive = function (templates, pos, json) {
            if (pos < templates.length) {
                FXStreet.Util.loadHtmlTemplate(templates[pos].Template).done(function (template) {
                    templates[pos].Content = FXStreet.Util.renderByHtmlTemplate(template, json);
                    loadTemplateRecursive(templates, pos + 1, json);
                });
            }
        };

        var initFilter = function () {
            var anyFilterAvailable = false;
            if (_this.CategoryFiltered === '') {
                initRefinementListWidget(_this.Widgets.Categories);
                anyFilterAvailable = true;
            }
            if (_this.ShowTagFilter) {
                initRefinementListWidget(_this.Widgets.Tags);
                anyFilterAvailable = true;
            }
            if (_this.ShowAuthorFilter) {
                initRefinementListWidget(_this.Widgets.Authors);
                anyFilterAvailable = true;
            }

            if (anyFilterAvailable && _this.ShowClearAll) {
                initClearAllWidget();
            }
        };

        var initClearAllWidget = function () {
            var widget = _this.Widgets.ClearAll;
            _this.ApiManager.addWidget(
              instantsearch.widgets.clearAll({
                  container: widget.ContainerSelector,
                  templates: {
                      link: _this.Templates.Filter.ClearAll.Content
                  },
                  cssClasses: {
                      root: 'btn btn-block btn-default'
                  },
                  autoHideContainer: true
              })
            );
        };

        var initRefinementListWidget = function (widget) {
            var settings = {
                container: widget.ContainerSelector,
                attributeName: widget.Name,
                operator: 'or',
                limit: widget.Limit === 0 ? 10 : (widget.Limit || 10),
                templates: {
                    item: _this.Templates.Filter.RefinementListItem.Content,
                    header: _this.Templates.Filter.RefinementListHeader.Content.replace('{FILTER_HEADER}', widget.Title)
                },
                collapsible: _this.AllowFiltersCollapse,
                sortBy: ['isRefined', 'count:desc']
            };
            if (widget.Typeahead) {
                settings.searchForFacetValues = {
                    placeholder: widget.PlaceHolder,
                    templates: {
                        noResults: _this.Templates.Filter.RefinementListNoResults.Content
                    }
                };
            }
            _this.ApiManager.addWidget(instantsearch.widgets.refinementList(settings));
        };

        var initResults = function () {
            initSearchBoxWidget();
            initStatsWidget();
            initHitsWidget();
            initPaginationWidget();

            _this.ApiManager.start();
        };

        var initSearchBoxWidget = function () {
            var widget = _this.Widgets.SearchBox;
            _this.ApiManager.addWidget(
              instantsearch.widgets.searchBox({
                  container: widget.ContainerSelector,
                  placeholder: widget.PlaceHolder
              })
            );
        };

        var initStatsWidget = function () {
            var widget = _this.Widgets.Stats;
            _this.ApiManager.addWidget(
                instantsearch.widgets.stats({
                    container: widget.ContainerSelector,
                    templates: {
                        body: _this.Templates.Stats.AboutResults.Content
                    },
                    transformData: function (data) {
                        var filters = getFiltersFromWidget();
                        var result = {
                            AboutText: _this.Translations.AboutText.replace('{{Hits}}', data.nbHits),
                            AboutForText: _this.Translations.AboutForText.replace('{{Hits}}', data.nbHits),
                            Filters: filters,
                            HasFilters: filters.length > 0
                        };
                        return result;
                    }
                })
             );
        };

        var getFiltersFromWidget = function() {
            var tagsFiltered = getFilteredTags();
            var authorsFiltered = getFilteredAuthors();

            var filters = tagsFiltered.concat(authorsFiltered);

            if (_this.CategoryFiltered === '') {
                var categoriesFiltered = getFilteredCategories();
                filters = categoriesFiltered.concat(filters);
            }

            if (filters.length === 0 && _this.DefaultStatsFilter !== '') {
                filters = [_this.DefaultStatsFilter];
            }

            var result = $.map(filters, function(filter, index) {
                return {
                    Value: filter,
                    HasComma: index !== filters.length - 1
                };
            });
            return result;
        };

        var initHitsWidget = function () {
            var widget = _this.Widgets.Hits;
            var widgetObj = instantsearch.widgets.hits({
                container: widget.ContainerSelector,
                hitsPerPage: 20,
                templates: {
                    empty: _this.Templates.Results.HitEmpty.Content,
                    item: _this.Templates.Results.Hit.Content
                },
                transformData: function(hit) {
                    hit.ShowResultImage = _this.ShowResultImage;
                    hit.ShowResultCategory = _this.CategoryFiltered === '';
                    hit.DisplayGrid = _this.DisplayGrid;
                    hit.PublicationTime = getDateByUnix(hit.PublicationTime);
                    hit.stars = [];
                    for (var i = 1; i <= 5; ++i) {
                        hit.stars.push(i <= hit.rating);
                    }
                    return hit;
                }
            });

            _this.ApiManager.addWidget(widgetObj);
            _this.HitsWidget = widgetObj;
        };

        var initPaginationWidget = function () {
            var widget = _this.Widgets.Pagination;
            _this.ApiManager.addWidget(
              instantsearch.widgets.pagination({
                  container: widget.ContainerSelector,
                  cssClasses: {
                      active: 'active'
                  },
                  labels: {
                      previous: _this.Templates.Results.PaginationPrevious.Content,
                      next: _this.Templates.Results.PaginationNext.Content
                  },
                  showFirstLast: false
              })
            );
        };

        var initAlert = function() {
            _this.Alert = FXStreet.Util.getjQueryObjectById("fxs_search_alert_" + _this.ContainerId, false);
            _this.AlertCloseButton = FXStreet.Util.getjQueryObjectById("fxs_search_alert_btn_" + _this.ContainerId, false);
            _this.AlertCloseButton.click(onAlertCloseClick);
        };

        var onAlertCloseClick = function (event) {
            event.preventDefault();
            _this.Alert.addClass('fxs_hideElements');
        };

        var getDateByUnix = function (timestamp) {
            var result = FXStreet.Class.Patterns.Singleton.TimeZoneManager.Instance().GetUserDateByUnix(timestamp);

            return result;
        };

        var getFilteredCategories = function () {
            var state = _this.ApiManager.helper.state;
            var result = state.disjunctiveFacetsRefinements.Category ? state.disjunctiveFacetsRefinements.Category : [];
            return result;
        };

        var getFilteredTags = function () {
            var state = _this.ApiManager.helper.state;
            var result = state.disjunctiveFacetsRefinements.Tags ? state.disjunctiveFacetsRefinements.Tags : [];
            return result;
        };

        var getFilteredAuthors = function () {
            var state = _this.ApiManager.helper.state;
            var result = state.disjunctiveFacetsRefinements.AuthorName ? state.disjunctiveFacetsRefinements.AuthorName : [];
            return result;
        };

        var subscribeHttpPush = function () {
            if (typeof FXStreetPush !== 'undefined') {
                var auth = FXStreet.Class.Patterns.Singleton.Authorization.Instance();
                auth.getTokenPromise().then(function (token) {
                    var options = {
                        token: token,
                        tokenUrl: _this.HttpPushServerKeysUrl,
                        httpPushServerUrl: _this.HttpPushServerUrl,
                        culture: FXStreet.Resource.CultureName
                    };
                    var push = FXStreetPush.PushNotification.getInstance(options);
                    push.postSubscribe(_this.HttpPushFeatures, postNotify);
                });
            }
            else {
                console.log("FXStreetPush load failed");
            }
        };

        var postNotify = function (post) {
            if (isFromFilteredTags(post) && isFromFilteredAuthors(post)) {
                _this.Alert.removeClass('fxs_hideElements');
            }
        };

        var isFromFilteredTags = function (post) {
            var tagsFiltered = getFilteredTags();

            if (tagsFiltered.length === 0) {
                return true;
            }

            if (!post.Tags) {
                return false;
            }

            for (var i = 0; i < tagsFiltered.length; i++) {
                var tagName = tagsFiltered[i];
                for (var j = 0; j < post.Tags.length; j++) {
                    var tag = post.Tags[i];
                    if (tag.Name === tagName) {
                        return true;
                    }
                }
            }

            return false;
        };

        var isFromFilteredAuthors = function (post) {
            var authorsFiltered = getFilteredAuthors();
            if (authorsFiltered.length === 0) {
                return true;
            }

            for (var i = 0; i < authorsFiltered.length; i++) {
                var authorName = authorsFiltered[i];
                if (post.Author && post.Author.Name === authorName) {
                    return true;
                }
            }

            return false;
        };

        return _this;
    };
}());