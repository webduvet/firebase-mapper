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
 *
 * generally object can be fill with default values at the blue print evaluation state
 * list is a container for number of objects of some other type
 * that can be as simple as key:true
 * but it could contain more elaborate objects by some unique identifier
 * so when it runs into list
 * we are expected to create another Class of that type
 */
sampleR = ["object",
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
