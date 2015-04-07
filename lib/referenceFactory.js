/**
 * Reference Factory constructor
 * @constructor
 * @access public
 *
 * @param {Firebase} instance of Firebase reference
 */
Fm.ReferenceFactory = function(modelFactory, blueprint, type){
	this.ref = modelFactory.getRef();
	this.blueprint = blueprint;
};

/**
 * decorates each instance of the Model class created by this factory in the future
 * does not change existing instnces created by this factory
 * @decorator
 * @access public
 *
 * @param {string} new action name
 * @param {Function} action handler
 */
Fm.ReferenceFactory.prototype.decorateCreate = function(name, fn){
	var oldCreate = this.create;
    this.create = function(){
        var model = oldCreate.apply(this, arguments);
        model[name] = fn;
        return model;
    };
};

Fm.ReferenceFactory.prototype.decorateModelsMethod = function(name, fn){
};

/**
 * removes all previous decorators on create method
 */
Fm.ReferenceFactory.prototype.unDecorateCreate = function(){
	this.create = Fm.ReferenceFactory.prototype.create;
};

/**
 * decorates given action with given decorator
 * @decorator
 * @access public
 *
 * @param {string} method descriptor
 * @param {Function} Decoreator function @returns decorated action
 */
Fm.ReferenceFactory.prototype.decorateMethod = function(method, decorator){
};

/**
 * factory method to construct the Model
 * @constructs [Model]
 *
 * @param {Firebase} Database reference to particular location // TODO or combine this with root.child(url) 
 * @return {Model} created Model instance
 */
Fm.ReferenceFactory.prototype.create = function(key){
	// need instance of Firebase...
	// TODO or we can create object on root - probably we should enforce a key
	if (!key) {
		return new Fm.Reference(this.ref, this.blueprint);
	} else{
	   	return new Fm.Reference(ref.child(key), this.blueprint);
	}
};
