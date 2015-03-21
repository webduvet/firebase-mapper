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
		.set('pushed') 	//sets on model
		.write(); 			//writes to db

creates simple object called 'status' containing value 'active', writes it into db and listens when it is written.
note: firebase attempts to write it again should the connection fail.

##### update
set the flag to live and all assignments like `object.item = value` will be propagated to firebase, and the event `update` will be triggered
the same will apply otjer way around. if the prop is set with flag `live` the update on firebase will trigger the update inside the object
it will update the value and trigger the event `new_content`
better:
two flags

	watch_remote: BOOL
	watch_local: BOOL

if true the object will be synchronyzing with FB
if the synchrozisation fails for varoius reasons the coresponding event is fired like `lost_connection`

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

##### user is expected to do the following operations

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

