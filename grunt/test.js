module.exports = function (grunt) {
	grunt.registerMultiTask('test', function () {
		grunt.task.run(this.options().task + ':' + this.target);
	});

	return {
		browser: {
			options: {
				task: 'karma'
			},
			src: 'dist/browser/<%= pkgName %>.js'
		},
		node: {
			options: {
				task: 'mochaTest'
			},
			src: 'dist/node/<%= pkgName %>.js'
		}
	};
};