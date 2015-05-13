
Error.stackTraceLimit = Infinity;

process.on('uncaugthException', function(err){
	console.error(err.stack);
});

var Firebase = require('firebase');
var Fm = require('../build/firebase-mapper.js');

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
			blueprint: 'true',
			type: "simple",
			modelType: 'ref',
			keyType: "unique" 
		}],
		prop3: ["longlist", {
			blueprint: {s1: "test", s2: null},
			modelType: 'ref',
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
				modelType: 'model',
				blueprint: imgBlueprint
			}];

			// gallery blueprint
			var galleryBlueprint = {
				title: null,
				owner: null,
				pictures: ["shortlist", {
					modelType: 'ref',
					blueprint: 'true'
				}],
				audience: ["shortlist", {
					modelType: 'ref',
					blueprint: {
						name: 'some name'
					}
				}]
			};

			// notification blueprint
			var notiBlueprint = {
				itemid: null,
				msg: "",
				type: "gallery"
			};

			var notificationList = ["longlist",{
				modelType: 'model',
				blueprint: notiBlueprint
			}];

			// TODO notification list needs to push new notifications to location /notifications/userid/notificationAutoId
			// need to provide for userid
			// but reading the list we cen set ref to userid child
			var notifications = new Fm.List(new Firebase('https://sagavera.firebaseio.com/sampleRef/notifications'), notificationList[1]);


			var Gallery = function(){
				Fm.Model.apply(this, arguments);
			};
			Gallery.prototype = Object.create(Fm.Model.prototype);
			Gallery.prototype.constructor = Gallery;

			Gallery.prototype.save = function(){
				// save the Gallery object
				Fm.Model.prototype.save.apply(this,arguments);

				// do some other work like saving
				// reference to audience
				this.notify('created');
			};

			Gallery.prototype.addPicture = function(pic){
				// simple add, leave checking for existing from this
				this.pictures.add(pic).save();
				this.notify('picture_added');
			};

			Gallery.prototype.notify = function(msg){
				for (var key in this.audience) {
					if(this.audience.hasOwnProperty(key)) {
						var notification = notifications.pushUnder(key);
						notification.itemid = "todo this id";  // TODO should have something like this.key(), getting own key
						notification.msg = msg;
						notification.save();
					}
				}
			};


			var galleryFactory = new Fm.ModelFactory(new Firebase("https://sagavera.firebaseio.com/sampleRef/gallery"), galleryBlueprint, Gallery);

			var myGal = galleryFactory.create();

			test.ok(myGal.audience instanceof Fm.List, "expect audience to be a Fm.List");
			myGal.title = "some title";
			myGal.owner = "get_curent_User_ID";

			// TODO add an array of references, we can do as well save_add -which will check all the refs
			// TODO addByRef(referencedObject) it automatically takes all required fields from referenced object according blueprint (if more than true)
			// TODO if add does not have second param it is reference with true
			// if it does it can be object or rich reference - that should be the second param.
			// myGal.audience.add("user1", {name: "testname", age: 'testAGE'});
			myGal.audience.add('user1').name = "some nome";
			myGal.audience.add("user3");
			myGal.audience.add("user4");
			myGal.pictures.add("pic1");
			myGal.pictures.add("pic2");
			myGal.pictures.add("pic3");

			myGal.save();


			// myGal.addPicture("pic88");



			test.done();
		}
	}
};
