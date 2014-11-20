import './shim';

import * as jDataView from 'jdataview';
import {extend, toValue} from './utils';

class jBinary {
	constructor(view, typeSet) {
		if (jBinary.is(view)) {
			return view.as(typeSet);
		}

		if (!jDataView.is(view)) {
			view = new jDataView(view, undefined, undefined, typeSet ? typeSet['jBinary.littleEndian'] : undefined);
		}

		if (!jBinary.is(this)) {
			return new jBinary(view, typeSet);
		}

		this.view = view;
		this.view.seek(0);
		this.contexts = [];

		return this.as(typeSet, true);
	}

	static is(binary) {
		return binary && binary.jBinary;
	}

	static from() {
		return new jBinary(arguments);
	}

	toValue(value) {
		return toValue(this, this, value);
	}
};

// Hack to provide default exports for Node.js.
// Other exports will extend it.
module.exports = exports = jBinary;

export default jBinary;

import * as typeSet from './typeSet';
export {typeSet};

export {default as Type} from './Type';
export {default as Template} from './Template';

export * from './io/load';

import * as methods from './proto';
import * as saveMethods from './io/save';
extend(jBinary.prototype, {jBinary: true}, methods, saveMethods);
