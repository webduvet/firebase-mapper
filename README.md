# firebase-mapper
![Build Status](https://travis-ci.org/webduvet/firebase-mapper.svg?branch=master)

Development version, this README is old.., use with care


Simple data mapper for firebase. Encapsulate the Firebase reference and the data model stored under the reference. firebase-mapper as well
can handle the objects containing primary lists and lists from reference objects pointing to other database locations.

## Example

	UserList
		User1: {primary user data}
		user2: {primary user data}
		user3: {primary user data}

	ChatRoom
		chatroomData: {data},
		chatroomAudience:
			User1: true,
			User2: true

Chatroom object contains a list of user references to indicate who is in the chatroom

## Motivation
Storing data in document storage requires certain level of denormalization. Developer very quickly moves away from all the nice tools relational database
offers and swims in deep water of denormalized data.

Model representation.
The document based databases have a great advantage that the documents does not need to follow the rigid structure. Not required fields are just not present.
Firebase behaves in the very same way

	ref.set({prop1: null, prop2, "sample"});

will propagate only `prop2` into DB and subsequently when retrieveing from db the object does not contain `prop1`. Of the property is added in later stage it will cause
to break hidden class and hinders the over performance. 

The Model representation is created from blueprint with all the optional and possible fields, thus the objects shape will never change and can be optimizes 
[see hidden class]https://developers.google.com/v8/design


## Solution
Firebase is document type DBAAS, web or server client interacts with database via Firebase reference where he passes a location to data. 
Any custom logic, more complex objects with relations to other objects and all CRUD operations need to be implemented on client or on server side.
Firebase-mapper creates an object representing the database object and the relation to other object through references. It sets up the shape of the 
javascript object and allows to interact with data just by assigning values to object's property with background or explicit synchronisation with database.

Blueprint and model tool is here define the object shape.  This project aims to create factory method which creates firebase friendly model representation of firebase data.
In the blueprint we define the structure and relations and let the model figure out all the denormalized data.


## Installation
via npm

	npm install firebase-mapper

	var Fm = require('firebase-mapper');


## API 

### Init
ModelFactory needs to be instantiated with valid db reference like
creates the factory with reference and provided blueprint. 

	var factory = new ModelFactory(new Firebase('url'), blueprint);

	var obj = factory.create(ID); // creates new object pointing to location ref/ID using factory's blueprint
	obj.save() // saves all default values to database, if all null the save is cancelled

	obj.on('saved', handler);  // listen when object is saved



### Load object from DB
Model factory can load model from DB location

from database

	var n = list.get(id);
	n.load();

from object other object, it populates only the matching properties and others are ignored

	var n = modelFactory.create(ref);
	n.loadFromObject(object); // TODO - us .load() -if a param is used then do not use DB but provided object


in both cases the event "loaded" is dispatched

n.on('loaded', function(){
	// TODO are we passing anything here?
	});


## Structure

### Object Blueprint
is object literal which serves as blueprint for ModelFactory to create new instances of a model or a list

Blueprint for object only is javascript object. Values which have no default value are assign with `null`. This will not get propagated to 
database on save action. 
Blueprint for list is more specific and has the shape of an array with first value describing that it is a list and the second value is list
config object containing the factory class, model class, path in database, and blueprint for object in the list.

sample:

	sampleBlueprint: {
        prop1: "prop1",
        prop2: ["list", {
            factory: {
				path: path.to.prop2
                fclass: Fm.ReferenceFactory,
                mclass: Fm.Reference,
                blueprint: 'bool'
            },
            type: "simple",
            keyType: "unique"
        }],
        prop3: ["list", {
            factory: {
				path: path.to.prop3
                fclass: Fm.ReferenceFactory,
                mclass: Fm.Reference,
                blueprint: {s1: "test", s2: null}
            },
            type: "rich",
            keyType: "unique"
        }]
    }

the above example illustrates the blueprint for object with 3 properties and one property contains a list of rich references and one is list of simple references.

### Model and Model Factory
Model is created by factory instance. ModelFactory is a class of which constructor takes blueprint, url, and firebase reference as parameter.
instance of ModelFactory will produce the models of the same blueprint. Each factory instance contains a decorating methods so 
the the model can be decorated with extra methods if needed - that however does not affect already created models.
The methods like `save` can be decorated as well to accommodate some specific behaviour of some models (saving procedure affecting other parts of DB)

### List
contains the methods to interact with DB.

pushes new item to the list, creates autoID - suitable for primary objects

	.push()

adds the object under specified ID - suits references, only id for simple references, object provided for rich references

	.add(id [,obj])

get object by id from list;

	.get(id)

remove object by id from list and DB

	.remove(id)

sets priority for the item in the list

	.setPriority(id, priority) // TODO

#### ShortList
is the list which contains small number references or Models and all can be loaded in memory
e.g. references in shopping cart
Short list does everything what LongList does but extends the Object by the reference key. So it can be saved as part of the parent model.

#### LongList
is the proper list where the number of items is limited only by hardware limitations. The items in the list can be loaded only via paginator
and are not part of the own properties of the list object as short list. 
If a model contains a long list (which is not recommended) the model can't be saved using save method. doing so would erase the list content.

##### Events

###### ChildAdded
remote event propagated from Firebase

###### ChildRemoved
Remote event propagated from firebase

###### OrderChanged
Remote Event propagated from firebase


#### Long List
is the type of list which can grow endlessly. e.g. registered users, user comments etc. This list is a wrapper for DB operations on list
endless list does not load the actual list into local memory

TODO
does load a page in paginator

#### Short List
is the type of list which contains short amount of items which could be loaded into memory at once
the interaction with db is the same as long lists. However short list sould be able to add items localy and save the into remote.


TODO
set in config the max length of short list, for now it is up to programmer decission





### Reference and Reference Factory
this is object referring to primary object. 
reference can be as simple as {KEY:true} creating a simple list of references (perhaps stored by timestamp priority)
but it can contain denormalized parts from primary object, or other informative objects like counters.
Reference object can't be referred again by another reference.

Reference is a pointer to another location in DB.
it could be as value, but the faster and better way is store them as key and value as simple as true or another descriptive object with
extra information e.g. timestamp of creation of reference or some denormalized values for faster access.

How to construct the reference?
we need LOCATION of the original. This could be path or DB reference to location.
we can have a model instance as well which contains the path and DB reference.

###### Plain reference
this plainly refers to primary object in the form {KEY}:true

###### Rich reference
this contains additional information in the reference object, usually unique related to specific record

	{KEY}: {
		info1: "info1",
		info2: "info2"
	}, ...



### EVENTS

#### update
set the flag to live and all assignments like `object.item = value` will be propagated to firebase, and the event `update` will be triggered
the same will apply other way around. if the prop is set with flag `live` the update on firebase will trigger the update inside the object
it will update the value and trigger the event `new_content`
better:
two flags

	watch_remote: BOOL
	watch_local: BOOL

if true the object will be synchronyzing with FB
if the synchrozisation fails for varoius reasons the coresponding event is fired like `lost_connection`





##### List.push([Zz.Model])
creates new key in the list, 
if no arguments provided it create as well a brand new object from blueprint and it is ready to be saved to DB with default values.
If instance of a Model is provided it will be assigned the generated ID and can be saved into list.

##### List.page
Paginator object, containing the [size] loaded records 

	.set(size, first)
	.next();
	.previous();


#### ModelFactory.addAction
Actions simulates the relationship to other models
e.g. 
UserA has friends UseB to F 
When user A posts a message in chat program, the message or the reference to that message should be pushed to UserB to F specific location
for example messages/{UserX}/userA/message.json
this action is desired to have automated and the client does not need to wait for the result either positive or negative or mixed.

it is a factory method which decorates Models' write method to accommodate the action requirements

1.) addActionMethod
2.) decorates write method

