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
	}
};

module.exports = {
	'test basic': {
		'setUp': function(done) {
			done();
		},
		'all in place': function(test) {
			test.expect(5);
			test.equals(typeof Fm, 'object', 'expect object got: ', typeof Fm);
			test.equals(typeof Fm.Model, 'function', 'expect typeof function and got', typeof Fm.Model);
			test.equals(typeof Fm.ModelFactory, 'function', 'expect typeof function and got', typeof Fm.ModelFactory);
			test.equals(typeof Fm.List, 'function', 'expect typeof function and got', typeof Fm.List);
			test.equals(typeof Fm.ListFactory, 'function', 'expect typeof function and got', typeof Fm.ListFactory);
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
			this.ref = new Firebase('http://sagavera.firebaseio.com/testsimple');
				done();
			//this.ref.set(null, function(err){
			//});
		},
		'simple': function (test) {
			test.expect(2);
			var model = new Fm.Model(this.ref.child('simple'), testBP.simple);
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

			model.write();

			// TODO do watchLocal on all nested properties by default
			model.prop3.sub1b.watchLocal('sub2a');

			model.prop3.sub1b.sub2a = "new deep value";

			model.prop3.sub1b.on('delivered', function(key){
				test.equals(model.prop3.sub1a.sub2a, 'new deep value');
				test.done();
			});
			model.on('error', function(err){
				console.log('TODO catch error');
			});

		},
		'modelFactory': function (test) {
			test.expect(2);
			var mf = new Fm.ModelFactory(this.ref.child('modelfactory'), testBP.simple);
			var m = mf.create();

			test.ok(m instanceof Mf.Model, "expecting instance of Fm.Model");
			test.equals(m.prop1, 'prop1');
			test.done();
		}
	}
};
