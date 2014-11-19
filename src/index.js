import './shim';

import * as jDataView from 'jdataview';
import {extend, toValue} from './utils';

export default class jBinary {
	constructor(view, typeSet) {
		if (view instanceof jBinary) {
			return view.as(typeSet);
		}

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

	static from() {
		return new jBinary(arguments);
	}

	toValue(value) {
		return toValue(this, this, value);
	}
};

import * as typeSet from './typeSet';
export {typeSet};

export {default as Type} from './Type';
export {default as Template} from './Template';

export * from './io/load';

import * as methods from './proto';
import * as saveMethods from './io/save';
extend(jBinary.prototype, methods, saveMethods);
