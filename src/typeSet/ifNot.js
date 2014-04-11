// Backward compatibility:
/* jshint camelcase:false */
defaultTypeSet.if_not =
/* jshint camelcase:true */

defaultTypeSet.ifNot = Template({
	setParams: function (condition, falseType, trueType) {
		this.baseType = [
			'if',
			condition,
			trueType,
			falseType
		];
	}
});