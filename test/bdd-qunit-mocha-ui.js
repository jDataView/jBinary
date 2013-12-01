var Mocha = module.parent.require('mocha');
module.parent.require('qunit-mocha-ui');

module.exports = Mocha.interfaces['bdd-qunit-mocha-ui'] = function (suite) {
	['bdd', 'qunit-mocha-ui'].forEach(function (name) {
		Mocha.interfaces[name](suite);
	});
};