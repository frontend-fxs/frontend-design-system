(function ($) {

    FXStreetWidgets.Widget.KtlTable = {};
    FXStreetWidgets.Widget.KtlTable.SelectedFilter = {
        Fibonacci: "Fibonacci",
        PivotPoints: "PivotPoints",
        Sma: "Sma",
        HighLows: "CandleSticks",
        BollingerBands: "BollingerBands"
    };

    FXStreetWidgets.Widget.KtlTable.Manager = function (loaderBase) {

        var parent = FXStreetWidgets.Widget.Base(loaderBase),
            _this = FXStreetWidgets.Util.extendObject(parent);

        _this.ContainerId = "";
        _this.WidgetId = "";

        var translations = {};
        var endpointUrl = "";
        var presetAssetFilters = [];

        var filterManager = null;
        var chartObjects = [];

        var activeFilter = "";
        var assetIds = [];

        _this.init = function (json) {
            _this.setSettingsByObject(json);
            setVarsAsync(json);
        };

        _this.setVars = function (json) {
            translations = _this.loaderBase.config.Translations;
            endpointUrl = _this.loaderBase.config.EndPoint;
            presetAssetFilters = JSON.parse(translations.KtlTableFilters).Values;
            assetIds = presetAssetFilters[0].AssetIds;

            renderBase();
            renderFilters();

            renderMockContent();
        };

        _this.renderHtml = function () {
            renderLastUpdated();
            initCharts();
            renderChart();
        };

        var renderBase = function () {
            var jsonData = {
                WidgetId: _this.WidgetId
            };

            var rendered = FXStreetWidgets.Util.renderByHtmlTemplate(
                    _this.loaderBase.config.Mustaches[_this.loaderBase.config.WidgetName],
                     jsonData);
            _this.Container.html(rendered);
        };

        var renderFilters = function () {
            filterManager = new FXStreetWidgets.Widget.KtlTable.FilterManager(loaderBase);
            var filterManagerJson = {
                ContainerId: "ktltablefilters_" + _this.WidgetId,
                WidgetId: _this.WidgetId,
                DefaultFilter: FXStreetWidgets.Widget.KtlTable.SelectedFilter.Fibonacci,
                Translations: translations,
                onDataTypeFilterClickDelegate: onDataTypeFilterClickDelegate,
                onAssetFilterClickDelegate: onAssetFilterClickDelegate
            };
            filterManager.init(filterManagerJson);
            filterManager.render();

            activeFilter = filterManager.getActiveFilter();
        };

        var renderMockContent = function () {
            var mockContent = new FXStreetWidgets.Widget.KtlTable.ContentMock(loaderBase);
            var mockContentJson = {
                WidgetId: _this.WidgetId,
                ContainerId: "ktltablecontent_" + _this.WidgetId,
                Translations: translations
            };
            mockContent.init(mockContentJson);
        };

        var renderLastUpdated = function() {
            var date = _this.data.Values[0].TechnicalData.Fibonacci[0].Date;
            filterManager.setLastUpdated(date);
        };

        var initCharts = function () {
            $.each(FXStreetWidgets.Widget.KtlTable.SelectedFilter, function (i, filter) {
                initChart(filter);
            });
        };

        var initChart = function (dataType) {
            var chartObject = new FXStreetWidgets.Widget.KtlTable.Content(loaderBase);
            var json = {
                ContainerId: "ktltablecontent_" + _this.WidgetId,
                WidgetId: _this.WidgetId,
                FilterApplied: dataType,
                AssetsData: _this.data.Values,
                Translations: translations
            };
            chartObject.init(json);

            chartObjects.push(chartObject);
        };

        var renderChart = function () {
            $.each(chartObjects, function (i, chartObject) {
                if (chartObject.FilterApplied === activeFilter) {
                    chartObject.render(assetIds);
                    return false;
                }
            });
        };

        var setVarsAsync = function (json, iteration) {
            iteration = typeof iteration !== 'undefined' && iteration !== null ? iteration : 0;
            if (iteration >= 10) {
                console.error("FXStreetWidgets: Operation took too long");
            } else if (_this.loaderBase.isReady()) {
                _this.setVars(json);
                onTranslationsReady();
            } else {
                setTimeout(function () {
                    setVarsAsync(json, iteration + 1);
                }, 500);
            }
        };

        var onTranslationsReady = function () {
            var url = getUrl();
            _this.loadDataFromUrl(url);
        };

        var getUrl = function () {
            var assetIds = [];
            $.each(presetAssetFilters, function (i, filter) {
                $.each(filter.AssetIds, function (j, assetId) {
                    if (assetIds.indexOf(assetId) === -1) {
                        assetIds.push(assetId);
                    }
                });
            });

            var uriParameters = "?assetIds=" + assetIds.join();
            var result = endpointUrl + uriParameters;
            return result;
        };

        var onDataTypeFilterClickDelegate = function (dataType) {
            activeFilter = dataType;
            renderChart();
        };

        var onAssetFilterClickDelegate = function (index) {
            assetIds = presetAssetFilters[index].AssetIds;
            renderChart();
        };

        return _this;
    };

    FXStreetWidgets.Widget.KtlTable.ContentMock = function (loaderBase) {
        var parent = FXStreetWidgets.Widget.Base(loaderBase),
            _this = FXStreetWidgets.Util.extendObject(parent);

        _this.WidgetId = "";
        _this.ContainerId = "";
        _this.Translations = {};

        _this.init = function (json) {
            _this.setSettingsByObject(json);
            _this.setVars(json);
            render();
        };

        _this.setVars = function(json) {
            _this.Container = $("#" + _this.ContainerId);
        };

        var render = function () {
            var jsonData = {
                WidgetId: _this.WidgetId,
                Translations: _this.Translations
            };

            var rendered = FXStreetWidgets.Util.renderByHtmlTemplate(
                    _this.loaderBase.config.Mustaches["ktltablecontent_mock"],
                     jsonData);
            
            _this.Container.html(rendered);
        };

        return _this;
    };

    FXStreetWidgets.Widget.KtlTable.Content = function (loaderBase) {
        var parent = FXStreetWidgets.Widget.Base(loaderBase),
            _this = FXStreetWidgets.Util.extendObject(parent);

        _this.ContainerId = "";
        _this.WidgetId = "";
        _this.AssetsData = [];
        _this.FilterApplied = "";
        _this.Translations = null;

        var jsonData = {};

        _this.init = function (json) {
            _this.setSettingsByObject(json);
            _this.setVars(json);
        }

        _this.setVars = function (json) {
            _this.AssetsData = $.map(json.AssetsData,
                function (assetData) {
                    var result = {
                        Asset: assetData.Asset,
                        Data: assetData.TechnicalData[_this.FilterApplied]
                    };
                    return result;
                });

            _this.Container = $("#" + _this.ContainerId);

            initJsonData();
        };

        _this.render = function (assetIds) {
            var jsonRenderData = {
                WidgetId: jsonData.WidgetId,
                Pairs: jsonData.Pairs.filter(function (pair) { return filterPairs(pair.AssetId, assetIds); }),
                Technicals: jsonData.Technicals.map(function (technical) { return mapTechnicals(technical, assetIds); }),
                Translations: _this.Translations
            };

            var rendered = FXStreetWidgets.Util.renderByHtmlTemplate(
                _this.loaderBase.config.Mustaches["ktltablecontent"],
                jsonRenderData);
            _this.Container.html(rendered);
        };

        var filterPairs = function (assetId, assetIds) {
            if (assetIds.indexOf(assetId) > -1) {
                return true;
            }
            return false;
        };

        var mapTechnicals = function (technical, assetIds) {
            var result = {
                TechnicalName: technical.TechnicalName,
                Values: technical.Values.filter(function (value) { return filterPairs(value.AssetId, assetIds); })
            };
            return result;
        };

        var getDataByPeriodType = function (assetData, periodType) {
            var result = null;
            $.each(assetData.Data, function (i, data) {
                if (data.PeriodType === periodType) {
                    result = data;
                    return false;
                }
            });

            return result;
        };

        var initJsonData = function () {
            var pairs = _this.AssetsData.map(function (value) {
                var result = {
                    AssetId: value.Asset.Id,
                    Name: value.Asset.Name,
                    Url: value.Asset.Url
                };
                return result;
            });

            var technicals = [];
            var currentFilterConfig = JSON.parse(_this.Translations.KtlDataTypeFilters)[_this.FilterApplied];
            for (var periodType in currentFilterConfig) {
                if (currentFilterConfig.hasOwnProperty(periodType)) {
                    $.each(currentFilterConfig[periodType], function (i, dataConfig) {
                        var row = {
                            TechnicalName: dataConfig.Translation,
                            Values: []
                        }

                        $.each(_this.AssetsData, function (j, assetData) {
                            var periodTypeData = getDataByPeriodType(assetData, periodType);
                            if (periodTypeData !== null) {
                                var data = periodTypeData[dataConfig.PropertyName];
                                var value = {
                                    Data: data !== null ? data.toFixed(assetData.Asset.DecimalPlaces) : null,
                                    AssetId: assetData.Asset.Id
                                }
                                row.Values.push(value);
                            }
                        });

                        technicals.push(row);
                    });
                }
            }

            jsonData = {
                WidgetId: _this.WidgetId,
                Pairs: pairs,
                Technicals: technicals
            };
        };

        return _this;
    };

    FXStreetWidgets.Widget.KtlTable.FilterManager = function (loaderBase) {

        var parent = FXStreetWidgets.Widget.Base(loaderBase),
            _this = FXStreetWidgets.Util.extendObject(parent);

        _this.ContainerId = "";
        _this.WidgetId = "";
        _this.DefaultFilter = "";
        _this.Translations = {};
        _this.onDataTypeFilterClickDelegate = function (dataType) {
            console.error("Fxswidgets error: Filter delegate is not defined");
        };
        _this.onAssetFilterClickDelegate = function (index) {
            console.error("Fxswidgets error: Filter delegate is not defined");
        };

        var activeFilter = "";
        var dataTypeFilterObjects = {};

        var presetAssetFilters = [];
        var moreAssetsFilterObj = null;
        var assetFilterBox = null;
        var assetFilterCloseButton = null;

        var lastUpdatedLabel = null;

        _this.init = function (json) {
            _this.setSettingsByObject(json);
            _this.setVars(json);
        };

        _this.setVars = function (json) {
            activeFilter = json.DefaultFilter;

            presetAssetFilters = JSON.parse(_this.Translations.KtlTableFilters).Values;

        };

        _this.render = function () {
            var filters = [];
            $.each(FXStreetWidgets.Widget.KtlTable.SelectedFilter, function (i, filter) {
                var filterJson = {
                    Id: filter,
                    Name: _this.Translations[filter],
                    IsActive: filter === activeFilter
                };
                filters.push(filterJson);
            });

            var assetsFilters = [];
            $.each(presetAssetFilters, function (i, presetAssetFilter) {
                var result = {
                    Id: i,
                    Title: presetAssetFilter.Title
                };
                assetsFilters.push(result);
            });

            var jsonData = {
                WidgetId: _this.WidgetId,
                Filters: filters,
                AssetsFilter: assetsFilters,
                Translations: {
                    LastUpdated: _this.Translations.LastUpdated.replace('{0}', new Date()),
                    AssetList: _this.Translations.AssetList
                }
            };
            _this.Container = $("#" + _this.ContainerId);

            var rendered = FXStreetWidgets.Util.renderByHtmlTemplate(
                _this.loaderBase.config.Mustaches["ktltablefilters"],
                jsonData);
            _this.Container.html(rendered);

            lastUpdatedLabel = $("#fxs_ktltable_lastupdated_" + _this.WidgetId);

            addEvents();
        };

        _this.getActiveFilter = function () {
            return activeFilter;
        };

        _this.setLastUpdated = function (date) {
            var lastUpdated = _this.Translations.LastUpdated.replace('{0}', date);
            lastUpdatedLabel.html(lastUpdated);
        };

        var addEvents = function () {
            addDataTypeEvents();
            addAssetFilterEvents();
        };

        var addDataTypeEvents = function () {
            $.each(FXStreetWidgets.Widget.KtlTable.SelectedFilter, function (i, filterName) {
                var filterId = "fxs_ktltable_filter_" + filterName + "_" + _this.WidgetId;
                var filterObj = $("#" + filterId);
                dataTypeFilterObjects[filterName] = filterObj;

                filterObj.on("click", function () { onDataTypeFilterClick(filterName); });
            });
        };

        var onDataTypeFilterClick = function (dataType) {
            $.each(FXStreetWidgets.Widget.KtlTable.SelectedFilter, function (i, filterName) {
                dataTypeFilterObjects[filterName].removeClass("active");

                if (filterName === dataType) {
                    dataTypeFilterObjects[filterName].addClass("active");
                }
            });

            _this.onDataTypeFilterClickDelegate(dataType);
        };

        var addAssetFilterEvents = function () {
            assetFilterBox = $("#fxs_ktltable_assetFilterBox_" + _this.WidgetId);

            assetFilterCloseButton = $("#fxs_ktltable_assetFilterCloseButton_" + _this.WidgetId);
            assetFilterCloseButton.on("click", toggleMoreAssetsMenu);

            moreAssetsFilterObj = $("#fxs_ktltable_assetfilterbutton_" + _this.WidgetId);
            moreAssetsFilterObj.on("click", toggleMoreAssetsMenu);

            $.each(presetAssetFilters, function (i, presetAssetFilter) {
                var result = $("#fxs_ktltable_assetfilter_" + i + "_" + _this.WidgetId);
                result.on("click", function () {
                    _this.onAssetFilterClickDelegate(i);
                    toggleMoreAssetsMenu();
                });
            });

        };

        var toggleMoreAssetsMenu = function () {
            assetFilterBox.toggleClass("fxs_hideElements");
        };

        return _this;
    };

}(FXStreetWidgets.$));