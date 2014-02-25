function extend(obj) {
	for (var i = 1, length = arguments.length; i < length; ++i) {
		var source = arguments[i];
		for (var prop in source) {
			if (source[prop] !== undefined) {
				obj[prop] = source[prop];
			}
		}
	}
	return obj;
}

var _inherit = Object.create || function (obj) {
	var ClonedObject = function () {};
	ClonedObject.prototype = obj;
	return new ClonedObject();
};

function inherit(obj) {
	'use strict';
	arguments[0] = _inherit(obj);
	return extend.apply(null, arguments);
}

function toValue(obj, binary, value) {
	return value instanceof Function ? value.call(obj, binary.contexts[0]) : value;
}

var defineProperty = Object.defineProperty;

if (defineProperty && BROWSER) {
	// this is needed to detect DOM-only version of Object.defineProperty in IE8:
	try {
		defineProperty({}, 'x', {});
	} catch (e) {
		defineProperty = null;
	}
}

if (!defineProperty) {
	defineProperty = function (obj, key, descriptor, allowVisible) {
		if (allowVisible) {
			obj[key] = descriptor.value;
		}
	};
}

function promising(func) {
	return function () {
		if (typeof arguments[arguments.length - 1] === 'function') {
			return func.apply(this, arguments);
		} else {
			var self = this, args = arguments;
			return {
				then: function (resolveFn, rejectFn) {
					Array.prototype.push.call(args, function (err, res) {
						return err ? rejectFn(err) : resolveFn(res);
					});
					return func.apply(self, args);
				}
			};
		}
	};
}