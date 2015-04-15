# firebase-mapper
Simple data mapper for firebase. Encapsulate the Firebase reference and the data model stored under the reference. firebase-mapper as well
can handle the objects containing primary lists and lists from reference objects pointing to other databaswe locations.

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
offers and swimms in deep water of denormalized data.

Model representation.
The document based databases have a great advantage that the documents does not need to folow the rigid structure. Not required fields are just not present.
Firebase behaves in the very same way

	ref.set({prop1: null, prop2, "sample"});

will propagate only `prop2` into DB and subsequently when retrieveing from db the object does not contain `prop1`. Of the property is added in later stage it will cause
to break hidden class and hinders the over performance. 

The Model representation is created from blueprint with all the optional and possible fields, thus the objects shape will never change and can be optimizes 
[see hidden class]https://developers.google.com/v8/design


## Solution
Firebase is document type DBAAS, web or server client interacts with ratabase via Firebase referenVce where he passes a location to data. 
Any custom logic, more complex objects with relations to other objects and all CRUD operations need to be implemented on client or on server side.
Firebase-mapper creates an object representing the database object and the ralation to other object through references. It sets up the shape of the 
javascript object and allows to interact with data just by assigning valies to object's property with backround or explicit synchronization with database.

Blueprint and model tool is here define the object shape.  This project aims to create factory method which creates firebase friendly model representation of firebase data.
In the blueprint we define the structure and relations and let the model figure out all the denormalized data.


## Installation
via npm

	npm install firebase-mapper

	var FM = require('firebase-mapper');


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

from object other object, it populates only the matching proprties and others are ignored

	var n = modelFactory.create(ref);
	n.loadFromObject(object); // TODO - us .load() -if a param is used then do not use DB but provided object


in both cases the event "loaded" is dispatched

n.on('loaded', function(){
	// TODO are we passing anything here?
	});


## Structure

### Object Blueprint
is object literal which serves as blueprint for ModelFactory to create new instances of a model or a list

Blueprint represents the properties of the model. 
it contains all properties set to null, so the model created does not change the shape once the properties are initialized.
Blueprint contains information if nested element is `primitive` or `object literal` or `instance of a model` or `instance of a list`.
Nested models or lists will cause instantiation of apropriate factory which will use the nested object as its' blueprint.
The instance of factory of nested onject will reside within parent ModelFactory instance.
Once the Model is created the child instance will create it's own part which is assigned to coresponding property.

### Model and Model Factory
Model is created by factory instance. ModelFactory is a class of which constructor takes blueprint, url, and firebase reference as parameter.
instance of ModelFactory will produce the models of the same blueprint. Each factory instance contains a decorating methods so 
the cratoin of the model can be decorated with extra methods if needed - that however does not affect already created models.
The methods like `write` can be decarated as well to accomodate some specific behaviour of some models (saving procedure affecting other parts of DB)

### List and list Factory
should be created with class of which object list should contain. list needs to have a method pushNew where creates new record. it should contain a paginator
or endless scrolling feature.
should take care of priorities.
should allow for changing prioritties within the list.
should listen for all relevant events:
	
	child_added
	child_moved
	chiled_removed

as well as limitLast and LimitFirst esoecially in relation to paginator.

There kshould be no option/need to modify items in the list from the List directly. e.g. give me list record XZY and I add XZY.name. Big no no.
List Items, if they are full objects can be modified via Model
if they are rich references, those are modified via application logic. let say, xzy.pagevisits++.
if they are plain references - those can't be modified. only removed.
List does not have any methods to modify the items inside - only via Models or directly from App logic.
Lists are primarily used as list of references for display / search purposes.

### Reference and Reference Factory
this is object refering to primary object. 
reference can be as simple as {KEY:true} creating a simple list of references (perhaps stored by timestamp priority)
but it can contain denormalized parts from primary object, or other informative objects like counters.
Reference object can't be refered again by another reference.

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
the same will apply otjer way around. if the prop is set with flag `live` the update on firebase will trigger the update inside the object
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
Paginator object, containing the [size] lodaed records 

	.set(size, first)
	.next();
	.previous();


#### ModelFactory.addAction
Actions simpulates the relationship to other models
e.g. 
UserA has friends UseB to F 
When user A posts a message in chat program, the message or the reference to that message should be pushed to UserB to F specific location
for example messages/{UserX}/userA/message.json
this action is desired to have automated and the client does not need to wait for the result either positive or negative or mixed.

it is a factory method which decorates Models' write method to accomodate the action requirements

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

first afgument is name of the 'class'
second argument is construct saying it is object (not a list) and defines all the properties of the object

	var user = BpFactore.create('app.user', bprint);



### user is expected to do the following operations

set objects' property

	user.name = name;


set deep nested onjects' property

	user.info.gender = "male" sets gender


write deep nested obbjects' property into DB

	user.info.gender.write();


rule: the parent location must be already in DB otherwise is thrown error - can't write to non existent location


write whole nested object in DB at once (overwite all inner properies). Assuming object 'user' is already defined on DB. otherwise the db is very likely throw an error of non existent location.

	user.info.write();


write the whole object into DB which overwrites all the inner properties or objects. 

	user.write();


TODO thik about events once the write / read / update etc operations are finished and new data available in the model.
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



...


## TODO:

#### relations and associations
we have no concept of relations - mainly to have references and denormalization
the only notiion right now is to decorate the create method owith something
relation should be created on create and propagated to DB on write

#### identify object
how do we know that the object in DB has the same structure? It is not guaranteed - all we have is a factory and blueprint so we know what we expect
Do we just fill the properties one by one?
Do we set the ref on new object from factory and that will trigger interal update? - Prefered option

#### list within a model
it is possible and vital for a model to contain a list (not endless) 
e.g. - a game contains a limitted amoutn of players


## long term TODO

Model and Reference and List shouls inherit from let say Fm.Object

Wrap Firebase in to DBobject
