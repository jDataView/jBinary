import Type from '../Type';
import * as defaultTypeSet from '../typeSet';
import {capitalize} from '../utils';
import {Bitfield, Struct} from '../typeSet';
import {isDebugEnabled} from '../debug';
import getCached from './cache';

function resolveType(binary, type, args) {
	switch (typeof type) {
		case 'string':
			var resolvedType = binary.typeSet[type];
			if (!resolvedType) {
				resolvedType = defaultTypeSet[capitalize(type)];
				if (!resolvedType) {
					throw new ReferenceError('Unknown type: ' + type);
				}
			}
			return resolveType(binary, resolvedType, args);

		case 'number':
			return new Bitfield(type);

		case 'function':
			type = new type(...(args || []));
			args = null;

		case 'object': {
			if (type instanceof Type.Base) {
				if (args && args.length) {
					throw new TypeError('Can\'t pass arguments to preconfigured type.');
				}
				type.resolveTypes(type => binary.getType(type));
				return type;
			} else {
				return getCached(binary.typeSet, type, (
					type instanceof Array
					? type => resolveType(binary, type[0], type.slice(1))
					: structure => resolveType(binary, new Struct(structure))
				));
			}
		}
	}
}

export function getType(type) {
	var resolvedType = resolveType(this, type);

	if (isDebugEnabled() && resolvedType && !resolvedType.displayName) {
		var name = type instanceof Array ? type[0] : type;
		if (typeof name !== 'string') {
			name = '';
		}
		resolvedType.displayName = resolvedType.getDisplayName(name);
	}

	return resolvedType;
};
