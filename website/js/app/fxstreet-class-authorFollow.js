(function () {
    FXStreet.Class.AuthorFollow = function () {
        var parent = FXStreet.Class.Base(),
            _this = FXStreet.Util.extendObject(parent);

        _this.UserInfo = null;
        _this.Author = {};
        _this.FollowButtonId = "";
        _this.FollowingMessageBoxId = "";
        _this.UnFollowingMessageBoxId = "";

        _this.FollowButton = null;
        _this.FollowingMessageBox = null;
        _this.UnFollowingMessageBox = null;

        var followingClass = "active";
        var hideAlertClass = "fxs_hideElements";
        var isLogginRequired = false;

        _this.init = function (json) {
            _this.setSettingsByObject(json);
            _this.setVars();
            if (_this.UserInfo.Personalization) {
                _this.addEvents();
                _this.render();
            }
        };

        _this.setVars = function () {
            _this.FollowButton = FXStreet.Util.getjQueryObjectById(_this.FollowButtonId, false);
            if (_this.FollowButton != null && _this.FollowButton.length > 0) {
                _this.FollowButton.on("click", _this.followEvent);
            }
            isLogginRequired = !_this.UserInfo.IsLogged;
            if (_this.FollowingMessageBox && _this.UnFollowingMessageBox) {
                _this.FollowingMessageBox = FXStreet.Util.getjQueryObjectById(_this.FollowingMessageBoxId, false);
                _this.UnFollowingMessageBox = FXStreet.Util.getjQueryObjectById(_this.UnFollowingMessageBoxId, false);
            }    
        };

        _this.addEvents = function () {
            if (_this.FollowButton != null && _this.FollowButton.length > 0) {
                _this.FollowButton.unbind("click").on("click", _this.followEvent);
            }
        };

        _this.render = function () {
            if (_this.FollowButton != null && _this.FollowButton.length > 0) {
                if (_this.UserInfo.Personalization && _this.UserInfo.Personalization.AuthorsFollowing) {
                    var authorExist = $.grep(_this.UserInfo.Personalization.AuthorsFollowing, function (author) {
                        return author.AuthorId === _this.Author.Id;
                    });
                    if (authorExist.length > 0) {
                        _this.FollowButton.addClass(followingClass);
                    } else {
                        _this.FollowButton.removeClass(followingClass);
                    }
                }
                if (_this.UserInfo.Personalization && _this.UserInfo.Personalization.Authors) {
                    var authorExist = $.grep(_this.UserInfo.Personalization.Authors, function (author) {
                        return author.Author.Id === _this.Author.Id;
                    });
                    if (authorExist.length > 0) {
                        _this.FollowButton.addClass(followingClass);
                    } else {
                        _this.FollowButton.removeClass(followingClass);
                    }
                }
            }
        };

        _this.followEvent = function (e) {
            if (isLogginRequired) {
                var userMenu = FXStreet.Util.getObjectInstance("UserMenu");
                if (userMenu == null) {
                    return;
                }
                userMenu.Login();
            }
            else {
                if ($(e.currentTarget).hasClass(followingClass)) {
                    _this.UnFollow();
                } else {
                    _this.Follow();
                }
                _this.render();
                _this.ShowAlert();
            }
        };

        _this.SendToEventHub = function (type) {
            var data = {
                "AuthorId": _this.Author.Id,
                "LanguageId": FXStreet.Resource.LanguageId
            };

            var tagManager = FXStreet.Class.Patterns.Singleton.TagManager.Instance();
            tagManager.PushToEventhub(data, type);
        };

        _this.ShowAlert = function () {
            if (_this.FollowingMessageBox && _this.UnFollowingMessageBox) {
                $(_this.FollowingMessageBox).addClass(hideAlertClass);
                $(_this.UnFollowingMessageBox).addClass(hideAlertClass);

                if (_this.FollowButton.hasClass(followingClass)) {
                    $(_this.FollowingMessageBox).removeClass(hideAlertClass);
                } else {
                    $(_this.UnFollowingMessageBox).removeClass(hideAlertClass);
                }
            }
        };

        _this.Follow = function () {
            if (_this.UserInfo.Personalization && _this.UserInfo.Personalization.AuthorsFollowing) {
                _this.UserInfo.Personalization.AuthorsFollowing.push({ AuthorId: _this.Author.Id });
            }
            if (_this.UserInfo.Personalization && _this.UserInfo.Personalization.Authors) {
                _this.UserInfo.Personalization.Authors.push({ Author: _this.Author });
            }
            _this.SendToEventHub("AuthorFollow");
        };

        _this.UnFollow = function () {
            if (_this.UserInfo.Personalization && _this.UserInfo.Personalization.AuthorsFollowing) {
                var index = -1;
                var authorExist = $.grep(_this.UserInfo.Personalization.AuthorsFollowing, function (author, pos) {
                    if (author.AuthorId === _this.Author.Id)
                        index = pos;
                    return author.AuthorId === _this.Author.Id;
                });
                if (authorExist.length > 0) {
                    _this.UserInfo.Personalization.AuthorsFollowing.splice(index, 1);
                }
            }
            if (_this.UserInfo.Personalization && _this.UserInfo.Personalization.Authors) {
                var index = -1;
                var authorExist = $.grep(_this.UserInfo.Personalization.Authors, function (author, pos) {
                    if (author.Author.Id === _this.Author.Id)
                        index = pos;
                    return author.Author.Id === _this.Author.Id;
                });
                if (authorExist.length > 0) {
                    _this.UserInfo.Personalization.Authors.splice(index, 1);
                }
            }
            _this.SendToEventHub("AuthorUnFollow");
        };



        return _this;
    };
}());