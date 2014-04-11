proto.as = function (typeSet, modifyOriginal) {
	var binary = modifyOriginal ? this : inherit(this);
	typeSet = typeSet || defaultTypeSet;
	binary.typeSet = (typeSet === defaultTypeSet || defaultTypeSet.isPrototypeOf(typeSet)) ? typeSet : inherit(defaultTypeSet, typeSet);
	binary.cacheKey = cacheKey;
	binary.cacheKey = binary._getCached(typeSet, function () { return cacheKey + '.' + (++cacheId) }, true);
	return binary;
};