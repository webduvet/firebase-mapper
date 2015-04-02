/**
 * service returning the required priority for the key
 * can return ServerValue if needed;
 *
 * by default returns linux timestamp
 * TODO properly initialize with config block
 * so we can inject any type of service in it
 */
Fm.PriorityProvider = function(config){
	if (config && config.service) this.service = config.service;
	if (config && config.method) this.method = config.method;
};

Fm.PriorityProvider.priority = function(){
	return Date.now();
};

