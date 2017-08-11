(function ($) {
    FXStreetWidgets.Widget.CalendarEvent = function (loaderBase) {
        var parent = FXStreetWidgets.Widget.Base(loaderBase),
            _this = FXStreetWidgets.Util.extendObject(parent);

        _this.EventId = "";
        _this.WidgetId = "";
        _this.ClassSize = "";       
        _this.Seo = false;

        _this.init = function (json) {
            _this.setSettingsByObject(json);
            var url = _this.loaderBase.getHost() + "event/" + _this.EventId + "?culture=" + FXStreetWidgets.Configuration.getCulture() + "&v=2";
            _this.loadDataFromUrl(url);
        };

        _this.jsonDataIsValid = function (data) {
            var result = FXStreetWidgets.Util.isValid(data);
            return result;
        };

        _this.renderHtml = function () {
            _this.data.LastEventDateDateDisplay = FXStreetWidgets.Util.formatDate(_this.data.LastEventDateDate);
            _this.data.NextEventDateDateDisplay = FXStreetWidgets.Util.formatDate(_this.data.NextEventDateDate);

            var jsonData = {
                Event: _this.data,
                ModerateUrl: _this.ModerateUrl,
                Translations: _this.loaderBase.config.Translations,
                Seo: _this.Seo,
                CultureName: FXStreetWidgets.Configuration.getCulture(),
                NextEventDateDateNotNull: _this.data.NextEventDateDate !== null
            };
            var rendered = FXStreetWidgets.Util.renderByHtmlTemplate(_this.loaderBase.config.Mustaches[_this.loaderBase.config.WidgetName], jsonData);
            _this.Container.html(rendered);

            _this.manageRenderedHtml();
        };

        _this.manageRenderedHtml = function () {
            _this.handleCountDown();
            _this.addSizeClass();         
        };

        _this.addSizeClass = function () {
            if (_this.ClassSize) {
                _this.Container.find('.fxs_widget_event').addClass(_this.ClassSize);
            }
        };

        _this.handleCountDown = function () {
            if (!FXStreetWidgets.Util.isValid(_this.data) || !FXStreetWidgets.Util.isValid(_this.data.NextEventDateDate)) {
                return;
            }

            var startTime = new Date(_this.data.NextEventDateDate);
                        
            var daysDisplay = _this.loaderBase.config.Translations["Days"].toLowerCase();
            var hoursDisplay = _this.loaderBase.config.Translations["Hours"].toLowerCase();
            var minDisplay = _this.loaderBase.config.Translations["Min"].toLowerCase();
            var secDisplay = _this.loaderBase.config.Translations["Sec"].toLowerCase();

            var updateCountdownDisplay = 
                    _this.createSpan('%D :', daysDisplay)
                    + _this.createSpan('%H :', hoursDisplay)
                    + _this.createSpan('%M :', minDisplay)
                    + _this.createSpan('%S', secDisplay);

            var finishCountdownDisplay = 
                    _this.createSpan('00 :', daysDisplay)
                    + _this.createSpan('00 :', hoursDisplay)
                    + _this.createSpan('00 :', minDisplay)
                    + _this.createSpan('00', secDisplay);

            _this.Container.find('#clock_3').countdown(startTime)
                .on('update.countdown', function (event) {
                    var $this = $(this).html(event.strftime(updateCountdownDisplay));
                })
                .on('finish.countdown', function (event) {
                    $(this).html(finishCountdownDisplay)
                    // .parent().addClass('disabled');
                    .closest('.fxs_live_event_module').addClass("on_air");
                });
        };

        _this.createSpan = function (symbol, value) {
            return '<span><span class="fxs_widget_custom_data_lable">' + symbol + '</span>' + value + '</span>';
        };

        return _this;
    };
}(FXStreetWidgets.$));