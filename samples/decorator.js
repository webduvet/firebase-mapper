
/*
 * model is the same, but the factory can add methods to model based on factory type
 *
 * this can be used for DB mapper where interaction on DB level is always the same
 * but on app level model can have different flavors like userModel, commentModel etc...
 *
 */

/**
 * constructs model
 * @contructor
 */
var Model = function(data1, data2){
	this.a = data1;
	this.b = data2;
}

/**
 * creates model factory
 * @contructor
 */
var ModelFactory = function(M){
	this.Model = M;
}
/**
 * creates model instance
 * 
 * @param data
 */
ModelFactory.prototype.create = function(data1, data2){
	return new Model(data1, data2);
}

/**
 * adds methods to new created instance
 */
ModelFactory.prototype.addAction = function(fnName, fn){
	var oldCreate = this.create;
	this.create = function(){
		var model = oldCreate.apply(this, arguments);
		model[fnName] = fn;
		return model;
	};
}


var factory = new ModelFactory(Model);
var factoryOther = new ModelFactory(Model);

factory.addAction('show', function(delimiter){return this.a + delimiter + this.b;});
factoryOther.addAction('show', function(field){return field + ': ' + this.a + this.b;});
factoryOther.addAction('format', function(){return ': '+this.a+ ', : ' +this.b;});


var m = factory.create("A", "B");
var m2 = factoryOther.create("A", "B");

console.log(m.show(' / '));
console.log(m.format());
console.log(m2.show('result'));

