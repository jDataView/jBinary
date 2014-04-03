module.exports = {
	options: {
		reporter: process.env.CI ? 'dot' : 'progress',
		ui: 'tdd'
	},
	node: 'test/test.js'
};