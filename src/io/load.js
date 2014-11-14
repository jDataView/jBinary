var ReadableStream = NODE && require('stream').Readable;

jBinary.loadData = source => new Promise((resolve, reject) => {
	var dataParts;

	if (BROWSER && is(source, global.Blob)) {
		if ('FileReader' in global) {
			let reader = new FileReader();
			reader.onload = function () { resolve(this.result) };
			reader.onerror = function () { reject(this.error) };
			reader.readAsArrayBuffer(source);
		} else {
			// Web Worker has only sync version of FileReader
			resolve(new FileReaderSync().readAsArrayBuffer(source));
		}
	} else
	if (NODE && is(source, ReadableStream)) {
		let buffers = [];
		source
		.on('readable', function () { buffers.push(this.read()) })
		.on('end', () => resolve(Buffer.concat(buffers)))
		.on('error', reject);
	} else
	if (typeof source !== 'string') {
		reject(new TypeError('Unsupported source type.'));
	} else
	if (!!(dataParts = source.match(/^data:(.+?)(;base64)?,(.*)$/))) {
		var [, , isBase64, content] = dataParts;
		if (isBase64 && NODE && jDataView.prototype.compatibility.NodeBuffer) {
			resolve(new Buffer(content, 'base64'));
		} else {
			resolve((isBase64 ? atob : decodeURIComponent)(content));
		}
	} else
	if (BROWSER && 'XMLHttpRequest' in global) {
		let xhr = new XMLHttpRequest();
		xhr.open('GET', source, true);

		// new browsers (XMLHttpRequest2-compliant)
		if ('responseType' in xhr) {
			xhr.responseType = 'arraybuffer';
		}
		// old browsers (XMLHttpRequest-compliant)
		else if ('overrideMimeType' in xhr) {
			xhr.overrideMimeType('text/plain; charset=x-user-defined');
		}
		// IE9 (Microsoft.XMLHTTP-compliant)
		else {
			xhr.setRequestHeader('Accept-Charset', 'x-user-defined');
		}

		// shim for onload for old IE
		if (!('onload' in xhr)) {
			xhr.onreadystatechange = function () {
				if (this.readyState === 4) {
					this.onload();
				}
			};
		}

		xhr.onload = function () {
			if (this.status !== 0 && this.status !== 200) {
				return reject(new Error('HTTP Error #' + this.status + ': ' + this.statusText));
			}

			// emulating response field for IE9
			if (!('response' in this)) {
				this.response = new VBArray(this.responseBody).toArray();
			}

			resolve(this.response);
		};
		xhr.onerror = () => {
			reject(new Error('Network error.'));
		};
		xhr.send(null);
	} else
	if (BROWSER) {
		reject(new TypeError('Unsupported source type.'));
	} else
	if (NODE && /^(https?):\/\//.test(source)) {
		require('request-promise').get({
			uri: source,
			encoding: null
		}).then(resolve, reject);
	} else
	if (NODE) {
		require('fs').readFile(source, callback(resolve, reject));
	}
});

jBinary.load = (source, typeSet) => jBinary.loadData(source).then(data => new jBinary(data, typeSet));
