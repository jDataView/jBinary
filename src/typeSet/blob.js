defaultTypeSet.blob = Type({
	params: ['length'],
	read: function () {
		return this.view.getBytes(this.toValue(this.length));
	},
	write: function (bytes) {
		this.view.writeBytes(bytes, true);
	}
});