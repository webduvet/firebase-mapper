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


Fm.ShortList.prototype.add = function(){
	var item = Fm.List.prototype.apply(this, arguments);

};

Fm.ShortList.prototype.save = function(){
};

Fm.ShortList.prototype.load = function(){
};
