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

user is expected to do the following operations

set objects' property

	user.name = name;

set deep nested onjects' property

	user.info.gender = "male" sets gender

write deep nested obbjects' property into DB

	user.info.gender.write(); // write into location

rule: the parent location must be already in DB otherwise is thrown error - can't write to non existent location

write whole nested object in DB at once (overwite all inner properies)

	user.info.write() - writes the whole info object in DB (user must be already written)

write the whole object into DB which overwrites all the inner properties or objects

	user.write() writes the whole user into DB with default fields if not initialized.

TODO
the object and nested objects should have flag saying auto update, so all changes on DB can be immediatelly propagated into object
with this we need to wait with save until the read/update is finished.
it either should throw and error, wrning or just updates the just read property. TODO - decide
...

TODO
