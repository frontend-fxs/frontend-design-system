
if(typeof dojo!=='undefined'){dojo.provide('org.cometd');}
else{this.org=this.org||{};org.cometd={};}
this.com=this.com||{};this.com.teletrader=this.com.teletrader||{};org.cometd.JSON={};org.cometd.JSON.toJSON=org.cometd.JSON.fromJSON=function(object){throw'Abstract';};org.cometd.TransportRegistry=function(){var _types=[];var _transports={};this.getTransportTypes=function(){return _types.slice(0);};this.findTransportTypes=function(version,crossDomain){var result=[];for(var i=0;i<_types.length;++i){var type=_types[i];if(_transports[type].accept(version,crossDomain)){result.push(type);}}
return result;};this.negotiateTransport=function(supportedTypes,version,crossDomain){for(var i=0;i<_types.length;++i){var checkType=_types[i];if(supportedTypes.indexOf(checkType)==-1&&typeof(_transports[checkType].unregister)=="function"){_transports[checkType].unregister();}}
for(var t=0;t<_types.length;++i){var type=_types[t];for(var j=0;j<supportedTypes.length;++j){if(type==supportedTypes[j]){var transport=_transports[type];if(transport.accept(version,crossDomain)===true){return transport;}}}}
return null;};this.add=function(type,transport,index){var existing=false;for(var i=0;i<_types.length;++i){if(_types[i]==type){existing=true;break;}}
if(!existing){if(typeof index!=='number'){_types.push(type);}
else{_types.splice(index,0,type);}
_transports[type]=transport;}
return!existing;};this.remove=function(type){for(var i=0;i<_types.length;++i){if(_types[i]==type){_types.splice(i,1);var transport=_transports[type];delete _transports[type];return transport;}}
return null;};this.reset=function(){for(var i=0;i<_types.length;++i){_transports[_types[i]].reset();}};};org.cometd.Cometd=function(name){var _cometd=this;var _name=name||'default';var _logLevel;var _url;var _maxConnections;var _backoffIncrement;var _maxBackoff;var _reverseIncomingExtensions;var _maxNetworkDelay;var _requestHeaders;var _appendMessageTypeToURL;var _autoBatch;var _crossDomain=false;var _transports=new org.cometd.TransportRegistry();var _transport;var _status='disconnected';var _messageId=0;var _clientId=null;var _batch=0;var _messageQueue=[];var _internalBatch=false;var _listeners={};var _backoff=0;var _scheduledSend=null;var _extensions=[];var _advice={};var _handshakeProps;var _reestablish=false;var _connected=true;function _mixin(deep,target,objects){var result=target||{};for(var i=2;i<arguments.length;++i){var object=arguments[i];if(object===undefined||object===null){continue;}
for(var propName in object){var prop=object[propName];if(prop===target){continue;}
if(prop===undefined){continue;}
if(deep&&typeof prop==='object'&&prop!==null){if(prop instanceof Array){result[propName]=_mixin(deep,[],prop);}
else{result[propName]=_mixin(deep,{},prop);}}
else{result[propName]=prop;}}}
return result;}
this._mixin=_mixin;function _inArray(element,array){for(var i=0;i<array.length;++i){if(element==array[i]){return i;}}
return-1;}
function _isString(value){if(value===undefined||value===null){return false;}
return typeof value==='string'||value instanceof String;}
function _isArray(value){if(value===undefined||value===null){return false;}
return value instanceof Array;}
function _isFunction(value){if(value===undefined||value===null){return false;}
return typeof value==='function';}
function _log(level,args){if(window.console){var logger=window.console[level];if(_isFunction(logger)){logger.apply(window.console,args);}}}
function _warn(){_log('warn',arguments);}
this._warn=_warn;function _info(){if(_logLevel!='warn'){_log('info',arguments);}}
this._info=_info;function _debug(){if(_logLevel=='debug'){_log('debug',arguments);}}
this._debug=_debug;function _configure(configuration){_debug('Configuring cometd object with',configuration);if(_isString(configuration)){configuration={url:configuration};}
if(!configuration){configuration={};}
_url=configuration.url;if(!_url){throw'Missing required configuration parameter \'url\' specifying the Bayeux server URL';}
_maxConnections=configuration.maxConnections||2;_backoffIncrement=configuration.backoffIncrement||1000;_maxBackoff=configuration.maxBackoff||60000;_logLevel=configuration.logLevel||'info';_reverseIncomingExtensions=configuration.reverseIncomingExtensions!==false;_maxNetworkDelay=configuration.maxNetworkDelay||10000;_requestHeaders=configuration.requestHeaders||{};_appendMessageTypeToURL=configuration.appendMessageTypeToURL!==false;_autoBatch=configuration.autoBatch===true;var urlParts=/(^https?:)?(\/\/(([^:\/\?#]+)(:(\d+))?))?([^\?#]*)(.*)?/.exec(_url);_crossDomain=urlParts[3]&&urlParts[3]!=window.location.host;if(_appendMessageTypeToURL){if(urlParts[8]!==undefined&&urlParts[8]!==''){_info('Appending message type to URI '+urlParts[7]+urlParts[8]+' is not supported, disabling \'appendMessageTypeToURL\' configuration');_appendMessageTypeToURL=false;}
else{var uriSegments=urlParts[7].split('/');var lastSegmentIndex=uriSegments.length-1;if(urlParts[7].match(/\/$/)){lastSegmentIndex-=1;}
if(uriSegments[lastSegmentIndex].indexOf('.')>=0){_info('Appending message type to URI '+urlParts[7]+' is not supported, disabling \'appendMessageTypeToURL\' configuration');_appendMessageTypeToURL=false;}}}}
function _clearSubscriptions(){for(var channel in _listeners){var subscriptions=_listeners[channel];for(var i=0;i<subscriptions.length;++i){var subscription=subscriptions[i];if(subscription&&!subscription.listener){delete subscriptions[i];_debug('Removed subscription',subscription,'for channel',channel);}}}}
function _setStatus(newStatus){if(_status!=newStatus){_debug('Status',_status,'->',newStatus);_status=newStatus;}}
function _isDisconnected(){return _status=='disconnecting'||_status=='disconnected';}
function _nextMessageId(){return++_messageId;}
function _applyExtension(scope,callback,name,message,outgoing){try{return callback.call(scope,message);}
catch(x){_debug('Exception during execution of extension',name,x);var exceptionCallback=_cometd.onExtensionException;if(_isFunction(exceptionCallback)){_debug('Invoking extension exception callback',name,x);try{exceptionCallback.call(_cometd,x,name,outgoing,message);}
catch(xx){_info('Exception during execution of exception callback in extension',name,xx);}}
return message;}}
function _applyIncomingExtensions(message){for(var i=0;i<_extensions.length;++i){if(message===undefined||message===null){break;}
var index=_reverseIncomingExtensions?_extensions.length-1-i:i;var extension=_extensions[index];var callback=extension.extension.incoming;if(_isFunction(callback)){var result=_applyExtension(extension.extension,callback,extension.name,message,false);message=result===undefined?message:result;}}
return message;}
function _applyOutgoingExtensions(message){for(var i=0;i<_extensions.length;++i){if(message===undefined||message===null){break;}
var extension=_extensions[i];var callback=extension.extension.outgoing;if(_isFunction(callback)){var result=_applyExtension(extension.extension,callback,extension.name,message,true);message=result===undefined?message:result;}}
return message;}
function _convertToMessages(response){if(_isString(response)){try{return org.cometd.JSON.fromJSON(response);}
catch(x){_debug('Could not convert to JSON the following string','"'+response+'"');throw x;}}
if(_isArray(response)){return response;}
if(response===undefined||response===null){return[];}
if(response instanceof Object){return[response];}
throw'Conversion Error '+response+', typeof '+(typeof response);}
function _notify(channel,message){var subscriptions=_listeners[channel];if(subscriptions&&subscriptions.length>0){for(var i=0;i<subscriptions.length;++i){var subscription=subscriptions[i];if(subscription){try{subscription.callback.call(subscription.scope,message);}
catch(x){_debug('Exception during notification',subscription,message,x);var listenerCallback=_cometd.onListenerException;if(_isFunction(listenerCallback)){_debug('Invoking listener exception callback',subscription,x);try{listenerCallback.call(_cometd,x,subscription.handle,subscription.listener,message);}
catch(xx){_info('Exception during execution of listener callback',subscription,xx);}}}}}}}
function _notifyListeners(channel,message){_notify(channel,message);var channelParts=channel.split('/');var last=channelParts.length-1;for(var i=last;i>0;--i){var channelPart=channelParts.slice(0,i).join('/')+'/*';if(i==last){_notify(channelPart,message);}
channelPart+='*';_notify(channelPart,message);}}
function _setTimeout(funktion,delay){return setTimeout(function(){try{funktion();}
catch(x){_debug('Exception invoking timed function',funktion,x);}},delay);}
function _cancelDelayedSend(){if(_scheduledSend!==null){clearTimeout(_scheduledSend);}
_scheduledSend=null;}
function _delayedSend(operation){_cancelDelayedSend();var delay=_backoff;if(_advice.interval&&_advice.interval>0){delay+=_advice.interval;}
_scheduledSend=_setTimeout(operation,delay);}
var _handleResponse;var _handleFailure;function _send(sync,messages,longpoll,extraPath){for(var i=0;i<messages.length;++i){var message=messages[i];message.id=''+_nextMessageId();if(_clientId){message.clientId=_clientId;}
message=_applyOutgoingExtensions(message);if(message!==undefined&&message!==null){messages[i]=message;}
else{messages.splice(i--,1);}}
if(messages.length===0){return;}
var url=_url;if(_appendMessageTypeToURL){if(!url.match(/\/$/)){url=url+'/';}
if(extraPath){url=url+extraPath;}}
var envelope={url:url,sync:sync,messages:messages,onSuccess:function(request,response){try{_handleResponse.call(_cometd,request,response,longpoll);}
catch(x){_debug('Exception during handling of response',x);}},onFailure:function(request,reason,exception){try{_handleFailure.call(_cometd,request,messages,reason,exception,longpoll);}
catch(x){_debug('Exception during handling of failure',x);}}};_debug('Send, sync='+sync,envelope);_transport.send(envelope,longpoll);}
function _queueSend(message){if(_batch>0||_internalBatch===true){_messageQueue.push(message);}
else{_send(false,[message],false);}}
this.send=_queueSend;function _resetBackoff(){_backoff=0;}
function _increaseBackoff(){if(_backoff<_maxBackoff){_backoff+=_backoffIncrement;}}
function _startBatch(){++_batch;}
function _flushBatch(){var messages=_messageQueue;_messageQueue=[];if(messages.length>0){_send(false,messages,false);}}
function _endBatch(){--_batch;if(_batch<0){throw'Calls to startBatch() and endBatch() are not paired';}
if(_batch===0&&!_isDisconnected()&&!_internalBatch){_flushBatch();}}
function _connect(){if(!_isDisconnected()){var message={channel:'/meta/connect',connectionType:_transport.getType()};if(!_connected){_connected=true;message.advice={timeout:0};}
_setStatus('connecting');_debug('Connect sent',message);_send(false,[message],true,'connect');_setStatus('connected');}}
function _delayedConnect(){_setStatus('connecting');_delayedSend(function(){_connect();});}
function _handshake(handshakeProps){_clientId=null;_clearSubscriptions();if(_isDisconnected()){_transports.reset();}
_batch=0;_internalBatch=true;_handshakeProps=handshakeProps;var version='1.0';var transportTypes=_transports.findTransportTypes(version,_crossDomain);var bayeuxMessage={version:version,minimumVersion:'0.9',channel:'/meta/handshake',supportedConnectionTypes:transportTypes};var message=_mixin(false,{},_handshakeProps,bayeuxMessage);_transport=_transports.negotiateTransport(transportTypes,version,_crossDomain);_debug('Initial transport is',_transport);_setStatus('handshaking');_debug('Handshake sent',message);_send(false,[message],false,'handshake');}
function _delayedHandshake(){_setStatus('handshaking');_internalBatch=true;_delayedSend(function(){_handshake(_handshakeProps);});}
function _handshakeResponse(message){if(message.successful){_clientId=message.clientId;var newTransport=_transports.negotiateTransport(message.supportedConnectionTypes,message.version,_crossDomain);if(newTransport===null){throw'Could not negotiate transport with server; client '+
_transports.findTransportTypes(message.version,_crossDomain)+', server '+message.supportedConnectionTypes;}
else if(_transport!=newTransport){_debug('Transport',_transport,'->',newTransport);_transport=newTransport;}
_internalBatch=false;_flushBatch();message.reestablish=_reestablish;_reestablish=true;_notifyListeners('/meta/handshake',message);if(!_isDisconnected()){if(_advice.reconnect!='none'){_resetBackoff();_delayedConnect();}
else{_resetBackoff();_setStatus('disconnected');}}}
else{_notifyListeners('/meta/handshake',message);_notifyListeners('/meta/unsuccessful',message);if(!_isDisconnected()){if(_advice.reconnect!='none'){_increaseBackoff();_delayedHandshake();}
else{_resetBackoff();_setStatus('disconnected');}}}}
function _handshakeFailure(xhr,message){var failureMessage={successful:false,failure:true,channel:'/meta/handshake',request:message,xhr:xhr,advice:{reconnect:'retry',interval:_backoff}};_notifyListeners('/meta/handshake',failureMessage);_notifyListeners('/meta/unsuccessful',failureMessage);if(!_isDisconnected()){if(_advice.reconnect!='none'){_increaseBackoff();_delayedHandshake();}
else{_resetBackoff();_setStatus('disconnected');}}}
function _connectResponse(message){_connected=message.successful;if(_connected){_notifyListeners('/meta/connect',message);if(!_isDisconnected()){if(!_advice.reconnect||_advice.reconnect=='retry'){_resetBackoff();_delayedConnect();}
else{_resetBackoff();_setStatus('disconnected');}}}
else{_info('Connect failed:',message.error);_notifyListeners('/meta/connect',message);_notifyListeners('/meta/unsuccessful',message);if(!_isDisconnected()){var action=_advice.reconnect?_advice.reconnect:'retry';switch(action){case'retry':_increaseBackoff();_delayedConnect();break;case'handshake':_resetBackoff();_delayedHandshake();break;case'none':_resetBackoff();_setStatus('disconnected');break;default:_info('Unrecognized advice action',action);break;}}}}
function _connectFailure(xhr,message){_connected=false;var failureMessage={successful:false,failure:true,channel:'/meta/connect',request:message,xhr:xhr,advice:{reconnect:'retry',interval:_backoff}};_notifyListeners('/meta/connect',failureMessage);_notifyListeners('/meta/unsuccessful',failureMessage);if(!_isDisconnected()){var action=_advice.reconnect?_advice.reconnect:'retry';switch(action){case'retry':_increaseBackoff();_delayedConnect();break;case'handshake':_resetBackoff();_delayedHandshake();break;case'none':_resetBackoff();_setStatus('disconnected');break;default:_info('Unrecognized advice action',action);break;}}}
function _disconnect(abort){_cancelDelayedSend();if(abort){_transport.abort();}
_clientId=null;_setStatus('disconnected');_batch=0;_messageQueue=[];_resetBackoff();}
function _disconnectResponse(message){if(message.successful){_disconnect(false);_notifyListeners('/meta/disconnect',message);}
else{_disconnect(true);_notifyListeners('/meta/disconnect',message);_notifyListeners('/meta/unsuccessful',message);}}
function _disconnectFailure(xhr,message){_disconnect(true);var failureMessage={successful:false,failure:true,channel:'/meta/disconnect',request:message,xhr:xhr,advice:{reconnect:'none',interval:0}};_notifyListeners('/meta/disconnect',failureMessage);_notifyListeners('/meta/unsuccessful',failureMessage);}
function _subscribeResponse(message){if(message.successful){_notifyListeners('/meta/subscribe',message);}
else{_info('Subscription to',message.subscription,'failed:',message.error);_notifyListeners('/meta/subscribe',message);_notifyListeners('/meta/unsuccessful',message);}}
function _subscribeFailure(xhr,message){var failureMessage={successful:false,failure:true,channel:'/meta/subscribe',request:message,xhr:xhr,advice:{reconnect:'none',interval:0}};_notifyListeners('/meta/subscribe',failureMessage);_notifyListeners('/meta/unsuccessful',failureMessage);}
function _unsubscribeResponse(message){if(message.successful){_notifyListeners('/meta/unsubscribe',message);}
else{_info('Unsubscription to',message.subscription,'failed:',message.error);_notifyListeners('/meta/unsubscribe',message);_notifyListeners('/meta/unsuccessful',message);}}
function _unsubscribeFailure(xhr,message){var failureMessage={successful:false,failure:true,channel:'/meta/unsubscribe',request:message,xhr:xhr,advice:{reconnect:'none',interval:0}};_notifyListeners('/meta/unsubscribe',failureMessage);_notifyListeners('/meta/unsuccessful',failureMessage);}
function _messageResponse(message){if(message.successful===undefined){if(message.data){_notifyListeners(message.channel,message);}
else{_debug('Unknown message',message);}}
else{if(message.successful){_notifyListeners('/meta/publish',message);}
else{_info('Publish failed:',message.error);_notifyListeners('/meta/publish',message);_notifyListeners('/meta/unsuccessful',message);}}}
function _messageFailure(xhr,message){var failureMessage={successful:false,failure:true,channel:message.channel,request:message,xhr:xhr,advice:{reconnect:'none',interval:0}};_notifyListeners('/meta/publish',failureMessage);_notifyListeners('/meta/unsuccessful',failureMessage);}
function _receive(message){message=_applyIncomingExtensions(message);if(message===undefined||message===null){return;}
if(message.advice){_advice=message.advice;}
var channel=message.channel;switch(channel){case'/meta/handshake':_handshakeResponse(message);break;case'/meta/connect':_connectResponse(message);break;case'/meta/disconnect':_disconnectResponse(message);break;case'/meta/subscribe':_subscribeResponse(message);break;case'/meta/unsubscribe':_unsubscribeResponse(message);break;default:_messageResponse(message);break;}}
this.receive=_receive;_handleResponse=function _handleResponse(request,response,longpoll){var messages=_convertToMessages(response);_debug('Received',response,'converted to',messages);_transport.complete(request,true,longpoll);for(var i=0;i<messages.length;++i){var message=messages[i];_receive(message);}};_handleFailure=function _handleFailure(request,messages,reason,exception,longpoll){var xhr=request.xhr;_debug('Failed',messages);_transport.complete(request,false,longpoll);for(var i=0;i<messages.length;++i){var message=messages[i];var channel=message.channel;switch(channel){case'/meta/handshake':_handshakeFailure(xhr,message);break;case'/meta/connect':_connectFailure(xhr,message);break;case'/meta/disconnect':_disconnectFailure(xhr,message);break;case'/meta/subscribe':_subscribeFailure(xhr,message);break;case'/meta/unsubscribe':_unsubscribeFailure(xhr,message);break;default:_messageFailure(xhr,message);break;}}};function _hasSubscriptions(channel){var subscriptions=_listeners[channel];if(subscriptions){for(var i=0;i<subscriptions.length;++i){if(subscriptions[i]){return true;}}}
return false;}
function _resolveScopedCallback(scope,callback){var delegate={scope:scope,method:callback};if(_isFunction(scope)){delegate.scope=undefined;delegate.method=scope;}
else{if(_isString(callback)){if(!scope){throw'Invalid scope '+scope;}
delegate.method=scope[callback];if(!_isFunction(delegate.method)){throw'Invalid callback '+callback+' for scope '+scope;}}
else if(!_isFunction(callback)){throw'Invalid callback '+callback;}}
return delegate;}
function _addListener(channel,scope,callback,isListener){var delegate=_resolveScopedCallback(scope,callback);_debug('Adding listener on',channel,'with scope',delegate.scope,'and callback',delegate.method);var subscription={channel:channel,scope:delegate.scope,callback:delegate.method,listener:isListener};var subscriptions=_listeners[channel];if(!subscriptions){subscriptions=[];_listeners[channel]=subscriptions;}
var subscriptionID=subscriptions.push(subscription)-1;subscription.id=subscriptionID;subscription.handle=[channel,subscriptionID];_debug('Added listener',subscription,'for channel',channel,'having id =',subscriptionID);return subscription.handle;}
function _removeListener(subscription){var subscriptions=_listeners[subscription[0]];if(subscriptions){delete subscriptions[subscription[1]];_debug('Removed listener',subscription);}}
this.registerTransport=function(type,transport,index){var result=_transports.add(type,transport,index);if(result){_debug('Registered transport',type);if(_isFunction(transport.registered)){transport.registered(type,this);}}
return result;};this.getTransportTypes=function(){return _transports.getTransportTypes();};this.unregisterTransport=function(type){var transport=_transports.remove(type);if(transport!==null){_debug('Unregistered transport',type);if(_isFunction(transport.unregistered)){transport.unregistered();}}
return transport;};this.configure=function(configuration){_configure.call(this,configuration);};this.init=function(configuration,handshakeProps){this.configure(configuration);this.handshake(handshakeProps);};this.handshake=function(handshakeProps){_setStatus('disconnected');_reestablish=false;_handshake(handshakeProps);};this.disconnect=function(sync,disconnectProps){if(_isDisconnected()){return;}
if(disconnectProps===undefined){if(typeof sync!=='boolean'){disconnectProps=sync;sync=false;}}
var bayeuxMessage={channel:'/meta/disconnect'};var message=_mixin(false,{},disconnectProps,bayeuxMessage);_setStatus('disconnecting');_send(sync===true,[message],false,'disconnect');};this.startBatch=function(){_startBatch();};this.endBatch=function(){_endBatch();};this.batch=function(scope,callback){var delegate=_resolveScopedCallback(scope,callback);this.startBatch();try{delegate.method.call(delegate.scope);this.endBatch();}
catch(x){_debug('Exception during execution of batch',x);this.endBatch();throw x;}};this.addListener=function(channel,scope,callback){if(arguments.length<2){throw'Illegal arguments number: required 2, got '+arguments.length;}
if(!_isString(channel)){throw'Illegal argument type: channel must be a string';}
return _addListener(channel,scope,callback,true);};this.removeListener=function(subscription){if(!_isArray(subscription)){throw'Invalid argument: expected subscription, not '+subscription;}
_removeListener(subscription);};this.clearListeners=function(){_listeners={};};this.subscribe=function(channel,scope,callback,subscribeProps){if(arguments.length<2){throw'Illegal arguments number: required 2, got '+arguments.length;}
if(!_isString(channel)){throw'Illegal argument type: channel must be a string';}
if(_isDisconnected()){throw'Illegal state: already disconnected';}
if(_isFunction(scope)){subscribeProps=callback;callback=scope;scope=undefined;}
var subscription=_addListener(channel,scope,callback,false);var bayeuxMessage={channel:'/meta/subscribe',subscription:channel};var message=_mixin(false,{},subscribeProps,bayeuxMessage);_queueSend(message);return subscription;};this.unsubscribe=function(subscription,unsubscribeProps){if(arguments.length<1){throw'Illegal arguments number: required 1, got '+arguments.length;}
if(_isDisconnected()){throw'Illegal state: already disconnected';}
this.removeListener(subscription);var channel=subscription[0];if(!_hasSubscriptions(channel)){var bayeuxMessage={channel:'/meta/unsubscribe',subscription:channel};var message=_mixin(false,{},unsubscribeProps,bayeuxMessage);_queueSend(message);}};this.clearSubscriptions=function(){_clearSubscriptions();};this.publish=function(channel,content,publishProps){if(arguments.length<1){throw'Illegal arguments number: required 1, got '+arguments.length;}
if(!_isString(channel)){throw'Illegal argument type: channel must be a string';}
if(_isDisconnected()){throw'Illegal state: already disconnected';}
var bayeuxMessage={channel:channel,data:content};var message=_mixin(false,{},publishProps,bayeuxMessage);_queueSend(message);};this.getStatus=function(){return _status;};this.isDisconnected=_isDisconnected;this.setBackoffIncrement=function(period){_backoffIncrement=period;};this.getBackoffIncrement=function(){return _backoffIncrement;};this.getBackoffPeriod=function(){return _backoff;};this.setLogLevel=function(level){_logLevel=level;};this.registerExtension=function(name,extension){if(arguments.length<2){throw'Illegal arguments number: required 2, got '+arguments.length;}
if(!_isString(name)){throw'Illegal argument type: extension name must be a string';}
var existing=false;for(var i=0;i<_extensions.length;++i){var existingExtension=_extensions[i];if(existingExtension.name==name){existing=true;break;}}
if(!existing){_extensions.push({name:name,extension:extension});_debug('Registered extension',name);if(_isFunction(extension.registered)){extension.registered(name,this);}
return true;}
else{_info('Could not register extension with name',name,'since another extension with the same name already exists');return false;}};this.unregisterExtension=function(name){if(!_isString(name)){throw'Illegal argument type: extension name must be a string';}
var unregistered=false;for(var i=0;i<_extensions.length;++i){var extension=_extensions[i];if(extension.name==name){_extensions.splice(i,1);unregistered=true;_debug('Unregistered extension',name);var ext=extension.extension;if(_isFunction(ext.unregistered)){ext.unregistered();}
break;}}
return unregistered;};this.getExtension=function(name){for(var i=0;i<_extensions.length;++i){var extension=_extensions[i];if(extension.name==name){return extension.extension;}}
return null;};this.getName=function(){return _name;};this.getClientId=function(){return _clientId;};this.getURL=function(){return _url;};this.getTransport=function(){return _transport;};org.cometd.Transport=function(){var self=this;var _type;var _requestIds=0;var _longpollRequest=null;var _requests=[];var _envelopes=[];this.registered=function(type,cometd){_type=type;};this.unregistered=function(){_type=null;};this.unregister=function(){throw'Abstract';};this.accept=function(version,crossDomain){throw'Abstract';};this.transportSend=function(envelope,request){throw'Abstract';};this.transportSuccess=function(envelope,request,response){if(!request.expired){clearTimeout(request.timeout);if(response&&response.length>0){envelope.onSuccess(request,response);}
else{envelope.onFailure(request,'Empty HTTP response');}}};this.transportFailure=function(envelope,request,reason,exception){if(!request.expired){clearTimeout(request.timeout);envelope.onFailure(request,reason,exception);}};function _transportSend(envelope,request){request.expired=false;this.transportSend(envelope,request);if(!envelope.sync){var delay=_maxNetworkDelay;if(request.longpoll===true){delay+=_advice&&typeof _advice.timeout==='number'?_advice.timeout:0;}
request.timeout=_setTimeout(function(){request.expired=true;if(request.xhr){_debug('Abort xhr request!');request.xhr.abort();}
var errorMessage='Transport '+self.getType()+' exceeded '+delay+' ms max network delay for request '+request.id;_debug(errorMessage);envelope.onFailure(request,'timeout',errorMessage);},delay);}}
function _longpollSend(envelope){if(_longpollRequest!==null){throw'Concurrent longpoll requests not allowed, request '+_longpollRequest.id+' not yet completed';}
var requestId=++_requestIds;var request={id:requestId,longpoll:true};_transportSend.call(this,envelope,request);_longpollRequest=request;}
function _queueSend(envelope){var requestId=++_requestIds;var request={id:requestId,longpoll:false};if(_requests.length<_maxConnections-1){_debug('Transport sending request',requestId,envelope);_transportSend.call(this,envelope,request);_requests.push(request);}
else{_debug('Transport queueing request',requestId,envelope);_envelopes.push([envelope,request]);}}
function _longpollComplete(request){var requestId=request.id;if(_longpollRequest!==null&&_longpollRequest!==request){throw'Longpoll request mismatch, completing request '+requestId;}
_longpollRequest=null;}
function _coalesceEnvelopes(envelope){while(_envelopes.length>0){var envelopeAndRequest=_envelopes[0];var newEnvelope=envelopeAndRequest[0];var newRequest=envelopeAndRequest[1];if(newEnvelope.url===envelope.url&&newEnvelope.sync===envelope.sync){_envelopes.shift();envelope.messages=envelope.messages.concat(newEnvelope.messages);_debug('Coalesced',newEnvelope.messages.length,'messages from request',newRequest.id);continue;}
break;}}
function _complete(request,success){var index=_inArray(request,_requests);if(index>=0){_requests.splice(index,1);}
if(_envelopes.length>0){var envelopeAndRequest=_envelopes.shift();var nextEnvelope=envelopeAndRequest[0];var nextRequest=envelopeAndRequest[1];_debug('Transport dequeued request',nextRequest.id);if(success){if(_autoBatch){_coalesceEnvelopes(nextEnvelope);}
_queueSend.call(this,nextEnvelope);_debug('Transport completed request',request.id,nextEnvelope);}
else{setTimeout(function(){nextEnvelope.onFailure(nextRequest,'error');},0);}}}
this.getType=function(){return _type;};this.send=function(envelope,longpoll){if(longpoll){_longpollSend.call(this,envelope);}
else{_queueSend.call(this,envelope);}};this.complete=function(request,success,longpoll){if(longpoll){_longpollComplete.call(this,request);}
else{_complete.call(this,request,success);}};this.abort=function(){for(var i=0;i<_requests.length;++i){var request=_requests[i];_debug('Aborting request',request);if(request.xhr){request.xhr.abort();}}
if(_longpollRequest){_debug('Aborting longpoll request',_longpollRequest);if(_longpollRequest.xhr){_longpollRequest.xhr.abort();}}
this.reset();};this.reset=function(){_longpollRequest=null;_requests=[];_envelopes=[];};this.toString=function(){return this.getType();};};org.cometd.LongPollingTransport=function(){var self=this;var _supportsCrossDomain=true;this.accept=function(version,crossDomain){return _supportsCrossDomain||!crossDomain;};this.unregister=function(){_cometd.unregisterTransport(_type);};this.xhrSend=function(packet){throw'Abstract';};this.transportSend=function(envelope,request){try{var sameStack=true;request.xhr=this.xhrSend({transport:this,url:envelope.url,sync:envelope.sync,headers:_requestHeaders,body:org.cometd.JSON.toJSON(envelope.messages),onSuccess:function(response){if(!response||response.length===0){_supportsCrossDomain=false;}
self.transportSuccess(envelope,request,response);},onError:function(reason,exception){_supportsCrossDomain=false;if(sameStack){_setTimeout(function(){self.transportFailure(envelope,request,reason,exception);},0);}
else{self.transportFailure(envelope,request,reason,exception);}}});sameStack=false;}
catch(x){_supportsCrossDomain=false;_setTimeout(function(){self.transportFailure(envelope,request,'error',x);},0);}};this.reset=function(){org.cometd.LongPollingTransport.prototype.reset();_supportsCrossDomain=true;};};org.cometd.LongPollingTransport.prototype=new org.cometd.Transport();org.cometd.LongPollingTransport.prototype.constructor=org.cometd.LongPollingTransport;org.cometd.CallbackPollingTransport=function(){var self=this;var _maxLength=2000;this.accept=function(version,crossDomain){return true;};this.jsonpSend=function(packet){throw'Abstract';};this.unregister=function(){_cometd.unregisterTransport(_type);};this.transportSend=function(envelope,request){var messages=org.cometd.JSON.toJSON(envelope.messages);var urlLength=envelope.url.length+encodeURI(messages).length;if(urlLength>_maxLength){var x=envelope.messages.length>1?'Too many bayeux messages in the same batch resulting in message too big '+'('+urlLength+' bytes, max is '+_maxLength+') for transport '+this.getType():'Bayeux message too big ('+urlLength+' bytes, max is '+_maxLength+') '+'for transport '+this.getType();_setTimeout(function(){self.transportFailure(envelope,request,'error',x);},0);}
else{try{var sameStack=true;this.jsonpSend({transport:this,url:envelope.url,sync:envelope.sync,headers:_requestHeaders,body:messages,onSuccess:function(response){self.transportSuccess(envelope,request,response);},onError:function(reason,exception){if(sameStack){_setTimeout(function(){self.transportFailure(envelope,request,reason,exception);},0);}
else{self.transportFailure(envelope,request,reason,exception);}}});sameStack=false;}
catch(xx){_setTimeout(function(){self.transportFailure(envelope,request,'error',xx);},0);}}};};org.cometd.CallbackPollingTransport.prototype=new org.cometd.Transport();org.cometd.CallbackPollingTransport.prototype.constructor=org.cometd.CallbackPollingTransport;com.teletrader.XHRStreamingTransport=function(){var self=this;var DELIMITER='//--tt--//';var _packet;var _streaming;var _connectIssued=false;var _callingConnectDueToFalse=false;var _consecutiveConnectsReceived=0;var _dontReconnectOnPageRefresh=false;var _connectsReceived=0;var _handshakeReceived=false;var _paddingReceived=false;var _setFallback=false;var _supportsStreaming=true;var _cookieName="cometdStreamingSupported";var _supportsStreaming=streamingCookie()!==null?streamingCookie():true;var _connectListener=_cometd.addListener('/meta/connect',function(message){if(message&&message.successful){if(message.successful===true&&_consecutiveConnectsReceived<2){_consecutiveConnectsReceived++;}else if(message.successful===false){if(_advice&&_advice.reconnect&&_advice.reconnect!="handshake"){_advice.interval=1000;_advice.reconnect="retry";}}}});this.accept=function(version,crossDomain){if(navigator.appVersion.indexOf("MSIE 7.")!=-1){return false;}
if(!_supportsStreaming){return false;}
if(!crossDomain){return true;}
return true;};this.xhrSend=function(packet){throw'Abstract';};this.unregister=function(){_supportsStreaming=false;streamingCookie(false);_cometd.unregisterTransport('xhr-streaming');};this.transportSend=function(envelope,request){var _handshakeListener=_cometd.addListener('/meta/handshake',function(message){if(message&&message.successful&&message.successful===true){_consecutiveConnectsReceived=0;}
if(!_handshakeReceived){setTimeout(function(){_debug('Pedding Received: '+_paddingReceived);if(!_paddingReceived&&_supportsStreaming){_supportsStreaming=false;streamingCookie(false);_cometd.unregisterTransport('xhr-streaming');setTimeout(function(){_delayedHandshake();},0);}},5000);_handshakeReceived=true;}});try{var sameStack=true;if(envelope.messages[0].channel=='/meta/connect'){if(_callingConnectDueToFalse===false){_connectIssued=true;}else if(_callingConnectDueToFalse===true){_callingConnectDueToFalse=false;}}
this.xhrSend({transport:this,url:envelope.url,sync:envelope.sync,headers:_requestHeaders,body:org.cometd.JSON.toJSON(envelope.messages),onSuccess:function(response){response=_convertToMessages(response);if(response[0].channel=='/meta/connect'){if(response[0].successful){_connectsReceived++;}
if(!_paddingReceived&&response.length>1&&response[1].channel==='/service/padding'){_paddingReceived=true;}}
self.transportSuccess(envelope,request,response);},onError:function(reason,exception){if(sameStack){setTimeout(function(){self.transportFailure(envelope,request,reason,exception);},0);}
else{self.transportFailure(envelope,request,reason,exception);}}});sameStack=false;}
catch(x){setTimeout(function(){self.transportFailure(envelope,request,'error',x);},0);}};this.reset=function(){com.teletrader.XHRStreamingTransport.prototype.reset();};this.xhrSend=function(packet){if(isSubscribe(packet.body)||isUnsubscribe(packet.body)){this.xhrIframeStream(packet,false);}
else if(isConnect(packet.body)){this.xhrIframeStream(packet,true);}else{this.jsonpSend({url:packet.url,sync:packet.sync,body:packet.body,onSuccess:packet.onSuccess,onError:packet.onError});}};this.xhrIframeStream=function(packet,streaming){_packet=packet;_streaming=streaming;startStreaming();};this.xhrStream=function(packet,streaming){var xhr;var paketOnErrorCalled;var index=0;if(window.XDomainRequest){_debug('new XDomainRequest '+packet.url);xhr=new XDomainRequest();xhr.open('POST',packet.url,!packet.sync);}else{_debug('new XMLHttpRequest '+packet.url);xhr=new XMLHttpRequest();xhr.open('POST',packet.url,!packet.sync);xhr.setRequestHeader("Content-type","application/x-www-form-urlencoded");}
_setHeaders(xhr,packet.headers);var preventSetError=false;var disconnectListener=_cometd.addListener('/meta/disconnect',function(message){if(message.successful){_advice.interval=1000;preventSetError=true;xhr.abort();xhr=null;index=0;_cometd.removeListener(disconnectListener);}});var isIE11=!!navigator.userAgent.match(/Trident\/7\./);if(window.XDomainRequest&&!isIE11){xhr.ontimeout=function(){};xhr.onerror=function(){if(!_dontReconnectOnPageRefresh){_callingConnectDueToFalse=true;if(_advice){_advice.interval=1000;}
packet.onError('unexpected error',null);}
_connectIssued=false;if(streaming){xhr.abort();xhr.onerror=null;xhr.onload=null;xhr.onprogress=null;xhr=null;index=0;}};xhr.onload=function(){if(!_dontReconnectOnPageRefresh){if(xhr.responseText.indexOf(DELIMITER)!=-1){index=handlePartialResponse(xhr,packet,index);}else{packet.onSuccess(xhr.responseText.replace(DELIMITER,""));}
$(document).trigger("xdr_complete");if(streaming){xhr.abort();xhr.onerror=null;xhr.onload=null;xhr.onprogress=null;xhr=null;index=0;}}};xhr.onprogress=function(){index=handlePartialResponse(xhr,packet,index);};xhr.timeout=0;}else{paketOnErrorCalled=false;xhr.onerror=function(evt){if(!_dontReconnectOnPageRefresh){if(_advice){_advice.interval=0;_advice.reconnect="retry";}
if(!paketOnErrorCalled&&!preventSetError){packet.onError('unexpected error',null);paketOnErrorCalled=true;}}};xhr.onabort=function(evt){if(!_dontReconnectOnPageRefresh){if(_advice){_advice.interval=0;_advice.reconnect="retry";}
if(!paketOnErrorCalled&&!preventSetError){packet.onError('unexpected abort',null);paketOnErrorCalled=true;}}};xhr.onload=function(evt){var xhr=evt.target;_debug('xhr.onload');};xhr.onclose=function(evt){var xhr=evt.target;_debug('xhr.onclose');};xhr.onreadystatechange=function(evt){var xhr=evt.target;if(xhr.readyState===3&&streaming){if(xhr.status===200){index=handlePartialResponse(xhr,packet,index);}else{packet.onError('unexpected error',null);}}
else if(xhr.readyState===4){if(xhr.status===200){if(streaming){if(!_dontReconnectOnPageRefresh){_callingConnectDueToFalse=true;if(_advice){_advice.interval=1000;}
if(xhr.responseText.indexOf(DELIMITER)!=-1){index=handlePartialResponse(xhr,packet,index);}else{packet.onSuccess(xhr.responseText.replace(DELIMITER,""));}}
xhr=null;index=0;}else{packet.onSuccess(xhr.responseText);}}else{if(!_dontReconnectOnPageRefresh){if(streaming){xhr=null;index=0;}
if(_advice){_advice.interval=1000;}
if(!paketOnErrorCalled&&!preventSetError){packet.onError('unexpected error',null);paketOnErrorCalled=true;}}}}};}
setTimeout(function(){xhr.send(packet.body);},0);if(window.XDomainRequest){$(document).bind("xdr_complete",function(){});}};function startStreaming(){self.xhrStream(_packet,_streaming);_packet=undefined;_streaming=undefined;}
function handlePartialResponse(xhr,packet,index){var i=xhr.responseText.indexOf(DELIMITER,index);while(i>index){var buffer=xhr.responseText.slice(index,i);try{JSON.parse(buffer);}catch(e){_debug('Could not convert to JSON the following string','"'+buffer+'"');}
index=i+DELIMITER.length;packet.onSuccess(buffer);i=xhr.responseText.indexOf(DELIMITER,index);}
return index;}
function isHandshake(message){return message.indexOf('/meta/handshake')!=-1;}
function isSubscribe(message){return message.indexOf('/meta/subscribe')!=-1;}
function isUnsubscribe(message){return message.indexOf('/meta/unsubscribe')!=-1;}
function isConnect(message){return message.indexOf('/meta/connect')!=-1;}
function isDisconnect(message){return message.indexOf('/meta/disconnect')!=-1;}
function _setHeaders(xhr,headers){if(headers){for(var headerName in headers){if(headerName.toLowerCase()==='content-type'){continue;}
xhr.setRequestHeader(headerName,headers[headerName]);}}}
function streamingCookie(streamingSupported){if(typeof streamingSupported==='boolean'){document.cookie=_cookieName+"="+streamingSupported;}else{var cookies=document.cookie.split(';');for(i=0;i<cookies.length;i++){var cookieSplit=cookies[i].split('=');if(cookieSplit.length==2&&cookieSplit[0].search(_cookieName)!=-1){return cookieSplit[1].search('true')!=-1?true:false;}}
return null;}}
function setEvent(element,event,handler){if(element.addEventListener){element.addEventListener(event,handler,false);}else if(element.attachEvent){element.attachEvent('on'+event,handler);}};setEvent(window,'beforeunload',function(){_dontReconnectOnPageRefresh=true;});};com.teletrader.XHRStreamingTransport.prototype=new org.cometd.Transport();com.teletrader.XHRStreamingTransport.prototype.constructor=com.teletrader.XHRStreamingTransport;};