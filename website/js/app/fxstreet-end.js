(function () {
    var loadFxs = function () {
        if (!FXStreet.Resource.externalJsLoaded) {
            setTimeout(function () {
                loadFxs();
            }, 50);
        }
        else {
            (function ($) {
                $(function () {
                    FXStreet.Util.ready();
                    $(window).load(FXStreet.Util.load);
                });
            })(jQuery);
        }
    };
    loadFxs();
}());