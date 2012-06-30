(function () {

if (typeof jDataView === 'undefined' && typeof require !== 'undefined') {
	jDataView = require('jDataView');
}


// Extend code from underscorejs
var extend = function (obj) {
	for (var i = 1; i < arguments.length; ++i) {
		var source = arguments[i];
		for (var prop in source) {
			if (source[prop] !== undefined) {
				obj[prop] = source[prop];
			}
		}
	}
	return obj;
};

function jParser(view, structure) {
	if (!(this instanceof arguments.callee)) {
		throw new Error("Constructor may not be called as a function");
	}
	if (!(view instanceof jDataView)) {
		view = new jDataView(view, undefined, undefined, true);
	}
	this.view = view;
	this.view.seek(0);
	this.structure = extend({}, jParser.prototype.structure, structure);
}

function toInt(val) {
	if (typeof val === 'function') {
		val = val.call(this);
	}
	return val;
}

jParser.prototype.structure = {
	uint8: function () { return this.view.getUint8(); },
	uint16: function () { return this.view.getUint16(); },
	uint32: function () { return this.view.getUint32(); },
	int8: function () { return this.view.getInt8(); },
	int16: function () { return this.view.getInt16(); },
	int32: function () { return this.view.getInt32(); },
	float32: function () { return this.view.getFloat32(); },
	float64: function () { return this.view.getFloat64(); },
	char: function () { return this.view.getChar(); },
	string: function (length) {
		return this.view.getString(toInt.call(this, length));
	},
	array: function (type, length) {
		length = toInt.call(this, length);
		var results = [];
		for (var i = 0; i < length; ++i) {
			results.push(this.parse(type));
		}
		return results;
	},
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

jParser.prototype.seek = jParser.prototype.structure.seek;
jParser.prototype.tell = jParser.prototype.structure.tell;
jParser.prototype.skip = jParser.prototype.structure.skip;

jParser.prototype.parse = function (structure) {
	// f, 1, 2 means f(1, 2)
	if (structure instanceof Function) {
		return structure.apply(this, Array.prototype.slice.call(arguments, 1));
	}

	// 'int32' is a shortcut for ['int32']
	if (typeof structure === 'string') {
		structure = [structure];
	}

	// ['string', 256] means structure['string'](256)
	if (structure instanceof Array) {
		var key = structure[0];
		if (!(key in this.structure)) {
			throw new Error("Missing structure for `" + key + "`");
		}
		return this.parse.apply(this, [this.structure[key]].concat(structure.slice(1)));
	}

    // {key: val} means {key: parse(val)}
	if (typeof structure === 'object') {
		var output = {};
		for (var key in structure) {
			this.current = output;
			output[key] = this.parse(structure[key]);
		}
		return output;
	}

	throw new Error("Unknown structure type `" + structure + "`");
};


var all;
if (typeof self !== 'undefined') {
	all = self;
} else if (typeof window !== 'undefined') {
	all = window;
} else if (typeof global !== 'undefined') {
	all = global;
}
// Browser + Web Worker
all.jParser = jParser;
// NodeJS + NPM
if (typeof module !== 'undefined') {
	module.exports = jParser;
}

})();
