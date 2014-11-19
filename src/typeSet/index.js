import {extend} from '../utils';

export * from './_simpleTypes';
export * from './binary';
export * from './bitfield';
export * from './blob';
export * from './const';
export * from './enum';
export * from './extend';
export * from './if';
export * from './ifNot';
export * from './lazy';
export * from './list';
export * from './skip';
export * from './string';
export * from './string0';
export * from './struct';

// Deprecate in future version
export {List as Array} from './list';
export {Struct as Object} from './struct';
export {FixedString as String} from './string';
