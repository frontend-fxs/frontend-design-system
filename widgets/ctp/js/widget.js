(function ($) {
    FXStreetWidgets.Widget.Ctp = function (loaderBase) {
        var parent = FXStreetWidgets.Widget.Base(loaderBase),
            _this = FXStreetWidgets.Util.extendObject(parent);

        _this.AssetId = "";
        _this.ClassSize = "";
        _this.HideFullReport = "";
        _this.FullReportUrl = "";
        _this.WidgetId = null;
        _this.Seo = false;

        _this.ChartSpeedometerId = "gauge_chart";
        _this.ChartBarsId = "orders_chart";

        _this.init = function (json) {
            _this.setSettingsByObject(json);
            var url = this.loaderBase.config.EndPoint + "?assetids=" + _this.AssetId;
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
        };

        _this.addSizeClass = function () {
            if (_this.ClassSize) {
                _this.Container.find('.fxs_ctp_widget').addClass(_this.ClassSize);
            }
        };

        _this.handleFullReport = function () {
            if (_this.HideFullReport) {
                _this.Container.find('.fxs_btn.fxs_btn_line.fxs_btn_small').remove();
            }
        };

        //#region Charts

        _this.printCharts = function (studyData) {
            _this.instanciateSpeedpometer(studyData);
            _this.instanciateBars(studyData);
        };

        _this.instanciateSpeedpometer = function (studyData) {
            var newSpeedometerId = _this.ChartSpeedometerId + _this.WidgetId;

            var speedometer = _this.Container.find("#" + _this.ChartSpeedometerId);
            if (speedometer) {
                speedometer.attr("id", newSpeedometerId);
            }

            var initJsonSpeedometer = {
                SellStaticsPercent: studyData.SellStatics.Percent,
                Id: newSpeedometerId
            };

            var ctpSpeedometer = new FXStreetWidgets.Chart.CtpSpeedometer();
            ctpSpeedometer.init(initJsonSpeedometer);
        };

        _this.instanciateBars = function (studyData) {
            var newBarsId = _this.ChartBarsId + _this.WidgetId;

            var bars = _this.Container.find("#" + _this.ChartBarsId);
            if (bars) {
                bars.attr("id", newBarsId);
            }

            var initJsonBars = {
                Id: newBarsId,
                Signals: studyData.Entries,
                Translations: _this.loaderBase.config.Translations
            };

            var ctpBars = new FXStreetWidgets.Chart.CtpBars();
            ctpBars.init(initJsonBars);
        };

        //#endregion Charts

        var formatPrices = function (data, decimalPlaces) {
            data.Entries.forEach(function (e) {
                if (e.Entry) {
                    e.Entry = e.Entry.toFixed(decimalPlaces);
                }
                if (e.StopLoss) {
                    e.StopLoss = e.StopLoss.toFixed(decimalPlaces);
                }
                if (e.TakeProfit1) {
                    e.TakeProfit1 = e.TakeProfit1.toFixed(decimalPlaces);
                }
                if (e.TakeProfit2) {
                    e.TakeProfit2 = e.TakeProfit2.toFixed(decimalPlaces);
                }
                if (e.TakeProfit3) {
                    e.TakeProfit3 = e.TakeProfit3.toFixed(decimalPlaces);
                }
            });

            data.BuyStatics.AveragePrice = $.isNumeric(data.BuyStatics.AveragePrice) ? data.BuyStatics.AveragePrice.toFixed(decimalPlaces) : data.BuyStatics.AveragePrice;
            data.SellStatics.AveragePrice = $.isNumeric(data.SellStatics.AveragePrice) ? data.SellStatics.AveragePrice.toFixed(decimalPlaces) : data.SellStatics.AveragePrice;
        }

        return _this;
    };
}(FXStreetWidgets.$));