function is(obj, Ctor) {
	return Ctor && (obj instanceof Ctor);
}

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

var _inherit = Object.create || (BROWSER ? function (obj) {
	var ClonedObject = function () {};
	ClonedObject.prototype = obj;
	return new ClonedObject();
} : undefined);

function inherit(obj) {
	'use strict';
	arguments[0] = _inherit(obj);
	return extend.apply(null, arguments);
}

function toValue(obj, binary, value) {
	return is(value, Function) ? value.call(obj, binary.contexts[0]) : value;
}

var defineProperty = Object.defineProperty;

if (BROWSER) {
	if (defineProperty) {
		// this is needed to detect DOM-only version of Object.defineProperty in IE8:
		try {
			defineProperty({}, 'x', {});
		} catch (e) {
			defineProperty = null;
		}
	} else  {
		defineProperty = function (obj, key, descriptor, allowVisible) {
			if (allowVisible) {
				obj[key] = descriptor.value;
			}
		};
	}
}

function promising(func) {
	return function () {
		if (is(arguments[arguments.length - 1], Function)) {
			return func.apply(this, arguments);
		} else {
			var args = arguments;

			return new Promise(function (resolveFn, rejectFn) {
				Array.prototype.push.call(args, function (err, res) {
					return err ? rejectFn(err) : resolveFn(res);
				});

				func.apply(null, args);
			});
		}
	};
}