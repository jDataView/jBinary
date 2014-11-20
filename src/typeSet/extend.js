import Type from '../Type';
import {extend} from '../utils';

export var Extend = Type({
	setParams(...parts) {
		this.parts = parts;
	},
	resolve(getType) {
		this.parts = this.parts.map(getType).filter(Boolean);
	},
	getDisplayName() {
		return this.parts.map(part => part.displayName).join('+');
	},
	read() {
		var {binary, parts} = this;
		var obj = binary.read(parts[0]);
		binary.pushContext(obj);
		for (var i = 1; i < parts.length; i++) {
			extend(obj, binary.read(parts[i]));
		}
		binary.popContext();
		return obj;
	},
	write(obj) {
		var {binary, parts} = this;
		binary.pushContext(obj);
		for (var i = 0; i < parts.length; i++) {
			binary.write(parts[i], obj);
		}
		binary.popContext();
	}
});
