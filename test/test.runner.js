var Mocha = require('mocha');
require('qunit-mocha-ui');

Mocha.interfaces["bdd+qunit-mocha-ui"] = function (suite) {
	['bdd', 'qunit-mocha-ui'].forEach(function (name) {
		Mocha.interfaces[name](suite);
	});
};

var mocha = new Mocha({ui: 'bdd+qunit-mocha-ui', reporter: 'spec'});
mocha.addFile('test.js');
mocha.run(function(failures){
	process.exit(failures);
});