
Error.stackTraceLimit = Infinity;

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
		prop2: ["longlist", {
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
		prop3: ["longlist", {
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

			// referenced
			var feedListConfig = {
				factory: {
					fclass: Fm.ReferenceFactory,
					mclass: Fm.Reference,
					blueprint: 'bool'
				},
				type: 'simple'
			};

			// referencing
			var sampleBlueprint = {
				title: null,
				collection: ["longlist", {
					factory:{
						fclass: Fm.ReferenceFactory,
						mclass: Fm.Reference,
						blueprint: 'bool'
					}
				}]
			};

			var Sample = function(){
				Fm.Model.apply(this, arguments);
				Object.defineProperty(this, 'feedList', {
					enumerable: false,
					configurable: false,
					writable: false,
					value: new Fm.List(new Firebase('https://sagavera.firebaseio.com/sampleRef/feed'), feedListConfig)
				});
			};
			Sample.prototype = Object.create(Fm.Model.prototype);
			Sample.prototype.constructor = Sample;

			Object.defineProperty(Sample.prototype, "save", {
				  enumerable: false
				, configurable: true
				, writable: false
				, value: function(){
					console.log(this);
					Fm.Model.prototype.save.apply(this,arguments);
					for (var key in this.collection) {
						var item = this.feedList.add(key);
						// here populate item or just save as true;
						item.save();
					}
				}
			});


			var sampleFactory = new Fm.ModelFactory(new Firebase("https://sagavera.firebaseio.com/sampleRef/models"), sampleBlueprint, Sample);

			test.ok(Sample.prototype instanceof Fm.Basic, 'expect instance of Fm.Basic');

			var sample = sampleFactory.create();
			sample.title = "room1";
			var item1 = sample.collection.add('item1');
			//item1.save();
			var item2 = sample.collection.add('item2');
			//item2.save();
			console.log(sample);
			sample.save();

			test.done();
		}
	}
};
