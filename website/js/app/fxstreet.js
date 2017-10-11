(function () {
    FXStreet.Util.ready = function () {
        FXStreet.Class.Survey.Base();
        FXStreet.Util.preReady();
        FXStreet.Resource.isReady = true;
        //Initialize objects
        FXStreet.Util.initObjects("ready");
    };
    FXStreet.Util.load = function () {
        FXStreet.Resource.isLoaded = true;
        //Initialize objects
        FXStreet.Util.initObjects("load");
    };
    FXStreet.Util.loadMustaches = function () {
        $.ajax({
            type: "GET",
            url: FXStreet.Resource.MustacheBundle
        }).then(function (data) {
            FXStreet.Util.htmlBundle = data;
            FXStreet.Util.onHtmlBundleReadyDelegateds.forEach(function (item) {
                FXStreet.Util.loadHtmlTemplate(item.htmlTemplate).done(function (data) {
                    item.deferred.resolve(data);
                });
            });
        }, function () {
            if (window.console) {
                window.console.log("Error to load mustache");
            }
        });
    }
    FXStreet.Util.preReady = function () {
        function LoadTTChart() {
            if (typeof TTChart === "undefined") {
                console.warn('LoadTTChart');
                setTimeout(LoadTTChart, 100);
                return;
            }

            FXStreet.ExternalLib.TTChart = TTChart;
            FXStreet.Util.Deferreds.PendingTTChart.forEach(function (item) {
                var chart = FXStreet.ExternalLib.TTChart.create({ id: item.ChartId });
                item.Deferred.resolve(chart);
            });
        }

        FXStreet.ExternalLib.Mustache = Mustache;
        FXStreet.ExternalLib.GoogleTag = googletag;
        FXStreet.ExternalLib.Teletrader = TT;

        FXStreet.Util.loadMustaches();

        LoadTTChart();

        var object = FXStreet.Util.createObject("ResponsiveDesign", {}, "ready");
        FXStreet.Util.initObject(object);

        FXStreet.Util.registerDynamicObjs();

        FXStreet.Resource.InitialTitle = document.title;
        FXStreet.Resource.InitialUrl = window.location.pathname;
        if (FXStreet.Util.isTouchDevice()) {
            $('body').addClass('fxs_touch');
        }
    };

    FXStreet.Util.ConvertUtcDateToCurrentTimeZone = function (dateUtc)
    {
        var utcOffset = FXStreet.Class.Patterns.Singleton.TimeZoneManager.Instance().TimeZone().HoursUtcOffset;
        var date = new Date(dateUtc);

        var result = new Date(date.setTime(date.getTime() + date.getTimezoneOffset() * 60 * 1000 + (utcOffset) * 60 * 60 * 1000));
        return result.toISOString();
    }

    FXStreet.Util.registerDynamicObjs = function (container) {
        container = container || $("body");
        var divs = container.find("div[fxs_objtype]");

        for (var i = 0; i < divs.length; i++) {
            var current = $(divs[i]);

            var createEvent = current.attr("fxs_createevent");
            var objType = current.attr("fxs_objtype");

            if (createEvent === undefined || objType === undefined) {
                console.log("unable to create fxsobj from: " + current.attr("id"));
                continue;
            }

            var json = {};
            try {
                json = FXStreet.Util.deserializeJsonFromAttr(current.attr("fxs_json"));
            } catch (e) {
                console.log("unable to create fxsobj from: " + current.attr("id"));
                continue;
            }

            FXStreet.Util.createObject(objType, json, createEvent);
        }
    };

    /* 
    Takes a JS Date as input and returns a string like "2010-05-31"
    */
    FXStreet.Util.dateToIsoString = function (date) {
        var year = date.getFullYear(),
            month = (date.getMonth() + 1).toString(),
            day = date.getDate().toString(),
            result = "";

        if (month.length === 1) {
            month = "0" + month;
        }
        if (day.length === 1) {
            day = "0" + day;
        }

        result = year + "-" + month + "-" + day;
        return result;
    };

    FXStreet.Util.dateToDayAndTimeString = function (dateInUtc) {
        
        var date = new Date(dateInUtc)
        var userTimezoneOffset = date.getTimezoneOffset() * 60000;
        var dateUTCTrick = new Date(date.getTime() + userTimezoneOffset);

        var month = (dateUTCTrick.getMonth() + 1).toString(),
            day = dateUTCTrick.getDate().toString(),
            result = "";

        if (month.length === 1) {
            month = month - 1;
        }
        if (day.length === 1) {
            day = "0" + day;
        }

        var hour = dateUTCTrick.getHours().toString(),
            minutes = dateUTCTrick.getMinutes().toString();

        if (hour.length === 1)
            hour = "0" + hour;

        if (minutes.length === 1)
            minutes = "0" + minutes;

        var time = hour + ":" + minutes;

        var monthsArray = FXStreet.Resource.Translations.GenericResources.Months.split(',');
        result = monthsArray[month] + " " + day + ", " + time;
        return result;
    };
    FXStreet.Util.dateToDateString = function (date, showYear) {
        var year = date.getFullYear(),
            month = date.getMonth(),
            day = date.getDate().toString();

        if (showYear)
            return day + " " + FXStreet.Resource.Months[month] + " " + year;
        else
            return day + " " + FXStreet.Resource.Months[month];
    };
    FXStreet.Util.dateToTimeString = function (date) {
        var hour = date.getHours().toString(),
            minutes = date.getMinutes().toString();

        if (hour.length === 1)
            hour = "0" + hour;

        if (minutes.length === 1)
            minutes = "0" + minutes;

        return hour + ":" + minutes;
    };
    FXStreet.Util.dateStringToDateUTC = function (dateStr) {
        var date = new Date(dateStr);
        var year = date.getFullYear(),
           month = date.getMonth(),
           day = date.getDate(),
           hours = date.getHours(),
           minutes = date.getMinutes();

        var result = new Date(Date.UTC(year, month, day, hours, minutes));
        return result;
    };

    FXStreet.Util.getParamUriByName = function (name) {
        var nameTemp = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
        var regex = new RegExp("[\\?&]" + nameTemp + "=([^&#]*)"),
            results = regex.exec(location.search);
        return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
    };

    FXStreet.Util.getUserAgent = function () {
        var result = "";
        if (navigator && navigator.userAgent)
            result = navigator.userAgent;
        return result;
    };
    FXStreet.Util.isIPadDevice = function () {
        var userAgent = FXStreet.Util.getUserAgent();
        var result = userAgent.toLowerCase().match(/ipad/) ? true : false;
        return result;
    };
    FXStreet.Util.isIPhoneDevice = function () {
        var userAgent = FXStreet.Util.getUserAgent();
        var result = userAgent.toLowerCase().match(/iphone/) ? true : false;
        return result;
    };
    FXStreet.Util.isAndroidOS = function () {
        var userAgent = FXStreet.Util.getUserAgent();
        var result = userAgent.toLowerCase().match(/(android)/) ? true : false;
        return result;
    };
    FXStreet.Util.isMobileDevice = function () {
        var userAgent = FXStreet.Util.getUserAgent();
        var result = userAgent.toLowerCase().match(/(mobile)/) ? true : false;
        return result;
    };
    FXStreet.Util.isAndroidMobile = function () {
        var result = FXStreet.Util.isAndroidOS() && FXStreet.Util.isMobileDevice();
        return result;
    };
    FXStreet.Util.isAndroidTablet = function () {
        var result = FXStreet.Util.isAndroidOS() && !FXStreet.Util.isMobileDevice();
        return result;
    };
    FXStreet.Util.isTouchDevice = function () {
        return FXStreet.Util.isIPadDevice() ||
            FXStreet.Util.isIPhoneDevice() ||
            FXStreet.Util.isAndroidOS() ||
            FXStreet.Util.isMobileDevice() ||
            FXStreet.Util.isAndroidMobile() ||
            FXStreet.Util.isAndroidTablet();
    };

    FXStreet.Util.isStorageAvailable = function (type) {
        try {
            var storage = window[type],
                x = '__storage_test__';
            storage.setItem(x, x);
            storage.removeItem(x);
            return true;
        }
        catch (e) {
            return false;
        }
    }

    FXStreet.Util.htmlBundle = "";
    FXStreet.Util.onHtmlBundleReadyDelegateds = [];
    FXStreet.Util.htmlTemplateLoaded = {};

    FXStreet.Util.getElementByIdOnHtmlBundle = function (elementId) {
        var result = null;
        if (elementId) {
            //elementId = elementId.substring(0, elementId.indexOf('.html'));
            elementId = elementId.replace('.html', '');
            var oldPath = '/high';

            var filterId = (!elementId.indexOf(oldPath) > -1)
                ? elementId.substring(elementId.indexOf(oldPath) + 1, elementId.length)
                : elementId;

            var bundle = $('<div>').html(FXStreet.Util.htmlBundle);
            var htmlToRender = bundle.find('#' + filterId);
            var partials = bundle.find('[id^="' + filterId + '."]');
            var partialsInfo = {};
            partials.each(function (i, item) {
                var partialName = item.id.substring(filterId.length + 1);
                partialsInfo[partialName] = $(item).html();
            });

            if ((!htmlToRender || !htmlToRender[0]) && window.console) {
                window.console.log("Error to loading mustache:" + elementId);
            } else {
                result = {
                    Template: htmlToRender[0].innerHTML,
                    Partials: partialsInfo
                }
            }
        }
        return result;
    };

    FXStreet.Util.renderByTemplateName = function (templateName, jsonData) {
        FXStreet.Util.loadHtmlTemplate(templateName).done(function (templateInfo) {
            var rendered = FXStreet.Util.renderByHtmlTemplate(templateInfo, jsonData);
            return rendered;
        });
    }

    FXStreet.Util.loadHtmlTemplate = function (name) {
        if (FXStreet.Util.htmlBundle) {
            if (!FXStreet.Util.htmlTemplateLoaded[name]) {
                FXStreet.Util.htmlTemplateLoaded[name] = FXStreet.Util.getElementByIdOnHtmlBundle(name);
            }

            return $.when().then(function () {
                return FXStreet.Util.htmlTemplateLoaded[name];
            });
        }

        var deferred = $.Deferred();
        FXStreet.Util.onHtmlBundleReadyDelegateds.push({
            deferred: deferred,
            htmlTemplate: name
        });
        return deferred;
    };

    FXStreet.Util.renderByHtmlTemplate = function (templateInfo, jsonData) {
        if (!templateInfo) return '';
        var result = FXStreet.ExternalLib.Mustache.render(templateInfo.Template, jsonData, templateInfo.Partials);
        return result;
    };

    FXStreet.Util.isBackendDesignMode = function () {
        var result = FXStreet.Resource.IsDesignMode && !FXStreet.Resource.IsPreviewMode;
        return result;
    };

    FXStreet.Util.guid = function () {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
    };

    FXStreet.Util.serializeJsonForAttr = function (json) {
        return encodeURIComponent(JSON.stringify(json));
    };
    FXStreet.Util.deserializeJsonFromAttr = function (json) {
        return JSON.parse(decodeURIComponent(json));
    };

    FXStreet.Util.createUrl = function (urlBase, queryStringKeyValues) {
        var result = null;
        if (urlBase) {
            result = urlBase + "?cultureName=" + FXStreet.Resource.CultureName;
            if (queryStringKeyValues !== undefined && queryStringKeyValues !== null) {
                for (var i = 0; i < queryStringKeyValues.length; i++) {
                    result += "&" + queryStringKeyValues[i].Key + "=" + queryStringKeyValues[i].Value;
                }
            }
        }
        return result;
    };
    FXStreet.Util.concatQueryToUrl = function (urlBase, queryStringKeyValues) {
        var result = null;
        if (urlBase !== undefined && urlBase !== null) {
            result = urlBase;
            if (queryStringKeyValues !== undefined && queryStringKeyValues !== null) {
                for (var i = 0; i < queryStringKeyValues.length; i++) {
                    result += "&" + queryStringKeyValues[i].Key + "=" + queryStringKeyValues[i].Value;
                }
            }
        }
        return result;
    };

    FXStreet.Util.getUrl = function (url) {
        return FXStreet.Resource.PageUrl + '/' + url;
    }

    FXStreet.Util.getjQueryObjectById = function (id, check, important) {
        check = check || check === undefined;
        important = important || important === undefined;

        if (!id) {
            console.error('The id cannot be empty');
            return null;
        }

        var obj = $(document.getElementById(id));
        if (check && !obj.length) {
            if (important) {
                console.error('There is not any object with the id ' + id);
            }
            return null;
        }

        return obj;
    };
    FXStreet.Util.getjQueryObjectBySelector = function (selector, check) {
        check = check || check === undefined;
        if (!selector) {
            console.error('The selector cannot be empty');
            return null;
        }

        var obj = $(selector);
        if (check && !obj.length) {
            console.error('There is not any object with the selector ' + selector);
        }

        return obj;
    };
    FXStreet.Util.check = function (jqueryObject) {
        if (!jqueryObject) {
            console.error('The object cannot be empty');
        }

        if (!jqueryObject.length) {
            console.error('The object cannot be null');
        }
        return jqueryObject;
    };
    FXStreet.Util.fillPageSpace = function () {
        var infiniteScrollPageObj = FXStreet.Util.getObjectInstance("InfiniteScrollPage");
        if (infiniteScrollPageObj) {
            var sectionsHeight = infiniteScrollPageObj.ScrollingElement.find('main').height();
            var contentHeight = infiniteScrollPageObj.ScrollingContent.height();

            if (sectionsHeight < contentHeight) {
                infiniteScrollPageObj.setAvoidScroll(true);
                FXStreet.Util.tryRenderNextPageElement(FXStreet.Util.fillPageSpace);
            } else {
                infiniteScrollPageObj.setAvoidScroll(true);
                infiniteScrollPageObj.MoveScroll(1);
                infiniteScrollPageObj.setAvoidScroll(false);
            }
        }
    };
    FXStreet.Util.tryRenderNextPageElement = function (doneDelegate) {
        var elements = FXStreet.Class.Sidebar.Util.RenderizableListItems.filter(function (item) {
            return item.RenderedItemInPage.Visible;
        });
        var position = 0;
        if (elements.length > 0) {
            elements.sort(function (a, b) {
                return a.RenderedItemInPage.PositionInRenderizableListItems < b.RenderedItemInPage.PositionInRenderizableListItems;
            });
            position = elements[0].RenderedItemInPage.PositionInRenderizableListItems + 1;
        }

        var element = FXStreet.Class.Sidebar.Util.RenderizableListItems[position];
        if (!element) {
            return;
        }

        element.RenderedItemInPage.Render(true).then(function () {
            if (typeof doneDelegate === "function") {
                // We need this timeout function. The loads of the news are doing by async calls, and if we have the main thread busy the async calls never will be called. If we don't do this timeout, we have a "maximum call stack size exceeded" error
                setTimeout(function () { doneDelegate(); }, 1);
            }
        });
    };
    FXStreet.Util.getItemPosition = function (item) {
        var position = $(item).attr("fxs_it_position");
        return position ? parseInt(position) : -1;
    };

    FXStreet.Util.parseUrl = function (url) {
        if (!url) {
            return null;
        }
        var a = document.createElement('a');
        a.href = url;
        return {
            host: a.host,
            hostname: a.hostname,
            pathname: a.pathname,
            port: a.port,
            protocol: a.protocol,
            search: a.search,
            hash: a.hash
        };
    };


    FXStreet.Util.isInteger = function (value) {
        return !isNaN(value) &&
            parseInt(Number(value)) == value &&
            !isNaN(parseInt(value, 10));
    };

    FXStreet.Util.ContentTypeMapping = {
        1: { FxsContentType: 'News', JsType: 'PieceOfNews'},
        2: { FxsContentType: 'Analysis', JsType: 'AnalysisItem'},
        3: { FxsContentType: 'Education', JsType: 'EducationItem'},
        4: { FxsContentType: 'Videos', JsType: 'VideoItem'},
        5: { FxsContentType: 'Events', JsType: 'EventItem'},
    };



    FXStreet.Util.FxsCookie = {
        //TODO review this if they are obsoleted keys
        HomeNews: "HomeNews",
        HomeAnalysis: "HomeAnalysis",
        HomeEducation: "HomeEducation",
        HomeRatesAndCharts: "HomeRatesAndCharts",
        HomeBrokers: "HomeBrokers",
        HomeVideos: "HomeVideos",
        //TODO review this if they are obsoleted keys

        UserTimeConfiguration: "UserTimeConfiguration",
        UserSessionId: "UserSessionId",
        SubscribedNewsletters: "SubscribedNewsletters"
    };

    FXStreet.Util.FxsSessionStorage = {
        AcceptContactOnAir: "AcceptContactOnAir"
    };


    FXStreet.Util.VisibleHeight = function (element) {
        if (element === null || element === undefined) {
            return 0;
        }

        var $el = $(element);
        if ($(element).length <= 0) {
            return 0;
        }

        var elH = $el.outerHeight();
        var h = $(window).height();
        var r = $el[0].getBoundingClientRect(), t = r.top, b = r.bottom;

        var result = Math.max(0, t > 0 ? Math.min(elH, h - t) : (b < h ? b : h));
        return result;
    };

    FXStreet.Util.getInnerText = function (element) {
        if (element === null || element === undefined) {
            return "";
        }

        var result = element.innerText || element.textContent;
        return result;
    };

    FXStreet.Util.SetTooltip = function () {
        $('[data-toggle="tooltip"]').tooltip();
    };

    FXStreet.Util.getQueryStringValue = function (name) {
        var vars = window.location.search.substring(1).split('&');

        for (var i = 0; i < vars.length; i++) {
            var pair = vars[i].split('=');
            if (pair[0] === name) {
                return pair[1];
            }
        }

        return null;
    };

    FXStreet.Util.updateUrl = function (id, title, url) {
        if (!window.history.state || !window.history.state.Id || window.history.state.Id !== id) {
            try {
                window.history.pushState({ Id: id }, title, url);
            } catch (e) {
                console.error('The url cannot be pushed');
            }
        }
    };

    FXStreet.Util.DownloadFileFromJsonObject = function (filename, data) {
        var uriContent = "data:application/octet-stream," + encodeURIComponent(data);

        var link = document.createElement('a');
        link.href = uriContent;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    FXStreet.Util.haveSameProperties = function (obj1, obj2) {
        var obj1Props = Object.keys(obj1),
        obj2Props = Object.keys(obj2);

        if (obj1Props.length == obj2Props.length) {
            return obj1Props.every(function (prop) {
                return obj2Props.indexOf(prop) >= 0;
            });
        }

        return false;
    };

    FXStreet.Util.getParameterByName = function (name, url) {
        if (!url) url = window.location.href;
        name = name.replace(/[\[\]]/g, "\\$&");
        var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
            results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, " "));
    };

    FXStreet.Util.getBigChartMobileUrl = function (url, priceProviderCode) {
        //Windows.location.href
        var assetName = FXStreet.Util.getParameterByName("asset", url);
        var mobileUrl = 'https://www.fxstreet.com/mobile-chart';
        var fullMobileUrl = mobileUrl + '?providerCode=' + priceProviderCode + '&asset=' + assetName;

        return fullMobileUrl;
    }

    FXStreet.Util.EncodeUrl = function (url) {
        url = (url + '')
          .toString();

        // Tilde should be allowed unescaped in future versions of PHP (as reflected below), but if you want to reflect current
        // PHP behavior, you would need to add ".replace(/~/g, '%7E');" to the following.
        return encodeURIComponent(url)
          .replace(/!/g, '%21')
          .replace(/'/g, '%27')
          .replace(/\(/g, '%28')
          .replace(/\)/g, '%29')
          .replace(/\*/g, '%2A')
          .replace(/%20/g, '+');
    }

    FXStreet.Util.Deferreds = {};
    FXStreet.Util.Deferreds.PendingTTChart = [];
}());
(function () {
    FXStreet.Class.Patterns.Observer = {};
    FXStreet.Class.Patterns.Observer.List = function () {
        var parent = FXStreet.Class.Base(),
            _this = FXStreet.Util.extendObject(parent);

        _this.observerList = [];

        _this.add = function (obj) {
            return _this.observerList.push(obj);
        };

        _this.count = function () {
            return _this.observerList.length;
        };

        _this.get = function (index) {
            if (index > -1 && index < this.observerList.length) {
                return this.observerList[index];
            }
            return null;
        };

        _this.indexOf = function (obj, startIndex) {
            var i = startIndex || 0;
            while (i < _this.observerList.length) {
                if (_this.observerList[i] === obj) {
                    return i;
                }
                i++;
            }
            return -1;
        };

        _this.removeAt = function (index) {
            _this.observerList.splice(index, 1);
        };

        return _this;
    };
    FXStreet.Class.Patterns.Observer.Subject = function () {
        var parent = FXStreet.Class.Base(),
            _this = FXStreet.Util.extendObject(parent);

        _this.observers = new FXStreet.Class.Patterns.Observer.List();

        _this.addObserver = function (observer) {
            _this.observers.add(observer);
        };

        _this.removeObserver = function (observer) {
            _this.observers.removeAt(_this.observers.indexOf(observer, 0));
        };

        _this.notify = function (jsonParams) {
            var observerCount = _this.observers.count();
            for (var i = 0; i < observerCount; i++) {
                _this.observers.get(i).update(jsonParams);
            }
        };

        return _this;
    };
    FXStreet.Class.Patterns.Observer.Observer = function () {
        var parent = FXStreet.Class.Base(),
            _this = FXStreet.Util.extendObject(parent);

        _this.UpdateDelegate = null;

        _this.init = function (json) {
            _this.setSettingsByObject(json);
        };

        _this.update = function (jsonParams) {
            if (_this.UpdateDelegate !== null)
                _this.UpdateDelegate(jsonParams);
        };

        return _this;
    };

    FXStreet.Class.Patterns.Singleton = {};
}());
(function () {
    FXStreet.Class.Sidebar = {};
    FXStreet.Class.Sidebar.Util = {};
    FXStreet.Class.Sidebar.ListItemType = {};
    FXStreet.Class.Sidebar.RenderedItemInPage = {};
}());
(function () {
    FXStreet.Class.Patterns.Singleton.AdvertiseManager = (function () {
        var instance;

        var advertiseManager = function () {
            var parent = FXStreet.Class.Base(),
               _this = FXStreet.Util.extendObject(parent);

            var slots = {};
            var googleTag = FXStreet.ExternalLib.GoogleTag;

            _this.init = function (json) {
                _this.setSettingsByObject(json);
            };

            _this.Add = function (groupKey, slot) {
                if (!slots[groupKey]) {
                    slots[groupKey] = [];
                }
                slots[groupKey].push(slot);
            };

            _this.RefreshGroup = function (groupKey) {
                googleTag.pubads().refresh(slots[groupKey]);
            };

            return _this;
        };

        function createInstance() {
            var object = advertiseManager();
            object.init({});
            return object;
        }

        return {
            Instance: function () {
                if (!instance) {
                    instance = createInstance();
                }
                return instance;
            }
        };
    })();

    FXStreet.Class.AdvertiseBase = function () {
        var parent = FXStreet.Class.Base(),
            _this = FXStreet.Util.extendObject(parent);

        // ----- begin json properties -----

        _this.ContainerId = "";
        _this.SlotName = "";
        _this.Labels = [];
        _this.LabelKey = "";
        _this.LabelValue = "";
        _this.Label2Key = "";
        _this.Label2Value = "";
        _this.MobileSize = [];
        _this.TabletSize = [];
        _this.DesktopSize = [];
        _this.DesktopHdSize = [];
        _this.RefreshSeconds = 0;
        _this.Async = false;
        _this.GroupKey = "";

        // ----- end json properties -----

        _this.Container = null;
        _this.GoogleTag = FXStreet.ExternalLib.GoogleTag;
        _this.ResponsiveSeparator = '-';
        _this.Slot = null;

        _this.AdvertiseManagerObj = null;

        _this.MinMobileSize = [0, 0];
        _this.MinTabletSize = [768, 0];
        _this.MinDesktopSize = [1025, 0];
        _this.MinDesktopHdSize = [1480, 0];

        _this.responsiveDesignObj = null;

        _this.init = function (json) {
            _this.setSettingsByObject(json);
            _this.setVars();
            _this.addEvents();
            _this.setAdvertise();
        };

        _this.setVars = function () {
            _this.Container = FXStreet.Util.getjQueryObjectById(_this.ContainerId);
            _this.MobileSize = _this.getSize(_this.MobileSize);
            _this.TabletSize = _this.getSize(_this.TabletSize);
            _this.DesktopSize = _this.getSize(_this.DesktopSize);
            _this.DesktopHdSize = _this.getSize(_this.DesktopHdSize);
            _this.responsiveDesignObj = FXStreet.Util.getObjectInstance("ResponsiveDesign");

            if (_this.LabelKey && _this.LabelValue && !_this.Labels.findFirst(function (item) { return item === _this.LabelKey })) {
                _this.Labels.push({ Key: _this.LabelKey, Value: _this.LabelValue });
            }
            if (_this.Label2Key && _this.Label2Value && !_this.Labels.findFirst(function (item) { return item === _this.Label2Key })) {
                _this.Labels.push({ Key: _this.Label2Key, Value: _this.Label2Value });
            }

            _this.Labels.push({ Key: "url", Value: window.location.hostname + window.location.pathname });

            _this.Async = FXStreet.Global.AsyncDfp;

            _this.AdvertiseManagerObj = FXStreet.Class.Patterns.Singleton.AdvertiseManager.Instance();
        };

        _this.getSize = function (size) {
            var result = [];

            try {
                if (size !== null && size && size.length > 0) {
                    result = $.parseJSON(size);
                }
            } catch (e) {
                console.log('cannot map size: ' + size + ' for advertize: ' + _this.ContainerId);
            }

            return result;
        };

        _this.setAdvertise = function () {
            if (_this.Async) {
                _this.setAdvertiseAsync();
            } else {
                _this.setAdvertiseSync();
            }
        };

        _this.setAdvertiseAsync = function () {
            _this.GoogleTag.cmd.push(function () {
                _this.createSlot();
                if (_this.GroupKey) {
                    _this.AdvertiseManagerObj.Add(_this.GroupKey, _this.Slot);
                }
            });
        };

        _this.setAdvertiseSync = function () {
            _this.createSlot();
        };

        _this.renderAdvertise = function (onAdvertiseRendered) {
            if (_this.Async) {
                _this.renderAdvertiseAsync(onAdvertiseRendered);
            } else {
                _this.renderAdvertiseSync(onAdvertiseRendered);
            }
        };

        _this.renderAdvertiseAsync = function (onAdvertiseRendered) {
            _this.GoogleTag.cmd.push(function () {
                _this.setSlotRenderEndedEvent(onAdvertiseRendered);

                _this.GoogleTag.display(_this.ContainerId);

                _this.refreshAd();

                if (!_this.GroupKey) {
                    if (_this.RefreshSeconds > 0) {
                        setInterval(function () {
                            _this.GoogleTag.pubads().refresh([_this.Slot]);
                        }, _this.RefreshSeconds * 1000);
                    }
                }
            });
        };

        _this.renderAdvertiseSync = function (onAdvertiseRendered) {
            _this.setSlotRenderEndedEvent(onAdvertiseRendered);

            _this.GoogleTag.pubads().enableSyncRendering();
            _this.GoogleTag.enableServices();
            _this.GoogleTag.display(_this.ContainerId);
        };

        _this.setSlotRenderEndedEvent = function (delegate) {
            if (typeof delegate === 'function') {
                _this.GoogleTag.pubads().addEventListener('slotRenderEnded', delegate);
            }
        }

        _this.createSlot = function () {
            _this.Slot = _this.GoogleTag.defineSlot(_this.SlotName, [], _this.ContainerId);
            if (_this.Slot) {
                _this.Slot.ContainerId = _this.ContainerId;
                _this.Slot.addService(_this.GoogleTag.pubads());
                _this.setTargeting();
                _this.setResponsive();
            } else {
                console.warn('Cannot be created the ad in the container ' + _this.ContainerId);
            }
        };

        _this.setTargeting = function () {
            _this.Labels.forEach(function (label) {
                if (label.Key && label.Value) {
                    _this.Slot.setTargeting(label.Key, label.Value);
                }
            });

        };

        _this.setResponsive = function () {
            var mapping;

            mapping = _this.GoogleTag.sizeMapping().
            addSize(_this.MinMobileSize, _this.MobileSize)
            .addSize(_this.MinTabletSize, _this.TabletSize)
            .addSize(_this.MinDesktopSize, _this.DesktopSize)
            .addSize(_this.MinDesktopHdSize, _this.DesktopHdSize)
            .build();

            _this.Slot.defineSizeMapping(mapping);
        };

        _this.containerOuterHtml = function () {
            return _this.Container[0].outerHTML;
        };

        _this.addEvents = function () {
            if (_this.responsiveDesignObj) {
                _this.responsiveDesignObj.whenWindowResizesToMobile(_this.refreshAd);
                _this.responsiveDesignObj.whenWindowResizesToTablet(_this.refreshAd);
                _this.responsiveDesignObj.whenWindowResizesToDesktop(_this.refreshAd);
                _this.responsiveDesignObj.whenWindowResizesToDesktopHD(_this.refreshAd);
            }
        };

        _this.refreshAd = function () {
            if (_this.GroupKey) {
                _this.AdvertiseManagerObj.RefreshGroup(_this.GroupKey);
            } else {
                _this.GoogleTag.pubads().refresh([_this.Slot]);
            }
        };

        return _this;
    };
    FXStreet.Class.AdvertiseNormal = function () {
        var parent = FXStreet.Class.AdvertiseBase(),
            _this = FXStreet.Util.extendObject(parent);

        _this.init = function (json) {
            parent.init(json);
            _this.renderAdvertise();
        };

        return _this;
    };

    FXStreet.Class.AdvertisePopup = function () {
        var parent = FXStreet.Class.AdvertiseBase(),
            _this = FXStreet.Util.extendObject(parent);

        _this.PopupShowIntervalInMinutes = 0;
        _this.CookieGroup = "";
        _this.IsRendered = false;
        _this.CookieName = "";
        _this.MobileCookieName = "";

        _this.init = function (json) {
            _this.setSettingsByObject(json);
            _this.setVars();
            if (!$.cookie(_this.CookieName)) {
                parent.init(json);
                if (_this.responsiveDesignObj.IsMobile()) {
                    if (!$.cookie(_this.MobileCookieName)) {
                        document.addEventListener("click", showAdvertisePopUpOnClick);
                    } else {
                        _this.renderAdvertise(_this.onAdvertiseRendered);
                    }
                } else {
                    _this.renderAdvertise(_this.onAdvertiseRendered);
                }
            }
        };

        function showAdvertisePopUpOnClick() {
            _this.setMobileCookie();
            document.removeEventListener("click", showAdvertisePopUpOnClick); 
        }

        _this.setVars = function () {
            _this.CookieName = 'PopupAd_' + _this.CookieGroup;
            _this.MobileCookieName = 'PopupMobileAd_' + _this.CookieGroup;
        };

        _this.createPopup = function () {
            var popupHtml = '<div class="fxs_modal_wrap modal"><button type="button" class="fxs_modal_close fxs_btn_icon fxs_btn_functional close" data-dismiss="modal" aria-label="Close Modal"><i class="fa fa-times"></i><span class="fxs_skip">Close Modal</span></button><div class="fxs_modal_content fxs_modal_roadblock_sponsor"><div class="fxs_detail"><a href="link sponsor" title="sponsor name"><advertise /></a></div></div></div>';
            var popup = $(popupHtml);
            $('body').append(popup);
            var advertise = popup.find('advertise');
            advertise.replaceWith(_this.Container);
            popup.modal('show');
        }

        _this.onAdvertiseRendered = function (e) {
            if (e.slot.ContainerId !== _this.ContainerId || _this.IsRendered) {
                return;
            }

            if (e.isEmpty) {
                _this.Container.hide();
            } else {
                _this.IsRendered = true;
                _this.setCookie();
                _this.createPopup();
                _this.refreshAd();
                _this.removeMobileCookie();
            }
        };

        _this.setCookie = function () {
            var cacheExpirationInDays = _this.PopupShowIntervalInMinutes / 24 / 60;
            $.cookie(_this.CookieName, true, { expires: cacheExpirationInDays, path: '/' });
        }

        _this.setMobileCookie = function () {
            var cacheExpirationInDays = _this.PopupShowIntervalInMinutes / 24 / 60;
            $.cookie(_this.MobileCookieName, true, { expires: cacheExpirationInDays, path: '/' });
        }

        _this.removeMobileCookie = function () {
            $.removeCookie(_this.MobileCookieName, { path: '/' });
        }

        return _this;
    };

}());

(function () {
    FXStreet.Class.Alert = function () {
        var parent = FXStreet.Class.Base(),
        _this = FXStreet.Util.extendObject(parent);

        _this.ContainerId = "";
        _this.Container = null;
        _this.Summary = "";
        _this.IsWide = false;
        _this.Title = "";
        _this.HtmlTemplateFile = "staticalert_default.html";
        _this.AlertType = "";

        _this.init = function (json) {
            _this.setSettingsByObject(json);
            _this.setVars();
            _this.render();
        };

        _this.setVars = function () {
            _this.Container = FXStreet.Util.getjQueryObjectById(_this.ContainerId);
        };

        _this.render = function () {
            var jsonData = {
                CssSuffix: _this.AlertType.toLowerCase(),
                Title: _this.Title,
                Summary: _this.Summary,
                IsWide: _this.IsWide
            };

            _this.htmlRender(jsonData);
        };

        _this.htmlRender = function (jsonData) {
            FXStreet.Util.loadHtmlTemplate(_this.HtmlTemplateFile).done(function (template) {
                var rendered = FXStreet.Util.renderByHtmlTemplate(template, jsonData);
                _this.Container.html(rendered);
                _this.Container.find(".fxs_close").on('click', function () {
                    _this.Container.hide();
                });
            });
        };

        return _this;
    };
}());
(function () {
    FXStreet.Class.Analytics = {};

    FXStreet.Class.Analytics.Base = function () {
        var parent = FXStreet.Class.Base(),
        _this = FXStreet.Util.extendObject(parent);

        _this.updateDinamicLayer = function (html, dataLayerElement, byScroll) {
            var imageInformation = extractImagesInformation(html);
            var widgetInformation = extractWidgetInformation(html);
            var videoInformation = extractVideoInformation(html);
            var alertInformation = extractAlertInformation(html);

            dataLayerElement['images-title'] = imageInformation.titles;
            dataLayerElement['images-count'] = imageInformation.imageCount;
            dataLayerElement['widget-names'] = widgetInformation.widgetNames;
            dataLayerElement['widget-count'] = widgetInformation.widgetCount;
            dataLayerElement['videos-count'] = videoInformation.videoCount;
            dataLayerElement['videos-title'] = videoInformation.videoNames;
            dataLayerElement['alert'] = alertInformation.titles;
            dataLayerElement['byScroll'] = byScroll;
            dataLayerElement['event'] = 'page-item';
           
            var tagManager = FXStreet.Class.Patterns.Singleton.TagManager.Instance();
            tagManager.Push(dataLayerElement);
        };

        var getRemovePosition = function () {

            for (var i = 0, iLen = dataLayer.length; i < iLen; i++) {

                if (dataLayer[i].Id !== undefined && dataLayer[i].element.Id != null && dataLayer[i].element.Id.indexOf("fxs_") > -1)
                    return i;

            }

        };

        var extractImagesInformation = function (html) {

            var imageInformation = {};
            var images = $(html).find('img');

            imageInformation.titles = getImageTitles(images);
            imageInformation.imageCount = images.length.toString();

            return imageInformation;
        };

        var extractWidgetInformation = function (html) {

            var widgetInformation = {};
            var widgets = $(html).find("div[fxs_widget]");
            var widgetsSitefinity = $(html).find("div[fxs_sf_widget]");

            var allWidgets = $.merge($.merge([], widgets), widgetsSitefinity);
            widgetInformation.widgetNames = getWidgetNames(allWidgets);
            widgetInformation.widgetCount = allWidgets.length.toString();

            return widgetInformation;

        };

        var extractVideoInformation = function (html) {
            var videoInformation = {};
            var iframes = $(html).find('iframe');
            var videos = 0;
            for (i = 0; i < iframes.length; i++) {
                var hit = $(html).find('iframe')[i].outerHTML.search("youtu(?:\.be|be\.com)/(?:.*v(?:/|=)|(?:.*/)?)([a-zA-Z0-9-_]+)");
                if (hit > -1) {
                    videos++;
                }

            }

            videoInformation.videoCount = videos.toString();

            return videoInformation;
        };

        var extractAlertInformation = function (html) {
            var alertInformation = {};
            alertInformation.titles = [];

            var alerts = $('.fxs_alertText');

            for (i = 0; i < alerts.length; i++) {
                var alert = FXStreet.Util.getInnerText(alerts[i])
                alertInformation.titles.push(alert);
            }

            return alertInformation.titles.join();
        };

        var getImageTitles = function (images) {

            var imageTitles = [];

            for (i = 0; i < images.length; i++) {
                var lastIndexSlash = $(images[i]).prop('src').lastIndexOf("/");
                var lastIndexDot = $(images[i]).prop('src').lastIndexOf(".");
                var imageName = $(images[i]).prop('src').substring(lastIndexSlash + 1, lastIndexDot);
                imageTitles.push(imageName);

            }
            return imageTitles.join();
        };

        var getWidgetNames = function (widgets) {

            var widgetsNames = [];
            for (i = 0; i < widgets.length; i++) {

                var name = $(widgets[i]).attr("fxs_name");
                widgetsNames.push(name);

            }

            return widgetsNames;

        };

        return _this;
    };
    FXStreet.Class.Analytics.PostHome = function () {

        var parent = FXStreet.Class.Analytics.Base(),
          _this = FXStreet.Util.extendObject(parent);
        
        var getWordCount = function (text) {
            return text.countWords();
        }

        var extractBasicInformation = function (html) {
            var basicInformation = {};
            basicInformation.wordcount = getWordCount(FXStreet.Util.getInnerText(html));
            return basicInformation;
        };

        _this.updateDinamicLayer = function (html) {
            var basicInformation = extractBasicInformation(html);

            var dataLayerElement = {
                "Id": "fxs_home",
                "title": document.title,
                "wordcount": basicInformation.wordcount,
            };

            parent.updateDinamicLayer(html, dataLayerElement);
        }

        return _this;
    };
    FXStreet.Class.Analytics.PostNews = function () {
        var parent = FXStreet.Class.Analytics.Base(),
            _this = FXStreet.Util.extendObject(parent);

        var getCategoryNames = function (tags) {

            var names = tags.map(function (a) { return a.Name; });
            return names.join();

        }

        _this.extractBasicInformation = function (post) {

            var basicInformation = {};

            basicInformation.name = post.SEO.MetaTitle;
            basicInformation.title = post.Title;
            basicInformation.author = post.Author ? post.Author.Name : "";
            basicInformation.company = post.Company ? post.Company.Name : "";
            basicInformation.tags = post.Categories ? getCategoryNames(post.Categories) : "";
            basicInformation.wordcount = post.WordCount ? post.WordCount.toString() : "0";
            basicInformation.titleCount = post.Title.countWords();
            basicInformation.datePublished = post.PublicationDate;
            basicInformation.feedId = post.FeedId;

            return basicInformation;
        };

        return _this;
    };
    FXStreet.Class.Analytics.News = function () {
        var parent = FXStreet.Class.Analytics.PostNews(),
            _this = FXStreet.Util.extendObject(parent);

        _this.updateDinamicLayer = function (html, post, byScroll) {
            var basicInformation = _this.extractBasicInformation(post);

            var dataLayerElement = {
                'Id': "fxs_news",
                'name': basicInformation.name,
                'title': basicInformation.title,
                'author': basicInformation.author,
                'company': basicInformation.company,
                'wordcount': basicInformation.wordcount,
                'tags': basicInformation.tags,
                'title-count': basicInformation.titleCount,
                'datePublished': basicInformation.datePublished
            };

            parent.updateDinamicLayer(html, dataLayerElement, byScroll);
        };

        return _this;
    };
    FXStreet.Class.Analytics.Analysis = function () {
        var parent = FXStreet.Class.Analytics.PostNews(),
            _this = FXStreet.Util.extendObject(parent);

        _this.updateDinamicLayer = function (html, post, byScroll) {
            var basicInformation = _this.extractBasicInformation(post);

            var dataLayerElement = {
                'Id': "fxs_analysis",
                'name': basicInformation.name,
                'title': basicInformation.title,
                'author': basicInformation.author,
                'company': basicInformation.company,
                'wordcount': basicInformation.wordcount,
                'tags': basicInformation.tags,
                'title-count': basicInformation.titleCount,
                'datePublished': basicInformation.datePublished
            };

            parent.updateDinamicLayer(html, dataLayerElement, byScroll);
        };

        return _this;
    };
    FXStreet.Class.Analytics.Education = function () {
        var parent = FXStreet.Class.Analytics.PostNews(),
            _this = FXStreet.Util.extendObject(parent);

        _this.updateDinamicLayer = function (html, post, byScroll) {
            var basicInformation = _this.extractBasicInformation(post);

            var dataLayerElement = {
                'Id': "fxs_education",
                'name': basicInformation.name,
                'title': basicInformation.title,
                'author': basicInformation.author,
                'company': basicInformation.company,
                'wordcount': basicInformation.wordcount,
                'tags': basicInformation.tags,
                'title-count': basicInformation.titleCount,
                'datePublished': basicInformation.datePublished
            };

            parent.updateDinamicLayer(html, dataLayerElement, byScroll);
        };

        return _this;
    };
    FXStreet.Class.Analytics.RatesAndCharts = function () {

        var parent = FXStreet.Class.Analytics.Base(),
        _this = FXStreet.Util.extendObject(parent);

        var extractBasicInformation = function (item) {

            var basicInformation = {};

            basicInformation.name = item.SEO.MetaTitle;
            basicInformation.title = item.Title;
            basicInformation.author = item.Author ? item.Author.Name : "";
            basicInformation.company = item.Company ? item.Company.Name : "";
            basicInformation.tags = item.Categories;
            basicInformation.wordcount = item.WordCount;
            basicInformation.titleCount = item.Title.countWords();
            basicInformation.datePublished = item.PublicationDate;

            return basicInformation;
        };

        _this.updateDinamicLayer = function (html, item) {
            var basicInformation = extractBasicInformation(item);

            var dataLayerElement = {
                'Id': "fxs_post",
                'name': basicInformation.name,
                'title': basicInformation.title,
                'author': basicInformation.author,
                'company': basicInformation.company,
                'wordcount': basicInformation.wordcount,
                'tags': basicInformation.tags,
                'title-count': basicInformation.titleCount,
                'datePublished': basicInformation.datePublished
            };

            parent.updateDinamicLayer(html, dataLayerElement);
        };

        return _this;
    };
    FXStreet.Class.Analytics.HomeBroker = function () {

        var parent = FXStreet.Class.Analytics.Base(),
        _this = FXStreet.Util.extendObject(parent);

        var extractBasicInformation = function (item) {
            var basicInformation = {};

            //basicInformation.name = item.SEO.MetaTitle;
            //basicInformation.title = item.Title;
            //basicInformation.author = item.Author ? item.Author.Name : "";
            //basicInformation.company = item.Company ? item.Company.Name : "";
            //basicInformation.tags = item.Categories;
            //basicInformation.wordcount = item.WordCount;
            //basicInformation.titleCount = item.Title.countWords();
            //basicInformation.datePublished = item.PublicationDate;

            return basicInformation;
        };

        _this.updateDinamicLayer = function (html, item) {
            // TODO
            var basicInformation = extractBasicInformation(item);

            var dataLayerElement = {
            };

            parent.updateDinamicLayer(html, dataLayerElement);
        };

        return _this;
    };
    FXStreet.Class.Analytics.Brokers = function () {

        var parent = FXStreet.Class.Analytics.Base(),
        _this = FXStreet.Util.extendObject(parent);

        var extractBasicInformation = function (item) {
            var basicInformation = {};

            //basicInformation.name = item.SEO.MetaTitle;
            //basicInformation.title = item.Title;
            //basicInformation.author = item.Author ? item.Author.Name : "";
            //basicInformation.company = item.Company ? item.Company.Name : "";
            //basicInformation.tags = item.Categories;
            //basicInformation.wordcount = item.WordCount;
            //basicInformation.titleCount = item.Title.countWords();
            //basicInformation.datePublished = item.PublicationDate;

            return basicInformation;
        };

        _this.updateDinamicLayer = function (html, item) {
            // TODO
            var basicInformation = extractBasicInformation(item);

            var dataLayerElement = {
            };

            parent.updateDinamicLayer(html, dataLayerElement);
        };

        return _this;
    };
    FXStreet.Class.Analytics.Videos = function () {
        var parent = FXStreet.Class.Analytics.PostNews(),
            _this = FXStreet.Util.extendObject(parent);

        _this.updateDinamicLayer = function (html, post, byScroll) {
            var basicInformation = _this.extractBasicInformation(post);

            var dataLayerElement = {
                'Id': "fxs_videos",
                'name': basicInformation.name,
                'title': basicInformation.title,
                'author': basicInformation.author,
                'company': basicInformation.company,
                'wordcount': basicInformation.wordcount,
                'tags': basicInformation.tags,
                'title-count': basicInformation.titleCount,
                'datePublished': basicInformation.datePublished
            };

            parent.updateDinamicLayer(html, dataLayerElement, byScroll);
        };

        return _this;
    };

    FXStreet.Class.HomeAndTopicsAnalytics = function () {
        var parent = FXStreet.Class.Analytics.Base(),
        _this = FXStreet.Util.extendObject(parent);

        _this.Content = null;

        _this.init = function () {
            _this.setVars();
            _this.updateDinamicLayer();
        }

        _this.setVars = function() {
            _this.Content = $('main');
        };

        var extractBasicInformation = function () {
            var basicInformation = {};

            basicInformation.name = document.title;
            basicInformation.title = document.title;

            var text = FXStreet.Util.getInnerText(_this.Content[0]);
            var words = text.match(/\S+/g);
            basicInformation.wordcount = words ? words.length : 0;
            basicInformation.titleCount = document.title.countWords();
            //basicInformation.author = item.Author ? item.Author.Name : "";
            //basicInformation.company = item.Company ? item.Company.Name : "";
            //basicInformation.tags = item.Categories;
            //basicInformation.datePublished = item.PublicationDate;

            return basicInformation;
        };

        _this.updateDinamicLayer = function () {
            var basicInformation = extractBasicInformation();

            var dataLayerElement = {
                "wordcount": basicInformation.wordcount
            };

            var html = _this.Content.html();
            parent.updateDinamicLayer(html, dataLayerElement);
        };

        return _this;
    };
})();

(function () {
    FXStreet.Class.AuthorDetailManager = function () {
        var parent = FXStreet.Class.Base(),
             _this = FXStreet.Util.extendObject(parent);

        _this.ContainerId = "";
        _this.Author = {};
        _this.Translations = {};
        _this.UserInfo = {};

        _this.HtmlTemplateFile = "authordetails_default.html";
        _this.Container = null;

        _this.init = function (json) {
            _this.setSettingsByObject(json);
            _this.setVars();
            _this.render();
        };

        _this.setVars = function () {
            _this.Container = FXStreet.Util.getjQueryObjectById(_this.ContainerId);
        };

        _this.render = function () {
            var jsonData =
                {
                    Value: _this.Author,
                    Translations: _this.Translations
                };

            FXStreet.Util.loadHtmlTemplate(_this.HtmlTemplateFile).done(function (template) {
                var rendered = FXStreet.Util.renderByHtmlTemplate(template, jsonData);
                _this.Container.html(rendered);
                _this.loadHtmlTemplateSuccessComplete(_this.Author);
            });
        };

        _this.loadHtmlTemplateSuccessComplete = function (authorData) {
            if (authorData.HasSocialMedias) {
                _this.initSocialMediaWidget(authorData);
            }
            _this.initFilteredPostsWidget(authorData);
            _this.initAuthorFollowController(authorData);
        };

        _this.initSocialMediaWidget = function (authorData) {
            var jsonSocialMediaBar = {
                ContainerId: "fxs_socialmedia_bar_" + authorData.Id,
                SocialMediaBarData: authorData.SocialMedias
            };
            FXStreet.Util.createObject("SocialMediaBarProfile", jsonSocialMediaBar);
        };

        _this.initFilteredPostsWidget = function (authorData) {
            var jsonFilteredPosts = {
                ContainerId: "fxs_filtered_posts_" + authorData.Id,
                AuthorId: authorData.Id,
                Take: 10
            }
            FXStreet.Util.createObject("FilteredPostsManager", jsonFilteredPosts);
        };

        _this.initAuthorFollowController = function (authorData) {
            var json = {
                UserInfo: _this.UserInfo,
                Author: authorData,
                FollowButtonId: "fxs_cta_authorfollow_" + authorData.Id,
                FollowingMessageBoxId: "fxs_alert_author_follow",
                UnFollowingMessageBoxId: "fxs_alert_author_unfollow"
            }
            FXStreet.Util.createObject("AuthorFollow", json);
        };

        return _this;

    };
}());
(function () {
    FXStreet.Class.AuthorFollow = function () {
        var parent = FXStreet.Class.Base(),
            _this = FXStreet.Util.extendObject(parent);

        _this.UserInfo = null;
        _this.Author = {};
        _this.FollowButtonId = "";
        _this.FollowingMessageBoxId = "";
        _this.UnFollowingMessageBoxId = "";

        _this.FollowButton = null;
        _this.FollowingMessageBox = null;
        _this.UnFollowingMessageBox = null;

        var followingClass = "active";
        var hideAlertClass = "fxs_hideElements";
        var isLogginRequired = false;

        _this.init = function (json) {
            _this.setSettingsByObject(json);
            _this.setVars();
            if (_this.UserInfo.Personalization) {
                _this.addEvents();
                _this.render();
            }
        };

        _this.setVars = function () {
            _this.FollowButton = FXStreet.Util.getjQueryObjectById(_this.FollowButtonId, false);
            if (_this.FollowButton != null && _this.FollowButton.length > 0) {
                _this.FollowButton.on("click", _this.followEvent);
            }
            isLogginRequired = !_this.UserInfo.IsLogged;
            if (_this.FollowingMessageBox && _this.UnFollowingMessageBox) {
                _this.FollowingMessageBox = FXStreet.Util.getjQueryObjectById(_this.FollowingMessageBoxId, false);
                _this.UnFollowingMessageBox = FXStreet.Util.getjQueryObjectById(_this.UnFollowingMessageBoxId, false);
            }    
        };

        _this.addEvents = function () {
            if (_this.FollowButton != null && _this.FollowButton.length > 0) {
                _this.FollowButton.unbind("click").on("click", _this.followEvent);
            }
        };

        _this.render = function () {
            if (_this.FollowButton != null && _this.FollowButton.length > 0) {
                if (_this.UserInfo.Personalization && _this.UserInfo.Personalization.AuthorsFollowing) {
                    var authorExist = $.grep(_this.UserInfo.Personalization.AuthorsFollowing, function (author) {
                        return author.AuthorId === _this.Author.Id;
                    });
                    if (authorExist.length > 0) {
                        _this.FollowButton.addClass(followingClass);
                    } else {
                        _this.FollowButton.removeClass(followingClass);
                    }
                }
                if (_this.UserInfo.Personalization && _this.UserInfo.Personalization.Authors) {
                    var authorExist = $.grep(_this.UserInfo.Personalization.Authors, function (author) {
                        return author.Author.Id === _this.Author.Id;
                    });
                    if (authorExist.length > 0) {
                        _this.FollowButton.addClass(followingClass);
                    } else {
                        _this.FollowButton.removeClass(followingClass);
                    }
                }
            }
        };

        _this.followEvent = function (e) {
            if (isLogginRequired) {
                var userMenu = FXStreet.Util.getObjectInstance("UserMenu");
                if (userMenu == null) {
                    return;
                }
                userMenu.Login();
            }
            else {
                if ($(e.currentTarget).hasClass(followingClass)) {
                    _this.UnFollow();
                } else {
                    _this.Follow();
                }
                _this.render();
                _this.ShowAlert();
            }
        };

        _this.SendToEventHub = function (type) {
            var data = {
                "AuthorId": _this.Author.Id,
                "LanguageId": FXStreet.Resource.LanguageId
            };

            var tagManager = FXStreet.Class.Patterns.Singleton.TagManager.Instance();
            tagManager.PushToEventhub(data, type);
        };

        _this.ShowAlert = function () {
            if (_this.FollowingMessageBox && _this.UnFollowingMessageBox) {
                $(_this.FollowingMessageBox).addClass(hideAlertClass);
                $(_this.UnFollowingMessageBox).addClass(hideAlertClass);

                if (_this.FollowButton.hasClass(followingClass)) {
                    $(_this.FollowingMessageBox).removeClass(hideAlertClass);
                } else {
                    $(_this.UnFollowingMessageBox).removeClass(hideAlertClass);
                }
            }
        };

        _this.Follow = function () {
            if (_this.UserInfo.Personalization && _this.UserInfo.Personalization.AuthorsFollowing) {
                _this.UserInfo.Personalization.AuthorsFollowing.push({ AuthorId: _this.Author.Id });
            }
            if (_this.UserInfo.Personalization && _this.UserInfo.Personalization.Authors) {
                _this.UserInfo.Personalization.Authors.push({ Author: _this.Author });
            }
            _this.SendToEventHub("AuthorFollow");
        };

        _this.UnFollow = function () {
            if (_this.UserInfo.Personalization && _this.UserInfo.Personalization.AuthorsFollowing) {
                var index = -1;
                var authorExist = $.grep(_this.UserInfo.Personalization.AuthorsFollowing, function (author, pos) {
                    if (author.AuthorId === _this.Author.Id)
                        index = pos;
                    return author.AuthorId === _this.Author.Id;
                });
                if (authorExist.length > 0) {
                    _this.UserInfo.Personalization.AuthorsFollowing.splice(index, 1);
                }
            }
            if (_this.UserInfo.Personalization && _this.UserInfo.Personalization.Authors) {
                var index = -1;
                var authorExist = $.grep(_this.UserInfo.Personalization.Authors, function (author, pos) {
                    if (author.Author.Id === _this.Author.Id)
                        index = pos;
                    return author.Author.Id === _this.Author.Id;
                });
                if (authorExist.length > 0) {
                    _this.UserInfo.Personalization.Authors.splice(index, 1);
                }
            }
            _this.SendToEventHub("AuthorUnFollow");
        };



        return _this;
    };
}());
(function () {
    FXStreet.Class.Patterns.Singleton.Authorization = (function () {
        var instance;

        var authorization = function () {
            var tokenPromise;
            var token;

            this.getTokenPromise = function () {
                if (token) {
                    return $.when(token);
                }
                else {
                    if (!tokenPromise) {
                        var url = FXStreet.Resource.AuthorizationUrl || "https://authorization.fxstreet.com/token";
                        tokenPromise = $.ajax({
                            type: "POST",
                            url: url,
                            contentType: "application/x-www-form-urlencoded",
                            dataType: "json",
                            data: {
                                grant_type: "domain",
                                client_id: "client_id"
                            }
                        }).then(function (data) {
                            token = data;
                            tokenPromise = null;
                            return token;
                        }, function (error) {
                            tokenPromise = null;
                            console.log(error);
                        });
                    }
                    return tokenPromise;
                }
            };
        };

        return {
            Instance: function () {
                if (!instance) {
                    instance = new authorization();
                }
                return instance;
            }
        };
    })();
}());
(function () {
    /*
    Name: 
    Base
    Param:
    None
    Return: 
    An instance of Base Class
    Functionality:
    This is the base class that most objects inherit from
    */
    FXStreet.Class.Base = function () {
        var thisBase = this;

        thisBase.init = FXStreet.Class.Base.prototype.init;
        thisBase.setSettingsByObject = FXStreet.Class.Base.prototype.setSettingsByObject;
        thisBase.addEvents = FXStreet.Class.Base.prototype.addEvents;
        thisBase.setVars = FXStreet.Class.Base.prototype.setVars;

        return thisBase;
    };
    FXStreet.Class.Base.prototype.init = function (json) {
        this.setSettingsByObject(json);
    };
    FXStreet.Class.Base.prototype.setSettingsByObject = function (json) {
        for (var propName in json) {
            if (json.hasOwnProperty(propName)) {
                if (this[propName] !== undefined) {
                    this[propName] = json[propName];
                }
            }
        }
    };
    FXStreet.Class.Base.prototype.addEvents = function () { };
    FXStreet.Class.Base.prototype.setVars = function () { };
}());
(function () {
    FXStreet.Class.BrokerCallMe = function () {
        var parent = FXStreet.Class.Base(),
            _this = FXStreet.Util.extendObject(parent);

        _this.BrokerId = "";
       
        _this.Container = null;
        _this.CallMeBtn = null;
        _this.FirstSlide = null;
        _this.SecondSlide = null;
        _this.FirstSlideNextBtn = null;
        _this.SecondSlideCallMeBtn = null;

        _this.FullNameInput = null;
        _this.CountrySelect = null;
        _this.PhoneCodeInput = null;
        _this.PhoneInput = null;

        _this.ErrorDiv = null;
        _this.ErrorDivLabel = null;
        _this.SuccessDiv = null;
        _this.SuccessDivLabel = null;
        _this.ReCaptchaDiv = null;

        _this.ErrorMessageFullNameNotValid = "";
        _this.ErrorMessagePhoneNumberNotValid = "";
        
        _this.CallMeData = {};

        _this.init = function (json) {
            _this.setSettingsByObject(json);
            _this.setVars();
            _this.addEvents();
            recaptchaInit();
        };

        _this.setVars = function () {
            _this.Container = $("#" + _this.BrokerId);
            _this.CallMeBtn = _this.Container.find('.fxs_btn_content_toggle_collapse');
            _this.FirstSlide = _this.Container.find('.fxs_contact_broker_slide').eq(0);
            _this.SecondSlide = _this.Container.find('.fxs_contact_broker_slide').eq(1);
            _this.FirstSlideNextBtn = _this.FirstSlide.find('button');
            _this.SecondSlideCallMeBtn = _this.SecondSlide.find('button');

            _this.FullNameInput = _this.Container.find("#fullname-" + _this.BrokerId);
            _this.CountrySelect = _this.Container.find("#select-" + _this.BrokerId);
            _this.PhoneCodeInput = _this.Container.find("#phone-code-" + _this.BrokerId);
            _this.PhoneInput = _this.Container.find("#phone-" + _this.BrokerId);

            _this.ErrorDiv = _this.Container.find("#error-" + _this.BrokerId);
            _this.ErrorDivLabel = _this.ErrorDiv.find("p");
            _this.SuccessDiv = _this.Container.find("#success-" + _this.BrokerId);
            _this.SuccessDivLabel = _this.SuccessDiv.find("span");
            _this.ReCaptchaDiv = _this.Container.find("#recaptcha-" + _this.BrokerId);

            $('[data-toggle="tooltip"]').tooltip();
            _this.CallMeBtn.addClass('collapsed');

            var translations = FXStreet.Resource.Translations['Sidebar_FilterAndList'];
            _this.ErrorMessageFullNameNotValid = translations.CallMeFormErrorEnterValidFullName;
            _this.ErrorMessagePhoneNumberNotValid = translations.CallMeFormErrorEnterValidPhoneNumber;
            _this.ErrorMessageInvalidCaptcha = translations.ErrorCaptchaAlert;

            _this.resetData();
            _this.countrySelectChange();
        };

        _this.addEvents = function () {
            _this.CallMeBtn.click(_this.callMeBtnClick);
            _this.FirstSlideNextBtn.click(_this.firstSlideBtnClick);
            _this.SecondSlideCallMeBtn.click(_this.secondSlideBtnClick);
            _this.CountrySelect.change(_this.countrySelectChange);
        };

        _this.callMeBtnClick = function () {           
            _this.FirstSlide.addClass("active");
            _this.SecondSlide.removeClass("active");
            recaptchaExecute();
        };

        var recaptchaExecute = function () {
            _this.Recaptcha.Execute();
        }

        _this.firstSlideBtnClick = function () {
            _this.hideErrorMessage();

            var fullName = _this.FullNameInput.val();
            if (!_this.validateFullName(fullName)) {
                _this.showErrorMessage(_this.ErrorMessageFullNameNotValid);
                return;
            }

            _this.CallMeData.UserName = fullName;

            _this.FirstSlide.removeClass("active");
            _this.SecondSlide.addClass("active");
        };

        _this.secondSlideBtnClick = function () {
            _this.hideErrorMessage();
            if (!_this.Recaptcha.GetResponse()) {
                _this.showErrorMessage(_this.ErrorMessageInvalidCaptcha);
                return;
            }
           
            var phone = _this.PhoneInput.val();
            if (!_this.validatePhoneNumber(phone)) {
                _this.showErrorMessage(_this.ErrorMessagePhoneNumberNotValid);
                return;
            }

            _this.CallMeData.PhoneNumber = phone;
            _this.CallMeData.PhoneCode = _this.PhoneCodeInput.text();
            _this.CallMeData.CountryName = _this.CountrySelect.find("option:selected").text();

            _this.postData();
        };

        _this.countrySelectChange = function () {
            var phoneCode = "(+" + _this.CountrySelect.find("option:selected").val() + ")";
            _this.PhoneCodeInput.text(phoneCode);
        };
 

      var recaptchaInit = function () {
            var data = {
                ContainerId: 'recaptcha-' + _this.BrokerId,
                Config: {
                    Callback: _this.recaptchaCallback
                }
            }
            _this.Recaptcha = new FXStreet.Class.Recaptcha();
            _this.Recaptcha.init(data);
        };

        _this.recaptchaCallback = function () {
            _this.SecondSlideCallMeBtn.prop('disabled', false);
        };
        
        _this.postData = function () {
            $.ajax({
                type: "POST",
                url: FXStreet.Resource.FxsApiRoutes["BrokerCallMe"],
                data: JSON.stringify(_this.CallMeData),
                contentType: "application/json; charset=utf-8",
                dataType: "json"
            }).done(_this.postDataSuccess)
            .error(_this.postDataError);
        };

        _this.postDataSuccess = function () {
            _this.push();
            _this.resetData();
            _this.CallMeBtn.hide();
            _this.showSuccess();
            _this.Recaptcha.Reset();
        };

        _this.push = function () {
            var tagManager = FXStreet.Class.Patterns.Singleton.TagManager.Instance();
            tagManager.PushToEventhub(_this.CallMeData, "BrokerCallMe");
        };

        _this.postDataError = function (jqXHR, exception) {
            var msg = '';
            if (jqXHR.status === 0) {
                msg = 'Not connect.\n Verify Network.';
            } else if (jqXHR.status == 404) {
                msg = 'Requested page not found. [404]';
            } else if (jqXHR.status == 500) {
                msg = 'Internal Server Error [500].';
            } else if (exception === 'parsererror') {
                msg = 'Requested JSON parse failed.';
            } else if (exception === 'timeout') {
                msg = 'Time out error.';
            } else if (exception === 'abort') {
                msg = 'Ajax request aborted.';
            } else {
                msg = 'Uncaught Error.\n' + jqXHR.responseText;
            }
            _this.showErrorMessage(msg);
        };

        _this.resetData = function () {
            _this.CallMeData = {
                "Culture": FXStreet.Resource.CultureName,
                "BrokerId": _this.BrokerId,
                "UserName": "",
                "CountryName":  "",
                "PhoneCode": "",
                "PhoneNumber": ""
            };

            _this.FirstSlide.removeClass("active");
            _this.SecondSlide.removeClass("active");
            _this.FullNameInput.val('');
            _this.hideErrorMessage();
            _this.hideSuccess();
        };

        _this.validateFullName = function(fullName) {
            return /^[a-z ,.'-]+$/i.test(fullName);
        };

        _this.validatePhoneNumber = function (phone) {
            return phone.match('[0-9\-\(\)\s]+');
        };

        _this.showErrorMessage = function (message) {
            _this.ErrorDiv.show();
            _this.ErrorDivLabel.text(message);
        };

        _this.hideErrorMessage = function () {
            _this.ErrorDiv.hide();
            _this.ErrorDivLabel.text('');
        };
        
        _this.showSuccess = function () {
            _this.SuccessDiv.show();
        };

        _this.hideSuccess = function () {
            _this.SuccessDiv.hide();
        };

        return _this;
    };
}());
(function () {
    FXStreet.Class.BrokerDetails = function () {
        var parent = FXStreet.Class.Base(),
            _this = FXStreet.Util.extendObject(parent);

        _this.Broker = null;
        _this.Pairs = [];
        _this.SpreadsHtmlTemplateFile = "";
        _this.SpreadsContainerId = "";

        _this.Container = null;
        
        _this.init = function (json) {
            _this.setSettingsByObject(json);
            _this.setVars();
            _this.render();
        };

        _this.setVars = function () {
            _this.Container = $("#" + _this.Broker.Id);
            _this.SpreadsContainerId = "fxs-spreads-" + _this.Broker.Id;
        };

        _this.render = function () {
            if (_this.Broker.NotAllowedInSession) {
                _this.disableLinks();
            } else {
                _this.initBrokersSpreads();
            }

            _this.initBrokerCallMe();
        };

        _this.disableLinks = function () {
            var links = _this.Container.find('a');
            $.each(links, function (i, item) {
                $(item).attr('href', '');
                $(item).click(function () { return false });
            });
        };

        _this.initBrokersSpreads = function () {
            var json = {
                "ContainerId": _this.SpreadsContainerId,
                "Brokers": [{ MyFxBookSpreadServer: _this.Broker.MyFxBookSpreadServer }],
                "Pairs": _this.Pairs,
                "HtmlTemplateFile": _this.SpreadsHtmlTemplateFile
            };
            var brokerSpreads = new FXStreet.Class.BrokersSpreads();
            brokerSpreads.init(json);
        };

        _this.initBrokerCallMe = function () {
            var json = {
                "BrokerId": _this.Broker.Id
            };
            var brokerCallMe = new FXStreet.Class.BrokerCallMe();
            brokerCallMe.init(json);
        };

        return _this;
    };
}());
(function () {
    FXStreet.Class.BrokersList = function () {
        var parent = FXStreet.Class.Base(),
            _this = FXStreet.Util.extendObject(parent);

        // ----- begin json properties -----
        _this.ContainerId = "";
        // ----- end json properties -----

        _this.Container = null;
        _this.BrokersTable = null;
        _this.SpreadsElements = [];
        _this.LowerPriceClass = 'fxs_widget_spreads_item_lower';

        _this.init = function (json) {
            _this.setSettingsByObject(json);
            _this.setVars();
            _this.InitMyFxBookHandler();
        };

        _this.setVars = function () {
            _this.Container = FXStreet.Util.getjQueryObjectById(_this.ContainerId);
            _this.BrokersTable = _this.Container.find('table');
            _this.SpreadsElements = _this.BrokersTable.find('td[fxs_spreadserver]');
        };

        _this.InitMyFxBookHandler = function () {
            var json = {
                SpreadServer: [],
                Symbols: [],
                GetSpreadsIntervalInMilliseconds: 1500,
                GetSpreadsDelegated: _this.SpreadsRecieved
            };

            for (var i = 0; i < _this.SpreadsElements.length; i++) {
                var item = $(_this.SpreadsElements[i]);
                json.SpreadServer.push(item.attr('fxs_spreadserver'));
                json.Symbols.push(item.attr('fxs_spreadid'));
            }

            var myFxBookHandler = FXStreet.Class.MyFxBookHandler();
            myFxBookHandler.init(json);
        };

        _this.SpreadsRecieved = function (data) {
            var rows = data.split(";");

            rows.forEach(function (item) {
                var values = item.split(",");
                var spreadserver = values[0];
                var spreadid = values[1];
                var price = values[2];

                var minPriceItem = null;
                for (var i = 0; i < _this.SpreadsElements.length; i++) {
                    var item = $(_this.SpreadsElements[i]);
                    if (item.attr('fxs_spreadid') === spreadid) {
                        var span = item.find('span');
                        if (item.attr('fxs_spreadserver') === spreadserver) {
                            span.html(price);
                        }

                        span.removeClass(_this.LowerPriceClass);
                        var text = span.html();
                        if (text === "" || text === "N/A") {
                            span.html("N/A");
                            continue;
                        }
                        if (minPriceItem === null || text == Math.min(text, minPriceItem.find('span').html())) {
                            minPriceItem = item;
                        }
                    }
                }
                if (minPriceItem !== null) {
                    minPriceItem.find('span').addClass(_this.LowerPriceClass);
                }
            });
        };

        return _this;
    };
}());
(function () {
    FXStreet.Class.BrokersSpreads = function () {
        var parent = FXStreet.Class.Base(),
            _this = FXStreet.Util.extendObject(parent);

        // ----- begin json properties -----

        _this.ContainerId = "";
        _this.Brokers = [];
        _this.Pairs = [];
        _this.SitefinitySpreadsPageUrl = "";
        _this.ShowAllSpreadsButton = false;
        _this.HtmlTemplateFile = "";

        // ----- end json properties -----

        _this.Container = null;
        _this.BrokersTable = null;

        //_this.HtmlTemplate = 'brokersspreads_default.html';
        _this.LowerPriceClass = 'fxs_widget_spreads_item_lower';

        _this.init = function (json) {
            _this.setSettingsByObject(json);
            _this.setVars();
            _this.render();
        };

        _this.setVars = function () {
            _this.Container = FXStreet.Util.getjQueryObjectById(_this.ContainerId);
        };

        _this.render = function () {
            var data = {
                Value: {
                    Brokers: _this.Brokers,
                    Pairs: _this.Pairs,
                    SitefinitySpreadsPageUrl: _this.SitefinitySpreadsPageUrl,
                    ShowAllSpreadsButton: _this.ShowAllSpreadsButton,
                    SingleMyFxBookSpreadServer: _this.Brokers[0].MyFxBookSpreadServer
                },
                Translations: FXStreet.Resource.Translations["BrokersSpreads_Widget"],
                ColumnsNumber: 3 + _this.Pairs.length
            };

            _this.htmlRender(data);
        };

        _this.htmlRender = function (data) {
            FXStreet.Util.loadHtmlTemplate(_this.HtmlTemplateFile).done(function (template) {
                var html = FXStreet.Util.renderByHtmlTemplate(template, data);
                _this.Container.html(html);

                _this.BrokersTable = _this.Container.find('table');

                var json = {
                    SpreadServer: $.map(_this.Brokers, function (item) {
                        return item.MyFxBookSpreadServer;
                    }),
                    Symbols: $.map(_this.Pairs, function (item) {
                        return item.MyFxBookSpreadId;
                    }),
                    GetSpreadsIntervalInMilliseconds: 1500,
                    GetSpreadsDelegated: _this.SpreadsRecieved
                };

                var myFxBookHandler = FXStreet.Class.MyFxBookHandler();
                myFxBookHandler.init(json);

                _this.SetTooltip();
            });
        };

        _this.SetTooltip = function() {
            $('[data-toggle="tooltip"]').tooltip();
            $('tr').tooltip({ trigger: 'click' });
        };

        _this.SpreadsRecieved = function (data) {
            var rows = data.split(";");

            rows.forEach(function (item) {
                var values = item.split(",");
                var spreadserver = values[0];
                var spreadid = values[1];
                var price = values[2];

                var priceSpan = _this.BrokersTable.find('td[fxs_spreadserver="' + spreadserver + '"][fxs_spreadid="' + spreadid + '"] span[fxs_content="spreadPrice"]');
                priceSpan.text(price);
            });

            _this.Pairs.forEach(function (item) {
                var allSpreads = _this.BrokersTable.find('td[fxs_spreadid="' + item.MyFxBookSpreadId + '"] span[fxs_content="spreadPrice"]');
                var emptySpreads = allSpreads.filter(function (i, spread) {
                    var text = $(spread).text();
                    return text === "" || text === "N/A";
                });

                $.each(emptySpreads, function(index, spread) {
                    $(spread).html("N/A");
                });

                var spreads = allSpreads.not(emptySpreads);
                
                spreads.removeClass(_this.LowerPriceClass);
                var prices = $.map(spreads, function (spread) { return $(spread).text(); });
                var minPrice = Math.min.apply(Math, prices);

                var spreadsMinPrices = spreads.filter(function (i, spread) {
                    return $(spread).text() == minPrice; // Caution, must be == instead of ===, as they are different types
                });
                spreadsMinPrices.addClass(_this.LowerPriceClass);
            });
        };

        return _this;
    };
}());
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
(function () {
    FXStreet.Class.CompanyDetailManager = function () {
        var parent = FXStreet.Class.Base(),
             _this = FXStreet.Util.extendObject(parent);

        _this.ContainerId = "";
        _this.Company = {};
        _this.Translations = {};

        _this.HtmlTemplateFile = "companydetails_default.html";
        _this.Container = null;

        _this.init = function (json) {
            _this.setSettingsByObject(json);
            _this.setVars();
            _this.render();
        };

        _this.setVars = function () {
            _this.Container = FXStreet.Util.getjQueryObjectById(_this.ContainerId);
        };

        _this.render = function () {
            var jsonData =
                {
                    Value: _this.Company,
                    Translations: _this.Translations
                };

            FXStreet.Util.loadHtmlTemplate(_this.HtmlTemplateFile).done(function (template) {
                var rendered = FXStreet.Util.renderByHtmlTemplate(template, jsonData);
                _this.Container.html(rendered);
                _this.loadHtmlTemplateSuccessComplete(_this.Company);
            });
        };

        _this.loadHtmlTemplateSuccessComplete = function(companyData) {
            _this.initSocialMediaWidget(companyData);
            _this.initFilteredPostsWidget(companyData);
        };

        _this.initSocialMediaWidget = function (companyData) {
            var jsonSocialMediaBar = {
                ContainerId: "fxs_socialmedia_bar_" + companyData.Id,
                SocialMediaBarData: companyData.SocialMedias
            };
            FXStreet.Util.createObject("SocialMediaBarProfile", jsonSocialMediaBar);
        };

        _this.initFilteredPostsWidget = function(companyData) {
            var jsonFilteredPosts = {
                ContainerId: "fxs_filtered_posts_" + companyData.Id,
                CompanyId: companyData.Id,
                Take: 10
            }
            FXStreet.Util.createObject("FilteredPostsManager", jsonFilteredPosts);
        };

        return _this;

    };
}());
(function () {
    FXStreet.Class.CookiesAlert = function () {
        var parent = FXStreet.Class.Base(),
        _this = FXStreet.Util.extendObject(parent);

        _this.ContainerId = "";
        _this.Title = "";
        _this.Message = "";
        _this.IsModal = false;


        _this.Container = null;
        _this.CookieKey = "CookiesPolicyAccepted";
        _this.HtmlTemplateFile = function () {
            return _this.IsModal ? "cookiesalert_modal.html" : "cookiesalert_default.html";
        }
        _this.CloseButtonId = '';

        _this.init = function (json) {
            _this.setSettingsByObject(json);
            _this.setVars();
            _this.render();
        };

        _this.setVars = function () {
            _this.Container = FXStreet.Util.getjQueryObjectById(_this.ContainerId);
            _this.CloseButtonId = FXStreet.Util.guid();
        };

        _this.render = function () {
            if ($.cookie(_this.CookieKey) !== undefined) {
                _this.Container.hide();
                return;
            }

            _this.Container.addClass('fxs_global_alert fxs_alertCookies fxs_alertTitle_dissmisible fxs_alert_info alert alert-dismissible fade in');

            var jsonData = {
                Title: _this.Title,
                Message: _this.Message,
                CloseButtonId: _this.CloseButtonId
            };

            _this.htmlRender(jsonData);
        };

        _this.htmlRender = function (jsonData) {
            FXStreet.Util.loadHtmlTemplate(_this.HtmlTemplateFile()).done(function (template) {
                var rendered = FXStreet.Util.renderByHtmlTemplate(template, jsonData);
                _this.Container.html(rendered);


                var closeButton = FXStreet.Util.getjQueryObjectById(_this.CloseButtonId);
                closeButton.on('click', _this.onCloseButtonClick);
            });
        };

        _this.onCloseButtonClick = function () {
            var expiration = new Date();
            expiration.setFullYear(expiration.getFullYear() + 2);
            $.cookie(_this.CookieKey, '', { path: '/', expires: expiration });
        }

        return _this;
    };
}());
(function () {
    FXStreet.Class.Patterns.Singleton.FxsCookiesManager = (function () {
        var instance;

        var fxsCookiesManager = function () {
            var parent = FXStreet.Class.Base(),
                _this = FXStreet.Util.extendObject(parent);


            _this.UpdateCookie = function (cookieKey, value, expires, path) {
                _this.DeleteCookie(cookieKey);
                _this.SaveCookie(cookieKey, value, expires, path);
            };

            _this.SaveCookie = function (cookieKey, value, expires, path) {
                path = path || '/';
                $.cookie(cookieKey, value, { path: path, expires: expires });
            };

            _this.DeleteCookie = function (cookieKey) {
                $.cookie(cookieKey, null, { path: '/' });
                $.removeCookie(cookieKey, { path: '/' });
            };

            _this.GetCookieValue = function (cookieKey) {
                return $.cookie(cookieKey);
            };

            _this.ExistCookie = function (cookieKey) {
                var cookie = $.cookie(cookieKey);
                return cookie != undefined;
            };

            return _this;
        };

        function createInstance() {
            var object = fxsCookiesManager();
            object.init({});
            return object;
        }

        return {
            Instance: function () {
                if (!instance) {
                    instance = createInstance();
                }
                return instance;
            }
        };
    })();
}());
(function () {
    window.FXSEventManager = {};

    var EventManagerClass = function (eventhubUrl, publisher, tokenUrl) {
        var token = '';
        var fxsToken = '';
        var sendEvent = function (jsonData) {
            var url = eventhubUrl + publisher + '/messages?timeout=60&api-version=2014-01';
            var request = new XMLHttpRequest();
            request.open('POST', url, true);
            request.setRequestHeader('Content-Type', 'application/atom+xml;type=entry;charset=utf-8');
            request.setRequestHeader('Authorization', token);
            request.send(jsonData);

            //$.ajax({
            //    type: 'POST',
            //    url: eventhubUrl + publisher + '/messages?timeout=60&api-version=2014-01',
            //    data: jsonData,
            //    contentType: 'application/atom+xml;type=entry;charset=utf-8',
            //    dataType: "json",
            //    beforeSend: function (xhr) {
            //        xhr.setRequestHeader('Authorization', token);
            //    }
            //});
        };

        var getTokenAndSendEvent = function (jsonData) {
            var request = new XMLHttpRequest();
            request.onreadystatechange = function () {
                if (request.readyState == 4 && request.status == 200) {
                    token = JSON.parse(request.responseText);
                    if (token != '' && (token)) {
                        sendEvent(jsonData);
                    }
                }
            };
            request.open('GET', tokenUrl + publisher, true);
            request.send(null);
            //$.ajax({
            //    type: 'GET',
            //    url: '/apibo/FXsTokenApiBO/GetFxsToken',
            //    contentType: 'text/plain'
            //}).Success(function(data) {
            //    token = data;
            //    sendEvent(jsonData);
            //});
        };

        this.Send = function (jsonData) {
            if (token == '') {
                getTokenAndSendEvent(jsonData);
            }
            else {
                sendEvent(jsonData);
            }
        };
    };

    window.FXSEventManager.GetInstance = function (eventhubUrl, publisher, tokenUrl) {
        var result = new EventManagerClass(eventhubUrl, publisher, tokenUrl);
        return result;
    };
}());
(function () {
    FXStreet.Class.EventManager = function () {
        var parent = FXStreet.Class.Base(),
             _this = FXStreet.Util.extendObject(parent);

        // ----- begin json properties -----
        _this.ContainerId = "";
        _this.Take = 0;
        _this.HtmlTemplateFile = "eventList.html";
        _this.Url = "";
        _this.Translations = {};
        // ----- end json properties -----

        _this.Container = null;

        _this.init = function (json) {
            _this.setSettingsByObject(json);
            _this.setVars();
            _this.callEventsApi();
        };

        _this.setVars = function () {
            _this.Container = FXStreet.Util.getjQueryObjectById(_this.ContainerId);
            _this.Url = FXStreet.Resource.FxsApiRoutes["EventsGetItems"];
        };

        _this.callEventsApi = function () {
            var data = { "Take": _this.Take, "CultureName": FXStreet.Resource.CultureName };
            $.ajax({
                type: "GET",
                url: _this.Url,
                data: data,
                contentType: "application/json; charset=utf-8",
                dataType: "json"
            }).done(_this.searchSuccess);
        };

        _this.searchSuccess = function (events) {
            var jsonData = 
                {
                    Value: events,
                    Translations: _this.Translations
                };

            FXStreet.Util.loadHtmlTemplate(_this.HtmlTemplateFile).done(function (template) {
                var rendered = FXStreet.Util.renderByHtmlTemplate(template, jsonData);
                _this.Container.html(rendered);
                _this.loadHtmlTemplateSuccessComplete();
            });
        };

        _this.loadHtmlTemplateSuccessComplete = function () {};
        return _this;

    };
}());
(function () {
    FXStreet.Class.FilteredPostsManager = function () {
        var parent = FXStreet.Class.Base(),
            _this = FXStreet.Util.extendObject(parent);

        // ----- begin json properties -----
        _this.ContainerId = "";
        _this.Take = 0;
        _this.AuthorId = "";
        _this.CompanyId = "";
        _this.CategoryId = "";
        _this.HtmlTemplateFile = "filteredpostslist.html";
        _this.LoadMoreButtonId = "loadMoreBtn";
        // ----- end json properties -----

        _this.Container = null;
        _this.LoadMoreButton = null;
        var initialLoadUrl = "";
        var htmlInnerTemplateFile = "innerfilteredpostlist.html";
        var htmlInnerEventTemplateFile = "innerfilteredeventlist.html";
        var tabConfigs = {};
        var translations = null;

        var loadingDiv = $('<div class="fxs_preload_modules fxs_marginAuto"/>');

        _this.init = function (json) {
            _this.setSettingsByObject(json);
            _this.setVars();
            loadInitialValues().done(callFilteredPostsApi);
        };

        _this.setVars = function () {
            _this.Container = FXStreet.Util.getjQueryObjectById(_this.ContainerId);
            initialLoadUrl = FXStreet.Resource.FxsApiRoutes["FilteredPostsGetItems"];
            tabConfigs = {
                'News': {
                    LoadMoreUrl: FXStreet.Resource.FxsApiRoutes["FilteredNewsGetItems"]
                },
                'Analysis': {
                    LoadMoreUrl: FXStreet.Resource.FxsApiRoutes["FilteredAnalysisGetItems"]
                },
                'Videos': {
                    LoadMoreUrl: FXStreet.Resource.FxsApiRoutes["FilteredVideosGetItems"]
                },
                'Education': {
                    LoadMoreUrl: FXStreet.Resource.FxsApiRoutes["FilteredEducationGetItems"]
                },
                'LiveShows': {
                    LoadMoreUrl: FXStreet.Resource.FxsApiRoutes["FilteredLiveShowsGetItems"]
                }
            };
        };

        var loadInitialValues = function () {
            return FXStreet.Util.loadHtmlTemplate(htmlInnerTemplateFile).done(function (template) {
                tabConfigs["News"].InnerHtmlTemplate = template;
                tabConfigs["Analysis"].InnerHtmlTemplate = template;
                tabConfigs["Videos"].InnerHtmlTemplate = template;
                tabConfigs["Education"].InnerHtmlTemplate = template;

                return FXStreet.Util.loadHtmlTemplate(htmlInnerEventTemplateFile).done(function (template) {
                    tabConfigs["LiveShows"].InnerHtmlTemplate = template;
                });
            });
        }

        var createRequestData = function (page) {
            var data = { "Take": _this.Take, "AuthorId": _this.AuthorId, "CompanyId": _this.CompanyId, "CategoryId": _this.CategoryId, "CultureName": FXStreet.Resource.CultureName, "Page": page,"contenttype":1 };
            return data;
        };

        var callFilteredPostsApi = function () {
            $.ajax({
                type: "GET",
                url: initialLoadUrl,
                data: createRequestData(),
                contentType: "application/json; charset=utf-8",
                dataType: "json"
            }).done(searchSuccess);
        };

        var deactivateButton = function (ct) {
            var tab = FXStreet.Util.getjQueryObjectById(ct);
            var button = tab.find('a[ct]');
            button.attr('disabled', 'disabled');
            button.addClass('disabled');
            button.off('click');
            button.text(translations["NoMoreContent"]);
        };

        var loadMoreSuccess = function (ct, data, button) {
            var tab = FXStreet.Util.getjQueryObjectById(ct);
            var tabConfig = tabConfigs[ct];
            var html = FXStreet.Util.renderByHtmlTemplate(tabConfig.InnerHtmlTemplate, data);
            var lisToInsert = $(html).find('li');
            tab.find('aside ol').append(lisToInsert);
            tabConfig.Page++;

            button.show();
            loadingDiv.remove();

            if (data.Value.length < _this.Take) {
                deactivateButton(ct);
            }
        };
        
        var loadMoreButtonClick = function () {
            var button = $(this);
            var contentType = button.attr('ct');
            var page = tabConfigs[contentType].Page + 1;
            var url = tabConfigs[contentType].LoadMoreUrl;

            button.hide();
            button.after(loadingDiv);

            $.ajax({
                type: "GET",
                url: url,
                data: createRequestData(page),
                contentType: "application/json; charset=utf-8",
                dataType: "json"
            }).done(function (data) { loadMoreSuccess(contentType, data, button); });
            return false;
        };

        var loadHtmlTemplateSuccessComplete = function (data) {
            function openFirstTab() {
                var firstTab = _this.Container.find('.fxs_tabs_nav a[data-toggle="tab"]').first();
                firstTab.click();
            }

            function setLoadMoreButtonEvent() {
                _this.LoadMoreButton = _this.Container.find('div[role="tabpanel"]>a[ct]');
                _this.LoadMoreButton.click(loadMoreButtonClick);
            }

            function createTabs() {
                var asides = $('div[role="tabpanel"]>aside');
                asides.each(function (i, item) {
                    var ct = $(item).attr('ct');
                    var tabConfig = tabConfigs[ct];
                    var tabData = { Value: data.Value[ct] };
                    var renderedTab = FXStreet.Util.renderByHtmlTemplate(tabConfig.InnerHtmlTemplate, tabData);
                    $(item).replaceWith($(renderedTab));
                    tabConfig.Page = 1;

                    if (data.Value[ct].length < _this.Take) {
                        deactivateButton(ct);
                    }
                });
            };

            translations = data.Translations;
            createTabs();
            setLoadMoreButtonEvent();
            openFirstTab();
        };

        var searchSuccess = function (filteredPosts) {
            var jsonData =
                {
                    Value: getValue(filteredPosts),
                    Translations: filteredPosts.Translations
                };

            FXStreet.Util.loadHtmlTemplate(_this.HtmlTemplateFile).done(function (template) {
                var rendered = FXStreet.Util.renderByHtmlTemplate(template, jsonData);
                _this.Container.html(rendered);
                loadHtmlTemplateSuccessComplete(jsonData);
            });
        };

        var getValue = function (filteredPosts) {
            var result = filteredPosts;
            result.HasAnalysis = filteredPosts.Analysis.length > 0;
            result.HasEducation = filteredPosts.Education.length > 0;
            result.HasNews = filteredPosts.News.length > 0;
            result.HasVideos = filteredPosts.Videos.length > 0;
            result.HasLiveShows = filteredPosts.LiveShows.length > 0;
            return result;
        };

        return _this;
    };
}());
(function () {
    FXStreet.Class.ForecastPagination = function () {
        var parent = FXStreet.Class.Base(),
             _this = FXStreet.Util.extendObject(parent);

        _this.ContainerId = "";
        _this.PageUrl = "";
        _this.Translations = {};
        _this.Date = null;

        _this.Body = null;
        _this.HtmlTemplateFile = "forecast_pagination.html";
        _this.Container = null;
        _this.ContainerForecastWidget = null;
        _this.ContainerForecastContributorWidget = null;

        _this.init = function (json) {
            _this.setSettingsByObject(json);
            _this.setVars();
            render();
        };

        _this.setVars = function () {
            _this.Body = $('body');
            _this.Container = FXStreet.Util.getjQueryObjectById(_this.ContainerId);
            _this.Date = getDate();
        };

        var render = function () {
            FXStreet.Util.loadHtmlTemplate(_this.HtmlTemplateFile).done(function (template) {
                var rendered = FXStreet.Util.renderByHtmlTemplate(template, { Translations: _this.Translations });
                _this.Container.html(rendered);
                loadHtmlTemplateSuccessComplete();
            });
        };

        var loadHtmlTemplateSuccessComplete = function () {
            _this.Container.find('.fxs_fLeft').on('click', previusWeekClick);
            _this.Container.find('.fxs_fRight').on('click', nextWeekClick);
            _this.ContainerForecastWidget = _this.Body.find("[fxs_name='forecast']");
            _this.ContainerForecastContributorWidget = _this.Body.find("[fxs_name='forecastcontributors']");
        };

        var reloadWidget = function () {           
            var date = getStrDate();

            _this.ContainerForecastWidget.attr('fxs_date', date);
            _this.ContainerForecastContributorWidget.attr('fxs_date', date);

            FXStreetWidgets.Deferred.deferredLoad(_this.Body);
        };

        var previusWeekClick = function () {
            addDaysToDate(-7);
            updateUrl();
            reloadWidget();
        };

        var nextWeekClick = function () {
            addDaysToDate(7);
            updateUrl();
            reloadWidget();
        };

        var addDaysToDate = function (days) {
            _this.Date.setDate(_this.Date.getDate() + days);
        };

        var updateUrl = function () {
            var strDate = getStrDate();
            var informationId = "forecast_" + strDate;
            var url = _this.PageUrl + "?date=" + strDate;

            FXStreet.Util.updateUrl(informationId, document.title, url);
        };

        var getStrDate = function() {
            var result = FXStreet.Util.dateToIsoString(_this.Date) + " " + FXStreet.Util.dateToTimeString(_this.Date);
            return result;
        };

        var getDate = function () {
            var result = new Date();

            var dateQueryString = FXStreet.Util.getQueryStringValue('date');
            if (dateQueryString != null) {
                result = FXStreet.Util.dateStringToDateUTC(dateQueryString.replace('%20', ' '));
            }

            return result;
        };

        return _this;
    };
}());
(function () {
    FXStreet.Class.GlobalAlert = function () {
        var parent = FXStreet.Class.Base(),
        _this = FXStreet.Util.extendObject(parent);

        _this.ContainerId = "";
        _this.Title = "";
        _this.Message = "";
        _this.IsModal = false;
        _this.GlobalAlertKey = "GlobalAlertRemainHide";


        _this.Container = null;      
        _this.HtmlTemplateFile = function () {
            return _this.IsModal ? "globalalert_modal.html" : "globalalert_default.html";
        }
        _this.CloseButtonId = '';

        _this.init = function (json) {
            _this.setSettingsByObject(json);
            _this.setVars();
            _this.render();
        };

        _this.setVars = function () {
            _this.Container = FXStreet.Util.getjQueryObjectById(_this.ContainerId);
            _this.CloseButtonId = FXStreet.Util.guid();
        };

        _this.render = function () {
            if ($.cookie(_this.GlobalAlertKey) !== undefined) {
                _this.Container.hide();
                return;
            }

            _this.Container.addClass('fxs_global_alert fxs_alert_featured alert alert-dismissible fade in');

            var jsonData = {
                Title: _this.Title,
                Message: _this.Message,
                CloseButtonId: _this.CloseButtonId
            };

            _this.htmlRender(jsonData);
        };

        _this.htmlRender = function (jsonData) {
            FXStreet.Util.loadHtmlTemplate(_this.HtmlTemplateFile()).done(function (template) {
                var rendered = FXStreet.Util.renderByHtmlTemplate(template, jsonData);
                _this.Container.html(rendered);

                var closeButton = FXStreet.Util.getjQueryObjectById(_this.CloseButtonId);
                closeButton.on('click', _this.onCloseButtonClick);
            });
        };

        _this.onCloseButtonClick = function () {
            var expiration = new Date();
            expiration.setDate(expiration.getDate() + 1);
            $.cookie(_this.GlobalAlertKey, '', { path: '/', expires: expiration });
        }

        return _this;
    };
}());
(function() {
    FXStreet.Class.GoogleDriveManager = function() {
        var parent = FXStreet.Class.Base(),
            _this = FXStreet.Util.extendObject(parent);

        _this.GoogleDriveUrl = null;

        _this.init = function(json) {
            _this.setSettingsByObject(json);
            _this.setVars();
        };

        _this.setVars = function() {
        };

        _this.AddData = function(data, callback) {
            $.ajax({
                type: "PUT",
                url: _this.GoogleDriveUrl,
                data: JSON.stringify(data),
                contentType: "application/json; charset=utf-8"
            }).done(callback);
        };

        _this.SavePlayEvent = function (event, callback) {
            if (FXStreet.Resource.UserInfo.Email) {
                var data = { Content: _this.GetContent(event) };
                _this.AddData(data, callback);
            }
        };

        _this.GetContent = function (event) {
            
            var UTCdate = (new Date()).toUTCString();

            var message = event.Title +"|"+ FXStreet.Resource.UserInfo.Email + "|"
                + FXStreet.Resource.UserInfo.FirstName + "|"
                + FXStreet.Resource.UserInfo.Phone + "|"
                + (event.Contact === true ? "CONTACT" : "NOTCONTACT") + "|"
                + event.Origin + "|"
                + UTCdate ;

            return message;
        };

        return _this;
    };
}());
(function () {
    FXStreet.Class.InfiniteScroll = function () {
        var parent = FXStreet.Class.Base(),
            _this = FXStreet.Util.extendObject(parent);

        _this.IsLoading = false;

        // Json properties
        _this.ScrollingContent = null;
        _this.LoadFollowingDelegatePromise = null;
        _this.LoadPreviousDelegatePromise = null;
        _this.ScrollingElement = null;
        _this.LoadingMoreId = '';
        // End json properties

        _this.LastScroll = 0;
        _this.Initialized = false;
        _this.Scrolling = false;
        _this.NotMoreContent = false;
        _this.LoadingMore = null;
        _this.AvoidScroll = false;
        _this.endOfList = false;

        _this.actionBottomToPx = 100;

        _this.MoveUpDirection = false;

        _this.ScrollActionDelegatePromise_ObserverSubject = null;

        _this.init = function (json) {
            _this.setSettingsByObject(json);
            _this.setVars();
            _this.InitPaginator();
        };

        _this.setVars = function () {
            _this.LoadingMore = FXStreet.Util.getjQueryObjectById(_this.LoadingMoreId);
            _this.LoadingMore !== null ? _this.LoadingMore.show() : null;
            _this.ScrollActionDelegatePromise_ObserverSubject = new FXStreet.Class.Patterns.Observer.Subject();
        };

        var loadFollowing = function () {
            _this.IsLoading = true;
            _this.MoveUpDirection = false;
            _this.LoadFollowingDelegatePromise().then(function () {
                _this.IsLoading = false;
            });
        };

        var loadPrevious = function () {
            _this.IsLoading = true;
            _this.MoveUpDirection = true;
            _this.LoadPreviousDelegatePromise().then(function () {
                _this.IsLoading = false;
            });
        };

        var scrollFunction = function () {
            _this.ScrollActionDelegatePromise_ObserverSubject.notify();
        };

        _this.InitPaginator = function () {
            _this.ScrollingContent.on('scroll', _this.ScrollAction);
        };

        _this.ScrollAction = function () {
            _this.MoveUpDirection = false;
            if (_this.IsLoading || _this.AvoidScroll) {
                return;
            }

            var scrollPosition = _this.getScrollPosition();
            _this.MoveUpDirection = scrollPosition <= _this.LastScroll;
            _this.LastScroll = scrollPosition;

            scrollFunction();

            if (_this.NotMoreContent)
                return;

            if (scrollPosition === 0 && _this.LoadPreviousDelegatePromise !== null) {
                loadPrevious();
            } else if (_this.ScrollIsOnBottomZone()) {
                loadFollowing();
            }
        };

        _this.ScrollIsOnBottomZone = function () {
            var scrollPos = _this.getScrollPosition();
            return scrollPos >= -_this.actionBottomToPx + (_this.ScrollingElement.height() - _this.ScrollingContent.height());
        };

        _this.ScrollIsOnTop = function () {
            var scrollPos = _this.getScrollPosition();
            return scrollPos === 0;
        };

        _this.ScrollIsOnBottom = function () {
            var scrollPos = _this.getScrollPosition();
            return scrollPos >= (_this.ScrollingElement.height() - _this.ScrollingContent.height());
        };

        _this.getScrollPosition = function () {
            return _this.ScrollingContent.scrollTop();
        };

        _this.moveToPosition = function (positionTop) {
            _this.ScrollingContent.scrollTop(positionTop);
        };

        _this.MoveScroll = function (pixels) {
            var pos = _this.getScrollPosition();
            _this.moveToPosition(pos + pixels);
        };

        _this.animateToPosition = function (positionTop) {
            // Stopping the animation: if the scroll is already in movement, we must to stop it avoiding stacking the animations
            _this.ScrollingContent.stop();
            _this.ScrollingContent.animate({ scrollTop: positionTop }, 1000);
        };

        _this.endedList = function () {
            _this.endOfList = true;
            _this.LoadingMore.hide();
        };

        _this.setAvoidScroll = function (value) {
            _this.AvoidScroll = value;
        };

        _this.whenScroll = function (functionDelegate) {
            var observer = null;
            if (typeof functionDelegate === 'function') {
                var json = { 'UpdateDelegate': functionDelegate };
                observer = new FXStreet.Class.Patterns.Observer.Observer();
                observer.init(json);
                _this.ScrollActionDelegatePromise_ObserverSubject.addObserver(observer);
            } else {
                console.error('The functionDelegate provided is not a function');
            }
            return observer;
        };

        _this.unsubscribeScroll = function (observer) {
            var observers = _this.ScrollActionDelegatePromise_ObserverSubject.observers;
            var observerIndex = observers.indexOf(observer);
            if (observerIndex > -1) {
                observers.removeAt(observerIndex);
            }
        }

        return _this;
    };
    FXStreet.Class.InfiniteScrollPage = function () {
        var parent = FXStreet.Class.InfiniteScroll(),
          _this = FXStreet.Util.extendObject(parent);

        _this.LoadContentDelegatePromise_ObserverSubject = null;

        _this.init = function (json) {
            parent.init(json);
            _this.setSettingsByObject(json);
            _this.setVars();
        };

        _this.setVars = function () {
            parent.setVars();
            _this.LoadContentDelegatePromise_ObserverSubject = new FXStreet.Class.Patterns.Observer.Subject();
        };

        _this.whenLoadContent = function (functionDelegate) {
            if (functionDelegate !== undefined && functionDelegate !== null) {
                var json = { 'UpdateDelegate': functionDelegate };
                var observer = new FXStreet.Class.Patterns.Observer.Observer();
                observer.init(json);
                _this.LoadContentDelegatePromise_ObserverSubject.addObserver(observer);
            }
        };

        parent.LoadFollowingDelegatePromise = function () {
            return $.when(_this.LoadContentDelegatePromise_ObserverSubject.notify());
        };

        parent.LoadPreviousDelegatePromise = function () {
            return $.when(_this.LoadContentDelegatePromise_ObserverSubject.notify());
        };

        return _this;
    };
}());
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
(function() {
    FXStreet.Class.LiveEventManager = function() {
        var parent = FXStreet.Class.Base(),
            _this = FXStreet.Util.extendObject(parent);

        _this.Event = {};
        _this.EventId = "";
        _this.ContainerId = "";
        _this.ContainerId = "";
        _this.EventUrl = "";

        _this.BackgroundVideo = "Live2.mp4";
        _this.HtmlTemplateFile = "live_event_default.html";
        _this.HtmlTemplateFilePriceTable = "price_table.html";
        _this.Translations = null;
        _this.UserInfo = null;
        _this.Subscription = null;
        _this.Following=false;

        _this.counterTemplate = ''
                    + '<span><span class="fxs_widget_custom_data_lable">{0} :</span>days</span>'
                    + '<span><span class="fxs_widget_custom_data_lable">{1} :</span>hours</span>'
                    + '<span><span class="fxs_widget_custom_data_lable">{2} :</span>min</span>'
                    + '<span><span class="fxs_widget_custom_data_lable">{3}</span>sec</span>';

        _this.init = function (json) {
            _this.setSettingsByObject(json);
            _this.setVars();
            _this.render();
        };

        _this.setVars = function () {            
            if (_this.ContainerId !== "") {
                _this.Container = FXStreet.Util.getjQueryObjectById(_this.ContainerId, false);
            }
            if (_this.EventId == undefined || _this.EventId === "") {
                _this.EventId = _this.Event.Id;
                _this.EventUrl = _this.Event.Url;
            }
            _this.counterTemplate = _this.counterTemplate
                .replace('days', _this.Translations.Days)
                .replace('hours', _this.Translations.Hours)
                .replace('min', _this.Translations.Minutes)
                .replace('sec', _this.Translations.Seconds);
        };

        _this.render = function () {
            var jsonToRender = _this.getJsonForRenderHtml();
            _this.htmlRender(jsonToRender);
        };

        _this.htmlRender = function (json) {
            if (_this.Container != null) {
                _this.Following = _this.getInitialFollowingValue();
                FXStreet.Util.loadHtmlTemplate(_this.HtmlTemplateFile).done(function (template) {
                    var rendered = FXStreet.Util.renderByHtmlTemplate(template, json);
                    _this.Container.html(rendered);

                    if (json.Event.PremiumView) {
                        FXStreet.Util.loadHtmlTemplate(_this.HtmlTemplateFilePriceTable).done(function(templatePriceTable) {
                            var renderedPriceTable = FXStreet.Util.renderByHtmlTemplate(templatePriceTable, json);
                            _this.Container.find('.fxs_row').append(renderedPriceTable);
                        });
                    }
                    _this.addDOMEvents();

                    if (_this.Following) {
                        _this.changeSubscribeButtonClass();
                    }
                });
            }
        };

        _this.getInitialFollowingValue = function () {
            var result = false;
            if (_this.UserInfo.Personalization) {
                var eventFollowing = $.grep(_this.UserInfo.Personalization.EventsFollowing, function (event) {
                    return event.PostId === _this.EventId;
                });
                if (eventFollowing.length > 0) {                  
                    result = true;
                }
            }
            return result;
        }

        _this.addDOMEvents = function () {
            if (_this.Container != null) {
                _this.initCountDown(_this.Container);
                _this.addLoginEvent();
                _this.addSubscriptionEvent();
            }
        };

        _this.initCountDown = function (target) {
            var clock = target.find('[countdown-date]');
            var untilDate = FXStreet.Util.dateStringToDateUTC(_this.Event.StartDateUtc);
            clock.countdown(untilDate)
                .on('update.countdown', function (event) {
                    $(this).html(event.strftime(_this.counterTemplate
                        .replace('{0}', '%D')
                        .replace('{1}', '%H')
                        .replace('{2}', '%M')
                        .replace('{3}', '%S')
                        ));
                })
                .on('finish.countdown', function (event) {
                    var obj = $(this).html(_this.counterTemplate
                        .replace('{0}', '00')
                        .replace('{1}', '00')
                        .replace('{2}', '00')
                        .replace('{3}', '00'));

                    var startDate = new Date(_this.Event.StartDateUtc);

                    var endDate;
                    if (_this.Event.EndDateUtc) {
                        endDate = new Date(_this.Event.EndDateUtc);
                    } else {
                        endDate = new Date();
                    }

                    var now = new Date();
                    var actualDate = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds());

                    if (actualDate >= startDate && actualDate <= endDate) {
                        obj.closest('.fxs_live_event_module').addClass("on_air");
                    } else {
                        obj.closest('.fxs_live_event_module').addClass("finished_event");
                    }
                });
        };

        _this.getJsonForRenderHtml = function () {
            var event = _this.getEventData();

            var json = {
                Translations: _this.Translations,
                UserInfo: _this.UserInfo,
                Subscription: _this.Subscription,
                Event: event,
                BackgroundVideoSrc: FXStreet.Resource.StaticContentVideo + _this.BackgroundVideo
            }

            return json;
        };

        _this.addLoginEvent = function () {
            var userMenu = FXStreet.Util.getObjectInstance("UserMenu");
            if (userMenu == null) {
                return;
            }
            var ctaRegisterId = "fxs_cta_login_" + _this.EventId;

            var ctaRegister = FXStreet.Util.getjQueryObjectById(ctaRegisterId, false);
            if (ctaRegister != null && ctaRegister.length > 0 && userMenu != null) {
                ctaRegister.click(function () { userMenu.Login() });
            }
        };
        
        _this.addSubscriptionEvent = function () {

            var ctaSubscriptionId = "fxs_cta_subscribe_" + _this.EventId;
            var ctaSubscription = FXStreet.Util.getjQueryObjectById(ctaSubscriptionId, false);
            
            if (ctaSubscription != null && ctaSubscription.length > 0 && !_this.Following) {
                ctaSubscription.on("click", _this.pushSubscription);
            }
        };

        _this.pushSubscription = function() {
            if (!_this.UserInfo.IsLogged) {
                var userMenu = FXStreet.Util.getObjectInstance("UserMenu");
                if (userMenu == null) {
                    return;
                }
                userMenu.Login();
            }
            else {
                var data = {
                    "PostId": _this.EventId
                };

                var tagManager = FXStreet.Class.Patterns.Singleton.TagManager.Instance();
                tagManager.PushToEventhub(data, "EventFollow");
                _this.changeSubscribeButtonClass();
            }
        };

        _this.changeSubscribeButtonClass = function() {
            var ctaSubscriptionId = "fxs_cta_subscribe_" + _this.EventId;
            var ctaSubscription = FXStreet.Util.getjQueryObjectById(ctaSubscriptionId, false);

            ctaSubscription.addClass("active");
            
        }

        _this.getEventData = function () {
            return _this.Event;
        };

        return _this;
    };
}());

(function () {
    FXStreet.Class.Login = function () {

        var parent = FXStreet.Class.Base(),
            _this = FXStreet.Util.extendObject(parent);

        _this.ContainerId = "";
        _this.Container = null;
        _this.HtmlTemplateFile = "login.html";
        _this.SignupPasswordEyeId = "signupPasswordEyeId";
        _this.FxsUserErrorClass = "fxs_user_field_error";
        _this.UsernameLoginTextboxId = "";
        _this.PasswordLoginTextboxId = "";

        _this.UsernameLoginTextbox = null;
        _this.PasswordLoginTextbox = null;
        _this.SignupPasswordEye = null;
        _this.UserContainer = null;
        _this.PasswordContainer = null;

        _this.LoginUrl = FXStreet.Resource.FxsApiRoutes["LoginUrl"];
        _this.Form = null;

        _this.init = function (json) {
            _this.setSettingsByObject(json);
            _this.setVars(json);
            _this.render(json);
        };

        _this.addEvents = function () {
            $(_this.SignupPasswordEye).click(function () {
                $(_this.SignupPasswordEye).toggleClass("active");
                var type = "type";
                var passwordType = "password";
                var textType = "text";
                if ($(_this.PasswordLoginTextbox).attr(type) === passwordType) {
                    $(_this.PasswordLoginTextbox).attr(type, textType);
                }
                else {
                    $(_this.PasswordLoginTextbox).attr(type, passwordType);
                }
            });
        };

        _this.setVars = function (json) {
            _this.Container = FXStreet.Util.getjQueryObjectById(_this.ContainerId);
            _this.UsernameLoginTextboxId = 'fxs_login_username_' + _this.ContainerId;
            _this.PasswordLoginTextboxId = 'fxs_login_password_' +_this.ContainerId;
            _this.FormLoginId = 'fxs_login_form_' +_this.ContainerId;
            _this.UserContainerId = 'fxs_username_container_' +_this.ContainerId;
            _this.PasswordContainerId = 'fxs_password_container_' +_this.ContainerId;
        };

        _this.render = function (jsonData) {
            _this.htmlRender(jsonData);
        };

        _this.htmlRender = function (jsonData) {
            FXStreet.Util.loadHtmlTemplate(_this.HtmlTemplateFile).done(function (template) {

                jsonData.LoginUrl = _this.LoginUrl;

                var rendered = FXStreet.Util.renderByHtmlTemplate(template, jsonData);
                _this.Container.html(rendered);
                _this.Container.find(".fxs_close").on('click', function () {
                    _this.Container.hide();
                });

                _this.UsernameLoginTextbox = FXStreet.Util.getjQueryObjectById(_this.UsernameLoginTextboxId);
                _this.PasswordLoginTextbox = FXStreet.Util.getjQueryObjectById(_this.PasswordLoginTextboxId);

                _this.UserContainer = FXStreet.Util.getjQueryObjectById(_this.UserContainerId);
                _this.PasswordContainer = FXStreet.Util.getjQueryObjectById(_this.PasswordContainerId);

                _this.Form = FXStreet.Util.getjQueryObjectById(_this.FormLoginId);
                _this.Form.validate({ invalidHandler: _this.InvalidForm, errorPlacement: function () { } });

                _this.SignupPasswordEye = FXStreet.Util.getjQueryObjectById(_this.SignupPasswordEyeId);
                _this.addEvents();
                _this.loadData();
            });
        };

        _this.loadData = function () {
            var userName = getParameterByName('username');
            if (userName) {
                _this.UsernameLoginTextbox.val(userName);
            }

            var error = getParameterByName('error');
            if (error) {
                $(_this.UserContainer).addClass(_this.FxsUserErrorClass);
                $(_this.PasswordContainer).addClass(_this.FxsUserErrorClass);
            }

        };

        _this.SubmitForm = function () {
            _this.Form.submit();
        };

        function getParameterByName(name, url) {
            if (!url) { url = window.location.href; }

            name = name.replace(/[\[\]]/g, "\\$&");
            var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
                results = regex.exec(url);
            if (!results) return null;
            if (!results[2]) return '';
            return decodeURIComponent(results[2].replace(/\+/g, " "));
        }

        return _this;
    };
}());
(function () {
    FXStreet.Class.ManageSubscription = function () {
        var parent = FXStreet.Class.Base(),
             _this = FXStreet.Util.extendObject(parent);

        _this.ContainerId = "";
        _this.UserPersonalization = {};
        _this.Translations = {};

        _this.HtmlTemplateFile = "manage_subscriptions.html";
        _this.Container = null;

        _this.NewsletterSubscriber = null;
        _this.ActiveClass = "active";

        _this.init = function (json) {
            _this.setSettingsByObject(json);
            _this.setVars(json);
            _this.render(json);
        };

        _this.setVars = function (json) {
            _this.Container = FXStreet.Util.getjQueryObjectById(_this.ContainerId);

            json.AuthorsActiveClass = json.AuthorsActive ? _this.ActiveClass : "";
            json.NewslettersActiveClass = json.NewslettersActive ? _this.ActiveClass : "";
        };

        _this.render = function (jsonData) {
            FXStreet.Util.loadHtmlTemplate(_this.HtmlTemplateFile).done(function (template) {
                var rendered = FXStreet.Util.renderByHtmlTemplate(template, jsonData);
                _this.Container.html(rendered);

                _this.addEvents();
            });
        };

        _this.addEvents = function () {
            $("[subscription-tab]").on("click", _this.selectTab);


            _this.initSubscribeToNewsletter();

            FXStreet.Resource.UserId = _this.UserPersonalization.UserId;
            var authors = _this.UserPersonalization.Authors;
            authors.forEach(function (data) {
                _this.initAuthorFollowController(data.Author);
            });
            var suggestedAuthors = _this.UserPersonalization.SuggestedAuthors;
            suggestedAuthors.forEach(function (data) {
                _this.initAuthorFollowController(data.Author);
            });

            if (!_this.UserPersonalization.UserEmail) {
                _this.addLoginEvent();
            }
        };

        _this.addLoginEvent = function () {
            var userMenu = FXStreet.Util.getObjectInstance("UserMenu");
            if (userMenu == null) {
                return;
            }
            
            var ctaLoginId = "fxs_cta_login_" + _this.ContainerId;

            var ctaLogin = FXStreet.Util.getjQueryObjectById(ctaLoginId, false);
            if (ctaLogin != null && ctaLogin.length > 0) {
                ctaLogin.click(function () { userMenu.Login();  });
            }
        };

        _this.CheckSelectedNewsleters = function () {
            _this.NewsletterSubscriber.NewsletterFollow = [];
            _this.NewsletterSubscriber.NewsletterUnfollow = [];
            _this.Container.find("input:checkbox[name=newsletters]").each(function () {
                if ($(this).is(':checked')) {
                    _this.NewsletterSubscriber.NewsletterFollow.push($(this).attr('value'));
                }
                else {
                    _this.NewsletterSubscriber.NewsletterUnfollow.push($(this).attr('value'));
                }
            });

            return true;
        };

        _this.ShowSuccessMessage = function () {
            $("#success_message_" + _this.ContainerId).show().delay(5000).hide(0);
        };

        _this.initAuthorFollowController = function (authorData) {
            var json = {
                UserInfo: {
                    Email: _this.UserPersonalization.UserEmail,
                    IsLogged: true,
                    Personalization: _this.UserPersonalization
                },
                Author: authorData,
                FollowButtonId: "fxs_cta_authorfollow_" + authorData.Id
            }
            var authorFollowObj = new FXStreet.Class.AuthorFollow();
            authorFollowObj.init(json);
        };

        _this.initSubscribeToNewsletter = function () {
            var json = {
                WidgetType: 'fxs_widget_tab',
                Email: _this.UserPersonalization.UserEmail,
                CountryCode: _this.UserPersonalization.CountryCode,
                Newsletters: _this.UserPersonalization.Newsletters,
                ContainerId: 'newsletters_' + _this.ContainerId,
                EmailPlaceholderText: _this.Translations["EmailPlaceholderText"],
                SubscribeButtonText: _this.Translations["ButtonUpdate"],
                CongratsAlertLabel: _this.Translations["CongratsAlertLabel"],
                CongratsAlertText: _this.Translations["CongratsAlertText"],
                ErrorAlertLabel: _this.Translations["ErrorAlertLabel"],
                ErrorAlertText: _this.Translations["ErrorAlertText"],
                ErrorAlertLabel: _this.Translations["ErrorAlertLabel"],
                ErrorCaptchaAlertText: _this.Translations["ErrorCaptchaAlertText"],
            };

            _this.SubscribeToNewsletter = new FXStreet.Class.SubscribeToNewsletter();
            _this.SubscribeToNewsletter.init(json);
        };

        _this.selectTab = function (e) {
            var tabButton = $(e.target);
            var tabSelector = tabButton.data("tabselector");

            tabButton.parent().addClass(_this.ActiveClass).siblings().removeClass(_this.ActiveClass);

            $(tabSelector).show().siblings().hide();

            return false;
        };

        return _this;

    };
}());
(function () {
    FXStreet.Class.MarketingLeadsManager = function () {
        var parent = FXStreet.Class.Base(),
            _this = FXStreet.Util.extendObject(parent);

        _this.MarketingLeadsRecorderUrl = null;
        _this.MarketingLeadsReaderUrl = null;

        _this.init = function (json) {
            _this.setSettingsByObject(json);
            _this.setVars();
        };

        _this.setVars = function () {
        };

        _this.AddData = function (data, callback) {
            $.ajax({
                type: "POST",
                url:  _this.MarketingLeadsRecorderUrl,
                data: JSON.stringify(data),
                contentType: "application/json"
            }).done(callback);
        };

        _this.GetData = function (data, callback) {
            $.ajax({
                type: "GET",
                url: _this.MarketingLeadsReaderUrl,
                contentType: "application/json"
            }).done(callback);
        };

        _this.SavePlayEvent = function (event, callback) {
            if (FXStreet.Resource.UserInfo.Email) {
                var data = _this.GetContent(event);
                _this.AddData(data, callback);
            }
        };

        _this.GetContent = function (event) {
            var UTCdate = (new Date()).toUTCString();

            var content =
            {
                Title: event.Title,
                Email: FXStreet.Resource.UserInfo.Email,
                FirstName: FXStreet.Resource.UserInfo.FirstName,
                Contact: event.Contact,
                Phone: FXStreet.Resource.UserInfo.Phone,
                Origin: event.Origin,
                Date: UTCdate
            };

            return content;
        };

        return _this;
    };
}());
(function () {
    FXStreet.Class.Menu = function () {
        var parent = FXStreet.Class.Base(),
         _this = FXStreet.Util.extendObject(parent);

        _this.VerticalMenuId = '';
        _this.HorizontalMenuId = '';

        _this.VerticalMenu = null;
        _this.HorizontalMenu = null;
        _this.responsiveDesignObj = null;

        _this.HideElementClass = "fxs_hideElements";
        _this.SectionEntrySelector = "a[fxs-desktop-menu-entry]";
        _this.ItemEntrySelector = "a[fxs-desktop-menu-item-entry]";
        _this.MouseOverClass = "fxs_item_active";
        _this.ActiveMenuEntryClass = "active";
        _this.SectionSelector = "[fxs-section-entry]";
        _this.DesktopMatchSize = "(min-width: 1024px)";
        _this.MenuBarSelector = "#fxs_nav_position";
        _this.LogoSelector = "#fxs_logo_reduced";
        _this.HeaderSelector = ".fxs_header";
        _this.PositionFixedClass = "fxs_positionFixed";
        _this.WallpaperSelector = ".fxs_wallpaper_wrap";
        _this.SideBarSelector = ".fxs_listView";
        _this.MobileMenuContainerSelector = "#cbp-spmenu-s1";
        _this.MobileMenuBlockClass = "fxs_dBlock";
        _this.MobileMenuCloseClass = "fa-times";
        _this.MobileMenuOpenClass = "fa-bars";
        _this.MobileMenuButtonSelector = "#fxs_showLeftPush";
        _this.MobileMenuPushToRight = "cbp-spmenu-push-toright";
        _this.HeaderScrolledClass = "fxs_header_scrolled";

        var menuSizeLimit = 1024;

        _this.init = function (json) {
            _this.setSettingsByObject(json);
            _this.setVars();
            _this.addEvents();
            _this.setActiveSection();
        };

        _this.setVars = function () {
            _this.VerticalMenu = FXStreet.Util.getjQueryObjectById(_this.VerticalMenuId);
            _this.HorizontalMenu = FXStreet.Util.getjQueryObjectById(_this.HorizontalMenuId);
        };

        _this.addEvents = function () {
            _this.responsiveDesignObj = FXStreet.Util.getObjectInstance("ResponsiveDesign");
            if (_this.responsiveDesignObj) {
                _this.responsiveDesignObj.whenWindowDecreaseToSize(function () { _this.toggleMenu(false); }, menuSizeLimit);
                _this.responsiveDesignObj.whenWindowIncreaseToSize(function () { _this.toggleMenu(true); }, menuSizeLimit);
            }
            if (FXStreet.Util.isMobileDevice()) {
                _this.mobileMenuEvents();
            }
            else {
                _this.loadScrollEvents();
            }
        };

        _this.toggleMenu = function (horizontalVisible) {
            _this.VerticalMenu.toggleClass(_this.HideElementClass, horizontalVisible);
            _this.HorizontalMenu.toggleClass(_this.HideElementClass, !horizontalVisible);
            if (!horizontalVisible) {
                _this.mobileMenuEvents();
            } else {
                _this.MobileMenuActions(false);
                _this.loadScrollEvents();
            }
        };

        _this.setActiveSection = function () {

            var sections = $(_this.SectionEntrySelector);
            if (!sections) return;
            $(sections).removeClass(_this.ActiveMenuEntryClass);

            var pathName = window.location.pathname;
            var section = _this.matchSectionUrl(pathName) || _this.matchItemUrl(pathName);
            if (!section || section.length === 0) return;

            $(section).addClass(_this.ActiveMenuEntryClass);
        }

        _this.matchSectionUrl = function (pathName) {
            var result = null;
            var sections = $(_this.SectionEntrySelector);
            sections.each(function(e, f) {
                var sectionHref = $(f).attr('href');
                if (_this.isHomePath(sectionHref)) {
                    if (pathName == sectionHref){
                        result = f;
                        return false;
                    };
                } else {
                    if (pathName.indexOf(sectionHref) === 0) {
                        result = f;
                        return false;
                    };
                }
            });
            if (!result||result.length === 0) return result;

            result = $(result).parents(_this.SectionSelector);
            return result;
        }

        _this.isHomePath = function(pathName) {
            return pathName === '/';
        };

        _this.matchItemUrl = function(pathName) {
            var item = $(_this.ItemEntrySelector + '[href="' + pathName + '"]');
            if (!item || item.length === 0) return null;

            var result = $(item).parents(_this.SectionSelector);
            return result;
        };

        _this.loadScrollEvents = function() {
            $(window).scroll(function() {
                _this.scrollActions();
            });
        };

        _this.scrollActions = function () {
            var desktop = window.matchMedia(_this.DesktopMatchSize);
            var menuBar = $(_this.MenuBarSelector);
            var logoCustom = $(_this.LogoSelector);
            var header = $(_this.HeaderSelector);
            var body = $("body");
            var wallpaper = $('.fxs_wallpaper_wrap');
            var listView = $('.fxs_listView');

            if (desktop.matches) {
                if ($(window).scrollTop() > 80) {
                    body.addClass(_this.HeaderScrolledClass);
                    menuBar.addClass(_this.PositionFixedClass);
                    wallpaper.css({ 'top': '44px' });
                    listView.css({ 'top': '44px' });
                } else {
                    menuBar.removeClass(_this.PositionFixedClass);
                    body.removeClass(_this.HeaderScrolledClass);
                    wallpaper.css({ 'top': (121 - $(window).scrollTop()) + 'px' });
                    listView.css({ 'top': (121 - $(window).scrollTop()) + 'px' });
                }
            } else {
                header.css("position", "fixed");
                logoCustom.addClass(_this.HideElementClass);
            };
        };

        _this.mobileMenuEvents = function () {
            $(_this.MobileMenuButtonSelector).off("click").on("click", function () {
                var visible = $(_this.MobileMenuContainerSelector).hasClass(_this.MobileMenuBlockClass);
                _this.MobileMenuActions(!visible);
            });
        };

        _this.MobileMenuActions = function (open) {
            var container = $(_this.MobileMenuContainerSelector);
            var icon = $(_this.MobileMenuButtonSelector).find("i");
            var body = $("body");

            if (open) {
                container.addClass(_this.MobileMenuBlockClass);
                icon.removeClass(_this.MobileMenuOpenClass).addClass(_this.MobileMenuCloseClass);
                $(body).addClass(_this.MobileMenuPushToRight);
            } else {
                container.removeClass(_this.MobileMenuBlockClass);
                icon.removeClass(_this.MobileMenuCloseClass).addClass(_this.MobileMenuOpenClass);
                $(body).removeClass(_this.MobileMenuPushToRight);
            }
        };

        return _this;
    };

}());
(function() {
    FXStreet.Class.Modal = function() {
        var parent = FXStreet.Class.Base(),
            _this = FXStreet.Util.extendObject(parent);

        _this.IsEditorMode = "";
        _this.ShowModal = true;

        _this.init = function(json) {
            _this.setSettingsByObject(json);
            _this.setVars();
            _this.addEvents();
        };

        _this.setVars = function() {
            _this.ShowModal =  (_this.IsEditorMode.toLowerCase() !== "true");
        }

        _this.addEvents = function () {
            if (_this.ShowModal) {
                $('.modal').modal('show');
                $('.modal').on('hidden.bs.modal', function () {
                    if (document.referrer) {
                        window.location.assign(document.referrer);
                    }
                });
            }
            
            var leaderboard = $('div .fxs_modal_add.fxs_leaderboard');
            if (!leaderboard.html().trim()) {
                leaderboard.hide();
            }

            var referredUrl = FXStreet.Util.parseUrl(document.referrer);
            if (!referredUrl || referredUrl.host !== window.location.host) {
                $('.fxs_modal_wrap > button').hide();
                $('.fxs_modal_wrap').off('click');
            }
        };

        return _this;
    };
}());
(function () {
    FXStreet.Class.MultiAssetsFilter = function () {
        var parent = FXStreet.Class.Base(),
            _this = FXStreet.Util.extendObject(parent);

        _this.SelectedAssetsId = "";
        _this.ApplyFilterId = "";
        _this.DefaultAssets = {};
        _this.ClearFilterId = "";
        _this.AdvancedFilterId = "";
        _this.CloseAdvancedFilterId = "";
        _this.AssetsAddedId = "";
        _this.FilterSectionId = "";
        _this.FindBy_Options = [];
        _this.OptionSelectedDelegate = null;
        _this.GetAssetsUserSettingDelegate = null;
        _this.TypeaheadJsonInitialization = {};
        _this.Translations = {};

        _this.SelectedAssetsContainer = null;
        _this.ApplyFilter = null;
        _this.AdvancedFilter = null;
        _this.CloseAdvancedFilter = null;
        _this.FilterSection = null;
        _this.AssetsAddedContainer = null;
        _this.PreSelectedAssets = {};
        _this.SelectedAssets = {};

        _this.IsOpened = false;

        var searchedQuery = null;
        var typeaheadObj = null;

        _this.init = function (json) {
            _this.setSettingsByObject(json);
            _this.SetVarsEvents();
        };

        _this.SetVarsEvents = function () {
            _this.setVars();
            _this.addEvents();
            initTypeahead();
        };

        _this.setVars = function () {
            _this.SelectedAssetsContainer = FXStreet.Util.getjQueryObjectById(_this.SelectedAssetsId, false);
            _this.ApplyFilter = FXStreet.Util.getjQueryObjectById(_this.ApplyFilterId, false);
            _this.ClearFilter = FXStreet.Util.getjQueryObjectById(_this.ClearFilterId, false);
            _this.AdvancedFilter = FXStreet.Util.getjQueryObjectById(_this.AdvancedFilterId, false);
            _this.CloseAdvancedFilter = FXStreet.Util.getjQueryObjectById(_this.CloseAdvancedFilterId, false);
            _this.FilterSection = FXStreet.Util.getjQueryObjectById(_this.FilterSectionId, false);
            _this.AssetsAddedContainer = FXStreet.Util.getjQueryObjectById(_this.AssetsAddedId, false);

            _this.SelectedAssets = _this.GetAssetsUserSettingDelegate();
        };

        _this.addEvents = function () {
            _this.ApplyFilter.click(_this.applyFilterOnClick);
            _this.ClearFilter.click(_this.cancelFilterOnClick);
            _this.AdvancedFilter.click(_this.customFilterOnClick);
            _this.CloseAdvancedFilter.click(_this.applyNoneFilterOnClick);
        };

        var renderPreSelectedAssets = function () {
            _this.SelectedAssetsContainer.html('');
            for (var assetId in _this.PreSelectedAssets) {
                if (_this.PreSelectedAssets.hasOwnProperty(assetId)) {
                    var asset = _this.PreSelectedAssets[assetId];
                    var li = getPreSelectedAssetElement(asset);
                    _this.SelectedAssetsContainer.append(li);   
                }
            }
            updateCounter(_this.PreSelectedAssets);
        };

        var getPreSelectedAssetElement = function (asset) {
            var i = $('<i>')
                .addClass('fa fa-minus-circle')
                    .attr('aria-hidden', 'true');

            var div = $('<div>').html(asset.display);
            var li = $('<li>').append(div).append(i);
            li.click(function () { removePreSelectedAsset(asset, li); });
            return li;
        };

        var removePreSelectedAsset = function (asset, element) {
            delete _this.PreSelectedAssets[asset.id];
            element.remove();
            updateCounter(_this.PreSelectedAssets);
        };

        var updateCounter = function (assetsObj) {
            var numberOfAssets = (Object.keys(assetsObj).length);
            var assetCounter = _this.Translations.AssetCounterNumber.replace("{0}", numberOfAssets);
            $('.fxs_assets_number').html(assetCounter);
        };

        _this.applyFilterOnClick = function () {
            _this.showAssetsChangedMessage();

            _this.SelectedAssets = $.extend(true, {}, _this.PreSelectedAssets);
            _this.OptionSelectedDelegate(_this.SelectedAssets);
            _this.toggleFilterVisibility(false);
        };

        _this.cancelFilterOnClick = function () {
            _this.toggleFilterVisibility(false);
        };

        _this.customFilterOnClick = function () {
            typeaheadObj.TypeaheadInput["0"].value = "";
            _this.SelectedAssets = _this.GetAssetsUserSettingDelegate();
            _this.PreSelectedAssets = {};

            if (!_this.SelectedAssets || (Object.keys(_this.SelectedAssets).length === 0
                && Object.keys(_this.DefaultAssets).length > 0)) {
                _this.SelectedAssets = $.extend(true, {}, _this.DefaultAssets);
            }

            _this.PreSelectedAssets = $.extend(true, {}, _this.SelectedAssets);

            _this.toggleFilterVisibility(true);

            renderPreSelectedAssets();
        };

        _this.applyNoneFilterOnClick = function () {
            _this.showCustomSettingsRemovedMessage();

            _this.SelectedAssets = {};
            _this.OptionSelectedDelegate(_this.SelectedAssets);

            _this.toggleFilterVisibility(false);
        };
        
        _this.showAssetsChangedMessage = function () {
            _this.AssetsAddedContainer[0].textContent = _this.Translations.FilterAssetsAdded;
            _this.AssetsAddedContainer.show().delay(2000).fadeOut();
        };

        _this.showCustomSettingsRemovedMessage = function () {
            _this.AssetsAddedContainer[0].textContent = _this.Translations.CustomAssetsRemoved;
            _this.AssetsAddedContainer.show().delay(2000).fadeOut();
        };

        _this.toggleFilterVisibility = function (display) {
            _this.AdvancedFilter.toggle(!display);
            _this.CloseAdvancedFilter.toggle(display);
            _this.FilterSection.toggleClass("active", display);
            $('.fxs_listView_blockWrapper').toggleClass('fxs_blur_effect', display);
            _this.IsOpened = display;
        };

        var initTypeahead = function () {
            _this.TypeaheadJsonInitialization.FindBy_Options = _this.FindBy_Options;
            _this.TypeaheadJsonInitialization.CloseDelegated = closeDelegated;
            _this.TypeaheadJsonInitialization.OnLayoutBuiltBeforeDelegate = onLayoutBuiltBeforeDelegate;
            _this.TypeaheadJsonInitialization.OnClickBeforeDelegate = onClickBeforeDelegate;
            typeaheadObj = new FXStreet.Class.Sidebar.Typeahead();
            typeaheadObj.init(_this.TypeaheadJsonInitialization);
        };

        var closeDelegated = function () { 
        };

        var onLayoutBuiltBeforeDelegate = function (node, query, result, resultHtmlList) {
            searchedQuery = query;
            $('#typeaheadTarget').html(searchedQuery);
            if (resultHtmlList != null && resultHtmlList.children().length >= 1 && !resultHtmlList.children().first().hasClass('typeahead__empty')) {
                resultHtmlList.children().each(function (index, item) {
                    renderTypeaheadItem($(item).find('a'));
                });
            }
            return resultHtmlList;
        };

        var renderTypeaheadItem = function (typeaheadItem) {
            var span = $('<span>')
                .attr('aria-hidden', 'true')
                .addClass('fa');

            var spanClass = "fa-plus-circle";

            if (_this.PreSelectedAssets !== null) {
                for (var assetId in _this.PreSelectedAssets) {
                    if (_this.PreSelectedAssets.hasOwnProperty(assetId)) {
                        var asset = _this.PreSelectedAssets[assetId];
                        if (asset.display === typeaheadItem.text()) {
                            spanClass = "fa-check";
                            break;
                        }
                    }
                }
            }
            span.addClass(spanClass);
            typeaheadItem.append(span);

            typeaheadItem.click(function () {
                span.toggleClass("fa-plus-circle fa-check");
            });
        };

        var onClickBeforeDelegate = function (node, a, item, event) {
            event.preventDefault();

            if (_this.PreSelectedAssets[item.id]) {
                delete _this.PreSelectedAssets[item.id];
            }
            else {
                _this.PreSelectedAssets[item.id] = item;
            }
            renderPreSelectedAssets();
            return true;
        };

        return _this;
    };

    FXStreet.Class.SideBarMultiassetFilter = function() {
        var parent = FXStreet.Class.MultiAssetsFilter(),
          _this = FXStreet.Util.extendObject(parent);

        _this.FilterStateLabelId = "";

        var filterStateLabel = null;
        var filterStateLabelText = "";

        var filterState = {
            Default: 1,
            Opened: 2,
            Customized: 3,
            Canceled: 4
        };

        _this.init = function (json) {
            parent.init(json);
            _this.setSettingsByObject(json);
            _this.setVars();
        };

        _this.setVars = function() {
            filterStateLabel = FXStreet.Util.getjQueryObjectById(_this.FilterStateLabelId, false);
            if (filterStateLabel != null) {
                filterStateLabelText = filterStateLabel[0].textContent;
            }
        };

        var parentApplyFilterOnClick = parent.applyFilterOnClick;
        parent.applyFilterOnClick = function () {
            parentApplyFilterOnClick();
            changedFilterState(filterState.Customized);
        };

        var parentCancelFilterOnClick = parent.cancelFilterOnClick;
        parent.cancelFilterOnClick = function () {
            parentCancelFilterOnClick();
            changedFilterState(filterState.Canceled);
        };

        var parentCustomFilterOnClick = parent.customFilterOnClick;
        parent.customFilterOnClick = function () {
            parentCustomFilterOnClick();
            changedFilterState(filterState.Opened);
        };

        var parentApplyNoneFilterOnClick = parent.applyNoneFilterOnClick;
        parent.applyNoneFilterOnClick = function () {
            parentApplyNoneFilterOnClick();
            changedFilterState(filterState.Default);
        };

        var changedFilterState = function (state) {
            var text = "";
            switch (state) {
                case filterState.Customized:
                    text = _this.Translations["Filter_Customized"];
                    filterStateLabelText = text;
                    break;
                case filterState.Opened:
                    text = _this.Translations["Filter_Opened"];
                    break;
                case filterState.Canceled:
                    text = filterStateLabelText;
                    if (text === _this.Translations["Assets"]) {
                        text += " " + buildTooltip();
                    }
                    break;
                case filterState.Default:
                default:
                    text = _this.Translations["Assets"] + " " + buildTooltip();
                    filterStateLabelText = text;
                    break;
            }
            if (filterStateLabel != null) {
                filterStateLabel[0].innerHTML = text;
                FXStreet.Util.SetTooltip();
            }
        };

        var buildTooltip = function() {
            var tooltipTemplate = "<i class=\"fa fa-info-circle\" data-toggle=\"tooltip\" data-placement=\"bottom\" title=\"{0}\" data-original-title=\"{1}\"></i>";
            var result = tooltipTemplate.replace('{0}', _this.Translations["Filter_Description"])
                                        .replace('{1}', _this.Translations["Filter_Description"]);
            return result;
        };

        return _this;
    };

    FXStreet.Class.RatesFilter = function () {
        var parent = FXStreet.Class.MultiAssetsFilter(),
          _this = FXStreet.Util.extendObject(parent);

        _this.ModalContainerId = "";
        _this.PopupContainerId = "";
        _this.PopupApplyId = "";
        _this.PopupCancelId = "";
        _this.FilterStateLabelId = "";
        _this.DefaultWidgetTitle = "";

        _this.ModalContainer = null;
        _this.PopupContainer = null;
        _this.PopupApply = null;
        _this.PopupCancel = null;

        var filterStateLabel = null;
        var filterStateLabelText = "";

        var filterState = {
            Default: 1,
            Customized: 2
        };

        _this.init = function (json) {
            parent.init(json);
            _this.setSettingsByObject(json);
            _this.setVars();
            _this.addEvents();
        };

        _this.setVars = function () {
            _this.ModalContainer = FXStreet.Util.getjQueryObjectById(_this.ModalContainerId, false);
            _this.PopupContainer = FXStreet.Util.getjQueryObjectById(_this.PopupContainerId, false);
            _this.PopupApply = FXStreet.Util.getjQueryObjectById(_this.PopupApplyId, false);
            _this.PopupCancel = FXStreet.Util.getjQueryObjectById(_this.PopupCancelId, false);

            filterStateLabel = FXStreet.Util.getjQueryObjectById(_this.FilterStateLabelId, false);
            if (Object.keys(_this.SelectedAssets).length > 0) {
                changedFilterState(filterState.Customized);
            }
        };

        _this.addEvents = function() {
            _this.PopupApply.click(onPopupApplyClick);
            _this.PopupCancel.click(onPopupCancelClick);
        };

        var parentApplyFilterOnClick = parent.applyFilterOnClick;
        parent.applyFilterOnClick = function () {
            parentApplyFilterOnClick();
            changedFilterState(filterState.Customized);
        };

        var parentApplyNoneFilterOnClick = parent.applyNoneFilterOnClick;
        parent.applyNoneFilterOnClick = function () {
            if (hasToShowPopup()) {
                togglePopupVisibility(true);
            } else {
                parentApplyNoneFilterOnClick();
                changedFilterState(filterState.Default);
            }
        };

        var changedFilterState = function (state) {
            var text = "";
            switch (state) {
                case filterState.Customized:
                    text = _this.Translations["Filter_Customized"];
                    filterStateLabelText = text;
                    break;
                case filterState.Default:
                default:
                    text = _this.DefaultWidgetTitle;
                    break;
            }
            if (filterStateLabel != null) {
                filterStateLabel[0].textContent = text;
            }
        };

        var hasToShowPopup = function () {
            var result = FXStreet.Util.haveSameProperties(_this.SelectedAssets, _this.DefaultAssets);
            return !result;
        };

        var onPopupApplyClick = function () {
            togglePopupVisibility(false);
            changedFilterState(filterState.Default);
            parentApplyNoneFilterOnClick();
        };

        var onPopupCancelClick = function () {
            togglePopupVisibility(false);
        };

        parent.toggleFilterVisibility = function (display) {
            _this.FilterSection.toggleClass("fxs_hideElements", !display);
            _this.IsOpened = display;
        };

        var togglePopupVisibility = function(display) {
            _this.ModalContainer.toggleClass("fxs_hideElements", display);
            _this.PopupContainer.toggleClass("fxs_hideElements", !display);
        };

        return _this;
    };
}());

(function () {
    FXStreet.Class.MyFxBookHandler = function () {
        var parent = FXStreet.Class.Base(),
        _this = FXStreet.Util.extendObject(parent);

        // ***** json properties ***** //
        _this.GetSpreadsDelegated = null;
        _this.GetSpreadsIntervalInMilliseconds = 0; // If the interval is 0, there is not interval
        _this.SpreadServer = [];
        _this.Symbols = [];
        // ***** end json properties ***** //

        _this.MyFxBookApiUrl = "https://spreads.myfxbook.com/api/get-spreads.html";

        _this.init = function (json) {
            _this.setSettingsByObject(json);
            _this.setVars();
            _this.PollSpreads();
        };

        _this.setVars = function () {
        };

        _this.PollSpreads = function () {
            if (!_this.SpreadServer.join(',')) {
                console.warn('The spread brokers has a wrong configuration');
                return;
            }

            return $.ajax({
                type: 'GET',
                dataType: "jsonp",
                url: _this.CreateUrl(),
                success: _this.PollSpreadsSucceed,
                error: _this.PollSpreadsFailed,
                complete: _this.PollSpreadsFinally
            });
        };

        _this.PollSpreadsSucceed = function (data) {
            if (typeof _this.GetSpreadsDelegated === 'function') {
                _this.GetSpreadsDelegated(data);
            }
        }

        _this.PollSpreadsFailed = function (error) {
            console.warn('Error getting spreads');
        }

        _this.PollSpreadsFinally = function () {
            if (_this.GetSpreadsIntervalInMilliseconds > 0) {
                setTimeout(_this.PollSpreads, _this.GetSpreadsIntervalInMilliseconds);
            }
        }

        _this.CreateUrl = function () {
            var querystring = _this.MyFxBookApiUrl + "?";
            querystring += "mt4Servers=" + _this.SpreadServer.join(',') + "&";
            querystring += "symbols=" + _this.Symbols.join(',') + "&";
            return querystring.slice(0, -1);
        }

        return _this;
    };
}());
(function () {
    FXStreet.Class.OnAirEventManager = function () {
        var parent = FXStreet.Class.Base(),
            _this = FXStreet.Util.extendObject(parent);

        _this.ContainerId = "";
        _this.Event = null;
        _this.Text = "";
        _this.AutoPlay = false;
        _this.Translations = null;
        _this.UserInfo = null;
        _this.Subscription = null;
        _this.BackgroundVideo = "";

        _this.BackgroundVideoSrc = "";
        _this.HtmlTemplateFile = "onair_event_default.html";
        _this.HtmlTemplateFilePriceTable = "price_table.html";

        _this.GoogleDriveMgr = {};
        _this.MarketingLeadsManagerManager = {};

        _this.CtaContactChkId = "";
        _this.CtaEnterId = "";
        _this.CtaLoginId = "";
        _this.ShowVideoCurtainId = "";
        _this.ShowVideoButtonId = "";
        _this.VideoContainerId = "";

        var showVideoCurtain = null;
        var videoContainer = null;
 
        _this.init = function (json) {
            _this.setSettingsByObject(json);
            _this.setVars();
            _this.render(json);

            if (_this.AutoPlay && !_this.Event.RegistrationRequired) {
                _this.SendPlayEvent();
            }
        };

        _this.setVars = function () {
            if (_this.ContainerId !== "") {
                _this.Container = FXStreet.Util.getjQueryObjectById(_this.ContainerId, false);
            }
            _this.BackgroundVideoSrc = FXStreet.Resource.StaticContentVideo + _this.BackgroundVideo;

            _this.GoogleDriveMgr = FXStreet.Util.getObjectInstance("GoogleDriveManager");
            _this.MarketingLeadsManagerManager = FXStreet.Util.getObjectInstance("MarketingLeadsManager");

            _this.CtaContactChkId = "accept_contact_chk_on_air";
            _this.CtaEnterId = "fxs_cta_enter_" + _this.Event.Id;
            _this.CtaLoginId = "fxs_cta_login_" + _this.Event.Id;
            _this.ShowVideoCurtainId = "fxs_live_event_marketing_" + _this.Event.Id;
            _this.ShowVideoButtonId = "fxs_cta_show_video_" + _this.Event.Id;
            _this.VideoContainerId = "fxs_live_event_video_container_" + _this.Event.Id;
        };

        _this.render = function (json) {
            if (_this.Container != null) {
                FXStreet.Util.loadHtmlTemplate(_this.HtmlTemplateFile).done(function (template) {
                    var rendered = FXStreet.Util.renderByHtmlTemplate(template, json);
                    _this.Container.html(rendered);

                    if (json.Event.PremiumView) {
                        FXStreet.Util.loadHtmlTemplate(_this.HtmlTemplateFilePriceTable).done(function (templatePriceTable) {
                            var renderedPriceTable = FXStreet.Util.renderByHtmlTemplate(templatePriceTable, json);
                            _this.Container.find('.fxs_row').append(renderedPriceTable);
                        });
                    }

                    _this.addDOMEvents(json);
                });
            }
        };

        _this.addDOMEvents = function () {
            if (_this.Container != null) {
                _this.addLoginEvent();
                _this.addCTAEvents();
                _this.addShowVideoEvents();
            }
        };

        _this.addLoginEvent = function () {
            var userMenu = FXStreet.Util.getObjectInstance("UserMenu");
            if (userMenu == null) {
                return;
            }

            var ctaLogin = FXStreet.Util.getjQueryObjectById(_this.CtaLoginId, false);
            if (ctaLogin != null && ctaLogin.length > 0) {
                ctaLogin.click(function () { userMenu.Login() });
            }
        };

        _this.addShowVideoEvents = function() {
            if (_this.Event.PublicView && _this.Event.RegistrationRequired) {
                showVideoCurtain = FXStreet.Util.getjQueryObjectById(_this.ShowVideoCurtainId, false);
                videoContainer = FXStreet.Util.getjQueryObjectById(_this.VideoContainerId, false);

                var showVideoButton = FXStreet.Util.getjQueryObjectById(_this.ShowVideoButtonId, false);
                showVideoButton.on("click", onShowVideoClick);
            }
        };

        var onShowVideoClick = function () {
            showVideoCurtain.addClass("fxs_hideElements");
            videoContainer.removeClass("fxs_hideElements");
            sendPlayEvent();
        };

        _this.addCTAEvents = function () {
            var ctaEnter = FXStreet.Util.getjQueryObjectById(_this.CtaEnterId, false);
            if (ctaEnter != null && ctaEnter.length > 0) {
                ctaEnter.on("click", _this.enterEventClick);
            }

            var ctaContactChk = FXStreet.Util.getjQueryObjectById(_this.CtaContactChkId, false);
            if (ctaContactChk != null && ctaContactChk.length > 0) {
                ctaContactChk.on("change", _this.contactAcceptChange);
            }
        };

        _this.enterEventClick = function () {
            sendPlayEvent();
            window.open(_this.Event.EventUrl, "_blank");
        };

        _this.pushSuccess = function () {
        };

        _this.contactAcceptChange = function() {
            var accept = this.checked;

            var storageManager = FXStreet.Class.Patterns.Singleton.FxsSessionStorageManager.Instance();
            storageManager.Save(FXStreet.Util.FxsSessionStorage.AcceptContactOnAir, accept);
        };
        
        var sendPlayEvent = function () {
            var event = {
                Title: _this.Event.Title,
                Origin: "on-air",
                Contact: getCheckboxStatus()
            };
            _this.GoogleDriveMgr.SavePlayEvent(event, _this.pushSuccess);
            _this.MarketingLeadsManagerManager.SavePlayEvent(event, _this.pushSuccess);
        };

        var getCheckboxStatus = function() {
            var contactInputId = "accept_contact_chk_on_air_" + _this.Event.Id;
            var contactInput = FXStreet.Util.getjQueryObjectById(contactInputId, false);
            var result = contactInput.val() === "on";
            return result;
        };
        
        return _this;
    };
}());
(function () {
    FXStreet.Class.PostBaseList = function () {
        var parent = FXStreet.Class.Base(),
            _this = FXStreet.Util.extendObject(parent);

        // ----- begin json properties -----

        _this.ContainerId = "";
        _this.Category = "";
        _this.Take = 0;
        _this.Translations = null;

        // ----- end json properties -----

        _this.HtmlTemplateFile = function () {
            throw new Error("Abstract method!");
        };
        _this.Url = function () {
            throw new Error("Abstract method!");
        };

        _this.Container = null;

        _this.init = function (json) {
            _this.setSettingsByObject(json);
            _this.setVars();
            _this.callNewsApi();
        };

        _this.setVars = function () {
            _this.Container = FXStreet.Util.getjQueryObjectById(_this.ContainerId);
            _this.Take = +(_this.Take);
        };

        _this.callNewsApi = function () {
            var data = {
                "CategoryId": [_this.Category],
                "Take": _this.Take,
                "CultureName": FXStreet.Resource.CultureName,
                "Page": 1,
                "contenttype": 1
            };

            $.ajax({
                type: "GET",
                url: _this.Url(),
                data: data,
                contentType: "application/json; charset=utf-8",
                dataType: "json"
            }).done(_this.searchSuccess);
        };

        _this.searchSuccess = function (posts) {
            var jsonData = {
                Posts: posts,
                Translations: _this.Translations
            };

            FXStreet.Util.loadHtmlTemplate(_this.HtmlTemplateFile()).done(function (template) {
                var rendered = FXStreet.Util.renderByHtmlTemplate(template, jsonData);
                _this.Container.html(rendered);
                _this.loadHtmlTemplateSuccessComplete();
            });
        };

        _this.loadHtmlTemplateSuccessComplete = function () {
        };

        return _this;
    };

    FXStreet.Class.NewsList = function () {
        var parent = FXStreet.Class.PostBaseList(),
            _this = FXStreet.Util.extendObject(parent);

        parent.HtmlTemplateFile = function () {
            return 'newslist.html';
        }

        parent.Url = function () {
            return FXStreet.Resource.FxsApiRoutes["NewsItemGetItems"];
        }

        return _this;
    };

    FXStreet.Class.AnalysisList = function () {
        var parent = FXStreet.Class.PostBaseList(),
            _this = FXStreet.Util.extendObject(parent);

        parent.HtmlTemplateFile = function () {
            return 'analysislist.html';
        }

        parent.Url = function () {
            return FXStreet.Resource.FxsApiRoutes["AnalysisItemGetItems"];
        }

        return _this;
    };

    FXStreet.Class.EducationList = function () {
        var parent = FXStreet.Class.PostBaseList(),
            _this = FXStreet.Util.extendObject(parent);

        parent.HtmlTemplateFile = function () {
            return 'educationlist.html';
        }

        parent.Url = function () {
            return FXStreet.Resource.FxsApiRoutes["EducationItemGetItems"];
        }

        return _this;
    };

    FXStreet.Class.VideosList = function () {
        var parent = FXStreet.Class.PostBaseList(),
            _this = FXStreet.Util.extendObject(parent);

        parent.HtmlTemplateFile = function () {
            return 'videoslist.html';
        }

        parent.Url = function () {
            return FXStreet.Resource.FxsApiRoutes["VideoGetItems"];
        }

        return _this;
    };
}());
(function () {
    FXStreet.Class.PostNotifications = function () {
        var parent = FXStreet.Class.Base(),
        _this = FXStreet.Util.extendObject(parent);

        //#region Json props
        _this.HttpPushServerUrl = '';
        _this.HttpPushServerKeysUrl = '';

        _this.ContentType = '';
        _this.PushNotificationChannel = '';
        //#endregion
        _this.PostCreated_ObserverSubject = null;

        var async = function (fn) {
            setTimeout(function () {
                try {
                    fn();
            } catch (e) { console.log('cannot stablish connection'); }
            }, 2000);
        }

        _this.init = function (json) {
            _this.setSettingsByObject(json);
            createObserverSubject();
            async(stablishHubConnection);
        };

        _this.registerObserver = function (updateDelegate) {
            if (updateDelegate !== undefined && updateDelegate !== null) {
                var json = {
                    'UpdateDelegate': updateDelegate
                };
                var observer = new FXStreet.Class.Patterns.Observer.Observer();
                    observer.init(json);

                _this.PostCreated_ObserverSubject.addObserver(observer);
            }
        };

        var createObserverSubject = function () {
            _this.PostCreated_ObserverSubject = new FXStreet.Class.Patterns.Observer.Subject();
        };

        var stablishHubConnection = function () {
            var auth = FXStreet.Class.Patterns.Singleton.Authorization.Instance();
            auth.getTokenPromise().then(function (token) {
                var instance = FXStreetPush.PushNotification.getInstance({
                    token: token,
                    culture: FXStreet.Resource.CultureName,
                    tokenUrl: _this.HttpPushServerKeysUrl,
                    httpPushServerUrl: _this.HttpPushServerUrl
                });
                instance.postSubscribe([_this.PushNotificationChannel], postCreatedOnServer);
            });
        }

        var postCreatedOnServer = function (post) {
            var shouldNotify =
                    post !== null
                    && post !== undefined
                    && FXStreet.Resource.CultureName === post.Language.CultureName
                    && FXStreet.Util.ContentTypeMapping[post.ContentTypeId].FxsContentType === _this.ContentType;

            if (shouldNotify) {
                var postNotify = getPostNotify(post);
                _this.PostCreated_ObserverSubject.notify(postNotify);
            }
        };

        var getPostNotify = function (post) {
            var minutesAgo = FXStreet.Resource.Translations['Sidebar_FilterAndList'].MinutesAgo;
            var time = timeSince(new Date(post.PublicationDate));

            var fields = {
                IsPushNotifed: true,
                PublicationDateDisplay: time.toString().concat(minutesAgo),
                Author: {
                    ImageResponse: post.Author.Image
                }
            };
            var result = $.extend(true, fields, post);
            return result;
        };

        var timeSince = function (date) {
            var seconds = Math.floor((new Date() - date) / 1000);
            var result = Math.floor(seconds / 60);
            return result;
        };

        return _this;
    };
}());


(function () {
    FXStreet.Class.Patterns.Singleton.PushTT = (function () {
        var instance;

        var pushTT = function () {
            var parent = FXStreet.Class.Base(),
               _this = FXStreet.Util.extendObject(parent);

            var Symbols = []; //{ symbolId: '', pushType: '', callbacks:[], lastValue: '' }

            var securityTokenUrl = FXStreet.Resource.TeletraderSecurityUrl;
            var ttPush = null;
            var initializedCallBackList = [];

            _this.init = function (json) {
                _this.setSettingsByObject(json);
                start();
            };

            var start = function () {
                tokenCallback(ttPushInitialize);
            };

            var tokenCallback = function (tokenSuccessCallback) {
                var auth = FXStreet.Class.Patterns.Singleton.Authorization.Instance();
                auth.getTokenPromise()
                    .then(function (token) {
                        $.ajax({
                            type: "GET",
                            url: securityTokenUrl,
                            beforeSend: function (xhr) {
                                xhr.setRequestHeader("Authorization", token.token_type + ' ' + token.access_token);
                            }
                        }).done(function (token) {
                            tokenSuccessCallback(token.Token);
                        });
                });
            };
            
            var ttPushInitialize = function (token) {
                var timeZoneManager = FXStreet.Class.Patterns.Singleton.TimeZoneManager.Instance();
                var ttTZValue = timeZoneManager.GetTTTimeZoneValue();

                ttPush = new FXStreet.ExternalLib.Teletrader.Push({
                    token: token,
                    tokenCallback: tokenCallback
                });
                ttPush.SetOptions({
                    'pushurl': FXStreet.Resource.DataProviderUrl,
                    'symbolfids': getFidsByPushType(),
                    'timeZone': ttTZValue
                    //,'loglevel': 'debug'
                });

                ttPush.addEventListener("status", function (status) {
                    var aloji = status;
                    //console.log('status.statusType: ' + status.statusType + ", status.message: " + JSON.stringify(status.message));
                    //if (status.message.error) {
                    //    console.log('status.message.error: ' + status.message.error);
                    //}
                });

                if (initializedCallBackList.length > 0) {
                    ttPush.startBatch();
                    for (var i = 0; i < initializedCallBackList.length; i++) {
                        subscribePrivate([initializedCallBackList[i]]);
                    }
                    ttPush.endBatch();
                    initializedCallBackList = [];
                }
            };

            _this.Subscribe = function (symbolIds, priceChangeCallback, elementType) {
                var symbolToSubscribe = [];
                for (var i = 0; i < symbolIds.length; i++) {
                    var symbol = getOrCreateSymbol(symbolIds[i], elementType);
                    addCallback(symbol, priceChangeCallback);
                    if (symbol.lastValue !== null) {
                        priceChangeCallback($.extend({}, symbol.lastValue));
                    }
                    else {
                        symbolToSubscribe.push(symbol);
                    }
                }
                if (symbolToSubscribe.length > 0 && initialized()) {
                    ttPush.startBatch();
                    subscribePrivate(symbolToSubscribe);
                    ttPush.endBatch();
                }
                else {
                    for (var i = 0; i < symbolToSubscribe.length; i++) {
                        initializedCallBackList.push(symbolToSubscribe[i]);
                    }
                }
            };

            var initialized = function () {
                return ttPush !== null;
            };

            var getOrCreateSymbol = function (symbolId, elementType) {
                var symbol = {};
                var symbolValues = $.grep(Symbols, function (symbol) {
                    return symbol.symbolId === symbolId;
                });
                if (symbolValues.length > 0) {
                    symbol = symbolValues[0];
                }
                else{
                    var pushType = getPushType(elementType);
                    var symbol = {
                        'symbolId': symbolId,
                        'callbacks': [],
                        'pushType': pushType,
                        'elementType':elementType,
                        'lastValue': null
                    };
                    Symbols.push(symbol);
                }
                return symbol;
            };

            var addCallback = function (symbol, priceChangeCallback) {
                var callbackValues = $.grep(symbol.callbacks, function (c) {
                    return c === priceChangeCallback;
                });
                if (callbackValues.length === 0) {
                    symbol.callbacks.push(priceChangeCallback);
                }
            };

            var getPushType = function(elementType) {
                if (elementType === "fxs_widget_full" || elementType === "fxs_widget_bigToolbar") {
                    return 'Everything';
                }
                return 'Snapshot';
            };

            _this.Unsubscribe = function (symbolIds, priceChangeCallback) {
                var symbolToUnsubscribe = [];
                for (var i = 0; i < symbolIds.length; i++) {
                    var symbol = Symbols.findFirst(function (s) {
                        return s.symbolId === symbolIds[i];
                    });
                    if (symbol) {
                        var callbackValues = $.grep(symbol.callbacks, function (c) {
                            return c !== priceChangeCallback;
                        });
                        if (callbackValues.length === 0) {
                            Symbols = $.grep(Symbols, function (s) {
                                return s !== symbol;
                            });
                            symbolToUnsubscribe.push(symbol);
                        }
                        else {
                            symbol.callbacks = callbackValues;
                        }
                    }
                }
                if (symbolToUnsubscribe.length > 0 && initialized()) {
                    ttPush.startBatch();
                    unsubscribePrivate(symbolToUnsubscribe);
                    ttPush.endBatch();
                }
            };

            var unsubscribePrivate = function (symbols) {
                var mainSymbols = [];
                for (var i = 0; i < symbols.length; i++) {
                    if (symbols[i] !== undefined && symbols[i].symbolId !== undefined) {
                        mainSymbols.push(getMainSymbolFormat(symbols[i].symbolId));
                    }
                }
                ttPush.unsubscribe([{
                    symbolID: mainSymbols,
                    callback: ttCallback,
                }]);
            };

            var subscribePrivate = function (symbols) {
                if (symbols.length == 0) {
                    return;
                }
                var mainSymbols = [];
                for (var i = 0; i < symbols.length; i++) {
                    if (symbols[i] !== undefined && symbols[i].symbolId !== undefined) {
                        mainSymbols.push(getMainSymbolFormat(symbols[i].symbolId));
                    }
                }
                ttPush.subscribe([{
                    symbolID: mainSymbols,
                    callback: ttCallback,
                    filterFields: {
                        FIDs: getFidsByPushType(symbols[0]),
                        SymbolSnapshot: getSymbolSnapshot(symbols[0]),
                        PushType: symbols[0].pushType
                    }
                }]);
            };

            var getFidsByPushType = function (symbol) {
                if (symbol && symbol.pushType === 'Everything') {
                    return ["last", "dateTime", "tradeVolume"];
                }
                else {
                    return ["high", "open", "bid", "ask", "last", "low", "change", "changePercent", "dateTime", "volume", "tradeVolume"];
                }
            };

            var getSymbolSnapshot = function (symbol) {
                return symbol.pushType !== 'Everything';
            }

            var getMainSymbolFormat = function (symbolId) {
                var result = !symbolId.match("cc{(.*)}")? symbolId.substring(4) : symbolId;
                return result;
            }

            var ttCallback = function (msg) {
                var json = convert(msg);
                var symbolValues = $.grep(Symbols, function (s) {
                    return s.symbolId === json.symbolId;
                });
                for (var i = 0; i < symbolValues.length; i++) {
                    executeCallbacksForSymbol(symbolValues[i], json);
                };
            };

            var executeCallbacksForSymbol = function(symbolItem, json) {
                updateLastValue(symbolItem, json);
                for (var i = 0; i < symbolItem.callbacks.length; i++) {
                    symbolItem.callbacks[i]($.extend({}, symbolItem.lastValue));
                };
            };

            var convert = function (msg) {
                var updateDateTime = function () {
                    if (msg.data.dateTime) {
                        var dateTime = msg.data.dateTime;

                        var spaceArr = dateTime.split(" ");
                        var d = spaceArr[0];
                        var t = spaceArr[1];

                        var dateArr = d.split(".");
                        var day = dateArr[0];
                        var month = dateArr[1] - 1;
                        var year = dateArr[2];

                        var timeArr = t.split(":");
                        var hours = timeArr[0];
                        var minutes = timeArr[1];
                        var seconds = timeArr[2];

                        var date = new Date(year, month, day, hours, minutes, seconds);
                        result.dateTime = date;
                    }
                }

                var updateCandleData = function () {
                    var data = msg.data.bar ? msg.data.bar : msg.data;
                    if (data.volume) {
                        result.volume = data.volume;
                    }
                    if (data.close) {
                        result.close = data.close;
                    }
                    if (data.open) {
                        result.open = data.open;
                    }
                    if (data.low) {
                        result.low = data.low;
                    }
                    if (data.high) {
                        result.high = data.high;
                    }
                };

                var updateTickData = function () {
                    if (msg.data.last) {
                        result.last = msg.data.last;
                    }
                    if (msg.data.bid) {
                        result.bid = msg.data.bid;
                    }
                    if (msg.data.ask) {
                        result.ask = msg.data.ask;
                    }
                    if (msg.data.change) {
                        result.change = msg.data.change;
                    }
                    if (msg.data.changePercent) {
                        result.changePercent = msg.data.changePercent;
                    }
                    if (msg.data.tradeVolume) {
                        result.tradeVolume = msg.data.tradeVolume;
                    }
                };

                var result = {
                    symbolId: "tts-" + msg.data.symbolId
                };

                updateCandleData();
                updateTickData();
                updateDateTime();

                return result;
            };

            var updateLastValue = function (symbolItem, msgJson) {
                if (!symbolItem.lastValue) {
                    symbolItem.lastValue = {};
                }
                $.each(msgJson, function (key, value) {
                    symbolItem.lastValue[key] = value;
                });
            };

            return _this;
        };

        function createInstance() {
            var object = pushTT();
            object.init({});
            return object;
        }

        return {
            Instance: function () {
                if (!instance) {
                    instance = createInstance();
                }
                return instance;
            }
        };
    })();
}());
(function () {
    FXStreet.Class.Quote = function () {
        var parent = FXStreet.Class.Base(),
            _this = FXStreet.Util.extendObject(parent);

        _this.ItemUrl = '';
        _this.Url = FXStreet.Resource.FxsApiRoutes["AnalysisItemGetItemByUrl"];
        _this.HtmlTemplate = 'quote.html';

        _this.init = function (json) {
            _this.setSettingsByObject(json);
            _this.setVars();
        };


        _this.generateHtml = function (callbackFunction) {
            _this.callPostApi().done(function (data) {
                _this.htmlRender(data, callbackFunction);
            });
        };

        _this.callPostApi = function () {
            var url = _this.ItemUrl.trim().toLowerCase();
            var i;
            if (url.indexOf("://") > -1) {
                for (i = 0; i < 2; i++) { url = url.substring(url.indexOf("/") + 1, url.length); };
            }
            for (i = 0; i < 2; i++) { url = url.substring(url.indexOf("/") + 1, url.length); };

            var data = {
                "Url": url,
                "Culture": FXStreet.Resource.CultureName
            };

            return $.ajax({
                type: "GET",
                url: _this.Url,
                data: data,
                contentType: "application/json; charset=utf-8",
                dataType: "json"
            });
        };

        _this.htmlRender = function (data, callbackFunction) {
            FXStreet.Util.loadHtmlTemplate(_this.HtmlTemplate).done(function (template) {
                var html = FXStreet.Util.renderByHtmlTemplate(template, data);
                callbackFunction(html);
            });
        };

        return _this;
    };
}());
(function () {

    FXStreet.Class.Patterns.Singleton.LoadAssets = (function () {
        var instance;

        var assetLoadClass = function () {
            var assets;
            var promise;
            var apiAssetGetAssets = "/api/assetapi/getassets";

            this.getAssets = function () {
                if (assets) {
                    return $.when(assets);
                }
                else {
                    if (!promise) {
                        promise = $.ajax({
                            type: "GET",
                            url: FXStreet.Util.createUrl(apiAssetGetAssets),
                            cache: true
                        }).then(function (data) {
                            assets = data;
                            promise = null;
                            return assets;
                        });
                    }
                    return promise;
                }
            };
        };

        return {
            getInstance: function () {
                if (!instance) {
                    instance = new assetLoadClass();
                }
                return instance;
            }
        };
    })();

    FXStreet.Class.RateMapper = function () {
        var parent = FXStreet.Class.Base(),
           _this = FXStreet.Util.extendObject(parent);

        _this.PairName = '';
        _this.PriceProviderCode = '';
        _this.DecimalPlaces = 4;
        _this.LastPrice = null;
        _this.LastBid = null;
        _this.LastAsk = null;
        _this.LastClose = null;
        const priceUpCssClass = "price_up";
        const priceDownCssClass = "price_down";
        const changeTendencyUpCssClass = "up";
        const changeTendencyDownCssClass = "down";
        const changePercentUpCssClass = "fxs_chg_up";
        const changePercentDownCssClass = "fxs_chg_down";

        _this.createJsonFromMsg = function (msg) {
            var bidMsg = msg.bid ? msg.bid : msg.last;
            var askMsg = msg.ask ? msg.ask : msg.last;

            var result =
            {
                Study:
                {
                    PairName: _this.PairName,
                    PriceProviderCode: _this.PriceProviderCode,
                    PriceStatics:
                    {
                        Volume: msg.volume,
                        Open: getValueFormat(msg.open),
                        Close: getValueFormat(msg.close),
                        High: getValueFormat(msg.high),
                        Low: getValueFormat(msg.low),
                        Last: msg.last,
                        Bid: msg.bid,
                        Ask: msg.ask,
                        BidAsk: null,
                        Change: msg.change,
                        BidBigFigure: getBigFigure(bidMsg),
                        BidSmallFigure: getSmallFigure(bidMsg),
                        AskBigFigure: getBigFigure(askMsg),
                        AskSmallFigure: getSmallFigure(askMsg),
                        ChangePercent: changePercentRounded(msg.changePercent),
                        ChangePercentWithSymbol: changePercentWithSymbol(msg.changePercent),
                        ChangePercentDisplay: changePercentDisplayFormated(msg.changePercent),
                        ChangePercentClass: msg.changePercent > 0 ? changePercentUpCssClass : changePercentDownCssClass,
                        LastClass: getPriceClass(_this.LastPrice, msg.last),
                        BidClass: getPriceClass(_this.LastBid, msg.bid),
                        AskClass: getPriceClass(_this.LastAsk, msg.ask),
                        PriceClass: msg.changePercent > 0 ? priceUpCssClass : priceDownCssClass,
                        ChangeTendencyClass: getChangeTendencyClass(msg.last)
                    }
                }
            };
            updateBidAsk(result.Study.PriceStatics, bidMsg);
            _this.LastPrice = msg.last;
            _this.LastBid = msg.bid;
            _this.LastAsk = msg.ask;
            _this.LastClose = msg.close;

            return result;
        };

        var getPriceClass = function (oldValue, newValue) {
            if (!oldValue || !newValue)
                return;
            var result = parseFloat(newValue) > parseFloat(oldValue) ? priceUpCssClass : priceDownCssClass;
            return result;
        };

        var updateBidAsk = function (priceStatics, msgBid) {
            var lenBig = priceStatics.BidBigFigure != null ? priceStatics.BidBigFigure.length : 0;
            var lenSmall = priceStatics.BidSmallFigure != null ? priceStatics.BidSmallFigure.length : 0;
            var lenTotal = lenBig + lenSmall;
            priceStatics.BidAsk = msgBid.substring(0, msgBid.length - lenTotal);
        };

        var getBigFigure = function (str) {
            var result = null;
            var length = str.length;
            if (hasSmallFigure(str)) {
                length = length - 1;
            }
            var min = Math.min(length, 2);
            result = str.substring(length - min, length);

            return result;
        };
        var getSmallFigure = function (str) {
            var result = null;
            if (hasSmallFigure(str)) {
                result = str.substring(str.length - 1, str.length);
            }
            return result;
        };
        var hasSmallFigure = function (str) {
            var result = str.length > 3;
            return result;
        };
        var changePercentRounded = function (value) {
            if (value) {
                return Math.round(value * 100) / 100;
            }
        };

        var changePercentWithSymbol = function (value) {
            var changePercent = changePercentRounded(value);
            if (changePercent !== undefined) { return changePercent + '%'; }
        };

        var changePercentDisplayFormated = function (value) {
            var changePercent = changePercentRounded(value);
            if (changePercent !== undefined) {
                return '(' + changePercent + '%)';
            }
        };
        var getChangeTendencyClass = function (last) {
            var result = "";
            if (_this.LastPrice !== null &&
                _this.LastPrice !== "" &&
                last !== "" &&
                _this.LastPrice !== last) {
                result = parseFloat(_this.LastPrice) > parseFloat(last)
                    ? changeTendencyUpCssClass : changeTendencyDownCssClass;
            }
            return result;
        };

        var getValueFormat = function (str) {
            if (str) {
                var result = str;
                var indexOf = str.indexOf(".");
                if (indexOf > -1) {
                    result = str.substr(0, (indexOf + 1) + _this.DecimalPlaces);
                }
                return result;
            }
        };

        return _this;
    };
    FXStreet.Class.RateService = function () {
        var parent = FXStreet.Class.Base(),
            _this = FXStreet.Util.extendObject(parent);

        _this.PairName = '';
        _this.PriceProviderCode = '';
        _this.AlreadySubscribed = false;
        _this.ChangeCallback = null;
        _this.DecimalPlaces = 4;

        _this.PushTTObj = null;

        _this.RateMapper = null;

        _this.init = function (json) {
            _this.setSettingsByObject(json);
            _this.setVars();
            _this.RateMapper.init(json);
        };

        _this.setVars = function () {
            _this.PushTTObj = FXStreet.Class.Patterns.Singleton.PushTT.Instance();
            _this.RateMapper = new FXStreet.Class.RateMapper();
        };

        _this.subscribeToChannel = function () {
            _this.PushTTObj.Subscribe([_this.PriceProviderCode], _this.priceChangeCallback);
        };

        _this.unsubscribeToChannel = function () {
            _this.PushTTObj.Unsubscribe([_this.PriceProviderCode], _this.priceChangeCallback);
        };

        _this.initializedCallBack = function () {
            _this.subscribeToChannel();
        };

        _this.priceChangeCallback = function (message) {
            var json = _this.RateMapper.createJsonFromMsg(message);
            if (typeof _this.ChangeCallback === 'function') {
                _this.ChangeCallback(json);
            }
        };
        return _this;
    };
    FXStreet.Class.SingleRateManager = function () {
        var parent = FXStreet.Class.Base(),
            _this = FXStreet.Util.extendObject(parent);

        _this.ContainerId = "";
        _this.HtmlTemplateFile = "";
        _this.PairName = "";
        _this.PriceProviderCode = "";
        _this.MustSubscribeAtInit = false;
        _this.RenderAtInit = false;
        _this.DecimalPlaces = 4;
        _this.SEO = {};
        _this.Translations = {};
        _this.Data = null;

        _this.RateService = null;

        _this.init = function (json) {
            _this.setSettingsByObject(json);
            _this.setVars();
            if (_this.RenderAtInit) {
                _this.render();
            }
            if (_this.MustSubscribeAtInit) {
                _this.Subscribe();
            }
        };

        _this.setVars = function () {
            if (_this.Data != null) {
                _this.PairName = _this.Data.Value.Title;
                _this.PriceProviderCode = _this.Data.Value.PriceProviderCode;
                _this.DecimalPlaces = _this.Data.Value.DecimalPlaces;
            } else {
                _this.Data = {
                    Value: {
                        Title: _this.PairName,
                        PriceProviderCode: _this.PriceProviderCode,
                        SEO: _this.SEO
                    },
                    Translations: _this.Translations
                };
            }

            _this.RateService = _this.createRateService(_this.PairName, _this.PriceProviderCode);
        };

        _this.render = function (jsonRateData) {
            if (jsonRateData != undefined) {
                _this.UpdateRateData(jsonRateData);
            }
            _this.htmlRender(_this.Data);
        };

        _this.htmlRender = function (json) {
            if (_this.ContainerId !== "") {
                _this.Container = FXStreet.Util.getjQueryObjectById(_this.ContainerId, false);

                if (_this.Container && _this.Container.length > 0) {
                    FXStreet.Util.loadHtmlTemplate(_this.HtmlTemplateFile).done(function (template) {
                        var rendered = FXStreet.Util.renderByHtmlTemplate(template, json);
                        var elementToRender = _this.Container.children("[fxs-ratedata-widget]");
                        if (elementToRender.length > 0) {
                            elementToRender[0].outerHTML = rendered;
                        } else {
                            _this.Container.html(rendered);
                        }
                    });
                }
            }
        };

        _this.SingleRateCallback = function (jsonRateData) {
            _this.render(jsonRateData);
        };

        _this.createRateService = function (pairName, priceProviderCode) {
            var rateService = new FXStreet.Class.RateService();
            rateService.init({
                'PairName': pairName,
                'PriceProviderCode': priceProviderCode,
                'DecimalPlaces': _this.DecimalPlaces,
                'ChangeCallback': _this.SingleRateCallback
            });

            return rateService;
        };

        _this.Subscribe = function () {
            _this.RateService.subscribeToChannel();
        };

        _this.Unsubscribe = function () {
            if (_this.RateService != null)
                _this.RateService.unsubscribeToChannel();
        };

        _this.UpdateRateData = function (jsonRateData) {
            if (_this.Data.RateData === undefined) {
                _this.Data.RateData = jsonRateData;
            } else {
                var priceStatics = jsonRateData.Study.PriceStatics;
                for (var data in priceStatics) {
                    if (priceStatics.hasOwnProperty(data) && priceStatics[data] !== undefined) {
                        _this.Data.RateData.Study.PriceStatics[data] = priceStatics[data];
                    }
                }
            }
        };

        return _this;
    };
    FXStreet.Class.MultiRateManager = function () {
        var parent = FXStreet.Class.Base(),
            _this = FXStreet.Util.extendObject(parent);

        _this.ContainerId = "";
        _this.TablePricesId = "fxs_table_prices";
        _this.HtmlTemplateFile = "";
        _this.AssetList = [];
        _this.DefaultAssetList = [];
        _this.MustSubscribeAtInit = false;
        _this.Translations = {};
        _this.DataList = [];

        _this.TitleContainerId = "";
        _this.Title = "";
        _this.ShowHeaders = false;
        _this.Filter = {};
        _this.FilterJson = {};
        _this.FilterManager = null;
        _this.InitialFilterValues = [];
        var userPersonalizationManager = null;

        _this.init = function (json) {
            _this.setSettingsByObject(json);
            _this.setVars();
            _this.render();

            if (_this.MustSubscribeAtInit) {
                subscribe();
            }
        };

        _this.setVars = function () {
            _this.TitleContainerId = "fxs_rate_widget_title_" + _this.ContainerId;

            userPersonalizationManager = FXStreet.Class.Patterns.Singleton.UserPersonalizationManager.Instance();

            $.each(_this.AssetList, function (index, value) {
                value.Service = createRateService(value)
            });

            if (_this.Filter && _this.Filter.ShowFilter) {
                _this.DefaultAssetList = _this.AssetList;
                createFilter();
                _this.AssetList = getAssetListByUserSetting();
            }
            loadData();
        };

        var getAssetListByUserSetting = function () {
            var result = _this.AssetList;
            if (_this.FilterManager != null) {
                var assets = getAssetsUserSetting();
                if (assets && Object.keys(assets).length > 0) {
                    result = convertToAssetList(assets);
                }
            }
            return result;
        };

        var getAssetsUserSetting = function () {
            var result = userPersonalizationManager.GetAssetsMultiRateSetting();
            return result;
        };

        var convertToAssetList = function (assets) {
            var result = [];
            Object.values(assets).forEach(function (asset) {
                var data = convertToDataAsset(asset);
                result.push(data);
            });
            return result;
        };

        var convertToDataAsset = function (data) {
            var baseUrl = _this.DefaultAssetList[0].SEO.FullUrl;
            var result = {
                AssetId: data.id,
                DecimalPlaces: data.decimalPlaces,
                PairName: data.display,
                PriceProviderCode: data.priceProviderCode,
                SEO: {
                    FullUrl: baseUrl.substr(0, baseUrl.lastIndexOf("/") + 1).concat(data.url),
                    MetaDescription: data.display,
                    MetaTitle: data.display,
                    KeyWords: null
                },
                PriceStatics: []
            };
            result.Service = createRateService(result);
            return result;
        };

        var createRateService = function (asset) {
            var result = new FXStreet.Class.RateService();
            result.init({
                'PairName': asset.PairName,
                'PriceProviderCode': asset.PriceProviderCode,
                'DecimalPlaces': asset.DecimalPlaces,
                'ChangeCallback': _this.SingleRateCallback
            });
            return result;
        };

        var loadData = function () {
            _this.DataList = [];
            for (var i = 0; i < _this.AssetList.length; i++) {
                var asset = _this.AssetList[i];
                var data = getDataListItem(asset);
                _this.DataList.push(data);
            }
        };

        var getDataListItem = function (asset) {
            var result = {
                Value: {
                    Title: asset.PairName,
                    PriceProviderCode: asset.PriceProviderCode,
                    DecimalPlaces: asset.DecimalPlaces,
                    SEO: asset.SEO
                },
                Translations: _this.Translations,
                RateData: {
                    Study: {
                        PriceStatics: asset.PriceStatics
                    }
                }
            };
            return result;
        };

        var createFilter = function () {
            var filterSectionId = "price-filter-block_" + _this.ContainerId;
            _this.FilterJson = {
                DefaultAssets: getDefaultValues(),
                FindBy_Options: _this.Filter.FindOptions,
                SelectedAssetsId: "fxs_selected_assets_" + _this.ContainerId,
                ApplyFilterId: "fxs_apply_filter_" + _this.ContainerId,
                ClearFilterId: "fxs_clear_filter_" + _this.ContainerId,
                AdvancedFilterId: "fxs_advanced_filter_" + _this.ContainerId,
                CloseAdvancedFilterId: "fxs_close_filter_" + _this.ContainerId,
                FilterSectionId: filterSectionId,
                GetAssetsUserSettingDelegate: getAssetsUserSetting,
                OptionSelectedDelegate: _this.filterChanged,
                TablePricesId: _this.TablePricesId,
                TypeaheadJsonInitialization:
                {
                    TypeaheadId: "fxs_typeahead_" + _this.ContainerId,
                    TypeaheadInputTargetId: "typeaheadTarget_" + _this.ContainerId,
                    TypeaheadFilterButtonId: "fxs_btn_filter_" + _this.ContainerId,
                    TypeaheadCancelButtonId: "fxs_dismissQuery_" + _this.ContainerId,
                    SelectedTypeaheadId: "",
                    PlaceholderText: _this.Translations.AddPairsToList
                },
                Translations: _this.Translations,
                AssetsAddedId: "fxs_filter_assets_added" + _this.ContainerId,
                ModalContainerId: "fxs_filter_modal" + _this.ContainerId,
                PopupContainerId: "fxs_filter_popup" + _this.ContainerId,
                PopupApplyId: "fxs_filter_popup_apply" + _this.ContainerId,
                PopupCancelId: "fxs_filter_popup_cancel" + _this.ContainerId,
                FilterStateLabelId: _this.TitleContainerId,
                DefaultWidgetTitle: _this.Title
            }

            _this.FilterManager = new FXStreet.Class.RatesFilter();
        };

        var getDefaultValues = function () {
            var result = {};
            $.each(_this.DefaultAssetList, function (index, value) {
                result[value.AssetId] = {
                    display: value.PairName,
                    priceProviderCode: value.PriceProviderCode,
                    decimalPlaces: value.DecimalPlaces,
                    id: value.AssetId,
                    url: value.Url
                };
            });
            return result;
        };

        var initFilter = function () {
            convertFindOptions();
            _this.FilterManager.init(_this.FilterJson);
        };

        var convertFindOptions = function () {
            $.each(_this.Filter.FindOptions,
                function (index, option) {
                    option.FindBy_FxsApiRoute = option.Route;
                });
        };

        _this.filterChanged = function (selectedAssets) {
            var assets = (selectedAssets && Object.keys(selectedAssets).length > 0)
                ? selectedAssets : getDefaultValues();
            removeItemsInAssetList(assets);
            addItemsToAssetList(assets);
            saveUserSetting(selectedAssets);
            loadData();
            renderList();
        };

        var removeItemsInAssetList = function (selectedAssets) {
            $.each(_this.AssetList, function (i, assetItem) {
                if (!selectedAssets.hasOwnProperty(assetItem.AssetId)) {
                    assetItem.Service.unsubscribeToChannel();
                }
            });
            _this.AssetList = [];
        };

        var addItemsToAssetList = function (selectedAssets) {
            $.each(selectedAssets, function (key, value) {
                if ($.grep(_this.AssetList, function (asset) { return asset.AssetId === key; }).length === 0) {
                    var data = convertToDataAsset(value);
                    _this.AssetList.push(data);
                    data.Service.subscribeToChannel();
                }
            });
        };

        var saveUserSetting = function (selectedAssets) {
            if (selectedAssets && Object.keys(selectedAssets).length > 0) {
                var setting = {};
                $.each(selectedAssets, function (key, value) {
                    setting[key] = {
                        display: value.display,
                        decimalPlaces: value.decimalPlaces,
                        priceProviderCode: value.priceProviderCode,
                        id: key,
                        url: value.url
                    };
                });
                userPersonalizationManager.SetAssetsMultiRateSetting(setting);
            }
            else {
                userPersonalizationManager.RemoveAssetsMultiRateSetting();
            }
        };

        var subscribe = function () {
            _this.AssetList.forEach(function (item) {
                item.Service.subscribeToChannel();
            });
        };

        _this.render = function () {
            var json = {
                TitleContainerId: _this.TitleContainerId,
                Title: _this.Title,
                TablePricesId: _this.TablePricesId,
                ShowFilter: _this.Filter.ShowFilter,
                FilterJson: _this.FilterJson,
                ShowHeaders: _this.ShowHeaders,
                Translations: _this.Translations
            };

            if (_this.ContainerId !== "") {
                _this.Container = FXStreet.Util.getjQueryObjectById(_this.ContainerId, false);

                if (_this.Container != null) {
                    var templateFile = _this.HtmlTemplateFile;

                    FXStreet.Util.loadHtmlTemplate(templateFile).done(function (template) {
                        var rendered = FXStreet.Util.renderByHtmlTemplate(template, json);

                        var elementToRender = _this.Container.children("[fxs-ratedata-widget]");
                        if (elementToRender.length > 0) {
                            elementToRender[0].outerHTML = rendered;
                        } else {
                            _this.Container.html(rendered);
                        }
                        if (_this.FilterManager != null) {
                            initFilter();
                        }

                        renderList();
                    });
                }
            }
        };

        var renderRateData = function (jsonRateData) {
            if (jsonRateData != undefined) {
                var datas = $.grep(_this.DataList,
                    function (current) {
                        return current.Value.Title === jsonRateData.Study.PairName;
                    });
                if (datas.length > 0) {
                    var dataToUpdate = datas[0];
                    if (dataToUpdate.RateData === undefined) {
                        dataToUpdate.RateData = jsonRateData;
                    }
                    else {
                        var priceStatics = jsonRateData.Study.PriceStatics;
                        for (var data in priceStatics) {
                            if (priceStatics.hasOwnProperty(data) && priceStatics[data] !== undefined) {
                                dataToUpdate.RateData.Study.PriceStatics[data] = priceStatics[data];
                            }
                        }
                        dataToUpdate.RateData.Study.PriceStatics.DataAvailable = true;
                    }
                    renderAsset(dataToUpdate);
                }
            }
        };

        var renderList = function () {
            if (_this.ContainerId !== "") {
                _this.Container = FXStreet.Util.getjQueryObjectById(_this.ContainerId, false);

                if (_this.Container != null) {
                    _this.Container.find("tbody tr").remove();
                }
            }
            for (var j = 0; j < _this.DataList.length; j++) {
                var data = _this.DataList[j];
                data.ShowHeaders = _this.ShowHeaders;
                renderAsset(data);
            }
        };

        var trEventClick = function () {
            var rows = _this.Container.find(".fxs_widget_price");
            rows.unbind();
            rows.click(function () {
                var href = $(this).data("href");
                if (href) {
                    window.location = href;
                }
            });
        };

        var renderAsset = function (data) {
            if (_this.ContainerId !== "") {
                _this.Container = FXStreet.Util.getjQueryObjectById(_this.ContainerId, false);

                if (_this.Container != null) {
                    var assetName = data.Value.Title;
                    var templateFile = _this.HtmlTemplateFile.replace("multi", "single");
                    FXStreet.Util.loadHtmlTemplate(templateFile).done(function (template) {
                        var json = $.extend(true, data, _this.Translations);

                        var rendered = FXStreet.Util.renderByHtmlTemplate(template, json);

                        var trAsset = _this.Container.find("tr[data-asset-title='" + assetName + "']");
                        if (trAsset.length === 0) {
                            trAsset = $(rendered);
                            _this.Container.find("table").append(trAsset);

                        } else {
                            trAsset[0].outerHTML = rendered;
                        }
                        trEventClick();
                    });
                }
            }
        }

        _this.SingleRateCallback = function (jsonRateData) {
            if (_this.FilterManager == null || !_this.FilterManager.IsOpened) {
                renderRateData(jsonRateData);
            }
        };

        return _this;
    };
    FXStreet.Class.CtpButton = function () {

        _this.Render = function () {
            var result = $('<li>',
            {
                html: 'Current Trading Position',
                click: function () {
                    var idprefix = "ctp_signal_entry_";
                    var idprefixStopLoss = "ctp_signal_entry_stopLoss_";
                    var idprefixTakeProfit1 = "ctp_signal_entry_takeprofit1_";
                    var idprefixTakeProfit2 = "ctp_signal_entry_takeprofit2_";
                    var idprefixTakeProfit3 = "ctp_signal_entry_takeprofit3_";

                    if (ctpSignals.length > 0) {
                        $.each(ctpSignals,
                            function (i, signal) {
                                var line = _this.Chart.tradingLines.getTradingLineById(idprefix + signal.Id);
                                line.remove();
                                if (signal.StopLoss) {
                                    line = _this.Chart.tradingLines.getTradingLineById(idprefixStopLoss + signal.Id);
                                    line.remove();
                                }
                                if (signal.TakeProfit1) {
                                    line = _this.Chart.tradingLines.getTradingLineById(idprefixTakeProfit1 + signal.Id);
                                    line.remove();
                                }
                                if (signal.TakeProfit2) {
                                    line = _this.Chart.tradingLines.getTradingLineById(idprefixTakeProfit2 + signal.Id);
                                    line.remove();
                                }
                                if (signal.TakeProfit3) {
                                    line = _this.Chart.tradingLines.getTradingLineById(idprefixTakeProfit3 + signal.Id);
                                    line.remove();
                                }
                            });
                        ctpSignals = [];
                    } else {
                        var asset = getCurrentAsset();
                        if (asset) {
                            var url = _this.MarketToolsBaseUrl + 'v1/en/ctp/study/?assetids=' + asset.Id;
                            $.ajax(url).done(function (data) {
                                if (data) {
                                    ctpSignals = data.Values[0].Entries;
                                    $.each(ctpSignals,
                                        function (i, signal) {
                                            var isSell = signal.OrderDirection === "SELL" ||
                                                signal.OrderDirection === "SHORT";

                                            var line = _this.Chart.tradingLines
                                                .addLine({ id: idprefix + signal.Id, price: signal.Entry });
                                            var entryCssClass = isSell ? 'fxs_lineChart_sell' : 'fxs_lineChart_buy';
                                            line.settings.setOption("class", entryCssClass);

                                            var objetiveCssClass = !isSell ? 'fxs_lineChart_sell' : 'fxs_lineChart_buy';
                                            if (signal.StopLoss) {
                                                line = _this.Chart.tradingLines
                                                    .addLine({
                                                        id: idprefixStopLoss + signal.Id,
                                                        price: signal.StopLoss
                                                    });
                                                line.settings.setOption("class", objetiveCssClass);
                                            }
                                            if (signal.TakeProfit1) {
                                                line = _this.Chart.tradingLines
                                                    .addLine({
                                                        id: idprefixTakeProfit1 + signal.Id,
                                                        price: signal.TakeProfit1
                                                    });
                                                line.settings.setOption("class", objetiveCssClass);
                                            }
                                            if (signal.TakeProfit2) {
                                                line = _this.Chart.tradingLines
                                                    .addLine({
                                                        id: idprefixTakeProfit2 + signal.Id,
                                                        price: signal.TakeProfit2
                                                    });
                                                line.settings.setOption("class", objetiveCssClass);
                                            }
                                            if (signal.TakeProfit3) {
                                                line = _this.Chart.tradingLines
                                                    .addLine({
                                                        id: idprefixTakeProfit3 + signal.Id,
                                                        price: signal.TakeProfit3
                                                    });
                                                line.settings.setOption("class", objetiveCssClass);
                                            }
                                        });
                                }
                            });
                        }
                    }
                }
            });
            return result;
        };
        return _this;
    };
    FXStreet.Class.ChartService = function () {

        var parent = FXStreet.Class.Base(),
        _this = FXStreet.Util.extendObject(parent);


        _this.Symbols = null;

        _this.ChartId = "";
        _this.PairName = "";
        _this.PriceProviderCode = "";
        _this.WidgetType = "";
        _this.ChartOptions = null;
        _this.EnableCalendar = false;
        _this.EnableNews = false;
        _this.DisplayRSI = false;
        _this.DisplaySMA = false;
        _this.DisplayHistory = false;
        _this.ChartConfiguration = "";
        _this.SoundUrl = "";
        _this.MarketToolsBaseUrl = "";
        _this.PostI3ApiBaseUrl = "";
        _this.CalendarI3ApiBaseUrl = "";
        _this.CustomExtensions = null;
        _this.Chart = null;
        _this.PushTTObj = null;
        _this.loadedChart = false;
        _this.Assets = [];

        _this.init = function (json) {
            if (!FXStreet.ExternalLib.TTChart) {
                console.error("TTChartLibrary is not loaded");
                return;
            }
            _this.CustomExtensions = FXStreet.Class.ChartExtensions();
            _this.setSettingsByObject(json);
            _this.loadAssets();
        };

        _this.loadCalendar = function () {
            _this.CustomExtensions.LoadCalendar();
        }

        _this.loadNews = function (priceProviderCode) {
            _this.CustomExtensions.LoadNews(priceProviderCode);
        }

        _this.mapAssetsToSymbols = function (assets) {
            _this.Symbols = [['*|search|*', '']];
            for (var i = 0; i < assets.length; i++) {
                _this.Symbols.push([assets[i].Name, assets[i].PriceProviderCode]);
            }
        };

        _this.setVars = function () {
            _this.PushTTObj = FXStreet.Class.Patterns.Singleton.PushTT.Instance();
        };

        _this.loadChart = function () {
            _this.setVars();
            initializeChart().then(function () {
                _this.addEvents();
                _this.chartDisplay();

                var customExtensionsSettings = {
                    Assets: _this.Assets,
                    ChartId: _this.ChartId,
                    Chart: _this.Chart,
                    PostI3ApiBaseUrl: _this.PostI3ApiBaseUrl,
                    CalendarI3ApiBaseUrl: _this.CalendarI3ApiBaseUrl,
                    PriceProviderCode: _this.PriceProviderCode,
                    SoundUrl: _this.SoundUrl
                };

                _this.CustomExtensions.init(customExtensionsSettings);
            });
        };

        _this.chartDisplay = function () {
            if (_this.ChartConfiguration) {
                loadChartConfiguration(_this.ChartConfiguration);
            } else {
                _this.Chart.display();
            }
        };

        function loadChartConfiguration(url) {
            $.get(url).done(function (data) {
                _this.Chart.loadChartFromJSON(data);
            });
        }

        function initializeChart() {
            var chartCreationPromise = $.Deferred();
            if (FXStreet.ExternalLib.TTChart) {
                var chart = FXStreet.ExternalLib.TTChart.create({ id: _this.ChartId });
                chartCreationPromise.resolve(chart);
            } else {
                console.log("TTChart as deferred");
                FXStreet.Util.Deferreds.PendingTTChart.push({
                    Deferred: chartCreationPromise,
                    ChartId: _this.ChartId
                });
            }

            return chartCreationPromise.then(function (chart) {
                _this.Chart = chart;
                _this.ChartOptions["dialogs.limitingElementId"] = _this.ChartId;
                _this.ChartOptions["global.verticalAxisZoom"] = true;

                setTimezone();
                _this.Chart.setOptions(_this.ChartOptions);
                _this.Chart.setOption("history.show", _this.DisplayHistory);
                _this.setChartToolbar();
                _this.Chart.symbols.setMainSymbol(_this.PriceProviderCode, _this.PairName);
                _this.addChartIndicators();
            });
        };

        function setTimezone() {
            var timeZoneManager = FXStreet.Class.Patterns.Singleton.TimeZoneManager.Instance();
            var ttTZValue = timeZoneManager.GetTTTimeZoneValue();
            if (ttTZValue) {
                _this.Chart.setOption("data.timeZone", ttTZValue);
            }
        };

        _this.setChartToolbar = function () {
            if (_this.WidgetType === "fxs_widget_full" || _this.WidgetType === "fxs_widget_bigToolbar") {
                _this.Chart.setOption("toolbar.symbols", _this.Symbols);
                _this.Chart.setOption("toolbar.comparisons", _this.Symbols);
                _this.Chart.setOption("toolbar.dateRanges", FXStreet.Util.ChartWidgetConfig.toolbar.dateRanges);
                _this.Chart.setOption("toolbar.file", FXStreet.Util.ChartWidgetConfig.toolbar.file);
                var backgroundImageOpt = FXStreet.Util.ChartWidgetConfig.getBackgroundImage();
                if(backgroundImageOpt){
                    _this.Chart.setOption("main.background.image", backgroundImageOpt);
                }
                _this.Chart.addSettingListener("data.period", _this.periodChanged);
            }
        };

        _this.addChartIndicators = function () {
            if (_this.DisplaySMA === true) {
                _this.Chart.symbols.addIndicator("sma", { period: 100, shift: 0 });
            }
            if (_this.DisplayRSI === true) {
                _this.Chart.symbols.addIndicator("rsi", "14", "70", "30", "1");
            }
        };

        _this.addEvents = function () {
            if (_this.WidgetType === "fxs_widget_full" || _this.WidgetType === "fxs_widget_bigToolbar") {
                _this.Chart.addEventListener("setMainSymbol", _this.setMainSymbol);
                _this.Chart.addEventListener("addComparison", _this.addComparison);
                _this.Chart.addEventListener("comparisonRemove", _this.comparisonRemove);
                _this.Chart.addEventListener("newBarCreated", _this.newBarCreated);
            }
            _this.Chart.addEventListener("eventClicked", _this.CustomExtensions.OnEventClicked);
            _this.Chart.addTemporaryEventListener('display', _this.display);
             _this.Chart.addEventListener("symbolRequested", _this.symbolRequested);
        };

        _this.symbolRequested = function (e) {
            if (console)
                console.log(e);

            var auth = FXStreet.Class.Patterns.Singleton.Authorization.Instance();
            auth.getTokenPromise()
                .then(function (token) {
                    var timeZone = _this.Chart.getOption("data.timeZone");
                    var url = FXStreet.Resource.TeletraderPriceProviderUrl
                        + "?request=HISTORY" + ' ' + e.symbolId + ' ' + e.period + ' ' + e.numberOfBars + ' ' + e.dateRange
                        + '&dataLoader=ttws&timeZone=' + encodeURIComponent(timeZone);

                    $.ajax({
                        type: "GET",
                        url: url,
                        beforeSend: function (xhr) {
                            xhr.setRequestHeader("Authorization", token.token_type + ' ' + token.access_token);
                        }
                    }).then(function (historicData) {
                        var candles = [];
                        var candleSplit = historicData.split('\n');
                        for (var i = 1; i < candleSplit.length - 1; i++) {
                            try {
                                const barParts = candleSplit[i].split(';');
                                const isTickFormat = barParts.length < 5;
                                const dt = barParts[0].split('-');

                                var candle = {
                                    dateTime: new Date(dt[0], dt[1] - 1, dt[2], dt[3], dt[4], dt[5] || 0, dt[6] || 0),
                                    open: parseFloat(barParts[1]),
                                    high: parseFloat(barParts[isTickFormat ? 1 : 2]),
                                    low: parseFloat(barParts[isTickFormat ? 1 : 3]),
                                    close: parseFloat(barParts[isTickFormat ? 1 : 4]),
                                    volume: parseFloat(barParts[isTickFormat ? 2 : 5]),
                                    openInterest: parseInt(barParts[6])
                                };
                                candles.push(candle);
                            }
                            catch (ex) {
                                console.log(ex);
                            }
                        }
                        e.setHistory({
                            data: candles
                        });
                    }, function (error) {
                        console.log(error);
                    });
                });
        };

        _this.display = function () {
            if (!_this.loadedChart) {
                _this.loadedChart = true;
                _this.PushTTObj.Subscribe([_this.PriceProviderCode], _this.addTick, _this.WidgetType);
                if (_this.WidgetType === "fxs_widget_full" || _this.WidgetType === "fxs_widget_bigToolbar") {
                    $('div.tt_fullscreen').on('click', fullScreenClick);
                    addChartExportSettingToFile();
                    _this.CustomExtensions.AddButtons();
                }
            }
        };

        _this.hide = function () {
            if (_this.loadedChart) {
                _this.loadedChart = false;
                _this.PushTTObj.Unsubscribe([_this.PriceProviderCode], _this.addTick);
            }
        };

        var fullScreenClick = function () {
            if ($('div.tt_fullscreen').attr('data-checked') === "on") {
                $('.tt_chartContainer').css({
                    "top": "0",
                    "bottom": "0"
                });
                $('.fxs_modal_wrap').css("top", "0");
                $('.fxs_bgHeader').css("z-index", "0");
                $('.fxs_modal_footer').css("z-index", "0");
            } else {
                $('.fxs_modal_wrap').css("top", "45px");
                $('.fxs_bgHeader').css("z-index", "6");
                $('.fxs_modal_footer').css("z-index", "6");
            }
        };

        var addChartExportSettingToFile = function () {
            if (FXStreet.Resource.UserInfo.IsBackendUser === true) {
                var fileMenu = $('.tt_file ul');
                if (fileMenu) {
                    var downloadLi = $('<li/>', { html: 'Download Config' });
                    downloadLi.click(exportConfig);
                    fileMenu.append(downloadLi);
                }
            }
        };

        _this.newBarCreated = function () {
            _this.CustomExtensions.ActivateSound();
        };

        var exportConfig = function () {
            var config = _this.Chart.getChartAsJSON();
            var date = new Date().getTime();
            var fileName = _this.PairName.replace(/\//g, '_') + '_' + date + '.json';

            FXStreet.Util.DownloadFileFromJsonObject(fileName, config);
        };

        _this.addTick = function (msg) {
            if (_this.Chart != null && _this.loadedChart) {
                var tickmsg = {
                    symbolId: msg.symbolId,
                    last: msg.last,
                    dateTime: msg.dateTime,
                    volume: msg.tradeVolume
                };
                _this.Chart.addTick(tickmsg);
                updatePageTitle(msg);
            }
        };

        var updatePageTitle = function (msg) {
            if (_this.WidgetType === "fxs_widget_full" && msg.symbolId === _this.PriceProviderCode) {
                var title = _this.PairName + ': ' + msg.last;
                if (!isNaN(msg.changePercent)) {
                    if (msg.changePercent < 0)
                        title += ' ▼ ';
                    else {
                        title += ' ▲ ';
                    }
                    title += Number(msg.changePercent).toFixed(2) + '%';
                }
                document.title = title + ' - FXStreet';
            }
        };

        _this.setMainSymbol = function (objValue) {
            if (objValue !== "" && objValue != undefined) {
                if (objValue.oldId != undefined) {
                    _this.Chart.clearAllEvents();

                    _this.Chart.setOption("markers.load", false);
                    _this.Chart.setOption("markers.visibleTypes", null);
                    _this.PushTTObj.Unsubscribe([objValue.oldId], _this.addTick);
                    _this.PushTTObj.Subscribe([objValue.id], _this.addTick, _this.WidgetType);

                    _this.PriceProviderCode = objValue.id;
                    _this.PairName = objValue.name;
                }
            }
            _this.CustomExtensions.SetMainSymbol(_this.PriceProviderCode);
            _this.CustomExtensions.ClearExtensions();
        };

        _this.addComparison = function (objValue) {
            if (objValue !== "") {
                _this.PushTTObj.Subscribe([objValue.id.substring(4)], _this.addTick);
            }
        };

        _this.comparisonRemove = function (objValue) {
            if (objValue !== "") {
                _this.PushTTObj.Unsubscribe([objValue.id.substring(4)], _this.addTick);
            }
        };

        _this.periodChanged = function (e) {
            var newRanges = getRangesForPeriod(e.value);
            _this.Chart.setOption("data.dateRange", newRanges.dateRange);
            _this.Chart.setOption("zoom.dateRange", newRanges.zoomRange);
        };

        var getRangesForPeriod = function (period) {
            var numberOfBars = 120;
            var hours = -1;
            var dateRange = '';

            if (period.indexOf('INTRADAY') !== -1) {
                var periodStringSplitted = period.split(' ');
                if (periodStringSplitted.length > 1) {
                    var periodInMinutes = periodStringSplitted[1];
                    var numberOfPeriods = (numberOfBars * 0.8) * parseInt(periodInMinutes);
                    hours = Math.round(numberOfPeriods / 60);
                }
                dateRange = '6m';
            } else if (period === 'DAILY') {
                hours = numberOfBars * 24;
                dateRange = '40y';
            } else if (period === 'WEEKLY') {
                hours = numberOfBars * 7 * 24;
                dateRange = '40y';
            } else if (period === 'MONTHLY') {
                hours = numberOfBars * 30 * 24;
                dateRange = '40y';
            }

            var tickByTickRange = '1d';

            var result = {
                dateRange: dateRange,
                zoomRange: hours === -1
                    ? tickByTickRange
                    : getRangeFromHours(hours)
            }

            return result;
        };

        var getRangeFromHours = function (hours) {
            if (hours < 24) {
                return '1d';
            }

            var days = Math.round(hours / 24);
            if (days < 30) {
                return days.toString() + 'd';
            }

            var months = Math.round(days / 30);
            if (months < 12) {
                return months.toString() + 'm';
            } else {
                var years = Math.round(months / 12);
                return years.toString() + 'y';
            }
        };

        _this.loadAssets = function () {
            FXStreet.Class.Patterns.Singleton.LoadAssets.getInstance()
                .getAssets().then(function (data) {
                    _this.Assets = data.Result;
                    _this.mapAssetsToSymbols(data.Result);
                    _this.loadChart();

                    if (_this.EnableCalendar) _this.loadCalendar();
                    if (_this.EnableNews) _this.loadNews(_this.PriceProviderCode);
                },
                function () {
                    console.error("Error getting assets");

                });
        };

        return _this;
    };
    FXStreet.Class.SingleChartManager = function () {
        var parent = FXStreet.Class.Base(),
            _this = FXStreet.Util.extendObject(parent);

        _this.ContainerId = "";
        _this.WidgetType = "";
        _this.PairName = "";
        _this.PriceProviderCode = "";
        _this.HtmlTemplateFile = "";
        _this.BigChartUrl = "";
        _this.DisplayRSI = false;
        _this.DisplaySMA = false;
        _this.DisplayBigChartUrl = false;
        _this.EnableZoomOnChart = false;
        _this.TouchAvailable = false;
        _this.ExternalUrl = "";
        _this.DisplayHistory = false;
        _this.ChartConfiguration = "";
        _this.SoundUrl = "";
        _this.MarketToolsBaseUrl = "";
        _this.PostI3ApiBaseUrl = "";
        _this.CalendarI3ApiBaseUrl = "";
        _this.Translations = null;
        _this.CustomChartHigh = 0;
        _this.EnableCalendar = false;
        _this.EnableNews = false;
        _this.AssetId = "";

        _this.ChartService = null;
        _this.ChartId = "";
        _this.AlreadySubscribed = false;

        _this.init = function (json) {
            _this.setSettingsByObject(json);
            _this.setVars();
            _this.preRender();
        };

        _this.setVars = function () {
            _this.ChartId = "fxs_chartwidget_" + _this.ContainerId;
            if (_this.WidgetType === null || _this.WidgetType === "") {
                _this.WidgetType = _this.getWidgetTypeByHtmlTemplate(_this.HtmlTemplateFile);
            }
            if (_this.HtmlTemplateFile === null || _this.HtmlTemplateFile === "") {
                _this.HtmlTemplateFile = FXStreet.Util.ChartWidgetConfig.WidgetHtmlTemplateFile[_this.WidgetType];
            }
        };

        _this.getWidgetTypeByHtmlTemplate = function (htmlTemplateFile) {
            var widgetType = "";
            var files = FXStreet.Util.ChartWidgetConfig.WidgetHtmlTemplateFile;
            for (var type in files) {
                if (files.hasOwnProperty(type) && files[type] === htmlTemplateFile) {
                    widgetType = type;
                }
            }
            return widgetType;
        };

        _this.preRender = function () {
            if (_this.ContainerId) {
                _this.Container = FXStreet.Util.getjQueryObjectById(_this.ContainerId, false);
                var externalUrl = "";


                if (_this.ExternalUrl)
                    externalUrl = _this.ExternalUrl.toLowerCase();
                //externalUrl = FXStreet.Util.isMobileDevice() === false ? _this.ExternalUrl.toLowerCase() : FXStreet.Util.getBigChartMobileUrl(_this.ExternalUrl, _this.PriceProviderCode)

                var translations = (FXStreet.Resource.Translations["ChartSingleAsset_Widget"])
                                        ? FXStreet.Resource.Translations["ChartSingleAsset_Widget"]
                                        : _this.Translations;
                var json = {
                    Value: {
                        ContainerId: _this.ContainerId,
                        ChartId: _this.ChartId,
                        BigChartUrl: _this.BigChartUrl.toLowerCase(),
                        //BigChartUrl: FXStreet.Util.isMobileDevice() === false ? _this.BigChartUrl.toLowerCase() : FXStreet.Util.getBigChartMobileUrl(_this.BigChartUrl, _this.PriceProviderCode),
                        DisplayBigChartUrl: _this.DisplayBigChartUrl,
                        EnableZoomOnChart: _this.EnableZoomOnChart,
                        TouchAvailable: _this.TouchAvailable,
                        ExternalUrl: externalUrl,
                        BrowserHeight: _this.getBrowserHeight(),
                        CustomChartHigh: _this.CustomChartHigh
                    },
                    Translations: translations
                };

                if (_this.Container) {
                    FXStreet.Util.loadHtmlTemplate(_this.HtmlTemplateFile).done(function (template) {
                        var rendered = FXStreet.Util.renderByHtmlTemplate(template, json);
                        _this.Container[0].outerHTML = rendered;
                        _this.ForceRefresh();
                    });
                }
            }
        };

        _this.getBrowserHeight = function () {

            var footerAdWidget = 30;
            var menusSiteHeight = 51;
            var alertHeight = 50;
            var heightOffset = 50;

            if ($('.fxs_global_alert.in').length>0){
                heightOffset += alertHeight;
            }

            var result = $(window).height() - (menusSiteHeight + footerAdWidget + heightOffset);
            return result;
        }

        _this.chartServiceInit = function () {
            _this.ChartService = FXStreet.Class.ChartService();

            var chartConfig = FXStreet.Util.ChartWidgetConfig.WidgetOptions[_this.WidgetType];

            _this.ChartService.init({
                'ChartId': _this.ChartId,
                'ChartOptions': chartConfig,
                'PairName': _this.PairName,
                'PriceProviderCode': _this.PriceProviderCode,
                'WidgetType': _this.WidgetType,
                'DisplayRSI': _this.DisplayRSI,
                'DisplaySMA': _this.DisplaySMA,
                'DisplayHistory': _this.DisplayHistory,
                'ChartConfiguration': _this.ChartConfiguration,
                'AssetTagId': _this.AssetTagId,
                'SoundUrl': _this.SoundUrl,
                'MarketToolsBaseUrl': _this.MarketToolsBaseUrl,
                'PostI3ApiBaseUrl': _this.PostI3ApiBaseUrl,
                'CalendarI3ApiBaseUrl': _this.CalendarI3ApiBaseUrl,
                'EnableCalendar': _this.EnableCalendar,
                'EnableNews': _this.EnableNews
            });
        };

        _this.ForceRefresh = function () {
            var interval = setInterval(function () {
                if ($('#' + _this.ChartId).is(':visible')) {
                    _this.chartServiceInit();
                    clearInterval(interval);
                }
            }, 2500);
        };

        _this.display = function (display) {
            if (_this.ChartService) {
                if (display) {
                    _this.ChartService.display();
                }
                else {
                    _this.ChartService.hide();
                }
            }
        };

        return _this;
    };
    FXStreet.Util.ChartWidgetConfig = {
        getBackgroundImage: function(){
            var result;
            if(FXStreet.Resource.StaticContentImage){
                result = { 
                    filename: FXStreet.Resource.StaticContentImage + "icons/logo_watermark_FXS.png", 
                    alpha: 0.5, 
                    valign: 'bottom', 
                    paddingLeft: 15, 
                    align: 'left', 
                    paddingBottom: 15
                }
            }
            return result;
        },
        WidgetOptions: {
            fxs_widget_default: {
                "global.locale": "en",
                "data.period": 'INTRADAY 60',
                "data.numberOfBars": 200,
                "grid.show": true,
                "main.chartType": 'candle',
                "main.lineColor": "rgba(206, 71, 53, 1)",
                "main.areaColors": ["rgba(206, 71, 53, 1)", "rgba(206, 71, 53, 0)"],
                "main.risingColor": "#338473",
                "main.fallingColor": "#D25746",
                "volume.show": false,
                "history.show": false,
                "history.sliderBorderColor": "#fff",
                "dataInfo.show": false,
                "toolbar.top.show": false,
                "toolbar.left.show": false,
                "toolbar.top.items": [],
                "toolbar.left.items": [],
                "contextMenu.show": false,
                "data.usePush": false,
                "panel.background.color": "#F7F7F7",
                "data.maxAdditionalBars": 200,
                'data.emptySpaceRight': false,
                'data.dynamicHistoryLoading': false,
                'dialogs.limitingElementId': '',
                "markers.eventTypes": ["news", "calendarEvents"]
            },
            fxs_widget_big: {
                "global.locale": "en",
                "data.period": 'INTRADAY 60',
                "data.numberOfBars": 200,
                "grid.show": true,
                "main.chartType": 'candle',
                "main.lineColor": "rgba(206, 71, 53, 1)",
                "main.areaColors": ["rgba(206, 71, 53, 1)", "rgba(206, 71, 53, 0)"],
                "main.risingColor": "#338473",
                "main.fallingColor": "#D25746",
                "volume.show": false,
                "history.show": false,
                "history.sliderBorderColor": "#fff",
                "dataInfo.show": false,
                "toolbar.top.show": false,
                "toolbar.left.show": false,
                "toolbar.top.items": [],
                "toolbar.left.items": [],
                "contextMenu.show": false,
                "data.usePush": false,
                "panel.background.color": "#F7F7F7",
                "data.maxAdditionalBars": 200,
                'data.emptySpaceRight': false,
                'data.dynamicHistoryLoading': false,
                'dialogs.limitingElementId': '',
                "markers.eventTypes": ["news", "calendarEvents"]
            },
            fxs_widget_mini: {
                "global.locale": "en",
                "data.period": 'INTRADAY 60',
                "data.numberOfBars": 200,
                "grid.show": true,
                "main.chartType": 'candle',
                "main.lineColor": "rgba(206, 71, 53, 1)",
                "main.areaColors": ["rgba(206, 71, 53, 1)", "rgba(206, 71, 53, 0)"],
                "volume.show": false,
                "history.show": false,
                "history.sliderBorderColor": "#fff",
                "dataInfo.show": false,
                "toolbar.top.show": false,
                "toolbar.left.show": false,
                "toolbar.top.items": [],
                "toolbar.left.items": [],
                "contextMenu.show": false,
                "data.usePush": false,
                "panel.background.color": "#F7F7F7",
                "data.maxAdditionalBars": 200,
                'data.dynamicHistoryLoading': false,
                'dialogs.limitingElementId': '',
                'data.emptySpaceRight': false,
                "markers.eventTypes": ["news", "calendarEvents"]
            },
            fxs_widget_full: {
                "global.locale": "en",
                "data.period": 'INTRADAY 15',
                "data.numberOfBars": 5000,
                "data.dateRange": '6m',
                "grid.show": true,
                "main.chartType": 'candle',
                "main.lineColor": "rgba(206, 71, 53, 1)",
                "main.areaColors": ["rgba(206, 71, 53, 1)", "rgba(206, 71, 53, 0)"],
                "main.risingColor": "#338473",
                "main.fallingColor": "#D25746",
                "volume.show": false,
                "history.show": false,
                "history.sliderBorderColor": "#fff",
                "dataInfo.show": true,
                "toolbar.top.show": true,
                "toolbar.left.show": true,
                "toolbar.top.items": ["file", "symbols", "periods", "chartType", "comparisons", "logarithmicScale", "relativeScale", "zeroPointTool", ["volume", "history", "dataInfo", "showMinMax"], ["last", "crosshair", "crosshairlast"], , "indicators", 'reload', 'zoomIn', 'zoomOut', 'print', 'exportPng', /*'popup', */ 'fullscreen'],
                "toolbar.left.items": ["dt_hand", ["dt_line", "dt_horizLine", "dt_trendChannel"], ["dt_rectangle", "dt_circle"], ["dt_fibFan", "dt_fibVertRet", "dt_fibRet", "dt_fibArc"], "dt_andrewsPitch", ["dt_regressionLine", "dt_regressionChannel"], ["dt_arrow_up", "dt_arrow_down"], "dt_text", 'dt_delete', 'dt_drawRepeatedly'],
                "contextMenu.show": false,
                "data.usePush": false,
                "panel.background.color": "#F7F7F7",
                "data.maxAdditionalBars": 1000,
                'data.dynamicHistoryLoading': true,
                'zoom.dateRange': '1d',
                'dialogs.limitingElementId': '',
                "markers.load": true,
                "markers.eventTypes": ["news", "calendarEvents"],
                'data.extendedTimeRegion': 5,
                'data.emptySpaceRight': true
            },
            fxs_widget_bigToolbar: {
                "global.locale": "en",
                "data.period": 'INTRADAY 15',
                "data.numberOfBars": 1000,
                "data.dateRange": '6m',
                "grid.show": true,
                "main.chartType": 'candle',
                "main.lineColor": "rgba(206, 71, 53, 1)",
                "main.areaColors": ["rgba(206, 71, 53, 1)", "rgba(206, 71, 53, 0)"],
                "main.risingColor": "#338473",
                "main.fallingColor": "#D25746",
                "volume.show": false,
                "history.show": false,
                "history.sliderBorderColor": "#fff",
                "dataInfo.show": true,
                "toolbar.top.show": true,
                "toolbar.left.show": true,
                "toolbar.top.items": ["file", "symbols", "periods", "chartType", "comparisons", "logarithmicScale", "relativeScale", "zeroPointTool", ["volume", "history", "dataInfo", "showMinMax"], ["last", "crosshair", "crosshairlast"], , "indicators", 'reload', 'zoomIn', 'zoomOut', 'print', 'exportPng', /*'popup', */ 'fullscreen'],
                "toolbar.left.items": ["dt_hand", ["dt_line", "dt_horizLine", "dt_trendChannel"], ["dt_rectangle", "dt_circle"], ["dt_fibFan", "dt_fibVertRet", "dt_fibRet", "dt_fibArc"], "dt_andrewsPitch", ["dt_regressionLine", "dt_regressionChannel"], ["dt_arrow_up", "dt_arrow_down"], "dt_text", 'dt_delete', 'dt_drawRepeatedly'],
                "contextMenu.show": false,
                "data.usePush": false,
                "panel.background.color": "#F7F7F7",
                "data.maxAdditionalBars": 1000,
                'data.dynamicHistoryLoading': true,
                'zoom.dateRange': '1d',
                'dialogs.limitingElementId': '',
                "markers.load": true,
                "markers.eventTypes": ["news", "calendarEvents"],
                'data.extendedTimeRegion': 5,
                'data.emptySpaceRight': true
            },
            fxs_widget_cag: {
                "global.locale": "en",
                "data.period": 'INTRADAY 15',
                "data.numberOfBars": 50,
                "grid.show": true,
                "main.chartType": 'candle',
                "main.lineColor": "rgba(206, 71, 53, 1)",
                "main.areaColors": ["rgba(206, 71, 53, 1)", "rgba(206, 71, 53, 0)"],
                "main.risingColor": "#338473",
                "main.fallingColor": "#D25746",
                "volume.show": false,
                "history.show": false,
                "history.sliderBorderColor": "#fff",
                "dataInfo.show": false,
                "toolbar.top.show": false,
                "toolbar.left.show": false,
                "toolbar.top.items": [],
                "toolbar.left.items": [],
                "contextMenu.show": false,
                "data.usePush": false,
                "panel.background.color": "#F7F7F7",
                "data.maxAdditionalBars": 200,
                'data.emptySpaceRight': false,
                'data.dynamicHistoryLoading': false,
                'dialogs.limitingElementId': '',
                "markers.eventTypes": ["news", "calendarEvents"]
            },
        },
        WidgetHtmlTemplateFile: {
            fxs_widget_default: "chartwidget_default.html",
            fxs_widget_big: "chartwidget_big.html",
            fxs_widget_bigToolbar: "chartwidget_bigToolbar.html",
            fxs_widget_mini: "chartwidget_mini.html",
            fxs_widget_full: "chartwidget_full.html",
            fxs_widget_cag: "chartwidget_cag.html"
        },
        toolbar: {
            comparisons: "",
            file: [['*|menu_load|*', 'load'], ['*|menu_save|*', 'saveDefault']]
        }
    };
    FXStreet.Class.ChartExtensions = function () {

        var parent = FXStreet.Class.Base(),
            _this = FXStreet.Util.extendObject(parent);

        _this.SoundUrl = null;
        _this.Chart = null;
        _this.ChartId = null;
        _this.Assets = null;
        _this.PostI3ApiBaseUrl = null;
        _this.CalendarI3ApiBaseUrl = null;

        _this.NewsExtension = null;
        _this.CalendarExtension = null;
        _this.SoundExtension = null;
        _this.PriceProviderCode = null;

        //Translations:>
        _this.CalendarEventsButtonText = " Calendar";
        _this.NewsExtensionText = " News";

        _this.EventExtensions = null;

        _this.init = function (json) {
            _this.setSettingsByObject(json);
            _this.setVars();
        };

        _this.setVars = function () {

            _this.NewsExtension = FXStreet.Class.NewsExtension();
            var newsJson = {
                Chart: _this.Chart,
                ChartId: _this.ChartId,
                Assets: _this.Assets,
                PostI3ApiBaseUrl: _this.PostI3ApiBaseUrl,
                NewsExtensionText: _this.NewsExtensionText,
                PriceProviderCode: _this.PriceProviderCode
            };

            _this.NewsExtension.init(newsJson);

            _this.CalendarExtension = FXStreet.Class.CalendarExtension();
            var calendarEventJson = {
                Chart: _this.Chart,
                ChartId: _this.ChartId,
                Assets: _this.Assets,
                CalendarI3ApiBaseUrl: _this.CalendarI3ApiBaseUrl,
                CalendarEventsButtonText: _this.CalendarEventsButtonText
            };

            _this.CalendarExtension.init(calendarEventJson);
            _this.SoundExtension = FXStreet.Class.SoundExtension();

            _this.EventExtensions = FXStreet.Class.EventExtensions();

            var chartEventExtension = { Chart: _this.Chart };
            _this.EventExtensions.init(chartEventExtension);

        }

        _this.LoadCalendar = function () {
            _this.CalendarExtension.LoadCalendarEvents();
        }

        _this.LoadNews = function (priceProviderCode) {
            _this.NewsExtension.LoadNews(priceProviderCode);
        }

        _this.OnEventClicked = function (obj) {
            if (obj.type === _this.NewsExtension.EventType) _this.NewsExtension.OnClickedEvent(obj);
            if (obj.type === _this.CalendarExtension.EventType) _this.CalendarExtension.OnClickedEvent();
        };

        _this.AddButtons = function () {
            var ttTopToolbar = FXStreet.Util.getjQueryObjectById(_this.ChartId).find('.tt_topToolbar');
            if (ttTopToolbar) {
                var fxsNewsExtension = _this.NewsExtension.Render();
                $('.tt_addIndicator').after(fxsNewsExtension);
            }
            var fxsSound = _this.SoundExtension.Render();
            ttTopToolbar.append(fxsSound);
        };

        _this.ActivateSound = function () {
            _this.SoundExtension.ActivateSound();
        };

        _this.SetMainSymbol = function (symbol) {
            _this.NewsExtension.SetMainSymbol(symbol);
        }
        _this.ClearExtensions = function () {
            _this.NewsExtension.Clear();
            _this.CalendarExtension.Clear();
        }

        return _this;
    };
    FXStreet.Class.EventExtensions = function () {

        var parent = FXStreet.Class.Base(),
        _this = FXStreet.Util.extendObject(parent);
        _this.Chart = null;

        _this.init = function (json) {
            _this.setSettingsByObject(json);
        };

        _this.DisplayEvents = function (eventType) {
            var visibleTypes = _this.Chart.getOption("markers.visibleTypes");
            if (!visibleTypes) visibleTypes = [];

            if (visibleTypes.indexOf(eventType) === -1) { visibleTypes.push(eventType); }

            _this.Chart.setOption("markers.visibleTypes", visibleTypes);
            _this.Chart.display();
        }

        _this.HideEvents = function (eventType) {
            var visibleTypes = _this.Chart.getOption("markers.visibleTypes");
            if (!visibleTypes) visibleTypes = [];

            var indexEventType = visibleTypes.indexOf(eventType);
            if (indexEventType > -1) { visibleTypes.splice(indexEventType, 1); }

            _this.Chart.setOption("markers.visibleTypes", visibleTypes);
            _this.Chart.display();
        }

        return _this;
    };
    FXStreet.Class.NewsExtension = function () {

        var parent = FXStreet.Class.Base(),
            _this = FXStreet.Util.extendObject(parent);

        _this.news = [];
        _this.NewsExtensionText = "";
        _this.IsActive = false;
        _this.Chart = null;
        _this.Assets = null;
        _this.PostI3ApiBaseUrl = null;
        _this.EventType = "news";
        _this.PriceProviderCode = null;
        _this.EventExtensions = null;

        _this.init = function (json) {
            _this.setSettingsByObject(json);
            _this.setVars();
        };

        _this.setVars = function () {
            _this.EventExtensions = FXStreet.Class.EventExtensions();

            var data = { Chart: _this.Chart };
            _this.EventExtensions.init(data);
        }

        _this.SetMainSymbol = function (symbol) {
            _this.PriceProviderCode = symbol;
        };

        _this.OnClickedEvent = function (obj) {
            var markers = $.grep(_this.news, function (item) { return item.PostId === obj.id; });
            if (markers.length > 0) {
                window.open(markers[0].Url);
            }
        };

        _this.Clear = function () {
            _this.IsActive = false;
            _this.news = [];
        }

        _this.LoadNews = function (priceProviderCode) {
            if (priceProviderCode) _this.PriceProviderCode = priceProviderCode;
            _this.EventExtensions.DisplayEvents(_this.EventType);

            var asset = getCurrentAsset();

            if (asset && asset.TagIds !== undefined && asset.TagIds.length > 0) {
                var url = _this.PostI3ApiBaseUrl + '/v3/en/article/filter/GeneralFeed/' + asset.TagIds[0];

                $.ajax(url).done(function (data) {
                    if (data) {
                        var markers = [];
                        _this.news = data.Articles;
                        $.each(_this.news,
                            function (i, newsItem) {
                                var date = FXStreet.Util
                                    .ConvertUtcDateToCurrentTimeZone(newsItem.PublishDate);
                                markers.push({
                                    'id': newsItem.PostId,
                                    'type': _this.EventType,
                                    'dateTime': date,
                                    'text': newsItem.Title
                                });
                            });

                        var jsonStr = JSON.stringify(markers);

                        _this.Chart.addEvents(jsonStr, _this.PriceProviderCode);
                        _this.Chart.setOption("markers.news.displayLetter", 'N');
                        _this.Chart.display();
                    }
                });
            }
        }
        _this.Render = function () {

            var newsText = _this.NewsExtensionText;
            var newsIcon = $('<i>').addClass('fa fa-newspaper-o fa-lg').attr('aria-hidden', 'true');

            var result = $('<div>',
            {
                click: function () {
                    if (_this.IsActive) {
                        _this.IsActive = false;
                        _this.EventExtensions.HideEvents(_this.EventType);
                    } else {
                        _this.IsActive = true;
                        if (!_this.news || _this.news.length === 0) {
                            _this.LoadNews();
                        } else {
                            _this.EventExtensions.DisplayEvents(_this.EventType);
                        }
                    }
                },
                "class": 'fxs_chart_icon'
            }).append(newsIcon).append(newsText);
            return result;
        };

        var getCurrentAsset = function () {
            var result = null;
            var assets = $.grep(_this.Assets,
                function (item) { return item.PriceProviderCode === _this.PriceProviderCode; });
            if (assets.length > 0) {
                result = assets[0];
            }
            return result;
        };

        return _this;
    };
    FXStreet.Class.SoundExtension = function () {

        var parent = FXStreet.Class.Base(),
        _this = FXStreet.Util.extendObject(parent);

        var soundObj = null;
        var soundIsActive = false;

        _this.Render = function () {
            var result = $('<div>', {
                title: 'Sound alert on closed candle',
                style: 'background-image:url(' + FXStreet.Resource.StaticContentImage + 'icons/icon_volume_off.png' + ')',
                click: function () {
                    soundIsActive = !soundIsActive;
                    if (soundIsActive) {
                        result.css('background-image', 'url(' + FXStreet.Resource.StaticContentImage + 'icons/icon_volume_on.png' + ')');
                    }
                    else {
                        result.css('background-image', 'url(' + FXStreet.Resource.StaticContentImage + 'icons/icon_volume_off.png' + ')');
                    }
                }
            });
            return result;
        };

        _this.ActivateSound = function () {
            if (soundIsActive) {
                if (soundObj === null) {
                    soundObj = new FXStreet.Class.Sound();
                    soundObj.init({ SoundUrl: _this.SoundUrl });
                }
                soundObj.playSound();
            }
        };

        return _this;
    };
    FXStreet.Class.CalendarExtension = function () {

        var parent = FXStreet.Class.Base(),
        _this = FXStreet.Util.extendObject(parent);

        _this.calendarEvents = [];
        _this.Chart = null;
        _this.IsActive = false;
        _this.ChartId = null;
        _this.CalendarI3ApiBaseUrl = null;
        _this.EventExtensions = null;

        _this.CalendarEventsButtonText = "";
        _this.EventType = "calendarEvents";

        _this.init = function (json) {
            _this.setSettingsByObject(json);
            _this.setVars();
        };

        _this.setVars = function () {
            _this.EventExtensions = FXStreet.Class.EventExtensions();

            var data = { Chart: _this.Chart };
            _this.EventExtensions.init(data);
        }

        _this.OnClickedEvent = function () {
            //window.open();
        };

        _this.Clear = function () {
            _this.IsActive = false;
            _this.calendarEvents = [];
        }

        _this.LoadCalendarEvents = function () {
            var currentCulture = FXStreet.Resource.CultureName;

            var url = _this.CalendarI3ApiBaseUrl + 'eventdate/?view=day&f=json&culture=' + currentCulture;
            _this.Chart.setOption("markers.calendarEvents.displayLetter", 'E');

            $.ajax(url).done(function (data) {
                if (data) {
                    var markers = [];
                    _this.calendarEvents = data;
                    $.each(_this.calendarEvents,
                        function (i, calendarEvent) {
                            var date = FXStreet.Util.ConvertUtcDateToCurrentTimeZone(calendarEvent.DateTime.Date);
                            markers.push({
                                'id': calendarEvent.IdEcoCalendarDate,
                                'type': _this.EventType,
                                'dateTime': date,
                                'text': calendarEvent.Country + ': ' + calendarEvent.Name
                            });
                        });
                    var jsonStr = JSON.stringify(markers);
                    _this.Chart.addEvents(jsonStr, _this.PriceProviderCode);
                    _this.EventExtensions.DisplayEvents(_this.EventType);
                }

            });
        }

        _this.Render = function () {
            var calendarText = _this.CalendarEventsButtonText;
            var calendarIcon = $('<i>').addClass('fa fa-calendar fa-lg').attr('aria-hidden', 'true');
            var result = $('<div>',
                {
                    click: function () {
                        if (_this.IsActive) {
                            _this.IsActive = false;
                            _this.EventExtensions.HideEvents(_this.EventType);
                        } else {
                            _this.IsActive = true;
                            if (!_this.calendarEvents || _this.calendarEvents.length === 0) {
                                _this.LoadCalendarEvents();
                            } else {
                                _this.EventExtensions.DisplayEvents(_this.EventType);
                            }
                        }
                    },
                    "class": 'fxs_chart_icon'
                }).append(calendarIcon).append(calendarText);
            return result;
        };
        return _this;
    };
}());
(function () {
    FXStreet.Class.RatesTable = function () {
        var parent = FXStreet.Class.Base(),
        _this = FXStreet.Util.extendObject(parent);
        _this.HtmlTemplateFile = "ratestable_default.html";

        var ratesTableDataManager = null;

        _this.init = function (json) {
            _this.setSettingsByObject(json);
            _this.setVars(json);
            _this.htmlRender(json);
        };

        _this.setVars = function (json) {
            _this.ContainerId = json.ContainerId;
            _this.Container = FXStreet.Util.getjQueryObjectById(_this.ContainerId);
        };

        _this.htmlRender = function (json) {
            FXStreet.Util.loadHtmlTemplate(_this.HtmlTemplateFile).done(function (template) {
                renderDefaultTemplate(json, template);
                renderRatesTableItems(json);
            });
        };

        var renderDefaultTemplate = function (json, template) {
            var htmlData = { IsActiveHeader: json.IsActiveHeader, ContainerId: json.ContainerId };
            var rendered = FXStreet.Util.renderByHtmlTemplate(template, htmlData);
            _this.Container.html(rendered);
        };

        var renderRatesTableItems = function (json) {
            if (json.IsActiveHeader) {
                json.MyAssetIds = FXStreet.Class.MyAssetsList.get();
            }

            renderDataManagers(json);

            if (json.IsActiveHeader) {
                renderHeaderManagers(json);
            };
        };

        var renderDataManagers = function (json) {
            ratesTableDataManager = new FXStreet.Class.RatesTableDataManager();
            var jsonObj = $.extend(true, {}, json);

            if (json.MyAssetIds) {
                getMyAssetList(json.MyAssetIds).done(function (data) {
                    jsonObj.Assets = data;
                    ratesTableDataManager.init(jsonObj);
                });
            } else {
                ratesTableDataManager.init(jsonObj);
            }
        };

        var getMyAssetList = function (assetIds) {
            var endpoint = FXStreet.Resource.FxsApiRoutes["RatesTableAssets"];
            var querystring = "?assetIds=";
            $.each(assetIds, function (index, asset) {
                querystring = querystring + asset + ",";
            });

            endpoint = endpoint + querystring.slice(0, -1);

            return $.get(endpoint);
        }

        var renderHeaderManagers = function (json) {
            var jsonData = $.extend(json, { RatesTableDataManager: ratesTableDataManager }, true);

            var ratesTableMenuManager = new FXStreet.Class.RatesTableMenuManager();
            ratesTableMenuManager.init(jsonData);

            jsonData.MainAssets = jsonData.Assets;

            jsonData.AssetsIds = jsonData.Assets.map(function (a) { return a.AssetId });

            var myListAssets = FXStreet.Class.MyAssetsList.get();
            if (myListAssets) {
                jsonData.MyAssetIds = myListAssets;
            }

            jsonData.OnAssetChangedDelegate = ratesTableMenuManager.setMyListViewAssets;

            var ratesTableFilterManager = new FXStreet.Class.RatesTableFilterManager();
            ratesTableFilterManager.init(jsonData);
        };

        return _this;
    };

    FXStreet.Class.RatesTableFilterManager = function () {
        var parent = FXStreet.Class.Base(),
        _this = FXStreet.Util.extendObject(parent);

        _this.HtmlTemplateFile = "ratestable_filter.html";
        _this.ContainerId = "";
        _this.FilterButtonId = "";
        _this.RatesTableDataManager = null;
        _this.FilterContainerId = null;
        _this.FilterDropDown = null;
        _this.MyAssetIds = [];
        _this.AllAssets = [];
        _this.HideElementsCssClass = "fxs_hideElements";
        _this.MainViewItems = null;
        _this.Translations = null;
        _this.TypeAhead = {};
        _this.OnAssetChangedDelegate = null;
        _this.MainAssets = [];

        var temporalMyList = { Assets: [] };

        var mustacheSelectedAssets = null;

        _this.init = function (json) {
            _this.setSettingsByObject(json);
            _this.setVars(json);
            setAllAssets().then(function () { _this.htmlRender(json); });
        };

        _this.setVars = function (json) {
            _this.FilterContainerId = "fxs_header_filter_" + _this.ContainerId;
            _this.FilterOpenDropDownId = "fxs_filter_open_dropdown_button_" + _this.ContainerId;
            _this.FilterCloseDropDownId = "fxs_filter_close_dropdown_button_" + _this.ContainerId;
            
            _this.FilterDropDownId = "fxs_customize_" + _this.ContainerId;
            _this.Container = FXStreet.Util.getjQueryObjectById(_this.FilterContainerId);

            _this.FilterSaveId = "fxs_filter_save_" + _this.ContainerId;
            _this.FilterCancelId = "fxs_filter_cancel_" + _this.ContainerId;

            if (!_this.MyAssetIds) {
                _this.MyAssetIds = json.AssetsIds;
            }
        };

        _this.htmlRender = function (json) {
            FXStreet.Util.loadHtmlTemplate(_this.HtmlTemplateFile).done(function (template) {
                var mustacheSelectedAssetsHtml = template.Template.match(/<main>[\s\S]*<\/main>/g);

                mustacheSelectedAssets = {
                    Template: mustacheSelectedAssetsHtml[0]
                };

                var jsonData = getJsonData(json);
                var rendered = FXStreet.Util.renderByHtmlTemplate(template, jsonData);
                _this.Container.html(rendered);
                _this.addEvents();
                _this.FilterDropDown = FXStreet.Util.getjQueryObjectById(_this.FilterDropDownId);
                initTypeahead(jsonData);
            });
        };

        _this.addEvents = function () {
            addFunctionOnClick(_this.FilterOpenDropDownId, openFilterDropdown);
            addFunctionOnClick(_this.FilterCloseDropDownId, closeFilterDropdown);
            addFunctionOnClick(_this.FilterCancelId, closeFilterDropdown);
            addFunctionOnClick(_this.FilterSaveId, saveFilter);
            addEventCheckboxList();
        };

        var addEventCheckboxList = function () {
            if (temporalMyList.Assets) {
                $.each(temporalMyList.Assets,
                    function (index, item) {
                        addFunctionOnClick("fxs_filter_mylist_" + _this.ContainerId + "_" + item.Id,
                            function (e) { onclickMyListItem(e, this, item); });
                    });
            }
        }

        var initTypeahead = function (json) {
            json.ContainerId = 'fxs_header_typeahead_' + json.ContainerId;
            json.OnSaveDelegate = onTypeaheadSaveDelegate;
            json.ShowLayer = showLayer;
            _this.TypeAhead = new FXStreet.Class.RatesTableFilterTypeAhead();
            _this.TypeAhead.init(json);
        };

        var addFunctionOnClick = function (elementId, callback) {
            var htmItem = FXStreet.Util.getjQueryObjectById(elementId);
            htmItem.click(callback);
        };

        var getJsonData = function (json) {
            var myAssets = getFullAssets(json.AssetsIds);

            var result =
            {
                TypeAheadSettings:
                {
                    TypeaheadId: "fxs_typeahead_" + _this.ContainerId,
                    TypeaheadInputTargetId: "typeaheadTarget_" + _this.ContainerId,
                    TypeaheadFilterButtonId: "fxs_btn_filter_" + _this.ContainerId,
                    TypeaheadCancelButtonId: "fxs_dismissQuery_" + _this.ContainerId,
                    SelectedTypeaheadId: "",
                    PlaceholderText: "Add pairs to list "
                },
                ContainerId: _this.ContainerId,
                MyList: myAssets,
                TemporalMyList: temporalMyList,
                AllAssets: _this.AllAssets,
                Translations: _this.Translations
            };
            return result;
        };

        var getFullAssets = function (assetIds) {
            var result = [];
            $.each(assetIds,
                function (i, id) {
                    var asset = _this.AllAssets.findFirst(function (a) {
                        return a.Id === id;
                    });

                    if (asset) {
                        result.push(asset);
                    } else {
                        console.error('Asset {0} not found in all assets list'.format(id));
                    }
                });
            return result;
        }

        var setAllAssets = function () {
            var getAssetsApiUri = FXStreet.Resource.FxsApiRoutes["GetAssets"] + "?cultureName=" + FXStreet.Resource.CultureName;
            return $.get(getAssetsApiUri).then(
                function (data) {
                    _this.AllAssets = data.Result;
                });
        };

        var openFilterDropdown = function () {
            _this.RatesTableDataManager.hideAllDropDowns();
            getJsonDataAndDisplayFilter();
        };

        var closeFilterDropdown = function () {
            temporalMyList.Assets = [];
            _this.FilterDropDown.addClass(_this.HideElementsCssClass);
        };

        var saveFilter = function (e) {
            e.preventDefault();

            var selectedAssetList = $.grep(temporalMyList.Assets, function (i) {
                return i.Selected;
            });

            _this.MyAssetIds = selectedAssetList.map(function (a) { return a.Id; });

            if (typeof (_this.OnAssetChangedDelegate) !== 'undefined') {
                getMyAssetList(_this.MyAssetIds).then(function (assets) {
                    _this.OnAssetChangedDelegate(assets);
                });
            }

            if (selectedAssetList.length === 0) {
                _this.MyAssetIds = _this.MainAssets.map(function (a) { return a.AssetId; });
            }

            closeFilterDropdown();
        }

        var getMyAssetList = function (assetIds) {
            var endpoint = FXStreet.Resource.FxsApiRoutes["RatesTableAssets"];
            var querystring = "?assetIds=";
            $.each(assetIds, function (index, asset) {
                querystring = querystring + asset + ",";
            });

            endpoint = endpoint + querystring.slice(0, -1);

            return $.get(endpoint);
        }

        var getJsonDataAndDisplayFilter = function () {
            temporalMyList.Assets = getFullAssets(_this.MyAssetIds);
            $.each(temporalMyList.Assets, function () { this.Selected = true; });
            _this.FilterDropDown.removeClass(_this.HideElementsCssClass);
            paintSelectedAssets();
        }

        var onclickMyListItem = function (e, domItem, item) {
            item.Selected = domItem.checked;
        }

        var showLayer = function (isActive) {
            var typeAheadLayer = FXStreet.Util.getjQueryObjectById('fxs_header_filter_layer_' + _this.ContainerId);
            if (isActive) {
                typeAheadLayer.removeClass(_this.HideElementsCssClass);
            } else {
                typeAheadLayer.addClass(_this.HideElementsCssClass);
            }
        };

        var onTypeaheadSaveDelegate = function (modifiedAssets) {
            $.each(Object.keys(modifiedAssets), function (i, a) {
                var asset = temporalMyList.Assets.findFirst(function (i) {
                    return i.Id === a;
                });

                if (!asset) {
                    asset = _this.AllAssets.findFirst(function (i) {
                        return i.Id === a;
                    });
                    temporalMyList.Assets.push(asset);
                }

                asset.Selected = modifiedAssets[a];
            });

            paintSelectedAssets();
        };

        var paintSelectedAssets = function () {
            var jsonData = {
                ContainerId: _this.ContainerId,
                MyList: temporalMyList.Assets
            };

            var main = _this.Container.find('main');
            var mainRendered = FXStreet.Util.renderByHtmlTemplate(mustacheSelectedAssets, jsonData);
            main.replaceWith(mainRendered);

            addEventCheckboxList();
        };

        return _this;
    };

    FXStreet.Class.RatesTableFilterTypeAhead = function () {
        var parent = FXStreet.Class.Base(),
        _this = FXStreet.Util.extendObject(parent);

        _this.ContainerId = "";
        _this.TypeAhead = {};

        _this.OnSaveDelegate = null;
        _this.ShowLayer = null;
        _this.TypeAheadSettings = null;
        _this.FxsHideElementsClass = "fxs_hideElements";

        _this.HtmlTemplateFile = "ratestable_typeahead.html";

        var preSelectedAssetsOnFilter = null;

        var resultsDivId = '';
        var mustacheSelectedAssets = null;
        var assetsModifiedFromTypeahead = [];

        _this.init = function (json) {
            _this.setSettingsByObject(json);
            _this.setVars(json);
            _this.htmlRender(json);
        };

        _this.setVars = function (json) {

            _this.Container = FXStreet.Util.getjQueryObjectById(_this.ContainerId);
            preSelectedAssetsOnFilter = json.TemporalMyList;

            _this.TypeAheadContainerId = "fxs_search_input_" + _this.ContainerId;
            _this.TypeAheadContainer = FXStreet.Util.getjQueryObjectById(_this.ContainerId);

        };

        _this.htmlRender = function (json) {
            FXStreet.Util.loadHtmlTemplate(_this.HtmlTemplateFile).done(function (template) {
                var mustacheSelectedAssetsHtml = template.Template.match(/<ul class="fxs_results">[\s\S]*<\/ul>/g);

                mustacheSelectedAssets = {
                    Template: mustacheSelectedAssetsHtml[0]
                };

                var rendered = FXStreet.Util.renderByHtmlTemplate(template, json);
                _this.Container.html(rendered);
                _this.addEvents();
                initTypeahead();
            });
        };

        _this.addEvents = function () {
            var saveButton = FXStreet.Util.getjQueryObjectById('fxs_typeahead_save_' + _this.ContainerId);
            saveButton.click(onSave);

            var cancelButton = FXStreet.Util.getjQueryObjectById('fxs_typeahead_cancel_' + _this.ContainerId);
            cancelButton.click(onCancel);

            var typeAheadContainer = FXStreet.Util.getjQueryObjectById(_this.TypeAheadSettings.TypeaheadId);
            typeAheadContainer.keypress(function () {
                _this.ShowLayer(true);
            });

        };

        var initTypeahead = function () {
            var typeaheadJsonInitialization = _this.TypeAheadSettings;

            typeaheadJsonInitialization.OnLayoutBuiltBeforeDelegate = onLayoutBuiltBeforeDelegate;

            resultsDivId = 'fxs_searchResults_' + _this.ContainerId;

            typeaheadJsonInitialization.FindBy_Options = [
                {
                    FindBy_FxsApiRoute: 'GetAssets',
                    Template: '<label><input type="checkbox" name="">{{display}}</label>',
                    Title: 'Assets'
                }
            ];

            typeaheadJsonInitialization.TypeaheadBlur = null;

            _this.TypeAhead = new FXStreet.Class.Sidebar.Typeahead();
            _this.TypeAhead.init(typeaheadJsonInitialization);
        };

        var onLayoutBuiltBeforeDelegate = function (node, query, result) {
            var resultsDiv = FXStreet.Util.getjQueryObjectById(resultsDivId);
            if (!query) {
                resultsDiv.hide();
                return;
            }

            var assets = result.map(function (a) {
                var asset = preSelectedAssetsOnFilter.Assets.findFirst(function (i) {
                    return i.Id === a.id;
                });

                if (assetsModifiedFromTypeahead[a.id] !== undefined) {
                    a.Selected = assetsModifiedFromTypeahead[a.id];
                } else if (asset) {
                    a.Selected = asset.Selected;
                }


                return a;
            });

            var json = {
                ContainerId: _this.ContainerId,
                TypeaheadVisibleAssets: assets
            }

            var rendered = FXStreet.Util.renderByHtmlTemplate(mustacheSelectedAssets, json);
            var ul = _this.Container.find('ul');
            ul.replaceWith(rendered);

            _this.Container.find('input[type="checkbox"]').click(onClickOnCheckbox);

            resultsDiv.show();
        };

        var onClickOnCheckbox = function () {
            var assetId = $(this).attr("fxs-assetId");
            delete assetsModifiedFromTypeahead[assetId];
            assetsModifiedFromTypeahead[assetId] = this.checked;
        }

        var onSave = function () {
            _this.ShowLayer(false);
            if (typeof (_this.OnSaveDelegate) === 'function') {
                _this.OnSaveDelegate(assetsModifiedFromTypeahead);
            }
            closeTypeahead();
        };

        var onCancel = function () {
            _this.ShowLayer(false);
            closeTypeahead();
        };

        var closeTypeahead = function () {
            var resultsDiv = FXStreet.Util.getjQueryObjectById(resultsDivId);
            resultsDiv.hide();

            var input = FXStreet.Util.getjQueryObjectById(_this.TypeAheadSettings.TypeaheadInputTargetId);
            input.val('');

            assetsModifiedFromTypeahead = [];
        };

        return _this;
    };

    FXStreet.Class.RatesTableMenuManager = function () {
        var parent = FXStreet.Class.Base(),
        _this = FXStreet.Util.extendObject(parent);

        _this.ContainerId = "";
        _this.HtmlTemplateFile = "ratestablemenu_menu.html";
        _this.MenuContainerId = "";
        _this.MenuItems = null;
        _this.MainViewAssets = null;
        _this.MyAssetIds = [];
        _this.RatesTableDataManager = null;
        _this.Translations = null;
        var hideElementsCssClass = "fxs_hideElements";
        var menuShowMoreDropDownId = "";
        var menuShowMoreDropDown = "";
        var menuShowMoreDropDownButtonId = "";
        var menuShowMoreDropDownCloseButtonId = "";
        var menuShowMoreDropDownButton = null;
        var mainViewItemId = "";
        var myListViewButtonId = '';
        var menuItemsKey = "MenuItems";

        var myListViewButton = null;
        var mainViewButton = null;

        _this.init = function (json) {
            _this.setSettingsByObject(json);
            _this.setVars(json);
            _this.htmlRender();
        };

        _this.setVars = function (json) {
            _this.MenuContainerId = "fxs_header_menu_" + _this.ContainerId;
            menuShowMoreDropDownButtonId = "fxs_menu_show_more_dropdown_button_" + _this.ContainerId;
            menuShowMoreDropDownCloseButtonId = "fxs_menu_show_more_dropdown_close_button_" + _this.ContainerId;
            menuShowMoreDropDownId = "fxs_menu_show_more_dropdown_" + _this.ContainerId;
            myListViewButtonId = "fxs_menu_mylist_" + _this.ContainerId;
            mainViewItemId = "fxs_menu_main_view_" + _this.ContainerId;
            _this.Container = FXStreet.Util.getjQueryObjectById(_this.MenuContainerId);
            _this.MainViewAssets = json.Assets;
            _this.MenuItems = getMenuItems(json);
        };

        _this.htmlRender = function () {
            var jsonData = getJsonData();
            FXStreet.Util.loadHtmlTemplate(_this.HtmlTemplateFile).done(function (template) {
                var rendered = FXStreet.Util.renderByHtmlTemplate(template, jsonData);
                _this.Container.html(rendered);

                myListViewButton = FXStreet.Util.getjQueryObjectById(myListViewButtonId);
                if (!_this.MyAssetIds) {
                    myListViewButton.hide();
                }
                else {
                    updateActiveButton(myListViewButton);
                }

                _this.addEvents();
            });
        };

        _this.addEvents = function () {
            var myListViewButton = FXStreet.Util.getjQueryObjectById(myListViewButtonId);
            myListViewButton.click(function () {
                _this.RatesTableDataManager.getAndRenderAssetData(_this.MyAssetIds);
            });
            mainViewButton = FXStreet.Util.getjQueryObjectById(mainViewItemId);
            mainViewButton.click(function () {
                _this.RatesTableDataManager.renderAssetData(_this.MainViewAssets);
            });
            $.each(_this.MenuItems, function (index, item) {
                var htmlItem = FXStreet.Util.getjQueryObjectById(item.Id);
                htmlItem.click(updateRateTableData);

                if (item.IsDefault) {
                    htmlItem = FXStreet.Util.getjQueryObjectById(item.Id + "_default");
                    htmlItem.click(updateRateTableData);
                }

            });

            menuShowMoreDropDown = FXStreet.Util.getjQueryObjectById(menuShowMoreDropDownId);
            menuShowMoreDropDownButton = FXStreet.Util.getjQueryObjectById(menuShowMoreDropDownButtonId);
            menuShowMoreDropDownButton.click(showMoreAction);
            var menuShowMoreDropDownCloseButton = FXStreet.Util.getjQueryObjectById(menuShowMoreDropDownCloseButtonId);
            menuShowMoreDropDownCloseButton.click(showMoreAction);

            $('#' + _this.MenuContainerId + ' .fxs_btn_table_filter').click(function () {
                if (this.id !== menuShowMoreDropDownButtonId) {
                    var buttonElement = $(this);
                    updateActiveButton(buttonElement);
                    setShowMoreButtonText(_this.Translations.ShowMore);
                }
            });
        };

        var updateActiveButton = function (buttonElement) {
            $('#' + _this.MenuContainerId + ' .fxs_btn_table_filter').removeClass('active');
            buttonElement.addClass('active');
        };

        var setShowMoreButtonText = function (txt) {
            menuShowMoreDropDownButton.empty();
            menuShowMoreDropDownButton.append(txt);
            menuShowMoreDropDownButton.append('<i class="fa fa-caret-down" aria-hidden="true"></i>');
        };

        _this.setMyListViewAssets = function (assets) {
            if (assets.length > 0) {
                var assetIds = assets.map(function (a) { return a.AssetId; });
                _this.MyAssetIds = assetIds;

                _this.RatesTableDataManager.renderAssetData(assets);
                FXStreet.Class.MyAssetsList.set(assetIds);
                myListViewButton.show();

                updateActiveButton(myListViewButton);
            } else {
                _this.MyAssetIds = _this.MainViewAssets.map(function (a) { return a.AssetId; });

                _this.RatesTableDataManager.renderAssetData(_this.MainViewAssets);

                FXStreet.Class.MyAssetsList.remove();
                myListViewButton.hide();

                updateActiveButton(mainViewButton);
            }

            setShowMoreButtonText(_this.Translations.ShowMore);
        }


        var showMoreAction = function () {
            if (menuShowMoreDropDown.hasClass(hideElementsCssClass)) {
                _this.RatesTableDataManager.hideAllDropDowns();
                menuShowMoreDropDown.removeClass(hideElementsCssClass);
            } else {
                menuShowMoreDropDown.addClass(hideElementsCssClass);
            }
        };

        var updateRateTableData = function (event) {
            var id = event.currentTarget.id.replace('_default', '');

            var isShowMoreItem = function () {
                var result = event.currentTarget.tagName === 'P';
                return result;
            }

            if (isShowMoreItem()) {
                updateActiveButton(menuShowMoreDropDownButton);
                setShowMoreButtonText(event.currentTarget.textContent);
            }

            var menuItem = getMenuItemById(id);
            var assets = menuItem.Assets;
            if (!menuShowMoreDropDown.hasClass(hideElementsCssClass))
                menuShowMoreDropDown.addClass(hideElementsCssClass);

            _this.RatesTableDataManager.getAndRenderAssetData(assets);
        };

        var getMenuItemById = function (id) {
            var items = $.grep(_this.MenuItems, function (element) {
                return element.Id === id;
            });

            if (items.length === 0) return null;
            var result = items[0];
            return result;
        };

        var getMenuItems = function (data) {
            var menuItemsString = data.TranslationsConfiguration[menuItemsKey];
            var result = JSON.parse(menuItemsString);
            $.each(result, function (index, item) {
                item.Id = "fxs_" + _this.ContainerId + "_menuitem_" + index;
            });
            return result;
        };

        var getJsonData = function () {
            var result = {
                'MenuItems': _this.MenuItems,
                'Translations': _this.Translations,
                'ContainerId': _this.ContainerId
            };
            return result;
        };

        return _this;
    };

    FXStreet.Class.RatesTableDataManager = function () {
        var parent = FXStreet.Class.Base(),
        _this = FXStreet.Util.extendObject(parent);

        _this.ContainerId = "";
        _this.DataContainerId = "";
        _this.HtmlTemplateFile = "ratestable_data.html";
        _this.RatesTableDataCssManager = null;
        _this.ItemsToRecord = ["Last", "Bid", "Ask", "Change", "ChangePercentWithSymbol", "Open", "High", "Low"];
        _this.Translations = [];
        _this.RatesTableEndPoint = "";
        var noDataText = "N/A";

        _this.DataTableContainerId = "";
        _this.DataTableScrollId = "";
        _this.DataTableScrollStartId = "";
        _this.DataTableScrollMiddleId = "";
        _this.DataTableScrollEndId = "";

        _this.DataTableContainer = null;
        _this.DataTableScrollContailer = null;
        _this.DataTableScrollStartContainer = null;
        _this.DataTableScrollMiddleContainer = null;
        _this.DataTableScrollEndContainer = null;

        var hideElementsCssClass = "fxs_hideElements";
        var activeCssClass = "active";
        var tableDom = { Data: {}, Assets: {} };
        var assetSubscribers = {};
        var pushTTObj;


        _this.init = function (json) {
            _this.setSettingsByObject(json);
            _this.setVars(json);
            _this.htmlRender(json);
        };

        _this.setVars = function () {
            pushTTObj = FXStreet.Class.Patterns.Singleton.PushTT.Instance();
            _this.DataContainerId = "fxs_data_" + _this.ContainerId;
            _this.DataTableContainerId = "fxs_data_table_" + _this.ContainerId;

            _this.DataTableScrollId = "fxs_ratestable_scrollButtons_" + _this.ContainerId;
            _this.DataTableScrollStartId = "fxs_swipeContent_start_" + _this.ContainerId;
            _this.DataTableScrollMiddleId = "fxs_swipeContent_middle_" + _this.ContainerId;
            _this.DataTableScrollEndId = "fxs_swipeContent_end_" + _this.ContainerId;

            _this.RatesTableDataCssManager = new FXStreet.Class.RatesTableDataCssManager();
            _this.RatesTableDataCssManager.init();
        };

        _this.htmlRender = function (json) {
            var jsonData = $.extend(json, {}, true);
            updateAssets(jsonData.Assets);
            FXStreet.Util.loadHtmlTemplate(_this.HtmlTemplateFile).done(function (template) {
                var rendered = FXStreet.Util.renderByHtmlTemplate(template, jsonData);
                _this.Container = FXStreet.Util.getjQueryObjectById(_this.DataContainerId);
                _this.Container.html(rendered);

                _this.DataTableContainer = FXStreet.Util.getjQueryObjectById(_this.DataTableContainerId);
                _this.DataTableScrollContailer = FXStreet.Util.getjQueryObjectById(_this.DataTableScrollId);
                _this.DataTableScrollStartContainer = FXStreet.Util.getjQueryObjectById(_this.DataTableScrollStartId);
                _this.DataTableScrollMiddleContainer = FXStreet.Util.getjQueryObjectById(_this.DataTableScrollMiddleId);
                _this.DataTableScrollEndContainer = FXStreet.Util.getjQueryObjectById(_this.DataTableScrollEndId);

                _this.addEvents();
                loadTables(jsonData.Assets);
            });
        };

        _this.getAndRenderAssetData = function (assetIds) {
            var endpoint = FXStreet.Resource.FxsApiRoutes["RatesTableAssets"];
            var querystring = "?assetIds=";
            $.each(assetIds, function (index, asset) {
                querystring = querystring + asset + ",";
            });

            endpoint = endpoint + querystring.slice(0, -1);

            $.get(endpoint).done(function (data) {
                _this.renderAssetData(data);
            }).fail(function () {

            });
        };

        _this.renderAssetData = function (data) {
            var jsonData = {
                Translations: _this.Translations,
                Assets: data,
                ContainerId: _this.ContainerId
            };
            _this.htmlRender(jsonData);
        };

        _this.hideAllDropDowns = function () {
            var dropDownToHide = FXStreet.Util.getjQueryObjectBySelector('.fxs_ratestable_container .fxs_dropdown');
            if (dropDownToHide) {
                dropDownToHide.addClass('fxs_hideElements');
            }
        };

        var updateAssets = function (arrayAsset) {
            $.each(arrayAsset, function (index, asset) {
                if (asset.Trend) { asset.TrendClass = asset.Trend.toLowerCase(); } else { asset.Trend = noDataText; }
                if (asset.ObOs) { asset.ObOsClass = asset.ObOs.toLowerCase(); } else { asset.ObOs = noDataText; }

                asset.Volatility = asset.Volatility || noDataText;
                asset.Ask = asset.Ask || noDataText;
                asset.Bid = asset.Bid || noDataText;
                asset.Last = asset.Last || noDataText;
                asset.DayHigh = asset.DayHigh || noDataText;
                asset.DayLow = asset.DayLow || noDataText;
                asset.Open = asset.Open || noDataText;
                asset.Change = asset.Change || noDataText;
                asset.ChangePercent = asset.ChangePercent || noDataText;
            });
        };

        var loadTables = function (arrayAsset) {
            unsubscriber();
            tableDom = { Data: {}, Assets: {} };
            $.each(arrayAsset, function (index, asset) {
                try {
                    loadDataTable(asset);
                    loadAssetsTable(asset);
                }
                catch (ex) {

                }
            });
            subscribePushTT(arrayAsset);
        };

        var unsubscriber = function () {
            var symbolsIds = [];
            $.each(assetSubscribers, function (key) {
                symbolsIds.push(key);
            });
            if (symbolsIds.length > 0)
                pushTTObj.Unsubscribe(symbolsIds, priceChangeCallback);
            assetSubscribers = {};
        };

        var priceChangeCallback = function (message) {
            var mapper = assetSubscribers[message.symbolId];
            if (mapper) {
                var dto = mapper.createJsonFromMsg(message);
                pushCallback(dto);
            }
        };

        var loadAssetsTable = function (asset) {
            var providerCode = asset.ProviderCode;
            var objectId = "fxs_" + _this.ContainerId + "_asset_" + asset.ProviderCode;
            var htmlObject = FXStreet.Util.getjQueryObjectById(objectId);
            tableDom.Assets[providerCode] = htmlObject;
        };

        var loadDataTable = function (asset) {
            var providerCode = asset.ProviderCode;
            var dataItems = [];
            _this.ItemsToRecord.forEach(function (elementId) {
                var objectId = "fxs_" + _this.ContainerId + "_data_" + asset.ProviderCode + "_" + elementId;
                var htmlObject = FXStreet.Util.getjQueryObjectById(objectId);
                dataItems[elementId] = htmlObject;
            });
            tableDom.Data[providerCode] = dataItems;
        };

        var createRateMapper = function (asset) {
            var result = new FXStreet.Class.RateMapper();
            result.init({
                'PriceProviderCode': asset.ProviderCode,
                'DecimalPlaces': asset.DecimalPlaces
            });
            return result;
        };

        var subscribePushTT = function (arrayAsset) {
            try {
                var symbols = [];
                $.each(arrayAsset, function (index, asset) {
                    var mapper = createRateMapper(asset);
                    assetSubscribers[asset.ProviderCode] = mapper;
                    symbols.push(asset.ProviderCode);
                });
                pushTTObj.Subscribe(symbols, priceChangeCallback);
            } catch (ex) { }
        };

        var pushCallback = function (dataObject) {
            updateTableAssets(dataObject);
            updateTableData(dataObject);
        };

        var updateTableAssets = function (dataObject) {
            var study = dataObject.Study;
            if (study.PriceStatics.PriceClass) {

                var dataToUpdate = {
                    Property: "PriceClass",
                    DataObject: study.PriceStatics,
                    Element: tableDom.Assets[study.PriceProviderCode]
                };
                _this.RatesTableDataCssManager.setCSSBase(dataToUpdate);
            }
        }

        var updateTableData = function (dataObject) {
            var study = dataObject.Study;
            _this.ItemsToRecord.forEach(function (property) {
                if (study.PriceStatics.hasOwnProperty(property)) {
                    if ((tableDom.Data[study.PriceProviderCode][property]) && (study.PriceStatics[property])) {
                        tableDom.Data[study.PriceProviderCode][property].text(study.PriceStatics[property]);
                        var dataToUpdate = {
                            Property: property,
                            DataObject: study.PriceStatics,
                            Element: tableDom.Data[study.PriceProviderCode][property]
                        };
                        _this.RatesTableDataCssManager.setCSSBase(dataToUpdate);
                    }
                }
            });
        }

        var clearScrollActive = function () {
            _this.DataTableScrollStartContainer.removeClass(activeCssClass);
            _this.DataTableScrollMiddleContainer.removeClass(activeCssClass);
            _this.DataTableScrollEndContainer.removeClass(activeCssClass);
        }

        _this.addEvents = function () {
            setOnScrollEvents();
        };

        var setOnScrollEvents = function () {
            if (FXStreet.Util.isMobileDevice() && FXStreet.Util.isTouchDevice()) {
                _this.DataTableScrollContailer.removeClass(hideElementsCssClass);

                _this.DataTableContainer.scroll(function (event) {
                    var scrollleft = _this.DataTableContainer.scrollLeft();
                    var max = _this.DataTableContainer.find('tbody').width() - _this.DataTableContainer.width();

                    if (scrollleft === 0) {
                        clearScrollActive();
                        _this.DataTableScrollStartContainer.addClass(activeCssClass);
                    } else if (scrollleft < max) {
                        clearScrollActive();
                        _this.DataTableScrollMiddleContainer.addClass(activeCssClass);
                    } else {
                        clearScrollActive();
                        _this.DataTableScrollEndContainer.addClass(activeCssClass);
                    }

                });
            }
        }

        return _this;

    }

    FXStreet.Class.RatesTableDataCssManager = function () {
        var parent = FXStreet.Class.Base(),
        _this = FXStreet.Util.extendObject(parent);
        var cssStrategies = [];

        _this.init = function () {
            cssStrategies = [new PriceStudiesStrategy(), new ChangeValuesStrategy(), new AssetPairStrategy()];
        };

        _this.setCSSBase = function (dataToUpdate) {
            var strategy = $.grep(cssStrategies, function (element) {
                return element.isMatch(dataToUpdate.Property);
            });

            if (strategy.length !== 0)
                return strategy[0].setCSS(dataToUpdate);
        };

        var AssetPairStrategy = function () {
            const allowedElement = "PriceClass";
            const ratesTableDefaultCss = "fxs_widget_ratestable";

            this.isMatch = function (property) {
                return property === allowedElement;
            }

            this.setCSS = function (dataToUpdate) {
                var cssClass = dataToUpdate.DataObject.PriceClass;
                if (cssClass && !dataToUpdate.Element.hasClass(cssClass)) {
                    dataToUpdate.Element[0].className = ratesTableDefaultCss + ' ' + cssClass;
                }
            }
        };

        var PriceStudiesStrategy = function () {
            var allowedElements = ["Bid", "Ask", "Last"];
            const ratesTableChangeBgCss = "fxs_ratestable_change_bg";

            this.isMatch = function (property) {
                return $.inArray(property, allowedElements) !== -1;
            }

            this.setCSS = function (dataToUpdate) {
                var cssClass = dataToUpdate.DataObject[dataToUpdate.Property + "Class"];
                if (cssClass) {
                    dataToUpdate.Element[0].className = ratesTableChangeBgCss + ' ' + cssClass;
                    setTimeout(function () {
                        dataToUpdate.Element[0].className = ratesTableChangeBgCss;
                    }, 600);
                }
            }
        };

        var ChangeValuesStrategy = function () {
            var allowedElements = ["Change", "ChangePercentWithSymbol"];
            const ratesTableChangeCss = "fxs_ratestable_change";

            this.isMatch = function (property) {
                return $.inArray(property, allowedElements) !== -1;
            }

            this.setCSS = function (dataToUpdate) {
                var cssClass = dataToUpdate.DataObject.ChangePercentClass;
                if (cssClass && !dataToUpdate.Element.hasClass(cssClass)) {
                    dataToUpdate.Element[0].className = ratesTableChangeCss + ' ' + cssClass;
                }
            }
        };


        return _this;
    };

    FXStreet.Class.MyAssetsList = function () {
        var parent = FXStreet.Class.Base(),
            _this = FXStreet.Util.extendObject(parent);

        var rateTablesMyListAssetsKey = 'assetsMultiRateSetting';

        _this.get = function () {
            var result = null;
            if (typeof (Storage) !== "undefined") {
                try {
                    var sessionValue = JSON.parse(localStorage.getItem(rateTablesMyListAssetsKey));

                    if (Object.prototype.toString.call(sessionValue) === '[object Object]') {
                        result = Object.keys(sessionValue);
                        _this.set(result);
                    } else {
                        result = sessionValue;
                    }

                } catch (e) { }
            }
            return result;
        };

        _this.set = function (assets) {
            if (Object.prototype.toString.call(assets) === '[object Array]') {
                if (assets.length > 0) {
                    localStorage.setItem(rateTablesMyListAssetsKey, JSON.stringify(assets));
                } else {
                    localStorage.removeItem(rateTablesMyListAssetsKey);
                }
            } else {
                console.warn('You are trying to set a wrong value as a ' +
                    rateTablesMyListAssetsKey +
                    ' in the session storage');
            }
        };

        _this.remove = function () {
            localStorage.removeItem(rateTablesMyListAssetsKey);
        };

        return _this;
    }();

}());
(function () {
    FXStreet.Class.Recaptcha = function () {
        var parent = FXStreet.Class.Base(),
            _this = FXStreet.Util.extendObject(parent);

        _this.ContainerId = "";
        _this.Config = {};
        _this.RecaptchaInitialized = false;
        _this.CaptchaId = "";

        _this.init = function (json) {
            _this.setSettingsByObject(json);
            _this.setVars();
            _this.htmlRender(json);
        };

        _this.setVars = function () {
            _this.Container = FXStreet.Util.getjQueryObjectById(_this.ContainerId);
        };

        _this.htmlRender = function (jsonData) {
            if (_this.RecaptchaInitialized === false) {
                _this.CaptchaId = grecaptcha.render(_this.ContainerId,
                {
                    sitekey: FXStreet.Resource.GoogleReCaptchaSiteKey,                                        
                    callback: _this.Config.Callback,
                    size: 'invisible',
                    badge: 'inline'
                });
                _this.RecaptchaInitialized = true;
            }
        };

        _this.Reset = function () {
            grecaptcha.reset(_this.CaptchaId);
        }

        _this.Execute = function () {
            grecaptcha.execute(_this.CaptchaId);
        }

        _this.GetResponse = function () {
            var response = grecaptcha.getResponse(_this.CaptchaId);
            return (response.length > 0);
        }

        return _this;
    };
}());
(function () {
    FXStreet.Class.RelatedPostsByCategories = function () {
        var parent = FXStreet.Class.Base(),
            _this = FXStreet.Util.extendObject(parent);

        // ----- begin json properties -----
        _this.ContainerId = "";
        _this.ContentId = "";
        // ----- end json properties -----
        _this.Container = null;
        _this.HtmlTemplateFile = "relatedpostsbycategories_default.html";
        _this.RelatedPosts = [];

        _this.init = function (json) {
            _this.setSettingsByObject(json);
            _this.setVars();
            _this.renderData();
        };

        _this.setVars = function () {
            _this.Container = FXStreet.Util.getjQueryObjectById(_this.ContainerId);
        };

        _this.renderData = function () {

            if (_this.RelatedPosts !== null && _this.RelatedPosts !== undefined)
            {
                if(_this.RelatedPosts.length <= 0) {
                    _this.hideRelatedContent();
                    return;
                }
            
                _this.RelatedPosts.forEach(function (item) {
                    item.HasVideo = (item.JsType == "VideoItem");
                });
            

                var jsonData = {
                    "RelatedPosts": _this.RelatedPosts
                };

                _this.renderHtml(jsonData);
            }
             
        };

        _this.renderHtml = function (jsonData) {
            FXStreet.Util.loadHtmlTemplate(_this.HtmlTemplateFile).done(function (template) {
                var rendered = FXStreet.Util.renderByHtmlTemplate(template, jsonData);
                _this.Container.append(rendered);
            });
        };

        _this.hideRelatedContent = function () {
            var footer = $("article[fxs-it-id='" + _this.ContentId + "']").find("footer").first();
            if (footer) {
                footer.hide();
            }
        };

        return _this;
    };
}());
(function () {
    FXStreet.Class.ResponsiveDesign = function () {
        var parent = FXStreet.Class.Base(),
           _this = FXStreet.Util.extendObject(parent);

        var resizeToDeviceObserverSubjects = {};
        var resizeIncreaseToSizeObserverSubjects = [];
        var resizeDecreaseToSizeObserverSubjects = [];

        var desktopWidthLimitPx = 1200;
        var mobileWidthLimitPx = 768;
        var tabletWidthLimitPx = 1024;

        var windowWidth = 0;

        var deviceType = 'Desktop'; // DesktopHD, Desktop, Mobile, Tablet // TODO as enumerable

        _this.getWindowWidth = function () {
            var result = window.innerWidth;
            return result;
        };

        var getDeviceTypeByCurrentWindowWidth = function () {
            windowWidth = _this.getWindowWidth();

            var result = 'DesktopHD'; // DesktopHD, Desktop, Mobile, Tablet
            if (windowWidth < mobileWidthLimitPx) {
                result = 'Mobile';
            }
            else if (windowWidth < tabletWidthLimitPx) {
                result = 'Tablet';
            }
            else if (windowWidth < desktopWidthLimitPx) {
                result = 'Desktop';
            }
            return result;
        };

        var setVars = function () {
            deviceType = getDeviceTypeByCurrentWindowWidth();

            resizeToDeviceObserverSubjects.Mobile = new FXStreet.Class.Patterns.Observer.Subject();
            resizeToDeviceObserverSubjects.Tablet = new FXStreet.Class.Patterns.Observer.Subject();
            resizeToDeviceObserverSubjects.Desktop = new FXStreet.Class.Patterns.Observer.Subject();
            resizeToDeviceObserverSubjects.DesktopHD = new FXStreet.Class.Patterns.Observer.Subject();
        };

        var checkDeviceChange = function () {
            var currentDeviceType = getDeviceTypeByCurrentWindowWidth();
            if (currentDeviceType !== deviceType) {
                deviceType = currentDeviceType;
                var subject = resizeToDeviceObserverSubjects[deviceType];
                if (subject) {
                    subject.notify();
                }
            }
        };

        var checkWidthBreaksChanges = function (currentWidth, lastWidth) {
            var minWidthRange = Math.min(currentWidth, lastWidth);
            var maxWidthRange = Math.max(currentWidth, lastWidth);

            var subjects = currentWidth > lastWidth ? resizeIncreaseToSizeObserverSubjects : resizeDecreaseToSizeObserverSubjects;
            var selelectedSubjects = subjects.filter(function (item, width) {
                return minWidthRange < width && width <= maxWidthRange;
            });
            selelectedSubjects.forEach(function (subject) {
                subject.notify();
            });
        };

        var windowResize = function () {
            var lastWidth = windowWidth;
            windowWidth = _this.getWindowWidth();

            checkDeviceChange();
            checkWidthBreaksChanges(windowWidth, lastWidth);
        };

        var addEvents = function () {
            $(window).resize(windowResize);
        };

        var addObserver = function (subjects, functionDelegate, key) {
            if (typeof functionDelegate === "function") {
                var json = { 'UpdateDelegate': functionDelegate };
                var observer = new FXStreet.Class.Patterns.Observer.Observer();
                observer.init(json);
                var subject = subjects[key];
                if (!subject) {
                    subject = subjects[key] = new FXStreet.Class.Patterns.Observer.Subject();
                }
                subject.addObserver(observer);
            }
        }

        var whenWindowResizesToDevice = function (functionDelegate, deviceType) {
            addObserver(resizeToDeviceObserverSubjects, functionDelegate, deviceType);
        };

        _this.init = function (json) {
            _this.setSettingsByObject(json);
            setVars();
            addEvents();
        };

        _this.IsDesktop = function () {
            var result = deviceType === 'Desktop' || deviceType === 'DesktopHD';
            return result;
        }

        _this.IsMobile = function () {
            var result = deviceType === 'Mobile';
            return result;
        }

        _this.whenWindowResizesToMobile = function (functionDelegate) {
            whenWindowResizesToDevice(functionDelegate, 'Mobile');
        };
        _this.whenWindowResizesToTablet = function (functionDelegate) {
            whenWindowResizesToDevice(functionDelegate, 'Tablet');
        };
        _this.whenWindowResizesToDesktop = function (functionDelegate) {
            whenWindowResizesToDevice(functionDelegate, 'Desktop');
        };
        _this.whenWindowResizesToDesktopHD = function (functionDelegate) {
            whenWindowResizesToDevice(functionDelegate, 'DesktopHD');
        };
        _this.whenWindowDecreaseToSize = function (functionDelegate, width) {
            addObserver(resizeDecreaseToSizeObserverSubjects, functionDelegate, width);
        };
        _this.whenWindowIncreaseToSize = function (functionDelegate, width) {
            addObserver(resizeIncreaseToSizeObserverSubjects, functionDelegate, width);
        };

        return _this;
    };
}());
(function () {
    FXStreet.Class.SearchManager = function () {
        var parent = FXStreet.Class.Base(),
            _this = FXStreet.Util.extendObject(parent);

        _this.ContainerId = '';
        _this.SearchIconId = '';
        _this.IndexId = '';
        _this.Translations = null;

        _this.HtmlTemplate = 'search';
        _this.HtmlTemplateIndex = 'search-index';
        _this.SearchInputSelector = '#fxs-search-input';
        _this.ResultsContainerId = 'fxs-search-results';
        _this.IndexContainerId = 'index-data';
        _this.Container = null;
        _this.ResultsContainer = null;
        _this.SearchInput = null;
        _this.SearchIcon = null;
        _this.ApiManager = null;

        _this.init = function (json) {
            _this.setSettingsByObject(json);
            _this.setVars(json);
            if (_this.ApiManager != null) {
                _this.enableSearch(json);
            }
            else {
                _this.disableSearch();
            }
        };

        _this.setVars = function (data) {
            if (_this.ContainerId !== '') {
                _this.Container = FXStreet.Util.getjQueryObjectById(_this.ContainerId, false);
            }
            if (_this.SearchIconId !== '') {
                _this.SearchIcon = FXStreet.Util.getjQueryObjectById(_this.SearchIconId, false);
            }
            var algoliaApiClient = algoliasearch(data.ApiAccount, data.ApiKey, { protocol: location.protocol });
            _this.ApiManager = algoliaApiClient.initIndex(_this.IndexId);            
        };

        _this.render = function (data) {
            FXStreet.Util.loadHtmlTemplate(_this.HtmlTemplate).done(function (template) {
                var rendered = FXStreet.Util.renderByHtmlTemplate(template, data);
                _this.Container.html(rendered);
                _this.rendered(data);
            });            
        };

        _this.rendered = function (data) {
            _this.SearchInput = FXStreet.Util.getjQueryObjectBySelector(_this.SearchInputSelector, false);

            _this.addEvents();
        };

        _this.addEvents = function () {
            if (_this.SearchInput != null) {
                _this.SearchInput.on('keyup paste', _this.onSearchUpdated);
            }
            _this.SearchIcon.on('click', function() {
                _this.Container.toggleClass('fxs_dBlock');
            });
        };

        _this.onSearchUpdated = function (arg) {
            var query = _this.SearchInput.val();
            _this.search(query);
        };

        _this.search = function (query) {
            if (query !== '') {
                var params= {
                    hitsPerPage: 50,
                    maxValuesPerFacet: 3,
                    filters: 'CultureName:' + FXStreet.Resource.CultureName
                }

                _this.ApiManager.search(query, params, _this.searchDone);
            }
            else {
                _this.searchOff();
            }
        };

        _this.searchDone = function (err, content) {
            if (err == null) {
                var suggestions = content.hits;
                _this.CalculatePublicationDate(suggestions)
                var indexJson = {
                    Index: _this.IndexId,
                    Suggestions: suggestions,
                    Translations: _this.Translations,
                    Query: content.query
                };
                _this.renderIndex(indexJson);
            }
            else {
                var indexJson = {
                    Index: _this.IndexId,
                    Suggestions: [],
                    Translations: _this.Translations
                };
                _this.renderIndex(indexJson);
                console.log(err.message);
            }
            _this.ResultsContainer = FXStreet.Util.getjQueryObjectById(_this.ResultsContainerId, false);
            if(_this.ResultsContainer != null){
                _this.ResultsContainer.show();
            }
        };

        _this.searchOff = function () {
            var indexContainer = FXStreet.Util.getjQueryObjectById(_this.IndexContainerId, false);
            if (indexContainer != null) {
                indexContainer.empty();
            }
        };

        _this.renderIndex = function (indexJson) {
            var indexContainer = FXStreet.Util.getjQueryObjectById(_this.IndexContainerId, false);

            FXStreet.Util.loadHtmlTemplate(_this.HtmlTemplateIndex).done(function (template) {
                var html = FXStreet.Util.renderByHtmlTemplate(template, indexJson);
                if (indexContainer != null) {
                    indexContainer.html(html);
                    indexContainer.find('.fxs_it_close').click(_this.searchOff);
                }
            });
        };

        _this.enableSearch = function (json) {
            _this.render(json);
        };

        _this.disableSearch = function () {
            _this.SearchIcon.remove();
            _this.Container.remove();
        };

        _this.CalculatePublicationDate = function (suggestions) {
            suggestions.forEach(function (suggestion) {
                if (suggestion.PublicationTime != undefined) {
                    suggestion.Publication = _this.GetUserDateByUnix(suggestion.PublicationTime);
                }
            });
        };

        _this.GetUserDateByUnix = function (timestamp) {
            var result = FXStreet.Class.Patterns.Singleton.TimeZoneManager.Instance().GetUserDateByUnix(timestamp);

            return result;
        };

        return _this;
    };
    FXStreet.Class.AdvancedSearchManager = function () {
        var parent = FXStreet.Class.Base(),
            _this = FXStreet.Util.extendObject(parent);

        _this.ContainerId = '';
        _this.IndexId = '';
        _this.CategoryFiltered = '';
        _this.ShowTitle = true;
        _this.ShowClearAll = true;
        _this.ShowSearchBox = true;
        _this.SearchPlaceholder = '';
        _this.HideFiltersOnMobile = false;
        _this.AllowFiltersCollapse = true;
        _this.ShowTagFilter = true;
        _this.TagsTitle = '';
        _this.TagsPlaceholder = '';
        _this.TagsLimit = 0;
        _this.ShowAuthorFilter = true;
        _this.AuthorsTitle = '';
        _this.AuthorsPlaceholder = '';
        _this.AuthorsLimit = 0;
        _this.DefaultStatsFilter = '';
        _this.ShowResultImage = true;
        _this.DisplayGrid = true;
        _this.Translations = null;
        _this.HttpPushServerUrl = '';
        _this.HttpPushServerKeysUrl = '';
        _this.HttpPushFeatures = [];

        _this.HtmlTemplate = 'search_configurable';
        _this.HtmlTemplateFilter = 'advanced_search_filter';
        _this.HtmlTemplateResults = 'advanced_search_results';

        _this.Container = null;

        _this.ApiManager = null;
        _this.Widgets = null;
        _this.HitsWidget = null;

        _this.Templates = 
            {
                Filter:
                    {
                        ClearAll: { Template: 'advanced_search_filter_clear_all', Content: '' },
                        RefinementListHeader: { Template: 'advanced_search_filter_refinement_list_header', Content: '' },
                        RefinementListNoResults: { Template: 'advanced_search_filter_refinement_list_no_results', Content: '' },
                        RefinementListItem: { Template: 'advanced_search_filter_refinement_list_item', Content: '' }
                    },
                Results:
                    {
                        Hit: { Template: 'advanced_search_results_hit', Content: '' },
                        HitEmpty: { Template: 'advanced_search_results_hit_empty', Content: '' },
                        PaginationPrevious: { Template: 'advanced_search_results_pagination_previous', Content: '' },
                        PaginationNext: { Template: 'advanced_search_results_pagination_next', Content: '' }
                    },
                Stats:
                    {
                        AboutResults: { Template: 'advanced_search_stats_about', Content: '' }
                    }
            };

        _this.Alert = null;
        _this.AlertCloseButton = null;
        
        _this.init = function (json) {
            _this.setSettingsByObject(json);
            _this.setVars(json);
            _this.render(json);
            subscribeHttpPush();
        };

        _this.setVars = function (data) {
            _this.ApiManager = instantsearch({
                appId: data.ApiAccount,
                apiKey: data.ApiKey,
                indexName: _this.IndexId,
                urlSync: true,
                protocol: location.protocol,
                searchParameters: {
                    filters: getFilters()
                }
            });

            if (_this.ContainerId !== '') {
                _this.Container = FXStreet.Util.getjQueryObjectById(_this.ContainerId, false);
            }

            _this.Widgets = {
                Categories: { ContainerSelector: '#filter-categories', Name: 'Category', Title: _this.Translations["CategoriesTitle"], PlaceHolder: _this.Translations["CategoriesPlaceHolder"], Typeahead: false },
                Tags: { ContainerSelector: '#filter-tags', Name: 'Tags', Title: _this.TagsTitle, PlaceHolder: _this.TagsPlaceholder, Typeahead: true, Limit: _this.TagsLimit },
                Authors: { ContainerSelector: '#filter-authors', Name: 'AuthorName', Title: _this.AuthorsTitle, PlaceHolder: _this.AuthorsPlaceholder, Typeahead: true, Limit: _this.AuthorsLimit },
                ClearAll: { ContainerSelector: '#clear-all', Title: _this.Translations["ClearAllTitle"] },
                SearchBox: { ContainerSelector: '#q', PlaceHolder: _this.SearchPlaceholder},
                Stats: { ContainerSelector: '#stats' },
                Hits: { ContainerSelector: '#hits' },
                Pagination: { ContainerSelector: '#pagination' },
                ItemsPerPage: { ContainerSelector: '#items-per-page-selector' }
            };
        };

        var getFilters = function () {
            var result = 'CultureName:' + FXStreet.Resource.CultureName;
            if (_this.CategoryFiltered !== '') {
                result += " AND Category:'" + _this.CategoryFiltered + "'";
            }
            return result;
        };

        _this.render = function (json) {
            FXStreet.Util.loadHtmlTemplate(_this.HtmlTemplate).done(function(template) {
                var rendered = FXStreet.Util.renderByHtmlTemplate(template, json);
                _this.Container.html(rendered);

                loadTemplates(json);

                initFilter(json);
                initResults(json);
                initAlert();
            });
        };

        var loadTemplates = function (json) {
            var templates = [
                _this.Templates.Filter.ClearAll,
                _this.Templates.Filter.RefinementListHeader,
                _this.Templates.Filter.RefinementListNoResults,
                _this.Templates.Filter.RefinementListItem,

                _this.Templates.Results.Hit,
                _this.Templates.Results.HitEmpty,
                _this.Templates.Results.PaginationPrevious,
                _this.Templates.Results.PaginationNext,

                _this.Templates.Stats.AboutResults
            ];

            loadTemplateRecursive(templates, 0, json);
        };

        var loadTemplateRecursive = function (templates, pos, json) {
            if (pos < templates.length) {
                FXStreet.Util.loadHtmlTemplate(templates[pos].Template).done(function (template) {
                    templates[pos].Content = FXStreet.Util.renderByHtmlTemplate(template, json);
                    loadTemplateRecursive(templates, pos + 1, json);
                });
            }
        };

        var initFilter = function () {
            var anyFilterAvailable = false;
            if (_this.CategoryFiltered === '') {
                initRefinementListWidget(_this.Widgets.Categories);
                anyFilterAvailable = true;
            }
            if (_this.ShowTagFilter) {
                initRefinementListWidget(_this.Widgets.Tags);
                anyFilterAvailable = true;
            }
            if (_this.ShowAuthorFilter) {
                initRefinementListWidget(_this.Widgets.Authors);
                anyFilterAvailable = true;
            }

            if (anyFilterAvailable && _this.ShowClearAll) {
                initClearAllWidget();
            }
        };

        var initClearAllWidget = function () {
            var widget = _this.Widgets.ClearAll;
            _this.ApiManager.addWidget(
              instantsearch.widgets.clearAll({
                  container: widget.ContainerSelector,
                  templates: {
                      link: _this.Templates.Filter.ClearAll.Content
                  },
                  cssClasses: {
                      root: 'btn btn-block btn-default'
                  },
                  autoHideContainer: true
              })
            );
        };

        var initRefinementListWidget = function (widget) {
            var settings = {
                container: widget.ContainerSelector,
                attributeName: widget.Name,
                operator: 'or',
                limit: widget.Limit === 0 ? 10 : (widget.Limit || 10),
                templates: {
                    item: _this.Templates.Filter.RefinementListItem.Content,
                    header: _this.Templates.Filter.RefinementListHeader.Content.replace('{FILTER_HEADER}', widget.Title)
                },
                collapsible: _this.AllowFiltersCollapse,
                sortBy: ['isRefined', 'count:desc']
            };
            if (widget.Typeahead) {
                settings.searchForFacetValues = {
                    placeholder: widget.PlaceHolder,
                    templates: {
                        noResults: _this.Templates.Filter.RefinementListNoResults.Content
                    }
                };
            }
            _this.ApiManager.addWidget(instantsearch.widgets.refinementList(settings));
        };

        var initResults = function () {
            initSearchBoxWidget();
            initStatsWidget();
            initHitsWidget();
            initPaginationWidget();

            _this.ApiManager.start();
        };

        var initSearchBoxWidget = function () {
            var widget = _this.Widgets.SearchBox;
            _this.ApiManager.addWidget(
              instantsearch.widgets.searchBox({
                  container: widget.ContainerSelector,
                  placeholder: widget.PlaceHolder
              })
            );
        };

        var initStatsWidget = function () {
            var widget = _this.Widgets.Stats;
            _this.ApiManager.addWidget(
                instantsearch.widgets.stats({
                    container: widget.ContainerSelector,
                    templates: {
                        body: _this.Templates.Stats.AboutResults.Content
                    },
                    transformData: function (data) {
                        var filters = getFiltersFromWidget();
                        var result = {
                            AboutText: _this.Translations.AboutText.replace('{{Hits}}', data.nbHits),
                            AboutForText: _this.Translations.AboutForText.replace('{{Hits}}', data.nbHits),
                            Filters: filters,
                            HasFilters: filters.length > 0
                        };
                        return result;
                    }
                })
             );
        };

        var getFiltersFromWidget = function() {
            var tagsFiltered = getFilteredTags();
            var authorsFiltered = getFilteredAuthors();

            var filters = tagsFiltered.concat(authorsFiltered);

            if (_this.CategoryFiltered === '') {
                var categoriesFiltered = getFilteredCategories();
                filters = categoriesFiltered.concat(filters);
            }

            if (filters.length === 0 && _this.DefaultStatsFilter !== '') {
                filters = [_this.DefaultStatsFilter];
            }

            var result = $.map(filters, function(filter, index) {
                return {
                    Value: filter,
                    HasComma: index !== filters.length - 1
                };
            });
            return result;
        };

        var initHitsWidget = function () {
            var widget = _this.Widgets.Hits;
            var widgetObj = instantsearch.widgets.hits({
                container: widget.ContainerSelector,
                hitsPerPage: 20,
                templates: {
                    empty: _this.Templates.Results.HitEmpty.Content,
                    item: _this.Templates.Results.Hit.Content
                },
                transformData: function(hit) {
                    hit.ShowResultImage = _this.ShowResultImage;
                    hit.ShowResultCategory = _this.CategoryFiltered === '';
                    hit.DisplayGrid = _this.DisplayGrid;
                    hit.PublicationTime = getDateByUnix(hit.PublicationTime);
                    hit.stars = [];
                    for (var i = 1; i <= 5; ++i) {
                        hit.stars.push(i <= hit.rating);
                    }
                    return hit;
                }
            });

            _this.ApiManager.addWidget(widgetObj);
            _this.HitsWidget = widgetObj;
        };

        var initPaginationWidget = function () {
            var widget = _this.Widgets.Pagination;
            _this.ApiManager.addWidget(
              instantsearch.widgets.pagination({
                  container: widget.ContainerSelector,
                  cssClasses: {
                      active: 'active'
                  },
                  labels: {
                      previous: _this.Templates.Results.PaginationPrevious.Content,
                      next: _this.Templates.Results.PaginationNext.Content
                  },
                  showFirstLast: false
              })
            );
        };

        var initAlert = function() {
            _this.Alert = FXStreet.Util.getjQueryObjectById("fxs_search_alert_" + _this.ContainerId, false);
            _this.AlertCloseButton = FXStreet.Util.getjQueryObjectById("fxs_search_alert_btn_" + _this.ContainerId, false);
            _this.AlertCloseButton.click(onAlertCloseClick);
        };

        var onAlertCloseClick = function (event) {
            event.preventDefault();
            _this.Alert.addClass('fxs_hideElements');
        };

        var getDateByUnix = function (timestamp) {
            var result = FXStreet.Class.Patterns.Singleton.TimeZoneManager.Instance().GetUserDateByUnix(timestamp);

            return result;
        };

        var getFilteredCategories = function () {
            var state = _this.ApiManager.helper.state;
            var result = state.disjunctiveFacetsRefinements.Category ? state.disjunctiveFacetsRefinements.Category : [];
            return result;
        };

        var getFilteredTags = function () {
            var state = _this.ApiManager.helper.state;
            var result = state.disjunctiveFacetsRefinements.Tags ? state.disjunctiveFacetsRefinements.Tags : [];
            return result;
        };

        var getFilteredAuthors = function () {
            var state = _this.ApiManager.helper.state;
            var result = state.disjunctiveFacetsRefinements.AuthorName ? state.disjunctiveFacetsRefinements.AuthorName : [];
            return result;
        };

        var subscribeHttpPush = function () {
            if (typeof FXStreetPush !== 'undefined') {
                var auth = FXStreet.Class.Patterns.Singleton.Authorization.Instance();
                auth.getTokenPromise().then(function (token) {
                    var options = {
                        token: token,
                        tokenUrl: _this.HttpPushServerKeysUrl,
                        httpPushServerUrl: _this.HttpPushServerUrl,
                        culture: FXStreet.Resource.CultureName
                    };
                    var push = FXStreetPush.PushNotification.getInstance(options);
                    push.postSubscribe(_this.HttpPushFeatures, postNotify);
                });
            }
            else {
                console.log("FXStreetPush load failed");
            }
        };

        var postNotify = function (post) {
            if (isFromFilteredTags(post) && isFromFilteredAuthors(post)) {
                _this.Alert.removeClass('fxs_hideElements');
            }
        };

        var isFromFilteredTags = function (post) {
            var tagsFiltered = getFilteredTags();

            if (tagsFiltered.length === 0) {
                return true;
            }

            if (!post.Tags) {
                return false;
            }

            for (var i = 0; i < tagsFiltered.length; i++) {
                var tagName = tagsFiltered[i];
                for (var j = 0; j < post.Tags.length; j++) {
                    var tag = post.Tags[i];
                    if (tag.Name === tagName) {
                        return true;
                    }
                }
            }

            return false;
        };

        var isFromFilteredAuthors = function (post) {
            var authorsFiltered = getFilteredAuthors();
            if (authorsFiltered.length === 0) {
                return true;
            }

            for (var i = 0; i < authorsFiltered.length; i++) {
                var authorName = authorsFiltered[i];
                if (post.Author && post.Author.Name === authorName) {
                    return true;
                }
            }

            return false;
        };

        return _this;
    };
}());
(function() {
    FXStreet.Class.Patterns.Singleton.SeoMetaTags = (function() {
        var instance;

        var seoMetaTagsObject = function() {
            var parent = FXStreet.Class.Base(),
               _this = FXStreet.Util.extendObject(parent);

            _this.FullUrl = "";
            _this.Image = "";
            _this.MetaTitle = "";
            _this.Summary = "";
            _this.Keywords = "";

            _this.init = function (json) {
                _this.setSettingsByObject(json);
            };

            _this.initHomeMetaTagsObject = function (data) {
                _this.FullUrl = data.FullUrl;
                _this.Image = data.Image;
                _this.MetaTitle = data.MetaTitle;
                _this.Summary = data.Summary;
                _this.Keywords = data.Keywords;
            };

            return _this;
        };

        function createInstance() {
            var object = seoMetaTagsObject();
            object.init({});
            return object;
        };

        return {
            Instance: function () {
                if (!instance) {
                    instance = createInstance();
                }
                return instance;
            }
        };
    })();
}());
(function () {
    FXStreet.Class.Seo = {};
    FXStreet.Class.Seo.Base = function () {
        var parent = FXStreet.Class.Base(),
        _this = FXStreet.Util.extendObject(parent);

        _this.updateMetaTags = function (information, pageUrl) {

        };

        _this.setUrlToHistory = function (title, url, informationId) {
            FXStreet.Util.updateUrl(informationId, title, url);
        };

        _this.isValid = function (obj) {
            return obj != null && !_this.isUndefined(obj);
        };

        _this.isUndefined = function (obj) {
            return typeof obj === "undefined";
        };

        return _this;
    };
    FXStreet.Class.Seo.Post = function () {

        var parent = FXStreet.Class.Seo.Base(),
        _this = FXStreet.Util.extendObject(parent);

        var updateBasicMetaTags = function (information) {
            if (information) {
                var seo = information.SEO;

                $("meta[name='description']").attr('content', seo.MetaDescription);
                $("meta[name='keywords']").attr('content', seo.KeyWords);
                document.title = seo.MetaTitle;
            }
        }

        var updateOpenGraph = function (information) {
            if (information) {
                var seo = information.SEO;
                var image = information.Image;

                $("meta[property='og\\:title']").attr('content', seo.MetaTitle);
                $("meta[property='og\\:description']").attr('content', seo.MetaDescription);
                if (_this.isValid(image)){
                    $("meta[property='og\\:image']").attr('content', image.Url_Small);
                }
                
                $("meta[property='og\\:url']").attr('content', seo.FullUrl);
            }
        };
        var updateTwitter = function (information) {
            if (information) {
                var seo = information.SEO;
                var image = information.Image;

                //Twitter
                $("meta[name='twitter\\:title']").attr('content', seo.MetaTitle);
                $("meta[name='twitter\\:description']").attr('content', seo.MetaDescription);
                if (_this.isValid(image)) {
                    $("meta[name='twitter\\:image']").attr('content', image.Url_Small);
                }
                $("meta[name='twitter\\:url']").attr('content', seo.FullUrl);
            }
        };

        var updateUrl = function (information) {
            if (information) {
                var seo = information.SEO;

                var url = seo.FullUrl.replace(/ /g, '-').toLowerCase();

                _this.setUrlToHistory(seo.MetaTitle, url, information.Id);
            }
        };

        var addAmpLink = function (information) {
            if (information.SEO.AmpUrl !== null && information.SEO !== "") {
                if ($('link[rel=amphtml]').length > 0) {
                    $('link[rel=amphtml]').attr('href', information.SEO.AmpUrl);
                }
                else {
                    $('head').append($("<link rel='amphtml' />").attr('href', information.SEO.AmpUrl));
                }
            }
        }


        _this.updateMetaTags = function (item, pageUrl) {

            updateBasicMetaTags(item);
            updateOpenGraph(item);
            updateTwitter(item);
            updateUrl(item);

            parent.updateMetaTags(item, null);
            addAmpLink(item);

        }
        return _this;

    };
    FXStreet.Class.Seo.Home = function () {

        var parent = FXStreet.Class.Seo.Base(),
       _this = FXStreet.Util.extendObject(parent);

        var updateBasicMetaTags = function (homeSeoItemSaved) {
            if (homeSeoItemSaved !== undefined && homeSeoItemSaved !== null) {

                $("meta[name='description']").attr('content', homeSeoItemSaved.Summary);
                $("meta[name='keywords']").attr('content', homeSeoItemSaved.Keywords);
                document.title = homeSeoItemSaved.MetaTitle;
            }
        }
        var updateOpenGraph = function (homeSeoItemSaved) {
            if (homeSeoItemSaved) {
                
                $("meta[property='og\\:title']").attr('content', homeSeoItemSaved.MetaTitle);
                $("meta[property='og\\:description']").attr('content', homeSeoItemSaved.Summary);
                $("meta[property='og\\:image']").attr('content', homeSeoItemSaved.Image ? homeSeoItemSaved.Image.Url_Small : "");
                $("meta[property='og\\:url']").attr('content', homeSeoItemSaved.FullUrl);
            }
        };
        var updateTwitter = function (homeSeoItemSaved) {

            if (homeSeoItemSaved) {
                $("meta[name='twitter\\:title']").attr('content', homeSeoItemSaved.MetaTitle);
                $("meta[name='twitter\\:description']").attr('content', homeSeoItemSaved.Summary);
                $("meta[name='twitter\\:image']").attr('content', homeSeoItemSaved.Image ? homeSeoItemSaved.Image.Url_Small : "");
                $("meta[name='twitter\\:url']").attr('content', homeSeoItemSaved.FullUrl);
            }
        };
        var updateUrl = function (urlHome, id) {
            if (urlHome !== undefined && urlHome !== null) {
                var url = urlHome.replace(/ /g, '-').toLowerCase();
                _this.setUrlToHistory("", url, id);
            }
        };

        _this.updateMetaTags = function (homeItemSaved, pageUrl) {

            updateBasicMetaTags(homeItemSaved);
            updateOpenGraph(homeItemSaved);
            updateTwitter(homeItemSaved);
            updateUrl(FXStreet.Resource.PageUrl, "fxs_home");

            parent.updateMetaTags(null, homeItemSaved);
        };

        return _this;
    };
    FXStreet.Class.Seo.RatesAndCharts = function () {

        var parent = FXStreet.Class.Seo.Base(),
        _this = FXStreet.Util.extendObject(parent);

        var updateBasicMetaTags = function (information) {
            if (information) {
                var seo = information.SEO;

                $("meta[name='description']").attr('content', seo.MetaDescription);
                $("meta[name='keywords']").attr('content', seo.KeyWords);
                document.title = seo.MetaTitle;
            }
        }

        var updateOpenGraph = function (information) {
            if (information) {
                var seo = information.SEO;
                var image = information.Image || {};

                $("meta[property='og\\:title']").attr('content', seo.MetaTitle);
                $("meta[property='og\\:description']").attr('content', seo.MetaDescription);
                if (_this.isValid(image)){
                    $("meta[property='og\\:image']").attr('content', image.Url_Small);
                }
                $("meta[property='og\\:url']").attr('content', seo.FullUrl);
            }
        };
        var updateTwitter = function (information) {
            if (information) {
                var seo = information.SEO;
                var image = information.Image || {};

                //Twitter
                $("meta[name='twitter\\:title']").attr('content', seo.MetaTitle);
                $("meta[name='twitter\\:description']").attr('content', seo.MetaDescription);
                if (_this.isValid(image)) {
                    $("meta[name='twitter\\:image']").attr('content', image.Url_Small);
                }
                $("meta[name='twitter\\:url']").attr('content', seo.FullUrl);
            }
        };

        var updateUrl = function (information) {
            if (information) {
                var seo = information.SEO;

                var url = seo.FullUrl.replace(/ /g, '-').toLowerCase();

                _this.setUrlToHistory(seo.MetaTitle, url, information.Id);
            }
        };

        _this.updateMetaTags = function (item, pageUrl) {
            updateBasicMetaTags(item);
            updateOpenGraph(item);
            updateTwitter(item);
            updateUrl(item);

            parent.updateMetaTags(item, null);


        }
        return _this;
    };
    FXStreet.Class.Seo.Brokers = function () {

        var parent = FXStreet.Class.Seo.Base(),
        _this = FXStreet.Util.extendObject(parent);

        var updateBasicMetaTags = function (information) {
            if (information) {
                var seo = information.SEO;

                $("meta[name='description']").attr('content', seo.MetaDescription);
                $("meta[name='keywords']").attr('content', seo.KeyWords);
                document.title = seo.MetaTitle;
            }
        }

        var updateOpenGraph = function (information) {
            if (information) {
                var seo = information.SEO;
                var image = information.Image || {};

                $("meta[property='og\\:title']").attr('content', seo.MetaTitle);
                $("meta[property='og\\:description']").attr('content', seo.MetaDescription);
                if (_this.isValid(image)){
                    $("meta[property='og\\:image']").attr('content', image.Url_Small);
                }
                $("meta[property='og\\:url']").attr('content', seo.FullUrl);
            }
        };
        var updateTwitter = function (information) {
            if (information) {
                var seo = information.SEO;
                var image = information.Image || {};

                //Twitter
                $("meta[name='twitter\\:title']").attr('content', seo.MetaTitle);
                $("meta[name='twitter\\:description']").attr('content', seo.MetaDescription);
                if (_this.isValid(image)){
                    $("meta[name='twitter\\:image']").attr('content', image.Url_Small);
                }
                $("meta[name='twitter\\:url']").attr('content', seo.FullUrl);
            }
        };

        var updateUrl = function (information, pageUrl) {
            if (information) {
                var url = pageUrl + '/' + information.Url.toLowerCase();
                _this.setUrlToHistory("", url, information.Id);
            }
        };

        _this.updateMetaTags = function (item, pageUrl) {
            updateBasicMetaTags(item);
            updateOpenGraph(item);
            updateTwitter(item);
            updateUrl(item, pageUrl);

            parent.updateMetaTags(item, null);
        }
        return _this;
    };
}());
(function () {
    FXStreet.Class.Patterns.Singleton.FxsSessionStorageManager = (function () {
        var instance;

        var fxsSessionStorageManager = function () {
            var parent = FXStreet.Class.Base(),
                _this = FXStreet.Util.extendObject(parent);

            _this.Save = function (key, value) {
                sessionStorage.setItem(key, value);
            };

            _this.Delete = function (key) {
                sessionStorage.removeItem(key);
            };

            _this.Get = function (key) {
                return sessionStorage.getItem(key);
            };

            _this.Exist = function (key) {
                var val = _this.GetValue(key);
                return val != null;
            };

            return _this;
        };

        function createInstance() {
            var object = fxsSessionStorageManager();
            object.init({});
            return object;
        }

        return {
            Instance: function () {
                if (!instance) {
                    instance = createInstance();
                }
                return instance;
            }
        };
    })();
}());
(function () {
    FXStreet.Class.Sidebar.FilterBroker = function () {
        var parent = FXStreet.Class.Base(),
          _this = FXStreet.Util.extendObject(parent);

        //#region Json properties

        _this.Brokers = [];
        _this.FilterChangeDelegate = null;
        _this.ApplyFiltersBtnId = "";
        _this.CancelBtnId = "";
        _this.BusinessNatureSelectId = "";
        _this.RegulationsCheckBoxGroupId = "";
        _this.MinDepositInputId = "";
        _this.MaxLeverageInputId = "";
        _this.FilterBtnId = "";
        _this.FilterHeaderContainerId = "";

        //#endregion

        //#region Html elements

        _this.ApplyFiltersBtn = null;
        _this.CancelBtn = null;
        _this.BusinessNatureSelect = null;
        _this.RegulationsCheckBoxGroup = null;
        _this.MinDepositInput = null;
        _this.MaxLeverageInput = null;
        _this.FilterBtnId = null;
        _this.FilterHeaderContainer = null;

        //#endregion

        //#region Filter options

        _this.FilteredBrokers = [];
        _this.BusinessNatures = [];
        _this.Regulations = [];

        _this.BusinessNatureSelected = [];
        _this.RegulationsSelected = [];
        _this.MinDepositSelected = 0;
        _this.MaxLeverageSelected = 0;

        //#endregion

        //#region Initialization

        _this.init = function (json) {
            _this.setSettingsByObject(json);
            _this.setVars();
            _this.addEvents();
        };

        _this.setVars = function () {
            _this.Brokers = _this.Brokers.slice();
            _this.ApplyFiltersBtn = FXStreet.Util.getjQueryObjectById(_this.ApplyFiltersBtnId);
            _this.CancelBtn = FXStreet.Util.getjQueryObjectById(_this.CancelBtnId);
            _this.BusinessNatureSelect = FXStreet.Util.getjQueryObjectById(_this.BusinessNatureSelectId);
            _this.RegulationsCheckBoxGroup = FXStreet.Util.getjQueryObjectById(_this.RegulationsCheckBoxGroupId);
            _this.MinDepositInput = FXStreet.Util.getjQueryObjectById(_this.MinDepositInputId);
            _this.MaxLeverageInput = FXStreet.Util.getjQueryObjectById(_this.MaxLeverageInputId);
            _this.FilterBtn = FXStreet.Util.getjQueryObjectById(_this.FilterBtnId);
            _this.FilterHeaderContainer = FXStreet.Util.getjQueryObjectById(_this.FilterHeaderContainerId);

            _this.fillDefaultData();
            _this.populateFields();
        };

        _this.addEvents = function () {
            _this.ApplyFiltersBtn.click(_this.ApplyFiltersBtnClick);
            _this.CancelBtn.click(_this.cancelBtnClick);
            _this.BusinessNatureSelect.change(_this.businessNatureSelectChange);
            _this.MinDepositInput.blur(_this.minDepositInputOnBlur);
            _this.MaxLeverageInput.blur(_this.maxLeverageInputOnBlur);
            _this.RegulationsCheckBoxGroup.find("input[type=checkbox]").click(_this.regulationsCheckClick);
            _this.FilterBtn.click(_this.filterBtnClick);
        };

        //#endregion

        //#region Events

        _this.ApplyFiltersBtnClick = function () {
            _this.FilteredBrokers = _this.Brokers.slice();
            _this.FilteredBrokers = _this.filterByBusinessNature(_this.FilteredBrokers);
            _this.FilteredBrokers = _this.filterByRegulations(_this.FilteredBrokers);
            _this.FilteredBrokers = _this.filterByMinDeposit(_this.FilteredBrokers);
            _this.FilteredBrokers = _this.filterByMaxLeverage(_this.FilteredBrokers);
            _this.FilterChangeDelegate(_this.FilteredBrokers.slice());
        };

        _this.cancelBtnClick = function () {
            _this.FilterHeaderContainer.toggleClass("active");
        };

        _this.filterBtnClick = function () {
            _this.FilterHeaderContainer.toggleClass("active");
        };

        _this.businessNatureSelectChange = function () {
            var option = _this.BusinessNatureSelect.find("option:selected");
            if (!option || option.val() === "" || option.index() === 0) {
                _this.BusinessNatureSelected = [];
                return;
            }

            _this.BusinessNatureSelected.push(option.val());
        };

        _this.regulationsCheckClick = function () {
            var value = $(this).val();

            if (this.checked === true) {
                _this.RegulationsSelected.push(value);
            } else {
                _this.RegulationsSelected = $.grep(_this.RegulationsSelected, function (regulation) {
                    return regulation !== value;
                });
            }
        }; 

        _this.minDepositInputOnBlur = function () {
            var value = _this.MinDepositInput.val();
            if ($.isNumeric(value)) {
                _this.MinDepositSelected = parseFloat(value);
            } else {
                _this.MinDepositSelected = 0;
            }
        };

        _this.maxLeverageInputOnBlur = function () {
            var value = _this.MaxLeverageInput.val();
            if ($.isNumeric(value)) {
                _this.MaxLeverageSelected = parseInt(value);
            } else {
                _this.MaxLeverageSelected = 0;
            }
        };

        //#endregion

        _this.fillDefaultData = function () {
            $.each(_this.Brokers, function (index, broker) {
                if (broker.BusinessNature !== null && broker.BusinessNature && broker.BusinessNature.length > 0) {
                    _this.BusinessNatures = $.merge(_this.BusinessNatures, broker.BusinessNature);
                }
                if (broker.Regulated !== null && broker.Regulated && broker.Regulated.length > 0) {
                    _this.Regulations = $.merge(_this.Regulations, broker.Regulated);
                }
            });

            _this.BusinessNatures = $.unique(_this.BusinessNatures);
            _this.Regulations = $.unique(_this.Regulations);
        };

        _this.populateFields = function () {
            $.each(_this.BusinessNatures, function (index, value) {
                _this.BusinessNatureSelect.append($('<option></option>').val(value).html(value));
            });

            var regulationHtml = "";
            $.each(_this.Regulations, function (index, value) {
                regulationHtml += '<label class="fxs_checkboxGroup"><input type="checkbox" value="' + value + '"/>' + value + '</label>';
            });
            _this.RegulationsCheckBoxGroup.html(regulationHtml);
        };

        _this.filterByBusinessNature = function (filteredBrokers) {
            if (_this.BusinessNatureSelected === null || _this.BusinessNatureSelected.length === 0) {
                return filteredBrokers;
            }

            filteredBrokers = $.grep(filteredBrokers, function (broker, i) {
                if (!broker.BusinessNature) {
                    return false;
                }

                var hasBusinessNature = $(broker.BusinessNature).filter(_this.BusinessNatureSelected).length > 0;
                return hasBusinessNature;
            });

            return filteredBrokers;
        };

        _this.filterByRegulations = function (filteredBrokers) {
            if (_this.RegulationsSelected === null || _this.RegulationsSelected.length === 0) {
                return filteredBrokers;
            }

            filteredBrokers = $.grep(filteredBrokers, function (broker, i) {
                if (!broker.Regulated) {
                    return false;
                }

                var hasRegulations = $(broker.Regulated).filter(_this.RegulationsSelected).length > 0;
                return hasRegulations;
            });

            return filteredBrokers;
        };

        _this.filterByMinDeposit = function (filteredBrokers) {
            if (_this.MinDepositSelected === 0) {
                return filteredBrokers;
            }

            filteredBrokers = $.grep(filteredBrokers, function (broker, i) {
                if (!broker.AccountTypes) {
                    return false;
                }

                var hasMinDeposit = $.grep(broker.AccountTypes, function (accounType, j) {
                    var minPriceStr = /\d+(?:\.\d+)?/.exec(accounType.MinPrice);
                    if (minPriceStr.length > 0) {
                        minPriceStr = minPriceStr[0].replace(',', '.');
                    } else {
                        minPriceStr = "0";
                    }
                    var minPrice = parseFloat(minPriceStr);
                    return minPrice >= _this.MinDepositSelected;
                });

                return hasMinDeposit.length > 0;
            });

            return filteredBrokers;
        };

        _this.filterByMaxLeverage = function (filteredBrokers) {
            if (_this.MaxLeverageSelected === 0) {
                return filteredBrokers;
            }

            filteredBrokers = $.grep(filteredBrokers, function (broker, i) {
                var hasMaxLeverage = broker.Leverage >= _this.MaxLeverageSelected;
                return hasMaxLeverage;
            });

            return filteredBrokers;
        };

        return _this;
    };
}());

(function () {
    FXStreet.Class.Sidebar.Filter = function () {
        var parent = FXStreet.Class.Base(),
          _this = FXStreet.Util.extendObject(parent);

        _this.FindBy_Options = [];
        _this.NewItemCreatedDelegate = null;
        _this.SidebarNewItemsAlertId = "";
        _this.SidebarSeeLatestNewsId = "";
        _this.ShowLeftPushId = "";
        _this.ShowRightPushId = "";
        _this.ShowLeftId = "";
        _this.MenuLeftId = "";
        _this.MenuRightId = "";
        _this.ListViewId = "";
        _this.OptionSelectedDelegate = null;
        _this.TypeaheadJsonInitialization = {};
        _this.IsReferral = false;
        _this.ShowSeeLatest = false;

        _this.HtmlTemplateName = "typeahead_suggestion.html";

        _this.SidebarNewItemsAlert = null;
        _this.SidebarSeeLatestNews = null;
        _this.PageTitle = "";

        _this.PostsCreated = [];

        _this.Resources = FXStreet.Resource.Translations['Sidebar_FilterAndList'];

        _this.init = function (json) {
            _this.setSettingsByObject(json);
            _this.setVars();
            _this.addEvents();
            _this.initTypeahead();
        };

        _this.setVars = function () {
            _this.PageTitle = document.title;

            _this.Suggestions = $('<div/>');
            _this.Suggestions.insertAfter(FXStreet.Util.getjQueryObjectById(_this.TypeaheadJsonInitialization.TypeaheadId));

            _this.SidebarNewItemsAlert = FXStreet.Util.getjQueryObjectById(_this.SidebarNewItemsAlertId);
            _this.SidebarSeeLatestNews = FXStreet.Util.getjQueryObjectById(_this.SidebarSeeLatestNewsId);
            _this.SidebarSeeLatestNews.attr("href", FXStreet.Resource.PageUrl);

            if (_this.IsReferral === true && _this.ShowSeeLatest) {
                _this.SidebarSeeLatestNews.html(_this.Resources.SidebarSeeLatestText);
            }
        };

        _this.addEvents = function () {
            _this.SidebarNewItemsAlert.on("click", _this.sidebarNewItemsAlertClick);
        };

        _this.initTypeahead = function () {
            _this.TypeaheadJsonInitialization.FindBy_Options = _this.FindBy_Options;
            _this.TypeaheadJsonInitialization.CloseDelegated = _this.CloseDelegated;
            _this.TypeaheadJsonInitialization.PlaceholderText = FXStreet.Resource.Translations['Sidebar_FilterAndList'].Filter_Search;

            _this.Typeahead = new FXStreet.Class.Sidebar.Typeahead();
            _this.Typeahead.init(_this.TypeaheadJsonInitialization);
            _this.startObserveTypeahead();
        };

        _this.startObserveTypeahead = function () {
            _this.Typeahead.addObserver(_this.ChangeTypeaheadDelegated);
        };

        _this.stopObserveTypeahead = function () {
            _this.Typeahead.removeObserver(_this.ChangeTypeaheadDelegated);
        };

        _this.resetBody = function () {
            var obj = FXStreet.Class.Sidebar.Util.RenderizableListItems[0];
            if (obj) {
                obj.RenderedItemInPage.resetBody();
            }
        };

        _this.ChangeTypeaheadDelegated = function (option) {
            if (option) {
                _this.OptionSelectedDelegate(option.queryString, option.id);
                _this.DefaultLoaded = false;
            }
        };

        _this.CloseDelegated = function () {
            _this.resetBody();
            _this.loadDefault();
        };

        _this.loadDefault = function () {
            if (!_this.DefaultLoaded && _this.FindBy_Options[0]) {
                _this.OptionSelectedDelegate(_this.FindBy_Options[0].QueryStringKey, _this.SelectedTypeaheadId || null);
                _this.DefaultLoaded = _this.SelectedTypeaheadId === null;
                _this.SelectedTypeaheadId = null;
            }
        };

        _this.getMatches = function (value) {
            value = value.toLowerCase();
            var values = _this.getValuesContainings(value);
            if (values.length > 0) {
                return values;
            }

            values = _this.levenshteinMatches(value);
            return values;
        };

        _this.getValuesContainings = function (valueToMatch) {
            var matcher = new RegExp($.ui.autocomplete.escapeRegex(valueToMatch), "i");
            var values = $.grep(_this.ValuesOptions, function (val) {
                return matcher.test(val.Value.Name);
            });
            values = values.sort(function (a, b) {
                var aValue = a.Value.Name, bValue = b.Value.Name;
                return aValue.indexOf(valueToMatch) - bValue.indexOf(valueToMatch);
            });
            return values;
        };

        _this.removeIfInvalid = function () {
            if (_this.Typeahead.val() === '') {
                return;
            }

            var optionSelected = _this.getTypeaheadSelected();
            if (optionSelected) {
                _this.Typeahead.val(optionSelected.Value.Name);
                return;
            }

            var value = _this.Typeahead.val();
            _this.Typeahead.val(_this.CurrentSelectedItem.Name);
            console.log("'" + value + "' didn't match any item");
        };

        _this.getTypeaheadSelected = function () {
            var value = _this.Typeahead.val(),
                valueLowerCase = value.toLowerCase();

            var result = _this.ValuesOptions.findFirst(function (item) {
                return item.Value.Name.toLowerCase() === valueLowerCase;
            });
            return result;
        };

        _this.sidebarNewItemsAlertClick = function () {
            _this.NewItemCreatedDelegate(_this.PostsCreated);

            _this.PostsCreated = [];
            _this.SidebarNewItemsAlert.empty();
            document.title = _this.PageTitle;

            // Devolvemos false para evitar la acción del elemento a
            return false;
        };

        _this.newPostCreated = function (post) {
            if (_this.IsReferral === true) {
                return;
            }

            if (_this.Typeahead.CurrentSelectedItem === null || _this.Typeahead.CurrentSelectedItem.id.length === 0) {
                _this.renderNewItemCreated(post);
            } else {
                for (var i = 0; i < post.categoriesIds.length; i++) {
                    if (post.categoriesIds[i] === _this.Typeahead.CurrentSelectedItem.id) {
                        _this.renderNewItemCreated(post);
                        break;
                    }
                }
            }
        };

        _this.renderNewItemCreated = function (item) {
            _this.PostsCreated.unshift(item);
            _this.SidebarNewItemsAlert.html(_this.Resources.ItemUpdateTextFormat.format(_this.PostsCreated.length));
            document.title = "({0}) {1}".format(_this.PostsCreated.length, _this.PageTitle);
        };

        return _this;
    };
}());

(function () {
    FXStreet.Class.Sidebar.List = {};
    FXStreet.Class.Sidebar.List.Base = function () {
        var parent = FXStreet.Class.Base(),
          _this = FXStreet.Util.extendObject(parent);

        _this.ListItemsContainerId = "";
        _this.ScrollingContainerId = "";
        _this.FilterBy_FxsApiRoute = "";
        _this.SidebarFeedbackLoadingMsgId = "";
        _this.SidebarFeedbackNoMoreContentMsgId = "";
        _this.HighlightCssClass = "listView_item_active";
        _this.SidebarFeedbackLoadingMsg = null;
        _this.SidebarFeedbackNoMoreContentMsg = null;
        _this.ListItemsContainer = null;
        _this.ScrollingContainer = null;
        _this.ListValues = [];
        _this.DefaultTake = 20;
        _this.CurrentPage = 1; //defaultPage start
        _this.CurrentQueryStringValues = [];
        _this.InfiniteScroll = null;
        _this.RenderizableListItemsCurrentIndex = -1;
        _this.ListDataServerResponse = [];
        _this.IsReferral = false;
        _this.TemplateList = null;
        _this.OnClickDelegate = null;
        _this.SidebarNoContentFoundId = "";
        _this.SidebarNoContentFound = null;
        _this.LoadInitialDataServer = true;

        _this.InitialReferralItem = null;

        _this.ItemsToPreload = 2;

        _this.ContentType = "";

        _this.TakeElements = {};
        _this.ContentTypeId = 0;

        _this.init = function (json) {
            _this.setSettingsByObject(json);
            _this.setVars();
            _this.addEvents();
            _this.setTexts();
            if (_this.LoadInitialDataServer) {
                _this.loadInitialDataServerResponse();
            }
        };

        _this.setVars = function () {
            _this.ListItemsContainer = FXStreet.Util.getjQueryObjectById(_this.ListItemsContainerId);
            _this.ScrollingContainer = FXStreet.Util.getjQueryObjectById(_this.ScrollingContainerId);
            _this.SidebarFeedbackLoadingMsg = FXStreet.Util.getjQueryObjectById(_this.SidebarFeedbackLoadingMsgId);
            _this.SidebarFeedbackNoMoreContentMsg = FXStreet.Util.getjQueryObjectById(_this.SidebarFeedbackNoMoreContentMsgId);
            if (_this.SidebarNoContentFoundId != "") {
                _this.SidebarNoContentFound = FXStreet.Util.getjQueryObjectById(_this.SidebarNoContentFoundId);
            }          
            if (_this.InfiniteScroll === null || _this.InfiniteScroll === undefined) {
                _this.InfiniteScroll = _this.createInfiniteScroll();
            }
            if (_this.TemplateList === null) {
                _this.TemplateList = FXStreet.Util.getObjectInstance("TemplateList");
            }
            _this.LoadDefaultTake();
        };

        _this.LoadDefaultTake = function (take) {
            if (take) {
                _this.DefaultTake = take;
            }
            else {
                if (_this.TakeElements && _this.TakeElements.Mobile && _this.TakeElements.Desktop) {
                    _this.DefaultTake = FXStreet.Util.isMobileDevice() ? _this.TakeElements.Mobile : _this.TakeElements.Desktop;
                }
                else {
                    _this.DefaultTake = 20;
                }
            }
        };

        _this.setTexts = function () {
            _this.SidebarFeedbackNoMoreContentMsg.find('span').html(FXStreet.Resource.Translations['Sidebar_FilterAndList'].NoMoreContentToLoad);
        };

        _this.Render = function (queryStringKeyValues) {
            _this.CurrentQueryStringValues = queryStringKeyValues;
            _this.CurrentPage = 1;
            _this.ListItemsContainer.empty();
            if (_this.SidebarNoContentFound != null) {
                _this.SidebarNoContentFound.html("");
            }            
            var url;
            var qs = $.grep(queryStringKeyValues, function (item) {
                return item.Key.toLowerCase() !== 'page' && item.Key.toLowerCase() !== 'take';
            });

            if (qs.length > 0) {
                url = _this.createUrl(_this.FilterBy_FxsApiRoute, _this.CurrentQueryStringValues, _this.CurrentPage,_this.ContentTypeId);
            } else {
                url = _this.createUrlDefaultUrl();
            }
            return _this.renderPrivate(url).then(_this.ListRendered);
        };

        _this.loadInitialDataServerResponse = function () {
            _this.ListValues = [];
            _this.ListDataServerResponse = _this.ListDataServerResponse || [];

            _this.handleNoMoreContent(_this.ListDataServerResponse);

            if (_this.IsReferral && _this.ListDataServerResponse[0]) {
                _this.InitialReferralItem = _this.ListDataServerResponse[0];
            }
            FXStreet.Class.Sidebar.Util.renderList(
                _this.ListDataServerResponse,
                _this.ListValues,
                _this.renderCallback,
                _this.clickOnItem,
                updateToListDataServerResponse,
                false,
                true,
                _this.InitialReferralItem ? _this.InitialReferralItem.Id : null);

            $.each(_this.ListValues, function (i, obj) {
                var listItem = _this.ListItemsContainer.find($(document.getElementById(obj.Id)));
                if (listItem) {
                    obj.Container = listItem;
                    if (obj.RenderedItemInPage) {
                        var renderizableListItem = FXStreet.Class.Sidebar.Util.RenderizableListItems[obj.RenderedItemInPage.PositionInRenderizableListItems];
                        listItem.on('click', function () {
                            listItemOnClick(renderizableListItem);
                        });
                    }
                } else {
                    console.warn('The li with id ' + obj.Id + ' was not found');
                }
            });
        };

        var listItemOnClick = function (renderizableListItem) {
            _this.TemplateList.ListLeft_ShowButton_Click();
            renderizableListItem.click();
        };

        _this.ListRendered = function () {
            FXStreet.Util.fillPageSpace();
        };

        _this.LoadNewItemsCreated = function (postsCreated) {
            //TODO Reload firstItem if necessary, to ensure the preload of the NewItemCreated in the right side
            var newItemsCreatedCount = postsCreated.length;
            $.each(FXStreet.Class.Sidebar.Util.RenderizableListItems, function (i, item) {
                item.RenderedItemInPage.IncreasePosition(newItemsCreatedCount);
            });

            _this.RenderizableListItemsCurrentIndex += newItemsCreatedCount;

            _this.renderPrivateSuccess(postsCreated, true);
        };

        _this.renderPrivate = function (url, prepend) {
            _this.SidebarFeedbackLoadingMsg.show();

            return $.getJSON(url, function (response) {
                response = response || { Result: [] }; // If there are not more elements, the result data is null. Then, we create a empty array for show the no more content labels
                _this.renderPrivateSuccess(response.Result, prepend);
            });
        };

        _this.renderPrivateSuccess = function (data, prepend) {
            prepend = prepend || false;
            _this.SidebarFeedbackLoadingMsg.hide();

            _this.ListItemsContainer.find("li:empty").remove();

            if (data.length == 0) { 
                _this.Render([]).done(function () {
                    if (_this.SidebarNoContentFound != null) {
                        _this.SidebarNoContentFound.html(FXStreet.Resource.Translations['Sidebar_FilterAndList'].NoContentFound);
                    }                   
                });
            }

            if (prepend) {
                _this.renderLiForNewItems(data);
                _this.prependToListDataServerResponse(data);
            } else {
                _this.handleNoMoreContent(data);
                _this.renderLi(data);
                _this.addToListDataServerResponse(data);
            }

            FXStreet.Class.Sidebar.Util.renderList(
                data,
                _this.ListValues,
                _this.renderCallback,
                _this.clickOnItem,
                updateToListDataServerResponse,
                prepend);
        };

        _this.renderLi = function (data) {
            $.each(data, function (i, item) {
                var li = $("<li>").attr("id", item.Id);
                _this.ListItemsContainer.append(li);
            });
        };

        _this.renderLiForNewItems = function (data) {
            data.reverse();

            $.each(data, function (i, item) {
                var li = $("<li>").attr("id", item.Id);
                _this.ListItemsContainer.prepend(li);
            });

            data.reverse();
        };

        var updateToListDataServerResponse = function (data) {
            for (var i = 0; i < _this.ListDataServerResponse.length; i++) {
                if(_this.ListDataServerResponse[i].Id === data.Id){
                    _this.ListDataServerResponse[i] = data;
                    break;
                }
            }
        };

        _this.addToListDataServerResponse = function (data) {
            $.each(data, function (i, item) {
                _this.ListDataServerResponse.push(item);
            });
        };

        _this.prependToListDataServerResponse = function (data) {
            data.reverse();

            $.each(data, function (i, item) {
                _this.ListDataServerResponse.unshift(item);
            });

            data.reverse();
        }

        _this.createUrlDefaultUrl = function () {
            return _this.createUrl(_this.FilterBy_FxsApiRoute, _this.CurrentQueryStringValues, _this.CurrentPage,_this.ContentTypeId);
        };

        _this.createUrl = function (apiRouteKey, queryString, page, contentType) {
            var defaultQuery = [
                {
                    Key: 'take',
                    Value: _this.DefaultTake
                },
                {
                    Key: 'page',
                    Value: page
                },
                {
                    Key: 'contenttype',
                    Value: contentType
                }

            ];
            if (_this.InitialReferralItem) {
                defaultQuery.push(
                {
                    Key: 'dateto',
                    Value: _this.InitialReferralItem.PublicationDate
                });
            }

            var queryStringValuesKeys = $.merge(defaultQuery, queryString);

            return FXStreet.Util.createUrl(FXStreet.Resource.FxsApiRoutes[apiRouteKey], queryStringValuesKeys);
        };

        _this.handleNoMoreContent = function (data) {
            var count = 0;
            $.each(data, function (i, item) {
                if (item.Items !== undefined) {
                    count += item.Items.length;
                } else {
                    count++;
                }
            });

            if (count < _this.DefaultTake) {
                _this.InfiniteScroll.NotMoreContent = true;
                _this.SidebarFeedbackNoMoreContentMsg.show();
                _this.SidebarFeedbackLoadingMsg.hide();

                var noMoreContentObject = {
                    JsType: 'NoMoreContent',
                    Id: FXStreet.Util.guid()
                };
                data.push(noMoreContentObject);
            }
        };

        _this.renderCallback = function (obj, html) {
            var item = _this.ListItemsContainer.find($(document.getElementById(obj.Id)));
            if (item !== undefined && item !== null) {
                item.replaceWith(html);
                item.off('click');
                if (obj.RenderedItemInPage) {
                    var object = FXStreet.Class.Sidebar.Util.RenderizableListItems[obj.RenderedItemInPage.PositionInRenderizableListItems];
                    $(html).on('click', function () {
                        listItemOnClick(object);
                    });
                }
                if (_this.IsReferral && obj.RenderedItemInPage && obj.RenderedItemInPage.PositionInRenderizableListItems === 0) {
                    _this.highlightItem(obj.RenderedItemInPage.PositionInRenderizableListItems);
                }
            }
        };

        _this.createInfiniteScroll = function () {
            var result = new FXStreet.Class.InfiniteScroll();
            result.init({
                ScrollingElement: _this.ListItemsContainer,
                ScrollingContent: _this.ScrollingContainer,
                LoadFollowingDelegatePromise: _this.RenderFollowingContent,
                LoadingMoreId: 'sidebarFeedbackLoadingMsg' // TODO: hardcoded
            });
            result.ScrollingContent.on('mousewheel DOMMouseScroll', function (e) {
                var delta = e.wheelDelta || (e.originalEvent && e.originalEvent.wheelDelta) || -e.detail,
                    bottomOverflow = this.scrollTop + $(this).outerHeight() - this.scrollHeight >= 0,
                    topOverflow = this.scrollTop <= 0;

                if ((delta < 0 && bottomOverflow) || (delta > 0 && topOverflow)) {
                    e.preventDefault();
                }
            });
            return result;
        };

        _this.RenderFollowingContent = function () {
            _this.CurrentPage++;
            return _this.renderPrivate(_this.createUrlDefaultUrl());
        };

        _this.setCurrent = function (position) {
            var item = _this.getItemByPosition(position);

            _this.removeHighlightItem();
            _this.RenderizableListItemsCurrentIndex = position;
            if (item) {
                _this.highlightItem(position);
                _this.moveItemListToTop(item);
            }
            return _this.loadItems(position, true);
        };

        _this.setHome = function () {
            _this.removeHighlightItem();
            _this.RenderizableListItemsCurrentIndex = -1;
            _this.loadItems(0, true);
            _this.moveItemListToTop(FXStreet.Class.Sidebar.Util.RenderizableListItems[0]);
        };

        _this.moveNext = function () {
            var nextPosition = _this.RenderizableListItemsCurrentIndex + 1;
            _this.setCurrent(nextPosition);
        };

        _this.movePrevious = function () {
            var nextPosition = _this.RenderizableListItemsCurrentIndex - 1;
            _this.setCurrent(nextPosition);
        };

        _this.loadNext = function () {
            _this.loadPrivate(_this.RenderizableListItemsCurrentIndex + 1);
        };

        _this.loadPrevious = function () {
            _this.loadPrivate(_this.RenderizableListItemsCurrentIndex - 1);
        };

        _this.loadPrivate = function (position) {
            var listItems = FXStreet.Class.Sidebar.Util.RenderizableListItems;
            if (position < listItems.length && position >= 0) {
                _this.loadItems(position);
            }
        };

        _this.loadItems = function (position) {
            var listItems = FXStreet.Class.Sidebar.Util.RenderizableListItems;
            var itemsToPreload = _this.ItemsToPreload;
            var promise = null;
            for (var i = position - itemsToPreload;
                    i <= position + itemsToPreload && i < listItems.length; i++) {
                if (i < 0) {
                    continue;
                }
                var obj = listItems[i];
                if (obj.IsRenderizableInPage()) {
                    var haveToBeRendered = position === i || obj.RenderedItemInPage.Visible;
                    if (haveToBeRendered) {
                        var done = obj.RenderedItemInPage.Render();
                        if (i === position) {
                            promise = done || $.when();
                        }
                    } else {
                        obj.RenderedItemInPage.Load();
                    }
                }
            }
            return promise;
        };

        _this.loadItem = function () {

        };

        _this.clickOnItem = function (obj) {
            _this.highlightItem(obj.RenderedItemInPage.PositionInRenderizableListItems);

            obj.RenderedItemInPage.setRenderByUser(true);
            obj.RenderedItemInPage.resetBody();
            obj.onClick();
            _this.setCurrent(obj.RenderedItemInPage.PositionInRenderizableListItems).done(function () {
                FXStreet.Util.fillPageSpace();
                if (typeof _this.OnClickDelegate === "function") {
                    _this.OnClickDelegate(obj.RenderedItemInPage.ContainerItem[0]);
                }
            });
        };

        _this.moveItemListToTop = function (item) {
            var element = item.Container;
            if (!element || element.length === 0) {
                return;
            }

            var topOffset = element.offset().top;
            var containerOffSet = _this.ListItemsContainer.offset().top;
            var margin = 30;
            _this.InfiniteScroll.animateToPosition(topOffset - containerOffSet - margin);
        };

        _this.highlightItem = function (position) {
            var item = _this.getItemByPosition(position);

            _this.removeHighlightItem();

            if (item.Container !== undefined && item.Container !== null) {
                item.Container.addClass(_this.HighlightCssClass);
            }
        };

        _this.getItemByPosition = function (position) {
            var listItems = FXStreet.Class.Sidebar.Util.RenderizableListItems;
            if (position > listItems.length) {
                console.error("Invalid position");
            }

            return listItems[position];
        };

        _this.removeHighlightItem = function () {
            _this.ListItemsContainer.children('li').removeClass(_this.HighlightCssClass);
        };

        _this.clearListValues = function () {
            $.each(_this.ListValues, function (index, item) {
                item.Unsubscribe();
            });
            _this.ListValues = [];
            FXStreet.Class.Sidebar.Util.RenderizableListItems = [];
        };

        _this.AfterTypeheadChangedDelegate = function () { };

        _this.getRenderizableItemById = function (id) {
            var result = _this.ListDataServerResponse.findFirst(function (item) {
                return item.Id === id;
            });
            return result;
        };

        return _this;
    };

    FXStreet.Class.Sidebar.List.RatesAndCharts = function () {
        var parent = FXStreet.Class.Sidebar.List.Base(),
         _this = FXStreet.Util.extendObject(parent);

        parent.ItemsToPreload = 0;

        _this.init = function (json) {
            parent.init(json);
            _this.setSettingsByObject(json);
            _this.setVars();
            _this.addEvents();
        };

        _this.setVars = function () {
            _this.LoadContentDelegatePromise_ObserverSubject = new FXStreet.Class.Patterns.Observer.Subject();
            parent.InfiniteScroll.endedList();
        };

        _this.addEvents = function () {
            _this.InfiniteScroll.whenScroll(_this.scrollListAction);
            window.onload = _this.SubscriberVisible;
        };

        var currentThreadId = null;
        _this.SubscriberVisible = function () {
            currentThreadId = FXStreet.Util.guid();
            _this.InternalSubscriberVisible(currentThreadId);
        };

        _this.InternalSubscriberVisible = function (threadId) {
            setTimeout(function () {
                $.each(_this.ListValues, function (i, obj) {
                    if (threadId !== currentThreadId) {
                        return false;
                    }
                    var listItem = _this.ListItemsContainer.find($(document.getElementById(obj.Id)));
                    if (listItem) {
                        if (FXStreet.Util.VisibleHeight(listItem) > 0) {
                            if (obj.Subscribe != undefined)
                                obj.Subscribe();
                        } else {
                            if (obj.Unsubscribe != undefined)
                                obj.Unsubscribe();
                        }
                    }
                });
            }, 0);
        };

        _this.scrollListAction = function () {
            _this.SubscriberVisible();
        };

        parent.AfterTypeheadChangedDelegate = _this.SubscriberVisible;

        var parentListRendered = _this.ListRendered;
        parent.ListRendered = function () {
            parentListRendered();
            _this.SubscriberVisible();
        }
        return _this;
    };
}());
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

(function () {
    FXStreet.Class.Sidebar.RenderedItemInPage.Base = function () {
        var parent = FXStreet.Class.Base(),
            _this = FXStreet.Util.extendObject(parent);

        _this.ContainerBodyId = 'fxs_it_detail';
        _this.LoadingLock = false;
        _this.Loaded = false; // Tenemos el elemento en Memory
        _this.Rendered = false; // El elemento esta en DOM
        _this.Visible = false; // El elemento esta en el DOM & esta visible
        _this.PositionInRenderizableListItems = -1;
        _this.ContainerBody = null;
        _this.ContainerItem = null;
        _this.ContainerClass = '';
        _this.HtmlTemplateData = {};
        _this.SetHtmlTemplateDataCallback = null;

        _this.InternalWidgetsLoaded = false;
        _this.IsRenderByUser = false;

        _this.init = function (json) {
            _this.setSettingsByObject(json);
            _this.HtmlTemplateData = json;
            _this.setVars();
        };

        _this.setVars = function () {
            _this.ContainerBody = FXStreet.Util.getjQueryObjectById(_this.ContainerBodyId);
        };

        _this.CreateContainer = function () {
            //_this.ContainerItem = $("<section>");
            _this.ContainerItem = $("<div>");
            _this.ContainerItem.css('display', 'none');
            _this.ContainerItem.attr('fxs_section', '');
            _this.ContainerItem.addClass('fxs_detail');
            _this.ContainerItem.addClass(_this.ContainerClass);
        };

        var loadPrivate = function () {
            _this.LoadingLock = true;
            var promise = _this.renderPromise();
            return promise.then(function () {
                _this.Loaded = true;
                _this.LoadingLock = false;

                _this.onLoad();

                return $.when();
            });
        };

        _this.Load = function () {
            if (_this.LoadingLock || _this.Loaded) {
                return $.when();
            }

            var promise = loadPrivate();
            return promise;
        };

        _this.Render = function () {
            if (_this.LoadingLock) {
                return $.when();
            }

            var renderPromise = _this.Load().then(_this.renderPrivate);
            return renderPromise;
        };

        _this.appendContainer = function () {
            _this.appendContainerPrivate();
        };
        
        _this.appendContainerPrivate = function () {
            var sections = _this.ContainerBody.find('div[fxs_section]');
            var result = null;
            sections.sort(function (a, b) {
                return $(a).attr('fxs_it_position') - $(b).attr('fxs_it_position');
            });
            sections.each(function (i, item) {
                if ($(item).attr('fxs_it_position') > _this.PositionInRenderizableListItems) {
                    result = item;
                    return false;
                }
            });

            if (result) {
                _this.ContainerItem.insertBefore(result);
            } else {
                _this.ContainerBody.append(_this.ContainerItem);
            }
            _this.LoadInternalWidgets();
        };

        function setSticky() {
            var stickyManager = FXStreet.Class.Patterns.Singleton.StickyManager.Instance();
            var elementsToStick = _this.ContainerItem.find(stickyManager.StickyItemsClass);
            var stickHolder = _this.ContainerItem.find(stickyManager.StickyContentSelector);
            stickyManager.setSticky(elementsToStick, stickHolder);
        }

        _this.onShow = function () {
            setSticky();
        };

        _this.onLoad = function () { };

        _this.renderPrivate = function () {
            if (!_this.IsRenderByUser) {
                return _this.renderByScroll();
            }

            _this.IsRenderByUser = false;
            return _this.renderByUser();
        };

        _this.renderByScroll = function () {
            if (_this.Visible) {
                return $.when();
            }
            if (!_this.Rendered) {
                _this.ContainerItem.hide();
                _this.appendContainer();
                _this.Rendered = true;
            }

            var dfd = new $.Deferred();
            _this.ContainerItem.show({
                duration: 0, done: function () {
                    _this.onShow();
                    _this.Visible = true;
                    dfd.resolve();
                }
            });
            return dfd.promise();
        };

        _this.renderByUser = function () {
            _this.appendContainer();
            _this.ContainerItem.show({
                duration: 0,
                done: function () {
                    _this.onShow();
                }
            });
            _this.Rendered = true;
            _this.Visible = true;
        };

        _this.resetBody = function () {
            FXStreet.Class.Sidebar.Util.RenderizableListItems.forEach(function (item) {
                item.RenderedItemInPage.setRendered(false);
                item.RenderedItemInPage.setVisible(false);
            });
            _this.ContainerBody.empty();
        };

        _this.renderPromise = function () {
            console.error('renderPromise() is not implemented');
        };

        _this.setOnParent = function (property, value) {
            _this[property] = value;
        };

        // Necesitamos estas funciones ya que sinó al asignar des de un hijo, el set settea en el hijo, ignorando el padre
        _this.setPositionInRenderizableListItems = function (position) {
            _this.PositionInRenderizableListItems = position;
            _this.ContainerItem.attr('fxs_it_position', position);
        };

        _this.setVisible = function (value) {
            _this.Visible = value;
            if (value === false) {
                _this.UnLoadInternalWidgets();
            }
        };

        _this.setContainerItem = function (value) {
            _this.ContainerItem = value;
        };

        _this.setAsVisible = function () {
            _this.Loaded = true;
            _this.Rendered = true;
            _this.Visible = true;
        };

        _this.setRendered = function (value) {
            _this.Rendered = value;
        };

        _this.IsVisible = function () {
            return _this.Visible;
        };

        _this.IncreasePosition = function (increase) {
            _this.PositionInRenderizableListItems += increase;
            _this.ContainerItem.attr('fxs_it_position', _this.PositionInRenderizableListItems);
        };

        _this.getJsonForRenderHtml = function () {
            var json = {
                Value: _this.HtmlTemplateData,
                Translations: jQuery.extend(true, {}, FXStreet.Resource.Translations['Sidebar_FilterAndList']),
                UserInfo: {
                    IsLogged: jQuery.extend(true, {}, FXStreet.Resource.UserInfo.IsLogged),
                    IsPremium: jQuery.extend(true, {}, FXStreet.Resource.UserInfo.IsPremium)
                }
            };
            return json;
        };

        _this.setHtmlTemplateData = function (jsonData) {
            _this.HtmlTemplateData = jsonData;
            if (typeof _this.SetHtmlTemplateDataCallback === 'function') {
                _this.SetHtmlTemplateDataCallback(_this.HtmlTemplateData);
            }
        };

        _this.setRenderByUser = function (value) {
            _this.IsRenderByUser = value;
        };

        _this.LoadInternalWidgets = function () {
            if (_this.InternalWidgetsLoaded === false) {
                _this.InternalWidgetsLoaded = true;
                _this.privateLoadInternalWidgets();
            }
        };

        _this.privateLoadInternalWidgets = function () { };

        _this.UnLoadInternalWidgets = function () {
            if (_this.InternalWidgetsLoaded === true) {
                _this.InternalWidgetsLoaded = false;
                _this.privateUnLoadInternalWidgets();
            }
        };

        _this.privateUnLoadInternalWidgets = function () { };

        return _this;
    };
    FXStreet.Class.Sidebar.RenderedItemInPage.BaseScrollable = function () {
        var parent = FXStreet.Class.Sidebar.RenderedItemInPage.Base(),
         _this = FXStreet.Util.extendObject(parent);

        _this.InfiniteScrollPageObj = null;

        _this.init = function (json) {
            parent.init(json);
            _this.setSettingsByObject(json);
            _this.setVars();
        };

        _this.setVars = function () {
            _this.InfiniteScrollPageObj = FXStreet.Util.getObjectInstance("InfiniteScrollPage");
        };

        _this.moveScrollAtTop = function () {
            _this.InfiniteScrollPageObj.moveToPosition(1);
        };

        _this.positionateScrollWhenGoUp = function () {
            var height = _this.ContainerItem.outerHeight();
            var containerOffSet = _this.ContainerBody.offset().top;
            var position = height - containerOffSet;
            if (position < 1) {
                position = 1;
            }
            _this.InfiniteScrollPageObj.moveToPosition(position);
        };

        var parentSetRenderByUser = parent.setRenderByUser;
        parent.setRenderByUser = function (value) {
            parentSetRenderByUser(value);
            _this.InfiniteScrollPageObj.setAvoidScroll(true);
            _this.moveScrollAtTop();
        };

        var parentResetBody = parent.resetBody;
        _this.resetBody = function () {
            parentResetBody();
            _this.moveScrollAtTop();
        };

        var parentOnShow = parent.onShow;
        _this.setOnParent('onShow', function () {
            if (_this.InfiniteScrollPageObj.MoveUpDirection && !_this.InfiniteScrollPageObj.AvoidScroll) {
                _this.positionateScrollWhenGoUp();
            }
            parentOnShow();
        });

        return _this;
    }

    FXStreet.Class.Sidebar.RenderedItemInPage.PostBaseItem = function (scrollable) {
        var parent = scrollable ? FXStreet.Class.Sidebar.RenderedItemInPage.BaseScrollable() : FXStreet.Class.Sidebar.RenderedItemInPage.Base(),
         _this = FXStreet.Util.extendObject(parent);

        _this.Id = ""; //PostId
        _this.HtmlTemplateFile = "";
        _this.RelatedContentUrl = "";
        _this.GetPostByUrlApi = "";
        _this.SocialMediaType = function () {
            console.error('Render promise is not implemented');
        };

        parent.ContainerClass = 'fxs_page_news';

        _this.init = function (json) {
            parent.init(json);
            _this.setSettingsByObject(json);
            _this.CreateContainer();
        };

        var parentCreateContainerParent = parent.CreateContainer;
        parent.CreateContainer = function () {
            var article = $("#fxs_content section[fxs-it-id='" + _this.Id + "']");
            if (article && article.length > 0) {
                _this.setOnParent('ContainerItem', article.parent());
                _this.setAsVisible();
                _this.LoadInternalWidgets();
                _this.onShow();
            }
            else {
                parentCreateContainerParent();
            }
        };

        var getOrLoadJsonForRenderHtmlPromise = function () {
            if (_this.HtmlTemplateData.IsPushNotifed) {
                return $.get(_this.GetPostByUrlApi, { culture: FXStreet.Resource.CultureName, url: _this.HtmlTemplateData.Url })
                    .then(function (postResponse) {
                        _this.setHtmlTemplateData(postResponse);
                        return _this.getJsonForRenderHtml();
                    });
            } else {
                return $.when().then(function () {
                    return _this.getJsonForRenderHtml();
                });
            }
        };

        _this.setOnParent('renderPromise', function () {
            return $.when(FXStreet.Util.loadHtmlTemplate(_this.HtmlTemplateFile), getOrLoadJsonForRenderHtmlPromise())
                .done(function (template, json) {
                    _this.renderHtml(template, json);
                });
        });

        _this.renderHtml = function (template, json) {
            var rendered = FXStreet.Util.renderByHtmlTemplate(template, json);
            _this.ContainerItem.append(rendered);
        };

        var parentOnShow = parent.onShow;
        _this.setOnParent('onShow', function () {
            parentOnShow();
            var jsonAds = _this.getJsonAds();
            if (jsonAds) {
                jsonAds.forEach(function (item) {
                    var selector = "#" + item.ContainerId;
                    if ($(selector).length > 0) {
                        var ads = new FXStreet.Class.AdvertiseNormal();
                        ads.init(item);
                    }
                });
            } else {
                console.warn('The jsonAds are not defined');
            }
        });

        parent.appendContainer = function () {
            _this.appendContainerPrivate();
            _this.LoadInternalWidgets();
        };
        
        var parentPrivateLoadInternalWidgets = parent.privateLoadInternalWidgets;
        _this.setOnParent('privateLoadInternalWidgets', function () {
            parentPrivateLoadInternalWidgets();
            if (_this.RelatedContentUrl !== "") {
                var categoriesIds = [];
                if (_this.HtmlTemplateData.Categories !== undefined
                    && _this.HtmlTemplateData.Categories !== null) {
                    for (var i = 0; i < _this.HtmlTemplateData.Categories.length; i++) {
                        categoriesIds.push(_this.HtmlTemplateData.Categories[i].Id);
                    }
                }
                var jsonRelatedPosts = {
                    "ContainerId": "fxs_article_related_" + _this.Id,
                    "ContentId": _this.Id,
                    "RelatedPosts": _this.HtmlTemplateData.RelatedPosts
                };
                var relatedPosts = new FXStreet.Class.RelatedPostsByCategories();
                relatedPosts.init(jsonRelatedPosts);
            }
            var jsonSocialMediaBar = {
                "ContainerId": "fxs_socialmedia_bar_" + _this.Id,
                "ItemUrl": _this.HtmlTemplateData.SEO !== undefined ? _this.HtmlTemplateData.SEO.FullUrl : _this.HtmlTemplateData.Seo.FullUrl,
                "ItemTitle": _this.HtmlTemplateData.Title
            };

            if (_this.SocialMediaType() !== null) {
                var socialMediaBar = new _this.SocialMediaType();
                socialMediaBar.init(jsonSocialMediaBar);
            }
        });

        _this.getJsonAds = function () {
            var result = [];
            return result;
        };

        _this.initAuthorFollow = function () {
            var authorData = _this.HtmlTemplateData.Author;
            if (authorData == null) {
                return;
            }
            var json = {
                UserInfo: FXStreet.Resource.UserInfo,
                Author: authorData,
                FollowButtonId: "fxs_cta_authorfollow_" + _this.Id,
                FollowingMessageBoxId: "fxs_alert_author_follow",
                UnFollowingMessageBoxId: "fxs_alert_author_unfollow"
            }
            var authorFollow = new FXStreet.Class.AuthorFollow();
            authorFollow.init(json);
        };

        return _this;
    };

    FXStreet.Class.Sidebar.RenderedItemInPage.PieceOfNews = function () {
        var parent = FXStreet.Class.Sidebar.RenderedItemInPage.PostBaseItem(true),
         _this = FXStreet.Util.extendObject(parent);


        parent.SocialMediaType = function () {
            return FXStreet.Class.SocialMediaBarDefault();
        }

        parent.HtmlTemplateFile = "newsdetails_default.html";
        parent.RelatedContentUrl = FXStreet.Resource.FxsApiRoutes["NewsItemGetRelated"];
        parent.GetPostByUrlApi = FXStreet.Resource.FxsApiRoutes["NewsItemGetItemByUrl"];

        var parentGetJsonAds = parent.getJsonAds;
        parent.getJsonAds = function () {
            var result = parentGetJsonAds();
            result.push({
                "ContainerId": "fxs_leaderboard_ad_" + parent.Id,
                "SlotName": FXStreet.Resource.DfpSlots.News,
                "AdvertiseType": "normal",
                "RefreshSeconds": 0,
                "MobileSize": "[320, 50]",
                "TabletSize": "[728, 90]",
                "DesktopSize": "[728, 90]",
                "DesktopHdSize": "[728, 90]",
                "Labels": [
                    {
                        'Key': 'ros',
                        'Value': ['leader']
                    }
                ]
            });
            result.push({
                "ContainerId": "fxs_article_ad_" + parent.Id,
                "SlotName": FXStreet.Resource.DfpSlots.News,
                "AdvertiseType": "normal",
                "RefreshSeconds": 0,
                "MobileSize": "[250, 250]",
                "TabletSize": "[250, 250]",
                "DesktopSize": "[300, 250]",
                "DesktopHdSize": "[300, 250]",
                "Labels": [
                    {
                        'Key': 'ros',
                        'Value': ['horizontal']
                    }
                ]
            });

            _this.ContainerItem.find('div[fxs_widget_ads]').each(function (i, item) {
                item.id = FXStreet.Util.guid();
                result.push({
                    "ContainerId": item.id,
                    "SlotName": FXStreet.Resource.DfpSlots.News,
                    "AdvertiseType": "normal",
                    "RefreshSeconds": 0,
                    "MobileSize": "[580, 70]",
                    "TabletSize": "[580, 70]",
                    "DesktopSize": "[580, 70]",
                    "DesktopHdSize": "[580, 70]"
                });
            });

            return result;
        };

        var parentPrivateLoadInternalWidgets = parent.privateLoadInternalWidgets;
        _this.setOnParent('privateLoadInternalWidgets', function ()
        {
            parentPrivateLoadInternalWidgets();
            var cagContainerId = "fxs_cag_widget_" + parent.Id;
            var cagContainer = FXStreet.Util.getjQueryObjectById(cagContainerId, false);

            if (((cagContainer) && (cagContainer.length > 0)) && (parent.HtmlTemplateData.CagAsset)) {

                var cagApiGetModel = FXStreet.Resource.FxsApiRoutes["CagApiGetModel"];
                $.get(cagApiGetModel + "?assetId=" + parent.HtmlTemplateData.CagAsset)
                         .then(function (data) {
                             var chartUrl = data.BigChartUrl.toLowerCase();
                             var jsonCagWidget = {
                                 'JsCreateEvent': "load",
                                 'JsName': "Cag",
                                 'MarketToolsWebApiBaseUrl': data.MarketToolsWebApiBaseUrl,
                                 'AuthorizationUrl': data.AuthorizationUrl,
                                 'Asset': data.Asset,
                                 'BigChartUrl': chartUrl,
                                 'ContainerId': "fxs_cag_widget_" + _this.Id,
                                 'DecimalPlaces': data.DecimalPlaces,
                                 'PairName': data.PairName,
                                 'PriceProviderCode': data.PriceProviderCode,
                                 'Translations': data.Translations,
                                 'AssetUrl': data.AssetUrl
                             };
                             _this.CagWidgetManagerObj = new FXStreet.Class.Cag();
                             _this.CagWidgetManagerObj.init(jsonCagWidget);
                         });
            }
        });
        return _this;
    };
    FXStreet.Class.Sidebar.RenderedItemInPage.AnalysisItem = function () {
        var parent = FXStreet.Class.Sidebar.RenderedItemInPage.PostBaseItem(true),
         _this = FXStreet.Util.extendObject(parent);

        var parentOnShow = parent.onShow;
        _this.setOnParent('onShow', function () {
            parentOnShow();
            parent.initAuthorFollow();
        });      
       
        parent.SocialMediaType = function () {
            return FXStreet.Class.SocialMediaBarDefault();
        }

        parent.HtmlTemplateFile = "analysisItemdetails_default.html";
        parent.RelatedContentUrl = FXStreet.Resource.FxsApiRoutes["AnalysisItemGetRelated"];
        parent.GetPostByUrlApi = FXStreet.Resource.FxsApiRoutes["AnalysisItemGetItemByUrl"];

        var parentGetJsonAds = parent.getJsonAds;
        parent.getJsonAds = function () {
            var result = parentGetJsonAds();
            result.push({
                "ContainerId": "fxs_leaderboard_ad_" + parent.Id,
                "SlotName": FXStreet.Resource.DfpSlots.Analysis,
                "AdvertiseType": "normal",
                "RefreshSeconds": 0,
                "MobileSize": "[320, 50]",
                "TabletSize": "[728, 90]",
                "DesktopSize": "[728, 90]",
                "DesktopHdSize": "[728, 90]",
                "Labels": [
                    {
                        'Key': 'ros',
                        'Value': ['leader']
                    }
                ]
            });
            result.push({
                "ContainerId": "fxs_article_ad_" + parent.Id,
                "SlotName": FXStreet.Resource.DfpSlots.Analysis,
                "AdvertiseType": "normal",
                "RefreshSeconds": 0,
                "MobileSize": "[250, 250]",
                "TabletSize": "[250, 250]",
                "DesktopSize": "[300, 250]",
                "DesktopHdSize": "[300, 250]",
                "Labels": [
                    {
                        'Key': 'ros',
                        'Value': ['horizontal']
                    }
                ]
            });

            _this.ContainerItem.find('div[fxs_widget_ads]').each(function (i, item) {
                item.id = FXStreet.Util.guid();
                result.push({
                    "ContainerId": item.id,
                    "SlotName": FXStreet.Resource.DfpSlots.Analysis,
                    "AdvertiseType": "normal",
                    "RefreshSeconds": 0,
                    "MobileSize": "[580, 70]",
                    "TabletSize": "[580, 70]",
                    "DesktopSize": "[580, 70]",
                    "DesktopHdSize": "[580, 70]"
                });
            });

            return result;
        };
        return _this;
    };
    FXStreet.Class.Sidebar.RenderedItemInPage.EducationItem = function () {
        var parent = FXStreet.Class.Sidebar.RenderedItemInPage.PostBaseItem(true),
         _this = FXStreet.Util.extendObject(parent);

        var parentOnShow = parent.onShow;
        _this.setOnParent('onShow', function () {
            parentOnShow();
            parent.initAuthorFollow();
        });

        parent.SocialMediaType = function () {
            return FXStreet.Class.SocialMediaBarDefault();
        }

        parent.HtmlTemplateFile = "educationItemdetails_default.html";
        parent.RelatedContentUrl = FXStreet.Resource.FxsApiRoutes["EducationItemGetRelated"];
        parent.GetPostByUrlApi = FXStreet.Resource.FxsApiRoutes["EducationItemGetItemByUrl"];

        var parentGetJsonAds = parent.getJsonAds;
        parent.getJsonAds = function () {
            var result = parentGetJsonAds();
            result.push({
                "ContainerId": "fxs_leaderboard_ad_" + parent.Id,
                "SlotName": FXStreet.Resource.DfpSlots.Education,
                "AdvertiseType": "normal",
                "RefreshSeconds": 0,
                "MobileSize": "[320, 50]",
                "TabletSize": "[728, 90]",
                "DesktopSize": "[728, 90]",
                "DesktopHdSize": "[728, 90]",
                "Labels": [
                    {
                        'Key': 'ros',
                        'Value': ['leader']
                    }
                ]
            });
            result.push({
                "ContainerId": "fxs_article_ad_" + parent.Id,
                "SlotName": FXStreet.Resource.DfpSlots.Education,
                "AdvertiseType": "normal",
                "RefreshSeconds": 0,
                "MobileSize": "[250, 250]",
                "TabletSize": "[250, 250]",
                "DesktopSize": "[300, 250]",
                "DesktopHdSize": "[300, 250]",
                "Labels": [
                    {
                        'Key': 'ros',
                        'Value': ['horizontal']
                    }
                ]
            });

            _this.ContainerItem.find('div[fxs_widget_ads]').each(function (i, item) {
                item.id = FXStreet.Util.guid();
                result.push({
                    "ContainerId": item.id,
                    "SlotName": FXStreet.Resource.DfpSlots.Education,
                    "AdvertiseType": "normal",
                    "RefreshSeconds": 0,
                    "MobileSize": "[580, 70]",
                    "TabletSize": "[580, 70]",
                    "DesktopSize": "[580, 70]",
                    "DesktopHdSize": "[580, 70]"
                });
            });

            return result;
        };
        return _this;
    };
    FXStreet.Class.Sidebar.RenderedItemInPage.AjaxPage = function () {
        var parent = FXStreet.Class.Sidebar.RenderedItemInPage.Base(),
         _this = FXStreet.Util.extendObject(parent);

        _this.Url = "";
        _this.CookieInfo = null;

        _this.HomeMetaTagsObj = null;

        _this.init = function (json) {
            parent.init(json);
            _this.setSettingsByObject(json);
            _this.CreateContainer();
        };

        var parentCreateContainer = parent.CreateContainer;
        _this.CreateContainer = function () {
            parentCreateContainer();
            _this.ContainerItem.attr('id', 'fxs_home');
        };

        _this.setOnParent('renderPromise', function () {
            return $.ajax({ url: _this.Url }).done(_this.renderSuccess);
        });

        _this.renderSuccess = function (data) {
            var html = _this.getHtmlBody(data);
            _this.ContainerItem.html(html);

            var metaTags = parseStringToFindMetaTags(data);
            _this.HomeMetaTagsObj = FXStreet.Class.Patterns.Singleton.SeoMetaTags.Instance();
            _this.HomeMetaTagsObj.initHomeMetaTagsObject(metaTags);
        };

        _this.getHtmlBody = function (data) {
            var html = $(data).find('#fxs_home').html();
            return html;
        };

        var parseStringToFindMetaTags = function (data) {
            var result = {};
            var regexp =
                /<meta[ \t\r\n]+property="og:([a-z0-9:\/._ \-\t\n\r]*)"[ \r\n]+content="([a-z0-9:\/._ \-\t\n\r]+( [a-z0-9:\/._ \-\t\n\r]+)*)"[ \r\n]+\/>/gi;

            var match = regexp.exec(data);
            while (match != null) {
                var property = match[1];
                var content = match[2];

                if (property === "url") {
                    result.FullUrl = content;
                } else if (property === "image") {
                    result.Image = content;
                } else if (property === "title") {
                    result.MetaTitle = content;
                } else if (property === "description") {
                    result.Summary = content;
                } else if (property === "keywords") {
                    result.Keywords = content;
                }

                match = regexp.exec(data);
            }

            return result;
        };

        var parentOnShow = parent.onShow;
        _this.setOnParent('onShow', function () {
            parentOnShow();

            try {
                FXStreetWidgets.Deferred.deferredLoad(_this.ContainerItem);
            } catch (e) {
                console.error("FXStreetWidgets not initialize");
            }

            FXStreet.Util.initObjects('all');
            FXStreet.Util.registerDynamicObjs(_this.ContainerItem);
            if (_this.CookieInfo && _this.CookieInfo.CookieKey) {
                var cacheExpirationInDays = (3 / 24);
                if (_this.CookieInfo.RefreshTimeInDays && _this.CookieInfo.RefreshTimeInDays > 0) {
                    cacheExpirationInDays = _this.CookieInfo.RefreshTimeInDays;
                }
                $.cookie(_this.CookieInfo.CookieKey, true, { expires: cacheExpirationInDays });
            }
        });

        return _this;
    };
    FXStreet.Class.Sidebar.RenderedItemInPage.TransitionDetail = function () {

        var parent = FXStreet.Class.Sidebar.RenderedItemInPage.BaseScrollable(),
        _this = FXStreet.Util.extendObject(parent);

        _this.Id = "";
        _this.Content = "";

        _this.init = function (json) {
            parent.init(json);
            _this.setSettingsByObject(json);
            _this.CreateContainer();
        };

        _this.setOnParent('renderPromise', function () {
            _this.ContainerItem.html($('<section>' + _this.Content + '</section>'));
            return $.when();
        });

        var parentOnShow = parent.onShow;
        _this.setOnParent('onShow', function () {
            parentOnShow();
            FXStreet.Util.registerDynamicObjs(_this.ContainerItem);
        });

        return _this;
    };
    FXStreet.Class.Sidebar.RenderedItemInPage.RatesAndChartsItem = function () {
        var parent = FXStreet.Class.Sidebar.RenderedItemInPage.PostBaseItem(),
        _this = FXStreet.Util.extendObject(parent);

        _this.RateManagerObj = null;
        parent.HtmlTemplateFile = "ratesandchartsdetails_default.html";

        _this.SingleChartManagerObj = null;
        _this.CagWidgetManagerObj = null;

        _this.init = function (json) {
            parent.init(json);
            _this.setSettingsByObject(json);
        };

        _this.createRateManager = function () {
            _this.RateManagerObj = new FXStreet.Class.SingleRateManager();
            _this.RateManagerObj.init({
                "ContainerId": "fxs_ratedata_" + _this.HtmlTemplateData.Id,
                "HtmlTemplateFile": "ratesandcharts_header.html",
                "Data": _this.getJsonForRenderHtml()
            });
        };

        parent.SocialMediaType = function () {
            return null;
        };

        var parentOnShow = parent.onShow;
        _this.setOnParent('onShow', function () {
            parentOnShow();
            _this.createRateManager();
            try
            {
                FXStreetWidgets.Deferred.deferredLoad(_this.ContainerItem);
            } catch (e) {
                
            }
            _this.Subscribe();
            _this.Refresh();
        });

        var parentPrivateLoadInternalWidgets = parent.privateLoadInternalWidgets;

        _this.setOnParent('privateLoadInternalWidgets', function ()
        {
            parentPrivateLoadInternalWidgets();

            var chartUrl = parent.HtmlTemplateData.BigChartUrl.toLowerCase();
            var cagContainer = FXStreet.Util.getjQueryObjectById("fxs_cag_widget_" + _this.Id, false);
            if ((cagContainer) &&(cagContainer.length > 0)) {

                var cagContainerId = "fxs_cag_widget_" + _this.Id;
                var jsonCagWidget =
                {
                    'JsCreateEvent': "load",
                    'JsName': "Cag",
                    'MarketToolsWebApiBaseUrl': parent.HtmlTemplateData.MarketToolsWebApiBaseUrl,
                    'AuthorizationUrl': parent.HtmlTemplateData.AuthorizationUrl,
                    'Asset': parent.HtmlTemplateData.Id,
                    'BigChartUrl': chartUrl,
                    'ContainerId': cagContainerId,
                    'DecimalPlaces': parent.HtmlTemplateData.DecimalPlaces,
                    'PairName': parent.HtmlTemplateData.Title,
                    'PriceProviderCode':  parent.HtmlTemplateData.PriceProviderCode,
                    'Translations': parent.HtmlTemplateData.Translations
                };

                  _this.CagWidgetManagerObj = new FXStreet.Class.Cag();
                  _this.CagWidgetManagerObj.init(jsonCagWidget);
            }else{
                var chartContainer = FXStreet.Util.getjQueryObjectById("fxs_chartdata_default_" + _this.Id, false);
                if (chartContainer.length > 0) {
                    var widgetType = "fxs_widget_default";
                    var jsonChartWidget = {
                        'ContainerId': chartContainer[0].id,
                        'PairName': parent.HtmlTemplateData.Title,
                        'PriceProviderCode': parent.HtmlTemplateData.PriceProviderCode,
                        'WidgetType': widgetType,
                        'BigChartUrl': chartUrl,
                        'DisplayRSI': false,
                        'DisplaySMA': true,
                        'DisplayBigChartUrl': true,
                        'TouchAvailable': false,
                        'ExternalUrl': chartUrl
                    };
                  _this.SingleChartManagerObj = new FXStreet.Class.SingleChartManager();
                  _this.SingleChartManagerObj.init(jsonChartWidget);
                }
            }

            var jsonSocialMediaObj = new FXStreet.Class.SocialMediaBarBoxed();
            jsonSocialMediaObj.init({
                'ContainerId': 'fxs_socialmedia_bar_header_' + _this.HtmlTemplateData.Id,
                'PageUrl': _this.HtmlTemplateData.SEO !== undefined ? _this.HtmlTemplateData.SEO.FullUrl : "",
                'ItemTitle': _this.HtmlTemplateData.SEO !== undefined ? _this.HtmlTemplateData.SEO.MetaTitle : ""
            });
            if (_this.HtmlTemplateData.TagId) {
                var relatedNewsMediaObj = new FXStreet.Class.NewsList();
                relatedNewsMediaObj.init({
                    'ContainerId': 'fxs_related_news_' + _this.HtmlTemplateData.Id,
                    'Category': _this.HtmlTemplateData.TagId,
                    'Take': 5
                });

                var relatedAnalysisMediaObj = new FXStreet.Class.AnalysisList();
                relatedAnalysisMediaObj.init({
                    'ContainerId': 'fxs_related_analysis_' + _this.HtmlTemplateData.Id,
                    'Category': _this.HtmlTemplateData.TagId,
                    'Take': 5
                });
            }
            jsonSpreads().done(function (data) {
                var brokerSpreadsObj = new FXStreet.Class.BrokersSpreads();
                brokerSpreadsObj.init({
                    'ContainerId': 'fxs_brokerspreads_' + _this.HtmlTemplateData.Id,
                    'HtmlTemplateFile': 'brokersspreads_big.html',
                    'Brokers': data.Brokers,
                    'Pairs': data.Pairs
                });
            });
        });

        _this.setOnParent('privateUnLoadInternalWidgets', function () {
            _this.Unsubscribe();
        });

        var jsonSpreads = function () {
            var data = {
                "culture": FXStreet.Resource.CultureName,
                "pairs": 'fxs-3212164,fxs-3212166,fxs-3212155,fxs-3212172,fxs-3212322',
                "take": 5
            };

            return $.ajax({
                type: "GET",
                url: FXStreet.Resource.FxsApiRoutes["BrokersSpreadsRandom"],
                data: data,
                contentType: "application/json; charset=utf-8",
                dataType: "json"
            });
        }

        var parentGetJsonAds = parent.getJsonAds;
        parent.getJsonAds = function () {
            var result = parentGetJsonAds();
            result.push({
                "ContainerId": "fxs_leaderboard_ad_" + parent.Id,
                "SlotName": FXStreet.Resource.DfpSlots.RatesCharts,
                "AdvertiseType": "normal",
                "RefreshSeconds": 0,
                "MobileSize": "[320, 50]",
                "TabletSize": "[728, 90]",
                "DesktopSize": "[728, 90]",
                "DesktopHdSize": "[728, 90]",
                "Labels": [
                    {
                        'Key': 'ros',
                        'Value': ['leader']
                    }
                ]
            });
            result.push({
                "ContainerId": "fxs_ad_" + parent.Id,
                "SlotName": FXStreet.Resource.DfpSlots.RatesCharts,
                "AdvertiseType": "normal",
                "RefreshSeconds": 0,
                "MobileSize": "[250, 250]",
                "TabletSize": "[250, 250]",
                "DesktopSize": "[300, 250]",
                "DesktopHdSize": "[300, 250]",
                "Labels": [
                    {
                        'Key': 'ros',
                        'Value': ['horizontal']
                    }
                ]
            });
            result.push({
                "ContainerId": "fxs_ad_2_" + parent.Id,
                "SlotName": FXStreet.Resource.DfpSlots.RatesCharts,
                "AdvertiseType": "normal",
                "RefreshSeconds": 0,
                "MobileSize": "[250, 250]",
                "TabletSize": "[250, 250]",
                "DesktopSize": "[300, 250]",
                "DesktopHdSize": "[300, 250]",
                "Labels": [
                    {
                        'Key': 'ros',
                        'Value': ['horizontal']
                    }
                ]
            });
            return result;
        };

        _this.Subscribe = function () {
            _this.RateManagerObj.Subscribe();
        };

        _this.Unsubscribe = function () {
            if (_this.SingleChartManagerObj) {
                _this.SingleChartManagerObj.display(false);
            }
            if (_this.RateManagerObj) {
                _this.RateManagerObj.Unsubscribe();
            }
        };

        _this.Refresh = function () {
            FXStreet.Util.SetTooltip();
        };

        var parentGetJsonForRenderHtml = parent.getJsonForRenderHtml;
        _this.setOnParent('getJsonForRenderHtml', function () {
            var jsonData = parentGetJsonForRenderHtml();

            jsonData.Translations.RelatedNewsTitle = jsonData.Translations.RelatedNewsTitle.replace(/\{0\}/g, _this.HtmlTemplateData.Title);
            jsonData.Translations.RelatedAnalysisTitle = jsonData.Translations.RelatedAnalysisTitle.replace(/\{0\}/g, _this.HtmlTemplateData.Title);

            return jsonData;
        });

        return _this;
    };
    FXStreet.Class.Sidebar.RenderedItemInPage.VideoItem = function () {
        var parent = FXStreet.Class.Sidebar.RenderedItemInPage.PostBaseItem(true),
         _this = FXStreet.Util.extendObject(parent);

        _this.Video = null;
        _this.Title = "";

        parent.HtmlTemplateFile = "videoItemdetails_default.html";
        parent.RelatedContentUrl = FXStreet.Resource.FxsApiRoutes["VideoItemGetRelated"];
        parent.GetPostByUrlApi = FXStreet.Resource.FxsApiRoutes["VideosGetItemByUrl"];
        _this.HtmlTemplateFilePriceTable = "price_table.html";

        var googleDriveManager = {};
        var marketingLeadsManagerManager = {};

        var ctaRegister = null;
        var showVideoCurtain = null;
        var videoContainer = null;

        _this.init = function (json) {
            parent.init(json);
            _this.setSettingsByObject(json);
            _this.setVars();
            _this.addEvents();
        };

        _this.setVars = function() {
            googleDriveManager = FXStreet.Util.getObjectInstance("GoogleDriveManager");
            marketingLeadsManagerManager = FXStreet.Util.getObjectInstance("MarketingLeadsManager");
        };

        _this.addEvents = function () {
            setRegisterEvents();
            setCurtainEvents();
        };

        var setRegisterEvents = function () {
            var userMenu = FXStreet.Util.getObjectInstance("UserMenu");
            if (userMenu == null) {
                return;
            }
            var ctaRegisterId = "fxs_cta_register_" + _this.Id;

            if (ctaRegister === null) {
                ctaRegister = FXStreet.Util.getjQueryObjectById(ctaRegisterId, true, false);
                if (ctaRegister != null && ctaRegister.length > 0) {
                    ctaRegister.click(function () { userMenu.Login() });
                }
            }
        };

        var setCurtainEvents = function () {
            if (_this.Video !== null && _this.Video.RegistrationRequired) {
                var showVideoCurtainId = "fxs_live_video_show_" + _this.Id;
                var showVideoButtonId = "fxs_cta_show_video_" + _this.Id;
                var videoContainerId = "fxs_live_video_container_" + _this.Id;

                showVideoCurtain = FXStreet.Util.getjQueryObjectById(showVideoCurtainId, false);
                videoContainer = FXStreet.Util.getjQueryObjectById(videoContainerId, false);
                var showVideoButton = FXStreet.Util.getjQueryObjectById(showVideoButtonId, false);

                showVideoButton.on("click", onShowVideoClick);
            }
        };

        //_this.createPlayer = function() {
        //    if (typeof YT !== "undefined" && typeof onYouTubeIframeAPIReady !== "undefined") {
        //        onYouTubeIframeAPIReady();
        //    }
        //};

        var parentOnShow = parent.onShow;
        parent.setOnParent('onShow', function () {
            parentOnShow();
            parent.initAuthorFollow();
            try {
                FXStreetWidgets.Deferred.deferredLoad(_this.ContainerItem);
            } catch (e) {
                //console.error("FXStreetWidgets not initialize");
            }

            _this.addEvents();
            //_this.createPlayer();
        });

        var onShowVideoClick = function () {
            showVideoCurtain.addClass("fxs_hideElements");
            videoContainer.removeClass("fxs_hideElements");
            sendPlayEvent();
        };

        var sendPlayEvent = function () {
            var event = {
                Title: _this.Title,
                Origin: "live-video",
                Contact: true
            };
            googleDriveManager.SavePlayEvent(event, pushSuccess);
            marketingLeadsManagerManager.SavePlayEvent(event, pushSuccess);
        };

        var pushSuccess = function() {
        };

        parent.SocialMediaType = function () {
            return FXStreet.Class.SocialMediaBarDefault();
        };

        parent.renderHtml = function (template, json) {
            var rendered = FXStreet.Util.renderByHtmlTemplate(template, json);
            _this.ContainerItem.append(rendered);

            if (json.Value.Video.PremiumView) {
                json.Subscription = json.Value.Video.Subscription;
                FXStreet.Util.loadHtmlTemplate(_this.HtmlTemplateFilePriceTable).done(function (templatePriceTable) {
                    var renderedPriceTable = FXStreet.Util.renderByHtmlTemplate(templatePriceTable, json);
                    _this.ContainerItem.find('.fxs_row').html(renderedPriceTable);
                });
            }
        };

        var parentGetJsonAds = parent.getJsonAds;
        parent.getJsonAds = function () {
            var result = parentGetJsonAds();
            result.push({
                "ContainerId": "fxs_leaderboard_ad_" + parent.Id,
                "SlotName": FXStreet.Resource.DfpSlots.LiveVideo,
                "AdvertiseType": "normal",
                "RefreshSeconds": 0,
                "MobileSize": "[320, 50]",
                "TabletSize": "[728, 90]",
                "DesktopSize": "[728, 90]",
                "DesktopHdSize": "[728, 90]",
                "Labels": [
                    {
                        'Key': 'ros',
                        'Value': ['leader']
                    }
                ]
            });
            result.push({
                "ContainerId": "fxs_article_ad_" + parent.Id,
                "SlotName": FXStreet.Resource.DfpSlots.LiveVideo,
                "AdvertiseType": "normal",
                "RefreshSeconds": 0,
                "MobileSize": "[250, 250]",
                "TabletSize": "[250, 250]",
                "DesktopSize": "[300, 250]",
                "DesktopHdSize": "[300, 250]",
                "Labels": [
                    {
                        'Key': 'ros',
                        'Value': ['horizontal']
                    }
                ]
            });

            _this.ContainerItem.find('div[fxs_widget_ads]').each(function (i, item) {
                item.id = FXStreet.Util.guid();
                result.push({
                    "ContainerId": item.id,
                    "SlotName": FXStreet.Resource.DfpSlots.LiveVideo,
                    "AdvertiseType": "normal",
                    "RefreshSeconds": 0,
                    "MobileSize": "[580, 70]",
                    "TabletSize": "[580, 70]",
                    "DesktopSize": "[580, 70]",
                    "DesktopHdSize": "[580, 70]"
                });
            });
            return result;
        };

        return _this;
    };
    FXStreet.Class.Sidebar.RenderedItemInPage.NoMoreContent = function () {
        var parent = FXStreet.Class.Sidebar.RenderedItemInPage.BaseScrollable(),
        _this = FXStreet.Util.extendObject(parent);

        _this.Id = "";
        _this.Content = "";

        _this.HtmlTemplateFile = "nomorecontentinpage.html";

        _this.init = function (json) {
            parent.init(json);
            _this.setSettingsByObject(json);
            _this.CreateContainer();
        };

        _this.setOnParent('renderPromise', function () {
            _this.ContainerItem.removeClass('fxs_detail');
            return FXStreet.Util.loadHtmlTemplate(_this.HtmlTemplateFile).done(function (template) {
                var rendered = FXStreet.Util.renderByHtmlTemplate(template, {
                    Translations: FXStreet.Resource.Translations['Sidebar_FilterAndList']
                });
                _this.ContainerItem.append(rendered);
            });
        });

        var parentOnShow = parent.onShow;
        _this.setOnParent('onShow', function () {
            parentOnShow();
            _this.ContainerItem.find('.fxs_feedbackLoading_msg').show();
            $('#pageLoading').hide();
        });

        return _this;
    };
}());
(function () {
    FXStreet.Class.Sidebar.Typeahead = function () {
        var parent = FXStreet.Class.Base(),
          _this = FXStreet.Util.extendObject(parent);

        // Json properties
        _this.ValuesOptions = {};
        _this.FindBy_Options = [];
        _this.TypeaheadId = "";
        _this.TypeaheadInputTargetId = "";
        _this.TypeaheadFilterButtonId = "";
        _this.TypeaheadCancelButtonId = "";
        _this.CloseDelegated = null;
        _this.SelectedTypeaheadId = null;
        // End json properties

        _this.TypeaheadObserverSubject = null;

        _this.TypeaheadContainer = null;
        _this.TypeaheadInput = null;
        _this.CurrentSelectedItem = null;
        _this.Suggestions = null;
        _this.OptionSelectedDelegate = null;
        _this.TypeaheadFilterButton = null;
        _this.TypeaheadCancelButton = null;
        _this.PlaceholderText = "";

        _this.OnLayoutBuiltBeforeDelegate = null;
       
        _this.OnClickBeforeDelegate = null;

        _this.Changed = false;

        _this.init = function (json) {
            _this.setSettingsByObject(json);
            _this.setVars();
            _this.addEvents();
            _this.loadValuesOptions();
        };

        _this.setVars = function () {
            _this.TypeaheadContainer = FXStreet.Util.getjQueryObjectById(_this.TypeaheadId);
            _this.TypeaheadInput = FXStreet.Util.getjQueryObjectById(_this.TypeaheadInputTargetId);
            _this.TypeaheadFilterButton = FXStreet.Util.getjQueryObjectById(_this.TypeaheadFilterButtonId);
            _this.TypeaheadCancelButton = FXStreet.Util.getjQueryObjectById(_this.TypeaheadCancelButtonId);

            _this.TypeaheadObserverSubject = new FXStreet.Class.Patterns.Observer.Subject();
        };

        _this.addEvents = function () {
            _this.TypeaheadFilterButton.on('click', _this.TypeaheadFilterButtonClick);
            _this.TypeaheadCancelButton.on('click', _this.TypeaheadCancelButtonClick);
            _this.TypeaheadInput.on('blur', _this.TypeaheadBlur);
            _this.TypeaheadInput.focusin(_this.TypeaheadFocusIn);
        };

        _this.TypeaheadFilterButtonClick = function (e) {
            _this.Changed = false;
            if (e) {
                e.stopPropagation();
            }
        };

        _this.TypeaheadCancelButtonClick = function (e) {
            var div = _this.TypeaheadContainer.find('.fxs_typeaheadContainer');

            div.removeClass("result");
            div.removeClass("hint");
            div.removeClass("backdrop");

            $('.fxs_queryResults').removeClass("fxs_selectedQuery");

            _this.TypeaheadCancelButton.addClass('fxs_dismissQuery_disabled');

            _this.CurrentSelectedItem = null;
            if (_this.Changed) {
                _this.CloseDelegated();
            }
            if (e) {
                e.stopPropagation();
            }
        };

        _this.loadValuesOptions = function () {
            var promises = [];
            for (var i = 0; i < _this.FindBy_Options.length; i++) {
                promises.push(_this.loadOption(i, _this.FindBy_Options[i]));
            }
            $.when.apply($, promises).done(function () {
                _this.createTypeahead();
                _this.enabledTypeahead();
            });
        };

        _this.loadOption = function (i, option) {
            var actionUrl = FXStreet.Util.createUrl(FXStreet.Resource.FxsApiRoutes[option.FindBy_FxsApiRoute], []);
            if (!actionUrl) {
                console.error('The typeahead url is invalid');
                return $.when();
            }
            return $.getJSON(actionUrl, function (data) {
                _this.ValuesOptions[option.QueryStringKey] = data.Result;
                _this.ValuesOptions[option.QueryStringKey].Template = option.Template;
                _this.ValuesOptions[option.QueryStringKey].Index = i;
                _this.ValuesOptions[option.QueryStringKey].Title = option.Title;
            });
        };

        _this.createTypeahead = function () {
            var data = {};
            var groups = [];
            var groupDisplay = {};
            $.each(_this.ValuesOptions, function (key, element) {
                data[element.Title] = {
                    data: $.map(element, function (val) {
                        if (!val) return null;
                        return {
                            id: val.Id,
                            display: val.Title || val.Name,
                            queryString: key,
                            decimalPlaces: val.DecimalPlaces,
                            url: val.Url,
                            priceProviderCode: val.PriceProviderCode,
                            priceStatics: val.PriceStatics
                        };
                    }),
                    template: element.Template
                };
                groups.push({ key: key, title: element.Title, index: element.Index });
                groupDisplay[key] = element.Title;
            });

            groups.sort(function (a, b) { return a.index - b.index; });
            var groupsOrder = groups.map(function (item) { return item.title });

            if (_this.ValuesOptions.CategoryId) {
                _this.CurrentSelectedItem = _this.ValuesOptions.CategoryId.findFirst(function (item) {
                    return _this.SelectedTypeaheadId && item.Id.toLowerCase() === _this.SelectedTypeaheadId.toLowerCase();
                });
            }

            _this.TypeaheadInput.typeahead({
                minLength: 1,
                group: false,
                groupMaxItem: 6,
                maxItem: 30,
                groupOrder: groupsOrder,
                hint: true,
                dropdownFilter: false,
                emptyTemplate: 'No result for "{{query}}"',
                source: data,
                debug: true,
                cache: false,
                selector: {
                    container: "fxs_typeaheadContainer",
                    group: "fxs_typeaheadGroup",
                    result: "typeahead-result",
                    list: "fxs_typeaheadList fxs_fieldset fxs_scrollable_list",
                    display: "typeahead-display",
                    query: "fxs_typeaheadQuery"
                },
                filter: function (item, displayKey) {
                    if (this.query) {
                        if (displayKey.toLowerCase().includes(this.query.toLowerCase()) ||
                            _this.levenshteinAlgorithm(this.query.toLowerCase(),displayKey.toLowerCase()) <= 2)
                            return item;
                    }
                },
                callback: {
                    onInit: null,
                    onReady: function () {
                        if (_this.CurrentSelectedItem) {
                            _this.TypeaheadInput.val(_this.CurrentSelectedItem.Title);
                            _this.TypeaheadFilterButtonClick();
                        }
                    },      // -> New callback, when the Typeahead initial preparation is completed
                    onSearch: null,     // -> New callback, when data is being fetched & analyzed to give search results
                    onResult: null,
                    onLayoutBuiltBefore: _this.OnLayoutBuiltBeforeDelegate,  // -> New callback, when the result HTML is build, modify it before it get showed
                    onLayoutBuiltAfter: null,   // -> New callback, modify the dom right after the results gets inserted in the result container
                    onNavigate: null,   // -> New callback, when a key is pressed to navigate the results
                    onMouseEnter: null,
                    onMouseLeave: null,
                    onClick: _this.onSuggestionClick,
                    onClickBefore: null,// -> Improved feature, possibility to e.preventDefault() to prevent the Typeahead behaviors
                    onClickAfter: null, // -> New feature, happens after the default clicked behaviors has been executed
                    onSubmit: null,
                    onCacheSave: function (node, data, group, path) {
                        var t = data;
                    }

                }

            });
        };

        _this.getTextValue = function () {
            return _this.TypeaheadInput.val();
        };

        _this.getSelectedItem = function () {
            var value = _this.getTextValue().toLowerCase();
            var selected = null;
            $.each(_this.ValuesOptions, function (key) {
                selected = _this.ValuesOptions[key].findFirst(function (item) {
                    return (item.Title || item.Name).toLowerCase() === value;
                });
                if (selected) {
                    return false;
                }
            });
            return selected;
        }

        _this.onSuggestionClick = function (input, value, selectedItem, event) {
            var isInserted;
            if (typeof (_this.OnClickBeforeDelegate) === 'function') {
                isInserted = _this.OnClickBeforeDelegate(input, value, selectedItem, event);
            }
            if (isInserted === "true") {
                if (_this.CurrentSelectedItem === selectedItem) {

                    return;
                }

                _this.TypeaheadCancelButton.removeClass('fxs_dismissQuery_disabled');

                _this.CurrentSelectedItem = selectedItem;
                _this.Changed = true;

                //var hiddenLi = $("#fxs_selected_assets").find("li:hidden").length;
                //var selectedLi = $("#fxs_selected_assets li").length;
                //$('.fxs_assets_number').html((selectedLi - hiddenLi) + " assets");

               // _this.SettAssetCounter();
                _this.TypeaheadObserverSubject.notify(_this.CurrentSelectedItem);
            } else {
                if (_this.CurrentSelectedItem === selectedItem) {
                    return;
                }

                _this.TypeaheadCancelButton.removeClass('fxs_dismissQuery_disabled');

                _this.CurrentSelectedItem = selectedItem;
                _this.Changed = true;

                _this.TypeaheadObserverSubject.notify(_this.CurrentSelectedItem);
            }
        };

        _this.TypeaheadBlur = function () {
            var selected = _this.getSelectedItem();

            if ((!_this.CurrentSelectedItem && !selected) || (_this.CurrentSelectedItem && selected && _this.CurrentSelectedItem.id === selected.Id)) {
                _this.TypeaheadInput.val('');
                return;
            }
            if (selected) {
                var value = _this.getTextValue().toLowerCase();
                var options = $('.fxs_typeaheadList .fxs_typeaheadTxt').filter(function () {
                    return FXStreet.Util.getInnerText(this).toLowerCase() === value;
                });
                if (options && options.length > 0) {
                    options[0].click();
                } else {
                    _this.TypeaheadInput.val('');
                    _this.TypeaheadCancelButton.addClass('fxs_dismissQuery_disabled');
                }
            }
            else if (_this.CurrentSelectedItem) {
                _this.TypeaheadInput.val('');
                //if (_this.CurrentSelectedItem.Title === undefined) {
               //    _this.TypeaheadInput.val(_this.CurrentSelectedItem.display);
               //} else {
               //    _this.TypeaheadInput.val(_this.CurrentSelectedItem.Title);
               //}
            } else {
                _this.TypeaheadInput.val('');
                _this.TypeaheadCancelButton.addClass('fxs_dismissQuery_disabled');
            }
        };

        _this.TypeaheadFocusIn = function () {
            _this.TypeaheadCancelButton.removeClass('fxs_dismissQuery_disabled');
        };

        _this.enabledTypeahead = function () {
            _this.TypeaheadInput.attr('placeholder', _this.PlaceholderText);
            _this.TypeaheadInput.prop('disabled', false);
        };

        _this.addObserver = function (notifyCallback) {
            if (notifyCallback !== undefined && notifyCallback !== null) {
                var json = {
                    'UpdateDelegate': notifyCallback
                };

                var observer = new FXStreet.Class.Patterns.Observer.Observer();
                observer.init(json);
                _this.TypeaheadObserverSubject.addObserver(observer);
            }
        };

        _this.removeObserver = function (notifyCallback) {
            if (notifyCallback !== undefined && notifyCallback !== null) {
                _this.TypeaheadObserverSubject.removeObserver(notifyCallback);
            }
        };

        _this.levenshteinAlgorithm = function (a, b) {
            if (a.length === 0) return b.length;
            if (b.length === 0) return a.length;

            if (a.length > b.length) {
                var tmp = a;
                a = b;
                b = tmp;
            }
            var row = [];
            for (var i = 0; i <= a.length; i++) {
                row[i] = i;
            }

            for (var i = 1; i <= b.length; i++) {
                var prev = i;
                for (var j = 1; j <= a.length; j++) {
                    var val;
                    if (b.charAt(i - 1) === a.charAt(j - 1)) {
                        val = row[j - 1];
                    } else {
                        val = Math.min(row[j - 1] + 1, prev + 1, row[j] + 1);
                    }
                    row[j - 1] = prev;
                    prev = val;
                }
                row[a.length] = prev;
            }

            return row[a.length];
        }
        return _this;
    };
}());
(function () {
    FXStreet.Class.Sidebar.Util.RenderizableListItems = [];
    FXStreet.Class.Sidebar.Util.IsLastVisibleItem = function () {
        var hiddenItem = FXStreet.Class.Sidebar.Util.RenderizableListItems.findFirst(function (item) {
            return item.RenderedItemInPage.PositionInRenderizableListItems === (FXStreet.Class.Sidebar.Util.RenderizableListItems.length - 1)
                && item.RenderedItemInPage.ContainerItem.is(":visible");
        });
        return hiddenItem !== null;
    };
    FXStreet.Class.Sidebar.Util.renderList = function (listDataServer, resultObjRef, renderCallback, clickCallback,
        setHtmlTemplateDataCallback, prepend, isStarting, referralId) {
        isStarting = isStarting || false;

        var createAndInitializeObj = function (json) {
            
            var jsType = json.JsType !== undefined ? json.JsType : FXStreet.Util.ContentTypeMapping[json.ContentTypeId].JsType;
            var result = new FXStreet.Class.Sidebar.ListItemType[jsType]();
            json.ClickCallback = clickCallback;
            json.SetHtmlTemplateDataCallback = setHtmlTemplateDataCallback;
            result.init(json);
            return result;
        };

        var alreadyExists = function (resultObjRef, obj) {
            for (var j = 0; j < resultObjRef.length; j++) {
                if (resultObjRef[j].Id === obj.Id) {
                    return true;
                }
            }
            return false;
        };

        var addToResultObjRef = function (resultObjRef, obj, prepend, index) {
            if (prepend) {
                resultObjRef.splice(index, 0, obj);
            } else {
                resultObjRef.push(obj);
            }
        };

        var addToRenderizableListItems = function (obj, prepend, index) {
            if (prepend) {
                FXStreet.Class.Sidebar.Util.RenderizableListItems.splice(index, 0, obj);
                obj.RenderedItemInPage.setPositionInRenderizableListItems(index);
            } else {
                FXStreet.Class.Sidebar.Util.RenderizableListItems.push(obj);
                obj.RenderedItemInPage.setPositionInRenderizableListItems(FXStreet.Class.Sidebar.Util.RenderizableListItems.length - 1);
            }
        };

        var setExistingContainer = function (obj) {
            var container = $('div[fxs_section]').has('section[fxs-it-id="' + obj.Id + '"]');
            if (container.length) {
                obj.RenderedItemInPage.setAsVisible();
                obj.RenderedItemInPage.setContainerItem(container);
            }
        }

        if (listDataServer) {
            resultObjRef = resultObjRef || [];
            for (var i = 0; i < listDataServer.length; i++) {
                var jsType = listDataServer[i].JsType !== undefined ? listDataServer[i].JsType : FXStreet.Util.ContentTypeMapping[listDataServer[i].ContentTypeId].JsType;

                if (FXStreet.Class.Sidebar.ListItemType[jsType]) {
                    var obj = createAndInitializeObj(listDataServer[i]);

                    if (referralId && obj.Id === referralId) {
                        setExistingContainer(obj);
                    }
                    if (!alreadyExists(resultObjRef, obj) || isStarting) {
                        addToResultObjRef(resultObjRef, obj, prepend, i);

                        if (obj.IsRenderizableInPage()) {
                            addToRenderizableListItems(obj, prepend, i);
                        }

                        if (!isStarting) {
                            obj.renderHtml(renderCallback);
                        }
                    }
                } else {
                    console.warn('The infinite scroll type ' + listDataServer[i].JsType + ' is not implemented');
                }
            }
        }
    };
}());
(function () {
    FXStreet.Class.Sidebar_FilterAndListFactory = function () {
        var parent = FXStreet.Class.Base(),
          _this = FXStreet.Util.extendObject(parent);

        _this.init = function (json) {
            var objectType = "Sidebar_FilterAndList" + json.ContentType;
            if (!FXStreet.Class[objectType]) {
                objectType = "Sidebar_FilterAndListBase";
            }
            FXStreet.Util.createObject(objectType, json);
        };

        return _this;
    };

    FXStreet.Class.Sidebar_FilterAndListBase = function () {
        var parent = FXStreet.Class.Base(),
           _this = FXStreet.Util.extendObject(parent);
        
        _this.ContainerItemsInPageId = "";
        _this.SidebarListJsonInitialization = {};
        _this.FilterJsonInitialization = {};
        _this.SeoAnalyticsJsonInitialization = {};
        _this.CurrentQueryStringValues = [];
        _this.ListDataServerResponse = [];
        _this.ContentType = "";
        _this.StickAdSidebar = '';

        _this.currentVisible = null;

        _this.Sidebar_FilterObj = null;
        _this.Sidebar_ListObj = null;
        _this.InfiniteScrollPageObj = null;
        _this.ContainerItemsInPage = null;
        _this.SeoAnalyticsObj = null;
        _this.PostNotificationsObj = null;
        _this.SoundObj = null;
        _this.TakeElements = {}

        _this.init = function (json) {
            _this.setSettingsByObject(json);
            _this.setVars();
            _this.addEvents();
            _this.fillSpace();
            _this.sendSeo();
        };

        _this.setVars = function () {
            _this.ContainerItemsInPage = FXStreet.Util.getjQueryObjectById(_this.ContainerItemsInPageId);
            _this.createSideBarList();
            _this.initSeoAnalytics();
            _this.createFilter();
            _this.initNotifications();
            _this.createInfiniteScrollPageObj();
            _this.currentVisible = _this.GetMostVisibleItem();
            _this.createStickAdObj();
            //_this.createSoundObj();
        };

        _this.createSoundObj = function () {
            _this.SoundObj = FXStreet.Util.getObjectInstance('Sound');
            if (_this.PostNotificationsObj && _this.SoundObj) {
                //_this.PostNotificationsObj.registerObserver(_this.SoundObj.playSound);
            }
        };

        _this.createStickAdObj = function () {
            if (_this.StickAdSidebar !== undefined && _this.StickAdSidebar !== '') {
                var ads = new FXStreet.Class.AdvertiseNormal();
                ads.init({
                    "ContainerId": _this.StickAdSidebar,
                    "SlotName": FXStreet.Resource.DfpSlots.SponsorBroker,
                    "AdvertiseType": "normal",
                    "RefreshSeconds": 0,
                    "MobileSize": "[320, 40]",
                    "TabletSize": "[320, 40]",
                    "DesktopSize": "[320, 40]",
                    "DesktopHdSize": "[320, 40]",
                    "Labels": [
                    {
                        'Key': 'pos',
                        'Value': 'sponsor'
                    }]
                });
            }
        };

        _this.initNotifications = function () {
            _this.PostNotificationsObj = FXStreet.Util.getObjectInstance('PostNotifications');
            if (_this.PostNotificationsObj) {
                _this.PostNotificationsObj.registerObserver(_this.Sidebar_FilterObj.newPostCreated);
            }
        };

        _this.fillSpace = function () {
            FXStreet.Util.fillPageSpace();
        };

        _this.sendSeo = function () {
            _this.SeoAnalyticsObj.SetAnalytics(_this.currentVisible);
        };

        _this.createInfiniteScrollPageObj = function() {
            _this.InfiniteScrollPageObj = FXStreet.Util.getObjectInstance('InfiniteScrollPage');
        };

        _this.createSideBarList = function () {
            if (FXStreet.Class.Sidebar.List[_this.ContentType]) {
                _this.Sidebar_ListObj = new FXStreet.Class.Sidebar.List[_this.ContentType]();
            }
            else {
                _this.Sidebar_ListObj = new FXStreet.Class.Sidebar.List.Base();
            }

            _this.SidebarListJsonInitialization.CurrentQueryStringValues = _this.CurrentQueryStringValues;
            _this.SidebarListJsonInitialization.ListDataServerResponse = _this.ListDataServerResponse;
            _this.SidebarListJsonInitialization.ContentType = _this.ContentType;
            _this.SidebarListJsonInitialization.TakeElements = _this.TakeElements;
            _this.SidebarListJsonInitialization.OnClickDelegate = _this.setCurrentVisible; // TODO: clean this!
            
            _this.Sidebar_ListObj.init(_this.SidebarListJsonInitialization);
        };

        _this.initSeoAnalytics = function () {
            _this.SeoAnalyticsJsonInitialization.Sidebar_ListObj = _this.Sidebar_ListObj;
            _this.SeoAnalyticsObj = new FXStreet.Class.Sidebar_SeoAnalytics();
            _this.SeoAnalyticsObj.init(_this.SeoAnalyticsJsonInitialization);
        };

        _this.createFilter = function () {
            if (FXStreet.Class.Sidebar.Filter[_this.ContentType]) {
                _this.Sidebar_FilterObj = new FXStreet.Class.Sidebar.Filter[_this.ContentType]();
            }
            else {
                _this.Sidebar_FilterObj = new FXStreet.Class.Sidebar.Filter();
            }
         
            _this.Sidebar_FilterObj.init(_this.getJsonFilter());
        };

        _this.addEvents = function () {
            if (_this.InfiniteScrollPageObj) {
                _this.InfiniteScrollPageObj.whenLoadContent(_this.scrollPageLoadFollowing);
                _this.InfiniteScrollPageObj.whenScroll(_this.scrollPageAction);
            }

            $(window).on("popstate", popState);
        };

        _this.getJsonFilter = function () {
            _this.FilterJsonInitialization.OptionSelectedDelegate = _this.filterChanged;
            _this.FilterJsonInitialization.NewItemCreatedDelegate = _this.newItemCreated;

            return _this.FilterJsonInitialization;
        };

        _this.filterChanged = function (optionSelected, valueSelected) {
            if (optionSelected) {
                if (_this.InfiniteScrollPageObj) {
                    _this.InfiniteScrollPageObj.setAvoidScroll(true);
                }

                _this.resetBody();

                _this.Sidebar_ListObj.clearListValues();
                var queryString = _this.CurrentQueryStringValues;
                queryString = $.grep(queryString, function (item) {
                    return item.Key.toLowerCase() !== 'page' && item.Key.toLowerCase() !== 'take';
                });
                if (_this.Sidebar_ListObj.InfiniteScroll) {
                    _this.Sidebar_ListObj.InfiniteScroll.NotMoreContent = false;
                }
                if (valueSelected !== null) {
                    queryString.push({
                        Key: optionSelected, Value: valueSelected
                    });
                }

                _this.Sidebar_ListObj.Render(queryString).done(function () {
                    _this.Sidebar_ListObj.AfterTypeheadChangedDelegate();
                    if (_this.InfiniteScrollPageObj) {
                        _this.InfiniteScrollPageObj.setAvoidScroll(false);
                    }
                });
            }
        };

        _this.resetBody = function () {
            var obj = FXStreet.Class.Sidebar.Util.RenderizableListItems[0];
            if (obj) {
                obj.RenderedItemInPage.resetBody();
            }
        };

        _this.newItemCreated = function (postsCreated) {
            _this.Sidebar_ListObj.LoadNewItemsCreated(postsCreated);
        };

        _this.scrollPageLoadFollowing = function () {
            if (_this.InfiniteScrollPageObj.MoveUpDirection) {
                _this.Sidebar_ListObj.loadPrevious();
            } else {
                _this.Sidebar_ListObj.loadNext();
            }
        };

        _this.GetMostVisibleItem = function () {
            var items = _this.ContainerItemsInPage.children('div[fxs_section]:visible');
            items.each(function (i, it) {
                it.visibleHeight = FXStreet.Util.VisibleHeight(it);
            });
            items = items.filter(function (i, it) {
                return it.visibleHeight > 0;
            });
            items.sort(function (a, b) {
                return b.visibleHeight - a.visibleHeight;
            });
            var result = items[0];
            return result;
        }

        _this.scrollPageAction = function () {
            var visibleItems = _this.ContainerItemsInPage.children('div[fxs_section]:visible');
            var firstVisibleItem = visibleItems[0];
            var lastVisibleItem = visibleItems[visibleItems.length - 1];

            var firstItem = FXStreet.Class.Sidebar.Util.RenderizableListItems[0];

            var mostVisibleItem = _this.GetMostVisibleItem();

            if (mostVisibleItem && _this.currentVisible !== mostVisibleItem) {
                _this.setCurrentVisible(mostVisibleItem, true);
            } else {
                var position;
                if (_this.InfiniteScrollPageObj.ScrollIsOnBottom() && !_this.Sidebar_ListObj.InfiniteScroll.endOfList) {
                    if (lastVisibleItem && !FXStreet.Class.Sidebar.Util.IsLastVisibleItem()) {
                        position = FXStreet.Util.getItemPosition(lastVisibleItem);
                        _this.Sidebar_ListObj.loadItems(position + 1);
                    } else {
                        _this.InfiniteScrollPageObj.endedList();
                    }
                } else if (_this.InfiniteScrollPageObj.ScrollIsOnTop() && mostVisibleItem !== firstItem && firstItem !== firstVisibleItem) {
                    position = FXStreet.Util.getItemPosition(firstVisibleItem);
                    _this.Sidebar_ListObj.loadItems(position - 1);
                }
            }
        };

        _this.setCurrentVisible = function (item, byScroll) {
            _this.currentVisible = item;
            _this.SeoAnalyticsObj.SetSeo(item);
            _this.SeoAnalyticsObj.SetAnalytics(item, byScroll);

            var position = FXStreet.Util.getItemPosition(item);
            _this.Sidebar_ListObj.setCurrent(position);
        };

        var popState = function (e) {
            if (e.originalEvent.state !== null) {
                var id = e.originalEvent.state.Id;
                var li = $('li[id="' + id + '"');
                if (li[0]) {
                    li[0].click();
                } else {
                    window.location.reload();
                }
            }
        };

        return _this;
    };

    FXStreet.Class.Sidebar_FilterAndListRatesAndCharts = function () {
        var parent = FXStreet.Class.Sidebar_FilterAndListBase(),
          _this = FXStreet.Util.extendObject(parent);
            
        var userPersonalizationManager = null;
        var assetQueryStringKey = 'asset';

        _this.init = function (json) {
            parent.init(json);
            loadUserSetting();
        };

        var loadUserSetting = function () {
            var userSettings = getAssetsUserSetting();
            if (!isReferral() && userSettings) {
                filter(userSettings);
            }
        };

        var parentSetVars = _this.setVars;
        parent.setVars = function () {
            userPersonalizationManager = FXStreet.Class.Patterns.Singleton.UserPersonalizationManager.Instance();
            if (!isReferral() && getAssetsUserSetting()) {
                parent.ListDataServerResponse = [];
                parent.SidebarListJsonInitialization.LoadInitialDataServer = false;
            }
            parentSetVars();
        };

        var isReferral = function () {
            return _this.FilterJsonInitialization.IsReferral;
        }

        var getAssetsUserSetting = function () {
            var result = userPersonalizationManager.GetAssetsRateAndChartFilterSetting();
            return result;
        };

        var saveUserSetting = function (selectedAssets) {
            if (selectedAssets && Object.keys(selectedAssets).length > 0) {
                var setting = {};
                $.each(selectedAssets, function (key, value) {
                    setting[key] = {
                        display: value.display,
                        decimalPlaces: value.decimalPlaces,
                        priceProviderCode: value.priceProviderCode,
                        id: key
                    };
                });
                userPersonalizationManager.SetAssetsRateAndChartFilterSetting(setting);
            }
            else {
                userPersonalizationManager.RemoveAssetsRateAndChartFilterSetting();
            }
        };

        _this.filterChangedCustom = function (selectedAssets) {
            if (selectedAssets) {
                saveUserSetting(selectedAssets);
                parent.Sidebar_ListObj.clearListValues();
                filter(selectedAssets);
            }
        };

        var filter = function (selectedAssets) {
            var numberOfAssets = (Object.keys(selectedAssets).length);
            if (numberOfAssets > 0) {
                parent.Sidebar_ListObj.LoadDefaultTake(numberOfAssets);
            }

            var queryString = parent.CurrentQueryStringValues;
            queryString = $.grep(queryString, function (item) {
                return item.Key.toLowerCase() !== 'page' && item.Key.toLowerCase() !== 'take';
            });

            if (parent.Sidebar_ListObj.InfiniteScroll) {
                parent.Sidebar_ListObj.InfiniteScroll.NotMoreContent = numberOfAssets > 0;
            }

            $.each(selectedAssets, function (key, value) {
                queryString.push({
                    Key: assetQueryStringKey,
                    Value: key
                });
            });

            parent.Sidebar_ListObj.Render(queryString).done(function () {
                parent.Sidebar_ListObj.LoadDefaultTake();
                parent.Sidebar_ListObj.AfterTypeheadChangedDelegate();
            });
        };

        parent.getJsonFilter = function () {
            parent.FilterJsonInitialization.OptionSelectedDelegate = _this.filterChangedCustom;
            parent.FilterJsonInitialization.GetAssetsUserSettingDelegate = getAssetsUserSetting;
            return parent.FilterJsonInitialization;
        };

        parent.createFilter = function () {
            _this.Sidebar_FilterObj = new FXStreet.Class.SideBarMultiassetFilter();
            _this.Sidebar_FilterObj.init(_this.getJsonFilter());
        };

        return _this;
    };
}());
(function () {
    FXStreet.Class.Sidebar_SeoAnalytics = function () {
        var parent = FXStreet.Class.Base(),
          _this = FXStreet.Util.extendObject(parent);

        _this.FullPageUrl = '';
        _this.HomeId = '';
        _this.ListSeoClassType = '';
        _this.ListAnalyticsClassType = '';
        _this.HomeSeoClassType = '';
        _this.HomeAnalyticsClassType = '';
        _this.Sidebar_ListObj = null;

        _this.ListSeoObj = null;
        _this.ListAnalyticsObj = null;
        _this.HomeSeoObj = null;
        _this.HomeAnalyticsObj = null;
        _this.HomeSeoLanguageObj = null;
        _this.HomeMetaTagsObj = null;

        _this.init = function (json) {
            _this.setSettingsByObject(json);
            _this.setVars();
        };

        _this.setVars = function () {
            if (FXStreet.Class.Seo[_this.ListSeoClassType])
                _this.ListSeoObj = new FXStreet.Class.Seo[_this.ListSeoClassType]();
            if (FXStreet.Class.Seo[_this.HomeSeoClassType])
                _this.HomeSeoObj = new FXStreet.Class.Seo[_this.HomeSeoClassType]();

            if (FXStreet.Class.Analytics[_this.ListAnalyticsClassType])
                _this.ListAnalyticsObj = new FXStreet.Class.Analytics[_this.ListAnalyticsClassType]();
            if (FXStreet.Class.Analytics[_this.HomeAnalyticsClassType])
                _this.HomeAnalyticsObj = new FXStreet.Class.Analytics[_this.HomeAnalyticsClassType]();

            initHomeMetaTagsObject();
        };

        var initHomeMetaTagsObject = function () {
            var metaTags = findMetaTagsInDocument();
            _this.HomeMetaTagsObj = FXStreet.Class.Patterns.Singleton.SeoMetaTags.Instance();
            _this.HomeMetaTagsObj.initHomeMetaTagsObject(metaTags);
        };

        var findMetaTagsInDocument = function () {
            var result = {
                FullUrl: $("meta[property='og\\:url']").attr('content'),
                Image: $("meta[property='og\\:image']").attr('content'),
                MetaTitle: $("meta[property='og\\:title']").attr('content'),
                Summary: $("meta[property='og\\:description']").attr('content'),
                Keywords: $("meta[property='og\\:keywords']").attr('content')
            };

            return result;
        };

        var ensureHomeSeoObject = function () {
            if (_this.HomeSeoLanguageObj === null) {
                _this.HomeSeoLanguageObj = {};
            }
            _this.HomeSeoLanguageObj.FullUrl = _this.HomeMetaTagsObj.FullUrl;
            _this.HomeSeoLanguageObj.Image = _this.HomeMetaTagsObj.Image;
            _this.HomeSeoLanguageObj.MetaTitle = _this.HomeMetaTagsObj.MetaTitle;
            _this.HomeSeoLanguageObj.Summary = _this.HomeMetaTagsObj.Summary;
            _this.HomeSeoLanguageObj.Keywords = _this.HomeMetaTagsObj.Keywords;
        };

        _this.SetSeo = function (item) {
            if (item.id === _this.HomeId) {
                ensureHomeSeoObject();
                _this.HomeSeoObj.updateMetaTags(_this.HomeSeoLanguageObj);
            } else {
                var section = $(item).find('section');
                var id = section.attr("fxs-it-id");
                var renderizableItem = _this.Sidebar_ListObj.getRenderizableItemById(id);

                if (renderizableItem != null) {
                    _this.ListSeoObj.updateMetaTags(renderizableItem, _this.FullPageUrl);
                }
            }
        };

        _this.SetAnalytics = function (item, byScroll) {
            if (item.id === _this.HomeId) {
                _this.HomeAnalyticsObj.updateDinamicLayer(item);
            } else {
                var section = $(item).find('section');
                var id = section.attr("fxs-it-id");
                var renderizableItem = _this.Sidebar_ListObj.getRenderizableItemById(id);

                if (renderizableItem != null) {
                    _this.ListAnalyticsObj.updateDinamicLayer(item, renderizableItem, byScroll);
                }
            }
        };
        
        return _this;
    };
}());
(function () {
    FXStreet.Class.SignUp = function () {

        var parent = FXStreet.Class.Base(),
        _this = FXStreet.Util.extendObject(parent);

        _this.ContainerId = "";

        _this.SignupUrl = FXStreet.Resource.FxsApiRoutes["RegisterUserUrl"];
        _this.CountriesApiUrl = FXStreet.Resource.FxsApiRoutes["CountryApiGetAll"];

        _this.EmailSignupTextboxId = 'emailSignupTB';
        _this.PasswordSignupTextboxId = 'passwordSignupTB';
        _this.PhoneSignupTextboxId = 'phoneSignupTB';
        _this.TermsCheckBoxId = 'termsCB';
        _this.FullNameSignupTextboxId = 'fullnameSignupTB';
        _this.PhoneCodeTextboxId = 'phoneCodeSignupTB';
        _this.SignupPasswordEyeId = 'signupPasswordEyeId';
        _this.CountrySignupDropDown = 'countrySignupDDL';
        _this.FormId = 'fxs_signup_form_';
        _this.ResponseSignUpId = "responseSignup";
        _this.SubmitButtonId = 'submitButtonId';

        _this.FullNameContainerId = 'fxs_fullname_container_';
        _this.PhoneContainerId = 'fxs_phone_container_';
        _this.EmailContainerId = 'fxs_email_container_';
        _this.PasswordContainerId = 'fxs_password_container_';
        _this.TermsContainerId = 'fxs_terms_container_';
        _this.EmailServerErrorContainerId = 'fxs_email_server_error_container_';

        _this.SignUpHtmlTemplateFile = "signup.html";
        _this.SignUpOkHtmlTemplateFile = "signup_confirmation.html";
        
        _this.SingupNewslettersSubscription = 'singupNewslettersSubscription';
        _this.FxsUserErrorClass = "fxs_user_field_error";
        _this.FxsDisabledFieldsClass = "fxs_disbale_fields";

        _this.Container = null;
        _this.EmailSignupTextbox = null;
        _this.PasswordSignupTextbox = null;
        _this.PhoneSignupTextbox = null;
        _this.FullNameSignupTextbox = null;
        _this.PhoneCodeTextbox = null;
        _this.SignupPasswordEye = null;
        _this.Form = null;
        _this.Validator = null;
        _this.RegisterData = null;
        _this.PhoneContainer = null;
        _this.EmailContainer = null;
        _this.EmailServerErrorContainer = null;
        _this.PasswordContainer = null;
        _this.SubmitButton = null;
        _this.TermsCheckBox = null;
        _this.Translations = null;

        _this.Messages = { SignupError: '', DuplicatedMail: '', DuplicatedUserName: '', Success: '', InvalidPassword: '' };

        _this.init = function (json) {
            _this.setSettingsByObject(json);
            _this.render(json);
        };

        _this.render = function (jsonData) {
            _this.htmlRender(jsonData);
        };

        _this.htmlRender = function (jsonData) {
            FXStreet.Util.loadHtmlTemplate(_this.SignUpHtmlTemplateFile).done(function (template) {
                var rendered = FXStreet.Util.renderByHtmlTemplate(template, jsonData);

                _this.Container = FXStreet.Util.getjQueryObjectById(_this.ContainerId);
                _this.Container.html(rendered);

                _this.setVars(jsonData);
                _this.addEvents();
            });
        };

        _this.setVars = function (json) {

            _this.EmailSignupTextbox = FXStreet.Util.getjQueryObjectById(_this.EmailSignupTextboxId);
            _this.PasswordSignupTextbox = FXStreet.Util.getjQueryObjectById(_this.PasswordSignupTextboxId);
            _this.PhoneSignupTextbox = FXStreet.Util.getjQueryObjectById(_this.PhoneSignupTextboxId);
            _this.FullNameSignupTextbox = FXStreet.Util.getjQueryObjectById(_this.FullNameSignupTextboxId);
            _this.PhoneCodeTextbox = FXStreet.Util.getjQueryObjectById(_this.PhoneCodeTextboxId);
            _this.CountrySignupSelect = FXStreet.Util.getjQueryObjectById(_this.CountrySignupDropDown);

            _this.SubmitButton = FXStreet.Util.getjQueryObjectById(_this.SubmitButtonId);
            _this.PhoneContainer = FXStreet.Util.getjQueryObjectById(_this.PhoneContainerId);
            _this.EmailContainer = FXStreet.Util.getjQueryObjectById(_this.EmailContainerId);
            _this.EmailServerErrorContainer = FXStreet.Util.getjQueryObjectById(_this.EmailServerErrorContainerId);
            _this.FullNameContainer = FXStreet.Util.getjQueryObjectById(_this.FullNameContainerId);
            _this.PasswordContainer = FXStreet.Util.getjQueryObjectById(_this.PasswordContainerId);
            _this.TermsCheckBox = FXStreet.Util.getjQueryObjectById(_this.TermsCheckBoxId);
            _this.TermsContainer = FXStreet.Util.getjQueryObjectById(_this.TermsContainerId);
            _this.SignupPasswordEye = FXStreet.Util.getjQueryObjectById(_this.SignupPasswordEyeId);

            _this.GetAllUpdatesCheckbox = FXStreet.Util.getjQueryObjectById(_this.SingupNewslettersSubscription);

            _this.Form = FXStreet.Util.getjQueryObjectById(_this.FormId +_this.ContainerId);
            
            _this.LoginRegistering = json.Translations.RegisteringLabel;
            _this.LoginSignUp = json.Translations.SignupNowLabel;
            _this.Translations =json.Translations;

            _this.PhoneValid = false;
            _this.Validator =_this.Form.validate({submitHandler: _this.SubmitForm,
                                                  invalidHandler: _this.InvalidForm,
                                                  errorPlacement: function () {} });
        }
     
        _this.signupSuccess = function (response) {
            switch (response)
            {
                case 'Success':
                    _this.NewslettersSubscribeAtSignUp(_this.RegisterData);

                    var jsonData = {
                        UserName: _this.FullNameSignupTextbox.val(),
                        UserEmail: _this.EmailSignupTextbox.val(),
                        Translations: _this.Translations
                    };
                    FXStreet.Util.loadHtmlTemplate(_this.SignUpOkHtmlTemplateFile).done(function (template) {
                        var rendered = FXStreet.Util.renderByHtmlTemplate(template, jsonData);
                        _this.Container = FXStreet.Util.getjQueryObjectById(_this.ContainerId);
                        _this.Container.html(rendered);
                    });
                    break;
                case 'DuplicateEmail':
                case 'DuplicateUserName':
                    _this.EmailServerErrorContainer.addClass(_this.FxsUserErrorClass);
                    break;
                case 'InvalidPassword':
                    _this.PasswordContainer.addClass(_this.FxsUserErrorClass);
                    break;
                default:
                    //Response Message error by default
                    break;
            }
            _this.SubmitButton.html(_this.LoginSignUp);
        };

        _this.NewslettersSubscribeAtSignUp = function (data) {
            if (_this.GetAllUpdatesCheckbox[0].checked) {
                var newslettersList = _this.GetAllUpdatesCheckbox.data("newsletters-list").split(";");
                var email = data.Email;

                _this.NewsletterSubscriber = new FXStreet.Class.NewslettersSubscriber();
                _this.NewsletterSubscriber.init({});

                _this.NewsletterSubscriber.NewsletterFollow = newslettersList;
                _this.NewsletterSubscriber.NewsletterUnfollow = [];
                _this.NewsletterSubscriber.Email = email;

                _this.NewsletterSubscriber.SendToEventHub();
            }
        };

        var validationElement = function(elementId, container) {
            if (!_this.Validator.element('#' + elementId))
            {
                container.addClass(_this.FxsUserErrorClass);
            } else 
            {
                container.removeClass(_this.FxsUserErrorClass);
            }
        }

        _this.InvalidForm = function () {

            validationElement(_this.FullNameSignupTextboxId, _this.FullNameContainer);
            validationElement(_this.PasswordSignupTextboxId, _this.PasswordContainer);
            validationElement(_this.EmailSignupTextboxId, _this.EmailContainer);
            validationElement(_this.PhoneSignupTextboxId, _this.PhoneContainer);
            validationElement(_this.TermsCheckBoxId, _this.TermsContainer);

            _this.Validator.checkForm();
            _this.RegisterData = null;
        };

        _this.addEvents = function () {
            $(_this.PhoneSignupTextbox).focusout(function () { validatePhoneNumber(); });
            $(_this.PhoneCodeTextbox).focusout(function () { if (_this.PhoneSignupTextbox.val()) { validatePhoneNumber(); } });

            $(_this.CountrySignupSelect).change(function () {
                if (_this.CountrySignupSelect.val()) {
                    _this.PhoneCodeTextbox[0].value = _this.CountrySignupSelect.val();
                    _this.PhoneContainer.removeClass(_this.FxsDisabledFieldsClass);

                    if (_this.PhoneSignupTextbox.val()) {
                        validatePhoneNumber();
                    }
                }
            });

            $(_this.SignupPasswordEye).click(function () {
                $(_this.SignupPasswordEye).toggleClass("active");
                var type = "type";
                var passwordType = "password";
                var textType = "text";

                if ($(_this.PasswordSignupTextbox).attr(type) === passwordType)
                {
                    $(_this.PasswordSignupTextbox).attr(type, textType);
                }
                else
                {
                    $(_this.PasswordSignupTextbox).attr(type, passwordType);
                }
            });

            $(_this.FullNameSignupTextbox).focusout(function () { validationElement(_this.FullNameSignupTextboxId, _this.FullNameContainer); });
            $(_this.PasswordSignupTextbox).focusout(function () { validationElement(_this.PasswordSignupTextboxId, _this.PasswordContainer); });
            $(_this.EmailSignupTextbox).focusout(function () { validationElement(_this.EmailSignupTextboxId, _this.EmailContainer); });
            $(_this.PhoneSignupTextbox).focusout(function () { validationElement(_this.PhoneSignupTextboxId, _this.PhoneContainer); });
            $(_this.TermsCheckBox).click(function () { validationElement(_this.TermsCheckBoxId, _this.TermsContainer); });

            if (_this.CountrySignupSelect.find('option').length === 1)
            {
                $.ajax({
                    type: "GET",
                    url: _this.CountriesApiUrl + '?cultureName=' + FXStreet.Resource.CultureName,
                    contentType: "application/json; charset=utf-8",
                    dataType: "json"
                }).done(function (countries) {
                    $.each(countries, function (key, value) {
                        var phoneCodeStr = '+' + value.PhoneCode;
                        _this.CountrySignupSelect.append($('<option>', { value: phoneCodeStr }).text(value.Title));
                    });
                });
            }
        };

        _this.SubmitForm = function () {
            validatePhoneNumber(submitUserForm);
            return false;
        };

        var getCompletePhoneNumber = function () {
            var phoneCode = _this.PhoneCodeTextbox.val().replace(/[() ]/g, '');

            var result = phoneCode + _this.PhoneSignupTextbox.val();
            return result;
        }

        var validatePhoneNumber = function (callback) {
            var phone = encodeURIComponent(getCompletePhoneNumber());
            
            var auth = FXStreet.Class.Patterns.Singleton.Authorization.Instance();
            auth.getTokenPromise().then(function (token) {
                $.ajax({
                    type: "GET",
                    url: FXStreet.Resource.PhoneServiceUrl.format(phone),
                    beforeSend: function (xhr) {
                        xhr.setRequestHeader("Authorization", token.token_type + ' ' + token.access_token);
                    }
                })
                .done(function (phoneData) {
                    if (phoneData && phoneData.IsPhoneValid) {
                        _this.PhoneContainer.removeClass(_this.FxsUserErrorClass);
                        _this.PhoneValid = true;
                        if (callback) callback(_this.PhoneValid);
                    }})
                .fail(function () {
                    _this.PhoneContainer.addClass(_this.FxsUserErrorClass);
                    _this.PhoneValid = false;
                    if (callback) callback(_this.PhoneValid);
                });
            });
        }

        function getParameterByName(name, url) {
            if (!url) { url = window.location.href; }

            name = name.replace(/[\[\]]/g, "\\$&");
            var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
                results = regex.exec(url);
            if (!results) return null;
            if (!results[2]) return '';
            return decodeURIComponent(results[2].replace(/\+/g, " "));
        }

        var getUriToRedirect = function() {
            var result = getParameterByName('uriToRedirect');
            return result;
        };

        var submitUserForm = function (isValidPhone) {


            _this.SubmitButton.html(_this.LoginRegistering);
            _this.EmailServerErrorContainer.removeClass(_this.FxsUserErrorClass);

            if (!isValidPhone) return;
            _this.RegisterData = {Password: _this.PasswordSignupTextbox.val(),
                                  Email: _this.EmailSignupTextbox.val(),
                                  Phone: getCompletePhoneNumber(),
                                  FullName: _this.FullNameSignupTextbox.val(),
                                  UriToRedirect: getUriToRedirect()
            };
            $.ajax({
                type: "POST",
                url: _this.SignupUrl,
                data: JSON.stringify(_this.RegisterData),
                contentType: "application/json; charset=utf-8",
                dataType: "json"
            }).done(_this.signupSuccess);
        };

        return _this;
    };
}());
(function () {
    FXStreet.Class.Patterns.Singleton.SocialMediaOptions = null;

    FXStreet.Class.SocialMediaBar = function () {
        var parent = FXStreet.Class.Base(),
            _this = FXStreet.Util.extendObject(parent);

        // ----- begin json properties -----
        _this.ContainerId = "";
        _this.ItemUrl = "";
        _this.ItemTitle = "";
        _this.PageUrl = "";

        // ----- end json properties -----
        _this.Container = null;
        _this.HtmlTemplateFile = "";

        _this.init = function (json) {
            _this.setSettingsByObject(json);
            _this.setVars();
            _this.loadSocialMedia(_this.GetSocialMediaOptions());
        };

        _this.GetSocialMediaOptions = function () {
            return FXStreet.Resource.SocialMediaBar;
        };

        _this.setVars = function () {
            _this.Container = FXStreet.Util.getjQueryObjectById(_this.ContainerId);
        };

        _this.setCssClasses = function (socialMediaChannels) {
            if (socialMediaChannels !== undefined) {
                for (var i = 0; i < socialMediaChannels.length; i++) {
                    if (socialMediaChannels[i].Name.toLowerCase().indexOf("facebook") > -1) {
                        socialMediaChannels[i].CssClass = "fa fa-facebook";
                    } else if (socialMediaChannels[i].Name.toLowerCase().indexOf("twitter") > -1) {
                        socialMediaChannels[i].CssClass = "fa fa-twitter";
                    } else if (socialMediaChannels[i].Name.toLowerCase().indexOf("google") > -1) {
                        socialMediaChannels[i].CssClass = "fa fa-google";
                    } else if (socialMediaChannels[i].Name.toLowerCase().indexOf("linkedin") > -1) {
                        socialMediaChannels[i].CssClass = "fa fa-linkedin";
                    }
                }
            }
        };

        _this.loadSocialMedia = function (socialMediaResponse) {
            var socialMediaChannels = socialMediaResponse.SocialMediaChannels;

            _this.setCssClasses(socialMediaChannels);
            FXStreet.Class.Patterns.Singleton.SocialMediaOptions = socialMediaResponse;

            var validDataUrl = _this.excludeEmptyUrl(socialMediaResponse);
            var jsonData = _this.getJsonFormattedForMustache(validDataUrl);

            FXStreet.Util.loadHtmlTemplate(_this.HtmlTemplateFile).done(function (template) {
                var rendered = FXStreet.Util.renderByHtmlTemplate(template, jsonData);
                _this.Container.html(rendered);
            });

        };

        _this.excludeEmptyUrl = function(socialMediaResponse) {
            
        };

        _this.setCustomParamsToShare = function (data, socialMediaResponseChannels) {
       
            socialMediaResponseChannels.forEach(function (item) {
                item.urlCustomParams = data.ItemUrl;
            });

            var socialMediasToCustom = $.grep(socialMediaResponseChannels, function (socialMedia) {
                return socialMedia.Name.toLowerCase().indexOf('twitter') !== -1;
            });

            socialMediasToCustom.forEach(function (item) {
                item.urlCustomParams = FXStreet.Util.EncodeUrl(data.ItemTitle) + '%0A' + data.ItemUrl;
            });
            
            return socialMediaResponseChannels;
        };

        _this.getJsonFormattedForMustache = function (socialMediaResponse) {
            return socialMediaResponse;
        };

        return _this;
    };
    FXStreet.Class.SocialMediaBarDefault = function () {
        var parent = FXStreet.Class.SocialMediaBar(),
            _this = FXStreet.Util.extendObject(parent);

        parent.HtmlTemplateFile = "socialmediabar_default.html";

        parent.getJsonFormattedForMustache = function (socialMediaResponse) {
            var socialMediaChannels = parent.setCustomParamsToShare(parent, socialMediaResponse.SocialMediaChannels);
            var socialMediaChannelsShowed = socialMediaChannels.slice(0, 2);
            var socialMediaChannelsHidden = socialMediaChannels.slice(2, socialMediaChannels.length);
            var jsonData = {
                "SocialMediaChannelsShowed": socialMediaChannelsShowed,
                "SocialMediaChannelsHidden": socialMediaChannelsHidden,
                "ShareDisplay": socialMediaResponse.ShareDisplay,
                "MoreOptionsDisplay": socialMediaResponse.MoreOptionsDisplay
            };
            return jsonData;
        };

        parent.excludeEmptyUrl = function (socialMediaResponse) {
            var result = [];
            $.each(socialMediaResponse.SocialMediaChannels, function (index, item) {
                if (item.ShareUrl != null && item.ShareUrl != "") {
                    result.push(item);
                }
            });
            var response = socialMediaResponse;
            response.SocialMediaChannels = result;
            return response;
        };

        return _this;
    };
    FXStreet.Class.SocialMediaBarBoxed = function () {
        var parent = FXStreet.Class.SocialMediaBar(),
            _this = FXStreet.Util.extendObject(parent);

        parent.HtmlTemplateFile = "socialmediabar_boxed.html";

        parent.getJsonFormattedForMustache = function (socialMediaResponse) {
            var jsonData = {
                "PageUrl": parent.PageUrl,
                "ItemTitle": FXStreet.Util.EncodeUrl(parent.ItemTitle),
                "SocialMediaChannels": socialMediaResponse.SocialMediaChannels,
                "ShareOptions": socialMediaResponse.ShareOptionsDisplay
            };
            return jsonData;
        };

        parent.loadHtmlTemplateSuccessComplete = function () {

        };

        parent.excludeEmptyUrl = function (socialMediaResponse) {
            var result = [];
            $.each(socialMediaResponse.SocialMediaChannels, function (index, item) {
                if (item.ShareUrl != null && item.ShareUrl != "") {
                    result.push(item);
                }
            });
            var response = socialMediaResponse;
            response.SocialMediaChannels = result;
            return response;
        };

        return _this;
    };

    FXStreet.Class.SocialMediaBarProfile = function () {
        var parent = FXStreet.Class.SocialMediaBar(),
            _this = FXStreet.Util.extendObject(parent);

        parent.HtmlTemplateFile = "socialmediabar_profile.html";
        _this.SocialMediaBarData = {};

        var initBase = parent.init;
        parent.init = function (json) {
            _this.setSettingsByObject(json);
            initBase(json);
        };

        parent.GetSocialMediaOptions = function () {
            var jsonData = {
                "SocialMediaChannels": _this.SocialMediaBarData
            };
            return jsonData;
        };

        parent.loadHtmlTemplateSuccessComplete = function () {

        };

        parent.excludeEmptyUrl = function (socialMediaResponse) {
            var result = [];
            $.each(socialMediaResponse.SocialMediaChannels, function (index, item) {
                if (item.ProfileUrl != null && item.ProfileUrl != "") {
                    result.push(item);
                }
            });
            var response = socialMediaResponse;
            response.SocialMediaChannels = result;
            return response;
        };

        return _this;
    };
}());
(function() {
    FXStreet.Class.Sound = function() {
        var parent = FXStreet.Class.Base(),
            _this = FXStreet.Util.extendObject(parent);

        //#region Json properties
        _this.SoundUrl = null;
        //#endregion

        var Audio = null;

        _this.init = function(json) {
            _this.setSettingsByObject(json);
            _this.setVars();
        };

        _this.setVars = function() {
            createAudioObject();
        };

        var createAudioObject = function() {
            Audio = document.createElement('audio');
            Audio.setAttribute('src', _this.SoundUrl);
        };

        _this.playSound = function () {
            Audio.play();
        };

        return _this;
    };
}());
(function () {
    FXStreet.Class.Patterns.Singleton.StickyManager = (function () {
        var instance;

        var stickyManager = function () {
            var parent = FXStreet.Class.Base(),
            _this = FXStreet.Util.extendObject(parent);

            _this.StickyItemsClass = '.sticky';
            _this.StickyContentSelector = '.sticky-holder';

            var responsiveDesignObj = null;
            var minWidthForSticky = 680;
            var stickyTopPx = 55;

            _this.init = function (json) {
                _this.setSettingsByObject(json);
                _this.setVars();
            };

            _this.setVars = function () {
                responsiveDesignObj = FXStreet.Util.getObjectInstance("ResponsiveDesign");
            };

            _this.setSticky = function (stickyElements, stickyContentSlctor) {
                var width = responsiveDesignObj ? responsiveDesignObj.getWindowWidth() : minWidthForSticky;

                if (width >= minWidthForSticky) {
                    var elementsToStick = stickyElements || $(_this.StickyItemsClass);
                    var scc = stickyContentSlctor || _this.StickyContentSelector;

                    var fixedClass = 'fxs-fixto-fixed';
                    elementsToStick = elementsToStick.not('.' + fixedClass);

                    if (elementsToStick.length > 0) {
                        elementsToStick.fixTo(scc, { top: stickyTopPx });
                        elementsToStick.addClass(fixedClass);
                    }
                }
            }

            return _this;
        };

        function createInstance() {
            var object = stickyManager();
            object.init({});
            return object;
        }

        return {
            Instance: function () {
                if (!instance) {
                    instance = createInstance();
                }
                return instance;
            }
        };
    })();
}());
(function () {
    FXStreet.Class.NewslettersSubscriber = function () {
        var parent = FXStreet.Class.Base(),
            _this = FXStreet.Util.extendObject(parent);

        _this.Email = "";
        _this.CountryCode = "";
        _this.FollowingClass = "";
        _this.NewsletterFollow = [];
        _this.NewsletterUnfollow = [];

        _this.init = function (json) {
            _this.setSettingsByObject(json);
        };

        _this.SendToEventHub = function () {
            var data = {
                "ActionEmail": _this.Email,
                "LanguageId": FXStreet.Resource.LanguageId,
                "NewsletterFollow": _this.NewsletterFollow,
                "NewsletterUnfollow": _this.NewsletterUnfollow,
                "CountryCode": _this.CountryCode
            };

            var tagManager = FXStreet.Class.Patterns.Singleton.TagManager.Instance();
            tagManager.PushToEventhub(data, "Newsletter");
        };

        return _this;
    };
    FXStreet.Class.SubscribeToNewsletter = function () {
        var parent = FXStreet.Class.Base(),
            _this = FXStreet.Util.extendObject(parent);

        _this.ContainerId = '';
        _this.NewsletterFollow = [];
        _this.NewsletterUnfollow = [];
        _this.Email = '';
        _this.CountryCode = '';
        _this.WidgetType = '';
        _this.DefaultNewslettersIds = [];
        _this.Newsletters = [];

        _this.CheckNewslettersBeforeSend = null;
        _this.CheckboxGetAll = null;
        _this.Container = null;
        _this.TextBox = null;
        _this.SuccessMessageDiv = null;
        _this.ErrorMessageDiv = null;
        _this.SubmitButton = null;
        _this.CheckboxItems = null;
        _this.CheckboxGroup = 'newsletters';
        _this.CheckboxGetAllId = '00000000-0000-0000-0000-000000000000';
        _this.SaveSubscribedNewslettersCookie = null;
        _this.Recaptcha = null;

        var hideDropdownClass = "";

        _this.init = function (json) {
            _this.setSettingsByObject(json);
            _this.setVars();
            _this.htmlRender(json);
        };

        _this.setVars = function () {
            if (!_this.WidgetType) {
                _this.WidgetType = 'fxs_widget_default';
            };
            _this.Container = FXStreet.Util.getjQueryObjectById(_this.ContainerId);
            _this.HtmlTemplateFile = getTemplateName(_this.WidgetType);
            _this.DefaultNewslettersIds = getDefaultNewslettersIds();
            setInitialCheckedNewsletters();

            if (_this.WidgetType === 'fxs_widget_light') {
                hideDropdownClass = 'fxs_hideElements';
            } else {
                hideDropdownClass = 'fxs_dBlock';
            }
        };

        var getTemplateName = function (widgetType) {
            var templates = {
                'fxs_widget_mini': 'subscribe_mini.html',
                'fxs_widget_default': 'subscribe_default.html',
                'fxs_widget_big': 'subscribe_big.html',
                'fxs_widget_tab': 'subscribe_tab.html',
                'fxs_widget_light': 'subscribe_light.html'
            };
            return templates[widgetType];
        }

        var setInitialCheckedNewsletters = function () {
            var subscribedNewsletters = $.grep(_this.Newsletters, function (newsletter) {
                return newsletter.Subscribed;
            });
            if (subscribedNewsletters.length === 0 && !_this.Email) {
                $.each(_this.Newsletters, function () {
                    this.Subscribed = true;
                });
            }
        }

        var getDefaultNewslettersIds = function () {
            var defaultNewsletters = $.grep(_this.Newsletters, function (newsletter) {
                return newsletter.Default;
            });
            return defaultNewsletters.map(function (newsletter) { return newsletter.Id; });
        }

        _this.addEvents = function () {
            _this.TextBox.on('keydown', _this.textBoxKeyDown);
            _this.SubmitButton.on('click', _this.Submit);
            _this.CheckboxGetAll.on('change', _this.selectAll);
            _this.CheckboxItems.on('change', _this.unSelectAll);
            if (_this.DropdownButton) {
                _this.DropdownButton.on('click',
                    function () {
                        _this.DropDownNewsletters.toggleClass(hideDropdownClass);
                    });
            }
        };

        var initExternalComponents = function () {
            initSubscribeToNewsletter();
            initRecaptcha();
        }

        _this.htmlRender = function (jsonData) {
            FXStreet.Util.loadHtmlTemplate(_this.HtmlTemplateFile).done(function (template) {
                _this.onRendered(template, jsonData);
            });
        };

        _this.onRendered = function (template, jsonData) {
            var rendered = FXStreet.Util.renderByHtmlTemplate(template, jsonData);
            _this.Container.html(rendered);
            _this.TextBox = FXStreet.Util.getjQueryObjectById('inputMail_' + _this.ContainerId);
            _this.TextBox.val(_this.Email);
            _this.SubmitButton = FXStreet.Util.getjQueryObjectById('submit_' + _this.ContainerId);
            _this.CheckboxGetAll = _this.Container.find("input:checkbox[name=" + _this.CheckboxGroup + "][value=" + _this.CheckboxGetAllId + "]");
            _this.CheckboxItems = _this.Container.find("input:checkbox[name=" + _this.CheckboxGroup + "][value!=" + _this.CheckboxGetAllId + "]");
            _this.SuccessMessageDiv = _this.Container.find('#successMessageDiv_' + _this.ContainerId);
            _this.ErrorMessageDiv = _this.Container.find('#errorMessageDiv_' + _this.ContainerId);
            _this.ErrorCaptchaMessageDiv = _this.Container.find('#errorCaptchaMessageDiv_' + _this.ContainerId);

            if ($('#dropdownNewsletters_' + _this.ContainerId).length > 0) {
                _this.DropDownNewsletters = FXStreet.Util.getjQueryObjectById('dropdownNewsletters_' + _this.ContainerId);
                _this.DropdownButton = FXStreet.Util.getjQueryObjectById('dropdownButton_' + _this.ContainerId);
            }
            _this.addEvents();
            initExternalComponents();
        };


        var initSubscribeToNewsletter = function () {
            var json = {
                Email: _this.Email,
                CountryCode: _this.CountryCode
            };

            _this.NewsletterSubscriber = new FXStreet.Class.NewslettersSubscriber();
            _this.NewsletterSubscriber.init(json);
        };


        var initRecaptcha = function () {
            var data = {
                ContainerId: 'recaptcha_' + _this.ContainerId,
                Config: {
                    Callback: _this.Subscribe
                }
            }
            _this.Recaptcha = new FXStreet.Class.Recaptcha();
            _this.Recaptcha.init(data);
        };


        _this.selectAll = function () {
            _this.CheckboxItems.each(function (index, element) {
                element.checked = _this.CheckboxGetAll.prop('checked');
            });
        }

        _this.unSelectAll = function () {
            if (_this.CheckboxGetAll.prop('checked')) {
                $(_this.CheckboxGetAll.prop('checked', false));
            }
        }

        _this.textBoxKeyDown = function (e) {
            if (e.keyCode === 13) {
                _this.textBoxEnter();
            }
        };

        _this.Submit = function (e) {
            if (_this.DropDownNewsletters) {
                if (_this.WidgetType === 'fxs_widget_light') {
                    _this.DropDownNewsletters.addClass(hideDropdownClass);
                } else {
                    _this.DropDownNewsletters.removeClass(hideDropdownClass);
                }
            }
            if (preSubmit()) {
                _this.Recaptcha.Execute();
            }
            return false;
        }

        _this.Subscribe = function () {
            if (preSubscribe()) {
                _this.NewsletterSubscriber.SendToEventHub();
                postSubscribe();
            }
            _this.Recaptcha.Reset();
        }

        var preSubmit = function () {
            $(_this.SuccessMessageDiv).hide();
            $(_this.ErrorMessageDiv).hide();
            $(_this.ErrorCaptchaMessageDiv).hide();


            if (_this.TextBox.valid()) {
                _this.Email = _this.TextBox.val();
                return true;
            } else {
                $(_this.ErrorMessageDiv).show();
                return false;
            }
        };

        var preSubscribe = function () {
            if (!_this.Recaptcha.GetResponse()) {
                $(_this.ErrorCaptchaMessageDiv).show();
                return false;
            }

            checkNewslettersBeforeSend();
            _this.NewsletterSubscriber.NewsletterFollow = _this.NewsletterFollow;
            _this.NewsletterSubscriber.NewsletterUnfollow = _this.NewsletterUnfollow;
            _this.NewsletterSubscriber.Email = _this.Email;

            return preSubmit();
        };

        var postSubscribe = function () {
            saveSubscribedNewslettersCookie();
            $(_this.SuccessMessageDiv).show().delay(5000).hide(0);
            _this.Recaptcha.Reset();
        };

        var checkNewslettersBeforeSend = function () {
            _this.NewsletterFollow = [];
            _this.NewsletterUnfollow = [];
            _this.Container.find("input:checkbox[name=" + _this.CheckboxGroup + "]").each(function () {
                if ($(this).attr('value') !== _this.CheckboxGetAllId) {
                    if ($(this).is(':checked')) {
                        _this.NewsletterFollow.push($(this).attr('value'));
                    }
                    else {
                        _this.NewsletterUnfollow.push($(this).attr('value'));
                    }
                }
            });

            addDefaultNewsletters();
        };

        var addDefaultNewsletters = function () {
            if (_this.NewsletterFollow.length > 0) {
                _this.NewsletterFollow = $.merge(_this.DefaultNewslettersIds, _this.NewsletterFollow);
            } else {
                _this.NewsletterUnfollow = $.merge(_this.DefaultNewslettersIds, _this.NewsletterUnfollow);
            }
        }

        var saveSubscribedNewslettersCookie = function () {
            var cookieManager = FXStreet.Class.Patterns.Singleton.FxsCookiesManager.Instance();
            cookieManager.UpdateCookie(FXStreet.Util.FxsCookie.SubscribedNewsletters, JSON.stringify(_this.NewsletterFollow), 20 * 365);
        }


        _this.textBoxEnter = function () {
            _this.SubmitButton.click();
        };

        return _this;
    };
}());
(function () {

    FXStreet.Class.Survey = {};

    FXStreet.Class.Survey.Base = function () {
       
        // Function to add event listener to t
        function load() {

            var data = sessionStorage.getItem('clickCount');
            if (data === null || data === undefined) {
                data = 1;
                sessionStorage.setItem('clickCount', data);
            }
            else {
                data = parseInt(data) + 1;
                sessionStorage.setItem('clickCount', data);
            }
            if (data === 12) {
                var dataLayerElement = {
                    "Id": "monkey",
                    "event": "survey",
                };

                var tagManager = FXStreet.Class.Patterns.Singleton.TagManager.Instance();
                tagManager.Push(dataLayerElement);

                sessionStorage.setItem('clickCount', 0);
            }

        }

        document.addEventListener("click", load, false);
       
    };
}());
(function () {
    FXStreet.Class.Patterns.Singleton.TagManager = (function () {
        var instance;

        var tagManager = function () {
            var parent = FXStreet.Class.Base(),
           _this = FXStreet.Util.extendObject(parent);

            _this.Push = function (json) {
                if (json !== null) {
                    json['userId'] = FXStreet.Resource.UserId;
                    json['userSessionId'] = getUserSessionId();

                    dataLayer.push(json);
                }
            };

            _this.PushToEventhub = function (data, type) {
                if (data != null) {
                    data['LoggedUserEmail'] = FXStreet.Resource.UserInfo.Email;
                    data['UserSessionId'] = getUserSessionId();
                    data['CountryCode'] = FXStreet.Resource.UserInfo.CountryCode;
                    
                    var json = {
                        "event": "eventhub",
                        "eventHubData": data,
                        "eventType": type
                    };

                    dataLayer.push(json);
                }     
            };

            var getUserSessionId = function () {
                var cookieManager = FXStreet.Class.Patterns.Singleton.FxsCookiesManager.Instance();
                var result = cookieManager.GetCookieValue(FXStreet.Util.FxsCookie.UserSessionId);
                return result;
            };

            return _this;
        };

        function createInstance() {
            var object = tagManager();
            object.init({});
            return object;
        }

        return {
            Instance: function () {
                if (!instance) {
                    instance = createInstance();
                }
                return instance;
            }
        };
    })();
}());
(function () {
    FXStreet.Class.TemplateBase = function () {
        var parent = FXStreet.Class.Base(),
               _this = FXStreet.Util.extendObject(parent);

        _this.SidebarLeft_ShowButtonId = '';
        _this.SidebarLeft_ContainerId = '';
        _this.VerticalMenuId = '';
        _this.HorizontalMenuId = '';

        _this.SidebarLeft_ShowButton = null;
        _this.SidebarLeft_Container = null;
        _this.Body = null;

        _this.WallpaperWrap = null;

        _this.ResponsiveDesignObj = null;
        _this.ScrollPosition = 0;
        _this.CheckScrollPosition = true;
        _this.Content = null;

        var designTeamLimit = 1200;

        _this.init = function (json) {
            _this.setSettingsByObject(json);
            _this.setVars();
            _this.addEvents();
            _this.windowsSubscriber();
            _this.setSticky();
        };

        _this.setVars = function () {
            _this.SidebarLeft_ShowButton = FXStreet.Util.getjQueryObjectById(_this.SidebarLeft_ShowButtonId);
            _this.SidebarLeft_Container = FXStreet.Util.getjQueryObjectById(_this.SidebarLeft_ContainerId);

            _this.Body = $('body');

            _this.ResponsiveDesignObj = FXStreet.Util.getObjectInstance("ResponsiveDesign");

            FXStreet.Util.initObject({
                objType: 'Menu',
                json: {
                    VerticalMenuId: _this.VerticalMenuId,
                    HorizontalMenuId: _this.HorizontalMenuId
                }
            });

            _this.WallpaperWrap = $('.fxs_wallpaper_wrap');
            _this.Content = $('#fxs_content');
        };

        _this.addEvents = function () {
            _this.SidebarLeft_ShowButton.on('click', _this.SidebarLeft_ShowButton_Click);
        };

        function updateScrollPosition(increment) {
            var scrollHeight = _this.Content[0].scrollHeight - _this.Content.height();
            _this.ScrollPosition += increment;
            if (_this.ScrollPosition < 0) {
                _this.ScrollPosition = 0;
            } else if (_this.ScrollPosition > scrollHeight) {
                _this.ScrollPosition = scrollHeight;
            }

            _this.CheckScrollPosition = false;
            _this.Content.stop().animate({ scrollTop: _this.ScrollPosition }, {
                duration: 200,
                done: function () {
                    _this.CheckScrollPosition = true;
                }
            });
        };

        _this.WallpaperWrapMouseWheelEvent = function (e) {
            var scrollIncrement = 100;
            if (e.originalEvent.wheelDelta / 120 > 0) {
                scrollIncrement = -scrollIncrement;
            }
            updateScrollPosition(scrollIncrement);
        };

        _this.WindowKeyDown = function (e) {
            if ((e.which !== 38 && e.which !== 40) || !$(document.activeElement).hasClass('fxs_wallpaper_wrap')) {
                return;
            }

            var up = e.which === 38;
            var scrollIncrement = 90;
            if (up) {
                scrollIncrement = -scrollIncrement;
            }
            updateScrollPosition(scrollIncrement);
        };

        _this.windowsSubscriber = function () {
            if (_this.ResponsiveDesignObj) {
                _this.ResponsiveDesignObj.whenWindowResizesToMobile(_this.ResizeToMobile);
                _this.ResponsiveDesignObj.whenWindowResizesToTablet(_this.ResizeToMobile);
                _this.ResponsiveDesignObj.whenWindowResizesToDesktop(_this.ResizeToDesktop);
            }
        };

        _this.setSticky = function () {
            var minWidthForMobile = 680;
            var isStickyMobileMode = _this.ResponsiveDesignObj.getWindowWidth() < minWidthForMobile;

            function mobileSticky() {
                var mobileStickyButton = FXStreet.Util.getjQueryObjectBySelector('.fxs_stickyAd-mobile-btn');
                mobileStickyButton.on('click',
                    function () {
                        var mobileSticky = FXStreet.Util.getjQueryObjectBySelector('.fxs_stickyAd-mobile');
                        mobileSticky.remove();
                    });

                var jsonAd = {
                    "ContainerId": "fxs_stickyFooterAd",
                    "SlotName": FXStreet.Resource.DfpSlots.FooterMobile,
                    "AdvertiseType": "normal",
                    "RefreshSeconds": 0,
                    "MobileSize": "[320, 50]"
                };
                new FXStreet.Class.AdvertiseNormal().init(jsonAd);
            }


            if (isStickyMobileMode) {
                mobileSticky();
            } else {
                var stickyManager = FXStreet.Class.Patterns.Singleton.StickyManager.Instance();
                stickyManager.setSticky();
            }
        };

        _this.ResizeToMobile = function () {
            _this.setTouch();
        };

        _this.ResizeToDesktop = function () {
            if (typeof _this.removeTouch === "function") {
                _this.removeTouch();
            }
        };

        _this.disableAll = function () {
            _this.SidebarLeft_ShowButton.toggleClass('disable');
        };

        _this.setTouch = function () {
            _this.Body.addClass('fxs_touch');
        };

        _this.removeTouch = function () {
            _this.Body.removeClass('fxs_touch');
        };

        return _this;
    };


    FXStreet.Class.TemplateList = function () {
        var parent = FXStreet.Class.TemplateBase(),
          _this = FXStreet.Util.extendObject(parent);

        _this.ListLeft_ShowButtonId = '';
        _this.ListLeft_ContainerId = '';
        _this.ScrollingContentId = '';
        _this.ScrollingElementSelector = '';
        _this.LoadingMoreId = 'pageLoading';
        _this.HasInfiniteScrollPage = false;

        _this.ListLeft_ShowButton = null;
        _this.ListLeft_Container = null;
        _this.ScrollingContent = null;

        _this.Resources = FXStreet.Resource.Translations['Sidebar_FilterAndList'];

        _this.init = function (json) {
            _this.setSettingsByObject(json);
            parent.init(json);
        };

        _this.setVarsParent = parent.setVars;
        parent.setVars = function () {
            _this.setVarsParent();

            _this.ListLeft_ShowButton = FXStreet.Util.getjQueryObjectById(_this.ListLeft_ShowButtonId);
            _this.ListLeft_Container = FXStreet.Util.getjQueryObjectById(_this.ListLeft_ContainerId);

            if (_this.HasInfiniteScrollPage) {
                FXStreet.Util.initObject({
                    objType: 'InfiniteScrollPage',
                    json: {
                        ScrollingElement: FXStreet.Util.getjQueryObjectBySelector(_this.ScrollingElementSelector),
                        ScrollingContent: _this.ScrollingContent || FXStreet.Util.getjQueryObjectById(_this.ScrollingContentId),
                        LoadingMoreId: _this.LoadingMoreId
                    }
                });
            }

            if (_this.Resources.ShowListLeftButton) {
                _this.ListLeft_ShowButton.find('span').text(_this.Resources.ShowListLeftButton);
            } else {
                console.warn('The ShowListLeftButton field is empty');
            }
        };

        _this.addEventParent = parent.addEvents;
        parent.addEvents = function () {
            _this.addEventParent();
            _this.ListLeft_ShowButton.on('click', _this.ListLeft_ShowButton_Click);
        };

        _this.ListLeft_ShowButton_Click = function () {
            _this.ListLeft_ShowButton.toggleClass('active');
            _this.ListLeft_Container.toggleClass('cbp-spmenu-open');
            _this.SidebarLeft_ShowButton.toggleClass('disabled');
        };

        _this.SidebarLeft_ShowButton_ClickParent = parent.SidebarLeft_ShowButton_Click;
        parent.SidebarLeft_ShowButton_Click = function () {
            _this.SidebarLeft_ShowButton_ClickParent();
            _this.ListLeft_Container.removeClass('cbp-spmenu-open');
            _this.ListLeft_ShowButton.removeClass('active');
            _this.ListLeft_ShowButton.toggleClass('disabled');
        };

        _this.resetMenuParent = parent.resetMenu;
        parent.resetMenu = function () {
            _this.resetMenuParent();
            _this.ListLeft_Container.removeClass('cbp-spmenu-open');
        };

        _this.removeSwipeParent = parent.removeSwipe;
        parent.removeSwipe = function () {
            _this.removeSwipeParent();
            _this.ListLeft_Container.off('swipeleft');
        };

        _this.setSwipeParent = parent.setSwipe;
        parent.setSwipe = function () {
            _this.setSwipeParent();
            if (!_this.ResponsiveDesignObj.IsDesktop()) {
                _this.ListLeft_ShowButton.on('swipeleft', _this.ListLeft_ShowButton_Click);
            }
        };

        return _this;
    };
}());
(function () {
    FXStreet.Class.TextOverCustomImage = function () {
        var parent = FXStreet.Class.Base(),
            _this = FXStreet.Util.extendObject(parent);

        _this.ContainerId = "";
        _this.Container = null;
        _this.Name = "";
        _this.Title = "";
        _this.Summary = "";
        _this.ImageUrl = "";
        _this.TextUrl = "";
        _this.Author = "";
        _this.AuthorUrl = "";
        _this.Sponsored = false;
        _this.SponsoredContent = "";
        _this.ByDisplay = "";

        _this.HtmlTemplateFile = "";
        _this.AlertType = "";

        _this.init = function (json) {
            _this.setSettingsByObject(json);
            _this.setVars();
            _this.htmlRender();
        };

        _this.setVars = function () {
            _this.Container = FXStreet.Util.getjQueryObjectById(_this.ContainerId);
        };

        _this.htmlRender = function () {
            var jsonData = jQuery.extend({}, _this);
            jsonData.HasAuthor = _this.Author !== null && _this.Author !== "";

            FXStreet.Util.loadHtmlTemplate(_this.HtmlTemplateFile).done(function (template) {
                var rendered = FXStreet.Util.renderByHtmlTemplate(template, jsonData);
                _this.Container.html(rendered);
            });
        };

        return _this;
    };
}());
(function () {
    FXStreet.Class.UserMenu = function () {
        var parent = FXStreet.Class.Base(),
            _this = FXStreet.Util.extendObject(parent);

        _this.UserInfo = null;
        _this.SignupUrl = '';
        _this.LoginUrl = '';
        _this.SignupLabel = '';
        _this.LoginLabel = '';
        _this.LogoutLabel = '';
        _this.MySuscriptionsLabel = '';
        _this.ContainerId = '';
        _this.MySuscriptionsUrl = '';

        var logoutButtonId = 'logout';
        var signupButtonId = 'signup';
        var loginButtonId = 'login';
        var userOptionsButtonId = 'user-option-button';
        var userShowButtonId = 'user-show-button';
        var userOptionsId = 'fxs_user_options';
        var userShowId = 'fxs_user_access';
        var logoutUrl = FXStreet.Resource.FxsApiRoutes["LogoutUrl"];
        var usermenu_HtmlTemplateFile = 'usermenu.html';


        var logoutButton = null;
        var signupButton = null;
        var loginButton = null;
        var userOptionsContainer = null;
        var userShowContainer = null;
        var container = null;

        _this.init = function (json) {
            _this.setSettingsByObject(json);
            _this.setVars();
            render();
            _this.addEvents();
        };

        _this.setVars = function () {
            container = FXStreet.Util.getjQueryObjectById(_this.ContainerId);
        };

        var render = function () {
            FXStreet.Util.loadHtmlTemplate(usermenu_HtmlTemplateFile).done(function (template) {
                var rendered = FXStreet.Util.renderByHtmlTemplate(template, _this);
                container.html(rendered);

                setVarsByRender();
            });
        };

        var setVarsByRender = function () {
            if (_this.UserInfo.IsLogged) {
                logoutButton = FXStreet.Util.getjQueryObjectById(logoutButtonId);
                logoutButton.click(logoutButtonClick);

                initUserOptions();
            }
            else {
                signupButton = FXStreet.Util.getjQueryObjectById(signupButtonId);
                loginButton = FXStreet.Util.getjQueryObjectById(loginButtonId);

                signupButton.click(_this.Signup);
                loginButton.click(_this.Login);

                initUserShow();
            }
        }

        var initUserOptions = function () {
            userOptionsContainer = FXStreet.Util.getjQueryObjectById(userOptionsId);

            var userOptionsButton = FXStreet.Util.getjQueryObjectById(userOptionsButtonId);

            userOptionsButton.click(function () {
                userOptionsContainer.toggleClass("fxs_hideElements");
            });

            userOptionsContainer.find(".fa-times").click(function () {
                userOptionsContainer.toggleClass("fxs_hideElements");
            });
        }

        var initUserShow = function () {
            userShowContainer = FXStreet.Util.getjQueryObjectById(userShowId);

            var userShowButton = FXStreet.Util.getjQueryObjectById(userShowButtonId);
            userShowButton.click(function () {
                userShowContainer.toggleClass("fxs_hidden_s");
            });

        }

        var logoutButtonClick = function () {
            $.ajax({
                type: "GET",
                url: logoutUrl
            }).success(function() {
                 location.reload();
            });
        };

        _this.Signup = function () {
            location.href = _this.SignupUrl;
        };

        _this.Login = function () {
            location.href = _this.LoginUrl + '?uriToRedirect=' + location.href;
        };

        return _this;
    };
    FXStreet.Class.ClockZone = function () {
        var parent = FXStreet.Class.Base(),
            _this = FXStreet.Util.extendObject(parent);

        _this.ContainerSelector = '';
        _this.TimeDisplayFormat = '';
        _this.Container = null;
        _this.TimeInput = null;
        _this.HoursUtcOffset = null;
        _this.TimeZoneIsFromUserDevice = false;

        _this.init = function (json) {
            _this.setSettingsByObject(json);
            _this.setVars();
            _this.addEvents();
        };

        _this.setVars = function () {
            _this.Container = FXStreet.Util.getjQueryObjectBySelector(_this.ContainerSelector);
            _this.TimeInput = _this.Container.find('time');
        };

        _this.addEvents = function () {
            _this.Container.on('click', _this.containerClick);
            setInterval(_this.updateClock, 1000);
        };

        _this.containerClick = function () {

        };

        _this.updateClock = function () {
            var date = _this.getMomentDate();
            _this.TimeInput.attr('datetime', date.format('YYYY-MM-DD HH:mm:ss'));
            var dateValue = date.format(_this.TimeDisplayFormat);
            if (_this.HoursUtcOffset === 0) {
                dateValue += ' GMT';
            }
            _this.TimeInput.html(dateValue);
        };

        _this.getMomentDate = function () {
            var date;
            if (_this.TimeZoneIsFromUserDevice === true) {
                date = moment();
            } else {
                var hourToSet = moment.utc().hour() + _this.HoursUtcOffset;
                var minutesToAdd = 60 * (hourToSet % 1);
                date = moment.utc().hour(hourToSet).add(minutesToAdd, "minutes");
            }
            return date;
        };

        return _this;
    };
    FXStreet.Class.DateTime = function () {
        var parent = FXStreet.Class.Base(),
            _this = FXStreet.Util.extendObject(parent);

        _this.TimeDisplayFormat = '';
        _this.TimeZoneIsFromUserDevice = false;
        _this.CurrentTimeZone = null;
        _this.ChangeTimeZoneTitle = '';
        _this.ContainerId = '';

        var clockzoneSelector = "#fxs_changetimezone_button",
            timezoneButtonSelector = "#fxs_changetimezone_button",
            timezonesDivId = "fxs_it_timezones";

        var timezoneOptionDiv = null;
        var timezoneButton = null;
        var container = null;

        var timezone_HtmlTemplateFile = 'timezone.html';
        var timezone_options_HtmlTemplateFile = 'timezone_options.html';

        _this.init = function (json) {
            _this.setSettingsByObject(json);
            _this.setVars();
            render();
        };

        var render = function () {
            FXStreet.Util.loadHtmlTemplate(timezone_HtmlTemplateFile).done(function (template) {
                var rendered = FXStreet.Util.renderByHtmlTemplate(template, _this);
                container.html(rendered);

                timezoneButton = FXStreet.Util.getjQueryObjectBySelector(timezoneButtonSelector);
                timezoneButton.click(timezoneButtonClick);
                timezoneOptionDiv = FXStreet.Util.getjQueryObjectById(timezonesDivId);

                setTimezone();
                renderClock();
            });
        };

        _this.setVars = function () {
            container = FXStreet.Util.getjQueryObjectById(_this.ContainerId);
        };

        function setTimezone() {
            FXStreet.Class.Patterns.Singleton.TimeZoneManager.Instance().setTimeZone(_this.CurrentTimeZone);
        }

        var timezoneButtonClick = function () {
            if (!$.trim(timezoneOptionDiv.html())) {
                FXStreet.Class.Patterns.Singleton.TimeZoneManager.Instance().GetTimeZoneModel()
                    .then(function (timezoneModel) {
                        FXStreet.Util.loadHtmlTemplate(timezone_options_HtmlTemplateFile).done(function (template) {
                            var rendered = FXStreet.Util.renderByHtmlTemplate(template, timezoneModel);
                            timezoneOptionDiv.html(rendered);
                            timezoneOptionDiv.find("button").click(hideTimeZone);
                            timezoneOptionDiv.find('li').click(function () {
                                var timeZoneId = $(this).attr('timezone-id');
                                saveTimeZone(timeZoneId);
                            });
                        });
                    });
            }
            else {
                hideTimeZone();
            }
        };

        var hideTimeZone = function (){
            timezoneOptionDiv.empty();
        };

        var saveTimeZone = function (timezoneIdSelected) {
            if (_this.CurrentTimeZone.TimeZoneId !== timezoneIdSelected) {
                var timeZoneIsFromUserDevice = !timezoneIdSelected;

                if (timeZoneIsFromUserDevice) {
                    timezoneIdSelected = FXStreet.Class.Patterns.Singleton.TimeZoneManager.Instance().GetBrowserTimeZoneId();
                }

                var userTimeConfiguration = {
                    TimeZoneIsFromUserDevice: timeZoneIsFromUserDevice,
                    TimeZoneInfoId: timezoneIdSelected
                };

                var cookieManager = FXStreet.Class.Patterns.Singleton.FxsCookiesManager.Instance();
                cookieManager.UpdateCookie(FXStreet.Util.FxsCookie.UserTimeConfiguration, JSON.stringify(userTimeConfiguration), 20 * 365);
                window.location.reload();
            }
        };

        var renderClock = function (json) {
            var clockZone = new FXStreet.Class.ClockZone();
            var jsonClock = {
                ContainerSelector: clockzoneSelector,
                TimeDisplayFormat: _this.TimeDisplayFormat,
                HoursUtcOffset: _this.CurrentTimeZone.HoursUtcOffset,
                TimeZoneIsFromUserDevice: _this.TimeZoneIsFromUserDevice
            };
            clockZone.init(jsonClock);
        };

        return _this;
    };
    FXStreet.Class.Patterns.Singleton.TimeZoneManager = (function () {
        var instance;

        var timeZoneManager = function () {
            var _timeZone = null;

            this.setTimeZone = function(value) {
                _timeZone = value;
            }

            this.TimeZone = function () {
                return _timeZone;
            };

            this.GetTTTimeZoneValue = function () {
                var result = 'Etc/GMT';
                var timezone = this.TimeZone();
                if (timezone) {
                    if (FXStreet.Util.isInteger(timezone.HoursUtcOffset)) {
                        if (timezone.HoursUtcOffset < 0) {
                            result += '+' + -timezone.HoursUtcOffset;
                        }
                        else if (timezone.HoursUtcOffset > 0) {
                            result += '-' + timezone.HoursUtcOffset;
                        }
                    }
                    else {
                        result = convertTTName(timezone.TimeZoneId);
                    }
                }
                return result;
            };

            this.GetFormatedDate = function (date) {
                var result = moment(date).format("HH:mm") + (this.TimeZone().HoursUtcOffset === 0 ? ' GMT' : '');

                return result;
            };

            this.GetFormatedMomentDate = function (date) {
                var result = date.format("MMM DD, HH:mm") + (this.TimeZone().HoursUtcOffset === 0 ? ' GMT' : '');

                return result;
            };

            this.GetUserDateByUnix = function (timestamp) {
                var timezone = this.TimeZone();
                var minutesToAdd = (60 * timezone.HoursUtcOffset);
                var dateWithNewTimeZone = moment.unix(timestamp).utcOffset(minutesToAdd);
                var result = "";
                if (dateWithNewTimeZone._isValid) {
                    result = this.GetFormatedMomentDate(dateWithNewTimeZone);
                }

                return result;
            };

            var timeZoneModel = null;
            this.GetTimeZoneModel = function () {
                if (timeZoneModel) {
                    return $.when(timeZoneModel);
                }
                else {
                    var actionUrl = FXStreet.Util.createUrl(FXStreet.Resource.FxsApiRoutes["TimeZoneGet"], []);
                    return $.get(actionUrl).then(function (data) {
                        timeZoneModel = data;
                        return timeZoneModel;
                    });
                }
            };

            var convertTTName = function(id) {
                var ids = {
                    'Marquesas Standard Time': 'Pacific/Marquesas',
                    'Newfoundland Standard Time': 'Canada/Newfoundland',
                    'Iran Standard Time': 'Iran',
                    'Afghanistan Standard Time': 'Asia/Kabul',
                    'India Standard Time': 'Asia/Colombo',
                    'Sri Lanka Standard Time': 'Asia/Colombo',
                    'Nepal Standard Time': 'Asia/Kathmandu',
                    'Myanmar Standard Time': 'Indian/Cocos',
                    'North Korea Standard Time': 'Asia/Pyongyang',
                    'Cen. Australia Standard Time': 'Australia/Adelaide',
                    'AUS Central Standard Time': 'Australia/Darwin',
                    'Aus Central W. Standard Time': 'Australia/Eucla',
                    'Chatham Islands Standard Time': 'Pacific/Chatham'
                }
                return ids[id];
            };

            this.GetBrowserTimeZoneId = function () {
                var timezone = jstz.determine();
                var olsonTimeZoneId = timezone.name();
                var result = olsonTimeZoneToTimeZoneInfoId(olsonTimeZoneId);
                return result;
            };

            var olsonTimeZoneToTimeZoneInfoId = function (olsonTimeZoneId) {
                /// <summary>
                /// Converts an Olson time zone ID to a Windows time zone ID.
                /// </summary>
                /// <param name="olsonTimeZoneId">An Olson time zone ID. See http://unicode.org/repos/cldr-tmp/trunk/diff/supplemental/zone_tzid.html. </param>
                /// <returns>
                /// </returns>
                /// <remarks>
                /// See http://unicode.org/repos/cldr-tmp/trunk/diff/supplemental/zone_tzid.html
                /// </remarks>
                var olsonWindowsTimes = {
                    "Australia/Darwin": "AUS Central Standard Time",
                    "Australia/Sydney": "AUS Eastern Standard Time",
                    "Australia/Melbourne": "AUS Eastern Standard Time",
                    "Asia/Kabul": "Afghanistan Standard Time",
                    "America/Anchorage": "Alaskan Standard Time",
                    "America/Juneau": "Alaskan Standard Time",
                    "America/Nome": "Alaskan Standard Time",
                    "America/Sitka": "Alaskan Standard Time",
                    "America/Yakutat": "Alaskan Standard Time",
                    "Asia/Bahrain": "Arab Standard Time",
                    "Asia/Kuwait": "Arab Standard Time",
                    "Asia/Qatar": "Arab Standard Time",
                    "Asia/Riyadh": "Arab Standard Time",
                    "Asia/Aden": "Arab Standard Time",
                    "Asia/Dubai": "Arabian Standard Time",
                    "Asia/Muscat": "Arabian Standard Time",
                    "Etc/GMT-4": "Arabian Standard Time",
                    "Asia/Baghdad": "Arabic Standard Time",
                    "America/Buenos_Aires": "Argentina Standard Time",
                    "America/Argentina/La_Rioja": "Argentina Standard Time",
                    "America/Argentina/Rio_Gallegos": "Argentina Standard Time",
                    "America/Argentina/Salta": "Argentina Standard Time",
                    "America/Argentina/San_Juan": "Argentina Standard Time",
                    "America/Argentina/San_Luis": "Argentina Standard Time",
                    "America/Argentina/Tucuman": "Argentina Standard Time",
                    "America/Argentina/Ushuaia": "Argentina Standard Time",
                    "America/Catamarca": "Argentina Standard Time",
                    "America/Cordoba": "Argentina Standard Time",
                    "America/Jujuy": "Argentina Standard Time",
                    "America/Mendoza": "Argentina Standard Time",
                    "America/Halifax": "Atlantic Standard Time",
                    "Atlantic/Bermuda": "Atlantic Standard Time",
                    "America/Glace_Bay": "Atlantic Standard Time",
                    "America/Goose_Bay": "Atlantic Standard Time",
                    "America/Moncton": "Atlantic Standard Time",
                    "America/Thule": "Atlantic Standard Time",
                    "Asia/Baku": "Azerbaijan Standard Time",
                    "Atlantic/Azores": "Azores Standard Time",
                    "America/Scoresbysund": "Azores Standard Time",
                    "America/Bahia": "Bahia Standard Time",
                    "Asia/Dhaka": "Bangladesh Standard Time",
                    "Asia/Thimphu": "Bangladesh Standard Time",
                    "America/Regina": "Canada Central Standard Time",
                    "America/Swift_Current": "Canada Central Standard Time",
                    "Atlantic/Cape_Verde": "Cape Verde Standard Time",
                    "Etc/GMT+1": "Cape Verde Standard Time",
                    "Asia/Yerevan": "Caucasus Standard Time",
                    "Australia/Adelaide": "Cen. Australia Standard Time",
                    "Australia/Broken_Hill": "Cen. Australia Standard Time",
                    "America/Guatemala": "Central America Standard Time",
                    "America/Belize": "Central America Standard Time",
                    "America/Costa_Rica": "Central America Standard Time",
                    "Pacific/Galapagos": "Central America Standard Time",
                    "America/Tegucigalpa": "Central America Standard Time",
                    "America/Managua": "Central America Standard Time",
                    "America/El_Salvador": "Central America Standard Time",
                    "Etc/GMT+6": "Central America Standard Time",
                    "Asia/Almaty": "Central Asia Standard Time",
                    "Antarctica/Vostok": "Central Asia Standard Time",
                    "Indian/Chagos": "Central Asia Standard Time",
                    "Asia/Bishkek": "Central Asia Standard Time",
                    "Asia/Qyzylorda": "Central Asia Standard Time",
                    "Etc/GMT-6": "Central Asia Standard Time",
                    "America/Cuiaba": "Central Brazilian Standard Time",
                    "America/Campo_Grande": "Central Brazilian Standard Time",
                    "Europe/Tirane": "Central Europe Standard Time",
                    "Europe/Prague": "Central Europe Standard Time",
                    "Europe/Budapest": "Central Europe Standard Time",
                    "Europe/Podgorica": "Central Europe Standard Time",
                    "Europe/Belgrade": "Central Europe Standard Time",
                    "Europe/Ljubljana": "Central Europe Standard Time",
                    "Europe/Bratislava": "Central Europe Standard Time",
                    "Europe/Sarajevo": "Central European Standard Time",
                    "Europe/Zagreb": "Central European Standard Time",
                    "Europe/Skopje": "Central European Standard Time",
                    "Europe/Warsaw": "Central European Standard Time",
                    "Antarctica/Macquarie": "Central Pacific Standard Time",
                    "Pacific/Ponape": "Central Pacific Standard Time",
                    "Pacific/Kosrae": "Central Pacific Standard Time",
                    "Pacific/Noumea": "Central Pacific Standard Time",
                    "Pacific/Guadalcanal": "Central Pacific Standard Time",
                    "Pacific/Efate": "Central Pacific Standard Time",
                    "Etc/GMT-11": "Central Pacific Standard Time",
                    "America/Chicago": "Central Standard Time",
                    "America/Winnipeg": "Central Standard Time",
                    "America/Rainy": "Central Standard Time",
                    "America/Rankin_Inlet": "Central Standard Time",
                    "America/Resolute": "Central Standard Time",
                    "America/Matamoros": "Central Standard Time",
                    "America/Indiana/Knox": "Central Standard Time",
                    "America/Indiana/Tell_City": "Central Standard Time",
                    "America/Menominee": "Central Standard Time",
                    "America/North_Dakota/Beulah": "Central Standard Time",
                    "America/North_Dakota/Center": "Central Standard Time",
                    "America/North_Dakota/New_Salem": "Central Standard Time",
                    "CST6CDT": "Central Standard Time",
                    "America/Mexico_City": "Central Standard Time (Mexico)",
                    "America/Bahia_Banderas": "Central Standard Time (Mexico)",
                    "America/Cancun": "Central Standard Time (Mexico)",
                    "America/Merida": "Central Standard Time (Mexico)",
                    "America/Monterrey": "Central Standard Time (Mexico)",
                    "Asia/Shanghai": "China Standard Time",
                    "Asia/Chongqing": "China Standard Time",
                    "Asia/Harbin": "China Standard Time",
                    "Asia/Kashgar": "China Standard Time",
                    "Asia/Urumqi": "China Standard Time",
                    "Asia/Hong_Kong": "China Standard Time",
                    "Asia/Macau": "China Standard Time",
                    "Etc/GMT+12": "Dateline Standard Time",
                    "Antarctica/Syowa": "E. Africa Standard Time",
                    "Africa/Djibouti": "E. Africa Standard Time",
                    "Africa/Asmera": "E. Africa Standard Time",
                    "Africa/Addis_Ababa": "E. Africa Standard Time",
                    "Africa/Nairobi": "E. Africa Standard Time",
                    "Indian/Comoro": "E. Africa Standard Time",
                    "Indian/Antananarivo": "E. Africa Standard Time",
                    "Africa/Khartoum": "E. Africa Standard Time",
                    "Africa/Mogadishu": "E. Africa Standard Time",
                    "Africa/Juba": "E. Africa Standard Time",
                    "Africa/Dar_es_Salaam": "E. Africa Standard Time",
                    "Africa/Kampala": "E. Africa Standard Time",
                    "Indian/Mayotte": "E. Africa Standard Time",
                    "Etc/GMT-3": "E. Africa Standard Time",
                    "Australia/Brisbane": "E. Australia Standard Time",
                    "Australia/Brisbane Australia/Lindeman": "E. Australia Standard Time",
                    "Asia/Nicosia": "E. Europe Standard Time",
                    "America/Sao_Paulo": "E. South America Standard Time",
                    "America/New_York": "Eastern Standard Time",
                    "America/Nassau": "Eastern Standard Time",
                    "America/Toronto": "Eastern Standard Time",
                    "America/Iqaluit": "Eastern Standard Time",
                    "America/Montreal": "Eastern Standard Time",
                    "America/Nipigon": "Eastern Standard Time",
                    "America/Pangnirtung": "Eastern Standard Time",
                    "America/Thunder_Bay": "Eastern Standard Time",
                    "America/Grand_Turk": "Eastern Standard Time",
                    "America/Detroit": "Eastern Standard Time",
                    "America/Indiana/Petersburg": "Eastern Standard Time",
                    "America/Indiana/Vincennes": "Eastern Standard Time",
                    "America/Indiana/Winamac": "Eastern Standard Time",
                    "America/Kentucky/Monticello": "Eastern Standard Time",
                    "America/Louisville": "Eastern Standard Time",
                    "EST5EDT": "Eastern Standard Time",
                    "Africa/Cairo": "Egypt Standard Time",
                    "Asia/Gaza": "Egypt Standard Time",
                    "Asia/Hebron": "Egypt Standard Time",
                    "Asia/Yekaterinburg": "Ekaterinburg Standard Time",
                    "Europe/Mariehamn": "FLE Standard Time",
                    "Europe/Sofia": "FLE Standard Time",
                    "Europe/Tallinn": "FLE Standard Time",
                    "Europe/Helsinki": "FLE Standard Time",
                    "Europe/Vilnius": "FLE Standard Time",
                    "Europe/Riga": "FLE Standard Time",
                    "Europe/Kiev": "FLE Standard Time",
                    "Europe/Simferopol": "FLE Standard Time",
                    "Europe/Uzhgorod": "FLE Standard Time",
                    "Europe/Zaporozhye": "FLE Standard Time",
                    "Pacific/Fiji": "Fiji Standard Time",
                    "Atlantic/Canary": "GMT Standard Time",
                    "Atlantic/Faeroe": "GMT Standard Time",
                    "Europe/London": "GMT Standard Time",
                    "Europe/Guernsey": "GMT Standard Time",
                    "Europe/Dublin": "GMT Standard Time",
                    "Europe/Isle_of_Man": "GMT Standard Time",
                    "Europe/Jersey": "GMT Standard Time",
                    "Europe/Lisbon": "GMT Standard Time",
                    "Atlantic/Madeira": "GMT Standard Time",
                    "Europe/Bucharest": "GTB Standard Time",
                    "Europe/Athens": "GTB Standard Time",
                    "Europe/Chisinau": "GTB Standard Time",
                    "Asia/Tbilisi": "Georgian Standard Time",
                    "America/Godthab": "Greenland Standard Time",
                    "Africa/Ouagadougou": "Greenwich Standard Time",
                    "Africa/Abidjan": "Greenwich Standard Time",
                    "Africa/El_Aaiun": "Greenwich Standard Time",
                    "Africa/Accra": "Greenwich Standard Time",
                    "Africa/Banjul": "Greenwich Standard Time",
                    "Africa/Conakry": "Greenwich Standard Time",
                    "Africa/Bissau": "Greenwich Standard Time",
                    "Atlantic/Reykjavik": "Greenwich Standard Time",
                    "Africa/Monrovia": "Greenwich Standard Time",
                    "Africa/Bamako": "Greenwich Standard Time",
                    "Africa/Nouakchott": "Greenwich Standard Time",
                    "Atlantic/St_Helena": "Greenwich Standard Time",
                    "Africa/Freetown": "Greenwich Standard Time",
                    "Africa/Dakar": "Greenwich Standard Time",
                    "Africa/Sao_Tome": "Greenwich Standard Time",
                    "Africa/Lome": "Greenwich Standard Time",
                    "Pacific/Honolulu": "Hawaiian Standard Time",
                    "Pacific/Rarotonga": "Hawaiian Standard Time",
                    "Pacific/Tahiti": "Hawaiian Standard Time",
                    "Pacific/Fakaofo": "Hawaiian Standard Time",
                    "Pacific/Johnston": "Hawaiian Standard Time",
                    "Etc/GMT+10": "Hawaiian Standard Time",
                    "Asia/Calcutta": "India Standard Time",
                    "Asia/Tehran": "Iran Standard Time",
                    "Asia/Jerusalem": "Israel Standard Time",
                    "Asia/Amman": "Jordan Standard Time",
                    "Europe/Kaliningrad": "Kaliningrad Standard Time",
                    "Europe/Minsk": "Kaliningrad Standard Time",
                    "Asia/Pyongyang": "Korea Standard Time",
                    "Asia/Seoul": "Korea Standard Time",
                    "Asia/Magadan": "Magadan Standard Time",
                    "Asia/Anadyr": "Magadan Standard Time",
                    "Asia/Kamchatka": "Magadan Standard Time",
                    "Indian/Mauritius": "Mauritius Standard Time",
                    "Indian/Reunion": "Mauritius Standard Time",
                    "Indian/Mahe": "Mauritius Standard Time",
                    "Asia/Beirut": "Middle East Standard Time",
                    "America/Montevideo": "Montevideo Standard Time",
                    "Africa/Casablanca": "Morocco Standard Time",
                    "America/Denver": "Mountain Standard Time",
                    "America/Edmonton": "Mountain Standard Time",
                    "America/Cambridge_Bay": "Mountain Standard Time",
                    "America/Inuvik": "Mountain Standard Time",
                    "America/Yellowknife": "Mountain Standard Time",
                    "America/Ojinaga": "Mountain Standard Time",
                    "America/Boise": "Mountain Standard Time",
                    "America/Shiprock": "Mountain Standard Time",
                    "MST7MDT": "Mountain Standard Time",
                    "America/Chihuahua": "Mountain Standard Time (Mexico)",
                    "America/Chihuahua America/Mazatlan": "Mountain Standard Time (Mexico)",
                    "Asia/Rangoon": "Myanmar Standard Time",
                    "Indian/Cocos": "Myanmar Standard Time",
                    "Asia/Novosibirsk": "N. Central Asia Standard Time",
                    "Asia/Novokuznetsk": "N. Central Asia Standard Time",
                    "Asia/Omsk": "N. Central Asia Standard Time",
                    "Africa/Windhoek": "Namibia Standard Time",
                    "Asia/Katmandu": "Nepal Standard Time",
                    "Antarctica/South_Pole": "New Zealand Standard Time",
                    "Antarctica/McMurdo": "New Zealand Standard Time",
                    "Pacific/Auckland": "New Zealand Standard Time",
                    "America/St_Johns": "Newfoundland Standard Time",
                    "Asia/Irkutsk": "North Asia East Standard Time",
                    "Asia/Krasnoyarsk": "North Asia Standard Time",
                    "Antarctica/Palmer": "Pacific SA Standard Time",
                    "America/Santiago": "Pacific SA Standard Time",
                    "America/Vancouver": "Pacific Standard Time",
                    "America/Dawson": "Pacific Standard Time",
                    "America/Whitehorse": "Pacific Standard Time",
                    "America/Tijuana": "Pacific Standard Time",
                    "America/Los_Angeles": "Pacific Standard Time",
                    "PST8PDT": "Pacific Standard Time",
                    "America/Santa_Isabel": "Pacific Standard Time (Mexico)",
                    "Asia/Karachi": "Pakistan Standard Time",
                    "America/Asuncion": "Paraguay Standard Time",
                    "Europe/Brussels": "Romance Standard Time",
                    "Europe/Copenhagen": "Romance Standard Time",
                    "Europe/Madrid": "Romance Standard Time",
                    "Africa/Ceuta": "Romance Standard Time",
                    "Europe/Paris": "Romance Standard Time",
                    "Europe/Moscow": "Russian Standard Time",
                    "Europe/Moscow Europe/Samara Europe/Volgograd": "Russian Standard Time",
                    "Antarctica/Rothera": "SA Eastern Standard Time",
                    "America/Fortaleza": "SA Eastern Standard Time",
                    "America/Araguaina": "SA Eastern Standard Time",
                    "America/Belem": "SA Eastern Standard Time",
                    "America/Maceio": "SA Eastern Standard Time",
                    "America/Recife": "SA Eastern Standard Time",
                    "America/Santarem": "SA Eastern Standard Time",
                    "America/Cayenne": "SA Eastern Standard Time",
                    "America/Paramaribo": "SA Eastern Standard Time",
                    "Etc/GMT+3": "SA Eastern Standard Time",
                    "America/Bogota": "SA Pacific Standard Time",
                    "America/Coral_Harbour": "SA Pacific Standard Time",
                    "America/Guayaquil": "SA Pacific Standard Time",
                    "America/Port-au-Prince": "SA Pacific Standard Time",
                    "America/Jamaica": "SA Pacific Standard Time",
                    "America/Cayman": "SA Pacific Standard Time",
                    "America/Panama": "SA Pacific Standard Time",
                    "America/Lima": "SA Pacific Standard Time",
                    "Etc/GMT+5": "SA Pacific Standard Time",
                    "America/Antigua": "SA Western Standard Time",
                    "America/Anguilla": "SA Western Standard Time",
                    "America/Aruba": "SA Western Standard Time",
                    "America/Barbados": "SA Western Standard Time",
                    "America/St_Barthelemy": "SA Western Standard Time",
                    "America/La_Paz": "SA Western Standard Time",
                    "America/Manaus": "SA Western Standard Time",
                    "America/Boa_Vista": "SA Western Standard Time",
                    "America/Eirunepe": "SA Western Standard Time",
                    "America/Porto_Velho": "SA Western Standard Time",
                    "America/Rio_Branco": "SA Western Standard Time",
                    "America/Blanc-Sablon": "SA Western Standard Time",
                    "America/Curacao": "SA Western Standard Time",
                    "America/Dominica": "SA Western Standard Time",
                    "America/Santo_Domingo": "SA Western Standard Time",
                    "America/Grenada": "SA Western Standard Time",
                    "America/Guadeloupe": "SA Western Standard Time",
                    "America/Guyana": "SA Western Standard Time",
                    "America/St_Kitts": "SA Western Standard Time",
                    "America/St_Lucia": "SA Western Standard Time",
                    "America/Marigot": "SA Western Standard Time",
                    "America/Martinique": "SA Western Standard Time",
                    "America/Montserrat": "SA Western Standard Time",
                    "America/Puerto_Rico": "SA Western Standard Time",
                    "America/Port_of_Spain": "SA Western Standard Time",
                    "America/St_Vincent": "SA Western Standard Time",
                    "America/Tortola": "SA Western Standard Time",
                    "America/St_Thomas": "SA Western Standard Time",
                    "Etc/GMT+4": "SA Western Standard Time",
                    "Antarctica/Davis": "SE Asia Standard Time",
                    "Indian/Christmas": "SE Asia Standard Time",
                    "Asia/Jakarta Asia/Pontianak": "SE Asia Standard Time",
                    "Asia/Phnom_Penh": "SE Asia Standard Time",
                    "Asia/Vientiane": "SE Asia Standard Time",
                    "Asia/Hovd": "SE Asia Standard Time",
                    "Asia/Bangkok": "SE Asia Standard Time",
                    "Asia/Saigon": "SE Asia Standard Time",
                    "Etc/GMT-7": "SE Asia Standard Time",
                    "Pacific/Apia": "Samoa Standard Time",
                    "Asia/Brunei": "Singapore Standard Time",
                    "Asia/Makassar": "Singapore Standard Time",
                    "Asia/Kuala_Lumpur": "Singapore Standard Time",
                    "Asia/Kuching": "Singapore Standard Time",
                    "Asia/Manila": "Singapore Standard Time",
                    "Asia/Singapore": "Singapore Standard Time",
                    "Etc/GMT-8": "Singapore Standard Time",
                    "Africa/Bujumbura": "South Africa Standard Time",
                    "Africa/Gaborone": "South Africa Standard Time",
                    "Africa/Lubumbashi": "South Africa Standard Time",
                    "Africa/Maseru": "South Africa Standard Time",
                    "Africa/Tripoli": "South Africa Standard Time",
                    "Africa/Blantyre": "South Africa Standard Time",
                    "Africa/Maputo": "South Africa Standard Time",
                    "Africa/Kigali": "South Africa Standard Time",
                    "Africa/Mbabane": "South Africa Standard Time",
                    "Africa/Johannesburg": "South Africa Standard Time",
                    "Africa/Lusaka": "South Africa Standard Time",
                    "Africa/Harare": "South Africa Standard Time",
                    "Etc/GMT-2": "South Africa Standard Time",
                    "Asia/Colombo": "Sri Lanka Standard Time",
                    "Asia/Damascus": "Syria Standard Time",
                    "Asia/Taipei": "Taipei Standard Time",
                    "Australia/Hobart": "Tasmania Standard Time",
                    "Australia/Currie": "Tasmania Standard Time",
                    "Asia/Tokyo": "Tokyo Standard Time",
                    "Asia/Jayapura": "Tokyo Standard Time",
                    "Pacific/Palau": "Tokyo Standard Time",
                    "Asia/Dili": "Tokyo Standard Time",
                    "Etc/GMT-9": "Tokyo Standard Time",
                    "Pacific/Enderbury": "Tonga Standard Time",
                    "Pacific/Tongatapu": "Tonga Standard Time",
                    "Etc/GMT-13": "Tonga Standard Time",
                    "Europe/Istanbul": "Turkey Standard Time",
                    "America/Indianapolis": "US Eastern Standard Time",
                    "America/Indiana/Marengo": "US Eastern Standard Time",
                    "America/Indiana/Vevay": "US Eastern Standard Time",
                    "America/Dawson_Creek": "US Mountain Standard Time",
                    "America/Hermosillo": "US Mountain Standard Time",
                    "America/Phoenix": "US Mountain Standard Time",
                    "Etc/GMT+7": "US Mountain Standard Time",
                    "Etc/GMT": "UTC",
                    "America/Danmarkshavn": "UTC",
                    "Pacific/Tarawa": "UTC+12",
                    "Pacific/Majuro Pacific/Kwajalein": "UTC+12",
                    "Pacific/Nauru": "UTC+12",
                    "Pacific/Funafuti": "UTC+12",
                    "Pacific/Wake": "UTC+12",
                    "Pacific/Wallis": "UTC+12",
                    "Etc/GMT-12": "UTC+12",
                    "America/Noronha": "UTC-02",
                    "Atlantic/South_Georgia": "UTC-02",
                    "Etc/GMT+2": "UTC-02",
                    "Pacific/Pago_Pago": "UTC-11",
                    "Pacific/Niue": "UTC-11",
                    "Pacific/Midway": "UTC-11",
                    "Etc/GMT+11": "UTC-11",
                    "Asia/Ulaanbaatar": "Ulaanbaatar Standard Time",
                    "Asia/Choibalsan": "Ulaanbaatar Standard Time",
                    "America/Caracas": "Venezuela Standard Time",
                    "Asia/Vladivostok": "Vladivostok Standard Time",
                    "Asia/Sakhalin": "Vladivostok Standard Time",
                    "Australia/Perth": "W. Australia Standard Time",
                    "Antarctica/Casey": "W. Australia Standard Time",
                    "Africa/Luanda": "W. Central Africa Standard Time",
                    "Africa/Porto-Novo": "W. Central Africa Standard Time",
                    "Africa/Kinshasa": "W. Central Africa Standard Time",
                    "Africa/Bangui": "W. Central Africa Standard Time",
                    "Africa/Brazzaville": "W. Central Africa Standard Time",
                    "Africa/Douala": "W. Central Africa Standard Time",
                    "Africa/Algiers": "W. Central Africa Standard Time",
                    "Africa/Libreville": "W. Central Africa Standard Time",
                    "Africa/Malabo": "W. Central Africa Standard Time",
                    "Africa/Niamey": "W. Central Africa Standard Time",
                    "Africa/Lagos": "W. Central Africa Standard Time",
                    "Africa/Ndjamena": "W. Central Africa Standard Time",
                    "Africa/Tunis": "W. Central Africa Standard Time",
                    "Etc/GMT-1": "W. Central Africa Standard Time",
                    "Europe/Berlin": "W. Europe Standard Time",
                    "Europe/Andorra": "W. Europe Standard Time",
                    "Europe/Vienna": "W. Europe Standard Time",
                    "Europe/Zurich": "W. Europe Standard Time",
                    "Europe/Gibraltar": "W. Europe Standard Time",
                    "Europe/Rome": "W. Europe Standard Time",
                    "Europe/Vaduz": "W. Europe Standard Time",
                    "Europe/Luxembourg": "W. Europe Standard Time",
                    "Europe/Monaco": "W. Europe Standard Time",
                    "Europe/Malta": "W. Europe Standard Time",
                    "Europe/Amsterdam": "W. Europe Standard Time",
                    "Europe/Oslo": "W. Europe Standard Time",
                    "Europe/Stockholm": "W. Europe Standard Time",
                    "Arctic/Longyearbyen": "W. Europe Standard Time",
                    "Europe/San_Marino": "W. Europe Standard Time",
                    "Europe/Vatican": "W. Europe Standard Time",
                    "Asia/Tashkent": "West Asia Standard Time",
                    "Antarctica/Mawson": "West Asia Standard Time",
                    "Asia/Oral": "West Asia Standard Time",
                    "Asia/Aqtau": "West Asia Standard Time",
                    "Asia/Aqtobe": "West Asia Standard Time",
                    "Indian/Maldives": "West Asia Standard Time",
                    "Indian/Kerguelen": "West Asia Standard Time",
                    "Asia/Dushanbe": "West Asia Standard Time",
                    "Asia/Ashgabat": "West Asia Standard Time",
                    "Asia/Tashkent Asia/Samarkand": "West Asia Standard Time",
                    "Etc/GMT-5": "West Asia Standard Time",
                    "Antarctica/DumontDUrville": "West Pacific Standard Time",
                    "Pacific/Truk": "West Pacific Standard Time",
                    "Pacific/Guam": "West Pacific Standard Time",
                    "Pacific/Saipan": "West Pacific Standard Time",
                    "Pacific/Port_Moresby": "West Pacific Standard Time",
                    "Etc/GMT-10": "West Pacific Standard Time",
                    "Asia/Yakutsk": "Yakutsk Standard Time"
                };

                var result = olsonWindowsTimes[olsonTimeZoneId];
                return result;
            };
        };

        return {
            Instance: function () {
                if (!instance) {
                    instance = new timeZoneManager();
                }
                return instance;
            }
        };
    })();
}());
(function () {
    FXStreet.Class.Patterns.Singleton.UserPersonalizationManager = (function () {
        var userPersonalizationManagerClass = function () {
            var parent = FXStreet.Class.Base(),
            _this = FXStreet.Util.extendObject(parent);

            var cookieManager = null;
            var isStorageAvailable = false;
            const assetsMultiRateSettingKey = 'assetsMultiRateSetting';
            const assetsRateAndChartFilterKey = 'assetsRateAndChartFilterSetting';
            const cookieRateAndChartFilterKey = 'IsAssetsRateAndChartFilterSetting';

            _this.init = function (json) {
                _this.setSettingsByObject(json);
                _this.setVars();
            };

            _this.setVars = function () {
                isStorageAvailable = FXStreet.Util.isStorageAvailable('localStorage');
                if (!isStorageAvailable) {
                    console.log('localStorage is unavailable');
                }
                cookieManager = FXStreet.Class.Patterns.Singleton.FxsCookiesManager.Instance();
            };

            var getSetting = function (keyStr) {
                var result = null;
                if(isStorageAvailable){
                    result = localStorage.getItem(keyStr);  
                }
                return result;
            };

            var getSettingJson = function (keyStr) {
                var result = {};
                var value = getSetting(keyStr);
                if (value) {
                    result = JSON.parse(value);
                }
                return result;
            };

            var setSetting = function (keyStr, valueStr) {
                if(isStorageAvailable){
                    localStorage.setItem(keyStr, valueStr);
                }
            };

            var removeSetting = function (keyStr) {
                if (isStorageAvailable) {
                    localStorage.removeItem(keyStr);
                }
            };

            var setSettingJson = function (keyStr, valueJson) {
                var valueStr = JSON.stringify(valueJson);
                setSetting(keyStr, valueStr);
            };

            _this.GetAssetsMultiRateSetting = function () {
                var result = getSettingJson(assetsMultiRateSettingKey);
                return result;
            };
            _this.SetAssetsMultiRateSetting = function (valueJson) {
                setSettingJson(assetsMultiRateSettingKey, valueJson);
            };
            _this.RemoveAssetsMultiRateSetting = function () {
                removeSetting(assetsMultiRateSettingKey);
            };

            _this.GetAssetsRateAndChartFilterSetting = function () {
                var result = null;
                if (cookieManager.ExistCookie(cookieRateAndChartFilterKey)) {
                    result = getSettingJson(assetsRateAndChartFilterKey);
                    if (result) {
                        cookieManager.UpdateCookie(cookieRateAndChartFilterKey, 1, 365);
                    }
                    else {
                        cookieManager.DeleteCookie(cookieRateAndChartFilterKey);
                    }
                }
                else {
                    _this.RemoveAssetsRateAndChartFilterSetting();
                }
                return result;
            };
            _this.SetAssetsRateAndChartFilterSetting = function (valueJson) {
                setSettingJson(assetsRateAndChartFilterKey, valueJson);
                cookieManager.UpdateCookie(cookieRateAndChartFilterKey, 1, 365);
            };
            _this.RemoveAssetsRateAndChartFilterSetting = function () {
                removeSetting(assetsRateAndChartFilterKey);
                cookieManager.DeleteCookie(cookieRateAndChartFilterKey);
            };

            return _this;
        };

        var instance;
        function createInstance() {
            var object = userPersonalizationManagerClass();
            object.init({});
            return object;
        };
        return {
            Instance: function () {
                if (!instance) {
                    instance = createInstance();
                }
                return instance;
            }
        };
    })();
}());
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