module.exports = function (grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		libName: 'jBinary',
		repo: 'jDataView/<%= libName %>',
		concat: {
			options: {
				process: function (src) {
					return src.trim();
				},
				separator: Array(3).join(grunt.util.linefeed)
			},
			all: {
				src: [
					'src/shim.js',
					'src/utils.js',
					'src/core.js',
					'src/proto/context.js',
					'src/type.js',
					'src/template.js',
					'src/proto/typeset.js',
					'src/proto/as.js',
					'src/simpleTypes.js',
					'src/proto/helpers.js',
					'src/io/load.js'
				],
				dest: 'dist/<%= pkg.name %>.js'
			}
		},
		jshint: {
			options: {
				jshintrc: 'src/.jshintrc'
			},
			all: ['dist/<%= pkg.name %>.js']
		},
		umd: {
			all: {
				src: 'dist/<%= pkg.name %>.js',
				template: 'strict-umd.hbs',
				objectToExport: '<%= libName %>',
				globalAlias: '<%= libName %>',
				deps: {
					'default': ['jDataView'],
					amd: ['jdataview'],
					cjs: ['jdataview']
				}
			}
		},
		uglify: {
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
					sourceMap: 'dist/browser/<%= pkg.name %>.js.map',
					sourceMapRoot: '../..',
					sourceMappingURL: '<%= pkg.name %>.js.map'
				},
				files: {
					'dist/browser/<%= pkg.name %>.js': ['dist/<%= pkg.name %>.js']
				}
			},
			node: {
				options: {
					compress: {
						global_defs: {NODE: true, BROWSER: false}
					}
				},
				files: {
					'dist/node/<%= pkg.name %>.js': ['dist/<%= pkg.name %>.js']
				}
			}
		},
		mochaTest: {
			options: {
				reporter: 'spec',
				require: './test/bdd-qunit-mocha-ui',
				ui: 'bdd-qunit-mocha-ui'
			},
			src: ['test/test.js']
		},
		component: {
			repo: '<%= repo %>',
			main: 'dist/browser/<%= pkg.name %>.js',
			scripts: ['<%= component.main %>'],
			license: '<%= pkg.licenses[0].type %>',
			dependencies: {
				'jDataView/jDataView': '*'
			}
		}
	});

	grunt.registerTask('component', 'Build component.json', function () {
		var component = Object.create(null);

		function mergeOpts(source, keys) {
			(keys || Object.keys(source)).forEach(function (key) {
				component[key] = source[key];
			});
		}

		mergeOpts(grunt.config('pkg'), ['name', 'description', 'version', 'keywords']);
		mergeOpts(grunt.config('component'));

		grunt.file.write('component.json', JSON.stringify(component, true, 2));
		grunt.log.ok('component.json written');
	});

	require('load-grunt-tasks')(grunt);

	grunt.registerTask('prebuild', ['concat', 'jshint', 'umd']);

	grunt.registerTask('build:browser', ['uglify:browser', 'component']);
	grunt.registerTask('build:node', ['uglify:node', 'mochaTest']);

	grunt.registerTask('browser', ['prebuild', 'build:browser']);
	grunt.registerTask('node', ['prebuild', 'build:node']);
	grunt.registerTask('default', ['prebuild', 'build:browser', 'build:node']);
	
	grunt.registerTask('publish', ['default'/*, 'release'*/]);
};