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
				files: {
					'dist/<%= pkg.name %>.js': [
						'src/shim.js',
						'src/utils.js',
						'src/core.js',
						'src/proto/context.js',
						'src/type.js',
						'src/template.js',
						'src/proto/typeSet.js',
						'src/proto/as.js',
						'src/proto/position.js',
						'src/proto/props.js',
						'src/simpleTypes.js',
						'src/io/toURI.js',
						'src/io/load.js'
					]
				} 
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
					'dist/browser/<%= pkg.name %>.js': 'dist/<%= pkg.name %>.js'
				}
			},
			node: {
				options: {
					compress: {
						global_defs: {NODE: true, BROWSER: false}
					}
				},
				files: {
					'dist/node/<%= pkg.name %>.js': 'dist/<%= pkg.name %>.js'
				}
			}
		},
		mochaTest: {
			options: {
				reporter: 'progress'
			},
			node: {
				src: 'test/test.js'
			}
		},
		karma: {
			options: {
				configFile: 'test/karma.conf.js'
			},
			browser: {
				singleRun: true
			}
		},
		update_json: {
			component: {
				files: {
					'component.json': 'package.json'
				},
				fields: {
					name: null,
					version: null,
					description: null,
					keywords: null
				}
			}
		},
		test: {
			browser: 'karma:browser',
			node: 'mochaTest:node'
		}
	});

	require('load-grunt-tasks')(grunt);

	grunt.registerTask('build', ['concat', 'jshint', 'umd']);

	grunt.registerMultiTask('test', function (target) {
		grunt.task.requires('build');
		grunt.task.run(this.data);
	});

	['browser', 'node'].forEach(function (target) {
		grunt.registerTask(target, ['build', 'test:' + target]);
	});

	grunt.registerTask('default', ['build', 'test']);

	grunt.registerTask('prepublish', ['default', 'update_json'])
};