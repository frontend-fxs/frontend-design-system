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