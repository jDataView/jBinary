import Type from '../Type';

export var Skip = Type({
	params: ['length'],
	read() {
		this.view.skip(this.toValue(this.length));
	},
	write() {
		this.read();
	}
});
