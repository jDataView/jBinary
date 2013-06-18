jBinary - High-level I/O for binary data.
================================

**jBinary** makes it easy to work with binary files in JavaScript.


It works on top of [jDataView](https://github.com/jDataView/jDataView) binary processing library.


Was inspired by [jParser](https://github.com/vjeux/jParser) and derived as new library with full set of I/O operations for manipulations on binary data in JavaScript.

**Typical scenario**:

  * Create your custom types using ``jBinary.Type`` (if needed).
  * Describe type set with JavaScript-compatible declarative syntax.
  * Create jBinary instance from jDataView (or any underlying type) and your type set.
  * Use it!

API
======

jBinary
-------

jBinary Constructor:

  * **new jBinary(data, typeset)**
    * ``data`` is a [jDataView](https://github.com/vjeux/jDataView) or any underlying type (in that case ``jDataView`` will be created with default parameters).
    * ``typeset`` is your typeset - object with all the defined structures.

jBinary Methods:

  * **read(type, offset=binary.tell())**: Read value of specified type. If ``offset`` given, read it from custom position, otherwise read it from current position and move pointer forward (streaming mode).
  * **write(type, data, offset=binary.tell())**: Write value of specified type. Same ``offset`` behavior.
  * **tell()**: Return the current position.
  * **seek(position)**: Go to ``position``.
  * **seek(position, callback)**: Go to ``position``, execute the ``callback`` and return to the previous position.
  * **skip(count)**: Advance in the file by ``count`` bytes.
  * **slice(start, end, forceCopy=false)**: Returns sliced version of current binary with same structure. If ``forceCopy`` set to true, underlying jDataView will be created on copy of original data not linked to it.

Internal Methods (useful for custom types):

  * **getType(type)**: Returns constructed ``jBinary.Type`` instance from given descriptor.
  * **createProperty(type)**: Constructs property from given type linked to current binary.
  * **getContext(filter)**: Get object context specified by ``filter``. Possible filter types:
    * not set - current context will be returned.
    * number - ``filter`` will be used as relative depth (0 is current context, 1 for parent and so on).
    * string - will look for closest context that contains property name equal to ``filter``.
    * function - will be used as boolean function (``true`` to stop) while bubbling up through contexts.
  * **inContext(newContext, callback)**: Executes function inside given context.

Loading/saving data:

  * **jBinary.loadData(source, callback)** (static method): Loads data from given ``source`` and returns it in Node.js-like ``callback(error, data)``. Source can be one of (if supported on current engine):
    * HTTP(S) URL (should be on the same host or allowed by [CORS](http://www.w3.org/TR/cors/) if called from browser).
    * Data-URI (simple or base64-encoded)
    * Node.js local file path.
    * Node.js [Readable stream](http://nodejs.org/api/stream.html#stream_class_stream_readable).
  * **toURI(mimeType='application/octet-stream')**: Returns URI suitable for usage in DOM elements (uses ``Blob`` URIs where supported, data-URIs in other cases, so may be problematic when using with big data in old browsers).

Type usage syntax
-----------------

Types can be used in one of the following forms:

  * String ``'typeName'`` - will be retrieved from binary's type set and used without arguments.
  * Array ```['typeName', arg1, arg2, ..., argN]``` - will be retrieved by type name and used with given argument list.
  * Structure object ``{name1: type1, name2: type2, ...}`` - shorthand for ``['object', structure]`` - please see below for details.
  * Bit length number - shorthand for ``['bitfield', length]`` - please see below for details.

Default types
-------------

* **Integers**:
    * ``uint8`` / ``int8`` - one-byte integer.
    * ``uint16`` / ``int16`` - word.
    * ``uint32`` / ``int32`` - dword (double-word).
    * ``uint64`` / ``int64`` - qword - please see warning about precision loss in [jDataView documentation](https://github.com/jdataview/jdataview#readme).

* **Floats**:
    * ``float32``.
    * ``float64``.

* **Strings**:
    * ``char`` - one binary character.
    * ``string(length, encoding='binary')`` - string of given length in binary or 'utf8' encoding; falls to ``string0`` if ``length`` is not given.
    * ``string0(length, encoding='binary')`` - null-terminated string stored in given number of bytes; treated as dynamic null-terminated string if ``length`` is not given.

* **Complex types**:
    * ``const(baseType, value, strict)`` - treats type as constant, throws ``TypeError`` if read value does not match expected.
    * ``array(baseType, length)`` - array of given type and length, reads/writes to the end of file if ``length`` is not given.
    * ``object(structure)`` - complex object of given structure (name => type), creates new context while processing inner properties; object may also contain functions instead of types for calculating some values during read/write for internal purposes.
    * ``extend(...object structures...)`` - extends one structure with others; merges data into one object when reading and passing entire object when writing.
    * ``enum(baseType, matches)`` - enumeration type with given key <=> value map (if value not found there, it's used "as-is").

* **Binary types**:
    * ``bitfield(length)`` - unsigned integer of given bit length (supports up to 32 bits, wraps around 2^32).
    * ``blob(length)`` - byte array represented in most native type for current engine; reads/writes to the end of file if ``length`` is not given.
    
* **Control statements**:
    * ``if(condition, trueType, falseType)`` - conditional statement where ``condition`` can be boolean function or name of field in current context.
    * ``if_not(condition, trueType, falseType)`` - same but inverted.
    * ``skip(length)`` - simply skips given length on read/write.

Custom types
------------

**jBinary.Type** Constructor:

  * **jBinary.Type(config)**

Config must contain following methods:

  * **read(context)** - required for reading data, gets current ``context`` in argument for internal purposes.
  * **write(data, context)** - required for writing data, also gets current ``context``.

Config may contain additional options:

  * **params** - array of names of internal parameters to be retrieved from arguments list type was called with.
  * **setParams(...params...)** - additional/custom initialization method with input arguments while creating type.
  * **resolve(getType)** - inside this function type should resolve it's inner dependency types using given ``getType`` method so it could be cached by engine.
  * **...add anything else you want to be able to access in property instances...**

**jBinary.Template** is useful for creating custom wrapper around underlying type.

Methods:

  * **baseRead()** - reads underlying type value.
  * **baseWrite(data)** - writes value as underlying type.

Base type, template is wrapped around, should be specified using one of the following methods:

  * Config option **baseType** - static base type.
  * Property **baseType** set inside **setParams** initialization method.
  * Config property **getBaseType(context)** - method to get base type dynamically depending on current ``context`` in the moment of creating property before I/O operation.
  
First two cases are preferred if possible since they will automatically resolve and cache underlying type.

Get Started
===========

**NodeJS**: Just use ```npm``` to install ```jBinary``` and you are set :)

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

**Browser**:

```html
<script src="https://raw.github.com/vjeux/jDataView/master/src/jdataview.js"></script>
<script src="https://raw.github.com/vjeux/jBinary/master/src/jbinary.js"></script>

<script>
jBinary.loadData('file.bin', function (err, data) {
  var binary = new jBinary(data, {
    magic: ['array', 'uint8', 4]
  });
  console.log(binary.read('magic'));
});
</script>
```

**AMD**:

```html
<script>
require(['jBinary'], function (jBinary) {
	// ...your code goes here...
})
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

Coming soon...