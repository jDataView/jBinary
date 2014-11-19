require.config({
	baseUrl: '/base',
	paths: {
		'dist/es5': 'dist/browser/jbinary',
		'chai': 'node_modules/chai/chai',
		'jdataview': 'http://jdataview.github.io/dist/jdataview',
		'ES6Promise': 'http://es6-promises.s3.amazonaws.com/es6-promise-2.0.0.min'
	}
});

window.__dirname = '/base/test';
window.DEBUG = true;
window.NODE = false;
window.BROWSER = true;

mocha.setup({ui: 'tdd'});

require(['ES6Promise'], function (ES6Promise) {
	ES6Promise.r();
	require(['test/test.es5'], __karma__.start);
});
