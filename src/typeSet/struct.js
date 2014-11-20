import Type from '../Type';
import {namedFunc} from '../debug';
import {is, toString} from '../utils';

export var Struct = Type({
	params: ['structure', 'proto'],
	getDisplayName(name) {
		return name + toString(this.structure);
	},
	resolve(getType) {
		var structure = {};
		for (var key in this.structure) {
			var value = this.structure[key];
			structure[key] = !is(value, Function) ? getType(value) : value;
		}
		this.structure = structure;
	},
	read() {
		var {binary, structure, proto} = this, output = proto ? inherit(proto) : {};

		binary.pushContext(output);
		for (var key in structure) {
			namedFunc(binary, () => {
				var value = structure[key];
				value = !is(value, Function) ? binary.read(value) : value.call(this, output);
				if (value !== undefined) {
					output[key] = value;
				}
			}, '.' + key)();
		}
		binary.popContext();

		return output;
	},
	write(data) {
		var {binary, structure} = this;

		binary.pushContext(data);
		for (var key in structure) {
			namedFunc(binary, () => {
				var value = structure[key];
				if (!is(value, Function)) {
					binary.write(value, data[key]);
				} else {
					data[key] = value.call(this, data);
				}
			}, '.' + key)();
		}
		binary.popContext(data);
	}
});
