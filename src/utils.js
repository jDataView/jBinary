export function extend(obj, ...args) {
	for (var i = 0; i < args.length; i++) {
		var source = args[i];
		for (var prop in source) {
			if (source[prop] !== undefined) {
				obj[prop] = source[prop];
			}
		}
	}
	return obj;
};

export function inherit(obj, ...args) {
	return extend(Object.create(obj), ...args);
};

export function is(obj, Ctor) {
	if (!obj || !Ctor) {
		return false;
	}
	if (obj.constructor === Ctor) {
		return true;
	}
	if (NODE && Ctor === Buffer) {
		return Buffer.isBuffer(obj);
	}
	if (Ctor === Array) {
		return Array.isArray(obj);
	}
	return Object.prototype.toString.call(obj) === '[object ' + Ctor.name + ']';
};

export function toValue(obj, binary, value) {
	return is(value, Function) ? value.call(obj, binary.contexts[0]) : value;
};

if (NODE) {
	export var callback = (resolve, reject) => (err, data) => {
		err ? reject(err) : resolve(data);
	};
}

export function capitalize(str) {
	return str[0].toUpperCase() + str.slice(1);
};

export function toString(obj) {
	if (obj === undefined) {
		return '';
	}
	if (typeof obj !== 'object' || obj === null || obj.constructor !== Object) {
		return JSON.stringify(obj);
	}
	var keys = Object.keys(obj);
	if (keys.length > 4) {
		keys = keys.slice(0, 3).concat(['...']);
	}
	return '{' + keys.join(', ') + '}';
};
