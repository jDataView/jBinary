[![Build Status](https://travis-ci.org/jDataView/jBinary.png?branch=master)](https://travis-ci.org/jDataView/jBinary) jBinary - High-level I/O for binary data.
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

Documentation
-------------
  * [General API](https://github.com/jDataView/jBinary/wiki/General-API)
  * [Loading/saving data](https://github.com/jDataView/jBinary/wiki/Loading-and-saving-data)
  * [Typesets](https://github.com/jDataView/jBinary/wiki/Typesets)
    * [Standard types](https://github.com/jDataView/jBinary/wiki/Standard-types)
    * Custom types
      * [jBinary.Type](https://github.com/jDataView/jBinary/wiki/jBinary.Type)
      * [jBinary.Template](https://github.com/jDataView/jBinary/wiki/jBinary.Template)
  * [Usage](https://github.com/jDataView/jBinary/wiki/Usage)
    * [Type usage syntax](https://github.com/jDataView/jBinary/wiki/Type-usage-syntax)

Demos
-----

Please check out [jBinary.Repo](https://jDataView.github.io/jBinary.Repo/) for advanced usage and demos of some popular format. Feel free to submit more!

License
-------

This library is provided under [MIT license](https://raw.github.com/jDataView/jBinary/master/MIT-license.txt).