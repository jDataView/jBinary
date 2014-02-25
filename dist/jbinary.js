(function (factory) {
	var root = (function () { return this })();

	if (typeof exports === 'object') {
		module.exports = factory.call(root, require('jdataview'));
	} else
	if (typeof define === 'function' && define.amd) {
		define(['jdataview'], function () {
			factory.apply(root, arguments);
		});
	}
	else {
		root['jBinary'] = factory.call(root, root.jDataView);
	}
}(function(jDataView) {

'use strict';

var global = this;

/* jshint ignore:start */

// https://github.com/davidchambers/Base64.js (modified)
if (!('atob' in global) || !('btoa' in global)) {
	(function(){var t=global,r="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",n=function(){try{document.createElement("$")}catch(t){return t}}();t.btoa||(t.btoa=function(t){for(var o,e,a=0,c=r,f="";t.charAt(0|a)||(c="=",a%1);f+=c.charAt(63&o>>8-8*(a%1))){if(e=t.charCodeAt(a+=.75),e>255)throw n;o=o<<8|e}return f}),t.atob||(t.atob=function(t){if(t=t.replace(/=+$/,""),1==t.length%4)throw n;for(var o,e,a=0,c=0,f="";e=t.charAt(c++);~e&&(o=a%4?64*o+e:e,a++%4)?f+=String.fromCharCode(255&o>>(6&-2*a)):0)e=r.indexOf(e);return f})})();
}

if (BROWSER && !jDataView) {
	var tempKey = 'jBinary_activate';

	global[tempKey] = function () {
		try {
			delete global[tempKey];
		} catch (e) {
			// hello, old IE!
			global[tempKey] = undefined;
		}

		jDataView = global.jDataView;
	};

	document.write('<script src="//jdataview.github.io/dist/jdataview.js"></script><script>' + tempKey + '()</script>');
}

/* jshint ignore:end */

function extend(obj) {
	for (var i = 1, length = arguments.length; i < length; ++i) {
		var source = arguments[i];
		for (var prop in source) {
			if (source[prop] !== undefined) {
				obj[prop] = source[prop];
			}
		}
	}
	return obj;
}

var _inherit = Object.create || function (obj) {
	var ClonedObject = function () {};
	ClonedObject.prototype = obj;
	return new ClonedObject();
};

function inherit(obj) {
	'use strict';
	arguments[0] = _inherit(obj);
	return extend.apply(null, arguments);
}

function toValue(obj, binary, value) {
	return value instanceof Function ? value.call(obj, binary.contexts[0]) : value;
}

var defineProperty = Object.defineProperty;

if (defineProperty && BROWSER) {
	// this is needed to detect DOM-only version of Object.defineProperty in IE8:
	try {
		defineProperty({}, 'x', {});
	} catch (e) {
		defineProperty = null;
	}
}

if (!defineProperty) {
	defineProperty = function (obj, key, descriptor, allowVisible) {
		if (allowVisible) {
			obj[key] = descriptor.value;
		}
	};
}

function promising(func) {
	return function () {
		if (typeof arguments[arguments.length - 1] === 'function') {
			return func.apply(this, arguments);
		} else {
			var self = this, args = arguments;
			return {
				then: function (resolveFn, rejectFn) {
					Array.prototype.push.call(args, function (err, res) {
						return err ? rejectFn(err) : resolveFn(res);
					});
					return func.apply(self, args);
				}
			};
		}
	};
}

function jBinary(view, typeSet) {
	if (view instanceof jBinary) {
		return view.as(typeSet);
	}

	/* jshint validthis:true */
	if (!(view instanceof jDataView)) {
		view = new jDataView(view, undefined, undefined, typeSet ? typeSet['jBinary.littleEndian'] : undefined);
	}
	
	if (!(this instanceof jBinary)) {
		return new jBinary(view, typeSet);
	}
	
	this.view = view;
	this.view.seek(0);
	this.contexts = [];

	return this.as(typeSet, true);
}

var proto = jBinary.prototype;

proto.cacheKey = 'jBinary.Cache';
proto.id = 0;

proto._getCached = function (obj, valueAccessor, allowVisible) {
	if (!obj.hasOwnProperty(this.cacheKey)) {
		var value = valueAccessor.call(this, obj);
		defineProperty(obj, this.cacheKey, {value: value}, allowVisible);
		return value;
	} else {
		return obj[this.cacheKey];
	}
};

proto.toValue = function (value) {
	return toValue(this, this, value);
};

proto.getContext = function (filter) {
	switch (typeof filter) {
		case 'undefined':
			filter = 0;
		/* falls through */
		case 'number':
			return this.contexts[filter];

		case 'string':
			return this.getContext(function (context) { return filter in context });

		case 'function':
			for (var i = 0, length = this.contexts.length; i < length; i++) {
				var context = this.contexts[i];
				if (filter.call(this, context)) {
					return context;
				}
			}
			return;
	}
};

proto.inContext = function (newContext, callback) {
	this.contexts.unshift(newContext);
	var result = callback.call(this);
	this.contexts.shift();
	return result;
};

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
			for (var i = 0, length = Math.min(params.length, args.length); i < length; i++) {
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

function Template(config) {
	return inherit(Template.prototype, config, {
		createProperty: function (binary) {
			var property = (config.createProperty || Template.prototype.createProperty).apply(this, arguments);
			if (property.getBaseType) {
				property.baseType = property.binary.getType(property.getBaseType(property.binary.contexts[0]));
			}
			return property;
		}
	});
}

Template.prototype = inherit(Type.prototype, {
	setParams: function () {
		if (this.baseType) {
			this.typeParams = ['baseType'].concat(this.typeParams || []);
		}
	},
	baseRead: function () {
		return this.binary.read(this.baseType);
	},
	baseWrite: function (value) {
		return this.binary.write(this.baseType, value);
	}
});

extend(Template.prototype, {
	read: Template.prototype.baseRead,
	write: Template.prototype.baseWrite
});

jBinary.Template = Template;

proto.typeSet = {
	'extend': Type({
		setParams: function () {
			this.parts = arguments;
		},
		resolve: function (getType) {
			var parts = this.parts, length = parts.length, partTypes = new Array(length);
			for (var i = 0; i < length; i++) {
				partTypes[i] = getType(parts[i]);
			}
			this.parts = partTypes;
		},
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
	'enum': Template({
		params: ['baseType', 'matches'],
		setParams: function (baseType, matches) {
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
	'string': Template({
		params: ['length', 'encoding'],
		read: function () {
			return this.view.getString(this.toValue(this.length), undefined, this.encoding);
		},
		write: function (value) {
			this.view.writeString(value, this.encoding);
		}
	}),
	'string0': Type({
		params: ['length', 'encoding'],
		read: function () {
			var view = this.view, maxLength = this.length;
			if (maxLength === undefined) {
				var startPos = view.tell(), length = 0, code;
				maxLength = view.byteLength - startPos;
				while (length < maxLength && (code = view.getUint8())) {
					length++;
				}
				var string = view.getString(length, startPos, this.encoding);
				if (length < maxLength) {
					view.skip(1);
				}
				return string;
			} else {
				return view.getString(maxLength, undefined, this.encoding).replace(/\0.*$/, '');
			}
		},
		write: function (value) {
			var view = this.view, zeroLength = this.length === undefined ? 1 : this.length - value.length;
			view.writeString(value, undefined, this.encoding);
			if (zeroLength > 0) {
				view.writeUint8(0);
				view.skip(zeroLength - 1);
			}
		}
	}),
	'array': Template({
		params: ['baseType', 'length'],
		read: function () {
			var length = this.toValue(this.length);
			if (this.baseType === proto.typeSet.uint8) {
				return this.view.getBytes(length, undefined, true, true);
			}
			var results;
			if (length !== undefined) {
				results = new Array(length);
				for (var i = 0; i < length; i++) {
					results[i] = this.baseRead();
				}
			} else {
				var end = this.view.byteLength;
				results = [];
				while (this.binary.tell() < end) {
					results.push(this.baseRead());
				}
			}
			return results;
		},
		write: function (values) {
			if (this.baseType === proto.typeSet.uint8) {
				return this.view.writeBytes(values);
			}
			for (var i = 0, length = values.length; i < length; i++) {
				this.baseWrite(values[i]);
			}
		}
	}),
	'object': Type({
		params: ['structure', 'proto'],
		resolve: function (getType) {
			var structure = {};
			for (var key in this.structure) {
				structure[key] =
					!(this.structure[key] instanceof Function)
					? getType(this.structure[key])
					: this.structure[key];
			}
			this.structure = structure;
		},
		read: function () {
			var self = this, structure = this.structure, output = this.proto ? inherit(this.proto) : {};
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
	'bitfield': Type({
		params: ['bitSize'],
		read: function () {
			return this.view.getUnsigned(this.bitSize);
		},
		write: function (value) {
			this.view.writeUnsigned(value, this.bitSize);
		}
	}),
	'if': Template({
		params: ['condition', 'trueType', 'falseType'],
		typeParams: ['trueType', 'falseType'],
		getBaseType: function (context) {
			return this.toValue(this.condition) ? this.trueType : this.falseType;
		}
	}),
	'if_not': Template({
		setParams: function (condition, falseType, trueType) {
			this.baseType = ['if', condition, trueType, falseType];
		}
	}),
	'const': Template({
		params: ['baseType', 'value', 'strict'],
		read: function () {
			var value = this.baseRead();
			if (this.strict && value !== this.value) {
				if (this.strict instanceof Function) {
					return this.strict(value);
				} else {
					throw new TypeError('Unexpected value.');
				}
			}
			return value;
		},
		write: function (value) {
			this.baseWrite((this.strict || value === undefined) ? this.value : value);
		}
	}),
	'skip': Type({
		params: ['length'],
		read: function () {
			this.view.skip(this.toValue(this.length));
		},
		write: function () {
			this.read();
		}
	}),
	'blob': Type({
		params: ['length'],
		read: function () {
			return this.view.getBytes(this.toValue(this.length));
		},
		write: function (bytes) {
			this.view.writeBytes(bytes, true);
		}
	}),
	'binary': Template({
		params: ['length', 'typeSet'],
		read: function () {
			var startPos = this.binary.tell();
			var endPos = this.binary.skip(this.toValue(this.length));
			var view = this.view.slice(startPos, endPos);
			return new jBinary(view, this.typeSet);
		},
		write: function (binary) {
			this.binary.write('blob', binary.read('blob', 0));
		}
	}),
	'lazy': Template({
		marker: 'jBinary.Lazy',
		params: ['innerType', 'length'],
		getBaseType: function () {
			return ['binary', this.length, this.binary.typeSet];
		},
		read: function () {
			var accessor = function (newValue) {
				if (arguments.length === 0) {
					// returning cached or resolving value
					return 'value' in accessor ? accessor.value : (accessor.value = accessor.binary.read(accessor.innerType));
				} else {
					// marking resolver as dirty for `write` method
					return extend(accessor, {
						wasChanged: true,
						value: newValue
					}).value;
				}
			};
			accessor[this.marker] = true;
			return extend(accessor, {
				binary: extend(this.baseRead(), {
					contexts: this.binary.contexts.slice()
				}),
				innerType: this.innerType
			});
		},
		write: function (accessor) {
			if (accessor.wasChanged || !accessor[this.marker]) {
				// resolving value if it was changed or given accessor is external
				this.binary.write(this.innerType, accessor());
			} else {
				// copying blob from original binary slice otherwise
				this.baseWrite(accessor.binary);
			}
		}
	})
};

proto.as = function (typeSet, modifyOriginal) {
	var binary = modifyOriginal ? this : inherit(this);
	typeSet = typeSet || proto.typeSet;
	binary.typeSet = (proto.typeSet === typeSet || proto.typeSet.isPrototypeOf(typeSet)) ? typeSet : inherit(proto.typeSet, typeSet);
	binary.cacheKey = proto.cacheKey;
	binary.cacheKey = binary._getCached(typeSet, function () { return proto.cacheKey + '.' + (++proto.id) }, true);
	return binary;
};

proto.seek = function (position, callback) {
	position = this.toValue(position);
	if (callback !== undefined) {
		var oldPos = this.view.tell();
		this.view.seek(position);
		var result = callback.call(this);
		this.view.seek(oldPos);
		return result;
	} else {
		return this.view.seek(position);
	}
};

proto.tell = function () {
	return this.view.tell();
};

proto.skip = function (offset, callback) {
	return this.seek(this.tell() + this.toValue(offset), callback);
};

proto.slice = function (start, end, forceCopy) {
	return new jBinary(this.view.slice(start, end, forceCopy), this.typeSet);
};

proto.getType = function (type, args) {
	switch (typeof type) {
		case 'string':
			if (!(type in this.typeSet)) {
				throw new ReferenceError('Unknown type `' + type + '`');
			}
			return this.getType(this.typeSet[type], args);

		case 'number':
			return this.getType(proto.typeSet.bitfield, [type]);

		case 'object':
			if (type instanceof jBinary.Type) {
				var binary = this;
				return type.inherit(args || [], function (type) { return binary.getType(type) });
			} else {
				var isArray = type instanceof Array;
				return this._getCached(
					type,
					(
						isArray
						? function (type) { return this.getType(type[0], type.slice(1)) }
						: function (structure) { return this.getType(proto.typeSet.object, [structure]) }
					),
					isArray
				);
			}
	}
};

proto.createProperty = function (type) {
	return this.getType(type).createProperty(this);
};

proto._action = function (type, offset, callback) {
	if (type === undefined) {
		return;
	}
	return offset !== undefined ? this.seek(offset, callback) : callback.call(this);
};

proto.read = function (type, offset) {
	return this._action(
		type,
		offset,
		function () { return this.createProperty(type).read(this.contexts[0]) }
	);
};

proto.readAll = function () {
	return this.read('jBinary.all', 0);
};

proto.write = function (type, data, offset) {
	return this._action(
		type,
		offset,
		function () {
			var start = this.tell();
			this.createProperty(type).write(data, this.contexts[0]);
			return this.tell() - start;
		}
	);
};

proto.writeAll = function (data) {
	return this.write('jBinary.all', data, 0);
};

(function (simpleType, dataTypes) {
	for (var i = 0, length = dataTypes.length; i < length; i++) {
		var dataType = dataTypes[i];
		proto.typeSet[dataType.toLowerCase()] = inherit(simpleType, {dataType: dataType});
	}
})(
	Type({
		params: ['littleEndian'],
		read: function () {
			return this.view['get' + this.dataType](undefined, this.littleEndian);
		},
		write: function (value) {
			this.view['write' + this.dataType](value, this.littleEndian);
		}
	}),
	[
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
	]
);

extend(proto.typeSet, {
	'byte': proto.typeSet.uint8,
	'float': proto.typeSet.float32,
	'double': proto.typeSet.float64
});

var _toURI =
	(BROWSER && 'URL' in global && 'createObjectURL' in URL)
	? function (type) {
		var data = this.seek(0, function () { return this.view.getBytes() });
		return URL.createObjectURL(new Blob([data], {type: type}));
	}
	: function (type) {
		var string = this.seek(0, function () { return this.view.getString(undefined, undefined, NODE && this.view._isNodeBuffer ? 'base64' : 'binary') });
		return 'data:' + type + ';base64,' + (NODE && this.view._isNodeBuffer ? string : btoa(string));
	};

proto.toURI = function (mimeType) {
	return _toURI.call(this, mimeType || this.typeSet['jBinary.mimeType'] || 'application/octet-stream');
};

var ReadableStream = NODE && require('stream').Readable;

jBinary.loadData = promising(function (source, callback) {
	var dataParts;

	if (BROWSER && 'Blob' in global && source instanceof Blob) {
		var reader = new FileReader();
		reader.onload = reader.onerror = function () { callback(this.error, this.result) };
		reader.readAsArrayBuffer(source);
	} else
	if (NODE && ReadableStream && source instanceof ReadableStream) {
		var buffers = [];
		source
			.on('readable', function () { buffers.push(this.read()) })
			.on('end', function () { callback(null, Buffer.concat(buffers)) })
			.on('error', callback)
		;
	} else
	if (typeof source !== 'string') {
		return callback(new TypeError('Unsupported source type.'));
	} else
	if (!!(dataParts = source.match(/^data:(.+?)(;base64)?,(.*)$/))) {
		try {
			var isBase64 = dataParts[2],
				content = dataParts[3];

			callback(
				null,
				(
					(isBase64 && NODE && jDataView.prototype.compatibility.NodeBuffer)
					? new Buffer(content, 'base64')
					: (isBase64 ? atob : decodeURIComponent)(content)
				)
			);
		} catch (e) {
			callback(e);
		}
	} else
	if (BROWSER && 'XMLHttpRequest' in global) {
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
				if (this.readyState === 4) {
					this.onload();
				}
			};
		}

		var cbError = function (string) {
			callback(new Error(string));
		};

		xhr.onload = function () {
			if (this.status !== 0 && this.status !== 200) {
				return cbError('HTTP Error #' + this.status + ': ' + this.statusText);
			}

			// emulating response field for IE9
			if (!('response' in this)) {
				this.response = new VBArray(this.responseBody).toArray();
			}

			callback(null, this.response);
		};

		xhr.onerror = function () {
			cbError('Network error.');
		};

		xhr.send(null);
	} else
	if (BROWSER) {
		return callback(new TypeError('Unsupported source type.'));
	} else
	if (NODE && /^(https?):\/\//.test(source)) {
		require('request').get({
			uri: source,
			encoding: null
		}, function (error, response, body) {
			if (!error && response.statusCode !== 200) {
				var statusText = require('http').STATUS_CODES[response.statusCode];
				error = new Error('HTTP Error #' + response.statusCode + ': ' + statusText);
			}
			callback(error, body);
		});
	} else
	if (NODE) {
		require('fs').readFile(source, callback);
	}
});

jBinary.load = promising(function (source, typeSet, callback) {
	if (typeof typeSet === 'function') {
		callback = typeSet;
		typeSet = undefined;
	}

	jBinary.loadData(source, function (err, data) {
		/* jshint expr: true */
		err ? callback(err) : callback(null, new jBinary(data, typeSet));
	});
});
return jBinary;

}));
