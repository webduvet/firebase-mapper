var Firebase = require('firebase');
var Zz = require('./build/firebase-mapper.js');
var ref = new Firebase('https://sagavera.firebaseio.com');
var blueprintNested = {
	nestedA: "top nested",
	nestedB: {
		deep: "second level"
	}
};

// TODO we need
// once the assigning to a parent is taiking place, we need parent reference to take place of the current ref
// with the path(key) name
var xNested = new Zz.Model(ref.child('test/me'), blueprintNested );

var blueprint = {
  prop1: null,
  prop2: null,
  prop3: "default",
  prop4:
  {
	  s1: "level 2",
	  s2:{
		  sx: "level 3x",
		  sy: "level 3y",
		  sz: {
				deeper: "deepest"
			}
	  }
  },
	prop5: xNested
};


// set Model with blueprint of test data
var x = new Zz.Model(ref.child('test'), 'test/me', blueprint);

// write the test data int DB
// TODO
// this should have CB so we know 

x.write();
//xNested.watchLocal('nestedA');
xNested.nestedA = "changed val";
//xNested.unwatchLocal('nestedA');

// listen when the data write is finished
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
x.watchRemote("prop4", "child_changed");

setTimeout(function(){ 
	x.prop1="late change see if it gets in"; 
	x.prop1 ="fast change";
	console.log("assigned x.prop1", x.prop1);
	console.log("assigned x.prop4", x.prop4);
	//console.log(JSON.stringify(x));
}, 10000)
