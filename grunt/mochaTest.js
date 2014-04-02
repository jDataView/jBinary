module.exports = {
	options: {
		reporter: process.env.CI ? 'dot' : 'progress'
	},
	node: 'test/test.js'
};