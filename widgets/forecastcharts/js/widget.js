(function ($) {
    FXStreetWidgets.Widget.ForecastChartsManager = function (loaderBase) {
        var parent = FXStreetWidgets.Widget.Base(loaderBase),
            _this = FXStreetWidgets.Util.extendObject(parent);

        _this.Asset = null;
        _this.ClassSize = null;
        _this.WidgetId = "";
        _this.Seo = false;
        _this.ForecastData = null;
        _this.TooltipMustacheName = "";
        _this.jsonData = {};

        var Translations = {};
        var filterButtons = {};
        var activeContainerClass = "";

        var charts = {};

        _this.init = function (json) {
            _this.setSettingsByObject(json);
            _this.setVars();
        };

        _this.setVars = function () {
            var url = getUrl();
            _this.loadDataFromUrl(url);
        };

        _this.renderHtml = function () {
            initJsonData();
            var mustache = _this.loaderBase.config.Mustaches[_this.loaderBase.config.WidgetName];
            var rendered = FXStreetWidgets.Util.renderByHtmlTemplate(mustache, _this.jsonData);
            _this.Container.html(rendered);

            initChartObjects();
            initFilters();
            charts["Overview"].render();
        };

        var getUrl = function () {
            var currentDate = new Date();
            var UTCdateNow = currentDate.toISOString();

            currentDate.setMonth(currentDate.getMonth() - 12);
            var UTCdateFrom = currentDate.toISOString();

            var result = _this.loaderBase.config.EndPoint + "?assetIds=" + _this.Asset + "&dateFrom=" + UTCdateFrom + "&dateTo=" + UTCdateNow;
            return result;
        };

        var initJsonData = function () {
            Translations = _this.loaderBase.config.Translations;

            _this.jsonData = {
                Values: {},
                Filters: {},
                Translations: Translations,
                WidgetId: _this.WidgetId
            };
            setFiltersToJson();
        };

        var initChartObjects = function() {
            var json = {
                Data: _this.data,
                WidgetId: _this.WidgetId,
                ForecastData: _this.ForecastData,
                TooltipTemplate: _this.loaderBase.config.Mustaches[_this.TooltipMustacheName],
                Translations: Translations
            };

            $.each(_this.jsonData.Filters, function (index, filter) {
                var obj = new FXStreetWidgets.Widget.ForecastChart[filter.Selector]();
                obj.init(json);
                charts[filter.Selector] = obj;
            });
        };

        var setFiltersToJson = function () {
            _this.jsonData.Filters =
            [
                {
                    'Title': Translations.Overview,
                    'Selector': 'Overview'
                }, {
                    'Title': Translations.Bias,
                    'Selector': 'Bias'
                }, {
                    'Title': Translations.Averages,
                    'Selector': 'Averages'
                }, {
                    'Title': Translations.ShiftedPrice,
                    'Selector': 'ShiftedPrice'
                }, {
                    'Title': Translations.PriceChange,
                    'Selector': 'PriceChange'
                }, {
                    'Title': Translations.SmoothAverage,
                    'Selector': 'SmoothAverage'
                }, {
                    'Title': Translations.MinimMax,
                    'Selector': 'MinMax'
                }
            ];
        };

        var initFilters = function () {
            $.each(_this.jsonData.Filters,
                function (i, filter) {
                    var selector = "#forecast_charts_filter_{0}_{1}".replace('{0}', filter.Selector).replace('{1}', _this.WidgetId);
                    var filterBtn = _this.Container.find(selector);

                    filterBtn.click(function () {
                        onFilterClick(filter);
                    });

                    if (filter.Selector === 'Overview') {
                        filterBtn.addClass('active');
                        var containerClass = "fxs_forecast_charts_container_" + filter.Selector;
                        _this.Container.addClass(containerClass);
                        activeContainerClass = containerClass;
                    }

                    filterButtons[filter.Selector] = filterBtn;
                });
        };

        var onFilterClick = function (filter) {
            for (var objKey in filterButtons) {
                if (filterButtons.hasOwnProperty(objKey)) {
                    filterButtons[objKey].removeClass('active');
                }
            }
            filterButtons[filter.Selector].addClass('active');

            var containerClass = "fxs_forecast_charts_container_" + filter.Selector;
            _this.Container.removeClass(activeContainerClass);
            _this.Container.addClass(containerClass);
            activeContainerClass = containerClass;

            charts[filter.Selector].render();
        };

        return _this;
    };
}(FXStreetWidgets.$));