(function () {
    FXStreet.Class.BrokerDetails = function () {
        var parent = FXStreet.Class.Base(),
            _this = FXStreet.Util.extendObject(parent);

        _this.Broker = null;
        _this.Pairs = [];
        _this.SpreadsHtmlTemplateFile = "";
        _this.SpreadsContainerId = "";

        _this.Container = null;
        
        _this.init = function (json) {
            _this.setSettingsByObject(json);
            _this.setVars();
            _this.render();
        };

        _this.setVars = function () {
            _this.Container = $("#" + _this.Broker.Id);
            _this.SpreadsContainerId = "fxs-spreads-" + _this.Broker.Id;
        };

        _this.render = function () {
            if (_this.Broker.NotAllowedInSession) {
                _this.disableLinks();
            } else {
                _this.initBrokersSpreads();
            }

            _this.initBrokerCallMe();
        };

        _this.disableLinks = function () {
            var links = _this.Container.find('a');
            $.each(links, function (i, item) {
                $(item).attr('href', '');
                $(item).click(function () { return false });
            });
        };

        _this.initBrokersSpreads = function () {
            var json = {
                "ContainerId": _this.SpreadsContainerId,
                "Brokers": [{ MyFxBookSpreadServer: _this.Broker.MyFxBookSpreadServer }],
                "Pairs": _this.Pairs,
                "HtmlTemplateFile": _this.SpreadsHtmlTemplateFile
            };
            var brokerSpreads = new FXStreet.Class.BrokersSpreads();
            brokerSpreads.init(json);
        };

        _this.initBrokerCallMe = function () {
            var json = {
                "BrokerId": _this.Broker.Id
            };
            var brokerCallMe = new FXStreet.Class.BrokerCallMe();
            brokerCallMe.init(json);
        };

        return _this;
    };
}());