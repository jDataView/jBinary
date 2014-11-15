proto.as = function (typeSet, modifyOriginal) {
	if (!typeSet) {
		typeSet = defaultTypeSet;
	}
	if (typeSet !== defaultTypeSet && !defaultTypeSet.isPrototypeOf(typeSet)) {
		typeSet = inherit(defaultTypeSet, typeSet);
	}
	return (modifyOriginal ? extend : inherit)(this, {
		typeSet,
		cache: new WeakMap()
	});
};
