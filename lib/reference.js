
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
	// TODO this is not right Basic does not have those arguments
	Fm.Basic.call(this, modelFactory.getRef(), blueprint);
	Object.defineProperties(this,{
		"modelFactory": {
			enumerable: false,
			writable: true,
			configurable: false,
			value: modelFactory
		},
		"id":{
			enumerable: false,
			writable: true,
			configurable: false,
			value: id
		},
		"referred":{
			enumerable: false,
			writable: true,
			configurable: false,
			value: null
		},
		"blueprint":{
			enumerable: false,
			writable: true,
			configurable: false,
			value: blueprint
		},
		"refLoaded":{
			enumerable: false,
			writable: true,
			configurable: false,
			value: false
		}
	});
};

Fm.Reference.prototype = Object.create(Fm.Basic.prototype);
Fm.Reference.prototype.constructor = Fm.Reference;


/**
 * returns the new model instance and asynchronously loads the content from DB
 * the model emits "loaded" event when it is fully loaded from DB
 * or "missing" if not data is refered by reference
 *
 * @returns {Fm.Model}
 */
Object.defineProperty(Fm.Reference.prototype, 'getRefered', {
	enumerable: false,
	configurable: false,
	writable: false,
	value: function(){
		// TODO do it as promise as consumer have no idea if it is loaded or not
		if (this.referred) return this.refered;
		this.refLoaded = false;
		var m =  this.modelFactory.create(this.id);
		this.referred = m;
		m.load();
		m.on('loaded', function(){this.refLoaded = true; }.bind(this) );
		// TODO should we destroy reference if fails to load refered model?
		return m;
	}
});

/**
 * construct the Reference factory
 *
 * @inherits from ModelFactory
 *
 * @param {Firebase} reference to the localtion
 * @param {Object} blueprint for the reference 'bool' if only simple reference
 * @param {@contructor Fm.Reference} constructor of Reference
 */
Fm.ReferenceFactory = function(ref, blueprint, ReferenceModel) {
	Fm.ModelFactory.apply(this, arguments);
	if (blueprint === 'bool'){
	}
};

Fm.ReferenceFactory.prototype = Object.create(Fm.ModelFactory.prototype);
Fm.ReferenceFactory.prototype.contructor = Fm.ReferenceFactory;

