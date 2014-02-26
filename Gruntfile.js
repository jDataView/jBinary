module.exports = function (grunt) {
	grunt.initConfig({
		libName: 'jBinary',
		pkgName: '<%= libName.toLowerCase() %>',
		concat: {
			options: {
				process: function (src) {
					return src.trim();
				},
				separator: Array(3).join(grunt.util.linefeed)
			},
			all: {
				files: {
					'dist/<%= pkgName %>.js': [
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
			all: ['dist/<%= pkgName %>.js']
		},
		umd: {
			all: {
				src: 'dist/<%= pkgName %>.js',
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
					sourceMap: 'dist/browser/<%= pkgName %>.js.map',
					sourceMapRoot: '../..',
					sourceMappingURL: '<%= pkgName %>.js.map'
				},
				files: {
					'dist/browser/<%= pkgName %>.js': 'dist/<%= pkgName %>.js'
				}
			},
			node: {
				options: {
					compress: {
						global_defs: {NODE: true, BROWSER: false}
					}
				},
				files: {
					'dist/node/<%= pkgName %>.js': 'dist/<%= pkgName %>.js'
				}
			}
		},
		mochaTest: {
			options: {
				reporter: process.env.CI ? 'dot' : 'progress'
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
			},
			watch: {
				background: true
			}
		},
		test: {
			browser: 'karma:browser',
			node: 'mochaTest:node'
		},
		bump: {
			options: {
				files: ['package.json', 'component.json'],
				commitFiles: ['-a'],
				pushTo: 'origin'
			}
		},
		watch: {
			options: {
				atBegin: true,
				interrupt: true
			},
			all: {
				files: [
					'Gruntfile.js',
					'src/**/*.js',
					'test/test.js'
				],
				tasks: ['build', 'karma:watch:run', 'mochaTest:node']
			}
		},
		'gh-pages': {
			options: {
				base: 'dist/browser',
				repo: 'git@github.com:jDataView/dist2.git'
			},
			all: ['<%= pkgName %>.js', '<%= pkgName %>.js.map']
		}
	});

	require('load-grunt-tasks')(grunt);

	grunt.registerTask('prebuild', ['concat', 'jshint', 'umd']);

	grunt.registerTask('build', function (target) {
		grunt.task.run('prebuild', 'uglify' + (target ? ':' + target : ''));
	});
 
	grunt.registerMultiTask('test', function () {
		grunt.task.run(this.data);
	});

	['browser', 'node'].forEach(function (target) {
		grunt.registerTask(target, ['build:' + target, 'test:' + target]);
	});

	grunt.registerTask('default', ['build', 'test']);

	grunt.registerTask('live', ['karma:watch:start', 'watch']);

	grunt.registerTask('publish', function (changeLevel) {
		grunt.task.run('default', 'bump:' + (changeLevel || 'build'), 'gh-pages');
	});
};