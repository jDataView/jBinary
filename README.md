<a href="http://blog.vjeux.com/2011/javascript/binaryparser-unleash-javascript-power.html">jParser</a> - Parsing binary files made easy.
================================

jParser makes it easy to parse binary files in Javascript.

API
======

Primitive Structures:

  * **Unsigned Int**: uint8, uint16, uint32
  * **Signed Int**: int8, int16, int32
  * **Float**: float32, float64
  * **String**: char, [string, len]
  * **Array**: [array, type, len]

jParser methods:

  * **parse(structure)**: Run the parsing, can be used recursively.
  * **tell()**: Return the current position.
  * **skip(count)**: Advance in the file by ``count`` bytes.
  * **seek(position)**: Go to ``position``.
  * **seek(position, callback)**: Go to ``position``, execute the ``callback`` and return to the previous position.

jParser constructor:

  * **new jParser(data, structure)**
    * ``data`` can be a String, [ArrayBuffer](https://developer.mozilla.org/en/JavaScript_typed_arrays), [Node Buffer](http://nodejs.org/docs/v0.6.2/api/buffers.html) or [jDataView](https://github.com/vjeux/jDataView).
    * ``structure`` is an object with all the defined structures.

Examples
========

**Basic C Structure**
You have the ability to define C-like structures. It's a Javascript object where keys are labels and values are types.

```javascript
header: {
  fileId: 'int32',
  recordIndex: 'int32',
  hash: ['array', 'uint32', 8],
  fileName: ['string', 256],
}
```

**References**
Structures can reference other structures. Use structure name within a string in order to reference it. The following is an example from World of Warcraft model files.

```javascript
nofs: {
  count: 'uint32',
  offset: 'uint32'
},
 
animationBlock: {
  interpolationType: 'uint16',
  globalSequenceID: 'int16',
  timestamps: 'nofs',
  keyFrame: 'nofs'
},
 
uvAnimation: {
  translation: 'animationBlock',
  rotation: 'animationBlock',
  scaling: 'animationBlock'
}
```

**Helpers**
It is really easy to make new primitive types. You can either use existing constructions such as objects (```float3```) or arrays (```float4```). In case you want to do something more complicated, you always have the option to define a new function and use ```this.parse``` to keep parsing (```hex32```, ```string0```).

```javascript
float3: {
  x: 'float32',
  y: 'float32',
  z: 'float32'
},
float4: ['array', 'float32', 4],
hex32: function () {
  return '0x' + this.parse('uint32').toString(16);
},
string0: function (length) {
  return this.parse(['string', length]).replace(/[\u0000]+$/g, '');
}
```

**Control Parsing** The best part of jParser is that complicated parsing logic can be expressed within the structure. It allows to parse complex files without having to split structure from parsing code.

```javascript
entryHeader: {
  start: 'int32',
  count: 'int32'
},

entry: function (type) {
  var that = this;
  var header = this.parse('entryHeader');

  var res = [];
  this.seek(header.start, function () {
    for (var i = 0; i < header.count; ++i) {
      res.push(that.parse(type));
    }
  });
  return res;
},

name: {
 language: 'int32',
 text: ['string', 256]
},

file: {
  names: ['entry', 'name']
}
```