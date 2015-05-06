/**
 * service returning the required priority for the key
 * can return ServerValue if needed;
 *
 * by default returns linux timestamp
 * TODO properly initialize with config block
 * so we can inject any type of service in it
 */
Fm.PriorityProvider = function(fn){
	this._provider = fn;

	Object.defineProperty(this, 'priority', {
		enumerable: true,
		configurable: true, 
		get: function(){
			return this._provider();
			//return fn();
			 },
		set: function(fn){
				 this._provdider = fn;
			 }
	});
};
