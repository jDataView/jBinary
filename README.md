[![Build Status](https://travis-ci.org/jDataView/jBinary.png?branch=master)](https://travis-ci.org/jDataView/jBinary) [![NPM version](https://badge.fury.io/js/jbinary.png)](https://npmjs.org/package/jbinary)
jBinary
=======
[![Gitter](https://badges.gitter.im/Join Chat.svg)](https://gitter.im/jDataView/jBinary?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

## Binary data in JavaScript is easy!

<img src="https://avatars1.githubusercontent.com/u/4702384?s=130" align="right"></img>

jBinary makes it easy to create, load, parse, modify and save complex binary files and data structures in both browser and Node.js.

It works on top of [jDataView](https://github.com/jDataView/jDataView) ([DataView](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DataView) polyfill with convenient extensions).

Was inspired by [jParser](https://github.com/vjeux/jParser) and derived as new library with full set of operations for binary data.

## How can I use it?

Typical scenario:

  * Describe [typeset](https://github.com/jDataView/jBinary/wiki/Typesets) with JavaScript-compatible declarative syntax (jBinary will do type caching for you).
  * Create jBinary instance [from memory](https://github.com/jDataView/jBinary/wiki/jBinary-Constructor) or [from data source](https://github.com/jDataView/jBinary/wiki/Loading-and-saving-data) and your typeset.
  * [Read/write](https://github.com/jDataView/jBinary/wiki/jBinary-Methods#readingwriting) data just as native JavaScript objects!

## API Documentation.

Check out [wiki](https://github.com/jDataView/jBinary/wiki) for detailed API documentation.

## Is there any example code?

How about TAR archive modification:
```javascript
// configuring paths for Require.js
// (you can use CommonJS (Component, Node.js) or simple script tags as well)
require.config({
  paths: {
    jdataview: 'https://jdataview.github.io/dist/jdataview',
    jbinary: 'https://unpkg.com/jbinary@2.1.3/dist/browser/jbinary',
    TAR: 'https://jdataview.github.io/jBinary.Repo/typeSets/tar' // TAR archive typeset
  }
});

require(['jbinary', 'TAR'], function (jBinary, TAR) {
  // loading TAR archive with given typeset
  jBinary.load('sample.tar', TAR).then(function (jb/* : jBinary */) {
    // read everything using type aliased in TAR['jBinary.all']
    var files = jb.readAll();

    // do something with files in TAR archive (like rename them to upper case)
    files.forEach(function (file) {
      file.name = file.name.toUpperCase();
    });

    jb.writeAll(files, 0); // writing entire content from files array
    jb.saveAs('sample.new.tar'); // saving file under given name
  });
});
```

[Run](https://jsbin.com/jofipi/1/) or [edit](https://jsbin.com/jofipi/1/edit?js,console) it on JSBin.

# Show me amazing use-cases!

Advanced demo that shows abilities and performance of jBinary - [Apple HTTP Live Streaming player](https://rreverser.github.io/mpegts/) which converts MPEG-TS video chunks from realtime stream to MP4 and plays them immediately one by one while converting few more chunks in background.

[![Screenshot](https://rreverser.github.io/mpegts/screenshot.png?)](https://rreverser.github.io/mpegts/)

---

A [World of Warcraft Model Viewer](https://vjeux.github.io/jsWoWModelViewer/). It uses [jDataView](https://github.com/jDataView/jDataView)+[jBinary](https://github.com/jDataView/jBinary) to read the binary file and then WebGL to display it.

[![Screenshot](https://vjeux.github.io/jsWoWModelViewer/images/modelviewer.png)](https://vjeux.github.io/jsWoWModelViewer/)
---

Also check out [jBinary.Repo](https://jDataView.github.io/jBinary.Repo/) for advanced usage and demos of some popular file formats (and feel free to submit more!).

# What license is it issued under?

This library is provided under [MIT license](https://raw.github.com/jDataView/jBinary/master/MIT-license.txt).
