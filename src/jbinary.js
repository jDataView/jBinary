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
		function ClonedObject() {}
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
    var self = this;
    this.context = [];
    this.context.in = function (newContext, callback) {
        this.unshift(newContext);
        var result = callback.call(self);
        this.shift();
        return result;
    };
    this.context.getCurrent = function () { return this[0] };
    this.context.getParent = function () { return this[1] };
    this.context.findParent = function (filter) {
        for (var i = 0, length = this.length; i < length; i++) {
            var context = this[i];
            if (filter.call(self, context)) {
                return context;
            }
        }
    };
	this.structure = inherit(jBinary.prototype.structure, structure);
}

jBinary.Property = function (reader, writer, forceNew) {
	var property = forceNew ? function () { return reader.apply(this, arguments) } : reader;
	if (writer) {
		property.write = writer;
	}
	return property;
};

function toInt(val) {
	return val instanceof Function ? val.call(this) : val;
}

function calcStringLength() {
    var begin = this.tell();
    var end = this.seek(begin, function () {
        while (this.view.getUint8());
        return this.tell();
    }) - 1;
    return end - begin;
}

jBinary.prototype.structure = {
    extend: jBinary.Property(
        function (baseType) {
            var obj = this.parse(baseType);
            var parts = arguments;
            this.context.in(obj, function () {
                for (var i = 1, length = parts.length; i < length; i++) {
                    extend(obj, this.parse(parts[i]));
                }
            });
            return obj;
        },
        function () {
            var obj = arguments[arguments.length - 1];
            var parts = arguments;
            this.context.in(obj, function () {
                for (var i = 0, length = parts.length - 1; i < length; i++) {
                    this.write(parts[i], obj);
                }
            });
        }
    ),
    enum: jBinary.Property(
        function (basicType, matches) {
            var value = this.parse(basicType);
            if (value in matches) {
                value = matches[value];
            }
            return value;
        },
        function (basicType, matches, value) {
            for (var name in matches) {
                if (matches[name] === value) {
                    value = name;
                    break;
                }
            }
            this.write(basicType, value);
        }
    ),
    bool: ['enum', false, true],
    string: jBinary.Property(
		function (length) {
            var string = this.view.getString(toInt.call(this, length !== undefined ? length : calcStringLength));
            if (length === undefined) {
                this.skip(1);
            }
            return string;
        },
		function (length, subString) {
            if (length !== undefined) {
                length = toInt.call(this, length);
                if (subString.length > length) {
                    subString = subString.slice(0, length);
                } else
                if (subString.length < length) {
                    subString += String.fromCharCode.apply(null, new Array(length - subString.length));
                }
            }

			this.view.writeString(subString);
		}
	),
	array: jBinary.Property(
		function (type, length) {
			length = toInt.call(this, length);
			var results = new Array(length);
			for (var i = 0; i < length; ++i) {
				results[i] = this.parse(type);
			}
			return results;
		},
		function (type, length, values) {
			for (var i = 0; i < length; i++) {
				this.write(type, values[i]);
			}
		}
	),
    object: jBinary.Property(
        function (structure) {
            var output = {};
            this.context.in(output, function () {
                for (var key in structure) {
                    var value = this.parse(structure[key]);
                    // skipping undefined call results (useful for 'if' statement)
                    if (value !== undefined) {
                        output[key] = value;
                    }
                }
            });
            return output;
        },
        function (structure, data) {
            this.context.in(data, function () {
                for (var key in structure) {
                    this.write(structure[key], data[key]);
                }
            });
        }
    ),
	bitfield: jBinary.Property(
		function (bitSize) {
			var fieldValue = 0;

			if (this._bitShift < 0 || this._bitShift >= 8) {
				var byteShift = this._bitShift >> 3; // Math.floor(_bitShift / 8)
				this.skip(byteShift);
				this._bitShift &= 7; // _bitShift + 8 * Math.floor(_bitShift / 8)
			}
			if (this._bitShift > 0 && bitSize >= 8 - this._bitShift) {
				fieldValue = this.view.getUint8() & ~(-1 << (8 - this._bitShift));
				bitSize -= 8 - this._bitShift;
				this._bitShift = 0;
			}
			while (bitSize >= 8) {
				fieldValue = this.view.getUint8() | (fieldValue << 8);
				bitSize -= 8;
			}
			if (bitSize > 0) {
				fieldValue = ((this.view.getUint8() >>> (8 - (this._bitShift + bitSize))) & ~(-1 << bitSize)) | (fieldValue << bitSize);
				this._bitShift += bitSize - 8; // passing negative value for next pass
			}

			return fieldValue;
		},
		function (bitSize, value) {
			if (this._bitShift < 0 || this._bitShift >= 8) {
				var byteShift = this._bitShift >> 3; // Math.floor(_bitShift / 8)
				this.skip(byteShift);
				this._bitShift &= 7; // _bitShift + 8 * Math.floor(_bitShift / 8)
			}
			if (this._bitShift > 0 && bitSize >= 8 - this._bitShift) {
				var pos = this.tell();
				var byte = this.view.getUint8(pos) & (-1 << (8 - this._bitShift));
				byte |= value >>> (bitSize - (8 - this._bitShift));
				this.view.setUint8(pos, byte);
				bitSize -= 8 - this._bitShift;
				this._bitShift = 0;
			}
			while (bitSize >= 8) {
				this.view.writeUint8((value >>> (bitSize - 8)) & 0xff);
				bitSize -= 8;
			}
			if (bitSize > 0) {
				var pos = this.tell();
				var byte = this.view.getUint8(pos) & ~(~(-1 << bitSize) << (8 - (this._bitShift + bitSize)));
				byte |= (value & ~(-1 << bitSize)) << (8 - (this._bitShift + bitSize));
				this.view.setUint8(pos, byte);
				this._bitShift += bitSize - 8; // passing negative value for next pass
			}
		}
	),
	seek: function (position, block) {
		position = toInt.call(this, position);
		if (block instanceof Function) {
			var old_position = this.view.tell();
			this.view.seek(position);
			var result = block.call(this);
			this.view.seek(old_position);
			return result;
		} else {
			return this.view.seek(position);
		}
	},
	tell: function () {
		return this.view.tell();
	},
	skip: function (offset) {
		offset = toInt.call(this, offset);
		this.view.seek(this.view.tell() + offset);
		return offset;
	}
};

