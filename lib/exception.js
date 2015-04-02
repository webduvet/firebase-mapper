Zz.Exception = function(msg){
	this.message = msg;
};
Zz.Exception.prototype = Object.create(Error.prototype);
Zz.Exception.prototype.constructor = Zz.Exception;
