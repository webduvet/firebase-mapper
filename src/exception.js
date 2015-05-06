Fm.Exception = function(msg){
	this.message = msg;
};
Fm.Exception.prototype = Object.create(Error.prototype);
Fm.Exception.prototype.constructor = Fm.Exception;