function conditionalMethod(method) {
	return function (predicate) {
		if (predicate instanceof Function ? predicate.call(this) : predicate) {
			return this[method].apply(this, Array.prototype.slice.call(arguments, 1));
		}
	};
}

jBinary.prototype.structure.if = jBinary.Property(
	conditionalMethod('parse'),
	conditionalMethod('write')
);

var dataTypes = [
	'Uint8',
	'Uint16',
	'Uint32',
	'Int8',
	'Int16',
	'Int32',
	'Float32',
	'Float64',
	'Char'
];

function dataMethod(method, type) {
	return function (value) {
		return this.view[method + type](value);
	};
}

for (var i = 0; i < dataTypes.length; i++) {
	var dataType = dataTypes[i];
	jBinary.prototype.structure[dataType.toLowerCase()] = jBinary.Property(
		dataMethod('get', dataType),
		dataMethod('write', dataType)
	);
}

jBinary.prototype.seek = jBinary.prototype.structure.seek;
jBinary.prototype.tell = jBinary.prototype.structure.tell;
jBinary.prototype.skip = jBinary.prototype.structure.skip;

jBinary.prototype.parse = function (structure) {
    switch (typeof structure) {
        case 'string':
            structure = this.structure[structure];
            return this.parse.apply(this, arguments);

        case 'function':
            return structure.apply(this, Array.prototype.slice.call(arguments, 1));

        case 'number':
            structure = ['bitfield', structure];

        case 'object':
            if (!(structure instanceof Array)) {
                structure = ['object', structure];
            }
            return this.parse.apply(this, structure);

        default:
            throw new Error("Unknown structure type `" + structure + "`");
    }
};

jBinary.prototype.write = function (structure, data) {
    switch (typeof structure) {
        case 'string':
            structure = this.structure[structure];
            return this.write.apply(this, arguments);

        case 'function':
            return (structure.write || structure).apply(this, Array.prototype.slice.call(arguments, 1));

        case 'number':
            structure = ['bitfield', structure];

        case 'object':
            if (!(structure instanceof Array)) {
                structure = ['object', structure];
            }
            return this.write.apply(this, structure.concat([data]));

        default:
            throw new Error("Unknown structure type `" + structure + "`");
    }
};

jBinary.prototype.modify = function (structure, callback) {
	var data = this.seek(this.tell(), function () {
		return this.parse(structure);
	});
	var newData = callback(data);
	if (newData === undefined) {
		newData = data;
	}
	this.write(structure, newData);
	return newData;
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
