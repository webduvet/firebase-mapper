

(function () {

	// Establish the root object, `window` in the browser, or `global` on the server.
	var root = this; 

	// Create a refeence to this
	var Fm = {};

	var isNode = false;

	// Export the Underscore object for **CommonJS**, with backwards-compatibility
	// for the old `require()` API. If we're not in CommonJS, add `_` to the
	// global object.
	if (typeof module !== 'undefined' && module.exports) {
		Fm.Firebase = require ('firebase');
		module.exports = Fm;
		root.Fm = Fm;
		isNode = true;
	} else {
		if (!Firebase) throw new Error('Firebase not found');
		Fm.Firebase = Firebase || false;
		root.Fm = Fm;
	}
})();

/**
 * defining Zz model space
var Fm = {};

 */


/**
 * class method for easy inheritance implementation
 * @static
 * @returns {class Fm.Model} new class inherited from Fm.Model
Fm.inherit = function(Parent, Child){


	var C = function(){
		Parent.apply(this, arguments);
	};



	Child.prototype = Object.create(self.prototype);
	Child.prototype.constructor = Child;
	for(var prop in self ){
		Child[prop] = self[prop];
	}
	return Child;
};

module.exports = function(Firebase){
	Fm.Firebase = Firebase;
	return Fm;
};
 */
