(function () {
    window.FXStreet = {};
    var FXStreet = window.FXStreet;

    /*  
     A namespace for instances, 
     this is used for instances of objects that are auto generated from object tags. 
    */
    FXStreet.Instance = {};
    FXStreet.Instance.index = 0;
    FXStreet.Instance.getNextIndex = function () {
        FXStreet.Instance.index += 1;
        return FXStreet.Instance.index;
    };

    // A pointer to the active resource object instance
    FXStreet.Resource = {};
    FXStreet.Resource.StaticContentScript = '';
    FXStreet.Resource.StaticContentCss = '';
    FXStreet.Resource.StaticContentFont = '';
    FXStreet.Resource.StaticContentVideo = '';
    FXStreet.Resource.StaticContentHtmlTemplate = '';
    FXStreet.Resource.StaticContentQueryStringRefresh = '';
    FXStreet.Resource.FxsApiRoutes = {};
    FXStreet.Resource.IsDesignMode = false;
    FXStreet.Resource.IsPreviewMode = false;
    FXStreet.Resource.isReady = false;
    FXStreet.Resource.isLoaded = false;
    FXStreet.Resource.CultureName = '';
    FXStreet.Resource.LanguageId = '';
    FXStreet.Resource.InitialTitle = '';
    FXStreet.Resource.InitialUrl = '';
    FXStreet.Resource.PageTitle = '';
    FXStreet.Resource.PageUrl = '';
    FXStreet.Resource.Translations = {};
    FXStreet.Resource.GenericData = {};
    FXStreet.Resource.TeletraderSecurityUrl = '';
    FXStreet.Resource.TeletraderPriceProviderUrl = '';
    FXStreet.Resource.PhoneServiceUrl = '';
    FXStreet.Resource.MustacheBundle = '';
    FXStreet.Resource.MachineName = '';
    FXStreet.Resource.UserId = '';
    FXStreet.Resource.externalJsLoaded = false;
    FXStreet.Resource.SocialMediaBar = {};
    

    FXStreet.Global = {};
    FXStreet.Global.AsyncDfp = false;
    FXStreet.Global.GoogleTagLoaded = false;

    // A static helper class
    FXStreet.Util = {};
    FXStreet.Util.createObjectArray = [];

    //Douglas Crockford's inheritance method
    FXStreet.Util.extendObject = function (o) {
        var f = function () { };
        f.prototype = o;
        return new f();
    };

    FXStreet.Util.initObject = function (createObject) {
        var objName = createObject.objType + FXStreet.Instance.getNextIndex();
        var objectType = createObject.objType;
        var json = createObject.json || {};
        if (FXStreet.Class[objectType]) {
            try{
                FXStreet.Instance[objName] = new FXStreet.Class[objectType]();
                FXStreet.Instance[objName].init(json);
                createObject.created = true;
            }
            catch (ex) {
                console.error('Can not create ' + objectType + ' , exMessage:' + ex.message);
            }
        }
    };

    FXStreet.Util.createObject = function (objType, json, createEvent) {
        createEvent = createEvent || "load";
        var createObject = {
            "objType": objType,
            "json": json,
            "createEvent": createEvent,
            "created": false
        };
        var init = FXStreet.Resource.isLoaded || createEvent === "init" || (createEvent === "googletagloaded" && FXStreet.Global.GoogleTagLoaded);
        if (init) { // && FXStreet.Util.isBackendDesignMode() TODO check for posibles issues, if not leaved
            FXStreet.Util.initObject(createObject);
        }
        else {
            FXStreet.Util.createObjectArray.push(createObject);
        }
        return createObject;
    };

    FXStreet.Util.getObjectFromBase64String = function (base64String) {

        base64String = base64String.replace(/\s/g, '');
        var decodedString = decodeURIComponent(escape(window.atob(base64String)));

        var result = JSON.parse(decodedString);
        return result;
    };

    FXStreet.Util.createObjectFromBase64String = function (objType, base64String, createEvent) {
        var json = null;
        try {
            json = FXStreet.Util.getObjectFromBase64String(base64String);
        }
        catch (e) {
            console.log("Unable to create ObjectFromBase64String >> [" + objType + "]");
        }
        FXStreet.Util.createObject(objType, json, createEvent);
    };

    FXStreet.Util.getObjectInstanceAllStartWith = function (objectName) {
        var myObjects = [];
        for (var ins in FXStreet.Instance) {
            if (ins.substring(0, objectName.length) === objectName)
                myObjects.push(FXStreet.Instance[ins]);
        }
        return myObjects;
    };

    FXStreet.Util.getObjectInstance = function (objectName) {
        var myObject = null;
        for (var ins in FXStreet.Instance) {
            if (ins.substring(0, objectName.length) === objectName) {
                myObject = FXStreet.Instance[ins];
                break;
            }
        }
        return myObject;
    };

    FXStreet.Util.initObjects = function (createEvent) {
        createEvent = createEvent || "load";

        var objectsToInit = FXStreet.Util.createObjectArray.filter(function (item) {
            return !item.created && (item.createEvent === createEvent || createEvent === 'all');
        });

        objectsToInit.forEach(function (createObject) {
            FXStreet.Util.initObject(createObject);
        });
    };

    // A namespace for class definitions
    FXStreet.Class = {};
    FXStreet.Class.Patterns = {};

    FXStreet.ExternalLib = {};
    FXStreet.ExternalLib.Mustache = null;
    FXStreet.ExternalLib.GoogleTag = null;
    FXStreet.ExternalLib.Teletrader = null;
    FXStreet.ExternalLib.TTChart = null;
}());