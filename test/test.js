if (typeof require !== 'undefined') {
	if (typeof jDataView === 'undefined') {
		jDataView = require('jDataView');
	}

	if (typeof jBinary === 'undefined') {
		jBinary = require('..');
	}

	if (typeof JSHINT === 'undefined') {
		JSHINT = require('jshint').JSHINT;
	}
}

if (typeof JSHINT !== 'undefined') {
	asyncTest('JSHint', function () {
		var paths = {
			source: '../src/jBinary.js',
			options: '../src/.jshintrc'
		},
		contents = {};

		function onLoad(err, name, text) {
			if (err) {
				start();
				return ok(false, 'Error while loading ' + name + ': ' + err);
			}

			contents[name] = text;
			for (var name in paths) {
				if (!(name in contents)) {
					return;
				}
			}

			var options = JSON.parse(contents.options), globals = options.globals;
			delete options.globals;

			start();

			if (JSHINT(contents.source, options, globals)) {
				ok(true);
			} else {
				var errors = JSHINT.errors, skipLines = [], errorCount = errors.length;
				for (var i = 0, length = errors.length; i < length; i++) {
					var error = errors[i];
					if (error) {
						if (error.code === 'E001' && /^\/\/\s*jshint:\s*skipline/.test(error.evidence)) {
							skipLines.push(error.line + 1);
							errorCount--;
							continue;
						}
						if (skipLines.indexOf(error.line) >= 0) {
							errorCount--;
							continue;
						}
						ok(false, 'Line ' + error.line + ', character ' + error.character + ': ' + error.reason);
						console.log(error);
					}
				}
				if (!errorCount) {
					ok(true);
				}
			}
		}

		function load(name) {
			if (typeof XMLHttpRequest !== 'undefined') {
				var ajax = new XMLHttpRequest();
				ajax.onload = function () {
					this.status === 200 ? onLoad(null, name, this.responseText) : onLoad(this.statusText, name);
				};
				ajax.open('GET', paths[name], true);
				ajax.send();
			} else {
				require('fs').readFile(paths[name], function (err, data) {
					onLoad(err, name, String(data));
				});
			}
		}

		for (var name in paths) {
			load(name);
		}
	});
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
var binary = new jBinary(view);

function chr (x) {
	return String.fromCharCode(x);
}


module("Parse");
test('uint', function () {
	binary.seek(0);
	equal(binary.read('uint8'), 255);
	equal(binary.read('uint16'), 65022);
	equal(binary.read('uint32'), 3120626428);
});

test('int', function () {
	binary.seek(0);
	equal(binary.read('int8'), -1);
	equal(binary.read('int16'), -514);
	equal(binary.read('int32'), -1174340868);
});

test('float', function () {
	binary.seek(0);
	equal(binary.read('float32'), -1.055058432344064e+37);
	binary.seek(0);
	equal(binary.read('float64'), 2.426842827241402e-300);
});

test('string', function () {
	binary.seek(5);
	equal(binary.read('char'), chr(0x00));
	equal(binary.read(['string', 2]), chr(0xba) + chr(0x01));
});

test('array', function () {
	binary.seek(0);
	deepEqual(binary.read(['array', 'uint8', 8]),
		[0xff, 0xfe, 0xfd, 0xfc, 0xfa, 0x00, 0xba, 0x01]);
	binary.seek(0);
	deepEqual(binary.read(['array', 'int32', 2]),
		[-50462977, 28967162]);
});

test('object', function () {
	binary.seek(0);
	deepEqual(binary.read({
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
	binary.seek(5);
	equal(binary.tell(), 5);
	binary.seek(binary.tell() - 2);
	equal(binary.tell(), 3);

	binary.seek(5, function () {
		equal(binary.tell(), 5);
		binary.seek(0);
		equal(binary.tell(), 0);
	});
	equal(binary.tell(), 3);
});

test('bitfield', function () {
	binary.seek(6);
	deepEqual(binary.read({
		first5: 5,
		next5: new jBinary.Type({
			read: function () {
				return this.binary.read(5);
			}
		}),
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

// writer = [type, value, checkFn]
function testWriters(name, writers) {
	test(name, function () {
		for (var i = 0; i < writers.length; i++) {
			var writer = writers[i],
				type = writer[0],
				value = writer[1],
				check = writer[2] || equal;

			binary.seek(0);
			binary.write(type, value);
			binary.seek(0);
			check(binary.read(type), value);
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
	[['string', 4], 'smth']
]);

testWriters('array', [
	[
		['array', 'uint8', 8],
		[0x54, 0x17, 0x29, 0x34, 0x5a, 0xfb, 0x00, 0xff],
		deepEqual
	],
	[
		['array', 'int32', 2],
		[-59371033, 2021738594],
		deepEqual
	]
]);

testWriters('object', [
	[
		{
			a: 'int32',
			b: 'int8',
			c: ['array', 'uint8', 2]
		},
		{
			a: -7943512,
			b: -105,
			c: [17, 94]
		},
		deepEqual
	]
]);

testWriters('bitfield', [
	[
		{
			first5: 5,
			next5: new jBinary.Type({
				read: function () {
					return this.binary.read(5);
				},
				write: function (value) {
					this.binary.write(5, value);
				}
			}),
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
		deepEqual
	]
]);