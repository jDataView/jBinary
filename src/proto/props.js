import {namedFunc} from '../debug';

function action(binary, type, offset, callback) {
	if (type === undefined) {
		return;
	}

	type = binary.getType(type);

	callback = namedFunc(binary, callback, type.displayName, offset);
	var prop = type.createProperty(binary);
	var context = binary.contexts[0];

	return offset !== undefined ? binary.seek(offset, () => callback(prop, context)) : callback(prop, context);
}

export function read(type, offset) {
	return action(this, type, offset, (prop, context) => prop.read(context));
};

export function readAll() {
	return this.read('jBinary.all', 0);
};

export function write(type, data, offset) {
	return action(this, type, offset, (prop, context) => {
		var start = this.tell();
		prop.write(data, context);
		return this.tell() - start;
	});
};

export function writeAll(data) {
	return this.write('jBinary.all', data, 0);
};
