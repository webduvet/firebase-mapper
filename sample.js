var Firebase = require('firebase');
var Zz = require('./lib/mapper.js');
var ref = new Firebase('https://sagavera.firebaseio.com');
var blueprint = {
  prop1: null,
  prop2: null,
  prop3: "default"
};


var x = new Zz.Model(ref.child('test'), 'test/me', blueprint);


console.log(x);
