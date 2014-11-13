module.exports = function (grunt) {
	return {
		options: {
			separator: Array(3).join(grunt.util.linefeed),
			sourceRoot: process.env.CI ? 'https://raw.github.com/' + process.env.TRAVIS_REPO_SLUG + '/' + process.env.TRAVIS_COMMIT : '../..'
		},
		common: {
			files: {
				'dist/<%= pkgName %>.es6.js': [
					'src/shim.js',
					'src/utils.js',
					'src/core.js',
					'src/proto/cache.js',
					'src/proto/context.js',
					'src/Type.js',
					'src/Template.js',
					'src/proto/as.js',
					'src/proto/position.js',
					'src/proto/props.js',
					'src/typeSet/*.js',
					'src/io/toURI.js',
					'src/io/load.js',
					'src/io/save.js'
				]
			}
		},
		umd: {
			files: {
				'dist/<%= pkgName %>.js': [
					'umd/header.js',
					'dist/<%= pkgName %>.js',
					'umd/footer.js'
				]
			}
		}
	};
};
