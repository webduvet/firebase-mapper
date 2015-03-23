sampleR =	["object",
	{
		sub1A: "value1",
		"^id": "value2",
		sub1C: ["object",
		{
			sub2A: "value",
			sub2B: ["list", // but this is another object, where key is reference to that object 
			["object", {
				sub1A: "value",
				sub1B: "value",
				sub1C:["object",
				{
					sub2A: "value"
				}]
			}]]
		}],
		sub1D: "value"
	}];

/*
 * mapper takes the obejct blueprint and sets the complex Model object with CRUD methods, on a given reference
 * for now it is for firebase however it can be used for mongo DB as well
 *
 * TODO think about how to take care of denormalized data
 * like push the reference into other array of objects etc.
 */


var Mapper = function Mapper(bp_){

	var obj = {};

	switch( bp_[0] ){
		case "object":
			for( var key in bp_[1] ){
				switch( key ){
					case "^id":
						//inject this later
						//don't do anything for now
						break;
					default:
						obj[key];
				}
			}
			obj = bp_[1];
			break;
		case "list":
			break;
	}

	return obj;

}

var Zz = {};

Zz.Factory = function(ref_){
	this._ref = ref_;
}

Zz.Factory.prototype.create = function(bp_){
	if(bp_[0] === 'value') return new ZzValue().set(bp_[1]);
}

// TODO we need object factory not class

Zz.ModelFactory = function(ref){
	this.ref = ref;
}

Zz.ModelFactory.prototype.create = function(url){
	return new Zz.Value(url, ref);
}

var blueprint = {
	prop1: null,
	prop2: null,
	prop3: "default"
};

Zz.Model = function(ref, url, blueprint){
	// TODO eval blueprint
	// for value it is simple it is either primitive or object literal
	// all needed for literal is to store all properties
	
	for(var key in blueprint){
		this[key] = blueprint[key];
	}

	Object.defineProperties(this, {
		"__events": {
				enumerable: false
			, writable: true
			, configurable: true
			, value: {}
		},
		"__value":{
				enumerable: false
			, writable: false
			, configurable: true
			, value: null
		},
		"__url":{
				enumerable: false
			, writable: true
			, configurable: true
			, value: url
		},
		"__ref":{
				enumerable: false
			, writable: true
			, configurable: true
			, value: ref.child(url)
		},
		/*
		 * set this property needs to be paired with
		 * watching the property otherwise unexpected results
		 * TODO setting this to true should be conditioned be setting the
		 * watcher for the value of item
		 * TODO think about how to do it with nested objects - does change deep in the nested onject trigger
		 * the change in parent and parent of parent as well? do I come up with some clever solution
		 * or leave it down to concrete implementation.
		 */
		"__wremote":{
				enumerable: false
			, writable: true
			, configurable: true
			, value: false
		},
		/*
		 * watch local - reversed watch remote
		 * the same question apply to local
		 * TODO I should apply the rule - once the flag is set on object
		 * all children are updated in one go 
		 */
		"__wlocal":{
				enumerable: false
			, writable: true
			, configurable: true
			, value: false
		}
	});
}

Object.defineProperty(Zz.Model.prototype, 'aprop', {
	  enumerable: false
	, writable: false
	, configurabl: false
	, value: function(prop){
		Object.defineProperty(this, prop, {
			  enumerable: false
			, configurable: false
			, get: function(val){
				this['__'+prop] = val;
			}
		});
		return this[prop];
	}
});

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



Object.defineProperty(Zz.Model.prototype, "write", {
	  enumerable: false
	, configurable: true
	, writable: false
	, value: function(){
		this.__ref.set(this, function(err){
			if(err) this.__trigger("error");
			else this.__trigger('written');
		})
	}
});

Object.defineProperty(Zz.Model.prototype, 'trigger', {
	  enumerable: false
	, configurable: true
	, writable: false
	, value: function(event){
		if(!this.__events[event]) return;
		this.__events[event].forEach(function(ev){
			ev.call(this);
		}.bind(this));
	}
});

Object.defineProperty(Zz.Model.prototype, "watch_", {
		enumerable: false
	, configurable: true
	, writable: false
	, value: function (prop, handler) {
		var
			oldval = this[prop]
		, newval = oldval
		, getter = function () {
			return newval;
		}
		, setter = function (val) {
			oldval = newval;
			return newval = handler.call(this, prop, oldval, val);
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
Object.defineProperty(Zz.Model.prototype, "unwatch_", {
		enumerable: false
	, configurable: true
	, writable: false
	, value: function (prop) {
		var val = this[prop];
		delete this[prop]; // remove accessors
		this[prop] = val;
	}
});

Object.defineProperty(Zz.Model.prototype, 'set', {
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
		}.bind(this)
});

module.exports = Zz;
