(function (factory) {
	var root = (function () { return this })();

	if (typeof exports === 'object') {
		module.exports = factory.call(root, require('jdataview'));
	} else
	if (typeof define === 'function' && define.amd) {
		define(['jdataview'], function () {
			factory.apply(root, arguments);
		});
	}
	else {
		root.jBinary = factory.call(root, root.jDataView);
	}
}(function (jDataView) {

'use strict';

var global = this;