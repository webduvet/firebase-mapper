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
		'all in place': function(test) {
			test.expect(10);
			test.equals(typeof Fm, 'object', 'expect object got: ', typeof Fm);
			test.equals(typeof Fm.Model, 'function', 'expect typeof function and got', typeof Fm.Model);
			test.equals(typeof Fm.ModelFactory, 'function', 'expect typeof function and got', typeof Fm.ModelFactory);
			test.equals(typeof Fm.List, 'function', 'expect typeof function and got', typeof Fm.List);
			test.equals(typeof Fm.ListFactory, 'function', 'expect typeof function and got', typeof Fm.ListFactory);
			test.equals(typeof Fm.Reference, 'function', 'expect typeof function and got', typeof Fm.Reference);
			test.equals(typeof Fm.ReferenceFactory, 'function', 'expect typeof function and got', typeof Fm.ReferenceFactory);
			test.ok(Fm.Model.prototype instanceof Fm.Basic, 'Fm.Model is expected to inherit from Fm.Basic');
			test.ok(Fm.Reference.prototype instanceof Fm.Basic, 'Fm.Reference is expected to inherit from Fm.Basic');
			test.ok(Fm.ReferenceFactory.prototype instanceof Fm.ModelFactory, 'Fm.Reference is expected to inherit from Fm.Basic');
			test.done();
		},
		'test exceptions': function(test) {
			test.expect(6);
			test.throws( function(){ new Fm.List();});
			test.throws( function(){ new Fm.Model();});
			test.throws( function(){ new Fm.Model({},{});});
			test.doesNotThrow( function(){ new Fm.Model(new Firebase('https://sagavera.firebaseio.com'),{prop:"sample"});});
			test.throws( function(){ new Fm.Model(new Firebase('https://sagavera.firebaseio.com'),null);});
			test.throws( function(){ new Fm.Model({},{prop:"sample"});});
			test.done();
		},
		'test priority provider': function(test) {
			var ts1 = Date.now();
			test.expect(1);
			var provider = new Fm.PriorityProvider(function(){
				return Date.now();
			});
			test.ok(ts1 < provider.priority < Date.now(), 'expect unix timestamp');
			test.done();
		}
	},
	'test Model': {
		'setUp': function(done) {
			this.ref = new Firebase('http://sagavera.firebaseio.com/modeltest');
				done();
			//this.ref.set(null, function(err){
			//});
		},
		'simple': function (test) {
			test.expect(4);
			var model = new Fm.Model(this.ref.child('simple'), testBP.simple);

			test.ok(model instanceof Fm.Model, 'expect model to be instance of Fm.Model');
			test.ok(model instanceof Fm.Basic, 'expect model to be instance of Fm.Basic');
			// TODO if not write then watchLocal does not trigger written..
			// model.write();
			test.equals(model.prop1, "prop1", "Expect prop1 and got " + model.prop1);
			// TODO model.write and watchLocal need to trigger different event. !!!
			// TODO watchLocal can trigger two events - sentToRemote (sent) and deliveredToRemote(delivered)
			model.on('delivered', function(){
				// wrutten brings us here
				test.equals(model.prop1, 'update');
				test.done();
			});
			model.watchLocal('prop1');
			model.prop1 = "update";
		},
		'nested': function (test) {
			test.expect(1);
			var model = new Fm.Model(this.ref.child('nested'), testBP.nested);

			model.save();

			// TODO do watchLocal on all nested properties by default
			model.prop3.sub1b.watchLocal('sub2a');

			model.prop3.sub1b.sub2a = "new deep value";

			model.prop3.sub1b.on('delivered', function(key){
				test.equals(model.prop3.sub1b.sub2a, 'new deep value');
				test.done();
			});
			model.on('error', function(err){
				console.log('TODO catch error');
			});

		},
		'modelFactory': function (test) {
			test.expect(2);
			var mf = new Fm.ModelFactory(this.ref.child('modelfactory'), testBP.simple, Fm.Model);
			var m = mf.create();

			test.ok(m instanceof Fm.Model, "expecting instance of Fm.Model");
			test.equals(m.prop1, 'prop1');
			test.done();
		},
		'modelWithNestedReferenceList': function(test) {
			test.expect(5);

			var m = new Fm.Model(this.ref.child('nestedReferenceList'), testBP.nestedReferenceList);

			test.ok( m.prop2 instanceof Fm.List, "Expect instance of a Fm.List" );
			test.ok( m.prop2.factory instanceof Fm.ReferenceFactory, "factory in list is expected to be instance of ReferenceFactory");
			test.ok( m.prop2.factory instanceof Fm.ModelFactory, "factory in list is expected to be instance of ModelFactory");
			test.ok(m.prop2 instanceof Fm.List, 'expect instance of List');
			test.ok(m.prop3 instanceof Fm.List, 'expect instance of List');

			m.prop2.add('testref1');
			m.prop2.add('testref2');
			m.prop2.add('testref3');
			m.prop2.add('testref4');

			var rf = m.prop3.add('rich1');
			rf.s1 = "asd";
			rf.s2 = "qwe";
			rf.save();

			rf = m.prop3.add('rich2');
			rf.s1 = "asd";
			rf.s2 = "qwe";
			rf.save();

			m.save();

			test.done();
		}
	}
};
