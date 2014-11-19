module.exports = function (config) {
	var CI = process.env.CI;

	config.set({
		basePath: '..',
		frameworks: ['mocha', 'requirejs'],
		browsers: CI ? ['PhantomJS', 'Firefox'] : ['Chrome', 'Firefox', 'IE'],
		files: [
			'test/init.js',
			{pattern: 'node_modules/chai/chai.js', included: false},
			{pattern: '+(src|dist|test)/**/*', included: false}
		],
		logLevel: CI ? config.LOG_ERROR : config.LOG_INFO,
		reporters: [CI ? 'dots' : 'progress']
	});
};
