defaultTypeSet.array = Template({
	params: ['baseType', 'length'],
	read: function () {
		var length = this.toValue(this.length);
		if (this.baseType === defaultTypeSet.uint8) {
			return this.view.getBytes(length, undefined, true, true);
		}
		var results;
		if (length !== undefined) {
			results = new Array(length);
			for (var i = 0; i < length; i++) {
				results[i] = this.baseRead();
			}
		} else {
			var end = this.view.byteLength;
			results = [];
			while (this.binary.tell() < end) {
				results.push(this.baseRead());
			}
		}
		return results;
	},
	write: function (values) {
		if (this.baseType === defaultTypeSet.uint8) {
			return this.view.writeBytes(values);
		}
		for (var i = 0, length = values.length; i < length; i++) {
			this.baseWrite(values[i]);
		}
	}
});