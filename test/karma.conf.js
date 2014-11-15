module.exports = function (config) {
	var CI = process.env.CI;

	config.set({
		basePath: '..',
		frameworks: ['mocha', 'chai'],
		browsers: CI ? ['PhantomJS', 'Firefox'] : ['Chrome', 'Firefox', 'IE'],
		files: [
			'http://cdnjs.cloudflare.com/ajax/libs/require.js/2.1.15/require.min.js',
			'http://es6-promises.s3.amazonaws.com/es6-promise-2.0.0.js',
			'test/init.js',
			'test/test.js',
			{pattern: 'test/123.tar', included: false, served: true}
		],
		logLevel: CI ? config.LOG_ERROR : config.LOG_INFO,
		reporters: [CI ? 'dots' : 'progress']
	});
};
