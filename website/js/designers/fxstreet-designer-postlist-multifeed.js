(function () {
    FXStreetDesigners.Class.PostListMultiFeed = function ($, designerModule) {
        var parent = FXStreetDesigners.Class.Base($, designerModule),
            _this = FXStreet.Util.extendObject(parent);

        var tags = [];
        var feeds = [];
        
        var insertItem = function (itemId, allItems, selectedItems) {
            if (!itemId) {
                alert('You have to select an item');
                return;
            }

            var itemFinded = $.grep(allItems, function (e) { return e.Id === itemId; });
            if (itemFinded.length <= 0) {
                alert('Invalid item');
                return;
            }

            var item = itemFinded[0];

            var exists = $.grep(selectedItems, function (e) { return e.Id === item.Id; }).length > 0;

            if (exists) {
                alert('The item already exists');
                return;
            }

            selectedItems.push(item);
        };

        var removeSelectedItem = function (item, selectedItems) {
            var result = $.grep(selectedItems, function (e) {
                return e.Id !== item.Id;
            });

            return result;
        };

        var getItemById = function (items, id) {
            var item = $.grep(items, function (e) {
                return e.Id === id;
            });

            var result = item.length > 0 ? item[0] : null;
            return result;
        };

        var initializeItems = function (ids, allItems, selectedItems) {
            for (var i = 0; i < ids.length; i++) {
                var id = ids[i];
                if (!id) {
                    continue;
                }

                var item = getItemById(allItems, id);

                if (selectedItems !== null) {
                    selectedItems.push(item);
                }
            }
        };

        var getItemPropertyValue = function (selectedItems) {
            var value = null;
            if (selectedItems.length > 0) {
                value = selectedItems[0].Id;

                for (var i = 1; i < selectedItems.length; i++) {
                    value += ',' + selectedItems[i].Id;
                }
            }

            return value;
        };

        parent.onPush = function ($scope) {
            $scope.properties.TagIds.PropertyValue = getItemPropertyValue(tags);
            $scope.properties.FeedIds.PropertyValue = getItemPropertyValue(feeds);
        };

        parent.onInit = function ($scope, properties) {
            if ($scope.properties.HighlightedFirstItem) {
                $scope.properties.HighlightedFirstItem.PropertyValue = $scope.properties.HighlightedFirstItem.PropertyValue === "True" ? true : false;
            }

            if ($scope.properties.WithImage) {
                $scope.properties.WithImage.PropertyValue = $scope.properties.WithImage.PropertyValue === "True" ? true : false;
            }

            if ($scope.properties.Take) {
                $scope.properties.Take.PropertyValue = parseInt($scope.properties.Take.PropertyValue);
            } else {
                $scope.properties.Take.PropertyValue = 0;
            }

            if ($scope.properties.TagIds) {
                var tagIds = $scope.properties.TagIds.PropertyValue.split(',');
                initializeItems(tagIds, $scope.Tags, tags);
            }

            if ($scope.properties.FeedIds) {
                var feedIds = $scope.properties.FeedIds.PropertyValue.split(',');
                initializeItems(feedIds, $scope.Feeds, feeds);
            }

            if ($scope.properties.SizeId) {
                $scope.size = $scope.properties.SizeId.PropertyValue;
            }
        };

        parent.configureScope = function ($scope) {
            $scope.TagInsert = function() {
                insertItem($scope.tag, $scope.Tags, tags);
            };
            $scope.GetTagsSelected = function () {
                return tags;
            };
            $scope.RemoveTag = function (tag) {
                tags = removeSelectedItem(tag, tags);
            };

            $scope.FeedInsert = function () {
                insertItem($scope.feed, $scope.Feeds, feeds);
            };
            $scope.GetFeedsSelected = function () {
                return feeds;
            };
            $scope.RemoveFeed = function (feed) {
                feeds = removeSelectedItem(feed, feeds);
            };

            $scope.SizeChange = function () {
                $scope.properties.SizeId.PropertyValue = $scope.size;
            };
        };

        return _this;
    }
}());