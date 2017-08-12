(function () {
    FXStreet.Class.BrokersList = function () {
        var parent = FXStreet.Class.Base(),
            _this = FXStreet.Util.extendObject(parent);

        // ----- begin json properties -----
        _this.ContainerId = "";
        // ----- end json properties -----

        _this.Container = null;
        _this.BrokersTable = null;
        _this.SpreadsElements = [];
        _this.LowerPriceClass = 'fxs_widget_spreads_item_lower';

        _this.init = function (json) {
            _this.setSettingsByObject(json);
            _this.setVars();
            _this.InitMyFxBookHandler();
        };

        _this.setVars = function () {
            _this.Container = FXStreet.Util.getjQueryObjectById(_this.ContainerId);
            _this.BrokersTable = _this.Container.find('table');
            _this.SpreadsElements = _this.BrokersTable.find('td[fxs_spreadserver]');
        };

        _this.InitMyFxBookHandler = function () {
            var json = {
                SpreadServer: [],
                Symbols: [],
                GetSpreadsIntervalInMilliseconds: 1500,
                GetSpreadsDelegated: _this.SpreadsRecieved
            };

            for (var i = 0; i < _this.SpreadsElements.length; i++) {
                var item = $(_this.SpreadsElements[i]);
                json.SpreadServer.push(item.attr('fxs_spreadserver'));
                json.Symbols.push(item.attr('fxs_spreadid'));
            }

            var myFxBookHandler = FXStreet.Class.MyFxBookHandler();
            myFxBookHandler.init(json);
        };

        _this.SpreadsRecieved = function (data) {
            var rows = data.split(";");

            rows.forEach(function (item) {
                var values = item.split(",");
                var spreadserver = values[0];
                var spreadid = values[1];
                var price = values[2];

                var minPriceItem = null;
                for (var i = 0; i < _this.SpreadsElements.length; i++) {
                    var item = $(_this.SpreadsElements[i]);
                    if (item.attr('fxs_spreadid') === spreadid) {
                        var span = item.find('span');
                        if (item.attr('fxs_spreadserver') === spreadserver) {
                            span.html(price);
                        }

                        span.removeClass(_this.LowerPriceClass);
                        var text = span.html();
                        if (text === "" || text === "N/A") {
                            span.html("N/A");
                            continue;
                        }
                        if (minPriceItem === null || text == Math.min(text, minPriceItem.find('span').html())) {
                            minPriceItem = item;
                        }
                    }
                }
                if (minPriceItem !== null) {
                    minPriceItem.find('span').addClass(_this.LowerPriceClass);
                }
            });
        };

        return _this;
    };
}());