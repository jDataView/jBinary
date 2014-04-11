var defineProperty = Object.defineProperty;

if (BROWSER) {
	if (defineProperty) {
		// this is needed to detect DOM-only version of Object.defineProperty in IE8:
		try {
			defineProperty({}, 'x', {});
		} catch (e) {
			defineProperty = undefined;
		}
	} else  {
		defineProperty = function (obj, key, descriptor, allowVisible) {
			if (allowVisible) {
				obj[key] = descriptor.value;
			}
		};
	}
}

var cacheKey = 'jBinary.Cache';
var cacheId = 0;

proto._getCached = function (obj, valueAccessor, allowVisible) {
	if (!obj.hasOwnProperty(this.cacheKey)) {
		var value = valueAccessor.call(this, obj);
		defineProperty(obj, this.cacheKey, {value: value}, allowVisible);
		return value;
	} else {
		return obj[this.cacheKey];
	}
};