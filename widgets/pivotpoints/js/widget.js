(function ($) {
    FXStreetWidgets.Widget.PivotPoints = function (loaderBase) {
        var parent = FXStreetWidgets.Widget.Base(loaderBase),
            _this = FXStreetWidgets.Util.extendObject(parent);

        _this.AssetId = null;
        _this.ClassSize = null;
        _this.HideFullReport = null;
        _this.FullReportUrl = null;

        _this.init = function (json) {
            _this.setSettingsByObject(json);
            var url = this.loaderBase.config.EndPoint + _this.AssetId;
            _this.loadDataFromUrl(url);
        };

        _this.renderHtml = function () {
            var pivotpoints = _this.data.Values[0];

            var jsonData = {
                Value: pivotpoints,
                Translations: _this.loaderBase.config.Translations,
                FullReportUrl: _this.FullReportUrl
            };

            jsonData = _this.setDatesToJson(jsonData, pivotpoints.Date);

            var rendered = FXStreetWidgets.Util.renderByHtmlTemplate(_this.loaderBase.config.Mustaches[_this.loaderBase.config.WidgetName], jsonData);
            _this.Container.html(rendered);

            _this.manageRenderedHtml();
        };

        _this.manageRenderedHtml = function () {
            _this.addSizeClass();
            _this.handleFullReport();
        };

        _this.addSizeClass = function () {
            if (_this.ClassSize) {
                _this.Container.find('.fxs_widget_pivotPoints').addClass(_this.ClassSize);
            }
        };

        _this.handleFullReport = function () {
            if (_this.HideFullReport) {
                _this.Container.find('.fxs_btn.fxs_btn_line.fxs_btn_small').remove();
            }
        };

        return _this;
    };
}(FXStreetWidgets.$));