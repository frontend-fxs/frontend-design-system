(function ($) {
    FXStreetWidgets.Widget.LastCandle = function (loaderBase) {
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

        _this.jsonDataIsValid = function (data) {
            var result = FXStreetWidgets.Util.isValid(data);
            return result;
        };

        _this.renderHtml = function () {
            var jsonData = {
                Value: _this.data,
                Translations: _this.loaderBase.config.Translations
            };

            var rendered = FXStreetWidgets.Util.renderByHtmlTemplate(_this.loaderBase.config.Mustaches[_this.loaderBase.config.WidgetName], jsonData);
            _this.Container.html(rendered);
        };

        return _this;
    };
}(FXStreetWidgets.$));