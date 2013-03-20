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

jBinary.Value = {
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
			var bytes = this.binary.view.getBytes(this.readSize, this.readPos, true);
			binary.view.writeBytes(bytes, true);
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
	
	inherit: function (descriptor) {
		return descriptor ? inherit(this, descriptor) : this;
	},
	
	create: function (binary, parent) {
		var instance = this.inherit({
			parent: parent,
			binary: binary,
			readPos: binary.tell()
		});
		instance.readSize = instance.size();
		binary.seek(instance.readPos + instance.readSize);
		return instance;
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
	}
};

jBinary.Types = {};

jBinary.Types['object'] = jBinary.Value.inherit({
	paramNames: ['structure'],

	constructor: Object,

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
		var result = new this.constructor;
		this.forEach(function (name) {
			result[name] = callback.call(this, name);
		});
		return result;
	},

	path: function (path, value) {
		if (typeof path === 'string') {
			path = path.split('.');
		}
		var name = path[0], subPath = path.slice(1), base = this.value();
		if (name == '**') {
			name = '*';
			subPath = ['**'];
		}
		function subProp(name) {
			var prop = base[name], propValue = value !== undefined ? value[name] : undefined;
			return prop.path && subPath.length > 0 ? prop.path(subPath, propValue) : prop.value(propValue);
		}
		return name == '*' ? this.map(subProp) : subProp(name);
	},

	read: function () {
		return this.map(function (name) {
			return this.getType(name).create(this.binary, this);
		});
	},

	write: function (binary) {
		var prevPos = this.readPos, pos = prevPos;
		this.forEach(function (name) {
			var prop = this.cache[name];
			if (prop.modified) {
				if (pos > prevPos) {
					var bytes = this.binary.view.getBytes(pos - prevPos, undefined, true);
					binary.view.writeBytes(bytes, true);
				}
				prop.write(binary);
				pos += prop.readSize;
				prevPos = pos;
			} else {
				pos += prop.readSize;
			}
		});
		if (pos > prevPos) {
			var bytes = this.binary.view.getBytes(pos - prevPos, undefined, true);
			binary.view.writeBytes(bytes, true);
		}
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

	constructor: Array,

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
	getType: function (type, params) {
		if (type instanceof Array) {
			type = this.getType.apply(this, type);
		} else
		if (typeof type === 'string') {
			type = this.getType(this.types[type]);
		} else
		if (!jBinary.Value.isPrototypeOf(type)) {
			params = {structure: type};
			type = jBinary.Types['object'];
		}

		if (params) {
			if (params.constructor !== Object) {
				// not custom object hash
				params = Array.prototype.slice.call(arguments, 1);
			}

			if (params instanceof Array) {
				var paramValues = params;
				params = {};
				for (var i = 0, length = Math.min(type.paramNames.length, paramValues.length); i < length; i++) {
					params[type.paramNames[i]] = paramValues[i];
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
		return this.getType.apply(this, arguments).create(this);
	},

	parse: function (descriptor, params) {
		var type = this.describe.apply(this, arguments);
		return type.path ? type.path('**') : type.value();
	}
};

if (typeof module !== 'undefined' && exports === module.exports) {
	module.exports = jBinary;
} else {
	exports.jBinary = jBinary;
}

})(this);
