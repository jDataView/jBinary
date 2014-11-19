var globalCache = new WeakMap();

function getCached(cache, key, valueAccessor) {
	var value = cache.get(key);
	if (!value) {
		value = valueAccessor(key);
		cache.set(key, value);
	}
	return value;
}

export default function (store, key, valueAccessor) {
	var cache = getCached(globalCache, store, () => new WeakMap());
	return getCached(cache, key, valueAccessor);
};
