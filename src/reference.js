
/**
 * Creates a new reference to Model
 * reference is usually part of the list
 * has an object where it refers
 * has a place where it resides (list) could be part of the model
 *
 * !!!
 * Model contains reference in thre list only even if the list is just one item list
 *
 * TODO if blueprint is primitive value then that is the value to be pushed instead of the object.
 *
 * @contructor
 *
 * @param {Firebase} firebase with path to reference location
 * @param {Fm.ModelFactory}  model factory instance of the referenced object
 * @param {Object || string} Object literal to describe the structure of the reference, "bool" string if simple reference
 */
Fm.Reference = function(ref, blueprint, refFactory, id, modelFactory){
	// TODO this is not right Basic does not have those arguments
	Fm.Basic.call(this, ref);
	Object.defineProperties(this,{
		"refFactory": {
			enumerable: false,
			writable: true,
			configurable: false,
			value: refFactory
		},
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
		"refered":{
			enumerable: false,
			writable: true,
			configurable: false,
			value: null
		},
		"__blueprint":{
			enumerable: false,
			writable: true,
			configurable: false,
			value: blueprint
		},
		"__refLoaded":{
			enumerable: false,
			writable: true,
			configurable: false,
			value: false
		},
		"__type": {
			enumerable: false,
			writable: true,
			configurable: false,
			value: 0
		}
	});

	if (typeof blueprint === 'object') {
		this.__type = 2; // rich reference
	} else {
		// the ref just exist and just saves the blueprint into location
		this.__type = 0; // simple, primitive type
	}
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

Fm.Reference.prototype.getRefered = function(){
	// TODO do it as promise as consumer have no idea if it is loaded or not
	if (this.refered) return this.refered;
	this.refLoaded = false;
	var m =  this.refFactory.create(this.id);
	this.referred = m;
	m.load();
	m.on('loaded', function(){this.refLoaded = true; }.bind(this) );
	// TODO should we destroy reference if fails to load refered model?
	return m;
};

/**
 * saves the reference into DB
 */
Fm.Reference.prototype.save = function(str){
	if (this.__type === 0) {
		this.__ref.set(true, function(err){
			if (err) throw new Error(err);
			this.__trigger('delivered');
		}.bind(this));
	} else if (this.__type === 1) {
		this.__ref.set(str, function(err){
			if (err) throw new Error(err);
			this.__trigger('delivered');
		}.bind(this));
	} else {
		this.__ref.set(this, function(err){
			if (err) throw new Error(err);
			this.__trigger('delivered');
		}.bind(this));
	}
};

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
	if (typeof blueprint !== 'object'){
		Fm.ModelFactory.call(this, ref, blueprint, Fm.Reference);
	} else {
		Fm.ModelFactory.call(this, ref, blueprint, Fm.Reference);
	}
};

Fm.ReferenceFactory.prototype = Object.create(Fm.ModelFactory.prototype);
Fm.ReferenceFactory.prototype.contructor = Fm.ReferenceFactory;

