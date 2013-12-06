var simpleType = jBinary.Type({
	params: ['littleEndian'],
	read: function () {
		return this.binary.view['get' + this.dataType](undefined, this.littleEndian);
	},
	write: function (value) {
		this.binary.view['write' + this.dataType](value, this.littleEndian);
	}
});

(function (dataTypes) {
	for (var i = 0, length = dataTypes.length; i < length; i++) {
		var dataType = dataTypes[i];
		proto.typeSet[dataType.toLowerCase()] = inherit(simpleType, {dataType: dataType});
	}
})([
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
]);

extend(proto.typeSet, {
	'byte': proto.typeSet.uint8,
	'float': proto.typeSet.float32,
	'double': proto.typeSet.float64
});