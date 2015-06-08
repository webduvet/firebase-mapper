
/**
 * figure out whether this is a server side or client side and populate the global
 * TODO there must be a better way than this
 */
(function () {

	// Establish the root object, `window` in the browser, or `global` on the server.
	var root = this; 

	// Create a refeence to this
	var Fm = function(config){
	};
	root.Fm = Fm;

	// Export the Underscore object for **CommonJS**, with backwards-compatibility
	// for the old `require()` API. If we're not in CommonJS, add `_` to the
	// global object.
	if (typeof module !== 'undefined' && module.exports) {
		Fm.Firebase = require ('firebase');
		Fm.Db = require ('firebase');
		module.exports = Fm;
	} else {
		if (!Firebase) throw new Error('Firebase not found');
		Fm.Firebase = Firebase || false;
		Fm.Db = Firebase;
	}
})();

