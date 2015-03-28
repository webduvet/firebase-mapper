/**
 * blueprint sample
 *
 * bluepreint needs to describe references as well not only the final structure
 * the Model in memory might be differeny than DB structure
 * e.g. 
 * depending on some model data some other model property will be loaded or modified or will refer
 * to different location
 * e.g.
 * uset type admin will load admin tools one db location, regular user will load user tools from different db location
 * and will be equipped with some admin methods like deleteUser
 */

/**
 * simple model definition with a simple single level object literal
 */
mSimple = ["model",{
	prop1: "prop1",
	prop2: "prop2"
}];

/**
 * sinple nested definition with multilevel object literal, but in this case
 * prop3 is treated as models' property, content of prop3 is just object literal
 */
mNested = ["model", {
	prop1: "prop1",
	prop2: "prop2",
	prop3:{
		inside1:"inside1",
		inside2:"inside2"
	}
}];

/**
 * prop3 is a model so the factory realizes that prop3 is another model and gives the controll to approppriate model factory 
 * passes the content of prop3 to another factory as well. the resukt of that factory is assigned to prop3
 */
mNestedRef = ["model",{
	prop1: "prop1",
	prop2: "prop2",
	prop3: ["model",{
		refprop1:"prop1",
		refprop2:"prop2"
	}
}];

/**
 * list example
 */
list = ["list", {
	factory: ["modelFatory", "listFactory" ],
	type: ["primary", "rich_ref", "plain_ref", "extended_ref"], // pick one
	priority: "priorityProvider", // or false for no priority
	keyType: ["unique", "auto"] // pick one, if not primary this is ignored
}];


/**
 * model with nested list
 */
mNestedList = ["model",{
	prop1: "prop1",
	prop2: "prop2",
	prop3: ["list", {
		modelFactory: "modelFatory",
		type: "rich_ref",
		priority: "priorityProvider" // or false for no priority
	}]
}];

/**
 * nested list example
 * can contain model - normal list - can contain a list
 */
lNested = ["list", {
	factory: "somelistFactory",
	type: ["primary", "rich_ref", "plain_ref", "extended_ref"], // pick one
	priority: "priorityProvider", // or false for no priority
	keyType: ["unique", "auto"] // pick one, if not primary this is ignored
}];


/**
 * value can contain anything
 * @typedef {(Object|Number|String|Boolean|Null|Array)} Custom
 */

/*
 * Zz namespace
 * @namespace
 */
var Zz = {};

/**
 * TODO 
 * can we have one factory class for both list and model?
 */

/**
 * Factory for Zz.List
 * @contructor
 *
 * @param {Firebase} takes instance of firebase reference
 */
Zz.ListFactory = function(ref) {
	this.ref = ref;
};

/**
 * creates the Zz.List instance
 * 
 * @param {string} url relative to provided ref in factory
 * @param {object} blueprint for new objects which list should contain
 *
 * @returns {Zz.List} new instance
 */
Zz.ListFactory.prototype.create = function(url, blueprint){
	return;
}

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
Zz.List = function(ref, url, blueprint) {
	// TODO create Zz.Model plain instance on push
	// as well the parent - child relarionship must be created via ref
	this._events = {
		"child_added": [],
		"child_removed":[],
		"priority_changed":[]
	};
	this.ref = ref;

	// set priority listener by default
	this.ref.on('child_moved', function(){
		this._trigger('child_moved');
	});
};

Zz.List.prototype.push = function(){
	var arg,
		item = this.ref.push();

	if (arg = arguments[0]) {
		arg.__id = item.key();
		id.set(arg);
	}
	item.set(arg || (new Zz.Model(this.blueprint)), function(){
		this._trigger("child_added");
	});
};

Zz.List.prototype._trigger = function(event){
	if(!(event in this._events)) throw event + " is not declared";
	this._events[event].forEach(function(handler){ handler(); });
};

Zz.List.prototype.setPriority = function(key, priority) {
	this.ref.child(key).setPriority(priority);
};

/**
 * Model Factory contructor
 * @constructor
 * @access public
 *
 * @param {Firebase} instance of Firebase reference
 */
Zz.ModelFactory = function(model, ref, blueprint){
	this.ref = ref;
	this.Model = model;
	this.blueprint = blueprint;
}

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
}

