var dataSpreads;
function FilterValidSpreadsServers() {
    var filtered = dataSpreads.SpreadServer.filter(function (item) {
        return item !== -1;
    });
    dataSpreads.SpreadServer = filtered;
};
function CreateUrl() {
    var now = new Date();
    var time = now.getTime();
    var querystring = "https://spreads.myfxbook.com/api/get-spreads.html?";
    querystring += "mt4Servers=" + dataSpreads.SpreadServer.join(',');
    querystring += "&Symbols=" + dataSpreads.Symbols.join(',');
    querystring += "&callback=DataCallback";
    querystring += "&_=" + time;

    return querystring;
};
function PollSpreadsFinally() {
    if (dataSpreads.GetSpreadsIntervalInMilliseconds > 0) {
        setTimeout(PollSpreads, dataSpreads.GetSpreadsIntervalInMilliseconds);
    }
};
function PollSpreads() {
    var url = CreateUrl();
    importScripts(url);
};
function DataCallback(data) {
    self.postMessage(data);
    PollSpreadsFinally();
};
//Must be defined Execute function to be called into worker.js
function Execute(data){
    dataSpreads = data;
    FilterValidSpreadsServers();
    PollSpreads();
};