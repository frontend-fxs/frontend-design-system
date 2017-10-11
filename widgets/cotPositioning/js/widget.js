(function ($) {
    FXStreetWidgets.Widget.CotPositioning = function (loaderBase) {
        var parent = FXStreetWidgets.Widget.Base(loaderBase),
            _this = FXStreetWidgets.Util.extendObject(parent);

        _this.AssetId = "";
        _this.ClassSize = "";
        _this.HideFullReport = "";
        _this.FullReportUrl = "";
        _this.WidgetId = null;
        _this.Seo = false;

        _this.detailColor = '#1b1c23';

        _this.init = function (json) {
            _this.setSettingsByObject(json);
            var url = this.loaderBase.config.EndPoint + _this.AssetId;
            _this.loadDataFromUrl(url);
        };

        _this.convertToPrettyValue = function (value) {

            var rep = Math.abs(parseInt(value));

            rep = rep + ''; // coerce to string
            if (rep < 1000) {
                return rep; // return the same number
            }
            if (rep < 10000) { // place a comma between
                return rep.charAt(0) + ',' + rep.substring(1);
            }
            // divide and format
            var result = (rep / 1000).toFixed(rep % 1000 != 0) + _this.loaderBase.config.Translations.Kilo;
            if (value < 0) return "-" + result;
            else return result;
        };

        _this.convertToPrettyDate = function(value) {
            return moment(value).format("MMM D");
        };

        _this.formatStudy = function (json) {
            var study = {};

            var nonCommercialLength = json.NonCommercial.length - 1;
            var commercialLength = json.Commercial.length - 1;

            study.NonCommercialLastPrettyValue = _this.convertToPrettyValue(json.NonCommercial[0].Value);
            study.NonCommercialFirstPrettyValue = _this.convertToPrettyValue(json.NonCommercial[nonCommercialLength].Value);
            study.NonCommercialFirstPrettyDate = _this.convertToPrettyDate(json.NonCommercial[nonCommercialLength].Date.Value);

            study.CommercialLastPrettyValue = _this.convertToPrettyValue(json.Commercial[0].Value);
            study.CommercialFirstPrettyValue = _this.convertToPrettyValue(json.Commercial[commercialLength].Value);
            study.CommercialFirstPrettyDate = _this.convertToPrettyDate(json.Commercial[commercialLength].Date.Value);

            study.CommercialLastDate = _this.convertToPrettyDate(json.Commercial[0].Date.Value);

            study = _this.setDatesToJson(study, json.Commercial[0].Date);

            return study;
        };

        _this.renderHtml = function () {
            var studyData = _this.data.Values[0];

            var jsonData = {
                Study: _this.formatStudy(studyData),
                Translations: _this.loaderBase.config.Translations,
                FullReportUrl: _this.FullReportUrl,
                Seo: _this.Seo
            };

            var rendered = FXStreetWidgets.Util.renderByHtmlTemplate(_this.loaderBase.config.Mustaches[_this.loaderBase.config.WidgetName], jsonData);
            _this.Container.html(rendered);

            _this.manageRenderedHtml();
            _this.renderCharts(studyData);
        };

        _this.manageRenderedHtml = function () {
            _this.addSizeClass();
            _this.handleFullReport();
        };

        _this.addSizeClass = function () {
            if (_this.ClassSize) {
                _this.Container.find('.fxs_cot_widget').addClass(_this.ClassSize);
            }
        };

        _this.handleFullReport = function () {
            if (_this.HideFullReport) {
                _this.Container.find('.fxs_btn.fxs_btn_line.fxs_btn_small').remove();
            }
        };

        //#region Charts

        _this.renderCharts = function (studyData) {
            _this.renderChart(1, studyData);
        };

        _this.renderChart = function (chartNumId, values) {
            
            var nonCommercialData = values.NonCommercial;
            var commercialData = values.Commercial;

            var columns = ['x'];            
            var dates = ['noncommercial'];
            
            nonCommercialData.forEach(function (item) {
                var formattedDate = moment(item.Date).format("YYYY-MM-DD");
                columns.push(formattedDate);
                dates.push(item.Value);
            });

            var nonCommercialChart = c3.generate({
                bindto: '#non_commercial',
                data: {
                    x: 'x',
                    columns: [columns,dates],
                    colors: { noncommercial: _this.detailColor },
                    names: { noncommercial: 'Non-Commercial' }
                },
                axis: {
                    x: {
                        show: false,
                        type: 'timeseries',
                        tick: { format: '%Y-%m-%d' }
                    },
                    y: { show: false }
                },
                legend: { show: false },
                size: { height: 47 },
                point: {
                    r: 2.4,
                    focus: {
                        expand: { r: 3 },
                        select: { r: 3 }
                    }
                }
            });

            columns = ['x'];
            dates = ['commercial'];

            commercialData.forEach(function (item) {
                var formattedDate = moment(item.Date).format("YYYY-MM-DD");
                columns.push(formattedDate);
                dates.push(item.Value);
            });

            var commercialChart = c3.generate({
                bindto: '#commercial',
                data: {
                    x: 'x',
                    columns: [columns, dates],
                    colors: { commercial: _this.detailColor },
                    names: { commercial: "Commercial" }
                },
                axis: {
                    x: {
                        show: false,
                        type: 'timeseries',
                        tick: { format: '%Y-%m-%d' }
                    },
                    y: { show: false }
                },
                legend: { show: false },
                size: { height: 47 },
                point: {
                    r: 2.4,
                    focus: {
                        expand: { r: 3 },
                        select: { r: 3 }
                    }
                }
            });
        }

        _this.setToolTip = function () {
            _this.Container.find('[data-toggle="tooltip"]').tooltip();
        };
        
        return _this;
    };
}(FXStreetWidgets.$));