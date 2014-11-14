class Type {
	constructor(config) {
		if (!(this instanceof Type)) {
			return new Type(config);
		}
		this.override = {};
		for (var name in config) {
			if (name in this) {
				this.override[name] = config[name];
			} else {
				this[name] = config[name];
			}
		}
		this.read = this.override.read || this.read;
		this.write = this.override.write || this.write;
	}

	read() {
		throw new TypeError('read() method was not defined.');
	}

	write() {
		throw new TypeError('write() method was not defined.');
	}

	setParams(...args) {
		var {params} = this;
		if (params) {
			for (var i = 0; i < params.length; i++) {
				this[params[i]] = args[i];
			}
		}
		var {setParams} = this.override;
		if (setParams) {
			setParams.apply(this, args);
		}
		return this;
	}

	resolve(getType) {
		var {typeParams} = this;
		if (typeParams) {
			for (var i = 0; i < typeParams.length; i++) {
				var param = typeParams[i], descriptor = this[param];
				if (descriptor) {
					this[param] = getType(descriptor);
				}
			}
		}
		var {resolve} = this.override;
		if (resolve) {
			resolve.call(this, getType);
		}
		return this;
	}

	_resolvedInherit(args) {
		if (args.length) {
			throw new TypeError('Type is already configured and doesn\'t accept new arguments.');
		}
		return this;
	}

	inherit(args, getType) {
		return extend(
			inherit(this).setParams(...args).resolve(getType),
			{inherit: this._resolvedInherit}
		);
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
}

jBinary.Type = Type;