## example
### simple user object

	var BpFactory = new Mapper(reference)

	var bprint = {'user', ['object', 
		{
			name:'text', 
			surname:'text', 
			info:['object', { 
				gender: TXT, 
				active: BOOL
			}]
		}
	]};

first argument is name of the 'class'
second argument is construct saying it is object (not a list) and defines all the properties of the object

	var user = BpFactore.create('app.user', bprint);



### user is expected to do the following operations

set objects' property

	user.name = name;


set deep nested objects' property

	user.info.gender = "male" sets gender


write deep nested objects' property into DB

	user.info.gender.write();


rule: the parent location must be already in DB otherwise is thrown error - can't write to non existent location


write whole nested object in DB at once (overwrite all inner properties). Assuming object 'user' is already defined on DB. otherwise the db is very likely throw an error of non existent location.

	user.info.write();


write the whole object into DB which overwrites all the inner properties or objects. 

	user.write();





...


## TODO:

#### relations and associations
we have no concept of relations - mainly to have references and denormalization
the only notiion right now is to decorate the create method owith something
relation should be created on create and propagated to DB on write

#### make a safeSave which will iterate through own properties and save the on e by one
in case the onject contains a long list

#### identify object
how do we know that the object in DB has the same structure? It is not guaranteed - all we have is a factory and blueprint so we know what we expect
Do we just fill the properties one by one?
Do we set the ref on new object from factory and that will trigger interal update? - Prefered option

#### list within a model
it is possible and vital for a model to contain a list (not endless) 
e.g. - a game contains a limitted amoutn of players

#### about events once the write / read / update etc operations are finished and new data available in the model.
example:
	
	user.info.write();
	user.info.writeDone(cb);
	user.info.writeFail(cb);
	or
	user.info.on('write_success', cb);
	or
	user.info.on('write', cb_success, cb_error);
	or
	user.info.written(function(success){}); // success true / false

## long term TODO

Model and Reference and List shouls inherit from let say Fm.Object

Wrap Firebase in to DBobject
