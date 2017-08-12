(function() {
    FXStreet.Class.Modal = function() {
        var parent = FXStreet.Class.Base(),
            _this = FXStreet.Util.extendObject(parent);

        _this.IsEditorMode = "";
        _this.ShowModal = true;

        _this.init = function(json) {
            _this.setSettingsByObject(json);
            _this.setVars();
            _this.addEvents();
        };

        _this.setVars = function() {
            _this.ShowModal =  (_this.IsEditorMode.toLowerCase() !== "true");
        }

        _this.addEvents = function () {
            if (_this.ShowModal) {
                $('.modal').modal('show');
                $('.modal').on('hidden.bs.modal', function () {
                    if (document.referrer) {
                        window.location.assign(document.referrer);
                    }
                });
            }
            
            var leaderboard = $('div .fxs_modal_add.fxs_leaderboard');
            if (!leaderboard.html().trim()) {
                leaderboard.hide();
            }

            var referredUrl = FXStreet.Util.parseUrl(document.referrer);
            if (!referredUrl || referredUrl.host !== window.location.host) {
                $('.fxs_modal_wrap > button').hide();
                $('.fxs_modal_wrap').off('click');
            }
        };

        return _this;
    };
}());