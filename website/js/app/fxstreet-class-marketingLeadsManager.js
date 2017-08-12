(function () {
    FXStreet.Class.MarketingLeadsManager = function () {
        var parent = FXStreet.Class.Base(),
            _this = FXStreet.Util.extendObject(parent);

        _this.MarketingLeadsRecorderUrl = null;
        _this.MarketingLeadsReaderUrl = null;

        _this.init = function (json) {
            _this.setSettingsByObject(json);
            _this.setVars();
        };

        _this.setVars = function () {
        };

        _this.AddData = function (data, callback) {
            $.ajax({
                type: "POST",
                url:  _this.MarketingLeadsRecorderUrl,
                data: JSON.stringify(data),
                contentType: "application/json"
            }).done(callback);
        };

        _this.GetData = function (data, callback) {
            $.ajax({
                type: "GET",
                url: _this.MarketingLeadsReaderUrl,
                contentType: "application/json"
            }).done(callback);
        };

        _this.SavePlayEvent = function (event, callback) {
            if (FXStreet.Resource.UserInfo.Email) {
                var data = _this.GetContent(event);
                _this.AddData(data, callback);
            }
        };

        _this.GetContent = function (event) {
            var UTCdate = (new Date()).toUTCString();

            var content =
            {
                Title: event.Title,
                Email: FXStreet.Resource.UserInfo.Email,
                FirstName: FXStreet.Resource.UserInfo.FirstName,
                Contact: event.Contact,
                Phone: FXStreet.Resource.UserInfo.Phone,
                Origin: event.Origin,
                Date: UTCdate
            };

            return content;
        };

        return _this;
    };
}());