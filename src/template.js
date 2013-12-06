jBinary.Template = function (config) {
  return inherit(jBinary.Template.prototype, config, {
    createProperty: function (binary) {
      var property = (config.createProperty || jBinary.Template.prototype.createProperty).apply(this, arguments);
      if (property.getBaseType) {
        property.baseType = property.binary.getType(property.getBaseType(property.binary.contexts[0]));
      }
      return property;
    }
  });
};

jBinary.Template.prototype = inherit(jBinary.Type.prototype, {
  setParams: function () {
    if (this.baseType) {
      this.typeParams = ['baseType'].concat(this.typeParams || []);
    }
  },
  baseRead: function () {
    return this.binary.read(this.baseType);
  },
  baseWrite: function (value) {
    return this.binary.write(this.baseType, value);
  }
});
jBinary.Template.prototype.read = jBinary.Template.prototype.baseRead;
jBinary.Template.prototype.write = jBinary.Template.prototype.baseWrite;