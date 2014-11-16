function is(obj, Ctor) {
	return Ctor && (obj instanceof Ctor);
}

var extend = Object.assign || (NODE ? require('object-assign') : (obj, ...args) => {
	for (var i = 0; i < args.length; i++) {
		var source = args[i];
		for (var prop in source) {
			if (source[prop] !== undefined) {
				obj[prop] = source[prop];
			}
		}
	}
	return obj;
});

function inherit(obj, ...args) {
	return extend(Object.create(obj), ...args);
}

function toValue(obj, binary, value) {
	return is(value, Function) ? value.call(obj, binary.contexts[0]) : value;
}

function callback(resolve, reject) {
	return (err, data) => {
		err ? reject(err) : resolve(data);
	};
}
