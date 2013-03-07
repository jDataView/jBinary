
if (typeof jDataView === 'undefined') {
	jDataView = require('jDataView');
}
var module = QUnit.module;
var test = QUnit.test;


var buffer = jDataView.createBuffer(0x00,
	0xff, 0xfe, 0xfd, 0xfc,
	0xfa, 0x00, 0xba, 0x01);
var view = new jDataView(buffer, 1, undefined, true);
var parser = new jParser(view);

function chr (x) {
	return String.fromCharCode(x);
}


module("Values");
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
