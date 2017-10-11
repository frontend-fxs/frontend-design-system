(function ($) {
    FXStreetWidgets.ForecastChartC3JsonBuilder = function () {
        var _this = {};

        var showPoint = false;
        var tooltipDelegate = function (d) {
            var parseDate = d3.time.format("%B %d, %Y");
            return parseDate(d);
        };
        var tooltipValueDelegate = null;
        var tooltipNameDelegate = null;
        var tooltipContentsDelegate = null;

        var assetDecimalPlaces = 2;

        var axisTooltipDelegate = function (d) {
            var parseDate = d3.time.format("%B %d, %Y");
            return parseDate(d);
        };

        var scatterPointRadDelegate = function (d) {
            return 1;
        };

        var decimalAxisDelegate = function (d) {
            var expression = '.{0}f'.replace('{0}', assetDecimalPlaces);
            var result = d3.format(expression);
            return result(d);
        };

        var dataRowConfigs = [];
        var barWidth = 0.0;
        var area = {
            hasArea: false,
            zerobased: false
        };
        var xSort = true;
        var showY = false;
        var showY2 = true;
        var tooltipGrouped = true;
        var order = {
            hasOrder: false,
            value: false
        };
        var groups = [];
        var axisToModifyOrAdd = [];
        var rightPadding = 50;
        var leftPadding = 50;

        _this.withShowPoint = function (show) {
            showPoint = show;
            return _this;
        };

        _this.withTooltipDelegate = function (delegate) {
            tooltipDelegate = delegate;
            return _this;
        };

        _this.withRadiusDelegate = function (delegate) {
            scatterPointRadDelegate = delegate;
            return _this;
        };

        _this.withAxisTooltipDelegate = function (delegate) {
            axisTooltipDelegate = delegate;
            return _this;
        };

        _this.withTooltipValueDelegate = function (delegate) {
            tooltipValueDelegate = delegate;
            return _this;
        };

        _this.withTooltipContentsDelegate = function (delegate) {
            tooltipContentsDelegate = delegate;
            return _this;
        };

        _this.withTooltipNameDelegate = function (delegate) {
            tooltipNameDelegate = delegate;
            return _this;
        };

        _this.addDataColumnConfig = function (config) {
            dataRowConfigs.push(config);
            return _this;
        };

        _this.withBar = function (width) {
            barWidth = width;
            return _this;
        };

        _this.withAxis = function (axis) {
            axisToModifyOrAdd.push(axis);
            return _this;
        };

        _this.withArea = function (zerobased) {
            area.hasArea = true;
            area.zerobased = zerobased;
            return _this;
        };

        _this.withGroup = function () {
            var group = Array.from(arguments);
            groups.push(group);
            return _this;
        };

        _this.withOrder = function (value) {
            order.hasOrder = true;
            order.value = value;
            return _this;
        };

        _this.withXSort = function(value) {
            xSort = value;
            return _this;
        };

        _this.withShowY = function (value) {
            showY = value;
            return _this;
        };

        _this.withShowY2 = function (value) {
            showY2 = value;
            return _this;
        };

        _this.withTooltipGrouped = function (value) {
            tooltipGrouped = value;
            return _this;
        };

        _this.withRightPadding = function (padding) {
            rightPadding = padding;
            return _this;
        };

        _this.withLeftPadding = function (padding) {
            leftPadding = padding;
            return _this;
        };

        _this.build = function (columns, bindToSelector, assetDecimals) {
            if (!columns || !bindToSelector) {
                console.error("FXStreetWidgets: Invalid data. Couldn't build forecastcharts.");
                return {};
            }

            if (typeof assetDecimals !== 'undefined' && assetDecimals !== null) {
                assetDecimalPlaces = assetDecimals;
            }

            var result = {
                bindto: bindToSelector,
                data: {
                    xs: {},
                    xFormat: '%m/%d/%Y',
                    xSort: xSort,
                    columns: columns,
                    axes: {},
                    names: {},
                    colors: {},
                    types: {},
                    classes: {},
                    groups: []
                },
                grid: {
                    x: {
                        show: true
                    },
                    y: {
                        show: true
                    }
                },
                axis: {
                    x: {
                        type: 'timeseries',
                        tick: {
                            format: '%b %Y',
                            culling: { max: 12 }
                        },
                        padding: {
                            right: rightPadding * 10000000,
                            left: leftPadding * 10000000
                        }
                    },
                    y: {
                        show: showY,
                        tick: {
                            format: decimalAxisDelegate
                        }
                    },
                    y2: {
                        show: showY2,
                        tick: {
                            format: decimalAxisDelegate
                        }
                    },
                    tooltip: {
                        format: {
                            title: axisTooltipDelegate
                        }
                    }
                },
                point: {
                    show: showPoint,
                    r: scatterPointRadDelegate
                },
                tooltip: {
                    format: {
                        title: tooltipDelegate
                    },
                    grouped: tooltipGrouped
                },
                legend: {
                    hide: []
                }
            };

            $.each(dataRowConfigs, function (i, config) {
                if (!config) return;

                if (config.axes) {
                    result.data.axes[config.name] = config.axes;
                }

                if (config.xs) {
                    result.data.xs[config.name] = config.xs;
                } else {
                    result.data.xs[config.name] = 'x';
                }

                if (config.names) {
                    result.data.names[config.name] = config.names;
                }

                if (config.colors) {
                    result.data.colors[config.name] = config.colors;
                }

                if (config.types) {
                    result.data.types[config.name] = config.types;
                }

                if (config.classes) {
                    result.data.classes[config.name] = config.classes;
                }

                if (config.hideLegend) {
                    result.legend.hide.push(config.name);
                }
            });

            $.each(groups, function (i, group) {
                result.data.groups.push(group);
            });

            if (order.hasOrder) {
                result.data.order = order.value;
            }

            if (barWidth > 0.0) {
                result.bar = {
                    width: {
                        ratio: barWidth
                    }
                };
            }

            $.each(axisToModifyOrAdd, function (i, axis) {
                result.axis[axis.name] = axis.value;
            });

            if (area.hasArea) {
                result.area = {
                    zerobased: area.zerobased
                };
            }

            if (tooltipValueDelegate) {
                result.tooltip.format.value = tooltipValueDelegate;
            }
            if (tooltipNameDelegate) {
                result.tooltip.format.name = tooltipNameDelegate;
            }
            if (tooltipContentsDelegate) {
                result.tooltip.contents = tooltipContentsDelegate;
            }

            return result;
        };

        return _this;
    };
})(FXStreetWidgets.$);