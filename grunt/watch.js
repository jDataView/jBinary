module.exports = {
	options: {
		atBegin: true,
		interrupt: true
	},
	all: {
		files: [
			'Gruntfile.js',
			'src/**/*.js',
			'test/test.js'
		],
		tasks: ['build', 'karma:watch:run', 'mochaTest:node']
	}
};