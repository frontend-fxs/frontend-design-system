(function () {
    FXStreet.Class.LandingPremiumConversion = function () {
        var parent = FXStreet.Class.Base(),
        _this = FXStreet.Util.extendObject(parent);

        _this.ContainerId = "";
        _this.Model = {};
        _this.HtmlTemplateFile = "landing_premium_conversion.html";
        _this.HtmlTemplateFilePriceTablelogin = "price_table_login.html";
        _this.HtmlTemplateFilePriceTable = "price_table.html";
              
        _this.Container = null;

        _this.init = function (json) {
            _this.setSettingsByObject(json);
            _this.setVars(json);
            _this.render();
        };

        _this.setVars = function (json) {
            _this.Container = FXStreet.Util.getjQueryObjectById(_this.ContainerId);

            _this.Model = {
                Subscription: json.Subscription,
                UserInfo: json.UserInfo,
                Translations: json.Translations
            };
        };

        _this.render = function () {
            FXStreet.Util.loadHtmlTemplate(_this.HtmlTemplateFile).done(function (template) {
                var rendered = FXStreet.Util.renderByHtmlTemplate(template, _this.Model);
                _this.Container.html(rendered);

                if (_this.Model.UserInfo.IsLogged)
                {
                    FXStreet.Util.loadHtmlTemplate(_this.HtmlTemplateFilePriceTable).done(function (templatePriceTable) {
                        var renderedPriceTable = FXStreet.Util.renderByHtmlTemplate(templatePriceTable, _this.Model);
                        _this.Container.find('.fxs_row').html(renderedPriceTable);
                    });
                }
                else
                {
                   

                    FXStreet.Util.loadHtmlTemplate(_this.HtmlTemplateFilePriceTablelogin).done(function (templatePriceTableLogin) {
                        var renderedPriceTableLogin = FXStreet.Util.renderByHtmlTemplate(templatePriceTableLogin, _this.Model);
                        _this.Container.find('.fxs_row').html(renderedPriceTableLogin);
                    });
                    _this.addEvents();
                }
             
            });
           
        };

        _this.addEvents = function () {
            var premButton1monthId = "fxs_button_month_1";
            var premButton3monthId = "fxs_button_month_3";
            var premButton12monthId = "fxs_button_month_12";

            var premButton1monthRegister = FXStreet.Util.getjQueryObjectById(premButton1monthId, false);
            var premButton3monthRegister = FXStreet.Util.getjQueryObjectById(premButton3monthId, false);
            var premButton12monthRegister = FXStreet.Util.getjQueryObjectById(premButton12monthId, false);

            var premButton1monthRegister = FXStreet.Util.getjQueryObjectById(premButton1monthId, false);
            if (premButton1monthRegister != null && premButton1monthRegister.length > 0) {
                premButton1monthRegister.on("click", _this.showRightSideBar);
            }

            var premButton3monthRegister = FXStreet.Util.getjQueryObjectById(premButton3monthId, false);
            if (premButton3monthRegister != null && premButton3monthRegister.length > 0) {
                premButton3monthRegister.on("click", _this.showRightSideBar);
            }

            var premButton12monthRegister = FXStreet.Util.getjQueryObjectById(premButton12monthId, false);
            if (premButton12monthRegister != null && premButton12monthRegister.length > 0) {
                premButton12monthRegister.on("click", _this.showRightSideBar);
            }            
        };

        _this.showRightSideBar = function () {
            var userMenu = FXStreet.Util.getObjectInstance("UserMenu");
            if (userMenu == null) {
                return;
            }
            userMenu.Login();        
        };

        return _this;
    };
}());