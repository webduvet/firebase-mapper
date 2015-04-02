/**
 * defining Zz model space
 */
var Zz = module.exports = {};



/**
 * Creates a new model
 * @contructor
 *
 * @param {Firebase} Firebase reference instance
 * @param {string} path to the Object which model stands for
 * @param {Object} Object literal to describe the structure of the model
 */
Zz.Model = function(ref, blueprint){
	// TODO eval blueprint
	// for value it is simple it is either primitive or object literal
	// all needed for literal is to store all properties
	// TODO deep nested eval
	
	for(var key in blueprint){
		if (Array.isArray(blueprint[key])){
			var type = blueprint[key][0];
			var bp = blueprint[key][1];
			if(type === 'model') {
				this[key] = (new Zz.ModelFactory(bp, ref)).create();
			} else if (type ==='list' ) {
				// the moment we learn it contains list (not the best practice)
				// we need to prevent this model from direct write operation
				this[key] = (new Zz.ListFactory(ref, bp)).create();
				this[write] = null;
			}

		}
		this[key] = blueprint[key];
		// TODO
		// if instanceof Model
		// then establish relationehip parent-child
		// as well this should be prevented for setting watchers
		// but it as well might work ok
	}

	Object.defineProperties(this, {
		/**
		 * @access private
		 * @var {Object} contains event queues {string}:{Array}
		 */
		"__events": {
			  enumerable: false
			, writable: true
			, configurable: true
			, value: {}
		},
		/**
		 * @access private
		 * @var {string} relative DB reference stored in factory
		 */
		"__url":{
			  enumerable: false
			, writable: true
			, configurable: true
			, value: null // TODO extract from ref
		},
		/**
		 * @access private
		 * @var {Object} DB reference created from __url
		 */
		"__ref":{
			  enumerable: false
			, writable: true
			, configurable: true
			, value: ref
		},
	});
};

/**
 * Adds property to the Model with getter and setter
 * and hides the actuall property
 *
 * @param {string} property descriptor
 * @return {value} value of the property
 *
 * TODO do we need this ?
 * is this a nice way how to squeeze in a lot if handlers
 * since we can replace getter/setter with different one
 * need to investigate 
 */
