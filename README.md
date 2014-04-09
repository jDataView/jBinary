jBinary - High-level I/O for binary data. [![Build Status](https://travis-ci.org/jDataView/jBinary.png?branch=master)](https://travis-ci.org/jDataView/jBinary) [![NPM version](https://badge.fury.io/js/jbinary2.png)](https://npmjs.org/package/jbinary2)
=========================================

jBinary makes it easy to work with binary files in JavaScript.

It works on top of [jDataView](https://github.com/jDataView/jDataView) binary processing library.

Was inspired by [jParser](https://github.com/vjeux/jParser) and derived as new library with full set of I/O operations for manipulations on binary data in JavaScript.

Typical scenario
================

  * Create your custom types using `jBinary.Type` (if needed).
  * Describe type set with JavaScript-compatible declarative syntax.
  * Create jBinary instance from jDataView (or any underlying type) and your type set.
  * Use it!

Example (JSBin: [Run](http://jsbin.com/gopekewi/1/), [Edit](http://jsbin.com/gopekewi/1/watch?js,console))
=======

```javascript
// configuring paths for Require.js (you can use CommonJS (Component, Node.js) or simple script tags as well)
require.config({
  paths: {
    jdataview: '//jdataview.github.io/dist/jdataview',
    jbinary: '//jdataview.github.io/dist2/jbinary',
    TAR: '//jdataview.github.io/jBinary.Repo/typeSets/tar' // TAR archive typeset
  }
});

require(['jbinary', 'TAR'], function (jBinary, TAR) {
  // loading TAR archive with given typeset
  jBinary.load('http://www.corsproxy.com/jdataview.github.io/jBinary.Repo/demo/tar/sample.tar', TAR).then(function (jb) {
    // got jBinary instance as Promise result

    // read everything using type aliased in TAR['jBinary.all']
    var files = jb.readAll();

    // do something with files in TAR archive (like log info and rename them to upper case)
    files.forEach(function (file) {
      console.log(file.name + ' (' + Math.round(file.size / 1024) + ' KB)');
      file.name = file.name.toUpperCase();
    });

    jb.seek(0); // reusing same instance (and memory buffer) by resetting pointer
    jb.writeAll(files); // writing entire content from files array

    jb.saveAs('sample.new.tar'); // calling browser "save as" dialog (or saving to disk if called from Node.js)
  });
});
```

[Documentation](https://github.com/jDataView/jBinary/wiki)
===============

  * General API
    * [jBinary Constructor](https://github.com/jDataView/jBinary/wiki/jBinary-Constructor)
    * [jBinary Methods](https://github.com/jDataView/jBinary/wiki/jBinary-Methods)
      * [Reading/Writing](https://github.com/jDataView/jBinary/wiki/jBinary-Methods#readingwriting)
      * [Position methods](https://github.com/jDataView/jBinary/wiki/jBinary-Methods#position-methods)
      * [Instance helpers](https://github.com/jDataView/jBinary/wiki/jBinary-Methods#instance-helpers)
    * [Internal jBinary Methods (useful for custom types)](https://github.com/jDataView/jBinary/wiki/Internal-jBinary-Methods)
  * Usage
    * [Node.js](https://github.com/jDataView/jBinary/wiki/Usage-in-Node.js)
    * [Browser](https://github.com/jDataView/jBinary/wiki/Usage-in-Browser)
    * [AMD](https://github.com/jDataView/jBinary/wiki/Usage-with-AMD)
    * [Type usage syntax](https://github.com/jDataView/jBinary/wiki/Type-usage-syntax)
  * [Loading/saving data (working with external data storages)](https://github.com/jDataView/jBinary/wiki/Loading-and-saving-data)
  * [Typesets](https://github.com/jDataView/jBinary/wiki/Typesets)
    * [Standard types](https://github.com/jDataView/jBinary/wiki/Standard-types)
      * [Integers](https://github.com/jDataView/jBinary/wiki/Standard-types#integers)
      * [Floats](https://github.com/jDataView/jBinary/wiki/Standard-types#floats)
      * [Strings](https://github.com/jDataView/jBinary/wiki/Standard-types#strings)
      * [Complex types](https://github.com/jDataView/jBinary/wiki/Standard-types#complex-types)
      * [Binary types](https://github.com/jDataView/jBinary/wiki/Standard-types#binary-types)
      * [Control statements](https://github.com/jDataView/jBinary/wiki/Standard-types#control-statements)
    * Custom types
      * [Custom types creation (jBinary.Type)](https://github.com/jDataView/jBinary/wiki/jBinary.Type)
      * [Types wrapping (jBinary.Template)](https://github.com/jDataView/jBinary/wiki/jBinary.Template)
      * [Caveats](https://github.com/jDataView/jBinary/wiki/Caveats)
    * Ready-to-use typesets
      * [The Repo](https://github.com/jDataView/jBinary/wiki/The-Repo)
      * [File type associations](https://github.com/jDataView/jBinary/wiki/Typeset-associations)

Advanced demos
==============

* Primary demo that shows abilities and performance of jBinary - [Apple HTTP Live Streaming player](https://rreverser.github.io/mpegts/) which converts MPEG-TS video chunks from realtime stream to MP4 and plays them immediately one by one while converting few more chunks in background.
[![Screenshot](http://rreverser.github.io/mpegts/screenshot.png?)](http://rreverser.github.io/mpegts/)

* Also check out [jBinary.Repo](https://jDataView.github.io/jBinary.Repo/) for advanced usage and demos of some popular file formats. Feel free to submit more!

License
=======

This library is provided under [MIT license](https://raw.github.com/jDataView/jBinary/master/MIT-license.txt).
