(function (exports, global) {

// https://github.com/davidchambers/Base64.js
if (!('atob' in global) || !('btoa' in global))
(function(){var t="undefined"!=typeof window?window:exports,r="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",n=function(){try{document.createElement("$")}catch(t){return t}}();t.btoa||(t.btoa=function(t){for(var o,e,a=0,c=r,f="";t.charAt(0|a)||(c="=",a%1);f+=c.charAt(63&o>>8-8*(a%1))){if(e=t.charCodeAt(a+=.75),e>255)throw n;o=o<<8|e}return f}),t.atob||(t.atob=function(t){if(t=t.replace(/=+$/,""),1==t.length%4)throw n;for(var o,e,a=0,c=0,f="";e=t.charAt(c++);~e&&(o=a%4?64*o+e:e,a++%4)?f+=String.fromCharCode(255&o>>(6&-2*a)):0)e=r.indexOf(e);return f})})();

if (!('jDataView' in global) && 'require' in global) {
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

		case 'undefined':
			return this.contexts[0];
	}
};

jBinary.prototype.inContext = function (newContext, callback) {
	this.contexts.unshift(newContext);
	var result = callback.call(this);
	this.contexts.shift();
	return result;
};

jBinary.Type = function (config) {
	if (!(this instanceof jBinary.Type)) {
		return new jBinary.Type(config);
	}
	for (var paramName in config) {
		this[paramName] = config[paramName];
	}
};

jBinary.Type.prototype = {
	withArgs: function (args) {
		if (!this.init && (!this.params || !args || !args.length)) {
			return this;
		}

		args = args || [];
		var type = inherit(this);
		if (this.params) {
			if (this.params instanceof Array) {
				for (var i = 0, length = this.params.length; i < length; i++) {
					type[this.params[i]] = args[i];
				}
			} else {
				type[this.params] = args;
			}
			type.params = null;
		}
		if (this.init) {
			this.init.apply(type, args);
			type.init = null;
		}
		return type;
	},
	createProperty: function (binary) {
		return inherit(this, {binary: binary});
	}
};

jBinary.Template = function (config) {
	config = inherit(config);

	config.baseRead =
		config.getBaseType
		? function (context) {
			return this.binary.read(config.getBaseType.call(this, context));
		}
		: function (context) {
			return this.binary.read(this.baseType);
		};

	if (!('read' in config)) {
		config.read = config.baseRead;
	}

	config.baseWrite =
		config.getBaseType
		? function (value, context) {
			return this.binary.write(config.getBaseType.call(this, context), value);
		}
		: function (value, context) {
			return this.binary.write(this.baseType, value);
		};

	if (!('write' in config)) {
		config.write = config.baseWrite;
	}

	return jBinary.Type.call(this, config);
};

jBinary.Template.prototype = inherit(jBinary.Type.prototype);

function toValue(prop, val) {
	return val instanceof Function ? val.call(prop, prop.binary.contexts[0]) : val;
}

jBinary.prototype.structure = {
	'extend': jBinary.Type({
		params: 'parts',
		read: function () {
			var parts = this.parts, obj = this.binary.read(parts[0]);
			this.binary.inContext(obj, function () {
				for (var i = 1, length = parts.length; i < length; i++) {
					extend(obj, this.read(parts[i]));
				}
			});
			return obj;
		},
		write: function (obj) {
			var parts = this.parts;
			this.binary.inContext(obj, function () {
				for (var i = 0, length = parts.length; i < length; i++) {
					this.write(parts[i], obj);
				}
			});
		}
	}),
	'enum': jBinary.Template({
		params: ['baseType', 'matches'],
		init: function (baseType, matches) {
			this.backMatches = {};
			for (var key in matches) {
				this.backMatches[matches[key]] = key;
			}
		},
		read: function () {
			var value = this.baseRead();
			return value in this.matches ? this.matches[value] : value;
		},
		write: function (value) {
			this.baseWrite(value in this.backMatches ? this.backMatches[value] : value);
		}
	}),
	'string': jBinary.Template({
		params: ['length', 'encoding'],
		init: function (length, encoding) {
			if (length === undefined) {
				this.baseType = ['string0', undefined, encoding];
				this.read = this.baseRead;
				this.write = this.baseWrite;
			}
		},
		read: function () {
			return this.binary.view.getString(toValue(this, this.length), undefined, this.encoding);
		},
		write: function (value) {
			this.binary.view.writeString(value, undefined, this.encoding);
		}
	}),
	'string0': jBinary.Type({
		params: ['length', 'encoding'],
		read: function () {
			var view = this.binary.view, maxLength = this.length;
			if (maxLength === undefined) {
				var startPos = view.tell(), length = 0, code;
				maxLength = view.byteLength - startPos;
				while (length < maxLength && (code = view.getUint8())) {
					length++;
				}
				return view.getString(length, undefined, this.encoding);
			} else {
				return view.getString(maxLength, undefined, this.encoding).replace(/\0.*$/, '');
			}
		},
		write: function (value) {
			var view = this.binary.view, zeroLength = this.length === undefined ? 1 : this.length - value.length;
			view.writeString(value, undefined, this.encoding);
			if (zeroLength > 0) {
				view.writeUint8(0);
				view.skip(zeroLength - 1);
			}
		}
	}),
	'array': jBinary.Type({
		params: ['type', 'length'],
		read: function () {
			var length = toValue(this, this.length);
			if (this.type === 'uint8') {
				return this.binary.view.getBytes(length, undefined, true, true);
			}
			var results;
			if (length !== undefined) {
				results = new Array(length);
				for (var i = 0; i < length; i++) {
					results[i] = this.binary.read(this.type);
				}
			} else {
				var end = this.binary.view.byteLength;
				results = [];
				while (this.binary.tell() < end) {
					results.push(this.binary.read(this.type));
				}
			}
			return results;
		},
		write: function (values) {
			if (this.type === 'uint8') {
				return this.binary.view.writeBytes(values);
			}
			for (var i = 0, length = values.length; i < length; i++) {
				this.binary.write(this.type, values[i]);
			}
		}
	}),
	'object': jBinary.Type({
		params: ['structure'],
		read: function () {
			var self = this, structure = this.structure, output = {};
			this.binary.inContext(output, function () {
				for (var key in structure) {
					var value = !(structure[key] instanceof Function)
								? this.read(structure[key])
								: structure[key].call(self, this.contexts[0]);
					// skipping undefined call results (useful for 'if' statement)
					if (value !== undefined) {
						output[key] = value;
					}
				}
			});
			return output;
		},
		write: function (data) {
			var self = this, structure = this.structure;
			this.binary.inContext(data, function () {
				for (var key in structure) {
					if (!(structure[key] instanceof Function)) {
						this.write(structure[key], data[key]);
					} else {
						data[key] = structure[key].call(self, this.contexts[0]);
					}
				}
			});
		}
	}),
	'bitfield': jBinary.Type({
		params: ['bitSize'],
		read: function () {
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
		write: function (value) {
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
	}),
	'if': jBinary.Template({
		init: function (condition, trueType, falseType) {
			if (typeof condition === 'string') {
				condition = [condition, condition];
			}

			if (condition instanceof Array) {
				this.condition = function () {
					return this.binary.getContext(condition[1])[condition[0]];
				};
			} else {
				this.condition = condition;
			}

			this.trueType = trueType;
			this.falseType = falseType;
		},
		getBaseType: function (context) {
			return this.condition(context) ? this.trueType : this.falseType;
		}
	}),
	'if_not': jBinary.Template({
		init: function (condition, falseType, trueType) {
			this.baseType = ['if', condition, trueType, falseType];
		}
	}),
	'const': jBinary.Type({
		params: ['type', 'value', 'strict'],
		read: function () {
			var value = this.binary.read(this.type);
			if (this.strict && value != this.value) throw new TypeError('Unexpected value.');
			return value;
		},
		write: function () {
			this.binary.write(this.type, this.value);
		}
	}),
	'skip': jBinary.Type({
		init: function (length) {
			this.read = this.write = function () {
				this.binary.skip(toValue(this, length));
			};
		}
	}),
	'blob': jBinary.Type({
		params: ['length'],
		read: function () {
			return this.binary.view.getBytes(toValue(this, this.length));
		},
		write: function (bytes) {
			this.binary.view.writeBytes(bytes, true);
		}
	})
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
		jBinary.prototype.structure[dataType.toLowerCase()] = jBinary.Type({
			params: ['littleEndian'],
			init: function () {
				this.dataType = dataType;
			},
			read: function () {
				return this.binary.view['get' + this.dataType](this.littleEndian);
			},
			write: function (value) {
				this.binary.view['write' + this.dataType](value, this.littleEndian);
			}
		});
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

		case 'number':
			return this.getType('bitfield', [structure]);

		case 'object':
			if (structure instanceof jBinary.Type) {
				return structure.withArgs(args);
			} else
			if (structure instanceof Array) {
				return this.getType(structure[0], structure.slice(1));
			} else {
				return this.getType('object', [structure]);
			}
	}
};

jBinary.prototype.createProperty = function (structure, args) {
	return this.getType(structure, args).createProperty(this);
};

jBinary.prototype.read = function (structure, offset) {
	if (structure === undefined) return;
	var read = function () { return this.createProperty(structure).read(this.contexts[0]) };
	return offset !== undefined ? this.seek(offset, read) : read.call(this);
};

jBinary.prototype.write = function (structure, data, offset) {
	if (structure === undefined) return;
	var write = function () { this.createProperty(structure).write(data, this.contexts[0]) };
	offset !== undefined ? this.seek(offset, write) : write.call(this);
};

jBinary.prototype.toURI = function (type) {
	type = type || 'application/octet-stream';
	if ('URL' in global && 'createObjectURL' in URL) {
		var data = this.seek(0, function () { return this.view.getBytes() });
		return URL.createObjectURL(new Blob([data], {type: type}));
	} else {
		var string = this.seek(0, function () { return this.view.getString(undefined, undefined, this.view._isNodeBuffer ? 'base64' : 'binary') });
		return 'data:' + type + ';base64,' + (this.view._isNodeBuffer ? string : btoa(string));
	}
};

jBinary.prototype.slice = function (start, end, forceCopy) {
	return new jBinary(this.view.slice(start, end, forceCopy), this.structure);
};

jBinary.loadData = function (source, callback) {
	if ('File' in global && source instanceof File) {
		var reader = new FileReader();
		reader.onload = reader.onerror = function() { callback(this.error, this.result) };
		reader.readAsArrayBuffer(source);
	} else {
		if (typeof source !== 'string') return callback(new TypeError('Unsupported source type.'));

		var dataParts = source.match(/^data:(.+?)(;base64)?,(.*)$/);
		if (dataParts) {
			var isBase64 = dataParts[2] !== undefined,
				content = dataParts[3];

			try {
				callback(
					null,
					(isBase64 && jDataView.prototype.compatibility.NodeBuffer)
						? new Buffer(content, 'base64')
						: (isBase64 ? atob : decodeURIComponent)(content)
				);
			} catch (e) {
				callback(e);
			}
		} else
		if ('XMLHttpRequest' in global) {
			var xhr = new XMLHttpRequest();
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

			// shim for onload for old IE
			if (!('onload' in xhr)) {
				xhr.onreadystatechange = function () {
					if (this.readyState === 4) this.onload();
				}
			}

			xhr.onload = function() {
				if (this.status !== 200) return callback(new Error('HTTP Error #' + this.status + ': ' + this.statusText));

				// emulating response field for IE9
				if (!('response' in this)) {
					this.response = new VBArray(this.responseBody).toArray();
				}

				callback(null, this.response);
			};

			xhr.send();
		} else
		if ('require' in global) {
			var protocol = source.match(/^(https?):\/\//);
			if (protocol) {
				require(protocol).get(source, function (res) {
					if (res.statusCode !== 200) return callback(new Error('HTTP Error #' + res.statusCode));

					var buffers = [];
					res.on('data', function (data) {
						buffers.push(data);
					}).on('end', function () {
						callback(null, Buffer.concat(buffers));
					});
				}).on('error', callback);
			} else {
				require('fs').readFile(source, callback);
			}
		}
	}
};

if ('module' in global && exports === module.exports) {
	module.exports = jBinary;
} else {
	exports.jBinary = jBinary;
}

jDataView.prototype.toBinary = function (structure) {
	return new jBinary(this, structure);
};

})(this, (function () { return this })());
