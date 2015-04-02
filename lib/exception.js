var Exception = module.exports = function(msg){
	this.message = msg;
};
Exception.prototype = Object.create(Error.prototype);
Exception.prototype.constructor = Exception;
