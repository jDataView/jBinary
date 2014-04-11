defaultTypeSet.string = Template({
	params: ['length', 'encoding'],
	read: function () {
		return this.view.getString(this.toValue(this.length), undefined, this.encoding);
	},
	write: function (value) {
		this.view.writeString(value, this.encoding);
	}
});