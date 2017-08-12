(function () {
    FXStreet.Class.FilteredPostsManager = function () {
        var parent = FXStreet.Class.Base(),
            _this = FXStreet.Util.extendObject(parent);

        // ----- begin json properties -----
        _this.ContainerId = "";
        _this.Take = 0;
        _this.AuthorId = "";
        _this.CompanyId = "";
        _this.CategoryId = "";
        _this.HtmlTemplateFile = "filteredpostslist.html";
        _this.LoadMoreButtonId = "loadMoreBtn";
        // ----- end json properties -----

        _this.Container = null;
        _this.LoadMoreButton = null;
        var initialLoadUrl = "";
        var htmlInnerTemplateFile = "innerfilteredpostlist.html";
        var htmlInnerEventTemplateFile = "innerfilteredeventlist.html";
        var tabConfigs = {};
        var translations = null;

        var loadingDiv = $('<div class="fxs_preload_modules fxs_marginAuto"/>');

        _this.init = function (json) {
            _this.setSettingsByObject(json);
            _this.setVars();
            loadInitialValues().done(callFilteredPostsApi);
        };

        _this.setVars = function () {
            _this.Container = FXStreet.Util.getjQueryObjectById(_this.ContainerId);
            initialLoadUrl = FXStreet.Resource.FxsApiRoutes["FilteredPostsGetItems"];
            tabConfigs = {
                'News': {
                    LoadMoreUrl: FXStreet.Resource.FxsApiRoutes["FilteredNewsGetItems"]
                },
                'Analysis': {
                    LoadMoreUrl: FXStreet.Resource.FxsApiRoutes["FilteredAnalysisGetItems"]
                },
                'Videos': {
                    LoadMoreUrl: FXStreet.Resource.FxsApiRoutes["FilteredVideosGetItems"]
                },
                'Education': {
                    LoadMoreUrl: FXStreet.Resource.FxsApiRoutes["FilteredEducationGetItems"]
                },
                'LiveShows': {
                    LoadMoreUrl: FXStreet.Resource.FxsApiRoutes["FilteredLiveShowsGetItems"]
                }
            };
        };

        var loadInitialValues = function () {
            return FXStreet.Util.loadHtmlTemplate(htmlInnerTemplateFile).done(function (template) {
                tabConfigs["News"].InnerHtmlTemplate = template;
                tabConfigs["Analysis"].InnerHtmlTemplate = template;
                tabConfigs["Videos"].InnerHtmlTemplate = template;
                tabConfigs["Education"].InnerHtmlTemplate = template;

                return FXStreet.Util.loadHtmlTemplate(htmlInnerEventTemplateFile).done(function (template) {
                    tabConfigs["LiveShows"].InnerHtmlTemplate = template;
                });
            });
        }

        var createRequestData = function (page) {
            var data = { "Take": _this.Take, "AuthorId": _this.AuthorId, "CompanyId": _this.CompanyId, "CategoryId": _this.CategoryId, "CultureName": FXStreet.Resource.CultureName, "Page": page,"contenttype":1 };
            return data;
        };

        var callFilteredPostsApi = function () {
            $.ajax({
                type: "GET",
                url: initialLoadUrl,
                data: createRequestData(),
                contentType: "application/json; charset=utf-8",
                dataType: "json"
            }).done(searchSuccess);
        };

        var deactivateButton = function (ct) {
            var tab = FXStreet.Util.getjQueryObjectById(ct);
            var button = tab.find('a[ct]');
            button.attr('disabled', 'disabled');
            button.addClass('disabled');
            button.off('click');
            button.text(translations["NoMoreContent"]);
        };

        var loadMoreSuccess = function (ct, data, button) {
            var tab = FXStreet.Util.getjQueryObjectById(ct);
            var tabConfig = tabConfigs[ct];
            var html = FXStreet.Util.renderByHtmlTemplate(tabConfig.InnerHtmlTemplate, data);
            var lisToInsert = $(html).find('li');
            tab.find('aside ol').append(lisToInsert);
            tabConfig.Page++;

            button.show();
            loadingDiv.remove();

            if (data.Value.length < _this.Take) {
                deactivateButton(ct);
            }
        };
        
        var loadMoreButtonClick = function () {
            var button = $(this);
            var contentType = button.attr('ct');
            var page = tabConfigs[contentType].Page + 1;
            var url = tabConfigs[contentType].LoadMoreUrl;

            button.hide();
            button.after(loadingDiv);

            $.ajax({
                type: "GET",
                url: url,
                data: createRequestData(page),
                contentType: "application/json; charset=utf-8",
                dataType: "json"
            }).done(function (data) { loadMoreSuccess(contentType, data, button); });
            return false;
        };

        var loadHtmlTemplateSuccessComplete = function (data) {
            function openFirstTab() {
                var firstTab = _this.Container.find('.fxs_tabs_nav a[data-toggle="tab"]').first();
                firstTab.click();
            }

            function setLoadMoreButtonEvent() {
                _this.LoadMoreButton = _this.Container.find('div[role="tabpanel"]>a[ct]');
                _this.LoadMoreButton.click(loadMoreButtonClick);
            }

            function createTabs() {
                var asides = $('div[role="tabpanel"]>aside');
                asides.each(function (i, item) {
                    var ct = $(item).attr('ct');
                    var tabConfig = tabConfigs[ct];
                    var tabData = { Value: data.Value[ct] };
                    var renderedTab = FXStreet.Util.renderByHtmlTemplate(tabConfig.InnerHtmlTemplate, tabData);
                    $(item).replaceWith($(renderedTab));
                    tabConfig.Page = 1;

                    if (data.Value[ct].length < _this.Take) {
                        deactivateButton(ct);
                    }
                });
            };

            translations = data.Translations;
            createTabs();
            setLoadMoreButtonEvent();
            openFirstTab();
        };

        var searchSuccess = function (filteredPosts) {
            var jsonData =
                {
                    Value: getValue(filteredPosts),
                    Translations: filteredPosts.Translations
                };

            FXStreet.Util.loadHtmlTemplate(_this.HtmlTemplateFile).done(function (template) {
                var rendered = FXStreet.Util.renderByHtmlTemplate(template, jsonData);
                _this.Container.html(rendered);
                loadHtmlTemplateSuccessComplete(jsonData);
            });
        };

        var getValue = function (filteredPosts) {
            var result = filteredPosts;
            result.HasAnalysis = filteredPosts.Analysis.length > 0;
            result.HasEducation = filteredPosts.Education.length > 0;
            result.HasNews = filteredPosts.News.length > 0;
            result.HasVideos = filteredPosts.Videos.length > 0;
            result.HasLiveShows = filteredPosts.LiveShows.length > 0;
            return result;
        };

        return _this;
    };
}());