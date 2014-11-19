module.exports = {
	options: {
		compress: {
			pure_getters: true
		}
	},
	browser: {
		options: {
			compress: {
				global_defs: {NODE: false, BROWSER: true}
			},
			sourceMap: true,
			sourceMapIn: 'dist/browser/<%= pkgName %>.js.map',
			sourceMapRoot: process.env.CI ? 'https://raw.github.com/' + process.env.TRAVIS_REPO_SLUG + '/' + process.env.TRAVIS_COMMIT : '../..'
		},
		files: {
			'dist/browser/<%= pkgName %>.js': 'dist/browser/<%= pkgName %>.js'
		}
	},
	node: {
		options: {
			compress: {
				global_defs: {NODE: true, BROWSER: false}
			},
			mangle: false,
			beautify: true
		},
		files: [{
			expand: true,
			cwd: 'dist/es5',
			src: '**/*.js',
			dest: 'dist/node'
		}]
	}
};
