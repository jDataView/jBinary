module.exports = function (grunt) {
	grunt.registerMultiTask('test', function () {
		grunt.task.run(this.data + ':' + this.target);
	});

	return {
		browser: 'karma',
		node: 'mochaTest'
	};
};