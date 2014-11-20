import * as jDataView from 'jdataview';
import jBinary from '..';
import {Promise} from '../shim';
import {is} from '../utils';
if (NODE) {
	import {callback} from '../utils';
	import {readFile} from 'fs';
	import {get} from 'request-promise';
}

export function loadData(source) {
	return new Promise((resolve, reject) => {
		var dataParts;

		if (BROWSER && is(source, global.Blob)) {
			if (global.FileReader) {
				var reader = new FileReader();
				reader.onload = function () { resolve(this.result) };
				reader.onerror = function () { reject(this.error) };
				reader.readAsArrayBuffer(source);
			} else {
				// Web Worker has only sync version of FileReader
				resolve(new FileReaderSync().readAsArrayBuffer(source));
			}
		} else
		if (NODE && source.readable) {
			var buffers = [];
			source
			.on('readable', function () { buffers.push(this.read()) })
			.on('end', () => resolve(Buffer.concat(buffers)))
			.on('error', reject);
		} else
		if (typeof source !== 'string') {
			reject(new TypeError('Unsupported source type.'));
		} else
		if (!!(dataParts = source.match(/^data:(.+?)(;base64)?,(.*)$/))) {
			var [ , , isBase64, content] = dataParts;
			if (isBase64 && NODE && jDataView.prototype.compatibility.NodeBuffer) {
				resolve(new Buffer(content, 'base64'));
			} else {
				resolve((isBase64 ? atob : decodeURIComponent)(content));
			}
		} else
		if (BROWSER && global.XMLHttpRequest) {
			var xhr = new XMLHttpRequest();
			xhr.open('GET', source, true);

			// new browsers (XMLHttpRequest2-compliant)
			if ('responseType' in xhr) {
				xhr.responseType = 'arraybuffer';
			}
			// old browsers (XMLHttpRequest-compliant)
			else if (xhr.overrideMimeType) {
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
				resolve(this.response || new VBArray(this.responseBody).toArray());
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
			get({uri: source, encoding: null}).then(resolve, reject);
		} else
		if (NODE) {
			readFile(source, callback(resolve, reject));
		}
	});
};

export function load(source, typeSet) {
	return loadData(source).then(data => new jBinary(data, typeSet));
};
