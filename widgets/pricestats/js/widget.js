(function ($) {
    FXStreetWidgets.Widget.PriceStats = function (loaderBase) {
        var parent = FXStreetWidgets.Widget.Base(loaderBase),
            _this = FXStreetWidgets.Util.extendObject(parent);

        _this.Pair = null;
        _this.PushPriceClassName = null;
        _this.DataProviderHost = null;
        _this.TokenProviderHost = null;
        _this.WidgetId = "";

        _this.init = function (json) {
            _this.setSettingsByObject(json);
            _this.loadData({ pair: _this.Pair });
        };

        _this.renderHtml = function () {
            _this.renderHtmlCallback();

            if (_this.shouldPush()) {
                var pushPriceObj = new FXStreet.Class[_this.PushPriceClassName];
                pushPriceObj.init({
                    Pair: _this.Pair,
                    TokenProviderHost: _this.TokenProviderHost,
                    DataProviderHost: _this.DataProviderHost,
                    RenderCallback: _this.renderHtmlCallback
                });
            }
        };

        _this.shouldPush = function () {
            return _this.PushPriceClassName !== '' && window.FXStreet != undefined && FXStreet.Class[_this.PushPriceClassName];
        };

        _this.renderHtmlCallback = function () {
            var priceStatics = _this.data;

            if (+(priceStatics.ChangePercent) > 0) {
                priceStatics["PriceClass"] = "price_up";
            } else {
                priceStatics["PriceClass"] = "price_down";
            }

            var json = {
                PriceStatics: priceStatics,
                PairName: _this.Pair
            };

            var html = FXStreetWidgets.Util.renderByHtmlTemplate(_this.loaderBase.config.Mustaches[_this.loaderBase.config.WidgetName], json);
            _this.Container.html(html);


            _this.manageRenderedHtml();
        };

        _this.manageRenderedHtml = function () {

        };

        return _this;
    };
}(FXStreetWidgets.$));