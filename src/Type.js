var typeFactory = Base => extend(config => {
	class Type extends Base {
		constructor(getType, ...args) {
			if (!(this instanceof Type)) {
				return new Type(...arguments);
			}
			super(config, getType, args);
		}
	}
	extend(Type.prototype, config);
	return Type;
}, {Base});

var Type = jBinary.Type = typeFactory(class {
	constructor(config, getType, args) {
		var {params, setParams, typeParams, resolve} = config;
		if (params) {
			for (var i = 0; i < params.length; i++) {
				this[params[i]] = args[i];
			}
		}
		if (setParams) {
			setParams.apply(this, args);
		}
		if (typeParams) {
			for (var i = 0; i < typeParams.length; i++) {
				var param = typeParams[i], descriptor = this[param];
				if (descriptor) {
					this[param] = getType(descriptor);
				}
			}
		}
		if (resolve) {
			resolve.call(this, getType);
		}
	}

	read() {
		throw new TypeError('read() method was not defined.');
	}

	write(value) {
		throw new TypeError('write() method was not defined.');
	}

	createProperty(binary) {
		var {view} = binary;
		return inherit(this, {binary, view});
	}

	toValue(val, allowResolve) {
		if (allowResolve !== false && typeof val === 'string') {
			return this.binary.getContext(val)[val];
		}
		return toValue(this, this.binary, val);
	}
});
