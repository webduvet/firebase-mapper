
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
				blueprint: 'true'
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
	'test object': {
		'setUp': function(done) {
			done();
		},
		'complex model': function(test){

			/**
			 * testing scanario user - gallery pictures
			 * where user can create gallery
			 * gallery is owned by user
			 * gallery can contain up to 10 pictures
			 * which are stored under pictures object
			 * gallery has audience of users
			 * if gallery is created each user in audience gets the notification
			 * if picture is added to gallery each user in audience gets notification
			 *
			 * for this sample we need gallery blueprint as we create gallery
			 * picture blueprint as we add picture
			 * notification bueprint as we create notification
			 * we can fake user ID.
			 */

			var fakeUserIds = ['user1', 'user2', 'user3', 'user4'];

			var imgBlueprint = {
				path: null,
				title: null
			};

			var imgListBp = ["longlist",{
				factory:{
					fclass: Fm.ModelFactory,
					mclass: Fm.Model,
					blueprint: imgBlueprint
				}
			}];

			// gallery blueprint
			var galleryBlueprint = {
				title: null,
				owner: null,
				pictures: ["shortlist", {
					factory:{
						fclass: Fm.ReferenceFactory,
						mclass: Fm.Reference,
						blueprint: 'true'
					}
				}],
				audience: ["shortlist", {
					factory:{
						fclass: Fm.ReferenceFactory,
						mclass: Fm.Reference,
						blueprint: 'true'
					}
				}]
			};

			// notification blueprint
			var notBlueprint = {
				gallery: null,
				msg: "",
				type: "gallery"
			};

			var notificationList = ["longlist",{
				factory:{
					fclass: Fm.ModelFactory,
					mclass: Fm.Model,
					blueprint: notBlueprint
				}
			}];


			var Gallery = function(){
				Fm.Model.apply(this, arguments);
			};
			Gallery.prototype = Object.create(Fm.Model.prototype);
			Gallery.prototype.constructor = Gallery;

			Gallery.prototype.save = function(){
				console.log(this);
				Fm.Model.prototype.save.apply(this,arguments);
				for (var key in this.audience) {
					var item = this.feedList.add(key);
					// here populate item or just save as true;
					item.save();
				}
			};


			var sampleFactory = new Fm.ModelFactory(new Firebase("https://sagavera.firebaseio.com/sampleRef/models"), sampleBlueprint, Sample);

			test.ok(Sample.prototype instanceof Fm.Basic, 'expect instance of Fm.Basic');

			var sample = sampleFactory.push();
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
