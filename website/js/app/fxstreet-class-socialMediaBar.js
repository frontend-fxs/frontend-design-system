(function () {
    FXStreet.Class.Patterns.Singleton.SocialMediaOptions = null;

    FXStreet.Class.SocialMediaBar = function () {
        var parent = FXStreet.Class.Base(),
            _this = FXStreet.Util.extendObject(parent);

        // ----- begin json properties -----
        _this.ContainerId = "";
        _this.ItemUrl = "";
        _this.ItemTitle = "";
        _this.PageUrl = "";

        // ----- end json properties -----
        _this.Container = null;
        _this.HtmlTemplateFile = "";

        _this.init = function (json) {
            _this.setSettingsByObject(json);
            _this.setVars();
            _this.loadSocialMedia(_this.GetSocialMediaOptions());
        };

        _this.GetSocialMediaOptions = function () {
            return FXStreet.Resource.SocialMediaBar;
        };

        _this.setVars = function () {
            _this.Container = FXStreet.Util.getjQueryObjectById(_this.ContainerId);
        };

        _this.setCssClasses = function (socialMediaChannels) {
            if (socialMediaChannels !== undefined) {
                for (var i = 0; i < socialMediaChannels.length; i++) {
                    if (socialMediaChannels[i].Name.toLowerCase().indexOf("facebook") > -1) {
                        socialMediaChannels[i].CssClass = "fa fa-facebook";
                    } else if (socialMediaChannels[i].Name.toLowerCase().indexOf("twitter") > -1) {
                        socialMediaChannels[i].CssClass = "fa fa-twitter";
                    } else if (socialMediaChannels[i].Name.toLowerCase().indexOf("google") > -1) {
                        socialMediaChannels[i].CssClass = "fa fa-google";
                    } else if (socialMediaChannels[i].Name.toLowerCase().indexOf("linkedin") > -1) {
                        socialMediaChannels[i].CssClass = "fa fa-linkedin";
                    }
                }
            }
        };

        _this.loadSocialMedia = function (socialMediaResponse) {
            var socialMediaChannels = socialMediaResponse.SocialMediaChannels;

            _this.setCssClasses(socialMediaChannels);
            FXStreet.Class.Patterns.Singleton.SocialMediaOptions = socialMediaResponse;

            var validDataUrl = _this.excludeEmptyUrl(socialMediaResponse);
            var jsonData = _this.getJsonFormattedForMustache(validDataUrl);

            FXStreet.Util.loadHtmlTemplate(_this.HtmlTemplateFile).done(function (template) {
                var rendered = FXStreet.Util.renderByHtmlTemplate(template, jsonData);
                _this.Container.html(rendered);
            });

        };

        _this.excludeEmptyUrl = function(socialMediaResponse) {
            
        };

        _this.setCustomParamsToShare = function (data, socialMediaResponseChannels) {
       
            socialMediaResponseChannels.forEach(function (item) {
                item.urlCustomParams = data.ItemUrl;
            });

            var socialMediasToCustom = $.grep(socialMediaResponseChannels, function (socialMedia) {
                return socialMedia.Name.toLowerCase().indexOf('twitter') !== -1;
            });

            socialMediasToCustom.forEach(function (item) {
                item.urlCustomParams = FXStreet.Util.EncodeUrl(data.ItemTitle) + '%0A' + data.ItemUrl;
            });
            
            return socialMediaResponseChannels;
        };

        _this.getJsonFormattedForMustache = function (socialMediaResponse) {
            return socialMediaResponse;
        };

        return _this;
    };
    FXStreet.Class.SocialMediaBarDefault = function () {
        var parent = FXStreet.Class.SocialMediaBar(),
            _this = FXStreet.Util.extendObject(parent);

        parent.HtmlTemplateFile = "socialmediabar_default.html";

        parent.getJsonFormattedForMustache = function (socialMediaResponse) {
            var socialMediaChannels = parent.setCustomParamsToShare(parent, socialMediaResponse.SocialMediaChannels);
            var socialMediaChannelsShowed = socialMediaChannels.slice(0, 2);
            var socialMediaChannelsHidden = socialMediaChannels.slice(2, socialMediaChannels.length);
            var jsonData = {
                "SocialMediaChannelsShowed": socialMediaChannelsShowed,
                "SocialMediaChannelsHidden": socialMediaChannelsHidden,
                "ShareDisplay": socialMediaResponse.ShareDisplay,
                "MoreOptionsDisplay": socialMediaResponse.MoreOptionsDisplay
            };
            return jsonData;
        };

        parent.excludeEmptyUrl = function (socialMediaResponse) {
            var result = [];
            $.each(socialMediaResponse.SocialMediaChannels, function (index, item) {
                if (item.ShareUrl != null && item.ShareUrl != "") {
                    result.push(item);
                }
            });
            var response = socialMediaResponse;
            response.SocialMediaChannels = result;
            return response;
        };

        return _this;
    };
    FXStreet.Class.SocialMediaBarBoxed = function () {
        var parent = FXStreet.Class.SocialMediaBar(),
            _this = FXStreet.Util.extendObject(parent);

        parent.HtmlTemplateFile = "socialmediabar_boxed.html";

        parent.getJsonFormattedForMustache = function (socialMediaResponse) {
            var jsonData = {
                "PageUrl": parent.PageUrl,
                "ItemTitle": FXStreet.Util.EncodeUrl(parent.ItemTitle),
                "SocialMediaChannels": socialMediaResponse.SocialMediaChannels,
                "ShareOptions": socialMediaResponse.ShareOptionsDisplay
            };
            return jsonData;
        };

        parent.loadHtmlTemplateSuccessComplete = function () {

        };

        parent.excludeEmptyUrl = function (socialMediaResponse) {
            var result = [];
            $.each(socialMediaResponse.SocialMediaChannels, function (index, item) {
                if (item.ShareUrl != null && item.ShareUrl != "") {
                    result.push(item);
                }
            });
            var response = socialMediaResponse;
            response.SocialMediaChannels = result;
            return response;
        };

        return _this;
    };

    FXStreet.Class.SocialMediaBarProfile = function () {
        var parent = FXStreet.Class.SocialMediaBar(),
            _this = FXStreet.Util.extendObject(parent);

        parent.HtmlTemplateFile = "socialmediabar_profile.html";
        _this.SocialMediaBarData = {};

        var initBase = parent.init;
        parent.init = function (json) {
            _this.setSettingsByObject(json);
            initBase(json);
        };

        parent.GetSocialMediaOptions = function () {
            var jsonData = {
                "SocialMediaChannels": _this.SocialMediaBarData
            };
            return jsonData;
        };

        parent.loadHtmlTemplateSuccessComplete = function () {

        };

        parent.excludeEmptyUrl = function (socialMediaResponse) {
            var result = [];
            $.each(socialMediaResponse.SocialMediaChannels, function (index, item) {
                if (item.ProfileUrl != null && item.ProfileUrl != "") {
                    result.push(item);
                }
            });
            var response = socialMediaResponse;
            response.SocialMediaChannels = result;
            return response;
        };

        return _this;
    };
}());