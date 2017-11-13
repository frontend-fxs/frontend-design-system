(function () {
    FXStreet.Class.MyFxBookHandler = function () {
        var parent = FXStreet.Class.Base(),
            _this = FXStreet.Util.extendObject(parent);

        // ***** json properties ***** //
        _this.GetSpreadsDelegated = null;
        _this.GetSpreadsIntervalInMilliseconds = 0; // If the interval is 0, there is not interval
        _this.SpreadServer = [];
        _this.Symbols = [];
        // ***** end json properties ***** //

        _this.MyFxBookApiUrl = "https://spreads.myfxbook.com/api/get-spreads.html";

        _this.init = function (json) {
            _this.setSettingsByObject(json);
            _this.setVars();
            _this.PollSpreads();
        };

        _this.setVars = function () {
            _this.SpreadServer = getValidSpreadsServer();
        };

        _this.PollSpreads = function () {
            if (!_this.SpreadServer.join(',') || _this.SpreadServer.length === 0) {
                _this.ExecuteDelegate('');
                console.warn('The spread brokers has a wrong configuration');
                return;
            }

            return $.ajax({
                type: 'GET',
                dataType: "jsonp",
                url: _this.CreateUrl(),
                success: _this.ExecuteDelegate,
                error: _this.PollSpreadsFailed,
                complete: _this.PollSpreadsFinally
            });

        };

        var getValidSpreadsServer = function () {
            var result = $.grep(_this.SpreadServer, function (spread) {
                return spread !== -1;
            });
            return result;
        }

        _this.ExecuteDelegate = function (data) {
            if (typeof _this.GetSpreadsDelegated === 'function') {
                _this.GetSpreadsDelegated(data);
            }
        }

        _this.PollSpreadsFailed = function (error) {
            console.warn('Error getting spreads');
        }

        _this.PollSpreadsFinally = function () {
            if (_this.GetSpreadsIntervalInMilliseconds > 0) {
                setTimeout(_this.PollSpreads, _this.GetSpreadsIntervalInMilliseconds);
            }
        }

        _this.CreateUrl = function () {
            var querystring = _this.MyFxBookApiUrl + "?";
            querystring += "mt4Servers=" + _this.SpreadServer.join(',') + "&";
            querystring += "symbols=" + _this.Symbols.join(',') + "&";
            return querystring.slice(0, -1);
        }

        return _this;
    };
}());