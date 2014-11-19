import jBinary from '..';

export function seek(position, callback) {
	position = this.toValue(position);
	if (callback !== undefined) {
		var oldPos = this.view.tell();
		this.view.seek(position);
		var result = callback.call(this);
		this.view.seek(oldPos);
		return result;
	} else {
		return this.view.seek(position);
	}
};

export function tell() {
	return this.view.tell();
};

export function skip(offset, callback) {
	return this.seek(this.tell() + this.toValue(offset), callback);
};

export function slice(start, end, forceCopy) {
	return new jBinary(this.view.slice(start, end, forceCopy), this.typeSet);
};

export function eof() {
	return this.tell() >= this.view.byteLength;
};
