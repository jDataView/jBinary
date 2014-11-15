(function (factory) {
	if (NODE || typeof exports === 'object') {
		module.exports = factory(global, require('jdataview'));
	} else
	if (BROWSER) {
		if (typeof define === 'function' && define.amd) {
			define(['jdataview'], function (jDataView) {
				return factory(window, jDataView);
			});
		}
		else {
			window.jBinary = factory(window, window.jDataView);
		}
	}
}(function (global, jDataView) {

'use strict';
