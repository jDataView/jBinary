module.exports = {
	options: {
		cache: 'dist/.sizecache.json',
		compress: {
			gz: function (content) {
				return require('gzip-js').zip(content, {}).length;
			}
		}
	},
	all: 'dist/*/<%= pkgName %>.js'
};