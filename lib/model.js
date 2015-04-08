
/**
 * Creates a new model
 * @contructor
 *
 * @param {Firebase} Firebase reference instance
 * @param {string} path to the Object which model stands for
 * @param {Object} Object literal to describe the structure of the model
 */
Fm.Model = function(ref, blueprint){
	Fm.Basic.apply(this, arguments);
};

Fm.Model.prototype = Object.create(Fm.Basic.prototype);
Fm.Model.prototype.constructor = Fm.Model;
