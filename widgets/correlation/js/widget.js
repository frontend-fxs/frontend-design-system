(function ($) {
    FXStreetWidgets.Widget.Correlation = function (loaderBase) {
        var parent = FXStreetWidgets.Widget.Base(loaderBase),
            _this = FXStreetWidgets.Util.extendObject(parent);

        _this.AssetId = "";
        _this.NumOfCorrelations = "";
        _this.WidgetId = null;
        _this.Seo = false;
        _this.MustacheKey = "";
        _this.HideFullReport = false;
        _this.FullReportUrl = "";

        _this.outerColor = '#F5C861';
        _this.innerColor = '#A3A3A8';

        _this.init = function (json) {
            _this.setSettingsByObject(json);
            _this.setVars();
            _this.loadDataFromUrl(_this.loaderBase.config.EndPoint + _this.AssetId + '/' + _this.NumOfCorrelations);
        };

        _this.setVars = function () {
            _this.WidgetId = 'cor_' + FXStreetWidgets.Util.guid();
            _this.Container.attr('id', _this.WidgetId);
        };

        _this.jsonDataIsValid = function (data) {
            var result = FXStreetWidgets.Util.isValid(data);
            return result;
        };

        _this.renderHtml = function () {
            var studies = {};
            var periods = ["IntraDay15", "IntraDay60", "IntraDay240", "Daily", "Weekly"];
            periods.forEach(function (item) {
                studies[item] = _this.data.Result.filter(function(i) {
                     return i.Period === item;
                })[0];
            });

            var jsonData = {
                Studies: studies,
                Translations: _this.loaderBase.config.Translations,
                Seo: _this.Seo,
                WidgetId: _this.WidgetId,
                FullStudy: !_this.HideFullReport,
                FullReportUrl: _this.FullReportUrl
            };

            jsonData = _this.setDatesToJson(jsonData, _this.data.Date);

            var rendered = FXStreetWidgets.Util.renderByHtmlTemplate(_this.loaderBase.config.Mustaches[_this.loaderBase.config.WidgetName], jsonData);
            _this.Container.html(rendered);

            $(document).ready(function () { _this.manageRenderedHtml() });
            //_this.manageRenderedHtml();
        };

        _this.manageRenderedHtml = function () {
            _this.setToolTip();
            _this.renderCharts();
        }

        _this.renderCharts = function () {
            // Importante!: añadir "chart.flush();" on window resize para que vuelva a pintar la gráfica (y ajuste las medidas)
            // Importante3!: Si se configura para dejar menos categories (pares), eliminar del centro hacia afuera: los últimos en ser descartados deben ser los extremos (siempre números pares: 2, 4, 6, 8, 10, ...)
            var data15m = _this.data.Result.filter(function (item) { return item.Period === "IntraDay15" })[0].Values;
            _this.renderChart(1, data15m);
            var data60m = _this.data.Result.filter(function (item) { return item.Period === "IntraDay60" })[0].Values;
            _this.renderChart(2, data60m);
            var data4h = _this.data.Result.filter(function (item) { return item.Period === "IntraDay240" })[0].Values;
            _this.renderChart(3, data4h);
            var data1d = _this.data.Result.filter(function (item) { return item.Period === "Daily" })[0].Values;
            _this.renderChart(4, data1d);
            var data1M = _this.data.Result.filter(function (item) { return item.Period === "Weekly" })[0].Values;
            _this.renderChart(5, data1M);
        };

        _this.renderChart = function (chartNumId, values) {
            var columns = ['data1'];
            var categories = [];
            var data = ['data1'];
            var chartColors = [];
            values.forEach(function (item) {
                columns.push(0);
                categories.push(item.Asset.Name);
                data.push(item.Value);
                chartColors.push(_this.innerColor);
            });

            if (chartColors.length > 0) {
                chartColors[0] = _this.outerColor;
                chartColors[chartColors.length - 1] = _this.outerColor;
            }



            var chart = c3.generate({
                bindto: '#' + _this.WidgetId + '_chart' + chartNumId,
                data: {
                    columns: [columns],
                    type: 'bar',
                    names: { data1: 'Correlation' },
                    color: function (color, d) { return chartColors[d.index]; } // *!!Metido harcoded a saco, preguntar cómo funciona (son diferentes sólo el min y max)
                },
                bar: { width: 15 },
                legend: { hide: true },
                axis: {
                    rotated: true,
                    x: {
                        type: 'category',
                        categories: categories
                    },
                    y: {
                        padding: { top: 10, bottom: 10 },
                        max: 1,
                        min: -1,
                        center: 0,
                        tick: { values: [-1, -0.5, 0, 0.5, 1] }
                    }
                },
                grid: {
                    y: {
                        show: true,
                        lines: [{ value: 0 }]
                    }
                },
                padding: { bottom: 0 },
                size: { height: 48 + 28 * values.length } //Altura proporcional al número de items, hablar con maquetación
            });

            setTimeout(function () {
                chart.load({
                    columns: [data]
                });
            }, 500);
        }

        _this.setToolTip = function () {
            _this.Container.find('[data-toggle="tooltip"]').tooltip();
        };

        return _this;
    };
}(FXStreetWidgets.$));