(function () {
    FXStreet.Class.ExportCalendar = function () {
        var parent = FXStreet.Class.Base(),
        _this = FXStreet.Util.extendObject(parent);

        _this.ContainerId = "";
        _this.FilterDivId = "";
        _this.GridDivId = "";
        _this.MessagesContentId = "";
        _this.UserIsLogged = false;
        _this.Translations = null;

        _this.Container = null;
        _this.Filter = null;
        _this.Grid = null;
        _this.MessagesContent = null;
        _this.Template = null;

        _this.HtmlTemplateFile = "exportcalendar.html";
        _this.Message_HtmlTemplateFile = "exportcalendar_alert.html";
        _this.MessageHtml = "";

        _this.init = function (json) {
            _this.setSettingsByObject(json);
            _this.setVars();
            _this.addEvents();
            _this.render();
        };

        _this.setVars = function () {
            _this.Container = FXStreet.Util.getjQueryObjectById(_this.ContainerId);
            _this.Filter = FXStreet.Util.getjQueryObjectById(_this.FilterDivId);
            _this.Grid = FXStreet.Util.getjQueryObjectById(_this.GridDivId);
            _this.MessagesContent = FXStreet.Util.getjQueryObjectById(_this.MessagesContentId);

            _this.Template = FXStreet.Util.getObjectInstance('TemplateBase');

            FXStreet.Util.loadHtmlTemplate(_this.Message_HtmlTemplateFile).done(function (template) {
                _this.MessageHtml = FXStreet.Util.renderByHtmlTemplate(template, _this.Translations.AlertTranslations);
            });
        };


        _this.render = function () {
            var jsonObject = JSON.parse(_this.Translations);
            _this.htmlRender(jsonObject);
        };

        _this.htmlRender = function (jsonData) {
            FXStreet.Util.loadHtmlTemplate(_this.HtmlTemplateFile).done(function (template) {
                var rendered = FXStreet.Util.renderByHtmlTemplate(template, jsonData);
                _this.Container.append(rendered);

                _this.onRendered();
            });
        };

        _this.onRendered = function () {
            if (!_this.UserIsLogged) {
                _this.Container.find("a").on('click', _this.NotifyLoginRequired);
                return;
            }

            _this.Container.find("a[fxs_csv]").on('click', _this.ExportAsCsv);
            _this.Container.find("a[fxs_ics]").on('click', _this.DownloadIcs);
        };

        _this.NotifyLoginRequired = function (e) {
            e.preventDefault();
            _this.MessagesContent.html(_this.MessageHtml);
            _this.MessagesContent.find('[fxs_button_login]').on('click', _this.OpenLogin);
            _this.MessagesContent.find('[fxs_button_join]').on('click', _this.OpenJoinUs);
        }

        _this.OpenLogin = function (e) {
            e.preventDefault();
            _this.Template.SidebarRight_ShowButton_Click('login');
        };

        _this.OpenJoinUs = function (e) {
            e.preventDefault();
            _this.Template.SidebarRight_ShowButton_Click('signup');
        };

        _this.ExportAsCsv = function (e) {
            e.preventDefault();
            _this.Grid.trigger("exportcsv");
        };

        _this.DownloadIcs = function (e) {
            e.preventDefault();
            _this.Grid.trigger("downloadics");
        };

        return _this;
    };
}());