/**
 * removes all previous decorators on create method
 */
Zz.ModelFactory.prototype.unDecorateCreate = function(){
	this.create = Zz.ModelFactory.prototype.create;
}

/**
 * decorates given action with given decorator
 * @decorator
 * @access public
 *
 * @param {string} method descriptor
 * @param {Function} Decoreator function @returns decorated action
 */
Zz.ModelFactory.prototype.decorateAction = function(method, decorator){
}

/**
 * factory method to construct the Model
 * @constructs [Model]
 *
 * @param {Firebase} Database reference to particular location // TODO or combine this with root.child(url) 
 * @param {string} relative path to firebase ref in this.ref
 * @return {Model} created Model instance
 */
Zz.ModelFactory.prototype.create = function(url){
	return new this.Model(this.ref, url, this.blueprint);
}



/**
 * Creates a new model
 * @contructor
 *
 * @param {Firebase} Firebase reference instance
 * @param {string} path to the Object which model stands for
 * @param {Object} Object literal to describe the structure of the model
 */
Zz.Model = function(ref, url, blueprint){
	// TODO eval blueprint
	// for value it is simple it is either primitive or object literal
	// all needed for literal is to store all properties
	
	for(var key in blueprint){
		if (Array.isArray(blueprint[key]){
			var type = blueprint[key][0];
			var bp = blueprint[key][1];
			if(type === 'model') {
				this[key] = (new Zz.ModelFactory(bp, ref)).create();

		}
		this[key] = blueprint[key];
		// TODO
		// if instanceof Zz.Model
		// then establish relationehip parent-child
		// as well this should be prevented for setting watchers
		// but it as well might work ok
	}
	/*
	for(var key in blueprint){
		if(blueprint[key] instanceof Zz.Model) {
		} else if (blueprint[key] instanceof Zz.List) {
		} else {
			this[key] = blueprint[key];
		}
	}
	*/

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
			, value: url
		},
		/**
		 * @access private
		 * @var {Object} DB reference created from __url
		 */
		"__ref":{
			  enumerable: false
			, writable: true
			, configurable: true
			, value: ref.child(url)
		},
	});
}

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
 * writes the Model to DB
 *
 * @this {Model}
 * @emits Model#written Model#error
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
 * writes the property of the model into DB
 * for complex multilevel objects changing a nested property
 * watchlocal can't set hook
 *
 * @param {string} property descriptor
 * @param {function} [] completion handler optional
 *
 * @this {Model}
 * @emits Model#written Model#error
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
 * triggers event on Model
 *
 * @this {Model}
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
 * sets watching for remote changes on DB and automatically propagate them in Model
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
				break;
			case "null" : 
				throw new Error("Zz.Model.set can't accept undefined as value");
				break;
			case "object" :
				// simply assign each property
				if ( data.isArray() ) throw new Error('expect object not array');
				for (var key in data){
					this[key]= data[key];
				}
				break;
			case "function":
				throw new Error("Function as value is not supported yet");
				break;
			default:
				// defualt if it is primitive like number or boolean or string
				// TODO amend setter for this so it will not get messed up by direct assign
				this.__value = data;
				break;
		}
	}
});

/**
 * safe setter for Models' properties
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
				break;
			case "null" : 
				throw new Error("Zz.Model.set can't accept undefined as value");
				break;
			case "object" :
				// simply assign each property
				if ( data.isArray() ) throw new Error('expect object not array');
				this[prop]= data;
				break;
			case "function":
				throw new Error("Function as value is not supported yet");
				break;
			default:
				// defualt if it is primitive like number or boolean or string
				// TODO amend setter for this so it will not get messed up by direct assign
				this.__value = data;
				break;
		}
	}
});


Zz.Err = function(msg){
	this.message = msg;
}
Zz.Err.prototype = Object.create(Error.prototype);
Zz.Err.prototype.constructor = Zz.Err;

module.exports = Zz;
