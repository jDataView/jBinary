var hasNodeRequire = typeof require === 'function' && typeof window === 'undefined';

/* jshint ignore:start */
if (hasNodeRequire) {
	chai = require('chai');
	jDataView = require('jdataview');
	jBinary = require('..');
} else {
	__dirname = 'base/test';
}
/* jshint ignore:end */

var assert = chai.assert,
	chr = String.fromCharCode,
	dataBytes = [
		0x00,
		0xff, 0xfe, 0xfd, 0xfc,
		0xfa, 0x00, 0xba, 0x01
	],
	dataStart = 1,
	view = new jDataView(dataBytes.slice(), dataStart, undefined, true),
	binary = new jBinary(view, {__UNUSED__: '__UNUSED__'}),
	typeSet = jBinary.prototype.typeSet,
	ObjectStructure = {
		arrays: ['array', {
			flag: ['enum', 'uint8', [false, true]],
			array: ['if', 'flag', {
				length: 'uint8',
				values: ['array', 'uint16', 'length']
			}]
		}, 2]
	},
	ExtensionStructure = {
		extraByte: 'uint8'
	};

for (var typeName in typeSet) {
	typeSet[typeName].isTested = {getter: false, setter: false};
}

function b() {
	return new jBinary(arguments);
}

function compareInt64(value, expected) {
	assert.equal(+value, expected);
}

function compareBytes(value, expected) {
	value = Array.prototype.slice.call(value);
	assert.deepEqual(value, expected);
}

function compareWithNaN(value, expected, message) {
	assert.ok(isNaN(value), message || value + ' != NaN');
}

suite('Common operations:', function () {
	test('getType', function () {
		var type = binary.getType('uint32');
		assert.instanceOf(type, jBinary.Type);
		assert.equal(binary.getType([type]), type);
	});

	suite('slice', function () {
		test('with bound check', function () {
			assert.Throw(function () {
				binary.slice(5, 10);
			});
		});

		test('as pointer to original data', function () {
			var pointerCopy = binary.slice(1, 4);
			compareBytes(pointerCopy.read('blob'), [0xfe, 0xfd, 0xfc]);
			pointerCopy.write('char', chr(1), 0);
			assert.equal(binary.read('char', 1), chr(1));
			pointerCopy.write('char', chr(0xfe), 0);
			assert.equal(pointerCopy.typeSet, binary.typeSet);
		});

		test('as copy of original data', function () {
			var copy = binary.slice(1, 4, true);
			compareBytes(copy.read('blob'), [0xfe, 0xfd, 0xfc]);
			copy.write('char', chr(1), 0);
			assert.notEqual(binary.read('char', 1), chr(1));
			assert.equal(copy.typeSet, binary.typeSet);
		});

		test('with only start offset argument given', function () {
			var pointerCopy = binary.slice(1);
			compareBytes(pointerCopy.read('blob'), [0xfe, 0xfd, 0xfc, 0xfa, 0x00, 0xba, 0x01]);
		});

		test('with negative start offset given', function () {
			var pointerCopy = binary.slice(-2);
			compareBytes(pointerCopy.read('blob'), [0xba, 0x01]);
		});

		test('with negative end offset given', function () {
			var pointerCopy = binary.slice(1, -2);
			compareBytes(pointerCopy.read('blob'), [0xfe, 0xfd, 0xfc, 0xfa, 0x00]);
		});
	});

	suite('as (cast)', function () {
		var typeSet = binary.typeSet,
			typeSet2 = {MY_TYPESET: true};

		test('with inheritance from original binary', function () {
			var binary2 = binary.as(typeSet2);
			assert.ok(binary.isPrototypeOf(binary2));
			assert.equal(binary.typeSet, typeSet);
			assert.isTrue(binary2.typeSet.MY_TYPESET);
		});

		test('with modification of original binary', function () {
			var binary2 = binary.as(typeSet2, true);
			assert.equal(binary, binary2);
			assert.isTrue(binary.typeSet.MY_TYPESET);
			binary.typeSet = typeSet;
		});
	});
});

//-----------------------------------------------------------------

