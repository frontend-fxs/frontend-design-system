(function ($) {
    FXStreetWidgets.Widget.Bpi = function (loaderBase) {
        var parent = FXStreetWidgets.Widget.Base(loaderBase),
            _this = FXStreetWidgets.Util.extendObject(parent);

        _this.Container = null;
        _this.Currencies = "";
        _this.WidgetId = null;
        _this.Seo = false;
        _this.MustacheKey = "";
        _this.HideFullReport = false;
        _this.FullReportUrl = "";

        _this.init = function (json) {
            _this.setSettingsByObject(json);
            _this.setVars();
            _this.loadDataFromUrl(_this.loaderBase.config.EndPoint + _this.Currencies);
        };

        _this.setVars = function () {
            _this.WidgetId = 'bpi_' + FXStreetWidgets.Util.guid();
            _this.Container.attr('id', _this.WidgetId);
        };

        _this.PercentageArrowCssClasess = {
            Positive: "fxs_index_up",
            Negative: "fxs_index_down",
            Neutral: "fxs_index_neutral"
        };

        _this.renderHtml = function () {
            var studies = _this.data.Values;
            $.each(studies, function (index, value) {

                value.LatestStudy.Date.Format = value.OldestStudy.Date.Format = "MMM D";

                value.LatestStudy = _this.setDatesToJson(value.LatestStudy, value.LatestStudy.Date);
                value.OldestStudy = _this.setDatesToJson(value.OldestStudy, value.OldestStudy.Date);

                var latestPercentage = value.LatestStudy.Percentage;
                var oldestPercentage = value.OldestStudy.Percentage;

                value.PercentageArrowCssClasess = "";

                if (oldestPercentage < latestPercentage) {
                    value.PercentageArrowCssClasess = _this.PercentageArrowCssClasess["Positive"];
                } else if (oldestPercentage > latestPercentage) {
                    value.PercentageArrowCssClasess = _this.PercentageArrowCssClasess["Negative"];
                } else {
                    value.PercentageArrowCssClasess = _this.PercentageArrowCssClasess["Neutral"];
                }

            });

            var jsonData = {
                Studies: studies,
                Translations: _this.loaderBase.config.Translations,
                Seo: _this.Seo,
                WidgetId: _this.WidgetId
            };

            jsonData = _this.setDatesToJson(jsonData, _this.data.Date);

            var rendered = FXStreetWidgets.Util.renderByHtmlTemplate(_this.loaderBase.config.Mustaches[_this.loaderBase.config.WidgetName], jsonData);
            _this.Container.html(rendered);
        };
        return _this;
    };
}(FXStreetWidgets.$));