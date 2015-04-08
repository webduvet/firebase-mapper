var Firebase = require('firebase');

var ref = new Firebase('https://sagavera.firebaseio.com');
var rand = Math.random;
var TDIFF;

var obj = {
	test:
	{
		first:
		{
			second:
			{
				third:
				{
					fourth:
					{
						fifth:
						{
							prop1: "prop1",
							prop2: "prop2",
							prop3: "prop3"
						}
					}
				}
			}
		}
	}
};

ref.child('test').set(obj.test);

console.time('timestamp');
ref.child('test/ts').set(Firebase.ServerValue.TIMESTAMP, function(err){
	ref.child('test/ts').once('value', function(ss){
		TDIFF = Date.now() - ss.val();
		console.timeEnd('timestamp');
		console.log('timedifference',TDIFF);
		// fine to know when exactly is firebase ready :)
		// also getting exact server time is benefitial as well
		_start();
	});
});

function _start(){
/*
ref.child('test')
.on('child_added', function(ss){
	console.log("listener on root : ", ss.exportVal());
});

*/
ref.child('test/first/second/third/fourth/fifth')
.on('value', function(ss){
	//console.timeEnd('sv');
	console.log("listener for fifth: ", ss.exportVal());
});

/*
// change something deep nested
setTimeout(function(){
	console.log(" new obj writing to 5. level...");
	ref.child('test').child('first/second/third/fourth/fifth')
	.set({prop1: rand(), prop2:rand()}, function(err){
	});
}, 4000);

// ad something deep nested
setTimeout(function(){
	console.log("new prop writing at 5. level... ");
	ref.child('test').child('first/second/third/fourth/fifth/prop3')
	.set(rand(), function(err){
	});
}, 5000);

// add something at the same level
setTimeout(function(){
	console.log("new prop writing at 3. level... ");
	ref.child('test').child('first/second/third/prop3')
	.set(rand(), function(err){
	});
}, 6000);
*/

setTimeout(function(){
	console.log("priority ...");
	console.time('sv');
	console.log('setting this as priority', TDIFF + Date.now());
	ref.child('test').child('first/second/third/fourth/fifth/prop2')
	.setPriority(TDIFF + Date.now());
}, 3000);
setTimeout(function(){
	console.log("priority ...");
	ref.child('test').child('first/second/third/fourth/fifth/prop3')
	.setPriority(TDIFF + Date.now());
}, 3100);
setTimeout(function(){
	console.log("priority ...");
	ref.child('test').child('first/second/third/fourth/fifth/prop1')
	.setPriority(TDIFF + Date.now());
}, 3200);
/*
*/

/*
setTimeout(function(){
	console.log("priority ...");
	console.time('sv');
	ref.child('test/ts').set(Firebase.ServerValue.TIMESTAMP, function(err){
		ref.child('test/ts').once('value', function(ss){
			ref.child('test').child('first/second/third/fourth/fifth/prop2')
			.setPriority(ss.val());
		});
	});
}, 2000);
setTimeout(function(){
	console.log("priority ...");
	ref.child('test/ts').set(Firebase.ServerValue.TIMESTAMP, function(err){
		ref.child('test/ts').once('value', function(ss){
			ref.child('test').child('first/second/third/fourth/fifth/prop3')
			.setPriority(ss.val());
		});
	});
}, 3000);
setTimeout(function(){
	console.log("priority ...");
	ref.child('test/ts').set(Firebase.ServerValue.TIMESTAMP, function(err){
		ref.child('test/ts').once('value', function(ss){
			ref.child('test').child('first/second/third/fourth/fifth/prop1')
			.setPriority(ss.val());
		});
	});
}, 4000);
*/
/*
setTimeout(function(){
	ref.child('test').child('first/second/third/fourth')
	.set({s1: "prve", s2:"druhe"}, function(err){
		console.log("... written");
	});
}, 6000);
*/


/*
conclusion:

child added
to get triggered something needs to be added at the same level as the listener is set
so when child is added at the deeper level this will not get triggered
note: child_added is triggered as many times for the first time as there is a items in that level
needs to be limited to last.

value:
is triggered whenever anything is changed within the location, even in deep nested level
snapshot always returns the whole location even of only one thing is changed deep nested inside

child_changed regarding priority 
listening on the same level returns the child which changed priority regardess the ordering effect
ding the same with child_moved - triggers event only if reordered
child_changed returns as well the whole object from listened location if the priority of some nested child changes


however - when using Firebase ServerValue.TIMESTAMP as priority
the process is as follows
prioroty is replaced with placeholder, and the callback is immediatelly fired locally (where is the priority from I have no idea) as the write op is very fast (about 4ms)
right after the Server replace the placeholder with timestamp (350ms) the event is triggered again showing the correct timestamp


*/

}
