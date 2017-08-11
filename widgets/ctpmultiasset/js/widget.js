(function ($) {
    FXStreetWidgets.Widget.CtpMultiAsset = function (loaderBase) {
        var parent = FXStreetWidgets.Widget.Base(loaderBase),
            _this = FXStreetWidgets.Util.extendObject(parent);
        
        _this.AssetIds = null;
        _this.ClassSize = null;
        _this.FullReportUrl = "";
        _this.FullStudyUrl = "";
        _this.WidgetId = "";
        _this.HideFullReport = false;
        _this.Seo = false;

        _this.BarsId = "ctp_bar_stacked_1";

        _this.init = function (json) {
            _this.setSettingsByObject(json);
            var url = this.loaderBase.config.EndPoint + "?assetids=" + _this.AssetIds;
            _this.loadDataFromUrl(url);
        };
        
        _this.renderHtml = function () {
            _this.filterData();

            if (_this.data.Values === null || _this.data.Values.length === 0) {
                return;
            }

            _this.data.Values.forEach(function (i) {
                formatPrices(i, i.Asset.DecimalPlaces);
            });

            var jsonData = {
                Studies: _this.data.Values,
                Translations: _this.loaderBase.config.Translations,
                FullStudyUrl: _this.FullStudyUrl,
                Seo: _this.Seo
            };

            jsonData = _this.setDatesToJson(jsonData, _this.data.Values[0].Date);
           
            var rendered = FXStreetWidgets.Util.renderByHtmlTemplate(_this.loaderBase.config.Mustaches[_this.loaderBase.config.WidgetName], jsonData);

            _this.Container.html(rendered);

            _this.manageRenderedHtml();
            _this.printCharts();
        };

        _this.filterData = function () {            
            _this.data.Values = $.grep(_this.data.Values, function (study) {
                if (study.SellStatics === null || study.BuyStatics === null) {
                    return false;
                }

                if (study.SellStatics.TotalQuantity === 0) {
                    study.SellStatics.AveragePrice = "N/A";
                }
                if (study.BuyStatics.TotalQuantity === 0) {
                    study.BuyStatics.AveragePrice = "N/A";
                }

                study.FullReportUrl = _this.FullReportUrl.replace('{{asset}}', study.Asset.Url).toLowerCase();

                return study.SellStatics.TotalQuantity > 0 || study.BuyStatics.TotalQuantity > 0;
            });
        };

        _this.manageRenderedHtml = function () {
            _this.addSizeClass();
            _this.handleFullReport();
        };

        _this.addSizeClass = function () {
            if (_this.ClassSize) {
                _this.Container.find(".fxs_ctp_widget_multi").addClass(_this.ClassSize);
            }
        };

        _this.handleFullReport = function () {
            if (_this.HideFullReport) {
                _this.Container.find('.fxs_btn.fxs_btn_line.fxs_btn_small').remove();
            }
        };

        //#region Charts

        _this.printCharts = function () {
            $.each(_this.Container.find(".fxs_ctp_widget_multi"), function (i, elem) {
                _this.instanciateBars($(elem), i);
            });
        };

        _this.instanciateBars = function (chartContainer, position) {
            var newBarsId = _this.BarsId + _this.WidgetId;

            var bars = chartContainer.find("#" + _this.BarsId);
            if (bars) {
                newBarsId = newBarsId + position;
                bars.attr("id", newBarsId);
            }

            var initJsonBars = {
                SellStaticsPercent: this.data.Values[position].SellStatics.Percent,
                BuyStaticsPercent: this.data.Values[position].BuyStatics.Percent,
                Id: newBarsId,
                Translations: _this.loaderBase.config.Translations
            };

            var ctpBars = new FXStreetWidgets.Chart.CtpMultiAssetBars();
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