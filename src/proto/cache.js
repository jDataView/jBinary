proto.cache = new WeakMap();

proto._getCached = function (obj, valueAccessor) {
	if (!this.cache.has(obj)) {
		var value = valueAccessor(obj);
		this.cache.set(obj, value);
		return value;
	} else {
		return this.cache.get(obj);
	}
};
