module.exports = function (grunt) {
	grunt.registerTask('prebuild', [
		'lintspaces',
		'jshint:grunt',
		'jshint:before_concat',
		'concat_sourcemap',
		'jshint:after_concat'
	]);

	grunt.registerTask('build', function (target) {
		grunt.task.run('prebuild', 'uglify:' + (target || '*'));
	});
};