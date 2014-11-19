module.exports = {
	all: {
		options: {
			patterns: [{
				match: /export \* from (.*?);/g,
				replacement: 'extend(exports, require($1));'
			}]
		},
		files: [{
			expand: true,
			cwd: 'src',
			src: '**/*.js',
			dest: 'dist/es5'
		}]
	}
};
