
var testrunner = require('qunit');
testrunner.options.errorsOnly = true;
testrunner.options.assertions = false;
testrunner.options.summary = false;
testrunner.options.coverage = false;
testrunner.run({
	code: '../src/jparser.js',
	tests: './test.js'
});
