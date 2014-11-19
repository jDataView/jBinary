module.exports = {
	code: {
		options: {
			runtime: true
		},
		files: [{
			expand: true,
			cwd: 'dist/es5',
			src: '**/*.js',
			dest: 'dist/es5'
		}]
	},
	tests: {
		options: {
			modules: 'umd'
		},
		files: {
			'test/test.es5.js': 'test/test.js'
		}
	}
};
