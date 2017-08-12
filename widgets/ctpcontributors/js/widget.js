(function ($) {
    FXStreetWidgets.Widget.CtpContributors = function (loaderBase) {
        var parent = FXStreetWidgets.Widget.Base(loaderBase),
            _this = FXStreetWidgets.Util.extendObject(parent);

        _this.AssetId = null;

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
            var study = _this.data.Values[0];
            formatPrices(study, study.Asset.DecimalPlaces);

            var entries = study.Entries;

            $.each(entries, function (i, entry) {
                if (entry.OrderDirection === "SELL" || entry.OrderDirection === "SHORT") {
                    entry["OrderDirectionClass"] = "fxs_txt_danger";
                } else {
                    entry["OrderDirectionClass"] = "fxs_txt_success";
                }

                var orderDirectionKey = entry.OrderDirection;
                if (orderDirectionKey === "BUY") {
                    orderDirectionKey = "Buy";
                }
                else if (orderDirectionKey === "SELL") {
                    orderDirectionKey = "Sell";
                }

                entry["OrderDirectionDescription"] = _this.loaderBase.config.Translations[orderDirectionKey];
                entry["OrderTypeDescription"] = _this.loaderBase.config.Translations[entry.OrderType];
                entry.StartingDatePretty = FXStreetWidgets.Util.formatDate(entry.StartingDate, 'MMM D');
            });

            var jsonData = {
                Entries: entries,
                Asset: entries[0].Asset,
                Translations: _this.loaderBase.config.Translations
            };

            jsonData = _this.setDatesToJson(jsonData, study.Date);

            var rendered = FXStreetWidgets.Util.renderByHtmlTemplate(_this.loaderBase.config.Mustaches[_this.loaderBase.config.WidgetName], jsonData);
            _this.Container.html(rendered);
        };

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

            data.BuyStatics.AveragePrice = data.BuyStatics.AveragePrice.toFixed(decimalPlaces);
            data.SellStatics.AveragePrice = data.SellStatics.AveragePrice.toFixed(decimalPlaces);
        }

        return _this;
    };
}(FXStreetWidgets.$));