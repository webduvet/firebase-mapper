
/**
 * Creates a new reference to Model
 * @contructor
 *
 * @param {Firebase} Firebase reference instance pointing to location - TODO this should rely on parent object which is model or list
 * @param {string} path to the Object which model stands for
 * @param {Object} Object literal to describe the structure of the model
 */
Fm.Reference = function(model, blueprint){
	// TODO eval blueprint
	// for value it is simple it is either primitive or object literal
	// all needed for literal is to store all properties
	// TODO deep nested eval
	
	if ( !blueprint ) throw new Fm.Exception("no valid blueprint found");
	if ( !ref || !ref.toString().match(/^https?:\/\//) ) throw new Fm.Exception("no valie firebase reference found");

	var ref = model.getRef();
	defineProperties(this);

    Object.defineProperty(this, '_watchedLocal', {
    });
    for ( var key in blueprint ) {
		setKey.call(this,key, blueprint);
    }

	function setKey(key, bp){
		var _value = bp[key];
		// TODO get rid of this it's useless
		if ( Array.isArray( bp[key] ) ) {
			this[key] = setList(bp[key]);
		} else if ( typeof bp[key] === 'object' && bp[key] !== null ){
			this[key] = new Fm.Model(this.__ref.child(key), bp[key]);
		} else {
			Object.defineProperty(this, key, {
				enumerable: true,
				configurable: true,
				get: function() {
					return _value;
				},
				set: function(val){
					if (_value !== val && this.__watchedLocal.indexOf(key) >= 0) {
						_value = val;
						this.__trigger('sent', key);
						this.__ref.child(key)
							.set(val, function(err){
								if (err) this.__trigger('error');
								else this.__trigger('delivered', key);
							}.bind(this) );
					} else if (_value !== val) {
						// need set watcher on most nested object
						// watching object will not fire any event as the reference is not changing
						// TODO solution - set observer on object would set observers on all primitives in object tree
						// not on array / list
						if (typeof val === 'object' && val !== null) {
							_value = new Fm.Model(this.__ref.child(key), val);
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
				value: null // TODO extract from ref
			},
			/**
			 * @access private
			 * @var {Object} DB reference created from __url
			 */
			"__ref":{
				enumerable: false,
				writable: true, 
				configurable: true,
				value: ref
			},
			"__watchedLocal":{
				enumerable: false,
				configurable: true,
				writable: true,
				value: []
			}
		});
	}
};



/**
 * writes the Fm.Model to DB
 * TODO
 * if model contains list we can't use write
 * it must be overridden by some other writ emethod
 *
 * @this {Fm.Model}
 * @emits Fm.Model#written Fm.Model#error
 * @access public
 */
Object.defineProperty(Fm.Model.prototype, "write", {
	  enumerable: false
	, configurable: true
	, writable: false
	, value: function(){
		this.__ref.set(this, function(err){
			if(err) this.__trigger("error");
			else this.__trigger('written');
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
Object.defineProperty(Fm.Model.prototype, "load", {
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
						if (this[key] instanceof Fm.Model) {
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

Object.defineProperty(Fm.Model.prototype, "loadWithData", {
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
					if (this[key] instanceof Fm.Model) {
						this[key].loadWithData(data[key]);
					} else {
						this[key] = data[key];
					}
				}
			}
		}
	}
});

