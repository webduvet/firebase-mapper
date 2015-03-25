var Firebase = require('firebase');
var Zz = require('./lib/mapper.js');
var ref = new Firebase('https://sagavera.firebaseio.com');
var blueprint = {
  prop1: null,
  prop2: null,
  prop3: "default"
};


var x = new Zz.Model(ref.child('test'), 'test/me', blueprint);

x.write();
x.on('written', function(){
	console.log("data written");
});

x.watchLocal('prop1');

setTimeout(function(){ 
	x.prop1= Math.random(); 
	//console.log("assigned x.prop1", x.prop1);
}, 2000)

setTimeout(function(){ 
	x.prop1="write 4s after"; 
	//console.log("assigned x.prop1", x);
	//console.log(JSON.stringify(x));
}, 4000)

x.watchRemote("prop1", "value");

setTimeout(function(){ 
	x.prop1="late change see if it gets in"; 
	x.prop1 ="fast change";
	console.log("assigned x.prop1", x.prop1);
	//console.log(JSON.stringify(x));
}, 10000)

console.log(x);
