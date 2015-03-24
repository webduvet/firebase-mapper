/*
 * object.watch polyfill
 *
 * 2012-04-03
 *
 * By Eli Grey, http://eligrey.com
 * Public Domain.
 * NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.
 */

// object.watch


var MyClass = function(){
};



if (!MyClass.prototype.watch) {
	Object.defineProperty(MyClass.prototype, "watch", {
		  enumerable: false
		, configurable: true
		, writable: false
		, value: function (prop, handler) {
			var shadowProp = 'zz_'+prop;
			Object.defineProperty( MyClass.prototype, shadowProp, {
					enumerable: false
				, configurable: true
				, writable: true
				, value: this[prop]
				})
			
			if (delete this[prop]) { // can't watch constants
				Object.defineProperty(this, prop, {
					  get: function(){return this[shadowProp]; }
					, set: function(val){
						handler.call(this, prop, this[shadowProp], val);
						this[shadowProp] = val;
					}
					, enumerable: true
					, configurable: true
				});
			}
		}
	});
}

// object.unwatch
if (!MyClass.prototype.unwatch) {
	Object.defineProperty(MyClass.prototype, "unwatch", {
		  enumerable: false
		, configurable: true
		, writable: false
		, value: function (prop) {
			var val = this[prop];
			delete this[prop]; // remove accessors
			this[prop] = val;
		}
	});
}


var obj = new MyClass();

obj.test = 10;
console.log("init to ", obj.test);
obj.watch('test', function(prop, val, newval){console.log("test has changed", prop, val, newval)});

obj.test = 20;

obj.test = 30;

obj.test = 40;

// assign the same val
obj.test = 40;

setTimeout(function(){console.log(obj.test);}, 1000);


var l = 0;
obj.watch('test', function(prop, val, newval){l++});

// test 1,000,000 writes

console.time('test');
for(var i = 0; i < 1000000; i++){
  obj.test = i;
};
console.timeEnd('test');
