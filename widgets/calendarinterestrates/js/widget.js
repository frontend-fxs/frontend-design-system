(function ($) {
    FXStreetWidgets.Widget.CalendarInterestRates = function (loaderBase) {
        var parent = FXStreetWidgets.Widget.Base(loaderBase),
            _this = FXStreetWidgets.Util.extendObject(parent);

        _this.WidgetId = "";
        _this.ClassSize = "";
        _this.ButtonUrl = "";
        _this.Seo = false;

        _this.init = function (json) {
            _this.setSettingsByObject(json);
            var url = _this.loaderBase.getHost() + "interest-rates/central-banks";
            _this.loadDataFromUrl(url);
        };

        _this.jsonDataIsValid = function (data) {
            var result = FXStreetWidgets.Util.isValid(data);
            return result;
        };

        _this.renderHtml = function () {
            $.each(_this.data, function(index, value) {
                if (value.NextMeeting) {
                    value.NextMeeting = FXStreetWidgets.Util.formatDate(value.NextMeeting, "MMM D HH:mm");
                }
                if (value.NextMeeting) {
                    value.LastMeeting = FXStreetWidgets.Util.formatDate(value.LastMeeting, "MMM D, YYYY");
                }
            });

            var jsonData = {
                InterestRates: _this.data,
                Translations: _this.loaderBase.config.Translations,
                Seo: _this.Seo,
                ButtonUrl: _this.ButtonUrl ? _this.ButtonUrl : "#"
            };
            var rendered = FXStreetWidgets.Util.renderByHtmlTemplate(_this.loaderBase.config.Mustaches[_this.loaderBase.config.WidgetName], jsonData);
            _this.Container.html(rendered);

            _this.manageRenderedHtml();
        };

        _this.manageRenderedHtml = function () {
            _this.addSizeClass();
        };

        _this.addSizeClass = function () {
            if (_this.ClassSize) {
                _this.Container.find('.fxs_swipeContent_slider').addClass(_this.ClassSize);
            }
        };

        return _this;
    };
}(FXStreetWidgets.$));