suite('Loading data', function () {
	var localFileName = __dirname + '/123.tar';

	test('from data-URI', function (done) {
		jBinary.loadData('data:text/plain,123', function (err, data) {
			assert.notOk(err, err);
			assert.equal(new jDataView(data).getString(), '123');
			done();
		});
	});

	test('from base-64 data-URI', function (done) {
		jBinary.loadData('data:text/plain;base64,MTIz', function (err, data) {
			assert.notOk(err, err);
			assert.equal(new jDataView(data).getString(), '123');
			done();
		});
	});

	if (typeof Blob === 'function') {
		test('from HTML5 Blob', function (done) {
			var blob = new Blob(['123']);
			jBinary.loadData(blob, function (err, data) {
				assert.notOk(err, err);
				assert.equal(new jDataView(data).getString(), '123');
				done();
			});
		});
	}

	test('from local file', function (done) {
		jBinary.loadData(localFileName, function (err, data) {
			assert.notOk(err, err);
			assert.equal(data.byteLength || data.length, 512);
			done();
		});
	});

	test('from non-existent local file', function (done) {
		jBinary.loadData('__NON_EXISTENT__', function (err, data) {
			assert.ok(err);
			assert.isUndefined(data);
			done();
		});
	});

	if (hasNodeRequire && require('stream').Readable) {
		test('from Node.js readable stream', function (done) {
			var stream = require('stream').Readable(), i = 0;
			stream._read = function () {
				i++;
				this.push(i <= 3 ? new Buffer([i]) : null);
			};
			jBinary.loadData(stream, function (err, data) {
				assert.notOk(err, err);
				compareBytes(data, [1, 2, 3]);
				done();
			});
		});

		test('from URL', function (done) {
			this.timeout(30000);

			var port = 7359;

			var server = require('http').createServer(function (req, res) {
				require('fs').createReadStream(localFileName).pipe(res);
			});

			server.listen(port);

			jBinary.loadData('http://localhost:' + port, function (err, data) {
				assert.notOk(err, err);
				assert.equal(data.byteLength || data.length, 512);
				server.close();
				done();
			});
		});
	}

	test('with explicit typeset object', function (done) {
		var typeSet = {
			IS_CORRECT_TYPESET: true
		};

		jBinary.load(localFileName, typeSet, function (err, binary) {
			assert.notOk(err, err);
			assert.instanceOf(binary, jBinary);
			assert.equal(binary.view.byteLength, 512);
			assert.isTrue(typeSet.IS_CORRECT_TYPESET);
			done();
		});
	});

	test('with implicitly empty typeset object', function (done) {
		jBinary.load(localFileName, function (err, binary) {
			assert.notOk(err, err);
			assert.instanceOf(binary, jBinary);
			assert.equal(binary.view.byteLength, 512);
			assert.equal(binary.typeSet, jBinary.prototype.typeSet);
			done();
		});
	});

	suite('as Promise', function () {
		test('from data-URI', function (done) {
			jBinary.loadData('data:text/plain,123').then(function (res) {
				assert.equal(new jDataView(res).getString(), '123');
				done();
			}, function (err) {
				assert.fail(err);
				done();
			});
		});

		test('with explicit typeset object', function (done) {
			var typeSet = {
				IS_CORRECT_TYPESET: true
			};

			jBinary.load(localFileName, typeSet).then(function (binary) {
				assert.instanceOf(binary, jBinary);
				assert.equal(binary.view.byteLength, 512);
				assert.isTrue(typeSet.IS_CORRECT_TYPESET);
				done();
			}, function (err) {
				assert.fail(err);
				done();
			});
		});

		test('from non-existent local file', function (done) {
			jBinary.loadData('__NON_EXISTENT__').then(function () {
				assert.fail();
				done();
			}, function (err) {
				assert.instanceOf(err, Error);
				done();
			});
		});

		test('from non-existent local file with explicit typeset object', function (done) {
			jBinary.load('__NON_EXISTENT__').then(function () {
				assert.fail();
				done();
			}, function (err) {
				assert.instanceOf(err, Error);
				done();
			});
		});
	});
});

//-----------------------------------------------------------------