Object.defineProperty(Zz.Model.prototype, 'aprop', {
	  enumerable: false
	, writable: false
	, configurabl: false
	, value: function(prop){
		Object.defineProperty(this, '__'+prop+'__', {
			  enumerable: false
			, configurable: false
			, writable: true
			, value: null
		});
		Object.defineProperty(this, prop, {
			  enumerable: true
			, configurable: false
			, set: function(val){
				this['__'+prop+'__'] = val;
			}
			, get: function(){
				return this['__'+prop+'__'];
			}
		});
		return this[prop];
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
Object.defineProperty(Zz.Model.prototype, "on", {
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
 * <li>written
 * <li>error
 * <li>refreshed
 *
 * @param {function} event handler
 * @return this
 */
Object.defineProperty(Zz.Model.prototype, "off", {
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
 * writes the Zz.Model to DB
 * TODO
 * if model contains list we can't use write
 * it must be overridden by some other writ emethod
 *
 * @this {Zz.Model}
 * @emits Zz.Model#written Zz.Model#error
 * @access public
 */
Object.defineProperty(Zz.Model.prototype, "write", {
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
Object.defineProperty(Zz.Model.prototype, "load", {
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
						if (this[key] instanceof Zz.Model) {
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

Object.defineProperty(Zz.Model.prototype, "loadWithData", {
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
					if (this[key] instanceof Zz.Model) {
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
 * @this {Zz.Model}
 * @emits Zz.Model#written Zz.Model#error
 * @access public
 */
Object.defineProperty(Zz.Model.prototype, "writeProp", {
	  enumerable: false
	, configurable: true
	, writable: false
	, value: function(prop){
		try {
			this.__ref.child('prop').set(this[prop], function(err){
				if(err) this.__trigger("error");
				else this.__trigger('written', prop);
			}.bind(this));
		} catch (e) {
			// TODO
			// log this
		}
	}
});

/**
 * triggers event on Zz.Model
 *
 * @this {Zz.Model}
 * @access private
 */
Object.defineProperty(Zz.Model.prototype, '__trigger', {
	  enumerable: false
	, configurable: true
	, writable: false
	, value: function(event, prop){
		if(!this.__events[event]) return;
		this.__events[event].forEach(function(ev){
			ev.call(this, prop);
		}.bind(this));
	}
});

/*
 * watch local property and propagate any change straight away into database
 * this replaces the original property with new getter and setter so, if there is a getter and setter
 * that one will be thrown away!!! so be careful
 * @access public
 *
 * @param{string} property descriptior
 * @param{function} [] handler passed to database wrapper, if no handler is passed the update is silent
 *   but emits DB error shoud that happen.
 */
Object.defineProperty(Zz.Model.prototype, "watchLocal", {
	  enumerable: false
	, configurable: true
	, writable: false
	, value: function (prop, handler) {
		if (!this.__ref) throw "Need a valid reference";
		var
		  val_ = this[prop]
		, getter = function () {
			return val_;
		}
		, setter = function (val) {
			// TODO emit the event alongside
			// or call handler if exists
			this.__ref.child(prop)
				.set(val, handler);

			val_ = val;
			return val_;
		}
		;

		if (delete this[prop]) { // can't watch constants
			Object.defineProperty(this, prop, {
				  get: getter
				, set: setter
				, enumerable: true
				, configurable: true
			});
		}
	}
});

/**
 * update local propery with given value
 * @access private
 *
 * @param {string} property descriptor
 * @param {object || primitive} value comming from DB.
 */
Object.defineProperty(Zz.Model.prototype, "__updatelocal", {
	enumerable: false,
	configurable: true,
	writable: false,
	value: function(prop, val){
		this[prop] = val;
		//Zz.Model.prototype.__trigger.call(this, 'update', prop);
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
Object.defineProperty(Zz.Model.prototype, "unwatchLocal", {
	  enumerable: false
	, configurable: true
	, writable: false
	, value: function (prop) {
		var val = this[prop];
		delete this[prop]; // remove accessors
		this[prop] = val;
	}
});

// TODO other approach
// all properties have by default getter and setter and the setter automatically
// triggers the event hook, so if any handler is set to 
// drawback is that we need closure for every single property 
// accessing property then takes about 100 times longer the simple assignemnt

/**
 * sets watching for remote changes on DB and automatically propagate them in Zz.Model
 * TODO if local property is being watched for changes this will trigger the handler
 * which in turns triggers the DB write !!!!
 *
 * @param {string} property descriptor
 * @param {event} event descriptor - events which are triggered on DB so we listen to
 *    change we want to follow
 *
 * @access public
 * TODO take care of initial trigger when setting up the listener on 
 * child_added and child_changed
 */
Object.defineProperty(Zz.Model.prototype, "watchRemote", {
	enumerable: false,
	configurable: true,
	writable: false,
	value: function(prop, event){
		// TODO how to track this function
		// so we can inset it from on with off if we want stop watching remote
		/**
		 * @param {snaphot}
		 */
		var value_ = function(ss){
			if (ss.val() !== this[prop]) { 
				this[prop] = ss.val();
				// this.__updatelocal(prop, ss.val());
			} else {
				// trying to update the same value is most likely result from watchLocal flag set to true
				// we do nothing now
				// or we can trigger update success - this should be together with some flag
				// prop: newval: propagating
				// if the newval is the same val as DB we cab stop propagating even if the newval is pushed
				// by someone ese
			}
		}.bind(this);

		var childChanged_ = function(ss){
			/*
			setPropOnPath_(this[prop], path, ss.val());
			function setPropOnPath_(obj, path, prop){
				if (path.length > 1) {
					setPropOnPath_(obj[path.shift()], path, prop);
				} else {
					obj[path.shift] = prop;
				}
			}*/
			// it only returns child - suitable for lists
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
Object.defineProperty(Zz.Model.prototype, "unwatchRemote", {
	enumerable: false,
	configurable: true,
	writable: false,
	value: function(prop, event){
		// remove all callbacks
		this.__ref.child(prop)
			.off(event);
	}
});


// TODO
// thid conflicts with watch local
// it replaces one getter/setter with other getter/setter
Object.defineProperty(Zz.Model.prototype, "__watch", {
		enumerable: false
	, configurable: true
	, writable: false
	, value: function (prop, handler) {
		var
		  val_ = this[prop]
		, newval_ = val_
		, getter = function () {
			return val_;
		}
		, setter = function (val) {
			handler.call(this, prop, val_, val);
			val_ = val;
			return val_;
		}
		;

		if (delete this[prop]) { // can't watch constants
			Object.defineProperty(this, prop, {
					get: getter
				, set: setter
				, enumerable: true
				, configurable: true
			});
		}
	}
});


// object.unwatch
Object.defineProperty(Zz.Model.prototype, "__unwatch", {
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
 * safe setter for all properties 
 * @access public
 *
 * TODO this can have all sort of hooks we want...
 *
 * @param {string} property descriptior
 * @param {object || primitive} new value
 */
Object.defineProperty(Zz.Model.prototype, 'populate', {
	  enumerable: false
	, configurable: true
	, writable: false
	, value: function(data){
		switch (typeof data){
			case "undefined" : 
				throw new Error("Zz.Model.set can't accept undefined as value");
			case "null" : 
				throw new Error("Zz.Model.set can't accept undefined as value");
			case "object" :
				// simply assign each property
				if ( data.isArray() ) throw new Error('expect object not array');
				for (var key in data){
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

/**
 * safe setter for Zz.Models' properties
 * @access public
 *
 * TODO this can have all sort of hooks we want...
 *
 * @param {string} property descriptior
 * @param {object || primitive} new value
 */
Object.defineProperty(Zz.Model.prototype, 'setProp', {
	  enumerable: false
	, configurable: true
	, writable: false
	, value: function(prop, data){
		switch (typeof data){
			case "undefined" : 
				throw new Error("Zz.Model.set can't accept undefined as value");
			case "null" : 
				throw new Error("Zz.Model.set can't accept undefined as value");
			case "object" :
				// simply assign each property
				if ( data.isArray() ) throw new Error('expect object not array');
				this[prop]= data;
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

/**
 * Model Factory contructor
 * @constructor
 * @access public
 *
 * @param {Firebase} instance of Firebase reference
 */
Zz.ModelFactory = function(ref, blueprint){
	this.ref = ref;
	this.blueprint = blueprint;
};

/**
 * decorates each instance of the Model class created by this factory in the future
 * does not change existing instnces created by this factory
 * @decorator
 * @access public
 *
 * @param {string} new action name
 * @param {Function} action handler
 */
Zz.ModelFactory.prototype.decorateCreate = function(name, fn){
	var oldCreate = this.create;
    this.create = function(){
        var model = oldCreate.apply(this, arguments);
        model[name] = fn;
        return model;
    };
};

Zz.ModelFactory.prototype.decorateModelsMethod = function(name, fn){
};

/**
 * removes all previous decorators on create method
 */
Zz.ModelFactory.prototype.unDecorateCreate = function(){
	this.create = Zz.ModelFactory.prototype.create;
};

/**
 * decorates given action with given decorator
 * @decorator
 * @access public
 *
 * @param {string} method descriptor
 * @param {Function} Decoreator function @returns decorated action
 */
Zz.ModelFactory.prototype.decorateAction = function(method, decorator){
};

/**
 * factory method to construct the Model
 * @constructs [Model]
 *
 * @param {Firebase} Database reference to particular location // TODO or combine this with root.child(url) 
 * @return {Model} created Model instance
 */
Zz.ModelFactory.prototype.create = function(ref){
	// need instance of Firebase...
	if (typeof ref.key !== 'function') throw "Ref needs to be Firebase reference";
	return new Zz.Model(ref, this.blueprint);
};

/**
 * creates instance of Zz.List  model
 * @constructor
 *
 * @param {Firebase} reference Firebase DB root or parent object
 * @param {string} Path to the FB object which List represents
 * @param {Object} blueprint to create ZzModel Factory
 *
 * TODO is this DB rather abstract implementation
 * or should it be considered as a conrete part of a list
 * in that case it should be paginator there.
 */
Zz.List = function(config) {
	// TODO create Zz.Model plain instance on push
	// as well the parent - child relarionship must be created via ref
	this._events = {
		"child_added": [],
		"child_removed":[],
		"priority_changed":[]
	};
	this.ref = config.ref;
	this.factory = config.factory;

	// set priority listener by default
	this.ref.on('child_moved', function(){
		this._trigger('child_moved');
	});

	/**
	 * non enumerable property page
	 * this can contain paginator and be the view interface...
	 */
	Object.defineProperty(this, "_page", {
		enumerable: false,
		configurable: true,
		writable: true,
		value:{}
	});
};

/**
 * creates new record in list using provided model factory
 * 
 * @param {Boolean} [true] write to DB defaults to false. Object is instantiated, but not written to DB.
 *
 * @returns {Zz.Model} model representaiton of DB record
 */
Zz.List.prototype.push = function(){
	var write = arguments[0] || false,
		record = this.ref.push(), 
		obj = this.factory.create(record);

	// TODO
	// do we write it to db from here?
	// do we use objects' method? - cleanor solution
	// or we can return unwrittent object and user will programatically write
	// the object to DB
	// or we introduce settings
	/*
	record.set( obj , function(err){
		if(!err) this._trigger("child_added");
	}.bind(this));
	*/
	if(write) obj.write();

	return obj;
};

/**
 * get the object from DB location and instantiate the model representation
 *
 * @emits ["loaded", "error"] 
 *
 * @params {string} key descriptor
 *
 * @returns {Zz.Model} Model representation of DB location created from Bluepront stored in modelFactory
 * TODO
 * provide for lists
 * in list case we should get another lista nd that one most likely will contain objects;
 *
 * TODO
 * this use case is making primary list
 * how do we do list of references?
 * plain references - should load directly associated object
 * rich references should be treated as objects as they cary some value, but shoud perhaps have
 * a hidden field __parent or __reference
 */
Zz.List.prototype.get = function(key){
	// get the location from database
	
	// create new model from blueprint TODO look if string key is subnstituted with firebase
	var m = this.factory.create( this.ref.child(key) );

	// emit event "ready" or "loaded"
	
	m.load();

	return m;
};

Zz.List.prototype._trigger = function(event){
	// if no handler is subsrcibed to event just return
	if(!(event in this._events)) return;
	this._events[event].forEach(function(handler){ handler(); });
};

/**
 * changes / sets priority on record described by key
 *
 * @param {string} key descriptior
 * @param {string || number || ServerValue} 
 */
Zz.List.prototype.setPriority = function(key, priority) {
	this.ref.child(key).setPriority(priority);
};


/**
 * loads full page
 * TODO
 */
Zz.List.prototype.loadPage = function(){
};

/**
 * Factory for Zz.List
 * @contructor
 *
 * @param {Firebase} takes instance of firebase reference containing location
 * @param {Object} blueprint for the list
 *   modelFactory - innstance of the model factory
 *   type = [ rich_ref, plain_ref, object ]
 *   priority - {priorityProvider{ instance
 */
Zz.ListFactory = function(ref, blueprint) {
	this.ref = ref;
	if (Object.isArray(blueprint) && 
			blueprint[0] === 'list' && 
			typeof blueprint[1] === 'object' && 
			!Object.isArray(blueprint[1])) {
		this.blueprint = blueprint[1];
	} else if (typeof blueprint[1] === 'object' && !Object.isArray(blueprint[1])) {
		this.blueprint = blueprint;
	} else {
		throw "Invalid parameters in blueprint";
	}
	if (this.blueprint.modelFactory instanceof Zz.ModelFactory) throw "Invalid argument in ModelFactory";
	if (this.blueprint.priorityProvider instanceof Zz.PriorityProvider ) throw "Invalid argument in PriorityProvider";

	this.modelFactory = this.blueprint.modelFactory;
	this.priorityProvider = this.blueprint.priorityProvider;
};

/**
 * TODO
 * the only need for list factory is the case where
 * the data is stored under customID
 * e.g
 * comments/{user_id}/{AUTO_ID}/comment_data.json
 * however in this case we never need to load "a page" of comments/{user_ID}
 * in DB technically it is list of lists, but in reality we always have a direct link to inner list.
 *
 * TODO - can you think of different use case.
 * blog/{USERID}/{topic_ID}/{BLOG_AUTOID}/blog_content.json
 * not sure if this is the right way how I would do DB as it is impossible list thorugh blogs
 * outside topics.
 *
 * TODO - we can list of lists leave outside of this for the time
 */

/**
 * creates the Zz.List instance
 * 
 * @param {string} url relative to provided ref in factory
 * @param {object} blueprint for new objects which list should contain
 *
 * @returns {Zz.List} new instance
 */
Zz.ListFactory.prototype.create = function(){
	return;
};

Zz.Exception = function(msg){
	this.message = msg;
};
Zz.Exception.prototype = Object.create(Error.prototype);
Zz.Exception.prototype.constructor = Zz.Exception;

/**
 * service returning the required priority for the key
 * can return ServerValue if needed;
 *
 * by default returns linux timestamp
 * TODO properly initialize with config block
 * so we can inject any type of service in it
 */
Zz.PriorityProvider = function(config){
	if (config && config.service) this.service = config.service;
	if (config && config.method) this.method = config.method;
};

Zz.PriorityProvider.priority = function(){
	return Date.now();
};

