import Type from '../Type';
import {extend} from '../utils';

class SimpleType extends Type.Base {
	resolveTypes() {}

	read() {
		return this.view['get' + this.dataType](undefined, this.littleEndian);
	}

	write(value) {
		this.view['write' + this.dataType](value, this.littleEndian);
	}
}

function createDataType(dataType) {
	class DataType extends SimpleType {
		constructor(littleEndian) {
			if (!(this instanceof DataType)) {
				return new DataType(littleEndian);
			}
			this.littleEndian = littleEndian;
		}
	}
	extend(DataType.prototype, {
		dataType,
		displayName: dataType
	});
	return DataType;
}

export var Uint8 = createDataType('Uint8');
export var Uint16 = createDataType('Uint16');
export var Uint32 = createDataType('Uint32');
export var Uint64 = createDataType('Uint64');
export var Int8 = createDataType('Int8');
export var Int16 = createDataType('Int16');
export var Int32 = createDataType('Int32');
export var Int64 = createDataType('Int64');
export var Float32 = createDataType('Float32');
export var Float64 = createDataType('Float64');
export var Char = createDataType('Char');

export {
	Uint8 as Byte,
	Float32 as Float,
	Float64 as Double
};
