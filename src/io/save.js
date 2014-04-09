proto._toURI =
	(BROWSER && 'URL' in global && 'createObjectURL' in URL)
	? function (type) {
		var data = this.seek(0, function () { return this.view.getBytes() });
		return URL.createObjectURL(new Blob([data], {type: type}));
	}
	: function (type) {
		var string = this.seek(0, function () { return this.view.getString(undefined, undefined, NODE && this.view._isNodeBuffer ? 'base64' : 'binary') });
		return 'data:' + type + ';base64,' + (NODE && this.view._isNodeBuffer ? string : btoa(string));
	};

proto._mimeType = function (mimeType) {
	return mimeType || this.typeSet['jBinary.mimeType'] || 'application/octet-stream';
};

proto.toURI = function (mimeType) {
	return this._toURI(this._mimeType(mimeType));
};

var WritableStream = NODE && require('stream').Writable;

if (BROWSER && document) {
	var downloader = jBinary.downloader = document.createElement('a');
	downloader.style.display = 'none';
}

proto.saveAs = promising(function (dest, mimeType, callback) {
	if (typeof dest === 'string') {
		if (NODE) {
			var buffer = this.read('blob', 0);

			if (!is(buffer, Buffer)) {
				buffer = new Buffer(buffer);
			}

			require('fs').writeFile(dest, buffer, callback);
		} else
		if (BROWSER) {
			if ('msSaveBlob' in navigator) {
				navigator.msSaveBlob(new Blob([this.read('blob', 0)], {type: this._mimeType(mimeType)}), dest);
			} else {
				if (document) {
					if (!downloader.parentNode) {
						document.body.appendChild(downloader);
					}

					downloader.href = this.toURI(mimeType);
					downloader.download = dest;
					downloader.click();
					downloader.href = downloader.download = '';
				} else {
					callback(new TypeError('Saving from Web Worker is not supported.'));
				}
			}
			callback();
		}
	} else
	if (NODE && is(dest, WritableStream)) {
		dest.write(this.read('blob', 0), callback);
	} else {
		callback(new TypeError('Unsupported storage type.'));
	}
});