var ReadableStream = NODE && require('stream').Readable;

jBinary.loadData = promising(function (source, callback) {
	var dataParts;

	if (BROWSER && 'Blob' in global && source instanceof Blob) {
		var reader = new FileReader();
		reader.onload = reader.onerror = function () { callback(this.error, this.result) };
		reader.readAsArrayBuffer(source);
	} else
	if (NODE && ReadableStream && source instanceof ReadableStream) {
		var buffers = [];
		source
			.on('readable', function () { buffers.push(this.read()) })
			.on('end', function () { callback(null, Buffer.concat(buffers)) })
			.on('error', callback)
		;
	} else
	if (typeof source !== 'string') {
		return callback(new TypeError('Unsupported source type.'));
	} else
	if (!!(dataParts = source.match(/^data:(.+?)(;base64)?,(.*)$/))) {
		try {
			var isBase64 = dataParts[2],
				content = dataParts[3];

			callback(
				null,
				(
					(isBase64 && NODE && jDataView.prototype.compatibility.NodeBuffer)
					? new Buffer(content, 'base64')
					: (isBase64 ? atob : decodeURIComponent)(content)
				)
			);
		} catch (e) {
			callback(e);
		}
	} else
	if (BROWSER && 'XMLHttpRequest' in global) {
		var xhr = new XMLHttpRequest();
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

		var cbError = function (string) {
			callback(new Error(string));
		};

		xhr.onload = function () {
			if (this.status !== 0 && this.status !== 200) {
				return cbError('HTTP Error #' + this.status + ': ' + this.statusText);
			}

			// emulating response field for IE9
			if (!('response' in this)) {
				this.response = new VBArray(this.responseBody).toArray();
			}

			callback(null, this.response);
		};

		xhr.onerror = function () {
			cbError('Network error.');
		};

		xhr.send(null);
	} else
	if (BROWSER) {
		return callback(new TypeError('Unsupported source type.'));
	} else
	if (NODE && /^(https?):\/\//.test(source)) {
		require('request').get({
			uri: source,
			encoding: null
		}, function (error, response, body) {
			if (!error && response.statusCode !== 200) {
				var statusText = require('http').STATUS_CODES[response.statusCode];
				error = new Error('HTTP Error #' + response.statusCode + ': ' + statusText);
			}
			callback(error, body);
		});
	} else
	if (NODE) {
		require('fs').readFile(source, callback);
	}
});

jBinary.load = promising(function (source, typeSet, callback) {
	if (typeof typeSet === 'function') {
		callback = typeSet;
		typeSet = undefined;
	}

	jBinary.loadData(source, function (err, data) {
		/* jshint expr: true */
		err ? callback(err) : callback(null, new jBinary(data, typeSet));
	});
});