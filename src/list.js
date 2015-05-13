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
 * sample config: {
 * 		modelType: ['MODEL', 'REF'],
 * 		autoid: [true, false],
 * 		blueprint: {//blueprint }
 * }
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

	// test if ref is valid instance of Firebase TODO go around the fact we do not know Firebase here
	if (!ref && ref.toString().match(/^https/)) throw new Error('no or invalid reference provided');

	// TODO mclass, fclass - get rid of this
	// we can  only have either model or reference here. it should be pointed out in config object
	// all extended objects with application logic should wrap this and use own factories and services
	if (!config) throw new Error("no valid config object found");


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
		},
		'factory': {
			enumerable: false,
			writable: true,
			configurable: false,
			value: _events
		},
		'blueprint': {
			enumerable: false,
			writable: true,
			configurable: false,
			value: _events
		}
	});


	if (config.modelType === 'ref' || config.modelType === 'reference') {
		// setup the factory for all references for this list
		console.log('calling reference factory');
		this.factory = new Fm.ReferenceFactory(ref, config.blueprint);
	} else if (!config.modelType || config.modelType === 'model') {
		// setup the factory for all objects for this list
		this.factory = new Fm.ModelFactory(ref, config.blueprint);
	} else {
		throw new Error("Unsupported modelType", config.modelType);
	}


	// TODO resolve this - ref is clearly a singleton as the Fm should be as it is regarding one database
	// we have Fm as static - this is not good...
	// set priority listener by default
	ref.on('child_moved', function(){
		this._trigger('child_moved');
	});


	// if no autoID then we need to use push under TODO it's ko to do it in prototype
	/*
	if ( !config.autoid ) {
		Object.defineProperty(this, 'push', {
			enumerable: false,
			writable: false,
			configurable: false,
			value: function(key, writeFlag) {
				if (!key) throw new Error('List is set to autoID: false, expects parameter in push');
				return this.add.call(this, key, writeFlag);
			}
		});
	}
	*/

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
 *
 * TODO based on blueprint - we need to ammend push
 * e.g. the user bid stored under userID need to be pushed with userid. 
 *
 * we need to extend the list
 *
 * creates new record in list using provided model factory
 * 
 * @param {Boolean} [true] write to DB defaults to false. Object is instantiated, but not written to DB.
 *
 * @returns {Fm.Model} model representaiton of DB record
 */
Fm.List.prototype.push = function(write){
	var wf = write || false,
		obj = this.factory.create();

	if(wf) obj.save();

	return obj;
};

/**
 * creates the record in specific location within the list
 * e.g. notification objects need to be saved in notification child under auto ID, however they need to be associated
 * with notified subject so they need to be pushed under notification under subject ID. notification/subjectID/notificationAutoId
 *
 * @param {string} is key of the subject
 * @param {[Boolean]} indicates wether to save it to remote right away
 *
 * @returns {Model} instance of new Model or Reference
 */
Fm.List.prototype.pushUnder = function(key, write){
	var wf = write || false,
		record = this.__ref.child(key).push(), 
		obj = this.factory.create(record);

	if(wf) obj.save();

	return obj;
};


// TODO merge this method with push
// so far the solution is decorate .prototype.push on each instance
// add of simple reference should not trigger any factory. it should just add it to DB
// perhaps it should cache it locally and than upon save it should propagate into DB.
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
