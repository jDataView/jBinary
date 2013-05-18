// https://github.com/davidchambers/Base64.js
(function(){var t="undefined"!=typeof window?window:exports,r="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",n=function(){try{document.createElement("$")}catch(t){return t}}();t.btoa||(t.btoa=function(t){for(var o,e,a=0,c=r,f="";t.charAt(0|a)||(c="=",a%1);f+=c.charAt(63&o>>8-8*(a%1))){if(e=t.charCodeAt(a+=.75),e>255)throw n;o=o<<8|e}return f}),t.atob||(t.atob=function(t){if(t=t.replace(/=+$/,""),1==t.length%4)throw n;for(var o,e,a=0,c=0,f="";e=t.charAt(c++);~e&&(o=a%4?64*o+e:e,a++%4)?f+=String.fromCharCode(255&o>>(6&-2*a)):0)e=r.indexOf(e);return f})})();

(function (exports) {

if (typeof jDataView === 'undefined' && typeof require !== 'undefined') {
	jDataView = require('jDataView');
}

function extend(obj) {
	for (var i = 1; i < arguments.length; ++i) {
		var source = arguments[i];
		for (var prop in source) {
			if (source[prop] !== undefined) {
				obj[prop] = source[prop];
			}
		}
	}
	return obj;
}

function inherit(obj) {
	if ('create' in Object) {
		obj = Object.create(obj);
	} else {
		var ClonedObject = function () {};
		ClonedObject.prototype = obj;
		obj = new ClonedObject();
	}
	return extend.apply(this, arguments);
}

function jBinary(view, structure) {
	if (!(view instanceof jDataView)) {
		view = new jDataView(view);
	}
	if (!(this instanceof jBinary)) {
		return new jBinary(view, structure);
	}
	this.view = view;
	this.view.seek(0);
	this._bitShift = 0;
	this.contexts = [];
	this.structure = inherit(jBinary.prototype.structure, structure);
}

jBinary.prototype.getContext = function (filter) {
	switch (typeof filter) {
		case 'function':
			for (var i = 0, length = this.contexts.length; i < length; i++) {
				var context = this.contexts[i];
				if (filter.call(this, context)) {
					return context;
				}
			}
			return;

		case 'string':
			return this.getContext(function (context) { return filter in context });

		case 'number':
			return this.contexts[filter];

		default:
			return this.contexts[0];
	}
};

jBinary.prototype.inContext = function (newContext, callback) {
	this.contexts.unshift(newContext);
	var result = callback.call(this);
	this.contexts.shift();
	return result;
};

jBinary.Property = function (init, read, write) {
	var initFunc;
	if (init instanceof Function) {
		initFunc = init;
	} else
	if (init instanceof Array) {
		initFunc = function () {
			for (var i = 0, length = Math.min(init.length, arguments.length); i < length; i++) {
				this[init[i]] = arguments[i];
			}
		};
	} else {
		initFunc = function () {};
	}

	var property = function (binary, args) {
		this.binary = binary;
		this.init.apply(this, args);
	};
	property.prototype = inherit(jBinary.Property.prototype, {
		constructor: property,
		init: initFunc,
		read: read,
		write: write || function () {}
	});
	return property;
};

jBinary.Template = function (init, getType) {
	var property = jBinary.Property(
		init,
		function () {
			var type = this.getType();
			if (type) return this.binary.read(type);
		},
		function (value) {
			var type = this.getType();
			if (type) this.binary.write(type, value);
		}
	);
	property.prototype.getType = getType || function () { return this.baseType };
	return property;
};

jBinary.FileFormat = function (structures, fileStructure) {
	var fileConstructor = function (buffer) {
		return new (jBinary.Template(['baseType']))(new jBinary(buffer, structures), [fileStructure]);
	};
	fileConstructor.loadFrom = function (source, callback) {
		function callbackWrapper(data) { callback.call(new fileConstructor(data)) }

		if (typeof File !== 'undefined' && source instanceof File) {
			var reader = new FileReader;
			reader.onload = function() { callbackWrapper(this.result) };
			reader.readAsArrayBuffer(source);
		} else {
			var xhr = new XMLHttpRequest;
			xhr.open('GET', source, true);

			// new browsers (XMLHttpRequest2-compliant)
			if ('responseType' in xhr) {
				xhr.responseType = 'arraybuffer';
			}
			// old browsers (XMLHttpRequest-compliant)
			else if ('overrideMimeType' in xhr) {
				xhr.overrideMimeType('text/plain; charset=x-user-defined');
			}
			// IE9 (Microsoft.XMLHTTP-compliant)
			else {
				xhr.setRequestHeader('Accept-Charset', 'x-user-defined');
			}

			xhr.onload = function() {
				if (this.status != 200) {
					throw new Error(this.statusText);
				}
				// emulating response field for IE9
				if (!('response' in this)) {
					this.response = String.fromCharCode.apply(String, new VBArray(this.responseBody).toArray()).join('');
				}
				callbackWrapper(this.response);
			};

			xhr.send();
		}
	};
	fileConstructor.toURL = function (type) {
		return this.binary.toURL(type);
	};
	return fileConstructor;
};

function toValue(prop, val) {
	return val instanceof Function ? val.call(prop) : val;
}

jBinary.prototype.structure = {
	extend: jBinary.Property(
		function () {
			this.parts = arguments;
		},
		function () {
			var parts = this.parts, obj = this.binary.read(parts[0]);
			this.binary.inContext(obj, function () {
				for (var i = 1, length = parts.length; i < length; i++) {
					extend(obj, this.read(parts[i]));
				}
			});
			return obj;
		},
		function (obj) {
			var parts = this.parts;
			this.binary.inContext(obj, function () {
				for (var i = 0, length = parts.length; i < length; i++) {
					this.write(parts[i], obj);
				}
			});
		}
	),
	enum: jBinary.Property(
		['baseType', 'matches'],
		function () {
			var value = this.binary.read(this.baseType);
			if (value in this.matches) {
				value = this.matches[value];
			}
			return value;
		},
		function (value) {
			for (var index in this.matches) {
				if (this.matches[index] === value) {
					value = name;
					break;
				}
			}
			this.binary.write(this.baseType, value);
		}
	),
	string: jBinary.Property(
		['length'],
		function () {
			var string;
			if (this.length !== undefined) {
				string = this.binary.view.getString(toValue(this, this.length));
			} else {
				var begin = this.binary.tell();
				var end = this.binary.seek(begin, function () {
					while (this.view.getUint8());
					return this.tell();
				}) - 1;
				string = this.binary.view.getString(end - begin);
				this.binary.skip(1);
			}
			return string;
		},
		function (value) {
			this.binary.view.writeString(value);
			if (this.length === undefined) {
				this.binary.view.writeUint8(0);
			}
		}
	),
	array: jBinary.Property(
		['type', 'length'],
		function () {
			var length = toValue(this, this.length);
			var results = new Array(length);
			for (var i = 0; i < length; i++) {
				results[i] = this.binary.read(this.type);
			}
			return results;
		},
		function (values) {
			for (var i = 0, length = values.length; i < length; i++) {
				this.binary.write(this.type, values[i]);
			}
		}
	),
	object: jBinary.Property(
		['structure'],
		function () {
			var self = this, structure = this.structure, output = {};
			this.binary.inContext(output, function () {
				for (var key in structure) {
					var value = (!(structure[key] instanceof Function) || structure[key].prototype instanceof jBinary.Property)
								? this.read(structure[key])
								: structure[key].call(self);
					// skipping undefined call results (useful for 'if' statement)
					if (value !== undefined) {
						output[key] = value;
					}
				}
			});
			return output;
		},
		function (data) {
			var self = this, structure = this.structure;
			this.binary.inContext(data, function () {
				for (var key in structure) {
					if (!(structure[key] instanceof Function) || structure[key].prototype instanceof jBinary.Property) {
						this.write(structure[key], data[key]);
					} else {
						data[key] = structure[key].call(self);
					}
				}
			});
		}
	),
	bitfield: jBinary.Property(
		['bitSize'],
		function () {
			var bitSize = this.bitSize,
				binary = this.binary,
				fieldValue = 0;

			if (binary._bitShift < 0 || binary._bitShift >= 8) {
				var byteShift = binary._bitShift >> 3; // Math.floor(_bitShift / 8)
				binary.skip(byteShift);
				binary._bitShift &= 7; // _bitShift + 8 * Math.floor(_bitShift / 8)
			}
			if (binary._bitShift > 0 && bitSize >= 8 - binary._bitShift) {
				fieldValue = binary.view.getUint8() & ~(-1 << (8 - binary._bitShift));
				bitSize -= 8 - binary._bitShift;
				binary._bitShift = 0;
			}
			while (bitSize >= 8) {
				fieldValue = binary.view.getUint8() | (fieldValue << 8);
				bitSize -= 8;
			}
			if (bitSize > 0) {
				fieldValue = ((binary.view.getUint8() >>> (8 - (binary._bitShift + bitSize))) & ~(-1 << bitSize)) | (fieldValue << bitSize);
				binary._bitShift += bitSize - 8; // passing negative value for next pass
			}

			return fieldValue;
		},
		function (value) {
			var bitSize = this.bitSize,
				binary = this.binary;

			if (binary._bitShift < 0 || binary._bitShift >= 8) {
				var byteShift = binary._bitShift >> 3; // Math.floor(_bitShift / 8)
				binary.skip(byteShift);
				binary._bitShift &= 7; // _bitShift + 8 * Math.floor(_bitShift / 8)
			}
			if (binary._bitShift > 0 && bitSize >= 8 - binary._bitShift) {
				var pos = binary.tell();
				var byte = binary.view.getUint8(pos) & (-1 << (8 - binary._bitShift));
				byte |= value >>> (bitSize - (8 - binary._bitShift));
				binary.view.setUint8(pos, byte);
				bitSize -= 8 - binary._bitShift;
				binary._bitShift = 0;
			}
			while (bitSize >= 8) {
				binary.view.writeUint8((value >>> (bitSize - 8)) & 0xff);
				bitSize -= 8;
			}
			if (bitSize > 0) {
				var pos = binary.tell();
				var byte = binary.view.getUint8(pos) & ~(~(-1 << bitSize) << (8 - (binary._bitShift + bitSize)));
				byte |= (value & ~(-1 << bitSize)) << (8 - (binary._bitShift + bitSize));
				binary.view.setUint8(pos, byte);
				binary._bitShift += bitSize - 8; // passing negative value for next pass
			}
		}
	),
	if: jBinary.Template(
		['condition', 'trueType', 'falseType'],
		function () {
			return toValue(this, this.condition) ? this.trueType : this.falseType;
		}
	),
	const: jBinary.Property(
		['type', 'value', 'strict'],
		function () {
			var value = this.binary.read(this.type);
			if (this.strict && value != this.value) throw new TypeError('Unexpected value.');
			return value;
		},
		function () {
			this.binary.write(this.type, this.value);
		}
	),
	skip: jBinary.Template(
		['length'],
		function () {
			this.binary.skip(toValue(this, this.length));
		}
	),
	blob: jBinary.Property(
		['length'],
		function () {
			return this.binary.view.getBytes(toValue(this, this.length), undefined, true);
		},
		function (bytes) {
			this.binary.view.writeBytes(bytes, true);
		}
	)
};

var dataTypes = [
	'Uint8',
	'Uint16',
	'Uint32',
	'Uint64',
	'Int8',
	'Int16',
	'Int32',
	'Int64',
	'Float32',
	'Float64',
	'Char'
];

for (var i = 0; i < dataTypes.length; i++) {
	(function (dataType) {
		jBinary.prototype.structure[dataType.toLowerCase()] = jBinary.Property(
			function () {
				this.dataType = dataType;
			},
			function () {
				return this.binary.view['get' + this.dataType]();
			},
			function (value) {
				this.binary.view['write' + this.dataType](value);
			}
		);
	})(dataTypes[i]);
}

jBinary.prototype.seek = function (position, block) {
	position = toValue(this, position);
	if (block instanceof Function) {
		var old_position = this.view.tell();
		this.view.seek(position);
		var result = block.call(this);
		this.view.seek(old_position);
		return result;
	} else {
		return this.view.seek(position);
	}
};

jBinary.prototype.tell = function () {
	return this.view.tell();
};

jBinary.prototype.skip = function (offset, block) {
	return this.seek(this.tell() + toValue(this, offset), block);
};

jBinary.prototype.getType = function (structure, args) {
	switch (typeof structure) {
		case 'string':
			return this.getType(this.structure[structure], args);

		case 'function':
			return new structure(this, args);

		case 'number':
			return this.getType('bitfield', [structure]);

		case 'object':
			return structure instanceof Array ? this.getType(structure[0], structure.slice(1)) : this.getType('object', [structure]);

	}
};

jBinary.prototype.read = function (structure) {
	return this.getType(structure).read();
};

jBinary.prototype.write = function (structure, data) {
	this.getType(structure).write(data);
};

jBinary.prototype.toURL = function (type) {
	type = type || 'application/octet-stream';
	if (!window.URL || !window.URL.createObjectURL) {
		return 'data:' + type + ';base64,' + btoa(this.seek(0, function () { return this.view.getString() }));
	} else {
		var data = this.seek(0, function () { return this.view._getBytes(undefined, undefined, true) });
		return URL.createObjectURL(new Blob([data], {type: type}));
	}
};

if (typeof module !== 'undefined' && exports === module.exports) {
	module.exports = jBinary;
} else {
	exports.jBinary = jBinary;
}

})(this);