suite('Saving data', function () {
	test('to URI', function (done) {
		jBinary.load(binary.toURI(), function (err, newBinary) {
			assert.notOk(err, err);
			assert.deepEqual(newBinary.read('string', 0), binary.read('string', 0));
			done();
		});
	});

	if (hasNodeRequire) {
		test('to local file', function (done) {
			var savedFileName = __dirname + '/' + Math.random().toString().slice(2) + '.tmp';

			binary.saveAs(savedFileName, function (err) {
				assert.notOk(err, err);

				jBinary.load(savedFileName, function (err, newBinary) {
					assert.notOk(err, err);
					assert.equal(newBinary.read('string', 0), binary.read('string', 0));
					require('fs').unlink(savedFileName, done);
				});
			});
		});

		if (require('stream').Writable) {
			test('to Node.js writable stream', function (done) {
				var stream = require('stream').Writable(), chunks = [];
				stream._write = function (chunk, encoding, callback) {
					chunks.push(chunk);
					callback();
				};

				binary.saveAs(stream, function (err) {
					assert.notOk(err, err);
					assert.equal(Buffer.concat(chunks).toString('binary'), binary.read('string', 0));
					done();
				});
			});
		}
	} else {
		test('via browser dialog', function (done) {
			function addListener(node, eventType, handler) {
				if (node.addEventListener) {
					node.addEventListener(eventType, handler);
				} else {
					node.attachEvent('on' + eventType, handler);
				}
			}

			(function (onLoad) {
				document.readyState === 'complete' ? onLoad() : addListener(window, 'load', onLoad);
			})(function () {
				var msSaveBlob = navigator.msSaveBlob;

				if (msSaveBlob) {
					navigator.msSaveBlob = function (blob, fileName) {
						assert.instanceOf(blob, Blob);
						assert.equal(fileName, 'test.dat');
					};
				} else {
					// Phantom.JS
					if (!HTMLElement.prototype.click) {
						HTMLElement.prototype.click = function() {
							var event = document.createEvent('MouseEvent');

							event.initMouseEvent(
								'click',
								/*bubble*/true, /*cancelable*/true,
								window, null,
								0, 0, 0, 0, /*coordinates*/
								false, false, false, false, /*modifier keys*/
								0/*button=left*/, null
							);

							this.dispatchEvent(event);
						};
					}

					addListener(jBinary.downloader, 'click', function (event) {
						assert.ok(this.href);
						assert.equal(this.download, 'test.dat');

						event.preventDefault ? event.preventDefault() : event.returnValue = false;
					});
				}

				binary.saveAs('test.dat', function () {
					if (msSaveBlob) {
						navigator.msSaveBlob = msSaveBlob;
					}

					done();
				});
			});
		});
	}
});

//-----------------------------------------------------------------

