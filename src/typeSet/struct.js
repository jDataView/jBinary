import Type from '../Type';
import {namedFunc} from '../debug';
import {toString} from '../utils';

export var Struct = Type({
	params: ['structure', 'proto'],
	getDisplayName(name) {
		return name + toString(this.structure);
	},
	resolve(getType) {
		var structure = {};
		for (var key in this.structure) {
			structure[key] = !(this.structure[key] instanceof Function) ? getType(this.structure[key]) : this.structure[key];
		}
		this.structure = structure;
	},
	read() {
		var {binary, structure, proto} = this, output = proto ? inherit(proto) : {};

		binary.pushContext(output);
		for (var key in structure) {
			namedFunc(binary, () => {
				var value = !(structure[key] instanceof Function) ? binary.read(structure[key]) : structure[key].call(this, output);
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
				if (!(structure[key] instanceof Function)) {
					binary.write(structure[key], data[key]);
				} else {
					data[key] = structure[key].call(this, data);
				}
			}, '.' + key)();
		}
		binary.popContext(data);
	}
});
