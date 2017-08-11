(function () {
    FXStreetWidgets.DeferredManager = function () {
        var _this = this;

        var widgetDataList = [];
        
        var initDeferredWidgets = function () {
            if (FXStreetWidgets.Initialization === null || !FXStreetWidgets.Initialization.isReady) {
                return;
            }

            for (var i = widgetDataList.length - 1; i >= 0 ; i--) {
                var widgetData = widgetDataList[i];
                FXStreetWidgets.Initialization.loadWidgets(widgetData);

                for (var key in widgetData.widgets) {
                    if (widgetData.widgets[key].Loaded === true) {
                        delete widgetData.widgets[key];
                    }
                }
                
                if (Object.keys(widgetData.widgets).length === 0) {
                    widgetDataList.splice(i, 1);
                }
            }
        };

        _this.deferredLoad = function (container) {
            if (container) {
                var widgetData = new FXStreetWidgets.InitManager.WidgetData(container, true);
                widgetDataList.push(widgetData);
            }

            initDeferredWidgets();
        };

        return _this;
    };
}());