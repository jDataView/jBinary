export function isDebugEnabled() {
	return (NODE && process.env.NODE_ENV === 'development') || !!global.DEBUG;
};

export function namedFunc(binary, func, name, offset = binary.tell()) {
	if (isDebugEnabled()) {
		func.displayName = name + ' @ ' + offset;
	}
	return func;
};
