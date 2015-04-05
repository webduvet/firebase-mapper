/**
 * the biggest problem with this is
 * when the wholke object is assigned as update it needs to be traversed and each nested property needs to be
 * instantiated according this principle
 * as well watchLocal on nested object can be done only via path prop.nestedprop.verydeppprop etc
 * we still can do it the original way and if we need the nested prop update the nested model will be instantiated before main model
 * for watching the nested property we can have some more custom methods
 * or
 * we can have some method called propChanged which will be explicitly called after each change in nested object.
 * I know not so cool but usable
 */

var Firebase = require('firebase'),
	ref = new Firebase('https://sagavera.firebaseio.com');


var Model = function(ref, bp){
	Object.defineProperty(this, '_ref', {
		enumerable: false,
		configurable: true,
		writable: true,
		value: ref
	});
	Object.defineProperty(this, '_watchedLocal', {
		enumerable: false,
		configurable: true,
		writable: true,
		value: []
	});
	for ( var key in bp ) {
		(function(key){
			var _value = bp[key];
			// TODO get rid of this it's useless
			if ( Array.isArray( bp[key] ) ) {
				setList(bp[key]);
			} else if ( typeof bp[key] === 'object'){
				this[key] = new Model(this._ref.child(key), bp[key]);
			} else {
				Object.defineProperty(this, key, {
					enumerable: true,
					configurable: true,
					get: function() {
						return _value;
					},
					set: function(val){
						if (_value !== val && this._watchedLocal.indexOf(key) >= 0) {
							_value = val;
							this._ref.child(key)
								.set(val, function(err){
									//if (err) this._emit('error');
								});
						} else if (_value !== val) {
							// TODO let knoe firebase
							// the problem is here that what we need is the trigger which is nested
							// but the save can happen on the whole tree not only the nested part which got changed
							// is it good?
							if (typeof val === 'object') {
								_value = new Model(this._ref.child(key), val);
							} else {
								_value = val;
								//this._ref.child(key).set(_value);
							}
						}
						
					}
				});
				//console.log("setting", key, _value);
				this[key] = _value;
				//console.log(this[key]);
			}
		}.bind(this))(key);
	}

	function setList(prop, bp) {
		// TODO setup list
		// check if already a list
		if ( bp instanceof Fm.List ) {
			this[prop] = bp;
		} else {
			this[prop] = new Fm.List(bp);
		}
	}
};


Object.defineProperty(Model.prototype, 'watchLocal', {
	enumerable: false,
	configurable: true,
	writable: false,
	value: function(prop){
		if (this.hasOwnProperty(prop)) {
			this._watchedLocal.push(prop);
		}
	}
});

Object.defineProperty(Model.prototype, 'write', {
	enumerable: false,
	configurable: true,
	writable: false,
	value: function(){
		this._ref.set(this, function(err){
			//if (err) this._emit('error',{msg: "DB write error"});
		});
	}
});

var sample = {
	prop1: "first",
	prop2: "second",
	prop3: 43,
	prop4: {
		something: "tada",
		orthis: "tadatata",
		very_deep: {
			sub1: 12,
			sub2: "ABCD"
		}
	}
};


var m = new Model(ref.child('getset'), sample);

m.write();

m.watchLocal('prop1');
m.watchLocal('prop3');

m.prop1 = "hey";
m.prop3 = { deep: "inside"};

console.log(m.prop4.very_deep);
m.prop4.very_deep.watchLocal('sub2');

m.prop4.very_deep.sub2 = "XYZ";

// this should not work as it changes the shape of object
// but we have to inspect this as the shape of the object os changed in constructor by Object.defineProperty
// so technically it is cinstructor so it should be fine
// we need first to add this property to model and then assign it a value - good idea :)
m.prop4.very_deep.sub3 = "new sub 3";


