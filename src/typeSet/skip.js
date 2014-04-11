defaultTypeSet.skip = Type({
	params: ['length'],
	read: function () {
		this.view.skip(this.toValue(this.length));
	},
	write: function () {
		this.read();
	}
});