defaultTypeSet.skip = Type({
	params: ['length'],
	read() {
		this.view.skip(this.toValue(this.length));
	},
	write() {
		this.read();
	}
});