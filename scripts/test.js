var reporter = require('../node_modules/nodeunit').reporters.default;
var exit = require('../node_modules/exit');

reporter.run(['test/basic.js', 'test/objects.js'], null, function(){
	console.log('... all done, now cut the bullshit and exit');
	exit(0);
});

