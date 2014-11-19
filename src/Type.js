import {extend, inherit, toValue, toString} from './utils';

export var typeFactory = Base => extend(config => {
	class Type extends Base {
		constructor(...args) {
			if (!(this instanceof Type)) {
				return new Type(...args);
			}
			super(...args);
		}
	}
	extend(Type.prototype, config);
	return Type;
}, {Base});

export default typeFactory(class Type {
	constructor(...args) {
		var {params} = this;
		if (params) {
			for (var i = 0; i < params.length; i++) {
				this[params[i]] = args[i];
			}
		}
		if (this.setParams) {
			this.setParams(...args);
		}
	}

	resolveTypes(getType) {
		var {typeParams} = this;
		if (typeParams) {
			for (var i = 0; i < typeParams.length; i++) {
				var param = typeParams[i], descriptor = this[param];
				if (descriptor) {
					this[param] = getType(descriptor);
				}
			}
		}
		if (this.resolve) {
			this.resolve(getType);
		}
	}

	getDisplayName(name) {
		var {params} = this;
		if (params) {
			var values = params.map(name => this[name]);
			var firstDefined = -1;
			for (var i = values.length - 1; i >= 0; i--) {
				if (values[i] !== undefined) {
					firstDefined = i;
					break;
				}
			}
			if (firstDefined >= 0) {
				name += '(';
				name +=
					values
					.slice(0, firstDefined + 1)
					.map(value => value instanceof Type ? value.displayName : toString(value))
					.join(', ');
				name += ')';
			}
		}
		return name;
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
