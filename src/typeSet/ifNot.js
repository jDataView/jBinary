import Template from '../Template';

export var IfNot = Template({
	setParams(condition, falseType, trueType) {
		this.baseType = [
			'if',
			condition,
			trueType,
			falseType
		];
	}
});
