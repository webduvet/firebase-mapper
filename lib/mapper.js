
/*
 * sample
 *
 */

sampleObj = {
	sub1A: "value",
	sub1B: 12,
	sub1C: {
		sub2A: "value",
		sub2B: {
			sub3A: "list item 1",
			sub3B: "list item 2"
		}
	}
};

/*
 * object:
 *  contains varius different keys all set as constants
 *  object should not contain nested lists, but can
 * list:
 *  contains uniform keys (pushID, unique ID, increment, etc)
 *  key can contain other object with nested objects
 *  key should not contain other nested lists, but can
 *
 * TODO how to we make for dynamic keys? doesn't need to be a list to have dynamic key
 * it could be a part of an object let's say { ID:{name: TXT, number: NUM}...}
 *
 * "^id can refer to dynamic ID
 * dynamic ID is either provided upfront or it is injected in the level after...
 * so technically it can't be in blue print object
 */
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
 */
var Mapper = function Mapper(bp_){

	var Obj = {};

	switch( bp_[0] ){
		case "object":

			break;
		case "list":
			break;
	}
		

	for ( var key in bp_ ){
		if( bp_.hasOwnProperty(key)){
			self[key] = bp_[key]
	}

}
