/**
 * creates instance of Zz.List  model
 * @constructor
 *
 * @param {Firebase} reference Firebase DB root or parent object
 * @param {string} Path to the FB object which List represents
 * @param {Object} blueprint to create ZzModel Factory
 *
 * TODO is this DB rather abstract implementation
 * or should it be considered as a conrete part of a list
 * in that case it should be paginator there.
 */
var List = module.exports = function(config) {
	// TODO create Zz.Model plain instance on push
	// as well the parent - child relarionship must be created via ref
	this._events = {
		"child_added": [],
		"child_removed":[],
		"priority_changed":[]
	};
	this.ref = config.ref;
	this.factory = config.factory;

	// set priority listener by default
	this.ref.on('child_moved', function(){
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
};

/**
 * creates new record in list using provided model factory
 * 
 * @param {Boolean} [true] write to DB defaults to false. Object is instantiated, but not written to DB.
 *
 * @returns {Zz.Model} model representaiton of DB record
 */
List.prototype.push = function(){
	var write = arguments[0] || false,
		record = this.ref.push(), 
		obj = this.factory.create(record);

	// TODO
	// do we write it to db from here?
	// do we use objects' method? - cleanor solution
	// or we can return unwrittent object and user will programatically write
	// the object to DB
	// or we introduce settings
	/*
	record.set( obj , function(err){
		if(!err) this._trigger("child_added");
	}.bind(this));
	*/
	if(write) obj.write();

	return obj;
};

/**
 * get the object from DB location and instantiate the model representation
 *
 * @emits ["loaded", "error"] 
 *
 * @params {string} key descriptor
 *
 * @returns {Zz.Model} Model representation of DB location created from Bluepront stored in modelFactory
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
List.prototype.get = function(key){
	// get the location from database
	
	// create new model from blueprint TODO look if string key is subnstituted with firebase
	var m = this.factory.create( this.ref.child(key) );

	// emit event "ready" or "loaded"
	
	m.load();

	return m;
};

List.prototype._trigger = function(event){
	// if no handler is subsrcibed to event just return
	if(!(event in this._events)) return;
	this._events[event].forEach(function(handler){ handler(); });
};

/**
 * changes / sets priority on record described by key
 *
 * @param {string} key descriptior
 * @param {string || number || ServerValue} 
 */
List.prototype.setPriority = function(key, priority) {
	this.ref.child(key).setPriority(priority);
};


/**
 * loads full page
 * TODO
 */
List.prototype.loadPage = function(){
};
