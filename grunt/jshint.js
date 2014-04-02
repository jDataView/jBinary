module.exports = function (grunt) {
	var jshintrc = grunt.file.readJSON('src/.jshintrc');
	jshintrc.indent = false;
	jshintrc.reporter = require('jshint-stylish');

	return {
		options: jshintrc,
		before_concat: {
			options: {
				undef: false
			},
			src: 'src/**/*.js'
		},
		after_concat: {
			options: {
				'-W034': true
			},
			src: 'dist/<%= pkgName %>.js'
		}
	};
};