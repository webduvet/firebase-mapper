sampleR =	["object",
	{
		sub1A: "value1",
		"^id": "value2",
		sub1C: ["object",
		{
			sub2A: "value",
			sub2B: ["list", // but this is another object, where key is reference to that object 
			["object", {
				sub1A: "value",
				sub1B: "value",
				sub1C:["object",
				{
					sub2A: "value"
				}]
			}]]
		}],
		sub1D: "value"
	}];

/*
 * mapper takes the obejct blueprint and sets the complex Model object with CRUD methods, on a given reference
 * for now it is for firebase however it can be used for mongo DB as well
 *
 * TODO think about how to take care of denormalized data
 * like push the reference into other array of objects etc.
 */


var Mapper = function Mapper(bp_){

	var obj = {};

	switch( bp_[0] ){
		case "object":
			for( var key in bp_[1] ){
				switch( key ){
					case "^id":
						//inject this later
						//don't do anything for now
						break;
					default:
						obj[key];
				}
			}
			obj = bp_[1];
			break;
		case "list":
			break;
	}

	return obj;

}

var myDBObj = new Mapper(my_bp);

// expect:
// myDBObject.sub1A = value // writes to mapper
// myDBObject.sub1A.write() // writes from mapper to DB
// var val = myDBObject.subaA //gets value from mapper
// myObject.sub1A.read() // reads value from DB // can fire and event myObject.sub1A.on('ready') ...on('error')
// that would be pretty neat...
//
// each object contains nonenumerable props [read, write, on, once]
//
//
// example : simple user object
// BpFactory = new Mapper(reference)
//
// bprint = {'user', '^auto', ['object', {name:'text', surname:'text', info:['object', {gender: TXT, active: BOOL}]}
// ]}
//
// var user = BpFactore.create('app.user', bprint);
//
// user is expected to do
// user.name = name; // sets name\
// user.info.gender = "male" sets gender
//
// user.info.gender.write(); // write into location
// rule: the parent location must be already in DB otherwise is thrown error - can't write to non existent location
//
// user.info.write - writes the whole info object in DB (user must be already written)
// user.write() writes the whole user into DB with default fields if not initialized.
//
// TODO better pretocol for blue print allowing defaults etc.
//
//
// example timeline list
// key is reference to main object
// object is just some extract like some counters reflecting state of main object.
// blue print is
//
// var muBp = new Mapper(reference, ['list', ['object', { counter: 0, status: "new"}]]);
//
//
//
//

var FBObject = function(){
}


