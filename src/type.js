function Type(config) {
	return inherit(Type.prototype, config);
}

Type.prototype = {
	inherit: function (args, getType) {
		var _type = this, type;

		function withProp(name, callback) {
			var value = _type[name];
			if (value) {
				if (!type) {
					type = inherit(_type);
				}
				callback.call(type, value);
				type[name] = null;
			}
		}

		withProp('params', function (params) {
			for (var i = 0, length = params.length; i < length; i++) {
				this[params[i]] = args[i];
			}
		});

		withProp('setParams', function (setParams) {
			setParams.apply(this, args);
		});

		withProp('typeParams', function (typeParams) {
			for (var i = 0, length = typeParams.length; i < length; i++) {
				var param = typeParams[i], descriptor = this[param];
				if (descriptor) {
					this[param] = getType(descriptor);
				}
			}
		});

		withProp('resolve', function (resolve) {
			resolve.call(this, getType);
		});

		return type || _type;
	},
	createProperty: function (binary) {
		return inherit(this, {
			binary: binary,
			view: binary.view
		});
	},
	toValue: function (val, allowResolve) {
		if (allowResolve !== false && typeof val === 'string') {
			return this.binary.getContext(val)[val];
		}
		return toValue(this, this.binary, val);
	}
};

jBinary.Type = Type;