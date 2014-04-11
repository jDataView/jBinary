defaultTypeSet.extend = Type({
	setParams: function () {
		this.parts = arguments;
	},
	resolve: function (getType) {
		var parts = this.parts, length = parts.length, partTypes = new Array(length);
		for (var i = 0; i < length; i++) {
			partTypes[i] = getType(parts[i]);
		}
		this.parts = partTypes;
	},
	read: function () {
		var parts = this.parts, obj = this.binary.read(parts[0]);
		this.binary.inContext(obj, function () {
			for (var i = 1, length = parts.length; i < length; i++) {
				extend(obj, this.read(parts[i]));
			}
		});
		return obj;
	},
	write: function (obj) {
		var parts = this.parts;
		this.binary.inContext(obj, function () {
			for (var i = 0, length = parts.length; i < length; i++) {
				this.write(parts[i], obj);
			}
		});
	}
});