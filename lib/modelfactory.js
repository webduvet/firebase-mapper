/**
 * Model Factory contructor
 * @constructor
 * @access public
 *
 * @param {Firebase} instance of Firebase reference
 */
Zz.ModelFactory = function(ref, blueprint){
	this.ref = ref;
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
Zz.ModelFactory.prototype.decorateCreate = function(name, fn){
	var oldCreate = this.create;
    this.create = function(){
        var model = oldCreate.apply(this, arguments);
        model[name] = fn;
        return model;
    };
};

Zz.ModelFactory.prototype.decorateModelsMethod = function(name, fn){
};

/**
 * removes all previous decorators on create method
 */
Zz.ModelFactory.prototype.unDecorateCreate = function(){
	this.create = Zz.ModelFactory.prototype.create;
};

/**
 * decorates given action with given decorator
 * @decorator
 * @access public
 *
 * @param {string} method descriptor
 * @param {Function} Decoreator function @returns decorated action
 */
Zz.ModelFactory.prototype.decorateAction = function(method, decorator){
};

/**
 * factory method to construct the Model
 * @constructs [Model]
 *
 * @param {Firebase} Database reference to particular location // TODO or combine this with root.child(url) 
 * @return {Model} created Model instance
 */
Zz.ModelFactory.prototype.create = function(ref){
	// need instance of Firebase...
	if (typeof ref.key !== 'function') throw "Ref needs to be Firebase reference";
	return new Zz.Model(ref, this.blueprint);
};
