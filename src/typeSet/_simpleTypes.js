(function (simpleType, dataTypes) {
	for (var i = 0, length = dataTypes.length; i < length; i++) {
		var dataType = dataTypes[i];
		defaultTypeSet[dataType.toLowerCase()] = inherit(simpleType, {dataType: dataType});
	}
})(
	Type({
		params: ['littleEndian'],
		read: function () {
			return this.view['get' + this.dataType](undefined, this.littleEndian);
		},
		write: function (value) {
			this.view['write' + this.dataType](value, this.littleEndian);
		}
	}),
	[
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
	]
);

extend(defaultTypeSet, {
	'byte': defaultTypeSet.uint8,
	'float': defaultTypeSet.float32,
	'double': defaultTypeSet.float64
});