process.on('uncaugthException', function(err){
	console.error(err.stack);
});

var Fm = require('../build/firebase-mapper.js');
var Firebase = require('firebase');

var testBP = {
	simple: {
		prop1: "prop1",
		prop2: "prop2"
	},
	nested: {
		prop1: "prop1",
		prop2: "prop2",
		prop3: {
			sub1a: "sub 1 a",
			sub1b: {
				sub2a: "sub 2 a"
			}
		}
	},
	nestedReferenceList: {
		prop1: "prop1",
		prop2: ["list", {
			// no need to create ref to path as the path is given by Model - property
			// either factory config or factory itself
			factory: {
				fclass: Fm.ReferenceFactory,
				mclass: Fm.Reference,
				blueprint: 'bool'
			},
			type: "simple",
			keyType: "unique" 
		}],
		prop3: ["list", {
			factory: {
				fclass: Fm.ReferenceFactory,
				mclass: Fm.Reference,
				blueprint: {s1: "test", s2: null}
			},
			type: "rich",
			keyType: "unique" 
		}]
	}
};

module.exports = {
	'test basic': {
		'setUp': function(done) {
			done();
		},
		'model': function(test){

			var Sample = Fm.Basic.child();

			console.log(Sample.child.toString());
			Fm.Basic.child = function(){return "haha"};
			console.log(Sample.child.toString());

			test.ok(Sample.prototype instanceof Fm.Basic, 'expect instance of Fm.Basic');
			test.ok(Sample.hasOwnProperty('child'), 'expect static method child');

			test.done();
		}
	}
};
