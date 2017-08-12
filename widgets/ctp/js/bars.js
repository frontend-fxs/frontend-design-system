(function ($) {
    FXStreetWidgets.Chart.CtpBars = function () {
        var parent = FXStreetWidgets.Chart.Base(),
            _this = FXStreetWidgets.Util.extendObject(parent);

        _this.DelayTimeForAnimationInBars = 1000;
       
        _this.Id = "";
        _this.Signals = {};
        _this.Translations = {};

        _this.SellArray = [];
        _this.BuyArray = [];
        _this.SellArrayEmpty = [];
        _this.BuyArrayEmpty = [];
        _this.SignalsArray = [];

        parent.init = function (json) {
            _this.setSettingsByObject(json);

            _this.SignalsArray = ["x"];
            _this.SellArray = [_this.Translations.Sell];
            _this.BuyArray = [_this.Translations.Buy];
            _this.SellArrayEmpty = [_this.Translations.Sell];
            _this.BuyArrayEmpty = [_this.Translations.Buy];

            var valuesToPrint = []; // Dictionaty<EntryValue, IsSell>

            $.each(_this.Signals, function (i, signal) {
                var isSell = signal.OrderDirection === "SELL" || signal.OrderDirection === "SHORT";
                valuesToPrint.push({ Value: signal.Entry, IsSell: isSell });
                if (signal.StopLoss)
                    valuesToPrint.push({ Value: signal.StopLoss, IsSell: !isSell });
                if (signal.TakeProfit1)
                    valuesToPrint.push({ Value: signal.TakeProfit1, IsSell: !isSell });
                if (signal.TakeProfit2)
                    valuesToPrint.push({ Value: signal.TakeProfit2, IsSell: !isSell });
                if (signal.TakeProfit3)
                    valuesToPrint.push({ Value: signal.TakeProfit3, IsSell: !isSell });
            });

            valuesToPrint.sort(function (a, b) { return parseFloat(a.Value) - parseFloat(b.Value); });
            _this.handleEqualValues(valuesToPrint);

            $.each(valuesToPrint, function (i, signal) {
                _this.SellArrayEmpty.push(0);
                _this.BuyArrayEmpty.push(0);

                _this.SignalsArray.push(signal.Value);
                if (signal.IsSell) {
                    _this.SellArray.push(1);
                    _this.BuyArray.push(0);
                } else {
                    _this.SellArray.push(0);
                    _this.BuyArray.push(1);
                }
            });

            _this.print(_this.getPrintJson());
        };

        _this.handleEqualValues = function (valuesToPrint) {
            if (valuesToPrint !== null) {
                for (var i = 0; i < valuesToPrint.length; i++) {
                    var appearances = 0;
                    for (var j = i+1; j < valuesToPrint.length; j++) {
                        if (i !== j && parseFloat(valuesToPrint[i].Value) === parseFloat(valuesToPrint[j].Value)) {
                            var incrementalValue = (+(0.00001 + (appearances / 100000)).toFixed(5));
                            valuesToPrint[j].Value = (parseFloat(valuesToPrint[j].Value) + incrementalValue).toFixed(5).toString();
                            appearances++;
                        }
                    };
                }
            }
        };

        parent.delayAnimations = function () {
            setTimeout(function () {
                _this.chart.load({
                    columns: [
                        _this.BuyArray,
                        _this.SellArray
                    ]
                });
            }, _this.DelayTimeForAnimationInBars);
        };

        parent.getPrintJson = function () {
            var colorsJson = {};
            colorsJson[_this.Translations.Sell] = '#CE4735';
            colorsJson[_this.Translations.Buy] = '#338473';

            var chartJson = {
                bindto: '#' + _this.Id,
                data: {
                    x: 'x',
                    columns: [
                        _this.SignalsArray,
                        _this.SellArrayEmpty,
                        _this.BuyArrayEmpty
                    ],
                    type: 'bar',
                    colors: colorsJson
                },
                bar: {
                    width: 2
                },
                padding: {
                    left: 16
                },
                size: {
                    height: 105
                },
                tooltip: {
                    show: true,
                    format: {
                        title: function (d) { return d; },
                        value: function (value, ratio, id) {
                            return ratio;
                        }
                    }
                },
                axis: {
                    y: {
                        show: false
                    },
                    x: {
                        tick: {
                            values: _this.getTickValues(_this.SignalsArray.slice(1, _this.SignalsArray.length))
                        }
                    }
                },
                legend: {
                    position: 'right'
                }
            };

            return chartJson;
        };

        _this.getSignalsAvg = function(values) {
            var avg = 0;
            var valLength = values[0].length;
            for (var i = 0; i < values.length; i++) {
                var val = parseFloat(values[i]);
                avg = avg + val;
            }

            return (avg / values.length).toString().slice(0, valLength);
        };

        _this.getTickValues = function (values) {
            values.sort();
            return [values[0], _this.getSignalsAvg(values), values[values.length - 1]];
        };

        return _this;
    };
}(FXStreetWidgets.$));