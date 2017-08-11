(function() {
    FXStreet.Class.Sound = function() {
        var parent = FXStreet.Class.Base(),
            _this = FXStreet.Util.extendObject(parent);

        //#region Json properties
        _this.SoundUrl = null;
        //#endregion

        var Audio = null;

        _this.init = function(json) {
            _this.setSettingsByObject(json);
            _this.setVars();
        };

        _this.setVars = function() {
            createAudioObject();
        };

        var createAudioObject = function() {
            Audio = document.createElement('audio');
            Audio.setAttribute('src', _this.SoundUrl);
        };

        _this.playSound = function () {
            Audio.play();
        };

        return _this;
    };
}());