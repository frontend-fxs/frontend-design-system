(function () {
    FXStreet.Class.AuthorDetailManager = function () {
        var parent = FXStreet.Class.Base(),
             _this = FXStreet.Util.extendObject(parent);

        _this.ContainerId = "";
        _this.Author = {};
        _this.Translations = {};
        _this.UserInfo = {};

        _this.HtmlTemplateFile = "authordetails_default.html";
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
                    Value: _this.Author,
                    Translations: _this.Translations
                };

            FXStreet.Util.loadHtmlTemplate(_this.HtmlTemplateFile).done(function (template) {
                var rendered = FXStreet.Util.renderByHtmlTemplate(template, jsonData);
                _this.Container.html(rendered);
                _this.loadHtmlTemplateSuccessComplete(_this.Author);
            });
        };

        _this.loadHtmlTemplateSuccessComplete = function (authorData) {
            if (authorData.HasSocialMedias) {
                _this.initSocialMediaWidget(authorData);
            }
            _this.initFilteredPostsWidget(authorData);
            _this.initAuthorFollowController(authorData);
        };

        _this.initSocialMediaWidget = function (authorData) {
            var jsonSocialMediaBar = {
                ContainerId: "fxs_socialmedia_bar_" + authorData.Id,
                SocialMediaBarData: authorData.SocialMedias
            };
            FXStreet.Util.createObject("SocialMediaBarProfile", jsonSocialMediaBar);
        };

        _this.initFilteredPostsWidget = function (authorData) {
            var jsonFilteredPosts = {
                ContainerId: "fxs_filtered_posts_" + authorData.Id,
                AuthorId: authorData.Id,
                Take: 10
            }
            FXStreet.Util.createObject("FilteredPostsManager", jsonFilteredPosts);
        };

        _this.initAuthorFollowController = function (authorData) {
            var json = {
                UserInfo: _this.UserInfo,
                Author: authorData,
                FollowButtonId: "fxs_cta_authorfollow_" + authorData.Id,
                FollowingMessageBoxId: "fxs_alert_author_follow",
                UnFollowingMessageBoxId: "fxs_alert_author_unfollow"
            }
            FXStreet.Util.createObject("AuthorFollow", json);
        };

        return _this;

    };
}());