suite('Reading', function () {
	// getter = value || {value, check?, binary?, args?, offset?}
	function testGetters(typeName, getters) {
		test(typeName, function () {
			binary.seek(0);

			for (var i = 0; i < getters.length; i++) {
				var getter = getters[i];

				if (typeof getter !== 'object') {
					getter = {value: getter};
				}

				var args = getter.args,
					type = args ? [typeName].concat(args) : typeName,
					offset = getter.offset,
					contextBinary = getter.binary || binary,
					check = getter.check || assert.equal,
					value = getter.value;

				if (offset !== undefined) {
					contextBinary.seek(offset);
				}

				check(contextBinary.read(type), value);
			}
		});
	}

	testGetters('blob', [
		{offset: 1, args: [2], value: [0xfe, 0xfd], check: compareBytes},
		{args: [3], value: [0xfc, 0xfa, 0x00], check: compareBytes}
	]);

	testGetters('char', [
		chr(0xff),
		chr(0xfe),
		chr(0xfd),
		chr(0xfc),
		chr(0xfa),
		chr(0),
		chr(0xba),
		chr(1)
	]);

	testGetters('string', [
		{offset: 0, args: [1], value: chr(0xff)},
		{offset: 5, args: [1], value: chr(0)},
		{offset: 7, args: [1], value: chr(1)},
		{binary: b(127, 0, 1, 65, 66), args: [5], value: chr(127) + chr(0) + chr(1) + chr(65) + chr(66)},
		{binary: b(0xd1, 0x84, 0xd1, 0x8b, 0xd0, 0xb2), args: [6, 'utf8'], value: chr(1092) + chr(1099) + chr(1074)}
	]);

	testGetters('string0', [
		{offset: 0, args: [8], value: chr(0xff) + chr(0xfe) + chr(0xfd) + chr(0xfc) + chr(0xfa)},
		{binary: b(127, 0, 1, 65, 66), value: chr(127)}
	]);

	testGetters('int8', [
		-1,
		-2,
		-3,
		-4,
		-6,
		0,
		-70,
		1
	]);

	testGetters('uint8', [
		255,
		254,
		253,
		252,
		250,
		0,
		186,
		1
	]);

	testGetters('int16', [
		{offset: 0, value: -257},
		{offset: 1, value: -514},
		{offset: 2, value: -771},
		{offset: 3, value: -1284},
		{offset: 4, value: 250},
		{offset: 5, value: -17920},
		{offset: 6, value: 442}
	]);

	testGetters('uint16', [
		{offset: 0, value: 65279},
		{offset: 1, value: 65022},
		{offset: 2, value: 64765},
		{offset: 3, value: 64252},
		{offset: 4, value: 250},
		{offset: 5, value: 47616},
		{offset: 6, value: 442}
	]);

	testGetters('uint32', [
		{offset: 0, value: 4244504319},
		{offset: 1, value: 4210884094},
		{offset: 2, value: 16448765},
		{offset: 3, value: 3120626428},
		{offset: 4, value: 28967162}
	]);

	testGetters('int32', [
		{offset: 0, value: -50462977},
		{offset: 1, value: -84083202},
		{offset: 2, value: 16448765},
		{offset: 3, value: -1174340868},
		{offset: 4, value: 28967162}
	]);

	testGetters('float32', [
		{offset: 0, value: -1.055058432344064e+37},
		{offset: 1, value: -6.568051909668895e+35},
		{offset: 2, value: 2.30496291345398e-38},
		{offset: 3, value: -0.0004920212086290121},
		{offset: 4, value: 6.832701044000979e-38},
		{binary: b(0x7f, 0x80, 0x00, 0x00), value: Infinity},
		{binary: b(0xff, 0x80, 0x00, 0x00), value: -Infinity},
		{binary: b(0x00, 0x00, 0x00, 0x00), value: 0},
		{binary: b(0xff, 0x80, 0x00, 0x01), check: compareWithNaN}
	]);

	testGetters('float64', [
		{offset: 0, value: 2.426842827241402e-300},
		{binary: b(0x7f, 0xf0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00), value: Infinity},
		{binary: b(0xff, 0xf0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00), value: -Infinity},
		{binary: b(0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00), value: 0},
		{binary: b(0x80, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00), value: -0},
		{binary: b(0x3f, 0xf0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00), value: 1},
		{binary: b(0x3f, 0xf0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01), value: 1.0000000000000002},
		{binary: b(0x3f, 0xf0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x02), value: 1.0000000000000004},
		{binary: b(0x40, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00), value: 2},
		{binary: b(0xc0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00), value: -2},
		{binary: b(0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01), value: 5e-324},
		{binary: b(0x00, 0x0f, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff), value: 2.225073858507201e-308},
		{binary: b(0x00, 0x10, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00), value: 2.2250738585072014e-308},
		{binary: b(0x7f, 0xef, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff), value: 1.7976931348623157e+308},
		{binary: b(0xff, 0xf0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01), check: compareWithNaN}
	]);

	testGetters('int64', [
		{offset: 0, args: [false], value: -283686985483775, check: compareInt64},
		{binary: b(0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xfe), value: -2, check: compareInt64},
		{binary: b(0x00, 0x11, 0x22, 0x33, 0x44, 0x55, 0x66, 0x77), value: 4822678189205111, check: compareInt64}
	]);

	testGetters('uint64', [
		{binary: b(0x00, 0x67, 0xff, 0xff, 0xff, 0xff, 0xff, 0xfe), value: 29273397577908224, check: compareInt64},
		{binary: b(0x00, 0x11, 0x22, 0x33, 0x44, 0x55, 0x66, 0x77), value: 4822678189205111, check: compareInt64}
	]);

	test('skip', function () {
		binary.read(['skip', 2]);
		assert.equal(binary.tell(), 2);
		binary.read(['skip', 1]);
		assert.equal(binary.tell(), 3);
	});

	testGetters('enum', [
		{offset: 5, args: ['uint8', [false, true]], value: false},
		{offset: 7, args: ['uint8', {'0': 'false', '1': 'true'}], value: 'true'}
	]);

	testGetters('array', [
		{offset: 0, args: ['uint16', 2], value: [65279, 64765], check: assert.deepEqual},
		{offset: 5, args: ['uint8'], value: [0x00, 0xba, 0x01], check: assert.deepEqual}
	]);

	test('const', function () {
		assert.Throw(function () {
			binary.read(['const', 'uint16', 0, true], 0);
		});

		assert.doesNotThrow(function () {
			assert.notEqual(binary.read(['const', 'uint8', 0], 0), 0);
		});

		var errorFlag = false;

		binary.read(['const', 'uint8', 123, function (value) {
			assert.equal(value, 0xff);
			assert.equal(this.value, 123);
			errorFlag = true;
		}], 0);

		assert.isTrue(errorFlag);
	});

	testGetters('if', [
		{offset: 0, args: [true, 'uint8'], value: 0xff},
		{offset: 0, args: [function () { return false }, 'uint8', 'uint16'], value: 65279}
	]);

	testGetters('if_not', [
		{offset: 0, args: [false, 'uint8'], value: 0xff},
		{offset: 0, args: [function () { return false }, 'uint16', 'uint8'], value: 65279}
	]);

	testGetters('bitfield', [
		// padded to byte here
		{offset: 1, args: [3], value: 7},
		{args: [5], value: 30},
		// padded to byte here
		{args: [15], value: 32510},
		{args: [17], value: 64000}
		// padded to byte here
	]);

	testGetters('object', [{
		binary: b(0x01, 0x02, 0xff, 0xfe, 0xfd, 0xfc, 0x00, 0x10),
		args: [ObjectStructure],
		value: {
			arrays: [
				{
					flag: true,
					array: {
						length: 2,
						values: [0xfffe, 0xfdfc]
					}
				},
				{
					flag: false
				}
			]
		},
		check: assert.deepEqual
	}]);

	testGetters('extend', [{
		binary: b(0x01, 0x02, 0xff, 0xfe, 0xfd, 0xfc, 0x00, 0x10),
		args: [ObjectStructure, ExtensionStructure],
		value: {
			arrays: [
				{
					flag: true,
					array: {
						length: 2,
						values: [0xfffe, 0xfdfc]
					}
				},
				{
					flag: false
				}
			],
			extraByte: 0x10
		},
		check: assert.deepEqual
	}]);

	testGetters('binary', [{
		offset: 1,
		args: [3, {__TEST_ME__: '__TEST_ME__'}],
		value: [0xfe, 0xfd, 0xfc],
		check: function (subBinary, values) {
			assert.deepEqual(subBinary.read(['array', 'uint8'], 0), values);
			assert.equal(subBinary.view.buffer, binary.view.buffer);
			assert.equal(subBinary.typeSet.__TEST_ME__, '__TEST_ME__');
		}
	}]);

	test('lazy', function () {
		var innerType = 'uint32',
			length = 4,
			lazyType = ['lazy', innerType, length],
			lazy,
			readCount,
			innerValue = binary.read(innerType, 0);

		function resetAccessor() {
			lazy = binary.read(lazyType, 0);
			assert.notOk('value' in lazy);
			readCount = 0;
			var read = lazy.binary.read;
			lazy.binary.read = function () {
				readCount++;
				return read.apply(this, arguments);
			};
		}

		function checkState(expectedChangeState, expectedReadCount) {
			assert.equal(!!lazy.wasChanged, expectedChangeState);
			for (var counter = 2; counter--;) {
				assert.equal(lazy(), innerValue);
			}
			assert.equal(readCount, expectedReadCount);
			assert.equal(lazy.value, innerValue);
		}

		resetAccessor();
		checkState(false, 1);

		innerValue = 5489408;
		lazy(innerValue);
		checkState(true, 1);

		resetAccessor();
		lazy(innerValue);
		checkState(true, 0);

		assert.equal(lazy.binary.typeSet, binary.typeSet);

		var obj = {
			innerObj: {
				someLazy: ['lazy', jBinary.Type({
					read: function (context) {
						assert.ok(context);
						assert.property(context, 'someLazy');
						var parentContext = this.binary.getContext(1);
						assert.ok(parentContext);
						assert.equal(parentContext.innerObj, context);
					}
				}), 0]
			}
		};

		binary.read(obj).innerObj.someLazy();
	});

	this.tests.forEach(function (test) {
		typeSet[test.title].isTested.getter = true;
	});
});

