defaultTypeSet.lazy = Template({
	marker: 'jBinary.Lazy',
	params: ['innerType', 'length'],
	getBaseType: function () {
		return [
			'binary',
			this.length,
			this.binary.typeSet
		];
	},
	read: function () {
		var accessor = function (newValue) {
			if (arguments.length === 0) {
				return 'value' in accessor ? accessor.value : accessor.value = accessor.binary.read(accessor.innerType);
			} else {
				return extend(accessor, {
					wasChanged: true,
					value: newValue
				}).value;
			}
		};
		accessor[this.marker] = true;
		return extend(accessor, {
			binary: extend(this.baseRead(), { contexts: this.binary.contexts.slice() }),
			innerType: this.innerType
		});
	},
	write: function (accessor) {
		if (accessor.wasChanged || !accessor[this.marker]) {
			this.binary.write(this.innerType, accessor());
		} else {
			this.baseWrite(accessor.binary);
		}
	}
});