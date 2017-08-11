(function ($) {
    FXStreetWidgets.Widget.ComparePrices = function (loaderBase) {
        var parent = FXStreetWidgets.Widget.Base(loaderBase),
            _this = FXStreetWidgets.Util.extendObject(parent);
        
        _this.AssetIds = null;
        _this.CurrencyIds = null;
        _this.WidgetId = "";
        _this.Seo = false;

        _this.init = function (json) {
            _this.setSettingsByObject(json);
            var url = this.loaderBase.config.EndPoint + _this.CurrencyIds + "/" + _this.AssetIds;
            _this.loadDataFromUrl(url);
        };
        
        _this.renderHtml = function () {
            var jsonData = {
                Values: _this.getValuesOrderByDesign(_this.data.Values),
                Translations: _this.loaderBase.config.Translations,
                Seo: _this.Seo
            };

            jsonData = _this.setDatesToJson(jsonData, _this.data.Date);

            var rendered = FXStreetWidgets.Util.renderByHtmlTemplate(
                _this.loaderBase.config.Mustaches[_this.loaderBase.config.WidgetName], jsonData);

            _this.Container.html(rendered);
        };

        _this.getValuesOrderByDesign = function (data) {
            var result = [];
            for (var i = 0; i < data.length; i++) {
                var item =
                    {
                        'TabId': 'compare_prices_' + _this.WidgetId + '_' + i,
                        'TabIdClass' : i === 0 ? 'active' : '',
                        'Currency': data[i].Currency,
                        'Date': data[i].Date,
                        'Studies': [] 
                    };
                var studyItem = { 'li' : [] };
                for (var j = 0; j < data[i].Studies.length; j++) {
                    studyItem.li.push(data[i].Studies[j]);

                    if (studyItem.length === 2 || j === (data[i].Studies.length - 1)) {
                        item.Studies.push(studyItem);
                        studyItem = [];
                    }
                }
                result.push(item);
            }
            return result;
        };

        return _this;
    };
}(FXStreetWidgets.$));