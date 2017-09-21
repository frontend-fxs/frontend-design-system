(function($) {
    FXStreetWidgets.Widget.ForecastChart.Overview = function () {
        var parent = FXStreetWidgets.Widget.ForecastChart.Base(),
            _this = FXStreetWidgets.Util.extendObject(parent);

        _this.ForecastData = null;
        _this.TooltipTemplate = "";

        var forecastStudies = null;

        _this.init = function (json) {
            _this.setSettingsByObject(json);
            parent.init(json);
        };

        parent.initJsonC3 = function () {
            setLocalVariables();
            var values = getColumnValues();
            var json = buildOverviewJson(values);
            _this.JsonC3['WeekStatics'] = json;
        };

        var setLocalVariables = function () {
            forecastStudies = getForecastEntries();
        };

        var getColumnValues = function () {
            var configTimeseries = [];
            var configColumns = [];

            var scatterColumns = getScatterColumns(forecastStudies);
            var lastDate = _this.Data.Values[0].Date;
            var firstDate = _this.Data.Values[_this.Data.Values.length - 1].Date;

            var closePriceConfig = {
                RowTitle: "ClosePrice_Row",
                PropertyName: "ClosePrice"
            };
            configColumns.push(closePriceConfig);

            $.each(_this.ForecastPeriodType, function (key, periodType) {
                var offset = _this.getOffsetByForecastPeriodType(periodType.Statics);
                var shiftedValues = _this.getValuesWithTimeOffset(_this.Data.Values, offset, true, moment(firstDate).add(12, 'weeks').format());

                configTimeseries.push({ AxisName: key + '_x', Values: shiftedValues });

                var entries = scatterColumns[periodType.Order];
                var transformedValues = entries.map(function () {
                    var value = {
                        Date: moment(lastDate).add(offset, 'weeks').format()
                    };
                    return value;
                });
                configTimeseries.push({ AxisName: key + '_scatter_x', Values: transformedValues });

                var averagePerPeriodConfig = {
                    Values: shiftedValues,
                    RowTitle: key + "_Average_Row",
                    PropertyName: "PriceAverage",
                    ForecastType: periodType.Statics
                };
                configColumns.push(averagePerPeriodConfig);
            });

            var xValues = _this.getValuesWithTimeOffset(_this.Data.Values, 0, true, moment(firstDate).add(12, 'weeks').format());
            configTimeseries.push({ AxisName: 'x', Values: xValues });

            var timeseries = _this.getMultipleTimeseries(configTimeseries);
            var columns = _this.getColumns(configColumns, false);

            var result = timeseries.concat(columns).concat(scatterColumns);
            return result;
        };

        var buildOverviewJson = function (values) {
            var cssClass = '#fxs_forecast_charts_overview_' + _this.WidgetId;
            var cssClassGraph = 'fxs_overview';
            var assetDecimals = _this.getAssetDecimalPlaces();

            var result = new FXStreetWidgets.ForecastChartC3JsonBuilder()
                .addDataColumnConfig({
                    name: "week_Average_Row",
                    axes: "y2",
                    xs: 'week_x',
                    names: '1 Week',
                    colors: "#04aab2",
                    classes: cssClassGraph + "_week"
                })
                .addDataColumnConfig({
                    name: "month_Average_Row",
                    axes: "y2",
                    xs: 'month_x',
                    names: '1 Month',
                    colors: "#304c70",
                    classes: cssClassGraph + "_month"
                })
                .addDataColumnConfig({
                    name: "quarter_Average_Row",
                    axes: "y2",
                    xs: 'quarter_x',
                    names: '3 Months',
                    colors: "#e4871b",
                    classes: cssClassGraph + "_quarter"
                })
                .addDataColumnConfig({
                    name: "week_Scatter_Row",
                    axes: "y2",
                    xs: "week_scatter_x",
                    names: "Last Week Forecast",
                    colors: "#04aab2",
                    classes: cssClassGraph + "_week_scatter",
                    types: "scatter",
                    hideLegend: true
                })
                .addDataColumnConfig({
                    name: "month_Scatter_Row",
                    axes: "y2",
                    xs: "month_scatter_x",
                    names: "Last Month Forecast",
                    colors: "#304c70",
                    classes: cssClassGraph + "_week_scatter",
                    types: "scatter",
                    hideLegend: true
                })
                .addDataColumnConfig({
                    name: "quarter_Scatter_Row",
                    axes: "y2",
                    xs: "quarter_scatter_x",
                    names: "Last Quarter Forecast",
                    colors: "#e4871b",
                    classes: cssClassGraph + "_week_scatter",
                    types: "scatter",
                    hideLegend: true
                })
                .addDataColumnConfig({
                    name: "ClosePrice_Row",
                    axes: "y2",
                    names: _this.Translations.ClosePrice,
                    colors: "#1b1c23",
                    classes: cssClassGraph + "_closeprice"
                })
                .withRadiusDelegate(scatterPointRadiusDelegate)
                .withTooltipContentsDelegate(tooltipContentsDelegate)
                .withTooltipGrouped(false)
                .withRightPadding(100)
                .build(values, cssClass, assetDecimals);
            return result;
        };

        var scatterPointRadiusDelegate = function (d) {
            if (d.id.indexOf('Scatter') === -1) { return 1; }

            var column = getColumnByName(forecastStudies, d.id);
            var rangeValue = column[d.index + 1];

            return rangeValue.TotalEntries * 3;
        };

        var tooltipContentsDelegate = function (d, defaultTitleFormat, defaultValueFormat, color) {
            var decimals = _this.getAssetDecimalPlaces();
            var decimalsFormat = ",.{0}f".replace("{0}", decimals);
            defaultValueFormat = d3.format(decimalsFormat);
            for (var i = 0; i < d.length; i++) {
                if (d[i].id.indexOf('Scatter') === -1) {
                    return this.getTooltipContent(d, defaultTitleFormat, defaultValueFormat, color);
                } else {
                    var column = getColumnByName(forecastStudies, d[i].id);
                    var forecastValue = column[d[i].index + 1];
                    var sentiment = forecastValue.SentimentType;
                    var totalAnalysts = forecastValue.TotalEntries;
                    var tooltipValue = forecastValue.TooltipValue || d[i].value;

                    var jsonData = {
                        Translations: _this.Translations,
                        Value: defaultValueFormat(tooltipValue),
                        Sentiment: sentiment,
                        TotalAnalysts: totalAnalysts
                    };
                    var rendered = FXStreetWidgets.Util.renderByHtmlTemplate(_this.TooltipTemplate, jsonData);
                    return rendered;
                }
            }
            return null;
        };

        var getColumnByName = function (columns, name) {
            for (var i = 0; i < columns.length; i++) {
                var column = columns[i];
                var columnName = column[0];
                if (typeof columnName === 'string') {
                    if (columnName === name) {
                        return column;
                    }
                }
            }
            return null;
        };

        var getForecastEntries = function () {
            var columnsResult = [];
            $.each(_this.ForecastPeriodType, function (key, periodType) {
                var column = [];
                var ranges = getScatterRanges(periodType);
                column.push(key + '_Scatter_Row');
                $.each(_this.ForecastData.Entries, function (index, entry) {
                    if (entry[periodType.Value]) {
                        var periodEntry = {
                            SentimentType: entry[periodType.Type],
                            Value: entry[periodType.Value]
                        };
                        column.push(periodEntry);
                    }
                });

                var mappedColumn = mapForecastEntriesInScatterRanges(column, ranges);
                columnsResult.push(mappedColumn);
            });
            return columnsResult;
        };

        var mapForecastEntriesInScatterRanges = function (column, ranges) {
            var result = [];
            result.push(column[0]);
            $.each(ranges, function (index, range) {
                var values = $.grep(column, function (forecastPeriodEntry) {
                    if (index < ranges.length - 1) {
                        return forecastPeriodEntry.Value >= ranges[index] && forecastPeriodEntry.Value < ranges[index + 1];
                    }

                    return forecastPeriodEntry.Value >= ranges[index];
                });

                if (values.length > 0) {
                    var forecastRangeEntry = {
                        Value: ranges[index],
                        TooltipValue: (index < ranges.length - 1) ? ((ranges[index + 1] - ranges[index]) / 2) + ranges[index] : ranges[index],
                        TotalEntries: values.length,
                        SentimentType: values[0].SentimentType
                    };
                    result.push(forecastRangeEntry);
                }
            });

            return result;

        };

        var getScatterRanges = function (periodType) {
            var forecastEntryValuesWithNulls = _this.ForecastData.Entries
                .map(function (entry) { return entry[periodType.Value]; });

            var forecastEntryValues = $.grep(forecastEntryValuesWithNulls, function (value) { return value !== null });

            var lastValuesByPeriod = _this.Data.Values[0][periodType.Statics];
            var lastPipsRange = lastValuesByPeriod.PipsRange;
            var lastLowPrice = Math.min.apply(Math, forecastEntryValues);
            var lastHighPrice = Math.max.apply(Math, forecastEntryValues);

            var result = [];
            for (var i = lastLowPrice; i <= lastHighPrice; i = i + lastPipsRange) {
                result.push(i);
            }

            return result;
        };

        var getScatterColumns = function (studies) {
            var result = new Array();
            $.each(studies, function (i, periodTypeStudy) {
                var entryValues = $.map(periodTypeStudy, function (entry, j) {
                    if (j === 0) {
                        return entry;
                    }
                    return entry.Value;
                });
                result.push(entryValues);
            });
            return result;
        };

        return _this;
    };
})(FXStreetWidgets.$);