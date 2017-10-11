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