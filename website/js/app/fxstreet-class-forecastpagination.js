(function () {
    FXStreet.Class.ForecastPagination = function () {
        var parent = FXStreet.Class.Base(),
             _this = FXStreet.Util.extendObject(parent);

        _this.ContainerId = "";
        _this.PageUrl = "";
        _this.Translations = {};
        _this.Date = null;

        _this.Body = null;
        _this.HtmlTemplateFile = "forecast_pagination.html";
        _this.Container = null;
        _this.ContainerForecastWidget = null;
        _this.ContainerForecastContributorWidget = null;

        _this.init = function (json) {
            _this.setSettingsByObject(json);
            _this.setVars();
            render();
        };

        _this.setVars = function () {
            _this.Body = $('body');
            _this.Container = FXStreet.Util.getjQueryObjectById(_this.ContainerId);
            _this.Date = getDate();
        };

        var render = function () {
            FXStreet.Util.loadHtmlTemplate(_this.HtmlTemplateFile).done(function (template) {
                var rendered = FXStreet.Util.renderByHtmlTemplate(template, { Translations: _this.Translations });
                _this.Container.html(rendered);
                loadHtmlTemplateSuccessComplete();
            });
        };

        var loadHtmlTemplateSuccessComplete = function () {
            _this.Container.find('.fxs_fLeft').on('click', previusWeekClick);
            _this.Container.find('.fxs_fRight').on('click', nextWeekClick);
            _this.ContainerForecastWidget = _this.Body.find("[fxs_name='forecast']");
            _this.ContainerForecastContributorWidget = _this.Body.find("[fxs_name='forecastcontributors']");
        };

        var reloadWidget = function () {           
            var date = getStrDate();

            _this.ContainerForecastWidget.attr('fxs_date', date);
            _this.ContainerForecastContributorWidget.attr('fxs_date', date);

            FXStreetWidgets.Deferred.deferredLoad(_this.Body);
        };

        var previusWeekClick = function () {
            addDaysToDate(-7);
            updateUrl();
            reloadWidget();
        };

        var nextWeekClick = function () {
            addDaysToDate(7);
            updateUrl();
            reloadWidget();
        };

        var addDaysToDate = function (days) {
            _this.Date.setDate(_this.Date.getDate() + days);
        };

        var updateUrl = function () {
            var strDate = getStrDate();
            var informationId = "forecast_" + strDate;
            var url = _this.PageUrl + "?date=" + strDate;

            FXStreet.Util.updateUrl(informationId, document.title, url);
        };

        var getStrDate = function() {
            var result = FXStreet.Util.dateToIsoString(_this.Date) + " " + FXStreet.Util.dateToTimeString(_this.Date);
            return result;
        };

        var getDate = function () {
            var result = new Date();

            var dateQueryString = FXStreet.Util.getQueryStringValue('date');
            if (dateQueryString != null) {
                result = FXStreet.Util.dateStringToDateUTC(dateQueryString.replace('%20', ' '));
            }

            return result;
        };

        return _this;
    };
}());