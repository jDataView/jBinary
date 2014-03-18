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
					throw new TypeError('Unexpected value (' + value + ' !== ' + this.value + ').');
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