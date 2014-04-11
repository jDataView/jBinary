module.exports = {
	options: {
		cache: 'dist/.sizecache.json',
		compress: {
			gz: function (content) {
				return require('gzip-js').zip(content, {}).length;
			}
		}
	},
	browser: 'dist/browser/<%= pkgName %>.js'
};