(function ($) {
    FXStreetWidgets.Widget.ForecastMultiasset = function (loaderBase) {
        var parent = FXStreetWidgets.Widget.Base(loaderBase),
            _this = FXStreetWidgets.Util.extendObject(parent);

        _this.Assets = null;
        _this.ClassSize = null;
        _this.HideFullReport = false;
        _this.WidgetId = "";
        _this.FullReportUrl = "";
        _this.FullStudyUrl = "";
        _this.Seo = false;

        _this.WeekBarsId = "forecastmultiasset_1w";
        _this.MonthBarsId = "forecastmultiasset_1m";
        _this.QuarterBarsId = "forecastmultiasset_1q";

        _this.Charts = [];

        _this.Bullish = "Bullish";
        _this.Bearish = "Bearish";
        _this.Sideways = "Sideways";

        _this.ForecastPeriodTimeType = {
            WEEK: "Week",
            MONTH: "Month",
            QUARTER: "Quarter"
        };

        _this.init = function (json) {
            _this.setSettingsByObject(json);
            var url = this.loaderBase.config.EndPoint + "?assetids=" + _this.Assets;
            _this.loadDataFromUrl(url);
        };

        _this.renderHtml = function () {
            var studies = $.grep(_this.data.Values, function (study, index) {
                return study !== null && study.Entries !== null;
            });

            if (studies.length === 0) {
                return;
            }

            $.each(studies, function (i, study) {
                $.each(_this.ForecastPeriodTimeType, function (j, period) {
                    var property = period + "Statics";
                    study[property].BiasDisplay = _this.loaderBase.config.Translations[study[property].Bias];
                });

                study.FullReportUrl = _this.FullReportUrl.replace('{{asset}}', study.Asset.Url).toLowerCase();
                formatPrices(study, study.Asset.DecimalPlaces);
            });

            var jsonData = {
                Studies: studies,
                Translations: _this.loaderBase.config.Translations,
                FullStudyUrl: _this.FullStudyUrl,
                Seo: _this.Seo
            };

            if (studies[0].Date) {
                jsonData = _this.setDatesToJson(jsonData, studies[0].Date);
            }

            var rendered = FXStreetWidgets.Util.renderByHtmlTemplate(_this.loaderBase.config.Mustaches[_this.loaderBase.config.WidgetName], jsonData);
            _this.Container.html(rendered);

            _this.manageRenderedHtml();
            _this.printCharts(studies);
        };

        _this.manageRenderedHtml = function () {
            _this.addSizeClass();
            _this.handleFullReport();
            _this.addTabOnClick();
        };

        _this.addSizeClass = function () {
            if (_this.ClassSize) {
                _this.Container.find('.fxs_forecast_widget_multi').addClass(_this.ClassSize);
            }
        };

        _this.handleFullReport = function () {
            if (_this.HideFullReport) {
                _this.Container.find('.fxs_btn.fxs_btn_line.fxs_btn_small').remove();
            }
        };

        _this.addTabOnClick = function () {
            //TODO Omar crear un objecto que gestione los tabs, y tenga los elementos cargados una sola vez en memoria y asi evitar el  container.find cada vez
            //rename tab1,2,3 per week motnh, quarter

            _this.Container.find('#tab_1').on('click', function () {
                _this.Container.find('.avg_1w').addClass('active');
                _this.Container.find('#tab_2, #tab_3').parent().removeClass('active');
                _this.Container.find(this).parent().addClass('active');
                _this.Container.find('.avg_1m, .avg_1q').removeClass('active');
                _this.notifyChartsActiveChange();
            });
            _this.Container.find('#tab_2').on('click', function () {
                _this.Container.find('.avg_1m').addClass('active');
                _this.Container.find('#tab_1, #tab_3').parent().removeClass('active');
                _this.Container.find(this).parent().addClass('active');
                _this.Container.find('.avg_1w, .avg_1q').removeClass('active');
                _this.notifyChartsActiveChange();
            });
            _this.Container.find('#tab_3').on('click', function () {
                _this.Container.find('.avg_1q').addClass('active');
                _this.Container.find('#tab_1, #tab_2').parent().removeClass('active');
                _this.Container.find(this).parent().addClass('active');
                _this.Container.find('.avg_1w, .avg_1m').removeClass('active');
                _this.notifyChartsActiveChange();
            });
        };

        _this.notifyChartsActiveChange = function () {
            $.each(_this.Charts, function (i, chart) {
                chart.ActiveChange();
            });
        };

        //#region Charts

        _this.printCharts = function (studies) {
            _this.instanciateBars(studies, _this.WeekBarsId, _this.ForecastPeriodTimeType.WEEK);
            _this.instanciateBars(studies, _this.MonthBarsId, _this.ForecastPeriodTimeType.MONTH);
            _this.instanciateBars(studies, _this.QuarterBarsId, _this.ForecastPeriodTimeType.QUARTER);
        };

        _this.instanciateBars = function (studies, barsId, type) {
            $.each(studies, function (index, study) {
                var statics = study[type + "Statics"];

                var newBarsId = barsId + _this.WidgetId;
                var chartId = newBarsId + index + "_chart";

                _this.renderChart(barsId, newBarsId, chartId, statics, type);

                var initJsonBars = {
                    Type: type,
                    BullishPercent: statics.BullishPercent,
                    BearishPercent: statics.BearishPercent,
                    SidewaysPercent: statics.SidewaysPercent,
                    Id: chartId
                };

                var forecastBars = new FXStreetWidgets.Chart.ForecastBars();
                forecastBars.init(initJsonBars);

                _this.Charts.push(forecastBars);
            });
        };

        _this.renderChart = function (barsId, newBarsId, chartId, statics, type) {
            var html = _this.getBarsHtml(chartId, statics, type);

            var bars = _this.Container.find("#" + barsId);
            if (bars) {
                bars.attr("id", newBarsId);
                bars.html(html);
            }
        };

        _this.getBarsHtml = function (chartId, statics, type) {
            var typeLiteral = _this.loaderBase.config.Translations[type];

            var mustacheJson = {
                ResultType: "result_" + statics.Bias.toLowerCase(),
                ChartId: chartId,
                Type: typeLiteral,
                Statics: statics,
                Translations: _this.loaderBase.config.Translations
            };

            var html = FXStreetWidgets.Util.renderByHtmlTemplate(_this.loaderBase.config.Mustaches["forecastmultiasset_bars"], mustacheJson);
            return html;
        };

        //#endregion Charts

        var formatPrices = function (json, decimalPlaces) {
            if (json.WeekStatics.PriceAverage) {
                json.WeekStatics.PriceAverage = json.WeekStatics.PriceAverage.toFixed(decimalPlaces);
            }
            if (json.MonthStatics.PriceAverage) {
                json.MonthStatics.PriceAverage = json.MonthStatics.PriceAverage.toFixed(decimalPlaces);
            }
            if (json.QuarterStatics.PriceAverage) {
                json.QuarterStatics.PriceAverage = json.QuarterStatics.PriceAverage.toFixed(decimalPlaces);
            }
        }

        return _this;
    };
}(FXStreetWidgets.$));