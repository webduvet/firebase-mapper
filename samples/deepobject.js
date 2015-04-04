var Model = function(bp){
	for ( var key in bp ) {
		(function(key){
			var _value = bp[key];
			console.log("setting", key, _value);
			if ( typeof bp[key] === 'object' ) {
				console.log("todo object");
			} else {
				Object.defineProperty(this, key, {
					enumerable: true,
					configurable: true,
					get: function() {
						return _value;
					},
					set: function(val){
						_value = val;
					}
				});
			}
		}.bind(this))(key);
	}
};

var sample = {
	prop1: "first",
	prop2: "second",
	prop3: 43
};


var m = new Model(sample);


console.log(m);
console.log(m.prop1, m.prop3);


m.prop1 = "hey";
console.log(m, m.prop1);
