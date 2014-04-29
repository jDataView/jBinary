defaultTypeSet.object = Type({
	params: ['structure', 'proto'],
	resolve: function (getType) {
		var structure = {};
		for (var key in this.structure) {
			structure[key] = !is(this.structure[key], Function) ? getType(this.structure[key]) : this.structure[key];
		}
		this.structure = structure;
	},
	read: function () {
		var self = this, structure = this.structure, output = this.proto ? inherit(this.proto) : {};

		this.binary.inContext(output, function () {
			/* jshint loopfunc: true */
			for (var key in structure) {
				this._named(function () {
					var value = !is(structure[key], Function) ? this.read(structure[key]) : structure[key].call(self, output);
					if (value !== undefined) {
						output[key] = value;
					}
				}, key).call(this);
			}
		});

		return output;
	},
	write: function (data) {
		var self = this, structure = this.structure;

		this.binary.inContext(data, function () {
			/* jshint loopfunc: true */
			for (var key in structure) {
				this._named(function () {
					if (!is(structure[key], Function)) {
						this.write(structure[key], data[key]);
					} else {
						data[key] = structure[key].call(self, data);
					}
				}, key).call(this);
			}
		});
	}
});