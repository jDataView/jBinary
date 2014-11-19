import Template from '../Template';

export var If = Template({
	params: ['condition', 'trueType', 'falseType'],
	typeParams: ['trueType', 'falseType'],
	getBaseType(context) {
		return this.toValue(this.condition) ? this.trueType : this.falseType;
	}
});
