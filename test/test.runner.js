var Mocha = require('mocha');
require('qunit-mocha-ui');

var mocha = new Mocha({ui: 'qunit-mocha-ui', reporter: 'spec'});
mocha.addFile('test.js');
mocha.run(function(failures){
	process.exit(failures);
});