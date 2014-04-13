[![Build Status](https://travis-ci.org/jDataView/jBinary.png?branch=master)](https://travis-ci.org/jDataView/jBinary) [![NPM version](https://badge.fury.io/js/jbinary.png)](https://npmjs.org/package/jbinary)
jBinary - High-level I/O for binary data.
=========================================

<img src="https://avatars1.githubusercontent.com/u/4702384?s=130" align="right"></img>

jBinary makes it easy to work with binary files in JavaScript as with native objects via declarative syntax.

It works on top of [jDataView](https://github.com/jDataView/jDataView) (extended [DataView](http://www.khronos.org/registry/typedarray/specs/latest/#8) polyfill).

Was inspired by [jParser](https://github.com/vjeux/jParser) and derived as new library with full set of I/O operations for manipulations on binary data in JavaScript.

# How can I use it?

Typical scenario:

  * Describe [typeset](https://github.com/jDataView/jBinary/wiki/Typesets) with JavaScript-compatible declarative syntax (jBinary will do type caching for you).
  * Create jBinary instance [from memory](https://github.com/jDataView/jBinary/wiki/jBinary-Constructor) or [from data source](https://github.com/jDataView/jBinary/wiki/Loading-and-saving-data) and your typeset.
  * [Read/write](https://github.com/jDataView/jBinary/wiki/jBinary-Methods#readingwriting) data just as native JavaScript objects!

Check out [wiki](https://github.com/jDataView/jBinary/wiki) for detailed API documentation.

# Is there any example code?

Sure, how about TAR archive modification:
```javascript
// configuring paths for Require.js
// (you can use CommonJS (Component, Node.js) or simple script tags as well)
require.config({
  paths: {
    jdataview: '//jdataview.github.io/dist/jdataview',
    jbinary: '//jdataview.github.io/dist/jbinary',
    TAR: '//jdataview.github.io/jBinary.Repo/typeSets/tar' // TAR archive typeset
  }
});

require(['jbinary', 'TAR'], function (jBinary, TAR) {
  // loading TAR archive with given typeset
  jBinary.load('http://corsproxy.com/jdataview.github.io/jBinary.Repo/demo/tar/sample.tar', TAR)
  .then(function (jb/* : jBinary */) {
    // read everything using type aliased in TAR['jBinary.all']
    var files = jb.readAll();

    // do something with files in TAR archive (like log info and rename them to upper case)
    files.forEach(function (file) {
      console.log(file.name + ' (' + Math.round(file.size / 1024) + ' KB)');
      file.name = file.name.toUpperCase();
    });

    jb.seek(0); // reusing same instance (and memory buffer) by resetting pointer
    jb.writeAll(files); // writing entire content from files array
    jb.saveAs('sample.new.tar'); // saving file under given name
  });
});
```

[Run](http://jsbin.com/gopekewi/1/) or [edit](http://jsbin.com/gopekewi/1/edit?js,console) it on JSBin.

# What is already created?

Advanced demo that shows abilities and performance of jBinary - [Apple HTTP Live Streaming player](https://rreverser.github.io/mpegts/) which converts MPEG-TS video chunks from realtime stream to MP4 and plays them immediately one by one while converting few more chunks in background.

[![Screenshot](http://rreverser.github.io/mpegts/screenshot.png?)](http://rreverser.github.io/mpegts/)

---

A [World of Warcraft Model Viewer](http://jdataview.github.io/jsWoWModelViewer/). It uses [jDataView](https://github.com/jDataView/jDataView)+[jBinary](https://github.com/jDataView/jBinary) to read the binary file and then WebGL to display it.

[![Screenshot](http://jdataview.github.io/jsWoWModelViewer/images/modelviewer.png)](http://jdataview.github.io/jsWoWModelViewer/)

---

Also check out [jBinary.Repo](https://jDataView.github.io/jBinary.Repo/) for advanced usage and demos of some popular file formats (and feel free to submit more!).

# What license is it issued under?

This library is provided under [MIT license](https://raw.github.com/jDataView/jBinary/master/MIT-license.txt).
