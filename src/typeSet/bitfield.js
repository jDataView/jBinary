import Type from '../Type';

export var Bitfield = Type({
	params: ['bitSize'],
	read() {
		return this.view.getUnsigned(this.bitSize);
	},
	write(value) {
		this.view.writeUnsigned(value, this.bitSize);
	}
});
