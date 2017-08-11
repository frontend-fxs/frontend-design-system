(function ($) {
    FXStreetWidgets.Widget.CtpLatest = function (loaderBase) {
        var parent = FXStreetWidgets.Widget.Base(loaderBase),
            _this = FXStreetWidgets.Util.extendObject(parent);

        _this.Take = "";
        _this.FullReportUrl = "";
        _this.FullStudyUrl = "";
        _this.HideFullReport = false;
        _this.Seo = false;

        _this.init = function (json) {
            _this.setSettingsByObject(json);
            var url = this.loaderBase.config.EndPoint + "?take=" + _this.Take;
            _this.loadDataFromUrl(url);
        };

        _this.renderHtml = function () {
            var entries = _this.data.Values;

            $.each(entries, function (i, entry) {
                entry.FullReportUrl = _this.FullReportUrl.replace('{{asset}}', entry.Asset.Url).toLowerCase();

                if (entry.Entry.OrderDirection === "SELL" || entry.Entry.OrderDirection === "SHORT") {
                    entry.Entry["OrderDirectionClass"] = "fxs_txt_danger";
                } else {
                    entry.Entry["OrderDirectionClass"] = "fxs_txt_success";
                }

                formatPrices(entry.Entry, entry.Asset.DecimalPlaces);
            });

            var jsonData = {
                Entries: entries,
                Translations: _this.loaderBase.config.Translations,
                FullStudyUrl: _this.FullStudyUrl,
                Seo: _this.Seo
            };

            jsonData = _this.setDatesToJson(jsonData, entries[0].Date);

            var rendered = FXStreetWidgets.Util.renderByHtmlTemplate(_this.loaderBase.config.Mustaches[_this.loaderBase.config.WidgetName], jsonData);

            _this.Container.html(rendered);

            _this.manageRenderedHtml();
        };

        _this.manageRenderedHtml = function () {
            _this.handleFullReport();
        };

        _this.handleFullReport = function () {
            if (_this.HideFullReport) {
                _this.Container.find('.fxs_btn.fxs_btn_line.fxs_btn_small').remove();
            }
        };

        var formatPrices = function (data, decimalPlaces) {
            if (data.Entry) {
                data.Entry = data.Entry.toFixed(decimalPlaces);
            }
            if (data.StopLoss) {
                data.StopLoss = data.StopLoss.toFixed(decimalPlaces);
            }
            if (data.TakeProfit1) {
                data.TakeProfit1 = data.TakeProfit1.toFixed(decimalPlaces);
            }
            if (data.TakeProfit2) {
                data.TakeProfit2 = data.TakeProfit2.toFixed(decimalPlaces);
            }
            if (data.TakeProfit3) {
                data.TakeProfit3 = data.TakeProfit3.toFixed(decimalPlaces);
            }
        }

        return _this;
    };
}(FXStreetWidgets.$));