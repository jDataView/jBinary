import Type from '../Type';

export var FixedString = Type({
	params: ['length', 'encoding'],
	read() {
		return this.view.getString(this.toValue(this.length), undefined, this.encoding);
	},
	write(value) {
		this.view.writeString(value, this.encoding);
	}
});
