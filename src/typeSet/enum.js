defaultTypeSet['enum'] = Template({
	params: ['baseType', 'matches'],
	setParams: function (baseType, matches) {
		this.backMatches = {};
		for (var key in matches) {
			this.backMatches[matches[key]] = key;
		}
	},
	read: function () {
		var value = this.baseRead();
		return value in this.matches ? this.matches[value] : value;
	},
	write: function (value) {
		this.baseWrite(value in this.backMatches ? this.backMatches[value] : value);
	}
});