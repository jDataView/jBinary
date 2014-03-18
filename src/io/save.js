var _toURI =
	(BROWSER && 'URL' in global && 'createObjectURL' in URL)
	? function (type) {
		var data = this.seek(0, function () { return this.view.getBytes() });
		return URL.createObjectURL(new Blob([data], {type: type}));
	}
	: function (type) {
		var string = this.seek(0, function () { return this.view.getString(undefined, undefined, NODE && this.view._isNodeBuffer ? 'base64' : 'binary') });
		return 'data:' + type + ';base64,' + (NODE && this.view._isNodeBuffer ? string : btoa(string));
	};

proto.toURI = function (mimeType) {
	return _toURI.call(this, mimeType || this.typeSet['jBinary.mimeType'] || 'application/octet-stream');
};

var WritableStream = NODE && require('stream').Writable;

if (BROWSER && document) {
	var downloader = jBinary.downloader = document.createElement('a');
	downloader.style.display = 'none';
}

proto.saveAs = promising(function (dest, callback) {
	if (typeof dest === 'string') {
		if (NODE) {
			var buffer = this.read('blob', 0);

			if (!(buffer instanceof Buffer)) {
				buffer = new Buffer(buffer);
			}
			
			require('fs').writeFile(dest, buffer, callback);
		} else
		if (BROWSER) {
			if ('msSaveBlob' in navigator) {
				navigator.msSaveBlob(new Blob([this.read('blob', 0)], {type: this.typeSet['jBinary.mimeType']}), dest);
			} else {
				if (document) {
					if (!downloader.parentNode) {
						document.body.appendChild(downloader);
					}

					downloader.href = this.toURI();
					downloader.download = dest;
					downloader.click();
					downloader.href = downloader.download = '';
				} else {
					callback(new TypeError('Downloading from Web Worker is not supported.'));
				}
			}
			callback();
		}
	} else
	if (NODE && dest instanceof WritableStream) {
		dest.write(this.read('blob', 0), callback);
	} else {
		callback(new TypeError('Unsupported storage type.'));
	}
});