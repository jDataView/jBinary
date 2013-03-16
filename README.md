jBinary - Manipulating binary files made easy.
================================

jBinary makes it easy to parse and build binary files in JavaScript.
It's derived from [jParser](https://github.com/vjeux/jParser) binary parsing library as new tool with full set of I/O operations for manipulations on binary data in JavaScript.

 * You write the structure once, it gets parsed or built automatically.
 * Both parsing and building processes can be extended with custom functions. It allows to manipulate non trivial files with ease.
 * It works both in the browser and NodeJS as it is powered by [jDataView](https://github.com/vjeux/jDataView) (or, actually, it's [extended version](https://github.com/RReverser/jDataView) that is now successfully merged into primary repo).

API
======

Primitive Structures:

  * **Unsigned Int**: uint8, uint16, uint32
  * **Signed Int**: int8, int16, int32
  * **Float**: float32, float64
  * **String**: char, string(len)
  * **BitField**: (bitCount)

Extensions:

  * **Array**: array(type, len)
  * **Position**: tell, skip(len), seek(pos), seek(pos, func)
  * **Conditionals**: if(predicate, type)

jBinary Methods:

  * **parse(type)**: Run the parsing, can be used recursively.
    * **Number**: Reads bitfield of given length in left-to-right mode and returns them as unsigned integer
      (so you can work with them using simple JavaScript binary operators).
      Please note that you can mix bitfields with primitive and complex types in one structure or even use
      them in own functions, but **ALWAYS** make sure that consecutive bitfields are padded to integer
      byte count (or **8*N bit count**) before reading any other data types; most popular data formats
      already follow this rule but better to check out when writing own structures if you don't want
      to get unexpected behavior.
    * **Function**: Calls the function.
    * **String**: Dereferences the value in the structure.
    * **Array**: Function call, the function is the first element and arguments are the following.
    * **Object**: Returns an object with the same keys and parses the values.
  * **write(type, data)**: Run the writing binary data (works in the same way parse does, but accepts additional data parameter).
  * **modify(type, callback)**: Parse data at current position, pass it to callback and write returned or just modified data object at current position.
  * **tell()**: Return the current position.
  * **skip(count)**: Advance in the file by ``count`` bytes.
  * **seek(position)**: Go to ``position``.
  * **seek(position, callback)**: Go to ``position``, execute the ``callback`` and return to the previous position.
  * **current**: The current object being parsed. See it as a way to use what has been parsed just before.

jBinary Constructor:

  * **new jBinary(data, structure)**
    * ``data`` is a [jDataView](https://github.com/vjeux/jDataView). You can give pretty much anything (String, Array, [ArrayBuffer](https://developer.mozilla.org/en/JavaScript_typed_arrays), [Node Buffer](http://nodejs.org/docs/v0.6.2/api/buffers.html)), it will be casted to jDataView automatically.
    * ``structure`` is an object with all the defined structures.

jBinary Property Constructor:

  * **jBinary.Property(reader, writer, forceNew = false)**
    * ``reader`` is function for parsing data read from current position.
    * ``writer`` is function for writing binary representation of data at current position; should accept same parameter list as reader does + additional data parameter.
    * ``forceNew`` is optional parameter that forces creation of new function to be returned from property constructor instead or modifying original ``reader``.

Examples
========

**Basic C Structure**
You have the ability to define C-like structures. It's a JavaScript object where keys are labels and values are types.

```javascript
var parser = new jBinary(file, {
  header: {
    fileId: 'int32',
    recordIndex: 'int32',
    hash: ['array', 'uint32', 4],
    fileName: ['string', 256],
    version: 2,
    flags: {
      precisionFlag: 1,
      marker: {
       part1: 2,
       part2: 2
      }
    },
    _reserved: 1 // padding to 8*N bits
  }
});

// Parsing:
var header = parser.parse('header');
// {
//   fileId: 42,
//   recordIndex: 6002,
//   hash: [4237894687, 3491173757, 3626834111, 2631772842],
//   fileName: ".\\Resources\\Excel\\Items_Weapons.xls",
//   version: 3,
//   flags: {
//     precisionFlag: 1,
//     marker: {
//       part1: 2,
//       part2: 0
//     }
//   },
//   _reserved: 0
// }


// Writing:
parser.seek(0);
header.flags.precisionFlag = 0;
parser.write('header', header);

// In-place editing:
parser.seek(0);
parser.modify('header', function (header) {
  header.flags.precisionFlag = 0;
  // return header; - not necessary here since we are modifying original object
});
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

**Advanced Parsing** The best part of jBinary is that complicated logic can be expressed within the structure. It allows to parse complex files without having to split structure from parsing code.

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

**NodeJS**: Just use ```npm``` to install ```jBinary``` and you are set :)

```bash
npm install jBinary
```

```javascript
var fs = require('fs');
var jBinary = require('jBinary');

fs.readFile('file.bin', function (err, data) {
  var parser = new jBinary(data, {
    magic: ['array', 'uint8', 4]
  });
  console.log(parser.parse('magic'));
});
```

**Browser**: [Vjeux](https://github.com/vjeux/) had [patched jQuery](https://github.com/vjeux/jDataView/blob/master/jquery/jquery-patch.txt) to allow to download binary files using the best binary format. You include this patched jQuery, jDataView and jBinary and you are set :)

```html
<script src="https://raw.github.com/vjeux/jDataView/master/jquery/jquery-1.7.1-binary-ajax.js"></script>
<script src="https://raw.github.com/vjeux/jDataView/master/src/jdataview.js"></script>
<script src="https://raw.github.com/vjeux/jBinary/master/src/jbinary.js"></script>

<script>
$.get('file.bin', function (data) {
  var parser = new jBinary(data, {
    magic: ['array', 'uint8', 4]
  });
  console.log(parser.parse('magic'));
}, 'dataview');
</script>
```

Caveats
=======

This tool works thanks to a feature that is not in the JavaScript specification: When you iterate over an object keys, the keys will be listed in their order of insertion. Note that Chrome and Opera do not respect this implicit rule for keys that are numbers.

If you follow those two rules, the library will work in all the current JavaScript implementations.

 * Do not start a key name with a digit
 * Do not put the same key twice in the same object


Demos
=====

**ICO Parser**. This is a basic example to parse a binary file in NodeJS. It shows how to solve many common issues with binary file parsing.

 * **[ico.js](https://github.com/vjeux/jBinary/blob/master/sample/ico/ico.node.js)**: jBinary structure.
 * [ico.json](http://fooo.fr/~vjeux/github/jBinary/sample/ico/favicon.json): parsed file.

**[Tar Extractor](http://fooo.fr/~vjeux/github/jBinary/sample/tar/tar.html)**. This is a basic example to parse a binary file in the browser.

 * **[tar.html](https://github.com/vjeux/jBinary/blob/master/sample/tar/tar.html)**: jBinary structure.

**<a href="http://fooo.fr/~vjeux/github/jsWoWModelViewer/modelviewer.html">World of Warcraft Model Viewer</a>.** It uses jBinary to read the binary model and then WebGL to display it.

  * **[m2.js](http://fooo.fr/~vjeux/github/jsWoWModelViewer/scripts/m2.js)**: jBinary structure.
  * [model.json](http://fooo.fr/~vjeux/github/jsWoWModelViewer/model.json): parsed file.

<a href="http://fooo.fr/~vjeux/github/jsWoWModelViewer/modelviewer.html"><img src="http://fooo.fr/~vjeux/github/jsWoWModelViewer/images/modelviewer.png"></a>

**Diablo 3 Internal Files**.

  * **[convert.coffee](http://fooo.fr/~vjeux/boub/d3/files/convert.coffee)**: jBinary structure. CoffeeScript makes it even easier to write file structure.
  * Example of parsed files:
    * [Items_Weapons.json](http://fooo.fr/~vjeux/boub/d3/files/GameBalance/Items_Weapons.json)
    * [Quest/ProtectorOfTristam.json](http://fooo.fr/~vjeux/boub/d3/files/Quest/ProtectorOfTristram.json)
    * [TreasureClass/SkeletonKing](http://fooo.fr/~vjeux/boub/d3/files/TreasureClass/SkeletonKing.json)
