var A = function(){
}

A.prototype.set = function(prop, value){
	this[prop] = value;
}

A.prototype.get = function(prop){
	return this[prop];
}

var a = new A();
console.time('test_a');
for(var i = 0; i < 1000000; i++){
	a.set('hey', i);
}
console.timeEnd('test_a');

var bb = {};
console.time('test_bb');
for(var i = 0; i < 1000000; i++){
	bb.hey = i;
}
console.timeEnd('test_bb');

var b = {};
console.time('test_b');
for(var i = 0; i < 1000000; i++){
	b['hey'] = i;
}
console.timeEnd('test_b');


var c = {};
console.time('test_c');
for(var i = 0; i < 1000000; i++){
	Object.defineProperty(c, 'hey', {
		  enumerable: true
		, writable: true
		, configurable: true
		, value: i
	});
}
console.timeEnd('test_c');

