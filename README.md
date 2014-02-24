[![Build Status](https://travis-ci.org/jDataView/jBinary.png?branch=master)](https://travis-ci.org/jDataView/jBinary) jBinary - High-level I/O for binary data.
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

Documentation
=============

  * General API
    * [jBinary Constructor](https://github.com/jDataView/jBinary/wiki/jBinary-Constructor)
    * [jBinary Methods](https://github.com/jDataView/jBinary/wiki/jBinary-Methods)
    * [Internal jBinary Methods (useful for custom types)](https://github.com/jDataView/jBinary/wiki/Internal-jBinary-Methods)
  * [Loading/saving data](https://github.com/jDataView/jBinary/wiki/Loading-and-saving-data)
  * [Typesets](https://github.com/jDataView/jBinary/wiki/Typesets)
    * [Standard types](https://github.com/jDataView/jBinary/wiki/Standard-types)
    * Custom types
      * [Simple types with jBinary.Type](https://github.com/jDataView/jBinary/wiki/jBinary.Type)
      * [Type wrappers with jBinary.Template](https://github.com/jDataView/jBinary/wiki/jBinary.Template)
      * [Caveats](https://github.com/jDataView/jBinary/wiki/Caveats)
    * Ready-to-use typesets
      * [The Repo](https://github.com/jDataView/jBinary/wiki/The-Repo)
      * [Typeset associations](https://github.com/jDataView/jBinary/wiki/Typeset-associations)
  * Usage
    * [Node.js](https://github.com/jDataView/jBinary/wiki/Usage-in-Node.js)
    * [Browser](https://github.com/jDataView/jBinary/wiki/Usage-in-Browser)
    * [AMD](https://github.com/jDataView/jBinary/wiki/Usage-with-AMD)
    * [Type usage syntax](https://github.com/jDataView/jBinary/wiki/Type-usage-syntax)

Demos
=====

Please check out [jBinary.Repo](https://jDataView.github.io/jBinary.Repo/) for advanced usage and demos of some popular format. Feel free to submit more!

License
=======

This library is provided under [MIT license](https://raw.github.com/jDataView/jBinary/master/MIT-license.txt).