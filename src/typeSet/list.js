import Template from '../Template';
import {Uint8} from './';

export var List = Template({
	params: ['baseType', 'length'],
	getDisplayName() {
		return this.baseType.displayName + '[' + (this.length === undefined ? '' : this.length) + ']';
	},
	read() {
		var length = this.toValue(this.length);
		if (this.baseType instanceof Uint8) {
			return this.view.getBytes(length, undefined, true, true);
		}
		var results;
		if (length !== undefined) {
			results = new Array(length);
			for (var i = 0; i < length; i++) {
				results[i] = this.baseRead();
			}
		} else {
			results = [];
			while (!this.binary.eof()) {
				results.push(this.baseRead());
			}
		}
		return results;
	},
	write(values) {
		if (this.baseType instanceof Uint8) {
			return this.view.writeBytes(values);
		}
		for (var i = 0; i < values.length; i++) {
			this.baseWrite(values[i]);
		}
	}
});
