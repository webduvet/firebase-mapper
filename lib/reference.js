
/**
 * Creates a new reference to Model
 * reference is usually part of the list
 * has an object where it refers
 * has a place where it resides (list) could be part of the model
 *
 * !!!
 * Model contains reference in thre list only even if the list is just one item list
 *
 * @contructor
 *
 * @param {Fm.ModelFactory}  model factory instance
 * @param {Object || string} Object literal to describe the structure of the reference, "bool" string if simple reference
 */
Fm.Reference = function(modelFactory, id, blueprint){
	this.modelFactory = modelFactory;
	this.id = id;
};


/**
 * returns the new model instance and asynchronously loads the content from DB
 * the model emits "loaded" event when it is fully loaded from DB
 * or "missing" if not data is refered by reference
 *
 * @returns {Fm.Model}
 */
Fm.Reference.prototype.getRefered = function(){
	var m =  this.modelFactory.create(this.id);
	m.load();
	// TODO should we destroy reference if fails to load refered model?
	return m;
};
