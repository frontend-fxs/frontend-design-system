(function ($) {
    FXStreetWidgets.Chart.CtpMultiAssetBars = function () {
        var parent = FXStreetWidgets.Chart.Base(),
            _this = FXStreetWidgets.Util.extendObject(parent);

        _this.Id = "";
        _this.BuyStaticsPercent = {};
        _this.SellStaticsPercent = {};
        _this.Translations = {};
        
        parent.getPrintJson = function () {
            var colorsJson = {};
            colorsJson[_this.Translations.Sell] = '#CE4735';
            colorsJson[_this.Translations.Buy] = '#338473';

            var chartJson = {
                bindto: '#' + _this.Id,
                data: {
                    columns: [
                        [_this.Translations.Sell, _this.SellStaticsPercent],
                        [_this.Translations.Buy, _this.BuyStaticsPercent]
                    ],
                    type: 'bar',
                    groups: [
                        [_this.Translations.Sell, _this.Translations.Buy]
                    ],
                    order: 'null',
                    colors: colorsJson
                },
                padding: {
                    right: 0
                },
                axis: {
                    y: {
                        show: false
                    },
                    x: {
                        show: false
                    },
                    rotated: true
                },
                bar: {
                    width: 6
                },
                size: {
                    height: 35
                },
                tooltip: {
                    show: false
                },
                legend: {
                    show: false
                }
            };

            return chartJson;
        };

        return _this;
    };
}(FXStreetWidgets.$));