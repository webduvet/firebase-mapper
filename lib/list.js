/**
 * creates instance of Fm.List  model
 * @constructor
 *
 * @param {Object} config object wrapping the following
 * @param {Firebase} reference Firebase DB root or parent object
 * @param {string} Path to the FB object which List represents
 * @param {Object} blueprint to create FmModel Factory
 *
 * TODO is this DB rather abstract implementation
 * or should it be considered as a conrete part of a list
 * in that case it should be paginator there.
 *
 * another point is - saving a list of references - it can be part of a object
 * e.g. game user and the finit list of qualities or powers
 *
 * endless list whould never be part of a object. that should be a rule.
 * endless lists should sit in sepratate child in root
 * endless list can be part of the object however the property will net be enumerable and save action
 * will have no impact on the list. it is merely a Db representation which happen to be in the Model.
 */
Fm.List = function(ref, config) {

	if (!ref && ref.toString().match(/^https/)) throw new Error('no or invalid reference provided');
	if (!config || !config.factory) throw new Error("no valid config object found");


	// TODO create Fm.Model plain instance on push
	// as well the parent - child relarionship must be created via ref
	var _events = {
		"child_added": [],
		"child_removed":[],
		"priority_changed":[]
	};
	// TODO if we have factory we don't need a ref as the factory contains the ref.

	Object.defineProperties(this, {
		'__ref':{
			enumerable: false,
			writable: true,
			configurable: false,
			value: ref
		},
		'__events': {
			enumerable: false,
			writable: true,
			configurable: false,
			value: _events
		}
	});

	//instantiate factory
	if (config.factory instanceof Fm.ModelFactory) {
		this.factory = config.factory;
	} else {
		if ( !(config.factory.fclass.prototype instanceof Fm.ModelFactory) ) throw new Error ('factory class must be type of Fm.ModelFactory');
		this.factory = new config.factory.fclass(ref, config.factory.blueprint, config.factory.mclass);
		this.blueprint = config.factory.blueprint;
	}

	// set priority listener by default
	ref.on('child_moved', function(){
		this._trigger('child_moved');
	});

	/**
	 * non enumerable property page
	 * this can contain paginator and be the view interface...
	 */
	Object.defineProperty(this, "_page", {
		enumerable: false,
		configurable: true,
		writable: true,
		value:{}
	});

	Object.defineProperty(this, "_long",{
		enumerable: false,
		configurable: false,
		writable: true,
		value:{}
	});
};

/**
 * creates new record in list using provided model factory
 * 
 * @param {Boolean} [true] write to DB defaults to false. Object is instantiated, but not written to DB.
 *
 * @returns {Fm.Model} model representaiton of DB record
 */
Fm.List.prototype.push = function(write, assoc){
	var wf = arguments[0] || false,
		record = this.__ref.push(), 
		obj = this.factory.create(record);

	if(wf) obj.save();

	return obj;
};


// TODO merge this method with push
// push and add are only DB methods !!!!
Fm.List.prototype.add = function(id, writeflag) {

	var wf = writeflag || false,
		obj = this.factory.create(id);

	if(wf) obj.save();

	return obj;
};


/**
 * get the object from DB location and instantiate the model representation
 *
 * @emits ["loaded", "error"] 
 *
 * @params {string} key descriptor
 *
 * @returns {Fm.Model} Model representation of DB location created from Bluepront stored in modelFactory
 * TODO
 * provide for lists
 * in list case we should get another lista nd that one most likely will contain objects;
 *
 * TODO
 * this use case is making primary list
 * how do we do list of references?
 * plain references - should load directly associated object
 * rich references should be treated as objects as they cary some value, but shoud perhaps have
 * a hidden field __parent or __reference
 */
Fm.List.prototype.get = function(key){
	// get the location from database
	
	// create new model from blueprint TODO look if string key is subnstituted with firebase
	var m = this.factory.create( this.__ref.child(key) );

	// emit event "ready" or "loaded"
	
	m.load();

	return m;
};

Fm.List.prototype._trigger = function(event){
	// if no handler is subsrcibed to event just return
	if(!(event in this.__events)) return;
	this.__events[event].forEach(function(handler){ handler(); });
};

/**
 * changes / sets priority on record described by key
 *
 * @param {string} key descriptior
 * @param {string || number || ServerValue} 
 */
Fm.List.prototype.setPriority = function(key, priority) {
	this.__ref.child(key).setPriority(priority);
};


Fm.List.prototype.getRef = function() {
	return this.__ref;
};


/**
 * loads full page
 * TODO
 */
Fm.List.prototype.loadPage = function(){
};
