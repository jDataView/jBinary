module.exports = function (config) {
	var CI = process.env.CI;

	config.set({
		basePath: '..',
		frameworks: ['mocha', 'chai'],
		browsers: CI ? ['PhantomJS', 'Firefox'] : ['Chrome', 'Firefox', 'IE'],
		files: [
			'http://jdataview.github.io/dist/jdataview.js',
			'dist/browser/jbinary.js',
			'test/karma.mocha.conf.js',
			'test/test.js',
			{pattern: 'test/123.tar', included: false, served: true}
		],
		logLevel: CI ? config.LOG_ERROR : config.LOG_INFO,
		reporters: [CI ? 'dots' : 'progress']
	});
};