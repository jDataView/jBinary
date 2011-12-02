<a href="http://blog.vjeux.com/2011/javascript/binaryparser-unleash-javascript-power.html">jParser</a> - Parsing binary files made easy.
================================

jParser makes it easy to parse binary files in Javascript.

Blocks
======

Primitives:

  * **Unsigned Int**: uint8, uint16, uint32
  * **Signed Int**: int8, int16, int32
  * **Float**: float32, float64
  * **String**: char, [string, len]
  * **Array**: [array, type, len]


Examples
========

Basic C Structure

```javascript
header: {
  header_sz:   'uint32',
  width:   'int32',
  height: 	'int32',
  nplanes: 	'uint16',
  bitspp: 	'uint16',
  compress_type:'uint32',
  bmp_bytesz: 	'uint32',
  hres: 	'int32',
  vres: 	'int32',
  ncolors: 	'uint32',
  nimpcolors: 	'uint32'
}
```

Structure using references to other structures

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

Helpers

```javascript
float3: ['array', 'float32', 3],
float4: {
  x: 'float32',
  y: 'float32',
  z: 'float32',
  w: 'float32'
},
hex32: function () {
  return '0x' + this.parse('uint32').toString(16);
}
```

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