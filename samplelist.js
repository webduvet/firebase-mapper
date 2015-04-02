var Firebase = require('firebase');
var Zz = require('./dist/firebase-mapper.js');

var modelBp = {
	prop1: null,
	prop2: null,
	prop3: "default"
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

// if not set to true it will return DB representation of the object
// but it will be not yet pushed to DB
// however watching locals will manifest those into DB
// user need to either set param to true or use .write() explicitly
var mm = list.push(true);

mm.watchLocal('prop1');
mm.prop1 = "test";

//mm.write();


var listBp = {
    factory: mFactory,
    type: "primary",
    keyType: "auto"
};


var n = list.get('-Jlked63nuiSy2ArCwrA');

n.on('loaded', function(){
	console.log("loaded: ", n);
});

console.log("not loaded yet", n);
