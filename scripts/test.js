var reporter = require('nodeunit').reporters.default;
var exit = require('exit');

reporter.run(['test/basic.js'], null, function(){
	console.log('... all done, now cut the bullshit and exit');
	exit(0);
});



