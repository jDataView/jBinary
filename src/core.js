class jBinary {
	constructor(view, typeSet) {
		if (is(view, jBinary)) {
			return view.as(typeSet);
		}

		/* jshint validthis:true */
		if (!is(view, jDataView)) {
			view = new jDataView(view, undefined, undefined, typeSet ? typeSet['jBinary.littleEndian'] : undefined);
		}

		if (!is(this, jBinary)) {
			return new jBinary(view, typeSet);
		}

		this.view = view;
		this.view.seek(0);
		this.contexts = [];

		return this.as(typeSet, true);
	}

	toValue(value) {
		return toValue(this, this, value);
	}

	_named(func, name, offset) {
		if (jBinary.DEBUG) {
			func.displayName = name + ' @ ' + (offset !== undefined ? offset : this.view.tell());
		}
		return func;
	}
}

jBinary.DEBUG = NODE ? process.env.NODE_ENV === 'development' : !!global.DEBUG;

var proto = jBinary.prototype;

var defaultTypeSet = proto.typeSet = {};
