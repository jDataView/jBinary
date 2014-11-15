require.config({
	paths: {
		'jdataview': 'http://jdataview.github.io/dist/jdataview.js',
		'..': 'dist/browser/jbinary.js'
	}
});

window.mocha.setup({ui: 'tdd'});

define('chai', function () { return window.chai; });

ES6Promise.polyfill();

window.__dirname = 'base/test';
