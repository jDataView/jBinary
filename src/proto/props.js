proto.getType = function (type, args) {
	switch (typeof type) {
		case 'string':
			if (!(type in this.typeSet)) {
				throw new ReferenceError('Unknown type: ' + type);
			}
			return this.getType(this.typeSet[type], args);

		case 'number':
			return this.getType(defaultTypeSet.bitfield, [type]);

		case 'object':
			if (is(type, Type)) {
				var binary = this;
				return type.inherit(args || [], function (type) { return binary.getType(type) });
			} else {
				return (
					is(type, Array)
					? this._getCached(type, function (type) { return this.getType(type[0], type.slice(1)) }, true)
					: this._getCached(type, function (structure) { return this.getType(defaultTypeSet.object, [structure]) }, false)
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

