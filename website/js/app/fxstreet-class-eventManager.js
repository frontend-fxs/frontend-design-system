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