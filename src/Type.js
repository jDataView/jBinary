var typeFactory = Base => extend(config => {
	class Type extends Base {
		constructor(...args) {
			if (!(this instanceof Type)) {
				return new Type(...args);
			}
			super(args);
		}
	}
	extend(Type.prototype, config);
	return Type;
}, {Base});

var Type = jBinary.Type = typeFactory(class {
	constructor(args) {
		var {params, setParams} = this;
		if (params) {
			for (var i = 0; i < params.length; i++) {
				this[params[i]] = args[i];
			}
		}
		if (setParams) {
			setParams.apply(this, args);
		}
	}

	resolveTypes(getType) {
		var {typeParams, resolve} = this;
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
