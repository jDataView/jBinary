
if (typeof jDataView === 'undefined') {
	jDataView = require('jDataView');
}
var module = QUnit.module;
var test = QUnit.test;

var dataBytes = [
	0x00,
	0xff, 0xfe, 0xfd, 0xfc,
	0xfa, 0x00, 0xba, 0x01
];
var dataStart = 1;
var view = new jDataView(dataBytes.slice(), dataStart, undefined, true);
var parser = new jParser(view);

function chr (x) {
	return String.fromCharCode(x);
}


module("Parse");
test('uint', function () {
	parser.seek(0);
	equal(parser.parse('uint8'), 255);
	equal(parser.parse('uint16'), 65022);
	equal(parser.parse('uint32'), 3120626428);
});

test('int', function () {
	parser.seek(0);
	equal(parser.parse('int8'), -1);
	equal(parser.parse('int16'), -514);
	equal(parser.parse('int32'), -1174340868);
});

test('float', function () {
	parser.seek(0);
	equal(parser.parse('float32'), -1.055058432344064e+37);
	parser.seek(0);
	equal(parser.parse('float64'), 2.426842827241402e-300);
});

test('string', function () {
	parser.seek(5);
	equal(parser.parse('char'), chr(0x00));
	equal(parser.parse(['string', 2]), chr(0xba) + chr(0x01));
});

test('array', function () {
	parser.seek(0);
	deepEqual(parser.parse(['array', 'uint8', 8]),
		[0xff, 0xfe, 0xfd, 0xfc, 0xfa, 0x00, 0xba, 0x01]);
	parser.seek(0);
	deepEqual(parser.parse(['array', 'int32', 2]),
		[-50462977, 28967162]);
});

test('object', function () {
	parser.seek(0);
	deepEqual(parser.parse({
		a: 'int32',
		b: 'int8',
		c: ['array', 'uint8', 2]
	}), {
		a: -50462977,
		b: -6,
		c: [0, 186]
	});
});

test('seek', function () {
	parser.seek(5);
	equal(parser.tell(), 5);
	parser.seek(parser.tell() - 2);
	equal(parser.tell(), 3);

	parser.seek(5, function () {
		equal(parser.tell(), 5);
		parser.seek(0);
		equal(parser.tell(), 0);
	});
	equal(parser.tell(), 3);
});

test('bitfield', function () {
	parser.seek(6);
	deepEqual(parser.parse({
		first5: 5,
		next5: function () {
			return this.parse(5);
		},
		last6: {
			first3: 3,
			last3: 3
		}
	}), {
		first5: 0x17,
		next5: 0x08,
		last6: {
			first3: 0,
			last3: 1
		}
	});
});

module("Write", {
	teardown: function () {
		view.setBytes(0, dataBytes.slice(dataStart), true);
	}
});

// writer = [type, value, getterArgs, checkFn]
function testWriters(name, writers) {
	test(name, function () {
		for (var i = 0; i < writers.length; i++) {
			var writer = writers[i],
				type = writer[0],
				value = writer[1],
				check = writer[3] || equal;

			parser.seek(0);
			parser.write(type, value);
			parser.seek(0);
			var actual = writer[2] instanceof Function ? writer[2]() : parser.parse.apply(parser, [].concat(type, writer[2]));
			check(actual, value);
		}
	});
}

testWriters('uint', [
	['uint8', 17],
	['uint16', 39871],
	['uint32', 2463856109]
]);

testWriters('int', [
	['int8', -15],
	['int16', -972],
	['int32', -1846290834]
]);

testWriters('float', [
	['float32', -1.0751052490836633e+37],
	['float64', 2.531423904252017e-300]
]);

testWriters('string', [
	['char', chr(0x89)],
	['string', 'smth', 4]
]);

testWriters('array', [
	[['array', 'uint8'], [0x54, 0x17, 0x29, 0x34, 0x5a, 0xfb, 0x00, 0xff], 8, deepEqual],
	[['array', 'int32'], [-59371033, 2021738594], 2, deepEqual]
]);

testWriters('object', [
	[
		{
			a: 'int32',
			b: 'int8',
			c: ['array', 'uint8']
		},
		{
			a: -7943512,
			b: -105,
			c: [17, 94]
		},
		function () {
			return parser.parse({
				a: 'int32',
				b: 'int8',
				c: ['array', 'uint8', 2]
			});
		},
		deepEqual
	]
]);

testWriters('bitfield', [
	[
		{
			first5: 5,
			next5: jParser.Property(
				function () { return this.parse(5) },
				function (value) { this.write(5, value) }
			),
			last6: {
				first3: 3,
				last3: 3
			}
		},
		{
			first5: 17,
			next5: 21,
			last6: {
				first3: 2,
				last3: 5
			}
		},
		,
		deepEqual
	]
]);
