defaultTypeSet['const'] = Template({
	params: ['baseType', 'value', 'strict'],
	read: function () {
		var value = this.baseRead();
		if (this.strict && value !== this.value) {
			if (is(this.strict, Function)) {
				return this.strict(value);
			} else {
				throw new TypeError('Unexpected value (' + value + ' !== ' + this.value + ').');
			}
		}
		return value;
	},
	write: function (value) {
		this.baseWrite(this.strict || value === undefined ? this.value : value);
	}
});