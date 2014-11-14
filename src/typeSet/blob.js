defaultTypeSet.blob = Type({
	params: ['length'],
	read() {
		return this.view.getBytes(this.toValue(this.length));
	},
	write(bytes) {
		this.view.writeBytes(bytes, true);
	}
});