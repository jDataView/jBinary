import {extend, inherit} from '../utils';
import * as defaultTypeSet from '../typeSet';

export function as(typeSet, modifyOriginal) {
	if (!typeSet) {
		typeSet = defaultTypeSet;
	}
	return (modifyOriginal ? extend : inherit)(this, {typeSet});
};
