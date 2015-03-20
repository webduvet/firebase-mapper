sampleR =	["object",
	{
		sub1A: "value1",
		"^id": "value2",
		sub1C: ["object",
		{
			sub2A: "value",
			sub2B: ["list",
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
// each object contains nonenumerable props [read, write, on]
//

var FBObject = function(){
}


