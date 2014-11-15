module.exports = {
	options: {
		reporter: process.env.CI ? 'dot' : 'progress',
		ui: 'tdd',
		require: [
			'stack-displayname',
			function () { require('6to5/register')({modules: 'umd'}); }
		]
	},
	node: 'test/test.js'
};
