module.exports = function (config) {
	var CI = process.env.CI;

	config.set({
		basePath: '..',
		frameworks: ['mocha', 'chai'],
		browsers: CI ? ['PhantomJS'] : ['Chrome', 'Firefox', 'IE'],
		files: [
			'dist/browser/jbinary.js',
			'test/test.js',
			{pattern: 'test/123.tar', included: false, served: true}
		],
		logLevel: CI ? config.LOG_ERROR : config.LOG_INFO,
		reporters: [CI ? 'dots' : 'progress']
	});
}
