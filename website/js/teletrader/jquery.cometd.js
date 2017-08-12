
(function($)
{org.cometd.JSON.toJSON=JSON.stringify;org.cometd.JSON.fromJSON=JSON.parse;function _setHeaders(xhr,headers)
{if(headers)
{for(var headerName in headers)
{if(headerName.toLowerCase()==='content-type')
{continue;}
xhr.setRequestHeader(headerName,headers[headerName]);}}}
$.cometd=new org.cometd.Cometd();$.cometd.LongPollingTransport=function()
{this.xhrSend=function(packet)
{return $.ajax({url:packet.url,async:packet.sync!==true,type:'POST',contentType:'application/json;charset=UTF-8',data:packet.body,beforeSend:function(xhr)
{_setHeaders(xhr,packet.headers);return true;},success:packet.onSuccess,error:function(xhr,reason,exception)
{packet.onError(reason,exception);}});};};$.cometd.LongPollingTransport.prototype=new org.cometd.LongPollingTransport();$.cometd.LongPollingTransport.prototype.constructor=$.cometd.LongPollingTransport;$.cometd.CallbackPollingTransport=function()
{this.jsonpSend=function(packet)
{$.ajax({url:packet.url,async:packet.sync!==true,type:'GET',dataType:'jsonp',jsonp:'jsonp',data:{message:packet.body},beforeSend:function(xhr)
{_setHeaders(xhr,packet.headers);return true;},success:packet.onSuccess,error:function(xhr,reason,exception)
{packet.onError(reason,exception);}});};};$.cometd.CallbackPollingTransport.prototype=new org.cometd.CallbackPollingTransport();$.cometd.CallbackPollingTransport.prototype.constructor=$.cometd.CallbackPollingTransport;$.cometd.registerTransport('callback-polling',new $.cometd.CallbackPollingTransport());$.cometd.registerTransport('long-polling',new $.cometd.LongPollingTransport());})(jQuery);