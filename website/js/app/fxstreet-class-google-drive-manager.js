(function() {
    FXStreet.Class.GoogleDriveManager = function() {
        var parent = FXStreet.Class.Base(),
            _this = FXStreet.Util.extendObject(parent);

        _this.GoogleDriveUrl = null;

        _this.init = function(json) {
            _this.setSettingsByObject(json);
            _this.setVars();
        };

        _this.setVars = function() {
        };

        _this.AddData = function(data, callback) {
            $.ajax({
                type: "PUT",
                url: _this.GoogleDriveUrl,
                data: JSON.stringify(data),
                contentType: "application/json; charset=utf-8"
            }).done(callback);
        };

        _this.SavePlayEvent = function (event, callback) {
            if (FXStreet.Resource.UserInfo.Email) {
                var data = { Content: _this.GetContent(event) };
                _this.AddData(data, callback);
            }
        };

        _this.GetContent = function (event) {
            
            var UTCdate = (new Date()).toUTCString();

            var message = event.Title +"|"+ FXStreet.Resource.UserInfo.Email + "|"
                + FXStreet.Resource.UserInfo.FirstName + "|"
                + FXStreet.Resource.UserInfo.Phone + "|"
                + (event.Contact === true ? "CONTACT" : "NOTCONTACT") + "|"
                + event.Origin + "|"
                + UTCdate ;

            return message;
        };

        return _this;
    };
}());