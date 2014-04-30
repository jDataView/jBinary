function jBinary(view, typeSet) {
	if (is(view, jBinary)) {
		return view.as(typeSet);
	}

	/* jshint validthis:true */
	if (!is(view, jDataView)) {
		view = new jDataView(view, undefined, undefined, typeSet ? typeSet['jBinary.littleEndian'] : undefined);
	}

	if (!is(this, jBinary)) {
		return new jBinary(view, typeSet);
	}

	this.view = view;
	this.view.seek(0);
	this.contexts = [];

	return this.as(typeSet, true);
}

var proto = jBinary.prototype;

var defaultTypeSet = proto.typeSet = {};

proto.toValue = function (value) {
	return toValue(this, this, value);
};

proto._named = function (func, name, offset) {
	func.displayName = name + ' @ ' + (offset !== undefined ? offset : this.view.tell());
	return func;
};