module.exports = function (grunt) {
	grunt.initConfig({
		libName: 'jBinary',
		pkgName: '<%= libName.toLowerCase() %>',
		concat_sourcemap: {
			options: {
				separator: Array(3).join(grunt.util.linefeed),
				sourceRoot: process.env.CI ? '//raw.github.com/' + process.env.TRAVIS_REPO_SLUG + '/' + process.env.TRAVIS_COMMIT : '../..'
			},
			all: {
				files: {
					'dist/<%= pkgName %>.js': [
						'src/umd/header.js',

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
						'src/io/load.js',
						'src/io/save.js',

						'src/umd/footer.js'
					]
				} 
			}
		},
		jshint: {
			options: grunt.file.readJSON('src/.jshintrc'),
			before_concat: {
				options: {
					undef: false
				},
				src: ['src/**/*.js', '!src/umd/**']
			},
			after_concat: {
				options: {
					indent: false,
					'-W034': true
				},
				src: 'dist/<%= pkgName %>.js'
			}
		},
		uglify: {
			options: {
				compress: {
					pure_getters: true
				},
				sourceMapIn: 'dist/<%= pkgName %>.js.map'
			},
			browser: {
				options: {
					compress: {
						global_defs: {NODE: false, BROWSER: true}
					},
					sourceMap: true,
					sourceMapName: function (js) { return js + '.map' }
				},
				files: {
					'dist/browser/<%= pkgName %>.js': 'dist/<%= pkgName %>.js'
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
				files: {
					'dist/node/<%= pkgName %>.js': 'dist/<%= pkgName %>.js'
				}
			}
		},
		mochaTest: {
			options: {
				reporter: process.env.CI ? 'dot' : 'progress'
			},
			node: 'test/test.js'
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
		compare_size: {
			options: {
				cache: 'dist/.sizecache.json',
				compress: {
					gz: function (content) {
						return require('gzip-js').zip(content, {}).length;
					}
				}
			},
			all: 'dist/*/<%= pkgName %>.js'
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
		}
	});

	require('load-grunt-tasks')(grunt);

	grunt.registerTask('prebuild', ['jshint:before_concat', 'concat_sourcemap', 'jshint:after_concat']);

	grunt.registerTask('build', function (target) {
		grunt.task.run('prebuild', 'uglify' + (target ? ':' + target : ''));
	});
 
	grunt.registerMultiTask('test', function () {
		grunt.task.run(this.data);
	});

	['browser', 'node'].forEach(function (target) {
		grunt.registerTask(target, ['build:' + target, 'test:' + target]);
	});

	grunt.registerTask('default', ['build', 'test', 'compare_size']);

	grunt.registerTask('live', ['karma:watch:start', 'watch']);

	grunt.registerTask('npm-publish', 'Publish the latest version of this plugin', function () {
		var npm = require('npm'), done = this.async();

		npm.load({}, function(err) {
			npm.registry.adduser(process.env.NPM_USERNAME, process.env.NPM_PASSWORD, process.env.EMAIL, function (err) {
				if (err) {
					console.log(err);
					done(false);
				} else {
					npm.config.set('email', process.env.EMAIL);

					npm.commands.publish([], function (err) {
						console.log(err || 'Published to npm.');
						done(!err);
					});
				}
			});
		});
	});
};