//-----------------------------------------------------------------

suite('Writing', function () {
	teardown(function () {
		binary.write('blob', dataBytes.slice(dataStart), 0);
	});

	// setter = value || {value, args?, check?}
	function testSetters(typeName, setters, stdSize) {
		test(typeName, function () {
			for (var i = 0; i < setters.length; i++) {
				var setter = setters[i];

				if (typeof setter !== 'object') {
					setter = {value: setter};
				}

				var args = setter.args,
					type = args ? [typeName].concat(args) : typeName,
					check = setter.check || assert.equal,
					value = setter.value;

				var writtenSize = binary.write(type, value, 0);
				assert.equal('size' in setter ? setter.size : stdSize, writtenSize, 'writtenSize = ' + writtenSize + ' != ' + setter.size);
				check(binary.read(type, 0), value);
			}
		});
	}

	testSetters('blob', [
		{args: [2], value: [0xfe, 0xfd], size: 2, check: compareBytes},
		{args: [3], value: [0xfd, 0xfe, 0xff], size: 3, check: compareBytes}
	]);

	testSetters('char', [
		chr(0xdf),
		chr(0x03),
		chr(0x00),
		chr(0xff)
	], 1);

	testSetters('string', [
		{args: [3], value: chr(1) + chr(2) + chr(3), size: 3},
		{args: [2], value: chr(8) + chr(9), size: 2},
		{args: [6, 'utf8'], value: chr(1092) + chr(1099) + chr(1074), size: 6}
	]);

	testSetters('string0', [
		{args: [4], value: chr(0xff) + chr(0xfe) + chr(0xfd), size: 3 + 1, check: function (value, expected) {
			assert.equal(value, expected);
			assert.equal(binary.read('uint8', value.length), 0);
		}},
		{value: chr(127) + chr(0) + chr(1) + chr(65) + chr(66), size: 5 + 1, check: function (value, expected) {
			assert.equal(value, expected.slice(0, value.length));
			assert.equal(binary.read('uint8', value.length), 0);
		}}
	]);

	testSetters('int8', [
		-10,
		29
	], 1);

	testSetters('uint8', [
		19,
		129,
		0,
		255,
		254
	], 1);

	testSetters('int16', [
		-17593,
		23784
	], 2);

	testSetters('uint16', [
		39571,
		35
	], 2);

	testSetters('int32', [
		-1238748268,
		69359465
	], 4);

	testSetters('uint32', [
		3592756249,
		257391
	], 4);

	testSetters('float32', [
		Math.pow(2, -149),
		-Math.pow(2, -149),
		Math.pow(2, -126),
		-Math.pow(2, -126),
		-1.055058432344064e+37,
		-6.568051909668895e+35,
		2.30496291345398e-38,
		-0.0004920212086290121,
		6.832701044000979e-38,
		Infinity,
		-Infinity,
		0,
		{value: NaN, check: compareWithNaN}
	], 4);

	testSetters('float64', [
		Math.pow(2, -1074),
		-Math.pow(2, -1074),
		Math.pow(2, -1022),
		-Math.pow(2, -1022),
		2.426842827241402e-300,
		Infinity,
		-Infinity,
		0,
		1,
		1.0000000000000004,
		-2,
		{value: NaN, check: compareWithNaN}
	], 8);

	testSetters('int64', [
		{value: -283686985483775, check: compareInt64},
		{value: -2, check: compareInt64},
		{value: 4822678189205111, check: compareInt64}
	], 8);

	testSetters('uint64', [
		{value: 29273397577908224, check: compareInt64},
		{value: 4822678189205111, check: compareInt64}
	], 8);

	test('skip', function () {
		binary.seek(0);
		binary.write(['skip', 2]);
		assert.equal(binary.tell(), 2);
		binary.write(['skip', 1]);
		assert.equal(binary.tell(), 3);
	});

	testSetters('enum', [
		{args: ['uint8', {'0': false, '1': true}], value: false},
		{args: ['uint8', ['false', 'true']], value: 'true'}
	], 1);

	testSetters('array', [
		{args: ['uint16', 2], value: [65279, 64765], size: 2 * 2, check: assert.deepEqual},
		{args: ['uint8', 3], value: [0x00, 0xba, 0x01], size: 1 * 3, check: assert.deepEqual}
	]);

	test('const', function () {
		var type = ['const', 'uint16', 123, true],
			size = 2;

		try {
			assert.equal(binary.write(type.slice(0, -1), 10, 0), size);
			binary.read(type, 0);
			assert.ok(false);
		} catch (e) {
			assert.ok(true);
		}

		try {
			assert.equal(binary.write(type, 10, 0), size);
			assert.equal(binary.read(type, 0), 123);
		} catch (e) {
			assert.ok(false);
		}
	});

	testSetters('if', [
		{args: [true, 'uint8'], value: 123, size: 1},
		{args: [function () { return false }, 'uint8', 'uint16'], value: 17893, size: 2}
	]);

	testSetters('if_not', [
		{args: [false, 'uint8'], value: 123, size: 1},
		{args: [function () { return false }, 'uint16', 'uint8'], value: 17893, size: 2}
	]);

	// setter = {value, bitLength}
	function testBitfieldSetters(type, setters) {
		test(type, function () {
			var binary = new jBinary(13);

			function eachValue(callback) {
				binary.seek(0);

				setters.forEach(function (setter) {
					callback.call(binary, setter.value, setter.bitLength);
				});
			}

			eachValue(function (value, bitLength) {
				this.write([type, bitLength], value);
			});

			eachValue(function (value, bitLength) {
				var realValue = this.read([type, bitLength]);
				assert.equal(realValue, value, 'write' + type + '(' + value + ', ' + bitLength + ') != get' + type + '(' + bitLength + ') == ' + realValue);
			});
		});
	}

	testBitfieldSetters('bitfield', [
		// padded to byte here
		{value: 5, bitLength: 3},
		{value: 29, bitLength: 5},
		// padded to byte here
		{value: 19781, bitLength: 15},
		{value: 68741, bitLength: 17},
		// padded to byte here
		{value: 0xffffffff, bitLength: 32},
		// padded to byte here
		{value: 0x7fffffff, bitLength: 31},
		{value: 1, bitLength: 1}
	]);

	testSetters('object', [{
		args: [ObjectStructure],
		value: {
			arrays: [
				{
					flag: true,
					array: {
						length: 2,
						values: [0xfffe, 0xfdfc]
					}
				},
				{
					flag: false
				}
			]
		},
		size: 7,
		check: assert.deepEqual
	}]);

	testSetters('extend', [{
		args: [ObjectStructure, ExtensionStructure],
		value: {
			arrays: [
				{
					flag: true,
					array: {
						length: 2,
						values: [0xfffe, 0xfdfc]
					}
				},
				{
					flag: false
				}
			],
			extraByte: 0x10
		},
		size: 7 + 1,
		check: assert.deepEqual
	}]);

	testSetters('binary', [
		{
			args: [2],
			value: new jBinary([0x12, 0x34]),
			size: 2,
			check: function (readBinary, writeBinary) {
				assert.deepEqual(readBinary.read(['array', 'uint8'], 0), writeBinary.read(['array', 'uint8'], 0));
				assert.equal(readBinary.view.buffer, binary.view.buffer);
			}
		}
	]);

	test('lazy', function () {
		var innerType = 'uint32',
			length = 4,
			lazyType = ['lazy', innerType, length],
			blobType = ['array', 'uint8', length],
			newBinary = new jBinary(length),
			nativeAccessor = binary.read(lazyType, 0),
			externalValue = 7849234,
			externalAccessor = function () {
				return externalValue;
			};

		assert.equal(newBinary.write(lazyType, nativeAccessor), length);
		assert.equal(newBinary.tell(), length);
		assert.ok(!('value' in nativeAccessor));
		assert.deepEqual(binary.read(blobType, 0), newBinary.read(blobType, 0));

		newBinary.seek(0);
		assert.equal(newBinary.write(lazyType, externalAccessor), length);
		assert.equal(newBinary.tell(), length);
		assert.deepEqual(newBinary.read(innerType, 0), externalValue);
	});

	this.tests.forEach(function (test) {
		typeSet[test.title].isTested.setter = true;
	});
});

//-----------------------------------------------------------------

suite('Test coverage of type', function () {
	function testCoverage(typeName) {
		test(typeName, function () {
			var isTested = typeSet[typeName].isTested;
			assert.ok(isTested.getter, 'Getter tests');
			assert.ok(isTested.setter, 'Setter tests');
		});
	}

	for (var typeName in typeSet) {
		testCoverage(typeName);
	}
});