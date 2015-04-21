/**
 * defining Zz model space
 */
var Fm = {};



/**
 * class method for easy inheritance implementation
 * @static
 * @returns {class Fm.Model} new class inherited from Fm.Model
 */
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
