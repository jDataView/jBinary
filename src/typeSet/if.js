defaultTypeSet['if'] = Template({
	params: ['condition', 'trueType', 'falseType'],
	typeParams: [
		'trueType',
		'falseType'
	],
	getBaseType: function (context) {
		return this.toValue(this.condition) ? this.trueType : this.falseType;
	}
});