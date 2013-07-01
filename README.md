jBinary - High-level I/O for binary data.
=========================================

jBinary makes it easy to work with binary files in JavaScript.

It works on top of [jDataView](https://github.com/jDataView/jDataView) binary processing library.

Was inspired by [jParser](https://github.com/vjeux/jParser) and derived as new library with full set of I/O operations for manipulations on binary data in JavaScript.

Typical scenario
----------------

  * Create your custom types using `jBinary.Type` (if needed).
  * Describe type set with JavaScript-compatible declarative syntax.
  * Create jBinary instance from jDataView (or any underlying type) and your type set.
  * Use it!

jBinary API
===========

jBinary Constructor
-------------------

  * `new jBinary(data, typeSet)`
    * `data` is a [jDataView](https://github.com/jDataView/jDataView) or any underlying type (in that case `jDataView` will be created with default parameters).
    * `typeSet` is your type set - object with all the defined types.

jBinary Methods
---------------

  * `read(type, offset = binary.tell())`: Read value of specified type. If `offset` given, read it from custom position, otherwise read it from current position and move pointer forward (streaming mode).
  * `write(type, data, offset = binary.tell())`: Write value of specified type. Same `offset` behavior.
  * `tell()`: Return the current position.
  * `seek(position)`: Go to `position`.
  * `seek(position, callback)`: Go to `position`, execute the `callback` and return to the previous position.
  * `skip(count)`: Advance in the file by `count` bytes.
  * `slice(start, end, forceCopy = false)`: Returns sliced version of current binary with same type set. If `forceCopy` set to true, underlying jDataView will be created on copy of original data not linked to it.

Typesets
========

Typesets normally contain dictionary of `typeName => type` pairs, but they may also contain special config values that set some global options or modes for entire typeset.

As for now, such options are:

  * `jBinary.littleEndian` - sets endianness for this format.
  * `jBinary.mimeType` - sets mime-type which should be used for saving data from this typeset (i.e., when calling `toURI` without argument).

The Repo
--------

jBinary provides special [Repo](https://jdataview.github.io/jBinary.Repo/) for popular file formats and corresponding demos.

Using standard typesets is easy - just make [require](http://requirejs.org/docs/api.html)-like call to `jBinary.Repo` async loader method.

You can call it with one typeset name:

```javascript
jBinary.Repo('bmp', function (BMP) {
  var binary = new jBinary(data, BMP);
});
```

Or with list of names:

```javascript
jBinary.Repo(['tar', 'gzip'], function (TAR, GZIP) {
  // your code goes here ;)
});
```

All the typesets that are already loaded, are stored inside `jBinary.Repo` itself with upper-case names of typesets used as keys (like `jBinary.Repo.BMP`).

If you know some popular format structure and can write own typeset, you're welcome [to contribute](https://github.com/jDataView/jBinary.Repo/#readme)!

Typeset associations
--------------------

Inside the Repo, there is also [associations.js](https://github.com/jDataView/jBinary.Repo/blob/gh-pages/associations.js) file which provides associations between typesets and corresponding file name extensions & mime types.

jBinary uses those associations for loading data from external sources when typeset is not specified explicitly.

If you want your typeset to be associated with special file extensions or some mime-types, simply add entry into `descriptors` object in this file like:

```javascript
var descriptors = {
  // ...
  tar: {
    extensions: ['tar'],
    mimeTypes: ['application/tar', 'application/x-tar', 'applicaton/x-gtar', 'multipart/x-tar']
  }
};
```

Loading/saving data
-------------------

In most cases you don't have binary data hard-coded in your JavaScript (why do you need any operation on it otherwise, eh?).

So you need to get this data from some external source and show result when you are done.

And `jBinary` provides handy methods for that:

  * `jBinary.loadData(source, callback)` (static method):

    Loads data from given `source` and returns it in Node.js-like `callback(error, data)`.

    Source can be one of (if supported on current engine):

    * [Blob](https://developer.mozilla.org/en-US/docs/Web/API/Blob) / [File](https://developer.mozilla.org/en-US/docs/Web/API/File) instance ([HTML5 File API](http://www.w3.org/TR/FileAPI/)).
    * HTTP(S) URL (should be on the same host or allowed by [CORS](http://www.w3.org/TR/cors/) if called from browser).
    * [Data-URI](https://developer.mozilla.org/en-US/docs/data_URIs) (simple or base64-encoded).
    * Node.js local file path.
    * Node.js [Readable stream](http://nodejs.org/api/stream.html#stream_class_stream_readable).

  * `jBinary.load(source, [typeSet,] callback)` (static method):

  Loads data from given `source` using `jBinary.loadData`, detects typeset using Repo associations if it's not specified explicitly, creates `jBinary` instance on this data and typeset and returns it in `callback(error, binary)`.


  * `toURI(mimeType = 'application/octet-stream')`

  Returns URI suitable for usage in DOM elements (uses `Blob` URIs where supported, data-URIs in other cases, so may be problematic when creating from big data in old browsers).

**Example**:

```javascript
jBinary.load('sample.tar', function (error, binary) {
  if (error) {
    return console.log(error);
  }

  // here TAR format is auto-detected and used by `binary`
  var tar = binary.read('File');

  // ... more code ...
});
```

Internal jBinary Methods (useful for custom types)
--------------------------------------------------

  * `getType(type)`: Returns constructed `jBinary.Type` instance from given descriptor.
  * `createProperty(type)`: Constructs property from given type linked to current binary.
  * `getContext(filter)`: Get object context specified by `filter`. Possible filter types:
    * not set - current context will be returned.
    * number - `filter` will be used as relative depth (0 is current context, 1 for parent and so on).
    * string - will look for closest context that contains property name equal to `filter`.
    * function - will be used as boolean function (`true` to stop) while bubbling up through contexts.
  * `inContext(newContext, callback)`: Executes function inside given context.

Type usage syntax
=================

Types can be used in any of the following forms:

  * String `'typeName'` - will be retrieved from binary's type set and used without arguments.
  * Array `['typeName', arg1, arg2, ..., argN]` - will be retrieved by type name and used with given argument list.
  * Structure object `{name1: type1, name2: type2, ...}` - shorthand for `['object', structure]` - please see below for details.
  * Bit length number - shorthand for `['bitfield', length]` - please see below for details.

Standard types
==============

Integers
--------

  * `uint8` (`byte`) / `int8` - one-byte integer.
  * `uint16` / `int16` - word.
  * `uint32` / `int32` - dword (double-word).
  * `uint64` / `int64` - qword - please see warning about precision loss in [jDataView documentation](https://github.com/jdataview/jdataview#readme).

Floats
------

  * `float32` (`float`) - classic 32-bit `float` used in languages like C.
  * `float64` (`double`) - 64-bit float with double precision (`double` in C), default for JavaScript number representation.

Strings
-------

  * `char` - one-byte binary character.
  * `string(@length, encoding = 'binary')` - string of given length in binary or 'utf8' encoding, reads/writes to the end of binary if `length` is not given.
  * `string0(@length, encoding = 'binary')` - null-terminated string stored in given number of bytes; treated as dynamic null-terminated string if `length` is not given.

Complex types
-------------

  * `const(baseType, value, strict = false)` - treats type as constant; if read value does not match expected and strict mode is enabled, calls `strict(readValue)` if it is function or simply throws `TypeError` if not.
  * `array(baseType, @length)` - array of given type and length, reads/writes to the end of binary if `length` is not given.
  * `object(structure)` - complex object of given structure (name => type), creates new context while processing inner properties; object may also contain functions instead of types for calculating some values during read/write for internal purposes.
  * `extend(...object structures...)` - extends one structure with others; merges data into one object when reading and passing entire object when writing.
  * `enum(baseType, matches)` - enumeration type with given key <=> value map (if value not found in the map, it's used "as-is").

Binary types
------------

  * `bitfield(length)` - unsigned integer of given bit length (supports up to 32 bits, wraps around 2^32).
  * `blob(@length)` - byte array represented in most native type for current engine; reads/writes to the end of binary if `length` is not given.
  * `binary(@length, typeSet = {})` - jBinary instance on part of original one with given length and optional custom typeset (useful for container formats); accepts also raw binary data when writing.
    
Control statements
------------------
  * `if(@condition, trueType, falseType)` - conditional statement.
  * `if_not(@condition, falseType, trueType)` - same but inverted.
  * `skip(@length)` - simply skips given length on read/write.

References
----------

All the arguments marked with `@`(references) can be passed not only as direct values, but also as getter functions `callback(context)` or string property names inside current context chain.

jBinary.Type
============

Type Constructor
----------------

When you need extra functionality that you can't achieve using declarative syntax, you are able to create and reuse your own types in the same way standard types are used.

Creating type is simple:

  * `jBinary.Type(config)`

In property instances, you can access `this.binary` for accessing `jBinary` instance this property belongs to.

Required methods
----------------

Config must contain following methods for I/O operations

  * `read(context)` - required for reading data, gets current `context` in argument for internal purposes.
  * `write(data, context)` - required for writing data, also gets current `context`.

Additional options
------------------

Config may contain following optional parameters:

  * `params` - array of names of internal parameters to be retrieved from arguments list type was called with.
  * `setParams(...params...)` - additional/custom initialization method with input arguments while creating type.
  * `resolve(getType)` - inside this function type should resolve it's inner dependency types using given `getType` method so it could be cached by engine.
  * *...add anything else you want to be able to access in property instances...*

Internal methods
----------------

All following methods (except `toValue`) you wouldn't need to call nor override in most cases since it may break basic type functionality, so before using them make sure you really need that and are doing that right.

  * `toValue(value, allowResolve = true)` - call this method on your type instance when you want to use reference arguments like they are used in standard types.
  * `inherit(args, getType)` - this method is internally called on creating type with given arguments (or without them) and getType provider for resolving dependencies; in most cases you shouldn't override or call it on yourself.
  * `createProperty(binary)` - creates property of current type, linked to given `jBinary` instance; you may override it when you need to hook property creation, but don't forget to call underlying method.

jBinary.Template
================

Constructor
-----------

jBinary.Template is useful when you want to wrap some basic type but override some of it's options or functionality.

Creating is pretty similar to simple custom type:

  * `jBinary.Template(config)`

Base type
---------

Base type for template should be specified using one of the following methods:

  * Config option `baseType` - static base type.
  * Property `baseType` set inside `setParams` initialization method.
  * Config property `getBaseType(context)` - method to get base type dynamically depending on current `context` in the moment of creating property before I/O operation.
  
First two cases are preferred if possible since they will automatically resolve and cache underlying type.

Extra methods
-------------

`jBinary.Template` instance has following extra methods compared to `jBinary.Type` that you can use in your implementations:

  * `baseRead()` - reads underlying type value.
  * `baseWrite(data)` - writes value as underlying type.

Usage
=====

Node.JS
-------

Just use `npm` to install `jBinary` and you are set :)

```bash
npm install jBinary
```


```javascript
var fs = require('fs');
var jBinary = require('jBinary');

jBinary.loadData('file.bin', function (err, data) {
  var binary = new jBinary(data, {
    magic: ['array', 'uint8', 4]
  });
  console.log(binary.read('magic'));
});
```

Browser
-------

Include scripts for `jDataView` and `jBinary` like that:

```html
<script src="https://rawgithub.com/jDataView/jDataView/master/src/jDataView.js"></script>
<script src="https://rawgithub.com/jDataView/jBinary/master/src/jBinary.js"></script>

<script>
jBinary.loadData('file.bin', function (err, data) {
  var binary = new jBinary(data, {
    magic: ['array', 'uint8', 4]
  });
  console.log(binary.read('magic'));
});
</script>
```

AMD
---

`jBinary` supports dynamic loading via AMD too:

```html
<script>
require(['jBinary'], function (jBinary) {
	// ...your code goes here...
})
</script>
```

Caveats
-------

This tool works thanks to a feature that is not in the JavaScript specification: When you iterate over an object keys, the keys will be listed in their order of insertion. Note that Chrome and Opera do not respect this implicit rule for keys that are numbers.

If you follow those two rules, the library will work in all the current JavaScript implementations.

 * Do not start a key name with a digit
 * Do not put the same key twice in the same object

Demos
-----

Please check out [jBinary.Repo](https://jDataView.github.io/jBinary.Repo/) for demos of some popular format and feel free to submit more!

License
-------

This library is provided under [MIT license](https://raw.github.com/jDataView/jBinary/master/MIT-license.txt).