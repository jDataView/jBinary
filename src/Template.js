import Type, {typeFactory} from './Type';
import {extend} from './utils';

var tmplFactory = typeFactory(class Template extends Type.Base {
	resolveTypes(getType) {
		super(getType);
		var {baseType} = this;
		if (baseType) {
			this.baseType = getType(baseType);
		}
	}

	getDisplayName(name) {
		var {baseType} = this;
		if (baseType && (!this.params || this.params.indexOf('baseType') < 0)) {
			name += '<' + baseType.displayName + '>';
		}
		return super(name);
	}

	createProperty(binary) {
		var property = super(binary);
		property.baseType = property.getBaseType ? binary.getType(property.getBaseType(binary.contexts[0])) : property.baseType;
		return property;
	}

	baseRead() {
		return this.binary.read(this.baseType);
	}

	baseWrite(value) {
		return this.binary.write(this.baseType, value);
	}
});

var proto = tmplFactory.Base.prototype;

extend(proto, {
	read: proto.baseRead,
	write: proto.baseWrite
});

export default tmplFactory;
