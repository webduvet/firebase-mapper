
var O = function(){
	Object.defineProperty(this, "__val", {
		  writable: false
		, enumerable: false
		, configurable: true
	});
	Object.defineProperty(this, "__value", {
		  enumerable: false
		, configurable: true
		, set: function(val){
			console.log(this, val);
			Object.defineProperty(this, "__val", {
				  value: val
			});
		}
		, get: function(){
			return this.__val;
		}
	});
	this.name = "hey";
}

Object.defineProperty(O.prototype, 'set',{
	  writable: false
	, configurable: false
	, enumerable: false
	, value: function(val){
		this.__value = val;
		return this;
	}
});

Object.defineProperty(O.prototype, 'then',{
	  writable: false
	, configurable: false
	, enumerable: false
	, value: function(success, fail){
		this.__p_success.push(success);
		this.__p_error.push(fail);
		return this;
	}
});

var o = new O();

o.__value = "newval";

o.__val = "grrrghh";

console.log(o.__value, o.__val);

o.set("via set").set("again");

console.log(o.__value, o.__val);
