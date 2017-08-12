(function ($) {
    FXStreetWidgets.Chart.ForecastSpeedometer = function () {
        var parent = FXStreetWidgets.Chart.Base(),
            _this = FXStreetWidgets.Util.extendObject(parent);

        _this.bullish = "Bullish";
        _this.bearish = "Bearish";
        _this.sideways = "Sideways";
        _this.delayTimeForAnimationInSpeedometerResize = 100;
        _this.delayTimeForAnimationInSpeedometerLoad = 250;
       
        _this.Id = "";
        _this.Container = null;
        _this.StaticsColumns = null;
        _this.BullishPercent = null;
        _this.BearishPercent = null;
        _this.SidewaysPercent = null;

        parent.init = function(json) {
            _this.setSettingsByObject(json);
           
            var bullishValue = _this.BullishPercent;
            var bearishValue = bullishValue + _this.BearishPercent;
            var sidewaysValue = 100;

            if (_this.SidewaysPercent === 0) {
                sidewaysValue = 0;
                bearishValue = 100;
            }

            _this.StaticsColumns = [[_this.bullish, bullishValue], [_this.bearish, bearishValue], [_this.sideways, sidewaysValue]];
            _this.Container = $('#' + _this.Id);

            _this.print(_this.getPrintJson());
        };

        parent.delayAnimations = function () {
            setTimeout(function () {
                _this.chart.resize({
                    height: 90,
                    width: undefined
                });
            }, _this.delayTimeForAnimationInSpeedometerResize);
            setTimeout(function () {
                _this.chart.load({
                    columns: _this.StaticsColumns
                });
            }, _this.delayTimeForAnimationInSpeedometerLoad);
        };

        parent.getPrintJson = function () {
            var chartJson = {
                bindto: '#' + _this.Id,
                data: {
                    columns: [[_this.sideways, 0], [_this.bearish, 0], [_this.bullish, 0]],
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
                    pattern: ['#8B8C91', '#CE4735', '#338473']
                },
                size: {
                    height: 90,
                    width: 190
                },
                tooltip: {
                    show: false
                },
                interaction: { enabled: false }
            };

            return chartJson;
        };

        _this.ActiveChange = function () {
            if (_this.Container.closest(".forecast_timeframe_slot").hasClass("active")) {
                _this.chart.flush();
            }
        };

        return _this;
    };
}(FXStreetWidgets.$));