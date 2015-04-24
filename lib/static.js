
Fm.inherit = function(Child, Parent){
	Child.prototype = Object.create(Parent.prototype);
	Child.prototype.constructor = Child;
};
