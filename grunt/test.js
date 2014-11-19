module.exports = function (grunt) {
	grunt.registerMultiTask('test', function () {
		grunt.task.run(this.options().task);
	});

	return {
		browser: {
			options: {
				task: 'karma:browser'
			}
		},
		node: {
			options: {
				task: 'mochaTest:node'
			}
		}
	};
};
