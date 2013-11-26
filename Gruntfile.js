module.exports = function (grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		repo: 'jDataView/jBinary',
		jshint: {
			options: {
				jshintrc: true
			},
			files: ['src/**/*.js']
		},
		mochaTest: {
			options: {
				reporter: 'spec',
				require: './test/bdd-qunit-mocha-ui',
				ui: 'bdd-qunit-mocha-ui'
			},
			src: ['test/test.js']
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
						global_defs: {NODEJS: false, BROWSER: true}
					},
					sourceMap: 'dist/<%= pkg.name %>.js.map',
					sourceMapRoot: '//raw.github.com/<%= repo %>/master',
					sourceMappingURL: '<%= pkg.name %>.js.map'
				},
				files: {
					'dist/<%= pkg.name %>.js': ['src/<%= pkg.name %>.js']
				}
			},
			node: {
				options: {
					compress: {
						global_defs: {NODEJS: true, BROWSER: false}
					}
				},
				files: {
					'dist/<%= pkg.name %>.node.js': ['src/<%= pkg.name %>.js']
				}
			}
		},
		component: {
			repo: '<%= repo %>',
			main: 'dist/<%= pkg.name %>.js',
			scripts: ['<%= component.main %>'],
			license: '<%= pkg.licenses[0].type %>'
		},
		release: {
			options: {
				tagName: 'v<%= version %>',
				github: { 
					repo: '<%= repo %>',
					usernameVar: 'GITHUB_USERNAME',
					passwordVar: 'GITHUB_PASSWORD'
				}
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

	grunt.registerTask('build:browser', ['uglify:browser', 'component']);
	grunt.registerTask('build:node', ['uglify:node', 'mochaTest']);

	grunt.registerTask('browser', ['jshint', 'build:browser']);
	grunt.registerTask('node', ['jshint', 'build:node']);
	grunt.registerTask('default', ['jshint', 'build:browser', 'build:node']);
	
	grunt.registerTask('publish', ['default', 'release']);
};