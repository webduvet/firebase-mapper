# firebase-mapper
attempt to make simple mapper for firebase structure

## create a blueprint and make model
documenent type database always means fat client. It is where the most of the logic comes when one chooses firebase as the storage. 
Anything beyond a symple example quickly becomes some sort of spagety type of code where developer is battling with either callback hell 
or nested promises couple of levels. 

## Why?
Storing data in document storage requires certain level of denormalization. Developer very quickly wandrs away from all nice tools relational database
offers and swimms in deep water of denormalized data.

## Soluction
Fb blue print and model tool is here to help in this battle.  The project aims to create factory method which creates firebase friendly data mapper, where in blue print we
define the structure and relations and let the model figure out all the denormalized data.

## Thoughts
list can contain two type of object
#####primary
object have unique indetifier and are primary object, this means if the key appears somewhere else in the tree it is refering to this object
#####reference
this is object refering to primary object. 
reference can be as simple as {KEY:true} creating a simple list of references (perhaps stored by timestamp priority)
but it can contain denormalized parts from primary object, or other informative objects like counters.
Reference object can't be refered again by another reference.

#####Init part
ModelFactory needs to be instantiated with valid db reference like

	var mf = new ModelFactory( new Firebase('url') );

ModelFactory assumes the reference refers to root of the database and all other objects declared are in the root level

	var myItem = mf.create("status", ['value', 'active' ]);
	myItem.write();
	myItem.on('written', function(){ //do something });
	myItem = 'pushed';
	myItem.write();

also consider:

	muItem
		.set('pushed') 	//sets on model, if I do only set without setter I can have an atomic item name:value
		.write(); 			//writes to db

NOTE
the above example might not be enirely correct `myItem = 'pushed'` does not sets myItems' property but variable myItem to string
need to thing of soemthing else.
must have a root object containing either properties or other nested onjects / lists.

creates simple object called 'status' containing value 'active', writes it into db and listens when it is written.
note: firebase attempts to write it again should the connection fail.

	var myItem = mf.create("keyName", ['value', 'some_value' ]);
	var myItem = mf.create("keyName", ['list']); // items do not need to be identical, it is just good practice for them to have consistent unique ID
	var myItem = mf.create("keyName", ['object', {prop1: "", prop2: ""} ]); 
	var myItem = mf.create("keyName", ['object', otherItem_of_object_type ]); 

NOTE: It can be opinionated and prevent assigning other object to value or list,
there should be no deeper level then list.
there should be no list at the same level with other objects or values - list would prevent retrieving the object in one piece.

NOTE: what is the point od `value` item? This does not attempt to copy the db structure, but should create abstraction layer. So value is always part of another object as property!


##### update event
set the flag to live and all assignments like `object.item = value` will be propagated to firebase, and the event `update` will be triggered
the same will apply otjer way around. if the prop is set with flag `live` the update on firebase will trigger the update inside the object
it will update the value and trigger the event `new_content`
better:
two flags

	watch_remote: BOOL
	watch_local: BOOL

if true the object will be synchronyzing with FB
if the synchrozisation fails for varoius reasons the coresponding event is fired like `lost_connection`

##### object rule

ModelObject can contain ModelItenms, or can contain value // ['value', 'someValue']
value can be simple value or object however once it is type of value it can't contain other models
it can be written to DB only as an object, locally can be assigned as usuall.

Model type of value containing object sample:

	myObject:{prop1: true, prop2: {subvalue: TIME, status: "status"}}

operations read, write, on etc. are atomic and concerne the whole object.
if we want to make prop2 as model, prop one will have to become a model with type of value as well.

so:

typeof 
value			read, write, on atomicly
list			we restrain this to contain only unique ID supplied or generated.
container	can contain objects type of value, list, container.

##### xxxxxxxxxx 
no type of value allowed anymore. it is either property of Model or nested in literal in which case the model does not allow for any specific events
but all db events are still possible to use directly on the path.

#### type container
can't have a value, does not have a set method. write method does not write the properties directly to DB. Since the proiperties are other containers or values or lists (not recomended)
it passes the save action to the children.

#### type value
is basic type which 'talks' to DB. it can contain primitive value or full JS object. should not contain list.

#### type list
shell for list - should contain some kind of paginator, instantiate with type Value Class or object, so only that typoe of object can be pushed into list.
auto watch on DB should generate new objects of type value or type container (not list)
list does not have a savte method. respectivly write method will onluy cause to write on new pushed children, which will be propagated into DB.

### Ammended types - scrap the above
#### type model
This type contains properties. Property can be either primitive or obejct literal. can be watched, as local and remote. This is part of the propery definition.
Property can as well contain a reference to another model or list. 
If there is a reference, it needs to be somehow marked. - can have a psude value similar to RESTful geeting only object keys. 
We have a two types of references.
plain reference which in the form 

	SOME_UNIQUE_ID: true

or complex reference which can look likw this

	SOME_UNIQUE_ID:
	{
		prop1: "something",
		prop2: "something else",
		prop3:
		{
			sub1: "more else",
			sub2: "more more else"
		}
	}

where the reference is very often stored using some priority (TODO priorities) 
in this object it could contain some user specific data relatve to some other object or it can be just extract of more complez object which is refered by UNIQUE ID
Right now I can't think of any usecase where the reference key is not unique identifier created by increment or push ID

#### type list
should be created with class of which object list should contain. list needs to have a method pushNew where creates new record. it should contain a aginator
or endless scrolling feature.
should take care of priorities.
should allow for changing prioritties within the list.
should listen for all relevant events:
	
	child_added
	child_moved
	chiled_removed

as well as limitLast and LimitFirst esoecially in relation to pnaginator.

#### if parent - child relationship
parent has path, child need to store parents' path or need to create that path. If parent is not in DB (children are not in yet, so it is not possible to create umpty object) child.save need
to lookup parent path and create it's own reference.
This is important as the child does not need to be created during Map creation, but assigned at any point later.

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



TODO
the object and nested objects should have flag saying auto update, so all changes on DB can be immediatelly propagated into object
with this we need to wait with save until the read/update is finished.
it either should throw and error, wrning or just updates the just read property. TODO - decide
...

