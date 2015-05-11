var reporter = require('../node_modules/nodeunit').reporters.default;
var exit = require('../node_modules/exit');

reporter.run(['test/basic.js', 'test/objects.js'], null, function(){
	console.log('... all finished, we can kill open connections');
	exit(0);
});

