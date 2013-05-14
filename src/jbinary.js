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

jBinary.Property = function (init, read, write) {
    var property = function (binary, args) {
        this.binary = binary;
        if (init instanceof Function) {
            init.apply(this, args);
        } else
        if (init instanceof Array) {
            for (var i = 0, length = init.length; i < length; i++) {
                this[init[i]] = args[i];
            }
        }
    };
    property.prototype = inherit(jBinary.Property.prototype);
	property.prototype.read = read;
    property.prototype.write = write;
	return property;
};

function toValue(prop, val) {
	return val instanceof Function ? val.call(prop) : val;
}

function uint64(lo, hi) {
	this.lo = lo;
	this.hi = hi;
}

uint64.prototype = {
	valueOf: function () {
		return this.lo + Math.pow(2, 32) * this.hi;
	},
	toString: function () {
		return Number.prototype.toString.apply(this.valueOf(), arguments);
	}
};

jBinary.prototype.structure = {
    extend: jBinary.Property(
        function () {
            this.parts = arguments;
        },
        function () {
            var parts = this.parts, obj = this.binary.read(parts[0]);
            this.binary.context.in(obj, function () {
                for (var i = 1, length = parts.length; i < length; i++) {
                    extend(obj, this.read(parts[i]));
                }
            });
            return obj;
        },
        function (obj) {
            var parts = this.parts;
            this.binary.context.in(obj, function () {
                for (var i = 0, length = parts.length; i < length; i++) {
                    this.write(parts[i], obj);
                }
            });
        }
    ),
    enum: jBinary.Property(
        ['basicType', 'matches'],
        function () {
            var value = this.binary.read(this.basicType);
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
            this.binary.write(basicType, value);
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
		function (subString) {
            if (this.length !== undefined) {
                var length = toValue(this, this.length);
                if (subString.length > length) {
                    subString = subString.slice(0, length);
                } else
                if (subString.length < length) {
                    subString += String.fromCharCode.apply(null, new Array(length - subString.length));
                }
                this.binary.view.writeString(subString);
            } else {
                this.binary.view.writeString(subString);
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
            var structure = this.structure, output = {};
            this.binary.context.in(output, function () {
                for (var key in structure) {
                    var value = this.read(structure[key]);
                    // skipping undefined call results (useful for 'if' statement)
                    if (value !== undefined) {
                        output[key] = value;
                    }
                }
            });
            return output;
        },
        function (data) {
            var structure = this.structure;
            this.binary.context.in(data, function () {
                for (var key in structure) {
                    this.write(structure[key], data[key]);
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
    if: jBinary.Property(
        ['condition', 'type'],
        function () {
            if (toValue(this, this.condition)) return this.binary.read(type);
        },
        function (value) {
            if (toValue(this, this.condition)) return this.binary.write(type, value);
        }
    ),
    const: jBinary.Property(
        ['type', 'value', 'strict'],
        function () {
            var value = this.binary.read(this.type);
            if (this.strict && value != toValue(this, this.value)) throw new TypeError('Unexpected value.');
            return value;
        },
        function (value) {
            if (this.strict && value != toValue(this, this.value)) throw new TypeError('Trying to write unexpected value.');
            this.binary.write(value);
        }
    ),
    skip: jBinary.Property(
        ['length'],
        function () {
            this.binary.skip(toValue(this, toValue(this, this.length)));
        },
        function (value) {
            var length = toValue(this, this.length);
            while (length--) {
                this.binary.view.writeUint8(0);
            }
        }
    ),
    lazy: jBinary.Property(
        ['type', 'size'],
        function () {
            var offset = this.parser.tell(), self = this;
            this.size !== undefined ? this.parser.skip(this.size) : this.parser.read(this.type);
            return function () {
                if (!('value' in self)) {
                    self.value = self.parser.seek(offset, function () {
                        return this.read(self.type);
                    });
                }
                return self.value;
            };
        },
        function (getValue) {
            this.parser.write(this.type, getValue());
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

jBinary.prototype.skip = function (offset) {
    offset = toValue(this, offset);
    this.view.seek(this.view.tell() + offset);
    return offset;
};

jBinary.prototype.getType = function (structure) {
    switch (typeof structure) {
        case 'string':
            structure = this.structure[structure];
            return this.getType.apply(this, arguments);

        case 'function':
            return new structure(this, Array.prototype.slice.call(arguments, 1));

        case 'number':
            structure = ['bitfield', structure];

        case 'object':
            if (!(structure instanceof Array)) {
                structure = ['object', structure];
            }
            return this.getType.apply(this, structure);

        default:
            throw new Error("Unknown structure type `" + structure + "`");
    }
};

jBinary.prototype.read = function (structure) {
    return this.getType(structure).read();
};

jBinary.prototype.write = function (structure, data) {
    this.getType(structure).write(data);
};

jBinary.prototype.modify = function (structure, callback) {
	var data = this.seek(this.tell(), function () {
		return this.read(structure);
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
