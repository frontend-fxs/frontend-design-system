(function () {
    window.FXStreetWidgets = {};
    var FXStreetWidgets = window.FXStreetWidgets;

    FXStreetWidgets.Util = {};
    FXStreetWidgets.Widget = {};
    FXStreetWidgets.Chart = {};
    FXStreetWidgets.Configuration = null;
    FXStreetWidgets.ConfigManager = {};
    FXStreetWidgets.Initialization = null;
    FXStreetWidgets.InitManager = {};
    FXStreetWidgets.Deferred = {};
    FXStreetWidgets.DeferredManager = null;
    FXStreetWidgets.ResourceManager = {};
    FXStreetWidgets.ResourceManagerObj = null;
    FXStreetWidgets.ExternalLib = {};
    FXStreetWidgets.ExternalLib.Mustache = null;
    FXStreetWidgets.$ = null;

    FXStreetWidgets.Util.guid = function () {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
    };

    FXStreetWidgets.Util.ajaxJsonGetter = function (url, data) {
        return FXStreetWidgets.$.ajax({
            type: "GET",
            url: url,
            data: data,
            contentType: "application/json; charset=utf-8",
            dataType: "json"
        });
    };

    FXStreetWidgets.Util.renderByHtmlTemplate = function (htmlTemplate, jsonData) {
        var result = FXStreetWidgets.ExternalLib.Mustache.render(htmlTemplate, jsonData);
        return result;
    };

    FXStreetWidgets.Util.getQueryStringParameterByName = function (name) {
        name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
        var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
            results = regex.exec(location.search);
        return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
    };

    FXStreetWidgets.Util.extendObject = function (o) {
        var f = function () { };
        f.prototype = o;
        return new f();
    };

    FXStreetWidgets.Util.arrayIsValid = function (obj) {
        return FXStreetWidgets.Util.isValid(obj) && obj.length > 0;
    };

    // TODO: to remove, redundant code
    FXStreetWidgets.Util.isValid = function (obj) {
        return obj != null && !FXStreetWidgets.Util.isUndefined(obj);
    };

    // TODO: to remove, redundant code
    FXStreetWidgets.Util.isUndefined = function (obj) {
        return typeof obj === "undefined";
    };
    
    FXStreetWidgets.Util.formatDate = function (date, format) {
        if (!moment) {
            console.warn("Momentjs is not loaded");
            return date;
        }
        if (!format) {
            format = "MMM D, HH:mm";
        }

        var utc;

        if (date) {
            utc = moment.utc(date);
        } else {
            utc = moment.utc();
        }

        var result = utc.format(format, FXStreetWidgets.Configuration.config.Culture);
        return result;
    };

    FXStreetWidgets.Util.formatDateUtcOffset = function (dateUTC, UtcOffsetHours, format) {

        if (!FXStreetWidgets.Util.isValid(format)) {
            format = "MMM D, HH:mm";
        }

        if (FXStreetWidgets.Util.isValid(dateUTC)) {
            var minutesToAdd = (60 * UtcOffsetHours);
            var dateWithNewTimeZone = moment(dateUTC).utcOffset(minutesToAdd);
        }

        return dateWithNewTimeZone.format(format);
    }

    FXStreetWidgets.Util.log = function (msg) {
        if (FXStreetWidgets.Configuration.config.Logging === false || FXStreetWidgets.Util.isUndefined(window.console)) {
            return;
        }

        var message = "[" + new Date().toTimeString() + "] FXS: " + msg;
        if (window.console.debug) {
            window.console.debug(message);
        } else if (window.console.log) {
            window.console.log(message);
        }
    }

    FXStreetWidgets.Util.async = function (fn) {
        if (!fn || typeof fn !== "function") {
            return;
        }
        setTimeout(function () {
            fn();
        }, 1);
    };
}());