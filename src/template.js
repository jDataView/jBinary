function Template(config) {
	return inherit(Template.prototype, config, {
		createProperty: function (binary) {
			var property = (config.createProperty || Template.prototype.createProperty).apply(this, arguments);
			if (property.getBaseType) {
				property.baseType = property.binary.getType(property.getBaseType(property.binary.contexts[0]));
			}
			return property;
		}
	});
}

Template.prototype = inherit(Type.prototype, {
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

extend(Template.prototype, {
	read: Template.prototype.baseRead,
	write: Template.prototype.baseWrite
});

jBinary.Template = Template;