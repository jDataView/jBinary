var Mocha = require('mocha');
require('qunit-mocha-ui');

var mocha = new Mocha({ui: 'qunit-mocha-ui'});
mocha.addFile('test.js');
mocha.run(function(failures){
  process.exit(failures);
});