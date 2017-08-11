(function ($) {
    FXStreetWidgets.Chart.ForecastBars = function () {
        var parent = FXStreetWidgets.Chart.Base(),
            _this = FXStreetWidgets.Util.extendObject(parent);

        _this.bullish = "Bullish";
        _this.bearish = "Bearish";
        _this.sideways = "Sideways";

        _this.Id = "";
        _this.Container = null;
        _this.StaticsColumns = null;
        _this.Type = "";
        _this.BullishPercent = null;
        _this.BearishPercent = null;
        _this.SidewaysPercent = null;

        parent.init = function (json) {
            _this.setSettingsByObject(json);

            var bullishValue = _this.BullishPercent / 100;
            var bearishValue = _this.BearishPercent / 100;
            var sidewaysValue = _this.SidewaysPercent / 100;

            _this.StaticsColumns = [[_this.bullish, bullishValue], [_this.bearish, bearishValue], [_this.sideways, sidewaysValue]];
            _this.Container = $('#' + _this.Id);

            _this.print(_this.getPrintJson());
        };

        parent.getPrintJson = function () {
            var chartJson = {
                bindto: '#' + _this.Id,
                data: {
                    columns: _this.StaticsColumns,
                    type: 'bar',
                    groups: [
                        [_this.bullish, _this.bearish, _this.sideways]
                    ],
                    order: 'null',
                    colors: {
                        Bullish: '#338473',
                        Bearish: '#CE4735',
                        Sideways: '#8b8c91'
                    }
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
                    height: 35,
                    width: undefined
                },
                legend: {
                    show: false
                },
                tooltip: {
                    format: {
                        title: function (d) { return "1 " + _this.Type; },
                        value: function (value, ratio, identifier) {
                            var format = identifier === "data1" ? d3.format(",") : d3.format("%");
                            return format(value);
                        }
                    }
                }
            };

            return chartJson;
        };
        
        _this.ActiveChange = function () {
            if (_this.Container.closest(".forecast_timeframe").hasClass("active")) {
                _this.chart.flush();
            }
        };

        return _this;
    };
}(FXStreetWidgets.$));