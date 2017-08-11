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