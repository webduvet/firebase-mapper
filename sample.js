var Firebase = require('firebase');
var Zz = require('./lib/mapper.js');
var ref = new Firebase('https://sagavera.firebaseio.com');


var x = new Zz.Value(ref.child('test'), 'test/me', null);

x.aprop("hey");

console.log(x);
