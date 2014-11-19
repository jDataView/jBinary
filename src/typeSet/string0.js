import Type from '../Type';

export var String0 = Type({
	params: ['length', 'encoding'],
	read() {
		var view = this.view, maxLength = this.length;
		if (maxLength === undefined) {
			var startPos = view.tell(), length = 0, code;
			maxLength = view.byteLength - startPos;
			while (length < maxLength && (code = view.getUint8())) {
				length++;
			}
			var string = view.getString(length, startPos, this.encoding);
			if (length < maxLength) {
				view.skip(1);
			}
			return string;
		} else {
			return view.getString(maxLength, undefined, this.encoding).replace(/\0.*$/, '');
		}
	},
	write(value) {
		var view = this.view, zeroLength = this.length === undefined ? 1 : this.length - value.length;
		view.writeString(value, undefined, this.encoding);
		if (zeroLength > 0) {
			view.writeUint8(0);
			view.skip(zeroLength - 1);
		}
	}
});

export {String0 as CString};
