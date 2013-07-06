var testrunner = require('qunit');

testrunner.setup({
	log: {
		assertions: false,
		errors: true,
		tests: false,
		summary: true,
		globalSummary: false,
		testing: true
	}
});

testrunner.run({
	code: '../src/jBinary.js',
	tests: './test.js'
});
