
proto.as = function (typeSet, modifyOriginal) {
  var binary = modifyOriginal ? this : inherit(this);
  typeSet = typeSet || proto.typeSet;
  binary.typeSet = (proto.typeSet === typeSet || proto.typeSet.isPrototypeOf(typeSet)) ? typeSet : inherit(proto.typeSet, typeSet);
  binary.cacheKey = proto.cacheKey;
  binary.cacheKey = binary._getCached(typeSet, function () { return proto.cacheKey + '.' + (++proto.id) }, true);
  return binary;
};