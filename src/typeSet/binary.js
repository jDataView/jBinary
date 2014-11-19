import Template from '../Template';
import jBinary from '..';

export var Binary = Template({
	params: ['length', 'typeSet'],
	read() {
		var startPos = this.binary.tell();
		var endPos = this.binary.skip(this.toValue(this.length));
		var view = this.view.slice(startPos, endPos);
		return new jBinary(view, this.typeSet);
	},
	write(binary) {
		this.binary.write('blob', binary.read('blob', 0));
	}
});
