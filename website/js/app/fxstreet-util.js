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