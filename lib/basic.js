
/**
 * Basic Fm Object representing the location on DB
 * @contructor
 *
 * @param {Firebase} Firebase reference instance
 * @param {string} path to the Object which model stands for
 * @param {Object} Object literal to describe the structure of the model
 */
Fm.Basic = function(ref){
	// TODO eval blueprint
	// for value it is simple it is either primitive or object literal
	// all needed for literal is to store all properties
	// TODO deep nested eval
	
	if ( !ref || !ref.toString().match(/^https?:\/\//) ) throw new Fm.Exception("no valid firebase reference found");

	
	Object.defineProperties(this, {
		/**
		 * @access private
		 * @var {Object} contains event queues {string}:{Array}
		 */
		"__events": {
			enumerable: false,
			writable: true,
			configurable: true,
			value: {}
		},
		/**
		 * @access private
		 * @var {string} relative DB reference stored in factory
		 */
		"__url":{
			enumerable: false,
			writable: true,
			configurable: true,
			value: ref.toString()
		},
		/**
		 * @access private
		 * @var {Object} DB reference created from __url
		 */
		"__ref":{
			enumerable: false,
			writable: true, 
			configurable: false,
			value: ref
		}
	});

	//this.seal();
};


Fm.Basic.prototype.getRef = function(){
	return this.__ref;
};

/**
 * Sets the event handler or specified event
 * this sets multiple events if invoked multiple times
 *
 * @param {string} event identifier
 * @param {function} event handler
 * 
 * @return thsis or handler TODO
 */
Fm.Basic.prototype.on = function(event, handler){
	// TODO limit the events write_finished read_finished
	if (!this.__events[event]) {
		this.__events[event] = [];
	}
	this.__events[event].push(handler);
};

/**
 * Removes all occurances of handler from event queue
 * TODO
 * if event is not specified it will remove all queues for all events
 * <ul>events
 * <li>saved
 * <li>error
 * <li>refreshed
 *
 * @param {function} event handler
 * @return this
 */
Fm.Basic.prototype.off = function(event, handler){
	if (!this.__events[event]) return;
	this.__events[event].forEach(function(el, index){
		this.__events[event].splice(index,1);
	}.bind(this));
};

/**
 * triggers event on Fm.Model
 *
 * @this {Fm.Model}
 * @access private
 */
Fm.Basic.prototype.__trigger = function(event, prop){
	if(!this.__events[event]) return;
	this.__events[event].forEach(function(ev){
		// TODO can we explicitly giv this as context ?
		ev.call(this, prop);
	}.bind(this));
};


