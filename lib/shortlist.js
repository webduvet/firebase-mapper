/**
 * Shortlist resides in memory
 * it has small and finite number of items
 * is exposed to save method - saves te=he whole object including the items in the list
 */
Fm.ShortList = function(){
	Fm.List.apply(this, arguments);

	Object.defineProperty(this, "_list",{
		enumerable: false,
		configurable: false,
		writable: true,
		value : []
	});
};

Fm.ShortList.prototype = Object.create(Fm.List.prototype);
Fm.ShortList.prototype.constructor = Fm.ShorList;


Fm.ShortList.prototype.addLocally = function(key, obj){
	this[key] = obj;
};

Fm.ShortList.prototype.removeLocally = function(key){
	this[key] = null;
};

Fm.ShortList.prototype.save = function(){
	this._ref.set(this, function(err){
		if (err) {
		}
	});
};

Fm.ShortList.prototype.load = function(){
	this._ref
		.once('value', function(ss){
			var val = ss.val();
			if (!val) {
				// TODO emit error
				this._trigger('error', 'DB location not found');
			} else {
				for (var k in val) {
					this[key] = val[key];
				}
				this._trigger('loaded');
			}
		});
};
