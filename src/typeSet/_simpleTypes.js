{
	let dataTypes = [
		'Uint8',
		'Uint16',
		'Uint32',
		'Uint64',
		'Int8',
		'Int16',
		'Int32',
		'Int64',
		'Float32',
		'Float64',
		'Char'
	];

	for (var i = 0; i < dataTypes.length; i++) {
		let dataType = dataTypes[i];
		defaultTypeSet[dataType.toLowerCase()] = Type({
			params: ['littleEndian'],
			read() {
				return this.view['get' + dataType](undefined, this.littleEndian);
			},
			write(value) {
				this.view['write' + dataType](value, this.littleEndian);
			}
		});
	}
}

extend(defaultTypeSet, {
	'byte': defaultTypeSet.uint8,
	'float': defaultTypeSet.float32,
	'double': defaultTypeSet.float64
});
