(function () {
    FXStreet.Class.Quote = function () {
        var parent = FXStreet.Class.Base(),
            _this = FXStreet.Util.extendObject(parent);

        _this.ItemUrl = '';
        _this.Url = FXStreet.Resource.FxsApiRoutes["AnalysisItemGetItemByUrl"];
        _this.HtmlTemplate = 'quote.html';

        _this.init = function (json) {
            _this.setSettingsByObject(json);
            _this.setVars();
        };


        _this.generateHtml = function (callbackFunction) {
            _this.callPostApi().done(function (data) {
                _this.htmlRender(data, callbackFunction);
            });
        };

        _this.callPostApi = function () {
            var url = _this.ItemUrl.trim().toLowerCase();
            var i;
            if (url.indexOf("://") > -1) {
                for (i = 0; i < 2; i++) { url = url.substring(url.indexOf("/") + 1, url.length); };
            }
            for (i = 0; i < 2; i++) { url = url.substring(url.indexOf("/") + 1, url.length); };

            var data = {
                "Url": url,
                "Culture": FXStreet.Resource.CultureName
            };

            return $.ajax({
                type: "GET",
                url: _this.Url,
                data: data,
                contentType: "application/json; charset=utf-8",
                dataType: "json"
            });
        };

        _this.htmlRender = function (data, callbackFunction) {
            FXStreet.Util.loadHtmlTemplate(_this.HtmlTemplate).done(function (template) {
                var html = FXStreet.Util.renderByHtmlTemplate(template, data);
                callbackFunction(html);
            });
        };

        return _this;
    };
}());