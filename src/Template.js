class Template extends Type {
	constructor(config) {
		if (!(this instanceof Template)) {
			return new Template(config);
		}
		this.read = this.baseRead;
		this.write = this.baseWrite;
		super(config);
	}

	resolve(getType) {
		if (this.baseType) {
			this.baseType = getType(this.baseType);
		}
		return super(getType);
	}

	createProperty(binary) {
		var property = super(binary);
		if (this.getBaseType) {
			property.baseType = property.binary.getType(property.getBaseType(property.binary.contexts[0]));
		}
		return property;
	}

	baseRead() {
		return this.binary.read(this.baseType);
	}

	baseWrite(value) {
		return this.binary.write(this.baseType, value);
	}
}

jBinary.Template = Template;
