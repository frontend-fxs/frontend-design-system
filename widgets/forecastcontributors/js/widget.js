(function ($) {
    FXStreetWidgets.Widget.ForecastContributors = function (loaderBase) {
        var parent = FXStreetWidgets.Widget.Base(loaderBase),
            _this = FXStreetWidgets.Util.extendObject(parent);

        _this.Asset = null;
        _this.Date = null;
        _this.FullReportUrl = "";
        _this.AllowComments = false;

        _this.Bullish = "Bullish";
        _this.Bearish = "Bearish";
        _this.Sideways = "Sideways";

        _this.init = function (json) {
            _this.setSettingsByObject(json);
            var url = this.loaderBase.config.EndPoint + "?assetids=" + _this.Asset;

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
            var entries = _this.data.Values[0].Entries;
            var decimalPlaces = _this.data.Values[0].Asset.DecimalPlaces;

            $.each(entries, function (index, entry) {
                entry.WeekTypeClass = _this.getTypeClass(entry.WeekType);
                entry.MonthTypeClass = _this.getTypeClass(entry.MonthType);
                entry.QuarterTypeClass = _this.getTypeClass(entry.QuarterType);

                if (entry.WeekValue == null) {
                    entry.WeekType = "";
                }
                if (entry.MonthValue == null) {
                    entry.MonthType = "";
                }
                if (entry.QuarterValue == null) {
                    entry.QuarterType = "";
                }

                if (entry.Comment && _this.AllowComments) {
                    entry.HasComment = true;
                }

                entry.WeekTypeDisplay = _this.getTypeDisplay(entry.WeekType);
                entry.MonthTypeDisplay = _this.getTypeDisplay(entry.MonthType);
                entry.QuarterTypeDisplay = _this.getTypeDisplay(entry.QuarterType);

                if (entry.WeekValue) {
                    entry.WeekValue = entry.WeekValue.toFixed(decimalPlaces);
                }
                if (entry.MonthValue) {
                    entry.MonthValue = entry.MonthValue.toFixed(decimalPlaces);
                }
                if (entry.QuarterValue) {
                    entry.QuarterValue = entry.QuarterValue.toFixed(decimalPlaces);
                }

                entry = _this.setDatesToJson(entry, entry.Date);
            });

            var jsonData = {
                Entries: entries,
                Translations: _this.loaderBase.config.Translations,
                FullReportUrl: _this.FullReportUrl
            };

            var rendered = FXStreetWidgets.Util.renderByHtmlTemplate(_this.loaderBase.config.Mustaches[_this.loaderBase.config.WidgetName], jsonData);
            _this.Container.html(rendered);

            _this.manageRenderedHtml();
        };

        _this.getTypeClass = function (value) {
            var typeClass = "";
            if (value === _this.Bullish) {
                typeClass = "fxs_txt_success";
            }
            else if (value === _this.Bearish) {
                typeClass = "fxs_txt_danger";
            } else {
                typeClass = "fxs_txt_neutral";
            }
            return typeClass;
        };

        _this.getTypeDisplay = function (value) {
            var result = value;
            if (value !== "") {
                result = _this.loaderBase.config.Translations[value];
            }
            return result;
        };

        _this.manageRenderedHtml = function () {
            $('[data-toggle="tooltip"]').tooltip();
        };

        return _this;
    };
}(FXStreetWidgets.$));