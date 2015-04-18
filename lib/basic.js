
/**
 * Creates a new model
 * @contructor
 *
 * @param {Firebase} Firebase reference instance
 * @param {string} path to the Object which model stands for
 * @param {Object} Object literal to describe the structure of the model
 */
Fm.Basic = function(ref, blueprint){
	// TODO eval blueprint
	// for value it is simple it is either primitive or object literal
	// all needed for literal is to store all properties
	// TODO deep nested eval
	
	if ( !blueprint ) throw new Fm.Exception("no valid blueprint found");
	if ( !ref || !ref.toString().match(/^https?:\/\//) ) throw new Fm.Exception("no valid firebase reference found");

	defineProperties(this);

    Object.defineProperty(this, '_watchedLocal', {
    });

	if (blueprint === 'bool') {
		console.log('tada, padla kosa na kamen......');
	}

    for ( var key in blueprint ) {
		setKey.call(this, key, blueprint);
    }

	function setKey(key, bp){
		var _value = bp[key];
		// TODO get rid of this it's useless
		if ( Array.isArray( bp[key] ) ) {
			// pointing only to second part of the array as that one is a config object
			this[key] = setList(bp[key][1],key);
		} else if ( typeof bp[key] === 'object' && bp[key] !== null ){
			this[key] = new Fm.Basic(this.__ref.child(key), bp[key]);
		} else {
			Object.defineProperty(this, key, {
				enumerable: true,
				configurable: true,
				get: function() {
					return _value;
				},
				set: function(val){
					// TODO this should not write of the val is set from watchRemote handler
					if (_value !== val && this.__watchedLocal.indexOf(key) >= 0) {
						_value = val;
						this.__localBuffer.push(_value);
						this.__trigger('sent', key);
						this.__ref.child(key)
							.set(val, function(err){
								if (err) this.__trigger('error');
								else {
									this.__trigger('delivered', key);
									// if we do not have watchRemote set on this property
									// we want to shift the buffer here;
									if (this.__localBuffer[0] === _value ) this.__localBuffer.shift();
									else this.__trigger('error',"this should not happen");
								}
							}.bind(this) );
					} else if (_value !== val) {
						// need set watcher on most nested object
						// watching object will not fire any event as the reference is not changing
						// TODO solution - set observer on object would set observers on all primitives in object tree
						// not on array / list
						if (typeof val === 'object' && val !== null) {
							_value = new Fm.Basic(this.__ref.child(key), val);
						} else {
							_value = val;
							// this would apply of we save to db by default
							//this._ref.child(key).set(_value);
						}
					}

				}
			});
			//console.log("setting", key, _value);
			this[key] = _value;
			//console.log(this[key]);
		}
	}

	/**
	 * sets the list within the Model - most likely it is finite list of references
	 *
	 * @param {string} property descriptor - tke key
	 * @param {Array || Fm.List}
	 *
	 * @return {Fm.List} new instance
	 */
	function setList(bp, key) {
        // TODO setup list
        // check if already a list

        if ( bp instanceof Fm.List ) {
            return bp;
        } else {
			// TODO make nicer catcher of wrong data cinsidering the class type etc.
			if (!bp.factory && !bp.factory.fclass && !bp.factory.mclass) throw new Error('invalid factory config');

			// TODO decide how to create list...
			console.log(key);
            return new Fm.List(ref.child(key), bp );
        }
    }
	
	function defineProperties(model){
		Object.defineProperties(model, {
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
			},
			"__watchedLocal":{
				enumerable: false,
				configurable: false,
				writable: true,
				value: []
			},
			"__watchedRemote":{
				enumerable: false,
				configurable: false,
				writable: true,
				value: []
			},
			"__localBuffer":{
				enumerable: false,
				configurable: false,
				writable: true,
				value: []
			}
		});
	}

	//this.seal();
};


Object.defineProperty(Fm.Basic.prototype, 'getRef', {
	enumerable: false,
	writable: false,
	configurable: false,
	value: function(){
		return this.__ref;
	}
});

/**
 * Sets the event handler or specified event
 * this sets multiple events if invoked multiple times
 *
 * @param {string} event identifier
 * @param {function} event handler
 * 
 * @return thsis or handler TODO
 */
Object.defineProperty(Fm.Basic.prototype, "on", {
	  enumerable: false
	, configurable: true
	, writable: false
	, value: function(event, handler){
		// TODO limit the events write_finished read_finished
		if (!this.__events[event]) {
			this.__events[event] = [];
		}
		this.__events[event].push(handler);
	}
});

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
Object.defineProperty(Fm.Basic.prototype, "off", {
	  enumerable: false
	, configurable: true
	, writable: false
	, value: function(event, handler){
		if (!this.__events[event]) return;
		this.__events[event].forEach(function(el, index){
			this.__events[event].splice(index,1);
		}.bind(this));
	}
});


/**
 * writes the Fm.Basic to DB
 * TODO
 * if model contains list we can't use write
 * it must be overridden by some other writ emethod
 *
 * @this {Fm.Basic}
 * @emits Fm.Basic#saved Fm.Basic#error
 * @access public
 */
Object.defineProperty(Fm.Basic.prototype, "save", {
	  enumerable: false
	, configurable: true
	, writable: false
	, value: function(){
		this.__ref.set(this, function(err){
			if(err) this.__trigger("error");
			else this.__trigger('saved');
		}.bind(this));
	}
});

/**
 * loads DB into this model representation
 *
 * @throws excpeption if model does not fit
 *
 * @param {String} key to the DB location
 * @emits ready | error
 *
 * TODO we could use watchRemote on every property and it will get updated
 */
Object.defineProperty(Fm.Basic.prototype, "load", {
	  enumerable: false
	, configurable: true
	, writable: false
	, value: function(){
		this.__ref.once("value", function(ss){
			var data = ss.val();
			if (!data){
				this.__trigger("error", "nothing in DB in that location");
			}
			else {
				// traverse object...
				for(var key in this){
					if (data[key]) {
						if (this[key] instanceof Fm.Basic) {
							this[key].loadWithData(data[key]);
						} else {
							this[key] = data[key];
						}
					}
				}
				this.__trigger('loaded');
			}
		}.bind(this));
	}
});

Object.defineProperty(Fm.Basic.prototype, "loadWithData", {
	  enumerable: false
	, configurable: true
	, writable: false
	, value: function(data){
		if (!data){
			this.__trigger("error", "nothing in DB in that location");
		}
		else {
			// traverse object...
			for(var key in this){
				if (data[key]) {
					if (this[key] instanceof Fm.Basic) {
						this[key].loadWithData(data[key]);
					} else {
						this[key] = data[key];
					}
				}
			}
		}
	}
});

/**
 * writes the property of the model into DB
 * for complex multilevel objects changing a nested property
 * watchlocal can't set hook
 *
 * @param {string} property descriptor
 * @param {function} [] completion handler optional
 *
 * @this {Fm.Basic}
 * @emits Fm.Basic#saved Fm.Basic#error
 * @access public
 */
Object.defineProperty(Fm.Basic.prototype, "saveProp", {
	  enumerable: false
	, configurable: true
	, writable: false
	, value: function(prop){
		try {
			this.__ref.child('prop').set(this[prop], function(err){
				if(err) this.__trigger("error");
				else this.__trigger('saved', prop);
			}.bind(this));
		} catch (e) {
			// TODO
			// log this
		}
	}
});

/**
 * triggers event on Fm.Basic
 *
 * @this {Fm.Basic}
 * @access private
 */
Object.defineProperty(Fm.Basic.prototype, '__trigger', {
	  enumerable: false
	, configurable: true
	, writable: false
	, value: function(event, prop){
		if(!this.__events[event]) return;
		this.__events[event].forEach(function(ev){
			// TODO can we explicitly giv this as context ?
			ev.call(this, prop);
		}.bind(this));
	}
});


Object.defineProperty(Fm.Basic.prototype, 'watchLocal', {
    enumerable: false,
    configurable: true,
    writable: false,
    value: function(prop){
        if (this.hasOwnProperty(prop)) {
            this.__watchedLocal.push(prop);
        }
    }
});


/**
 * unset watching local proparty and propagating the change into DB
 * if this is unset the changes will have to be propagated manually with .write
 * 
 * if there is a some other custom getter/setter on property those will be destroyed !!!
 * @access public
 *
 * @param{string} property descriptor
 */
Object.defineProperty(Fm.Basic.prototype, "unwatchLocal", {
	  enumerable: false
	, configurable: true
	, writable: false
	, value: function (prop) {
		var val = this[prop];
		delete this[prop]; // remove accessors
		this[prop] = val;
	}
});

/**
 * sets watching for remote changes on DB and automatically propagate them in Fm.Basic
 * if "watchedRemote" is triggered as a result of watchUpdate we check if the value is the same
 * TODO in case the local value had been changed this will change the value back in synchronization with DB
 * but a new change might change this again according that undone change
 * TODO how do we prevent propagating the watchedLocal back to local via watchRemote?
 * TODO we can set some change queue or buffer and compare the values from watchRemote against buffer
 * if the value match the value in buffer, then we pop the value from buffer and do nothing, 
 * if the value is not found in buffer it means we have new value coming from DB and the localField need an update (without propagating into DB)
 *
 * @param {string} property descriptor
 * @param {event} event descriptor - events which are triggered on DB so we listen to
 *    change we want to follow
 *
 * @access public
 * TODO take care of initial trigger when setting up the listener on 
 * child_added and child_changed
 */
Object.defineProperty(Fm.Basic.prototype, "watchRemote", {
	enumerable: false,
	configurable: true,
	writable: false,
	value: function(prop, event){
		/**
		 * @param {snaphot}
		 */
		var value_ = function(ss){
			var rval = ss.val();

			// if we have something in buffer that value is queued already in firebase
			// and will overwrite anything which just arrived
			if (this.__localBuffer.length > 0) {
				if ( this.__localBuffer[0] === rval ) {
					// I hope that Firebase keeps the queue synchronized 
					// in first come frist go manner
					this.__localBuffer.shift();
				}
				return;
			}

			if (ss.val() !== this[prop]) { 
				this[prop] = ss.val();
			} else {
				//no need to update the same value
			}

		}.bind(this);

		var childChanged_ = function(ss){
			// it only returns child - suitable for lists
			// TODO child of property might be another Model ????
			this[prop][ss.key()] = ss.val();

		}.bind(this);

		var handler = null;
		switch (event) {
			case "child_changed":
				handler = childChanged_;
				break;
			case "value":
				handler = value_;
				break;
			default:
				console.log("run event: ", event);
				break;
		}

		this.__ref.child(prop)
			.on(event, handler, null, null);
	}
});

/**
 * unset watching remote changes
 *
 * @access public
 * @param {string} property descriptor
 * @param {string} event descriptor, if non is specified all events are unwatched
 */
Object.defineProperty(Fm.Basic.prototype, "unwatchRemote", {
	enumerable: false,
	configurable: true,
	writable: false,
	value: function(prop, event){
		// remove all callbacks
		this.__ref.child(prop)
			.off(event);
	}
});


/**
 * helper method to polulate Model from object 
 * @access public
 *
 * TODO this can have all sort of hooks we want...
 *
 * @param {string} property descriptior
 * @param {object || primitive} new value
 * @throws {Error} if the object does not match the blueprint structure
 */
Object.defineProperty(Fm.Basic.prototype, 'populate', {
	  enumerable: false
	, configurable: true
	, writable: false
	, value: function(data){
		switch (typeof data){
			case "undefined" : 
				throw new Error("Fm.Basic.set can't accept undefined as value");
			case "null" : 
				throw new Error("Fm.Basic.set can't accept undefined as value");
			case "object" :
				// simply assign each property
				if ( data.isArray() ) throw new Error('expect object not array');
				for (var key in data){
					if ( !this[key] ) throw new Error("Data object structure is not subset of this object structure, error setting " + key);
					this[key]= data[key];
				}
				break;
			case "function":
				throw new Error("Function as value is not supported yet");
			default:
				// defualt if it is primitive like number or boolean or string
				// TODO amend setter for this so it will not get messed up by direct assign
				this.__value = data;
				break;
		}
	}
});

