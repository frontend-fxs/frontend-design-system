(function () {
    FXStreet.Class.Sidebar.ListItemType.Base = function () {
        var parent = FXStreet.Class.Base(),
        _this = FXStreet.Util.extendObject(parent);

        _this.HtmlTemplateFile = "";
        _this.HtmlTemplateData = {
        };
        _this.RenderedItemInPage = null;
        _this.ClickCallback = null;
        _this.Container = null;
        _this.Id = "";
        _this.SetHtmlTemplateDataCallback = null;

        _this.init = function (json) {
            _this.setSettingsByObject(json);

            if (json !== undefined && json !== null) {
                _this.HtmlTemplateData = json;
            }

            _this.setVars();
            _this.addEvents();
        };

        _this.setVars = function () {
            _this.HtmlTemplateData = _this.HtmlTemplateData || {};
        };
        _this.addEvents = function () {
        };

        _this.renderHtml = function (renderCallback) {
            FXStreet.Util.loadHtmlTemplate(_this.HtmlTemplateFile).done(function (template) {
                var rendered = FXStreet.Util.renderByHtmlTemplate(template, _this.getJsonForRenderHtml());
                _this.Container = $(rendered);
                _this.preRender();
                renderCallback(_this, _this.Container);
                _this.postRender();
            });
        };

        _this.preRender = function () {
        };

        _this.postRender = function () {
        };

        _this.refreshData = function () {

        };

        _this.click = function () {
            _this.ClickCallback(_this);
        };

        _this.onClick = function () {
        };

        _this.IsRenderizableInPage = function () {
            return _this.RenderedItemInPage !== null;
        };

        _this.getJsonForRenderHtml = function () {
            var json = {
                Value: _this.HtmlTemplateData,
                Translations: FXStreet.Resource.Translations['Sidebar_FilterAndList']
            };

            return json;
        };

        _this.Unsubscribe = function () { };

        _this.setHtmlTemplateData = function (jsonData) {
            _this.HtmlTemplateData = jsonData;
            if (typeof _this.SetHtmlTemplateDataCallback === 'function') {
                _this.SetHtmlTemplateDataCallback(_this.HtmlTemplateData);
            }
        };
    
        return _this;
    };
    FXStreet.Class.Sidebar.ListItemType.PieceOfNews = function () {
        var parent = FXStreet.Class.Sidebar.ListItemType.Base(),
          _this = FXStreet.Util.extendObject(parent);

        _this.init = function (json) {
            parent.init(json);
            _this.setVars();
        };

        _this.setVars = function () {
            parent.setVars();
            parent.GetPostByUrlApi = FXStreet.Resource.FxsApiRoutes["NewsItemGetItemByUrl"];
            parent.HtmlTemplateFile = "sidebar_list_news.html";
            parent.RenderedItemInPage = new FXStreet.Class.Sidebar.RenderedItemInPage.PieceOfNews();
            parent.RenderedItemInPage.init(
               $.extend(true, _this.HtmlTemplateData, { 'SetHtmlTemplateDataCallback': _this.setHtmlTemplateData }));
        };

        return _this;
    };
    FXStreet.Class.Sidebar.ListItemType.AjaxPage = function () {
        var parent = FXStreet.Class.Sidebar.ListItemType.Base(),
          _this = FXStreet.Util.extendObject(parent);

        _this.CookieInfo = null;

        _this.init = function (json) {
            parent.init(json);
            _this.setSettingsByObject(json);
            _this.setVars();
        };

        _this.setVars = function () {
            parent.setVars();

            parent.RenderedItemInPage = new FXStreet.Class.Sidebar.RenderedItemInPage.AjaxPage();
            parent.RenderedItemInPage.init({
                Url: _this.HtmlTemplateData.Url,
                CookieInfo: _this.CookieInfo
            });
        };

        parent.renderHtml = function () {
        };


        return _this;
    };
    FXStreet.Class.Sidebar.ListItemType.TransitionSidebar = function () {
        var parent = FXStreet.Class.Sidebar.ListItemType.Base(),
         _this = FXStreet.Util.extendObject(parent);

        _this.init = function (json) {
            parent.init(json);
            _this.setVars();
        };

        _this.setVars = function () {
            parent.HtmlTemplateFile = "sidebar_list_transitionsidebar.html";
            parent.HtmlTemplateData.ContainerId = _this.Id;
            parent.Container = FXStreet.Util.getjQueryObjectById(_this.Id);
        };

        parent.postRender = function () {
            FXStreet.Util.registerDynamicObjs(parent.Container);
        };

        return _this;
    };
    FXStreet.Class.Sidebar.ListItemType.TransitionDetail = function () {
        var parent = FXStreet.Class.Sidebar.ListItemType.Base(),
         _this = FXStreet.Util.extendObject(parent);

        _this.init = function (json) {
            parent.init(json);
            _this.setVars();
        };

        _this.setVars = function () {
            parent.HtmlTemplateData.ContainerId = _this.Id;
            parent.RenderedItemInPage = new FXStreet.Class.Sidebar.RenderedItemInPage.TransitionDetail();
            parent.RenderedItemInPage.init(_this.HtmlTemplateData);
        };

        parent.renderHtml = function () {
        };
        
        return _this;
    };
    FXStreet.Class.Sidebar.ListItemType.AnalysisItem = function () {
        var parent = FXStreet.Class.Sidebar.ListItemType.Base(),
          _this = FXStreet.Util.extendObject(parent);

        _this.init = function (json) {
            parent.init(json);
            _this.setVars();
        };

        _this.setVars = function () {
            parent.setVars();
            parent.HtmlTemplateFile = "sidebar_list_analysisitem.html";
            parent.RenderedItemInPage = new FXStreet.Class.Sidebar.RenderedItemInPage.AnalysisItem();
            parent.RenderedItemInPage.init(
                $.extend(true, _this.HtmlTemplateData,{ 'SetHtmlTemplateDataCallback': _this.setHtmlTemplateData }));
        };

        return _this;
    };
    FXStreet.Class.Sidebar.ListItemType.EducationItem = function () {
        var parent = FXStreet.Class.Sidebar.ListItemType.Base(),
          _this = FXStreet.Util.extendObject(parent);

        _this.init = function (json) {
            parent.init(json);
            _this.setVars();
        };

        _this.setVars = function () {
            parent.setVars();
            parent.GetPostByUrlApi = FXStreet.Resource.FxsApiRoutes["EducationItemGetItemByUrl"];
            parent.HtmlTemplateFile = "sidebar_list_educationitem.html";
            parent.RenderedItemInPage = new FXStreet.Class.Sidebar.RenderedItemInPage.EducationItem();
            parent.RenderedItemInPage.init(
               $.extend(true, _this.HtmlTemplateData, { 'SetHtmlTemplateDataCallback': _this.setHtmlTemplateData }));
        };

        return _this;
    };
    FXStreet.Class.Sidebar.ListItemType.RatesAndChartsItem = function () {
        var parent = FXStreet.Class.Sidebar.ListItemType.Base(),
          _this = FXStreet.Util.extendObject(parent);

        _this.RateManagerObj = null;

        _this.init = function (json) {
            parent.init(json);
            _this.setVars();

            _this.createRateManager();
        };

        _this.setVars = function () {
            parent.setVars();

            parent.HtmlTemplateFile = "sidebar_list_ratesandcharts.html";

            parent.RenderedItemInPage = new FXStreet.Class.Sidebar.RenderedItemInPage.RatesAndChartsItem();
            parent.RenderedItemInPage.init(_this.HtmlTemplateData);
        };

        _this.createRateManager = function () {
            _this.RateManagerObj = new FXStreet.Class.SingleRateManager();
            _this.RateManagerObj.init({
                "ContainerId": _this.HtmlTemplateData.Id,
                "HtmlTemplateFile": "ratesandcharts_listView.html",
                "Data": _this.getJsonForRenderHtml(),
                "MustSubscribeAtInit": true
            });
        };

        _this.Subscribe = function () {
            if (_this.RateManagerObj != null)
                _this.RateManagerObj.Subscribe();
        };

        parent.Unsubscribe = function () {
            if (_this.RateManagerObj != null)
                _this.RateManagerObj.Unsubscribe();
        };

        parent.preRender = function () {
            _this.RateManagerObj.Container = _this.Container;
        };

        parent.postRender = function () {
            _this.RateManagerObj.render();
        };

        return _this;
    };
    FXStreet.Class.Sidebar.ListItemType.VideoItem = function () {
        var parent = FXStreet.Class.Sidebar.ListItemType.Base(),
          _this = FXStreet.Util.extendObject(parent);

        _this.init = function (json) {
            parent.init(json);
            _this.setVars();
        };

        _this.setVars = function () {
            parent.setVars();
            parent.GetPostByUrlApi = FXStreet.Resource.FxsApiRoutes["VideosGetItemByUrl"];
            parent.HtmlTemplateFile = "sidebar_list_videoitem.html";
            parent.RenderedItemInPage = new FXStreet.Class.Sidebar.RenderedItemInPage.VideoItem();
            parent.RenderedItemInPage.init(
               $.extend(true, _this.HtmlTemplateData, { 'SetHtmlTemplateDataCallback': _this.setHtmlTemplateData }));
        };

        return _this;
    };
    FXStreet.Class.Sidebar.ListItemType.NoMoreContent = function () {
        var parent = FXStreet.Class.Sidebar.ListItemType.Base(),
          _this = FXStreet.Util.extendObject(parent);

        parent.HtmlTemplateFile = 'sidebar_list_nomorecontent.html';

        _this.init = function (json) {
            parent.init(json);
            _this.setVars();
        };

        _this.setVars = function () {
            parent.setVars();

            parent.RenderedItemInPage = new FXStreet.Class.Sidebar.RenderedItemInPage.NoMoreContent();
            parent.RenderedItemInPage.init();
        };

        return _this;
    };
}());
