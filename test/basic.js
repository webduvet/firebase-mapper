process.on('uncaugthException', function(err){
	console.error(err.stack);
});

var Fm = require('../build/firebase-mapper.js');

module.exports = {
	'test basic': {
		'setUp': function(done) {
			done();
		},
		'all in place': function(test) {
			test.expect(5);
			test.equals(typeof Fm, 'object', 'expect object got: ', typeof Fm);
			test.equals(typeof Fm.Model, 'function', 'expect typeof function and got', typeof Fm.Model);
			test.equals(typeof Fm.ModelFactory, 'function', 'expect typeof function and got', typeof Fm.ModelFactory);
			test.equals(typeof Fm.List, 'function', 'expect typeof function and got', typeof Fm.List);
			test.equals(typeof Fm.ListFactory, 'function', 'expect typeof function and got', typeof Fm.ListFactory);
			test.done();
		},
		'test exceptions': function(test) {
			test.expect(3);
			test.throws( function(){ new Fm.List();});
			test.throws( function(){ new Fm.Model();});
			test.throws( function(){ new Fm.Model({},{});});
			test.done();
		}
	}
};
