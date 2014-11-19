import Template from '../Template';

export var Const = Template({
	params: ['baseType', 'value', 'strict'],
	read() {
		var value = this.baseRead();
		if (this.strict && value !== this.value) {
			if (this.strict instanceof Function) {
				return this.strict(value);
			} else {
				throw new TypeError('Unexpected value (' + value + ' !== ' + this.value + ').');
			}
		}
		return value;
	},
	write(value) {
		this.baseWrite(this.strict || value === undefined ? this.value : value);
	}
});
