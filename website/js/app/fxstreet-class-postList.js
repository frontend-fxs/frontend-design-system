(function () {
    FXStreet.Class.PostBaseList = function () {
        var parent = FXStreet.Class.Base(),
            _this = FXStreet.Util.extendObject(parent);

        // ----- begin json properties -----

        _this.ContainerId = "";
        _this.Category = "";
        _this.Take = 0;
        _this.Translations = null;

        // ----- end json properties -----

        _this.HtmlTemplateFile = function () {
            throw new Error("Abstract method!");
        };
        _this.Url = function () {
            throw new Error("Abstract method!");
        };

        _this.Container = null;

        _this.init = function (json) {
            _this.setSettingsByObject(json);
            _this.setVars();
            _this.callNewsApi();
        };

        _this.setVars = function () {
            _this.Container = FXStreet.Util.getjQueryObjectById(_this.ContainerId);
            _this.Take = +(_this.Take);
        };

        _this.callNewsApi = function () {
            var data = {
                "CategoryId": [_this.Category],
                "Take": _this.Take,
                "CultureName": FXStreet.Resource.CultureName,
                "Page": 1,
                "contenttype": 1
            };

            $.ajax({
                type: "GET",
                url: _this.Url(),
                data: data,
                contentType: "application/json; charset=utf-8",
                dataType: "json"
            }).done(_this.searchSuccess);
        };

        _this.searchSuccess = function (posts) {
            var jsonData = {
                Posts: posts,
                Translations: _this.Translations
            };

            FXStreet.Util.loadHtmlTemplate(_this.HtmlTemplateFile()).done(function (template) {
                var rendered = FXStreet.Util.renderByHtmlTemplate(template, jsonData);
                _this.Container.html(rendered);
                _this.loadHtmlTemplateSuccessComplete();
            });
        };

        _this.loadHtmlTemplateSuccessComplete = function () {
        };

        return _this;
    };

    FXStreet.Class.NewsList = function () {
        var parent = FXStreet.Class.PostBaseList(),
            _this = FXStreet.Util.extendObject(parent);

        parent.HtmlTemplateFile = function () {
            return 'newslist.html';
        }

        parent.Url = function () {
            return FXStreet.Resource.FxsApiRoutes["NewsItemGetItems"];
        }

        return _this;
    };

    FXStreet.Class.AnalysisList = function () {
        var parent = FXStreet.Class.PostBaseList(),
            _this = FXStreet.Util.extendObject(parent);

        parent.HtmlTemplateFile = function () {
            return 'analysislist.html';
        }

        parent.Url = function () {
            return FXStreet.Resource.FxsApiRoutes["AnalysisItemGetItems"];
        }

        return _this;
    };

    FXStreet.Class.EducationList = function () {
        var parent = FXStreet.Class.PostBaseList(),
            _this = FXStreet.Util.extendObject(parent);

        parent.HtmlTemplateFile = function () {
            return 'educationlist.html';
        }

        parent.Url = function () {
            return FXStreet.Resource.FxsApiRoutes["EducationItemGetItems"];
        }

        return _this;
    };

    FXStreet.Class.VideosList = function () {
        var parent = FXStreet.Class.PostBaseList(),
            _this = FXStreet.Util.extendObject(parent);

        parent.HtmlTemplateFile = function () {
            return 'videoslist.html';
        }

        parent.Url = function () {
            return FXStreet.Resource.FxsApiRoutes["VideoGetItems"];
        }

        return _this;
    };
}());