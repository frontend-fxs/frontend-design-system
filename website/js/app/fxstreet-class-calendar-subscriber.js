(function () {
    FXStreet.Class.CalendarSubscriber = function () {
        var parent = FXStreet.Class.Base(),
            _this = FXStreet.Util.extendObject(parent);

        //#region Json properties
        _this.ContainerId = "";
        _this.Translations = [];
        //#endregion

        var SoundObj = null;
        var Container = null;
        var IsSubscribed = false;
        var VolumeElement = null;
        var Interval = null;

        _this.init = function (json) {
            _this.setSettingsByObject(json);
            _this.ContainerId = "fxst-calendar-filter-dateshortcuts";
            waitUntilCalendarRendered();
        };

        _this.setVars = function () {
            createSoundObj();
            appendNotificationsButton();
        };

        var waitUntilCalendarRendered = function() {
            Interval = setInterval(intervalCallback, 100);
        };

        var intervalCallback = function() {
            Container = $("#" + _this.ContainerId);
            if (Container !== null && Container && Container.length > 0) {
                clearInterval(Interval);
                _this.setVars();
            }
        };

        var createSoundObj = function() {
            SoundObj = FXStreet.Util.getObjectInstance('Sound');
        };

        var subscribeToCalendar = function() {
            $(document).on("actualreceived", "#fxst_grid", calendarActualReceived);
        };

        var unsubscribeFromCalendar = function() {
            $(document).unbind("actualreceived", calendarActualReceived);
        };

        var calendarActualReceived = function(event, data) {
            SoundObj.playSound();
        };

        var appendNotificationsButton = function() {
            var a = $('<a />', {
                href: 'javascript:;',
                click: buttonNotificationsOnClick,
                "class": 'fxs_notify_btn'
            });
            var notificationsSpan = $('<span />', { text: _this.Translations.Notifications + " " });
            a.append(notificationsSpan);
            VolumeElement = $('<i />', { "class": 'fa fa-volume-off' });
            a.append(VolumeElement);
            Container.append(a);
        };

        var buttonNotificationsOnClick = function() {
            IsSubscribed = !IsSubscribed;
            if (IsSubscribed) {
                subscribeToCalendar();
            } else {
                unsubscribeFromCalendar();
            }
            toggleVolumeIcon();
        };

        var toggleVolumeIcon = function() {
            VolumeElement.toggleClass('fa-volume-off fa-volume-up');
        };

        return _this;
    };
}());