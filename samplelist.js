var Firebase = require('firebase');
var Zz = require('./lib/mapper.js');

var modelBp = {
	prop1: null,
	prop2: null,
	prop3: 0
};

// stand alone object with own url
var mFactory = new Zz.ModelFactory(new Firebase('https://sagavera.firebaseio.com/testlist'), modelBp);

/*
var m = mFactory.create();
console.log(m);
m.write();
m.watchLocal('prop1');
m.prop1 = "something";
*/

// as part of a list
// we use list factory only if the list is populated by list
var list = new Zz.List ({
	ref: new Firebase('https://sagavera.firebaseio.com/testlist'),
	factory: mFactory,
	type: "primary",
	keyType: "auto"
});

var mm = list.push();

mm.watchLocal('prop1');
mm.prop1 = "test";

//mm.write();


var listBp = {
    factory: mFactory,
    type: "primary",
    keyType: "auto"
};

