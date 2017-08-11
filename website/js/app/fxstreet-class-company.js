(function () {
    FXStreet.Class.CompanyDetailManager = function () {
        var parent = FXStreet.Class.Base(),
             _this = FXStreet.Util.extendObject(parent);

        _this.ContainerId = "";
        _this.Company = {};
        _this.Translations = {};

        _this.HtmlTemplateFile = "companydetails_default.html";
        _this.Container = null;

        _this.init = function (json) {
            _this.setSettingsByObject(json);
            _this.setVars();
            _this.render();
        };

        _this.setVars = function () {
            _this.Container = FXStreet.Util.getjQueryObjectById(_this.ContainerId);
        };

        _this.render = function () {
            var jsonData =
                {
                    Value: _this.Company,
                    Translations: _this.Translations
                };

            FXStreet.Util.loadHtmlTemplate(_this.HtmlTemplateFile).done(function (template) {
                var rendered = FXStreet.Util.renderByHtmlTemplate(template, jsonData);
                _this.Container.html(rendered);
                _this.loadHtmlTemplateSuccessComplete(_this.Company);
            });
        };

        _this.loadHtmlTemplateSuccessComplete = function(companyData) {
            _this.initSocialMediaWidget(companyData);
            _this.initFilteredPostsWidget(companyData);
        };

        _this.initSocialMediaWidget = function (companyData) {
            var jsonSocialMediaBar = {
                ContainerId: "fxs_socialmedia_bar_" + companyData.Id,
                SocialMediaBarData: companyData.SocialMedias
            };
            FXStreet.Util.createObject("SocialMediaBarProfile", jsonSocialMediaBar);
        };

        _this.initFilteredPostsWidget = function(companyData) {
            var jsonFilteredPosts = {
                ContainerId: "fxs_filtered_posts_" + companyData.Id,
                CompanyId: companyData.Id,
                Take: 10
            }
            FXStreet.Util.createObject("FilteredPostsManager", jsonFilteredPosts);
        };

        return _this;

    };
}());