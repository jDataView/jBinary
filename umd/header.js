(function (factory) {
	var global = this;

	if (NODE || typeof exports === 'object') {
		module.exports = factory(global, require('jdataview'));
	} else
	if (BROWSER) {
		if (typeof define === 'function' && define.amd) {
			define(['jdataview'], function (jDataView) {
				return factory(global, jDataView);
			});
		}
		else {
			global.jBinary = factory(global, global.jDataView);
		}
	}
}(function (global, jDataView) {

'use strict';