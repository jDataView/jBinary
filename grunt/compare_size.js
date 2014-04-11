var gzip = require('gzip-js');

module.exports = {
	options: {
		cache: 'dist/.sizecache.json',
		compress: {
			gz: function (content) {
				return gzip.zip(content, {}).length;
			}
		}
	},
	browser: 'dist/browser/<%= pkgName %>.js'
};