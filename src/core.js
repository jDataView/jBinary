function jBinary(view, typeSet) {
  if (view instanceof jBinary) {
    return view.as(typeSet);
  }

  /* jshint validthis:true */
  if (!(view instanceof jDataView)) {
    view = new jDataView(view, undefined, undefined, typeSet ? typeSet['jBinary.littleEndian'] : undefined);
  }
  
  if (!(this instanceof jBinary)) {
    return new jBinary(view, typeSet);
  }
  
  this.view = view;
  this.view.seek(0);
  this.contexts = [];

  return this.as(typeSet, true);
}