(function () {
    FXStreet.Class.BrokersSpreads = function () {
        var parent = FXStreet.Class.Base(),
            _this = FXStreet.Util.extendObject(parent);

        // ----- begin json properties -----

        _this.ContainerId = "";
        _this.Brokers = [];
        _this.Pairs = [];
        _this.SitefinitySpreadsPageUrl = "";
        _this.ShowAllSpreadsButton = false;
        _this.HtmlTemplateFile = "";

        // ----- end json properties -----

        _this.Container = null;
        _this.BrokersTable = null;

        //_this.HtmlTemplate = 'brokersspreads_default.html';
        _this.LowerPriceClass = 'fxs_widget_spreads_item_lower';

        _this.init = function (json) {
            _this.setSettingsByObject(json);
            _this.setVars();
            _this.render();
        };

        _this.setVars = function () {
            _this.Container = FXStreet.Util.getjQueryObjectById(_this.ContainerId);
        };

        _this.render = function () {
            var data = {
                Value: {
                    Brokers: _this.Brokers,
                    Pairs: _this.Pairs,
                    SitefinitySpreadsPageUrl: _this.SitefinitySpreadsPageUrl,
                    ShowAllSpreadsButton: _this.ShowAllSpreadsButton,
                    SingleMyFxBookSpreadServer: _this.Brokers[0].MyFxBookSpreadServer
                },
                Translations: FXStreet.Resource.Translations["BrokersSpreads_Widget"],
                ColumnsNumber: 3 + _this.Pairs.length
            };

            _this.htmlRender(data);
        };

        _this.htmlRender = function (data) {
            FXStreet.Util.loadHtmlTemplate(_this.HtmlTemplateFile).done(function (template) {
                var html = FXStreet.Util.renderByHtmlTemplate(template, data);
                _this.Container.html(html);

                _this.BrokersTable = _this.Container.find('table');

                var json = {
                    SpreadServer: $.map(_this.Brokers, function (item) {
                        return item.MyFxBookSpreadServer;
                    }),
                    Symbols: $.map(_this.Pairs, function (item) {
                        return item.MyFxBookSpreadId;
                    }),
                    GetSpreadsIntervalInMilliseconds: 1500,
                    GetSpreadsDelegated: _this.SpreadsRecieved
                };

                var myFxBookHandler = FXStreet.Class.MyFxBookHandler();
                myFxBookHandler.init(json);

                _this.SetTooltip();
            });
        };

        _this.SetTooltip = function() {
            $('[data-toggle="tooltip"]').tooltip();
            $('tr').tooltip({ trigger: 'click' });
        };

        _this.SpreadsRecieved = function (data) {
            var rows = data.split(";");

            rows.forEach(function (item) {
                var values = item.split(",");
                var spreadserver = values[0];
                var spreadid = values[1];
                var price = values[2];

                var priceSpan = _this.BrokersTable.find('td[fxs_spreadserver="' + spreadserver + '"][fxs_spreadid="' + spreadid + '"] span[fxs_content="spreadPrice"]');
                priceSpan.text(price);
            });

            _this.Pairs.forEach(function (item) {
                var allSpreads = _this.BrokersTable.find('td[fxs_spreadid="' + item.MyFxBookSpreadId + '"] span[fxs_content="spreadPrice"]');
                var emptySpreads = allSpreads.filter(function (i, spread) {
                    var text = $(spread).text();
                    return text === "" || text === "N/A";
                });

                $.each(emptySpreads, function(index, spread) {
                    $(spread).html("N/A");
                });

                var spreads = allSpreads.not(emptySpreads);
                
                spreads.removeClass(_this.LowerPriceClass);
                var prices = $.map(spreads, function (spread) { return $(spread).text(); });
                var minPrice = Math.min.apply(Math, prices);

                var spreadsMinPrices = spreads.filter(function (i, spread) {
                    return $(spread).text() == minPrice; // Caution, must be == instead of ===, as they are different types
                });
                spreadsMinPrices.addClass(_this.LowerPriceClass);
            });
        };

        return _this;
    };
}());