module.exports = function (grunt) {
	grunt.registerMultiTask('test', function () {
		grunt.task.run(this.options().task);
	});

	return {
		browser: {
			options: {
				task: 'karma:browser'
			},
			src: 'dist/browser/<%= pkgName %>.js'
		},
		node: {
			options: {
				task: 'mochaTest:node'
			},
			src: 'dist/node/<%= pkgName %>.js'
		}
	};
};