(function ($) {
    FXStreetWidgets.Chart.CtpSpeedometer = function () {
        var parent = FXStreetWidgets.Chart.Base(),
            _this = FXStreetWidgets.Util.extendObject(parent);

        _this.delayTimeForAnimationInSpeedometerResize = 100;
        _this.delayTimeForAnimationInSpeedometerLoad = 250;
        _this.SellStaticsPercent = null;
        _this.Id = "";
    
        parent.delayAnimations = function () {
            setTimeout(function () {
                _this.chart.resize({
                    columns: [
                    ['Buy', 100],
                    ['Sell', undefined]
                    ]
                });
            }, _this.delayTimeForAnimationInSpeedometerResize);
            
            setTimeout(function () {
                _this.chart.load({
                    columns: [
                    ['Buy', 100],
                    ['Sell', _this.SellStaticsPercent]
                    ]
                });
            }, _this.delayTimeForAnimationInSpeedometerLoad);
        };

        parent.getPrintJson = function () {
            var pattern = _this.SellStaticsPercent < 100 ? ['#CE4735', '#CE4735', '#328372'] : ['#CE4735'];
            var chartJson = {
                bindto: '#' + _this.Id,
                data: {
                    columns: [
                        ['Buy', 0],
                        ['Sell', 0]
                    ],
                    type: 'gauge'
                },
                zoom: {
                    enabled: false
                },
                gauge: {
                    label: {
                        show: false
                    },
                    units: ' %',
                    width: 6
                },
                color: {
                    pattern: pattern,
                    threshold: {
                        values: [0, 100]
                    }
                },
                size: {
                    height: 100,
                    width: 190
                },
                tooltip: {
                    show: false
                },
                interaction: { enabled: false }
            };
            return chartJson;
        };

        return _this;
    };
}(FXStreetWidgets.$));