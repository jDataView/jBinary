module.exports = function (config) {
	config.set({
		basePath: '..',
		frameworks: ['mocha', 'chai'],
		browsers: process.env.CI ? ['PhantomJS'] : ['Chrome', 'Firefox', 'IE'],
		files: [
			'dist/browser/jbinary.js',
			'test/test.js',
			{pattern: 'test/123.tar', included: false, served: true}
		]
	});
}
