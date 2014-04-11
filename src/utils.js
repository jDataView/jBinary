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

var _inherit = Object.create;

if (BROWSER && !_inherit) {
	_inherit = function (obj) {
		var ClonedObject = function () {};
		ClonedObject.prototype = obj;
		return new ClonedObject();
	};
}

function inherit(obj) {
	'use strict';
	arguments[0] = _inherit(obj);
	return extend.apply(null, arguments);
}

function toValue(obj, binary, value) {
	return is(value, Function) ? value.call(obj, binary.contexts[0]) : value;
}

function promising(func) {
	return function () {
		var args = arguments,
			lastArgsIndex = args.length - 1,
			lastFuncIndex = func.length - 1,
			callback = args[lastArgsIndex];

		args.length = lastFuncIndex + 1;

		if (is(callback, Function)) {
			args[lastArgsIndex] = undefined;
			args[lastFuncIndex] = callback;
			func.apply(this, args);
		} else {
			var self = this;

			return new Promise(function (resolveFn, rejectFn) {
				args[lastFuncIndex] = function (err, res) {
					return err ? rejectFn(err) : resolveFn(res);
				};

				func.apply(self, args);
			});
		}
	};
}