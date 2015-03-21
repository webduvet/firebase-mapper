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




// TODO we need object factory not class
var FbItem = function(){
	Object.defineProperty(this, "events", {
		  enumerable: false
		, writable: true
		, configurable: true
		, value: {}
	});
	/*
	 * set this property needs to be paired with
	 * watching the property otherwise unexpected results
	 * TODO setting this to true should be conditioned be setting the
	 * watcher for the value of item
	 * TODO think about how to do it with nested objects - does change deep in the nested onject trigger
	 * the change in parent and parent of parent as well? do I come up with some clever solution
	 * or leave it down to concrete implementation.
	 */
	Object.defineProperty(this, "watch_remote", {
		  enumerable: false
		, writable: true
		, configurable: true
		, value: false
	});
	/*
	 * watch local - reversed watch remote
	 * the same question apply to local
	 * TODO I should apply the rule - once the flag is set on object
	 * all children are updated in one go 
	 */
	Object.defineProperty(this, "watch_local", {
		  enumerable: false
		, writable: true
		, configurable: true
		, value: false
	});
}


Object.defineProperty(FbItem.prototype, "on", {
	  enumerable: false
	, configurable: true
	, writable: false
	, value: function(event, handler){
		// TODO limit the events write_finished read_finished
		if (!this.events[event]) {
			this.events[event] = [];
		}
		this.events[event].push(handler);
	}
});

Object.defineProperty(FbItem.prototype, "off", {
	  enumerable: false
	, configurable: true
	, writable: false
	, value: function(event, handler){
		if (!this.events[event]) return;
		this.events[event].forEach(function(el, index){
			this.events[event].splice(index,1);
		}.bind(this));
	}
});


Object.defineProperty(FbItem.prototype, "__ref", {
	  enumerable: false
	, writable: false
	, configurable: true
	, value: this.__parent.ref.child(this.__name)
});

Object.defineProperty(FbItem.prototype, "write", {
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


