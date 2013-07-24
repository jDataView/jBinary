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

process.on('uncaughtException', function (error) {
	console.error(error);
	throw error;
});

testrunner.run({
	code: '../src/jBinary.js',
	tests: './test.js'
}, function (error, stats) {
	if (error || stats.failed) {
		throw error || new Error(stats.failed + ' test(s) failed.');
	}
});
