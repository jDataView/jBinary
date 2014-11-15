defaultTypeSet.lazy = Template({
	marker: 'jBinary.Lazy',
	params: ['innerType', 'length'],
	getBaseType() {
		return [
			'binary',
			this.length,
			this.binary.typeSet
		];
	},
	read() {
		var {innerType} = this;
		var wasResolved = false, wasChanged = false, value;
		return Object.defineProperties(function accessor(newValue) {
			if (arguments.length === 0) {
				return accessor.value;
			} else {
				return accessor.value = newValue;
			}
		}, {
			[this.marker]: {
				value: true
			},
			binary: {
				enumerable: true,
				value: extend(this.baseRead(), {contexts: this.binary.contexts.slice()})
			},
			wasResolved: {
				get() { return wasResolved }
			},
			wasChanged: {
				get() { return wasChanged }
			},
			value: {
				enumerable: true,
				get() {
					if (wasResolved) {
						return value;
					}
					wasResolved = true;
					return value = this.binary.read(innerType);
				},
				set(newValue) {
					wasChanged = wasResolved = true;
					value = newValue;
				}
			}
		});
	},
	write(accessor) {
		if (!accessor[this.marker] || accessor.wasChanged) {
			this.binary.write(this.innerType, accessor());
		} else {
			this.baseWrite(accessor.binary);
		}
	}
});
