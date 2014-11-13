module.exports = function (grunt) {
	return {
		common: {
			options: {
				dryRun: true,
				concat: 'jbinary.js',
				umd: {
					exports: 'jBinary',
					fromGlobal: true,
					deps: [{
						name: 'jdataview',
						globalName: 'jDataView'
					}]
				}
			},
			files: [{
				cwd: 'src',
				src: [
					'shim.js',
					'utils.js',
					'core.js',
					'proto/cache.js',
					'proto/context.js',
					'type.js',
					'template.js',
					'proto/as.js',
					'proto/position.js',
					'proto/props.js',
					'typeSet/*.js',
					'io/toURI.js',
					'io/load.js',
					'io/save.js'
				],
				dest: '../dist'
			}]
		},
		browser: {
			options: {
				uglify: {
					mangle: true,
					compress: {
						pure_getters: true,
						global_defs: {
							NODE: false,
							BROWSER: true
						}
					}
				},
				dest: {
					//format: 'FORMAT_MINIFY',
					sourceMap: true,
					sourceMapRoot: process.env.CI ? 'https://raw.github.com/' + process.env.TRAVIS_REPO_SLUG + '/' + process.env.TRAVIS_COMMIT : '../..'
				}
			},
			files: [{
				cwd: 'dist',
				src: 'jbinary.js',
				dest: 'browser',
				nonull: true
			}]
		},
		node: {
			options: {
				equery: {
					'NODE': 'true',
					'BROWSER': 'false'
				}
			},
			files: [{
				cwd: 'dist',
				src: 'jbinary.js',
				dest: 'node',
				nonull: true
			}]
		}
	};
};