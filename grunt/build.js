module.exports = function (grunt) {
	grunt.registerTask('build', function (target) {
		grunt.task.run('build_common', 'uglify:' + (target || '*'));
	});
};