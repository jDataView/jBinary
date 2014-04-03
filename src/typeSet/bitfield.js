defaultTypeSet.bitfield = Type({
	params: ['bitSize'],
	read: function () {
		return this.view.getUnsigned(this.bitSize);
	},
	write: function (value) {
		this.view.writeUnsigned(value, this.bitSize);
	}
});