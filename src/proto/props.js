proto._getType = function (type, args) {
	switch (typeof type) {
		case 'string':
			if (!(type in this.typeSet)) {
				throw new ReferenceError('Unknown type: ' + type);
			}
			return this._getType(this.typeSet[type], args);

		case 'number':
			return this._getType(defaultTypeSet.bitfield, [type]);

		case 'object':
			if (is(type, Type.Base)) {
				if (args.length) {
					throw new TypeError('Can\'t pass arguments to preconfigured type.');
				}
				return type;
			} else {
				return this._getCached(type, (
					is(type, Array)
					? type => this.getType(type[0], type.slice(1))
					: structure => this.getType(defaultTypeSet.object, [structure])
				));
			}

		case 'function':
			type = new type(...args);
			type.resolveTypes(this.getType.bind(this));
			return type;
	}
};

proto.getType = function (type, args) {
	var resolvedType = this._getType(type, args || []);

	if (resolvedType && !is(type, Type.Base)) {
		resolvedType.name =
			typeof type === 'object'
			? (
				is(type, Array)
				? type[0] + '(' + type.slice(1).join(', ') + ')'
				: 'object'
			)
			: String(type);
	}

	return resolvedType;
};

proto._action = function (type, offset, _callback) {
	if (type === undefined) {
		return;
	}

	type = this.getType(type);

	var callback = this._named(function () {
		return _callback.call(this, type.createProperty(this), this.contexts[0]);
	}, '[' + type.name + ']', offset);

	return offset !== undefined ? this.seek(offset, callback) : callback.call(this);
};

proto.read = function (type, offset) {
	return this._action(type, offset, (prop, context) => prop.read(context));
};

proto.readAll = function () {
	return this.read('jBinary.all', 0);
};

proto.write = function (type, data, offset) {
	return this._action(type, offset, function (prop, context) {
		var start = this.tell();
		prop.write(data, context);
		return this.tell() - start;
	});
};

proto.writeAll = function (data) {
	return this.write('jBinary.all', data, 0);
};

