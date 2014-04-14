module.exports = function (config) {
	var CI = process.env.CI;

	/* jshint camelcase:false */
	var customLaunchers = {
		sl_ie_8: {
			base: 'SauceLabs',
			platform: 'Windows XP',
			browserName: 'Internet Explorer',
			version: '8'
		},
		sl_ie_9: {
			base: 'SauceLabs',
			platform: 'Windows 7',
			browserName: 'Internet Explorer',
			version: '9'
		},
		sl_ie_11: {
			base: 'SauceLabs',
			platform: 'Windows 8.1',
			browserName: 'Internet Explorer',
			version: '11'
		},
		sl_ios: {
			base: 'SauceLabs',
			platform: 'OS X 10.9',
			browserName: 'iPhone',
			version: '7.1'
		},
		sl_safari_6: {
			base: 'SauceLabs',
			platform: 'OS X 10.8',
			browserName: 'Safari',
			version: '6'
		},
		sl_safari_7: {
			base: 'SauceLabs',
			platform: 'OS X 10.9',
			browserName: 'Safari',
			version: '7'
		},
		sl_android: {
			base: 'SauceLabs',
			platform: 'Linux',
			browserName: 'Android'
		},
		sl_chrome: {
			base: 'SauceLabs',
			platform: 'Linux',
			browserName: 'Chrome'
		},
		sl_firefox: {
			base: 'SauceLabs',
			platform: 'Linux',
			browserName: 'Firefox'
		}
	};
	/* jshint camelcase:true */

	config.set({
		basePath: '..',
		frameworks: ['mocha', 'chai'],
		sauceLabs: {
			username: 'RReverser',
			accessKey: '1683bfb6-bd1c-4392-8da7-c622d15d1543',
			testName: 'jBinary',
			recordScreenshots: false
		},
		customLaunchers: customLaunchers,
		browsers: CI ? Object.keys(customLaunchers) : ['Chrome', 'Firefox', 'IE'],
		files: [
			'http://jdataview.github.io/dist/jdataview.js',
			'dist/browser/jbinary.js',
			'test/karma.mocha.conf.js',
			'test/test.js',
			{pattern: 'test/123.tar', included: false, served: true}
		],
		logLevel: CI ? config.LOG_ERROR : config.LOG_INFO,
		reporters: [CI ? 'saucelabs' : 'progress']
	});
};