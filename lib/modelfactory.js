/**
 * Model Factory contructor
 * model Factory takes an Fm.Class as an argument so it can instantiate the 
 * model with all decoration specific to that object
 * Fm.Model provides the behaviour and blueprint proovides the DB structure.
 *
 * @constructor
 * @access public
 *
 * @param {Firebase} instance of Firebase reference
 * @param {Object} blueprint represents the data structure
 * @param {class Fm.Model} either simple Fm Model
 */
Fm.ModelFactory = function(ref, blueprint, Model){
	this.ref = ref;
	this.blueprint = blueprint;
	this.Model = Model || Fm.Model;
	if (Model && !(Model.prototype instanceof Fm.Basic)) throw new Error("Model if provided nmust inherit from Fm.Model");
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
Fm.ModelFactory.prototype.decorateCreate = function(name, fn){
	var oldCreate = this.create;
    this.create = function(){
        var model = oldCreate.apply(this, arguments);
        model[name] = fn;
        return model;
    };
};

/**
 * @returns {Firebase} the factory's reference to DB
 */
Fm.ModelFactory.prototype.getRef = function() {
	return this.ref;
};


Fm.ModelFactory.prototype.decorateModelsMethod = function(name, fn){
};

/**
 * removes all previous decorators on create method
 */
Fm.ModelFactory.prototype.unDecorateCreate = function(){
	this.create = Fm.ModelFactory.prototype.create;
};

/**
 * decorates given action with given decorator
 * @decorator
 * @access public
 *
 * @param {string} method descriptor
 * @param {Function} Decoreator function @returns decorated action
 */
Fm.ModelFactory.prototype.decorateMethod = function(method, decorator){
};

/**
 * factory method to construct the Model
 * @constructs [Model]
 *
 * @param {Firebase} Database reference to particular location // TODO or combine this with root.child(url) 
 * @return {Model} created Model instance
Fm.ModelFactory.prototype.create = function(key){
	// need instance of Firebase...
	// TODO or we can create object on root - probably we should enforce a key
	if (!key) {
		return new this.Model(this.ref, this.blueprint);
	} else{
		console.log(key, this.blueprint, this.ref.child(key).toString());
	   	return new this.Model(this.ref.child(key), this.blueprint);
	}
};
 */

Fm.ModelFactory.prototype.create = function(key){
	// need instance of Firebase...
	// TODO or we can create object on root - probably we should enforce a key
	if (!key) {
		return new this.Model(this.ref.push(), this.blueprint);
	} else if (key instanceof Fm.Firebase) {
		return new this.Model(key, this.blueprint);
	} else{
		// console.log(key, this.blueprint, this.ref.child(key).toString());
	   	return new this.Model(this.ref.child(key), this.blueprint);
	}
};
