(function () {
    window.addEventListener("load", function (event) {
        FXStreetWidgets.ResourceManagerObj = new FXStreetWidgets.ResourceManager();

        FXStreetWidgets.Configuration = new FXStreetWidgets.ConfigManager();
        FXStreetWidgets.Configuration.init();

        FXStreetWidgets.Initialization = new FXStreetWidgets.InitManager();
        FXStreetWidgets.Initialization.init();

        FXStreetWidgets.Deferred = new FXStreetWidgets.DeferredManager();
    });
}());