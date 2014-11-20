import jBinary from '..';
import {btoa, Promise} from '../shim';
import {isDebugEnabled} from '../debug';
import {is} from '../utils';
if (NODE) {
	import {callback} from '../utils';
	import {writeFile} from 'fs';
}

if (BROWSER && global.URL && URL.createObjectURL) {
	var convertToURI = (binary, type) => {
		var data = binary.seek(0, () => binary.view.getBytes());
		return URL.createObjectURL(new Blob([data], {type}));
	};
} else {
	var convertToURI = (binary, type) => {
		var {view} = binary;
		var string = binary.seek(0, () => view.getString(undefined, undefined, NODE && is(view.buffer, Buffer) ? 'base64' : 'binary'));
		return 'data:' + type + ';base64,' + (NODE && is(view.buffer, Buffer) ? string : btoa(string));
	};
}

function getMimeType(binary, mimeType) {
	return mimeType || binary.typeSet['jBinary.mimeType'] || 'application/octet-stream';
}

export function toURI(mimeType) {
	return convertToURI(this, getMimeType(this, mimeType));
};

if (BROWSER) {
	var {document} = global;

	if (document) {
		var downloader = document.createElement('a');
		downloader.style.display = 'none';
		if (isDebugEnabled()) {
			jBinary.downloader = downloader;
		}
	}
}

export function saveAs(dest, mimeType) {
	return new Promise((resolve, reject) => {
		if (typeof dest === 'string') {
			if (NODE) {
				var buffer = this.read('blob', 0);

				if (!is(buffer, Buffer)) {
					buffer = new Buffer(buffer);
				}

				writeFile(dest, buffer, callback(resolve, reject));
			} else {
				if (navigator.msSaveBlob) {
					navigator.msSaveBlob(new Blob([this.read('blob', 0)], {type: getMimeType(this, mimeType)}), dest);
				} else {
					if (!document) {
						return reject(new TypeError('Saving from Web Worker is not supported.'));
					}
					if (!downloader.parentNode) {
						document.body.appendChild(downloader);
					}
					downloader.href = this.toURI(mimeType);
					downloader.download = dest;
					downloader.click();
					downloader.href = downloader.download = '';
				}
				resolve();
			}
		} else
		if (NODE && dest.writable) {
			dest.write(this.read('blob', 0), callback(resolve, reject));
		} else {
			reject(new TypeError('Unsupported storage type.'));
		}
	});
};
