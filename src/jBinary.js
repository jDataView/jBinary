(function (global) {

'use strict';

// https://github.com/davidchambers/Base64.js (modified)
if (!('atob' in global) || !('btoa' in global)) {
// jshint:skipline
(function(){var t=global,r="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",n=function(){try{document.createElement("$")}catch(t){return t}}();t.btoa||(t.btoa=function(t){for(var o,e,a=0,c=r,f="";t.charAt(0|a)||(c="=",a%1);f+=c.charAt(63&o>>8-8*(a%1))){if(e=t.charCodeAt(a+=.75),e>255)throw n;o=o<<8|e}return f}),t.atob||(t.atob=function(t){if(t=t.replace(/=+$/,""),1==t.length%4)throw n;for(var o,e,a=0,c=0,f="";e=t.charAt(c++);~e&&(o=a%4?64*o+e:e,a++%4)?f+=String.fromCharCode(255&o>>(6&-2*a)):0)e=r.indexOf(e);return f})})();
}


// http://cdnjs.cloudflare.com/ajax/libs/json2/20110223/json2.min.js
if (!('JSON' in global)) {
// jshint:skipline
JSON={};(function(){function k(a){return a<10?"0"+a:a}function o(a){p.lastIndex=0;return p.test(a)?'"'+a.replace(p,function(a){var c=r[a];return typeof c==="string"?c:"\\u"+("0000"+a.charCodeAt(0).toString(16)).slice(-4)})+'"':'"'+a+'"'}function l(a,j){var c,d,h,m,g=e,f,b=j[a];b&&typeof b==="object"&&typeof b.toJSON==="function"&&(b=b.toJSON(a));typeof i==="function"&&(b=i.call(j,a,b));switch(typeof b){case "string":return o(b);case "number":return isFinite(b)?String(b):"null";case "boolean":case "null":return String(b);case "object":if(!b)return"null";e+=n;f=[];if(Object.prototype.toString.apply(b)==="[object Array]"){m=b.length;for(c=0;c<m;c+=1)f[c]=l(c,b)||"null";h=f.length===0?"[]":e?"[\n"+e+f.join(",\n"+e)+"\n"+g+"]":"["+f.join(",")+"]";e=g;return h}if(i&&typeof i==="object"){m=i.length;for(c=0;c<m;c+=1)typeof i[c]==="string"&&(d=i[c],(h=l(d,b))&&f.push(o(d)+(e?": ":":")+h))}else for(d in b)Object.prototype.hasOwnProperty.call(b,d)&&(h=l(d,b))&&f.push(o(d)+(e?": ":":")+h);h=f.length===0?"{}":e?"{\n"+e+f.join(",\n"+e)+"\n"+g+"}":"{"+f.join(",")+"}";e=g;return h}}if(typeof Date.prototype.toJSON!=="function")Date.prototype.toJSON=function(){return isFinite(this.valueOf())?this.getUTCFullYear()+"-"+k(this.getUTCMonth()+1)+"-"+k(this.getUTCDate())+"T"+k(this.getUTCHours())+":"+k(this.getUTCMinutes())+":"+k(this.getUTCSeconds())+"Z":null},String.prototype.toJSON=Number.prototype.toJSON=Boolean.prototype.toJSON=function(){return this.valueOf()};var q=/[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,p=/[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,e,n,r={"\u0008":"\\b","\t":"\\t","\n":"\\n","\u000c":"\\f","\r":"\\r",'"':'\\"',"\\":"\\\\"},i;if(typeof JSON.stringify!=="function")JSON.stringify=function(a,j,c){var d;n=e="";if(typeof c==="number")for(d=0;d<c;d+=1)n+=" ";else typeof c==="string"&&(n=c);if((i=j)&&typeof j!=="function"&&(typeof j!=="object"||typeof j.length!=="number"))throw Error("JSON.stringify");return l("",{"":a})};if(typeof JSON.parse!=="function")JSON.parse=function(a,e){function c(a,d){var g,f,b=a[d];if(b&&typeof b==="object")for(g in b)Object.prototype.hasOwnProperty.call(b,g)&&(f=c(b,g),f!==void 0?b[g]=f:delete b[g]);return e.call(a,d,b)}var d,a=String(a);q.lastIndex=0;q.test(a)&&(a=a.replace(q,function(a){return"\\u"+("0000"+a.charCodeAt(0).toString(16)).slice(-4)}));if(/^[\],:{}\s]*$/.test(a.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,"@").replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,"]").replace(/(?:^|:|,)(?:\s*\[)+/g,"")))return d=eval("("+a+")"),typeof e==="function"?c({"":d},""):d;throw new SyntaxError("JSON.parse");}})();
}

var hasRequire = typeof require === 'function';

var jDataView;

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
	arguments[0] = _inherit(obj);
	return extend.apply(null, arguments);
}

function toValue(obj, binary, value) {
	return value instanceof Function ? value.call(obj, binary.contexts[0]) : value;
}

function jBinary(view, typeSet) {
	/* jshint validthis:true */
	var config = typeSet && typeSet.jBinary ? typeSet.jBinary : {};

	if (!(view instanceof jDataView)) {
		view = new jDataView(view, undefined, undefined, config.littleEndian);
	}
	
	if (!(this instanceof jBinary)) {
		return new jBinary(view, typeSet);
	}
	
	this.view = view;
	this.view.seek(0);
	this._bitShift = 0;
	this.contexts = [];
	
	if (typeSet) {
		this.typeSet = inherit(proto.typeSet, typeSet);
		this.cacheKey = this._getCached(typeSet, function () { return proto.cacheKey + '.' + (++proto.id) }, true);
	}
}

var proto = jBinary.prototype;

proto.cacheKey = 'jBinary.Cache';
proto.id = 0;

var defineProperty = Object.defineProperty;

if (defineProperty) {
	// this is needed to detect broken Object.defineProperty in IE8:
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

proto._getCached = function (obj, valueAccessor, allowVisible) {
	if (!obj.hasOwnProperty(this.cacheKey)) {
		var value = valueAccessor.call(this, obj);
		defineProperty(obj, this.cacheKey, {value: value}, allowVisible);
		return value;
	} else {
		return obj[this.cacheKey];
	}
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

jBinary.Type = function (config) {
	return inherit(jBinary.Type.prototype, config);
};

jBinary.Type.prototype = {
	inherit: function (args, getType) {
		if (!this.setParams && !this.resolve && (!this.params || args.length === 0)) {
			return this;
		}

		var type = inherit(this);
		if (type.params) {
			for (var i = 0, length = Math.min(type.params.length, args.length); i < length; i++) {
				type[this.params[i]] = args[i];
			}
			type.params = null;
		}
		if (type.setParams) {
			type.setParams.apply(type, args || []);
			type.setParams = null;
		}
		if (type.resolve) {
			type.resolve(getType);
			type.resolve = null;
		}
		return type;
	},
	createProperty: function (binary) {
		return inherit(this, {binary: binary});
	},
	toValue: function (val, allowResolve) {
		if (allowResolve !== false && typeof val === 'string') {
			return this.binary.getContext(val)[val];
		}
		return toValue(this, this.binary, val);
	}
};

jBinary.Template = function (config) {
	return inherit(jBinary.Template.prototype, config, {
		createProperty: function (binary) {
			var property = (config.createProperty || jBinary.Template.prototype.createProperty).apply(this, arguments);
			if (property.getBaseType) {
				property.baseType = property.binary.getType(property.getBaseType(property.binary.contexts[0]));
			}
			return property;
		}
	});
};

jBinary.Template.prototype = inherit(jBinary.Type.prototype, {
	resolve: function (getType) {
		if (this.baseType) {
			this.baseType = getType(this.baseType);
		}
	},
	baseRead: function () {
		return this.binary.read(this.baseType);
	},
	baseWrite: function (value) {
		return this.binary.write(this.baseType, value);
	}
});
jBinary.Template.prototype.read = jBinary.Template.prototype.baseRead;
jBinary.Template.prototype.write = jBinary.Template.prototype.baseWrite;

proto.typeSet = {
	'extend': jBinary.Type({
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
	'enum': jBinary.Template({
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
	'string': jBinary.Template({
		params: ['length', 'encoding'],
		read: function () {
			return this.binary.view.getString(this.toValue(this.length), undefined, this.encoding);
		},
		write: function (value) {
			this.binary.view.writeString(value, this.encoding);
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
			var view = this.binary.view, zeroLength = this.length === undefined ? 1 : this.length - value.length;
			view.writeString(value, undefined, this.encoding);
			if (zeroLength > 0) {
				view.writeUint8(0);
				view.skip(zeroLength - 1);
			}
		}
	}),
	'array': jBinary.Template({
		params: ['baseType', 'length'],
		read: function (context) {
			var length = this.toValue(this.length);
			if (this.baseType === proto.typeSet.uint8) {
				return this.binary.view.getBytes(length, undefined, true, true);
			}
			var results;
			if (length !== undefined) {
				results = new Array(length);
				for (var i = 0; i < length; i++) {
					results[i] = this.baseRead(context);
				}
			} else {
				var end = this.binary.view.byteLength;
				results = [];
				while (this.binary.tell() < end) {
					results.push(this.baseRead(context));
				}
			}
			return results;
		},
		write: function (values, context) {
			if (this.baseType === proto.typeSet.uint8) {
				return this.binary.view.writeBytes(values);
			}
			for (var i = 0, length = values.length; i < length; i++) {
				this.baseWrite(values[i], context);
			}
		}
	}),
	'object': jBinary.Type({
		params: ['structure'],
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

			return fieldValue >>> 0;
		},
		write: function (value) {
			var bitSize = this.bitSize,
				binary = this.binary,
				pos,
				curByte;

			if (binary._bitShift < 0 || binary._bitShift >= 8) {
				var byteShift = binary._bitShift >> 3; // Math.floor(_bitShift / 8)
				binary.skip(byteShift);
				binary._bitShift &= 7; // _bitShift + 8 * Math.floor(_bitShift / 8)
			}
			if (binary._bitShift > 0 && bitSize >= 8 - binary._bitShift) {
				pos = binary.tell();
				curByte = binary.view.getUint8(pos) & (-1 << (8 - binary._bitShift));
				curByte |= value >>> (bitSize - (8 - binary._bitShift));
				binary.view.setUint8(pos, curByte);
				bitSize -= 8 - binary._bitShift;
				binary._bitShift = 0;
			}
			while (bitSize >= 8) {
				binary.view.writeUint8((value >>> (bitSize - 8)) & 0xff);
				bitSize -= 8;
			}
			if (bitSize > 0) {
				pos = binary.tell();
				curByte = binary.view.getUint8(pos) & ~(~(-1 << bitSize) << (8 - (binary._bitShift + bitSize)));
				curByte |= (value & ~(-1 << bitSize)) << (8 - (binary._bitShift + bitSize));
				binary.view.setUint8(pos, curByte);
				binary._bitShift += bitSize - 8; // passing negative value for next pass
			}
		}
	}),
	'if': jBinary.Template({
		params: ['condition', 'trueType', 'falseType'],
		resolve: function (getType) {
			this.trueType = getType(this.trueType);
			this.falseType = getType(this.falseType);
		},
		getBaseType: function (context) {
			return this.toValue(this.condition) ? this.trueType : this.falseType;
		}
	}),
	'if_not': jBinary.Template({
		setParams: function (condition, falseType, trueType) {
			this.baseType = ['if', condition, trueType, falseType];
		}
	}),
	'const': jBinary.Template({
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
	'skip': jBinary.Type({
		setParams: function (length) {
			this.read = this.write = function () {
				this.binary.view.skip(this.toValue(length));
			};
		}
	}),
	'blob': jBinary.Type({
		params: ['length'],
		read: function () {
			return this.binary.view.getBytes(this.toValue(this.length));
		},
		write: function (bytes) {
			this.binary.view.writeBytes(bytes, true);
		}
	}),
	'binary': jBinary.Template({
		params: ['length', 'typeSet'],
		read: function () {
			var startPos = this.binary.tell();
			var endPos = this.binary.skip(this.toValue(this.length));
			var view = this.binary.view.slice(startPos, endPos);
			return new jBinary(view, this.typeSet);
		},
		write: function (binary) {
			this.binary.write('blob', binary instanceof jBinary ? binary.read('blob', 0) : binary);
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

var simpleType = jBinary.Type({
	params: ['littleEndian'],
	read: function () {
		return this.binary.view['get' + this.dataType](undefined, this.littleEndian);
	},
	write: function (value) {
		this.binary.view['write' + this.dataType](value, this.littleEndian);
	}
});

for (var i = 0, length = dataTypes.length; i < length; i++) {
	var dataType = dataTypes[i];
	proto.typeSet[dataType.toLowerCase()] = inherit(simpleType, {dataType: dataType});
}

extend(proto.typeSet, {
	'byte': proto.typeSet.uint8,
	'float': proto.typeSet.float32,
	'double': proto.typeSet.float64
});

proto.toValue = function (value) {
	return toValue(this, this, value);
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

proto.write = function (type, data, offset) {
	this._action(
		type,
		offset,
		function () { this.createProperty(type).write(data, this.contexts[0]) }
	);
};

proto._toURI =
	('URL' in global && 'createObjectURL' in URL)
	? function (type) {
		var data = this.seek(0, function () { return this.view.getBytes() });
		return URL.createObjectURL(new Blob([data], {type: type}));
	}
	: function (type) {
		var string = this.seek(0, function () { return this.view.getString(undefined, undefined, this.view._isNodeBuffer ? 'base64' : 'binary') });
		return 'data:' + type + ';base64,' + (this.view._isNodeBuffer ? string : btoa(string));
	};

proto.toURI = function (mimeType) {
	return this._toURI(mimeType || 'application/octet-stream');
};

proto.slice = function (start, end, forceCopy) {
	return new jBinary(this.view.slice(start, end, forceCopy), this.typeSet);
};

jBinary.load = function (source, typeSet, callback) {
	function withTypeSet(typeSet) {
		jBinary.loadData(source, function (err, data) {
			err ? callback(err) : callback(null, new jBinary(data, typeSet));
		});
	}

	if (arguments.length < 3) {
		callback = typeSet;
		var srcInfo;

		if ('Blob' in global && source instanceof Blob) {
			srcInfo = {mimeType: source.type};
			if (source instanceof File) {
				srcInfo.fileName = source.name;
			}
		} else
		if (typeof source === 'string') {
			var dataParts = source.match(/^data:(.+?)(;base64)?,/);
			srcInfo = dataParts ? {mimeType: dataParts[1]} : {fileName: source};
		}

		if (srcInfo) {
			repo.getAssociation(srcInfo, withTypeSet);
		} else {
			withTypeSet();
		}
	} else {
		typeof typeSet === 'string' ? repo(typeSet, withTypeSet) : withTypeSet(typeSet);
	}
};

jBinary.loadData = function (source, callback) {
	if ('Blob' in global && source instanceof Blob) {
		var reader = new FileReader();
		reader.onload = reader.onerror = function() { callback(this.error, this.result) };
		reader.readAsArrayBuffer(source);
	} else {
		if (typeof source === 'object') {
			if (hasRequire && source instanceof require('stream').Readable) {
				var buffers = [];

				source
				.on('readable', function () { buffers.push(this.read()) })
				.on('end', function () { callback(null, Buffer.concat(buffers)) })
				.on('error', callback);

				return;
			}
		}

		if (typeof source !== 'string') {
			return callback(new TypeError('Unsupported source type.'));
		}

		var dataParts = source.match(/^data:(.+?)(;base64)?,(.*)$/);
		if (dataParts) {
			var isBase64 = dataParts[2],
				content = dataParts[3];

			try {
				callback(
					null,
					(
						(isBase64 && jDataView.prototype.compatibility.NodeBuffer)
						? new Buffer(content, 'base64')
						: (isBase64 ? atob : decodeURIComponent)(content)
					)
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
					if (this.readyState === 4) {
						this.onload();
					}
				};
			}

			xhr.onload = function() {
				if (this.status !== 0 && this.status !== 200) {
					return callback(new Error('HTTP Error #' + this.status + ': ' + this.statusText));
				}

				// emulating response field for IE9
				if (!('response' in this)) {
					this.response = new VBArray(this.responseBody).toArray();
				}

				callback(null, this.response);
			};

			xhr.send();
		} else
		if (hasRequire) {
			if (/^(https?):\/\//.test(source)) {
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
			} else {
				require('fs').readFile(source, callback);
			}
		} else {
			callback(new TypeError('Unsupported source type.'));
		}
	}
};

var getScript = (function () {
	if ('window' in global && 'document' in global && document === window.document) {
		var head = document.head || document.getElementsByTagName('head')[0];

		return function (url, callback) {
			var script = document.createElement('script');
			script.src = url;
			script.defer = true;

			if (callback) {
				if ('onreadystatechange' in script) {
					script.onreadystatechange = function () {
						if (this.readyState === 'loaded' || this.readyState === 'complete') {
							this.onreadystatechange = null;

							// delay to wait until script is executed
							setTimeout(function () { callback.call(script) }, 0);
						}
					};

					script.onreadystatechange();
				} else {
					script.onload = script.onerror = callback;
				}
			}

			head.appendChild(script);
		};
	} else {
		var request = require('request');

		return function (url, callback) {
			request.get(url, function (error, response, body) {
				if (!error && response.statusCode === 200) {
					// yes, eval is evil, but we are in Node.js and in strict mode, so let's use this
					// jshint:skipline
					eval(body);
				}
				if (callback) {
					callback();
				}
			});
		};
	}
})();

// helper function for common callback from multiple sources
function whenAll(count, each, done) {
	var results = new Array(count);
	for (var i = 0; i < count; i++) {
		(function () {
			var index = i;
			each(index, function (result) {
				results[index] = result;
				if (--count === 0) {
					done(results);
				}
			});
		})();
	}
}

// "require"-like function+storage for standard file formats from https://github.com/jDataView/jBinary.Repo
var repo = jBinary.Repo = function (names, callback) {
	if (!(names instanceof Array)) {
		names = [names];
	}

	whenAll(names.length, function (i, callback) {
		var name = names[i], upperName = name.toUpperCase();

		if (upperName in repo) {
			callback(repo[upperName]);
		} else {
			getScript('https://rawgithub.com/jDataView/jBinary.Repo/gh-pages/$/$.js'.replace(/\$/g, name.toLowerCase()), function () {
				callback(repo[upperName]);
			});
		}
	}, function (typeSets) {
		callback.apply(repo, typeSets);
	});
};

repo.getAssociations = function (callback) {
	// lazy loading data by replacing `jBinary.Repo.getAssociations` itself
	getScript('https://rawgithub.com/jDataView/jBinary.Repo/gh-pages/associations.js', function () {
		repo.getAssociations(callback);
	});
};

repo.getAssociation =  function (source, _callback) {
	var callback = function (typeSetName) {
		repo(typeSetName, _callback);
	};

	repo.getAssociations(function (assoc) {
		if (source.fileName) {
			// extracting only longest extension part
			var longExtension = source.fileName.match(/^(.*\/)?.*?(\.|$)(.*)$/)[3].toLowerCase();

			if (longExtension) {
				var fileParts = longExtension.split('.');
				// trying everything from longest possible extension to shortest one
				for (var i = 0, length = fileParts.length; i < length; i++) {
					var extension = fileParts.slice(i).join('.'),
						typeSetName = assoc.extensions[extension];

					if (typeSetName) {
						return callback(typeSetName);
					}
				}
			}
		}
		if (source.mimeType) {
			var typeSetName = assoc.mimeTypes[source.mimeType];

			if (typeSetName) {
				return callback(typeSetName);
			}
		}
		_callback();
	});
};

if (typeof module === 'object' && module && typeof module.exports === 'object') {
	jDataView = require('jDataView');
	module.exports = jBinary;
} else
if (typeof define === 'function' && define.amd) {
	define('jBinary', ['jDataView'], function (_jDataView) {
		jDataView = _jDataView;
		return jBinary;
	});
} else {
	jDataView = global.jDataView;
	global.jBinary = jBinary;
}

jDataView.prototype.toBinary = function (typeSet) {
	return new jBinary(this, typeSet);
};

})((function () { /* jshint strict: false */ return this })());
