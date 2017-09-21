(function () {
    FXStreet.Class.Cag = function () {

        var parent = FXStreet.Class.Base(),
        _this = FXStreet.Util.extendObject(parent);

        _this.ContainerId = "";
        _this.ContentId = "";
        _this.MarketToolsWebApiBaseUrl = "";
        _this.Asset = "";
        _this.PairName = "";
        _this.PriceProviderCode = "";
        _this.DecimalPlaces = null;
        _this.Date = "";
        _this.Translations = {};
        _this.BigChartUrl = null;
        _this.AssetUrl = null;
        _this.JsonData = {};

        var pivotPointsCalled = false;
        var sentimentCalled = false;
        var forecastCalled = false;

        _this.TrendCssClasess = {
            StronglyBearish: "fxs_txt_danger",
            Bearish: "fxs_txt_danger",
            Neutral: "fxs_txt_neutral",
            Bullish: "fxs_txt_success",
            SlightlyBullish: "fxs_txt_success"
        };

        _this.ObOsCssClasess = {
            Oversold: "fxs_txt_warning",
            Neutral: "fxs_txt_neutral",
            Overbought: "fxs_txt_warning"
        };

        _this.VolatilityCssClasess = {
            Expanding: "fxs_txt_neutral",
            High: "fxs_txt_warning",
            Low: "fxs_txt_warning",
            Shrinking: "fxs_txt_neutral"
        };

        _this.Container = null;

        _this.HtmlTemplateFile = function () {
            return "cagwidget_default.html";
        }

        _this.init = function (json) {
            _this.setSettingsByObject(json);
            _this.setVars();
            render();

            callMarketTools();
        };

        _this.setVars = function () {
            _this.Container = FXStreet.Util.getjQueryObjectById(_this.ContainerId);
            _this.ContentId = FXStreet.Util.guid();
            _this.JsonData.ContentId = _this.ContentId;
            _this.JsonData.Asset = _this.Asset;
            _this.JsonData.PairName = _this.PairName;
            _this.JsonData.Translations = _this.Translations;
        };

        var callMarketTools = function () {
            var auth = FXStreet.Class.Patterns.Singleton.Authorization.Instance();

            auth.getTokenPromise()
                .then(function (token) {
                    getPivotPoints(token);
                    getSentiment(token);
                    getForecast(token);
                }, function (error) {
                  render();
            });
        };

        var render = function () {
            FXStreet.Util.loadHtmlTemplate(_this.HtmlTemplateFile()).done(function (template) {
                var rendered = FXStreet.Util.renderByHtmlTemplate(template, _this.JsonData);
                _this.Container.html(rendered);
                if (pivotPointsCalled && sentimentCalled && forecastCalled) {
                    loadWidgets();
                }

                FXStreet.Util.SetTooltip();
            });
        };

        var loadWidgets = function () {
            initChart();
            initRate();
        }

        var getPivotPoints = function (token) {
            var url = _this.MarketToolsWebApiBaseUrl + "/v1/" + FXStreet.Resource.CultureName + "/pivotPoints/study/" + _this.Asset;
            return $.ajax({
                type: "GET",
                url: url,
                beforeSend: function (xhr) {
                    xhr.setRequestHeader("Authorization", token.token_type + ' ' + token.access_token);
                }
            }).then(function (data) {
                    pivotPointsCalled = true;
                    setPivotPointsToJson(data);
                    render();
                }, function () {
                    pivotPointsCalled = true;
                    render();
                });
        };

        var getSentiment = function (token) {
            var url = _this.MarketToolsWebApiBaseUrl + "/v1/" + FXStreet.Resource.CultureName + "/sentiment/study/" + _this.Asset;
            return $.ajax({
                type: "GET",
                url: url,
                beforeSend: function (xhr) {
                    xhr.setRequestHeader("Authorization", token.token_type + ' ' + token.access_token);
                }
            }).then(function (data) {
                    sentimentCalled = true;
                    setSentimentsToJson(data);
                    render();
                },
                  function () {
                      sentimentCalled = true;
                      render();
                  });
        };

        var getForecast = function (token) {
            var url = _this.MarketToolsWebApiBaseUrl + "/v1/" + FXStreet.Resource.CultureName + "/forecast/study/?assetids=" + _this.Asset;
            return $.ajax({
                type: "GET",
                url: url,
                beforeSend: function (xhr) {
                    xhr.setRequestHeader("Authorization", token.token_type + ' ' + token.access_token);
                }
            }).then(function (data) {
                      forecastCalled = true;
                      setForecastToJson(data);
                      render();
                  },
                  function () {
                      forecastCalled = true;
                      render();
                  });
        }

        var initChart = function () {
            if(!_this.SingleChartManagerObj){
                _this.SingleChartManagerObj = new FXStreet.Class.SingleChartManager();

                var jsonChart = {
                    'PairName': _this.PairName,
                    'PriceProviderCode': _this.PriceProviderCode,
                    'WidgetType': 'fxs_widget_cag',
                    'ContainerId': 'fxs_chart_' + _this.ContentId,
                    'BigChartUrl': _this.BigChartUrl.toLowerCase(),
                    'DisplayRSI': false,
                    'DisplaySMA': false,
                    'DisplayBigChartUrl': false,
                    'TouchAvailable': false,
                    'ExternalUrl': _this.BigChartUrl.toLowerCase()
                };
                _this.SingleChartManagerObj.init(jsonChart);
            } 
        }

        var initRate = function () {
            if(!_this.RateManagerObj){
                _this.RateManagerObj = new FXStreet.Class.SingleRateManager();
               
                var jsonRate = {};
                jsonRate.Value = {
                    'AssetId': _this.Asset,
                    'Title': _this.PairName,
                    'PriceProviderCode': _this.PriceProviderCode,
                    'DecimalPlaces': _this.DecimalPlaces,
                    'SEO': { 'FullUrl': _this.AssetUrl }
                };
                jsonRate.Translations = _this.Translations;

                _this.RateManagerObj.init({
                    "ContainerId": 'fxs_ratedata_' + _this.ContentId,
                    "Data": jsonRate,
                    "HtmlTemplateFile": 'ratesandcharts_header.html',
                    "RenderAtInit": true,
                    "MustSubscribeAtInit": true
                });
            }
        };


        var setPivotPointsToJson = function (data) {
            var asset = data.Values[0];

            _this.JsonData.PivotPoints = {
                R1: asset.R1,
                R2: asset.R2,
                R3: asset.R3,
                S1: asset.S1,
                S2: asset.S2,
                S3: asset.S3,
                PP: asset.PivotPoint
            };
        }

        var setSentimentsToJson = function (data) {

            var sentiments = data.Values;
            var sentimentJson = [];
            var sentiment = {};

            for (var i = 0; i < sentiments.length; i++) {
                var number = Math.floor((Math.random() * 100) + 1);
                sentiment[i] = {
                    Type: sentiments[i].Type,
                    TrendIndex: sentiments[i].Trend,
                    TrendIndex_class: _this.TrendCssClasess[sentiments[i].Trend],
                    Obos: sentiments[i].ObOs,
                    Obos_Class: _this.ObOsCssClasess[sentiments[i].ObOs],
                    Volatility: sentiments[i].Volatility,
                    Volatility_Class: _this.VolatilityCssClasess[sentiments[i].Volatility],
                    Id: "Tab" + sentiments[i].Type + sentiments[i].Asset.Id + number,
                    Class: (i == 0 ? "active" : "")
                };

                sentimentJson[i] = sentiment[i];
            };
            _this.JsonData.Sentiment = sentimentJson;
            _this.JsonData.Date = FXStreet.Util.dateToDayAndTimeString(sentiments[0].Date.Value);
            
        }

        var setForecastToJson = function (data) {
            if ((data.Values) && (data.Values[0].WeekStatics)) {
                _this.JsonData.ForecastBias = data.Values[0].WeekStatics.Bias;
                _this.JsonData.ForecastBiasClass = _this.TrendCssClasess[data.Values[0].WeekStatics.Bias];
            }
        }
        return _this;
    };
}());