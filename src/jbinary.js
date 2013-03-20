(function (exports) {

if (typeof jDataView === 'undefined' && typeof require !== 'undefined') {
	jDataView = require('jDataView');
}

function inherit(obj, other) {
	if ('create' in Object) {
		obj = Object.create(obj);
	} else {
		function ClonedObject() {}
		ClonedObject.prototype = obj;
		obj = new ClonedObject();
	}
	if (other) {
		for (var propName in other) {
			obj[propName] = other[propName];
		}
	}
	return obj;
}

function jBinary(view, types) {
	if (!(this instanceof jBinary)) {
		return new jBinary(view, types);
	}
	if (!(view instanceof jDataView)) {
		view = new jDataView(view, undefined, undefined, true);
	}
	this.view = view;
	this.seek(0);
	this.types = inherit(jBinary.Types, types);
}

jBinary.Value = function (binary, parent) {
	this.binary = binary;
	this.parent = parent;
	this.readPos = binary.tell();
	this.readSize = this.size();
	binary.seek(this.readPos + this.readSize);
};

jBinary.Value.prototype = {
	paramNames: [],

	atStart: function (action) {
		var self = this;
		return this.binary.seek(this.readPos, function () {
			return action.call(self);
		});
	},

	flush: function (binary) {
		binary = binary || new jBinary(this.bufferSize());
		if (this.modified) {
			this.write(binary);
		} else {
			this.binary.copyBytesTo(binary, this.readPos, this.readPos + this.readSize);
		}
		return binary;
	},

	size: function () {
		var pos = this.binary.tell();
		this.read();
		return this.binary.tell() - pos;
	},
	
	bufferSize: function () {
		return this.size();
	},
	
	notify: function () {
		this.modified = true;
		if (this.parent) {
			this.parent.notify();
		}
	},
	
	value: function (value) {
		if (value !== undefined && value !== this.cache) {
			this.cache = value;
			this.notify();
		} else
		if (this.cache === undefined) {
			this.cache = this.atStart(function () {
				return this.read();
			});
		}
		return this.cache;
	},

	path: function (path, value) {
		return this.value(value);
	}
};

jBinary.Value.inherit = function (descriptor) {
	var type = this;
	var subType = function () {
		type.apply(this, arguments);
	};
	subType.prototype = inherit(type.prototype, descriptor);
	subType.inherit = type.inherit;
	return subType;
};

jBinary.Types = {};

jBinary.Types['object'] = jBinary.Value.inherit({
	paramNames: ['structure'],

	baseType: Object,

	forEach: function (callback) {
		for (var name in this.structure) {
			callback.call(this, name);
		}
	},

	getType: function (name) {
		if (!this.typeCache) {
			this.typeCache = {};
		}
		return this.typeCache[name] || (this.typeCache[name] = this.binary.getType(this.structure[name]));
	},

	map: function (callback) {
		var result = new this.baseType;
		this.forEach(function (name) {
			result[name] = callback.call(this, name);
		});
		return result;
	},

	path: function (path, value) {
		if (typeof path === 'string') {
			path = path.split('.');
		}
		var base = this.value();
		if (path.length === 0) {
			return base;
		}
		var name = path[0], subPath = path.slice(1);
		if (name == '**') {
			name = '*';
			subPath = ['**'];
		}
		function subProp(name) {
			var prop = base[name], propValue = value !== undefined ? value[name] : undefined;
			return prop.path(subPath, propValue);
		}
		return name == '*' ? this.map(subProp) : subProp(name);
	},

	read: function () {
		return this.map(function (name) {
			return new (this.getType(name))(this.binary, this);
		});
	},

	write: function (binary) {
		var prevPos = this.readPos, pos = prevPos;
		this.forEach(function (name) {
			var prop = this.cache[name];
			if (prop.modified) {
				this.binary.copyBytesTo(binary, prevPos, pos);
				prop.write(binary);
				pos += prop.readSize;
				prevPos = pos;
			} else {
				pos += prop.readSize;
			}
		});
		this.binary.copyBytesTo(binary, prevPos, pos);
	},

	size: function () {
		var props = this.value(), size = 0;
		this.forEach(function (name) {
			size += props[name].atStart(function () {
				return this.size();
			});
		});
		return size;
	},

	bufferSize: function () {
		var props = this.value(), size = 0;
		this.forEach(function (name) {
			size += props[name].bufferSize();
		});
		return size;
	}
});

jBinary.Types['array'] = jBinary.Types['object'].inherit({
	paramNames: ['type', 'length'],

	baseType: Array,

	forEach: function (callback) {
		for (var i = 0, length = this.length; i < length; i++) {
			callback.call(this, i);
		}
	},

	getType: function () {
		return this.typeCache || (this.typeCache = this.binary.getType(this.type));
	}
});

jBinary.Types['string'] = jBinary.Value.inherit({
	paramNames: ['length'],

	read: function () {
		return this.binary.view.getString(this.length);
	},

	write: function (binary) {
		binary.view.writeString(this.cache);
	},

	size: function () {
		return this.length;
	},

	bufferSize: function () {
		return this.cache.length;
	}
});

var nativeTypes = {
	'Int8': 1,
	'Int16': 2,
	'Int32': 4,
	'Uint8': 1,
	'Uint16': 2,
	'Uint32': 4,
	'Float32': 4,
	'Float64': 8,
	'Char': 1
};

var NativeType = jBinary.Value.inherit({
	paramNames: ['littleEndian'],

	read: function () {
		return this.binary.view['get' + this.dataType](undefined, this.littleEndian);
	},

	write: function (binary) {
		binary.view['write' + this.dataType](this.cache, this.littleEndian);
	},

	size: function () {
		return nativeTypes[this.dataType];
	}
});

for (var dataType in nativeTypes) {
	jBinary.Types[dataType.toLowerCase()] = NativeType.inherit({
		dataType: dataType,
		littleEndian: true
	})
}

jBinary.prototype = {
	copyBytesTo: function (binary, begin, end) {
		if (end <= begin) return;
		var bytes = this.inPlace(function () { return this.view.getBytes(end - begin, begin, true) });
		binary.view.writeBytes(bytes, true);
	},

	getType: function (type, params) {
		if (type instanceof Array) {
			type = this.getType.apply(this, type);
		} else
		if (typeof type === 'string') {
			type = this.getType(this.types[type]);
		} else
		if (!(type.prototype instanceof jBinary.Value)) {
			// syntax sugar for structures
			type = jBinary.Types['object'].inherit({structure: type});
		}

		if (params) {
			if (params.constructor !== Object) {
				// not custom object hash
				params = Array.prototype.slice.call(arguments, 1);
			}

			if (params instanceof Array) {
				var paramNames = type.prototype.paramNames, paramValues = params;
				params = {};
				for (var i = 0, length = Math.min(paramNames.length, paramValues.length); i < length; i++) {
					params[paramNames[i]] = paramValues[i];
				}
			}
		}

		return type.inherit(params);
	},

	seek: function (pos, callback) {
		if (callback) {
			var prevPos = this.tell();
			this.view.seek(pos);
			var result = callback.call(this);
			this.view.seek(prevPos);
			return result;
		} else {
			this.view.seek(pos);
		}
	},

	inPlace: function (callback) {
		return this.seek(this.tell(), callback);
	},

	tell: function () {
		return this.view.tell();
	},

	skip: function (size) {
		this.seek(this.tell() + size);
	},

	describe: function (descriptor, params) {
		return new (this.getType.apply(this, arguments))(this);
	},

	parse: function (descriptor, params) {
		var instance = this.describe.apply(this, arguments);
		return instance.path('**');
	},

	write: function (descriptor, params, value) {
		value = arguments[arguments.length - 1];
		var instance = this.describe.apply(this, Array.prototype.slice.call(arguments, 0, -1));
		instance.path('**', value);
		instance.atStart(function () { this.flush(this.binary) });
		return value;
	},

	modify: function (descriptor, params, callback) {
		callback = arguments[arguments.length - 1];
		var instance = this.describe.apply(this, Array.prototype.slice.call(arguments, 0, -1));
		var value = instance.path('**');
		return instance.atStart(function () {
			var newValue = callback.call(this.binary, value);
			if (newValue === undefined) {
				newValue = value;
			}
			this.path('**', newValue);
			this.flush(this.binary);
			return newValue;
		});
	}
};

if (typeof module !== 'undefined' && exports === module.exports) {
	module.exports = jBinary;
} else {
	exports.jBinary = jBinary;
}

})(this);
