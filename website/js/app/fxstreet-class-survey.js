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