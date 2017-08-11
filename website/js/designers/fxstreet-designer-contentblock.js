(function () {
    FXStreetDesigners.Class.ContentBlock = function ($, designerModule) {
        var parent = FXStreetDesigners.Class.Base($, designerModule),
                _this = FXStreet.Util.extendObject(parent);

        parent.ControllerName = 'CustomCtrl';

        _this.setAdvertiseLogic = function ($scope) {
            $scope.AdsSelector = function () {
                $scope.Ads_Popup.open();
            };

            $scope.AdsInsert = function () {
                if ($scope.RefreshSeconds !== 0 && $scope.AddsMinValidTimeInSecondsToRefresh > $scope.RefreshSeconds) {
                    alert("RefreshSeconds must be greatest than or equal to " + $scope.AddsMinValidTimeInSecondsToRefresh);
                    return;
                }

                var containerId = FXStreet.Util.guid();

                var json = {
                    "ContainerId": containerId,
                    "SlotName": $scope.SlotName,
                    "Labels": $scope.labels,
                    "MobileSize": $scope.MobileSize,
                    "TabletSize": $scope.TabletSize,
                    "DesktopSize": $scope.DesktopSize,
                    "DesktopHdSize": $scope.DesktopHdSize,
                    "RawSize": $scope.RawSize,
                    "RefreshSeconds": $scope.RefreshSeconds
                };

                var html = $("<div>")
                    .attr("id", containerId)
                    .attr("fxs_createevent", "load")
                    .attr("fxs_objtype", "Advertise" + $scope.AdvertiseType)
                    .attr("fxs_json", FXStreet.Util.serializeJsonForAttr(json));

                var range = editor.getRange();
                editor.exec("insertHtml", { html: html[0].outerHTML, split: true, range: range });
                $scope.Ads_Popup.close();
            };

            $scope.labels = [];
            $scope.addLabel = function () {
                if (!$scope.labelKeyInput || !$scope.labelValueInput) {
                    alert('error');
                    return;
                }
                $scope.labels.push({ Key: $scope.labelKeyInput, Value: $scope.labelValueInput });
                $scope.labelKeyInput = '';
                $scope.labelValueInput = '';
            }

            $scope.removeLabel = function (index) {
                $scope.labels.splice(index, 1);
            };
        };

        _this.setImageLogic = function ($scope) {
            $scope.ImageSelector = function () {
                $scope.Image_Popup.open();
            };

            var setSizeOnImage = function (url, size) {
                var index = url.lastIndexOf(".");

                var result = url.substr(0, index) + "_" + size + url.substr(index, url.length);
                //result = result.replace(/\/images-input\//g, '/images/');
                return result;
            };

            $scope.OnImageSelected = function ($model) {

                var imageUrl = $model.Url;
                var imageSize = $scope.EditorialImageSizeToDisplayByDefault;

                if (imageUrl) {
                    $scope.ImageUrl = imageUrl;
                    $scope.ImageUrlThumbprint = setSizeOnImage(imageUrl, imageSize);
                }
            };

            $scope.ImageInsert = function () {

                var imageUrl = $scope.ImageUrl;
                var imageSize = $scope.ImageSize;
                var imageCaption = $scope.ImageCaption;

                var imageSelected = setSizeOnImage(imageUrl, imageSize);

                var imageHtml = $("<img>").attr("src", imageSelected).attr("alt", imageCaption);
                var html = $("<div>").attr("class", "fxs_entryFeatured_img").html(imageHtml);

                var range = editor.getRange();
                editor.exec("insertHtml", { html: html[0].outerHTML, split: true, range: range });
                $scope.Image_Popup.close();
            };

            $scope.RefreshImageList = function () {
                $.get($scope.EditorialImageRefreshMemoryCacheApiUrl).success(
                    function (data) {
                        $scope.ImageUrls = data;
                    }
                ).error(function (data) { });

            };

            $scope.dividerSelector = function () {
                $scope.Divider_Popup.open();
            };
        };

        _this.setDividersLogic = function ($scope) {
            $scope.DividerInsert = function () {
                var dividerClass = $scope.dividerType;

                var html = $("<hr>").attr("class", dividerClass);

                var range = editor.getRange();
                editor.exec("insertHtml", { html: html[0].outerHTML, split: true, range: range });
                $scope.Divider_Popup.close();
            };
        };

        parent.configureScope = function ($scope) {
            $scope.$on('kendoWidgetCreated', function (event, widget) {
                if (widget.wrapper && widget.wrapper.is('.k-editor')) {
                    editor = widget;
                }
            });

            _this.setAdvertiseLogic($scope);
            _this.setImageLogic($scope);
            _this.setDividersLogic($scope);
        };

        return _this;
    }
}());