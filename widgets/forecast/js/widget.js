(function ($) {
    FXStreetWidgets.Widget.Forecast = function (loaderBase) {
        var parent = FXStreetWidgets.Widget.Base(loaderBase),
            _this = FXStreetWidgets.Util.extendObject(parent);

        _this.Asset = null;
        _this.Date = null;
        _this.ClassSize = null;
        _this.HideFullReport = false;
        _this.WidgetId = "";
        _this.FullReportUrl = "";
        _this.Seo = false;

        _this.WeekSpeedometerId = "forecast_1w";
        _this.MonthSpeedometerId = "forecast_1m";
        _this.QuarterSpeedometerId = "forecast_1q";

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
            var url = this.loaderBase.config.EndPoint + "?assetids=" + _this.Asset

            if (FXStreetWidgets.Util.isValid(_this.Date)) {
                url += "&date=" + _this.Date;
            }

            _this.loadDataFromUrl(url);
        };

        var parentJsonDataIsValid = parent.jsonDataIsValid;
        _this.jsonDataIsValid = function (data) {
            var result = parentJsonDataIsValid(data)
                         && FXStreetWidgets.Util.arrayIsValid(data.Values[0].Entries);

            return result;
        };

        _this.renderHtml = function () {
            var studyData = _this.data.Values[0];
            formatPrices(studyData, studyData.Asset.DecimalPlaces);

            $.each(_this.ForecastPeriodTimeType, function (j, period) {
                var property = period + "Statics";
                studyData[property].BiasDisplay = _this.loaderBase.config.Translations[studyData[property].Bias];
            });

            var jsonData = {
                Study: studyData,
                Translations: _this.loaderBase.config.Translations,
                FullReportUrl: _this.FullReportUrl.toLowerCase(),
                Seo: _this.Seo
            };

            jsonData = _this.setDatesToJson(jsonData, studyData.Date);

            var rendered = FXStreetWidgets.Util.renderByHtmlTemplate(_this.loaderBase.config.Mustaches[_this.loaderBase.config.WidgetName], jsonData);
            _this.Container.html(rendered);

            _this.manageRenderedHtml();
            _this.printCharts(studyData);
        };

        _this.manageRenderedHtml = function () {
            _this.addSizeClass();
            _this.handleFullReport();
            _this.addTabOnClick();
        };

        _this.addSizeClass = function () {
            if (_this.ClassSize) {
                _this.Container.find('.fxs_forecast_widget').addClass(_this.ClassSize);
            }
        };

        _this.handleFullReport = function () {
            if (_this.HideFullReport) {
                _this.Container.find('.fxs_btn.fxs_btn_line.fxs_btn_small').remove();
            }
        };

        _this.addTabOnClick = function () {
            $(document).on('shown.bs.tab', 'a[data-toggle="tab"]', function (e) {
                _this.notifyChartsActiveChange();
            });
        };

        _this.notifyChartsActiveChange = function () {
            $.each(_this.Charts, function (i, chart) {
                chart.ActiveChange();
            });
        };

        //#region Charts

        _this.printCharts = function (studyData) {
            _this.instanciateSpeedpometer(studyData, _this.WeekSpeedometerId, _this.ForecastPeriodTimeType.WEEK);
            _this.instanciateSpeedpometer(studyData, _this.MonthSpeedometerId, _this.ForecastPeriodTimeType.MONTH);
            _this.instanciateSpeedpometer(studyData, _this.QuarterSpeedometerId, _this.ForecastPeriodTimeType.QUARTER);
        };

        _this.instanciateSpeedpometer = function (studyData, speedometerId, type) {
            var statics = studyData[type + "Statics"];

            var newSpeedometerId = speedometerId + _this.WidgetId;
            var chartId = newSpeedometerId + "_chart";

            _this.renderChart(speedometerId, newSpeedometerId, chartId, statics, type);

            var initJsonSpeedometer = {
                BullishPercent: statics.BullishPercent,
                BearishPercent: statics.BearishPercent,
                SidewaysPercent: statics.SidewaysPercent,
                Id: chartId
            };

            var forecastSpeedometer = new FXStreetWidgets.Chart.ForecastSpeedometer();
            forecastSpeedometer.init(initJsonSpeedometer);

            _this.Charts.push(forecastSpeedometer);
        };

        _this.renderChart = function (speedometerId, newSpeedometerId, chartId, statics, type) {
            var html = _this.getSpeedometerHtml(chartId, statics, type);

            var speedometer = _this.Container.find("#" + speedometerId);
            if (speedometer) {
                speedometer.attr("id", newSpeedometerId);
                speedometer.html(html);
            }

            var tab = _this.Container.find("a[href*='" + speedometerId + "']");
            if (tab) {
                var href = "#" + newSpeedometerId;
                tab.attr("href", href);
            }
        };

        _this.getSpeedometerHtml = function (chartId, statics, type) {
            var typeLiteral = _this.loaderBase.config.Translations[type];

            var biasClass = "";
            if (statics.Bias !== _this.Sideways) {
                biasClass = "result_" + statics.Bias.toLocaleLowerCase();
            }

            var mustacheJson = {
                ChartId: chartId,
                Type: typeLiteral,
                Statics: statics,
                Translations: _this.loaderBase.config.Translations,
                BiasClass: biasClass
            };

            var html = FXStreetWidgets.Util.renderByHtmlTemplate(_this.loaderBase.config.Mustaches["forecast_speedometer"], mustacheJson);
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