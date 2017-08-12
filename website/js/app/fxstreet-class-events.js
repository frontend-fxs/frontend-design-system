(function () {
    FXStreet.Class.EventManager = function () {
        var parent = FXStreet.Class.Base(),
             _this = FXStreet.Util.extendObject(parent);

        // ----- begin json properties -----
        _this.ContainerId = "";
        _this.Take = 0;
        _this.HtmlTemplateFile = "eventList.html";
        _this.Url = "";
        _this.Translations = {};
        // ----- end json properties -----

        _this.Container = null;

        _this.init = function (json) {
            _this.setSettingsByObject(json);
            _this.setVars();
            _this.callEventsApi();
        };

        _this.setVars = function () {
            _this.Container = FXStreet.Util.getjQueryObjectById(_this.ContainerId);
            _this.Url = FXStreet.Resource.FxsApiRoutes["EventsGetItems"];
        };

        _this.callEventsApi = function () {
            var data = { "Take": _this.Take, "CultureName": FXStreet.Resource.CultureName };
            $.ajax({
                type: "GET",
                url: _this.Url,
                data: data,
                contentType: "application/json; charset=utf-8",
                dataType: "json"
            }).done(_this.searchSuccess);
        };

        _this.searchSuccess = function (events) {
            var jsonData = 
                {
                    Value: events,
                    Translations: _this.Translations
                };

            FXStreet.Util.loadHtmlTemplate(_this.HtmlTemplateFile).done(function (template) {
                var rendered = FXStreet.Util.renderByHtmlTemplate(template, jsonData);
                _this.Container.html(rendered);
                _this.loadHtmlTemplateSuccessComplete();
            });
        };

        _this.loadHtmlTemplateSuccessComplete = function () {};
        return _this;

    };
}());