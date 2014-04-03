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