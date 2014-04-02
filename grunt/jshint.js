module.exports = function (grunt) {
	var jshintrc = grunt.file.readJSON('src/.jshintrc');
	jshintrc.indent = false;
	jshintrc.reporter = require('jshint-stylish');

	return {
		options: jshintrc,
		grunt: {
			options: {
				camelcase: false
			},
			src: 'grunt/**/*.js'
		},
		before_concat: {
			options: {
				undef: false
			},
			src: ['+(src|test)/**/*.js', '*.js']
		},
		after_concat: {
			options: {
				'-W034': true
			},
			src: 'dist/<%= pkgName %>.js'
		}
	};
};