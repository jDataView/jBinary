module.exports = {
	options: {
		reporter: process.env.CI ? 'dot' : 'spec',
		ui: 'tdd',
		require: [
			function () {
				global.DEBUG = true;
				global.NODE = true;
				global.BROWSER = false;
				Error.stackTraceLimit = 20;
			},
			'6to5/runtime',
			'stack-displayname'
		]
	},
	node: 'test/test.es5.js'
};
