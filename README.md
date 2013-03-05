<a href="http://blog.vjeux.com/2011/javascript/binaryparser-unleash-javascript-power.html">jParser</a> - Parsing binary files made easy.
================================

jParser makes it easy to parse binary files in Javascript.

 * You write the structure once, it gets parsed automatically.
 * The parsing process can be extended with custom functions. It allows to parse non trivial files with ease.
 * It works both in the browser and NodeJS as it is powered by [jDataView](https://github.com/vjeux/jDataView).

API
======

Primitive Structures:

  * **Unsigned Int**: uint8, uint16, uint32
  * **Signed Int**: int8, int16, int32
  * **Float**: float32, float64
  * **String**: char, string(len)
  * **Array**: array(type, len)
  * **Position**: tell, skip(len), seek(pos), seek(pos, func)
  * **BitField**: bitfield(structure, bitShift)
    * ``structure`` is ``Object`` with keys as field names and bit-sizes of each value (functions returning bit-sizes can be used as well); can contain sub-structures inside.
    * ``bitField`` is starting binary shift (if needed).
    * BitField values are returned as unsigned integer (so you can work with them using simple JavaScript binary operators).
    * Left-to-right (like big-endian) mode is the only supported for now.
    * BitField structures are always padded to one byte after parsing.

jParser Methods:

  * **parse(value)**: Run the parsing, can be used recursively.
    * **Function**: Calls the function.
    * **String**: Dereferences the value in the structure.
    * **Array**: Function call, the function is the first element and arguments are the following.
    * **Object**: Returns an object with the same keys and parses the values.
  * **tell()**: Return the current position.
  * **skip(count)**: Advance in the file by ``count`` bytes.
  * **seek(position)**: Go to ``position``.
  * **seek(position, callback)**: Go to ``position``, execute the ``callback`` and return to the previous position.
  * **current**: The current object being parsed. See it as a way to use what has been parsed just before.

jParser Constructor:

  * **new jParser(data, structure)**
    * ``data`` is a [jDataView](https://github.com/vjeux/jDataView). You can give pretty much anything (String, [ArrayBuffer](https://developer.mozilla.org/en/JavaScript_typed_arrays), [Node Buffer](http://nodejs.org/docs/v0.6.2/api/buffers.html)), it will be casted to jDataView automatically.
    * ``structure`` is an object with all the defined structures.

Examples
========

**Basic C Structure**
You have the ability to define C-like structures. It's a Javascript object where keys are labels and values are types.

```javascript
var parser = new jParser(file, {
  header: {
    fileId: 'int32',
    recordIndex: 'int32',
    hash: ['array', 'uint32', 4],
    fileName: ['string', 256],
    flags: ['bitfield', {
      version: 2,
      precisionFlag: 1,
      availabilityFlag: 1,
      marker: {
       part1: 2,
       part2: 2
      }
    }]
  }
});
parser.parse('header');
// {
//   fileId: 42,
//   recordIndex: 6002,
//   hash: [4237894687, 3491173757, 3626834111, 2631772842],
//   fileName: ".\\Resources\\Excel\\Items_Weapons.xls",
//   flags: {
//     version: 3,
//     precisionFlag: 0,
//     availabilityFlag: 1,
//     marker: {
//       part1: 2,
//       part2: 0
//     }
//   }
// }
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
  return this.parse(['string', length]).replace(/\0+$/g, '');
}
```

**Back Reference** Instead of using an integer for the array size, you can put a function that will return an integer. In this function, you can use ```this.current``` to reference the englobing object being parsed.

```javascript
image: {
  width: 'uint8',
  height: 'uint8',
  pixels: [
    'array',
    ['array', 'rgba', function () { return this.current.width; }],
    function () { return this.current.height; }
  ]
}
```

**Advanced Parsing** The best part of jParser is that complicated parsing logic can be expressed within the structure. It allows to parse complex files without having to split structure from parsing code.

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


Get Started
=======

**NodeJS**: Just use ```npm``` to install ```jParser``` and you are set :)

```bash
npm install jParser
```

```javascript
var fs = require('fs');
var jParser = require('jParser');

fs.readFile('file.bin', function (err, data) {
  var parser = new jParser(data, {
    magic: ['array', 'uint8', 4]
  });
  console.log(parser.parse('magic'));
});
```

**Browser**: I've [patched jQuery](https://github.com/vjeux/jDataView/blob/master/jquery/jquery-patch.txt) to allow to download binary files using the best binary format. You include this patched jQuery, jDataView and jParser and you are set :)

```html
<script src="https://raw.github.com/vjeux/jDataView/master/jquery/jquery-1.7.1-binary-ajax.js"></script>
<script src="https://raw.github.com/vjeux/jDataView/master/src/jdataview.js"></script>
<script src="https://raw.github.com/vjeux/jParser/master/src/jparser.js"></script>

<script>
$.get('file.bin', function (data) {
  var parser = new jParser(data, {
    magic: ['array', 'uint8', 4]
  });
  console.log(parser.parse('magic'));
}, 'dataview');
</script>
```

Caveats
=======

This tool works thanks to a feature that is not in the Javascript specification: When you iterate over an object keys, the keys will be listed in their order of insertion. Note that Chrome and Opera do not respect this implicit rule for keys that are numbers.

If you follow those two rules, the library will work in all the current Javascript implementations.

 * Do not start a key name with a digit
 * Do not put the same key twice in the same object


Demos
=====

**ICO Parser**. This is a basic example to parse a binary file in NodeJS. It shows how to solve many common issues with binary file parsing.

 * **[ico.js](https://github.com/vjeux/jParser/blob/master/sample/ico/ico.node.js)**: jParser structure.
 * [ico.json](http://fooo.fr/~vjeux/github/jParser/sample/ico/favicon.json): parsed file.

**[Tar Extractor](http://fooo.fr/~vjeux/github/jParser/sample/tar/tar.html)**. This is a basic example to parse a binary file in the browser.

 * **[tar.html](https://github.com/vjeux/jParser/blob/master/sample/tar/tar.html)**: jParser structure.

**<a href="http://fooo.fr/~vjeux/github/jsWoWModelViewer/modelviewer.html">World of Warcraft Model Viewer</a>.** It uses jParser to read the binary model and then WebGL to display it.

  * **[m2.js](http://fooo.fr/~vjeux/github/jsWoWModelViewer/scripts/m2.js)**: jParser structure.
  * [model.json](http://fooo.fr/~vjeux/github/jsWoWModelViewer/model.json): parsed file.

<a href="http://fooo.fr/~vjeux/github/jsWoWModelViewer/modelviewer.html"><img src="http://fooo.fr/~vjeux/github/jsWoWModelViewer/images/modelviewer.png"></a>

**Diablo 3 Internal Files**.

  * **[convert.coffee](http://fooo.fr/~vjeux/boub/d3/files/convert.coffee)**: jParser structure. CoffeeScript makes it even easier to write file structure.
  * Example of parsed files:
    * [Items_Weapons.json](http://fooo.fr/~vjeux/boub/d3/files/GameBalance/Items_Weapons.json)
    * [Quest/ProtectorOfTristam.json](http://fooo.fr/~vjeux/boub/d3/files/Quest/ProtectorOfTristram.json)
    * [TreasureClass/SkeletonKing](http://fooo.fr/~vjeux/boub/d3/files/TreasureClass/SkeletonKing.json)
