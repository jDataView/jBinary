module.exports = function (grunt) {
	require('load-grunt-config')(grunt, {
		data: {
			pkgName: 'jbinary'
		}
	});

	grunt.registerTask('prebuild', ['lintspaces', 'jshint:before_concat', 'concat_sourcemap', 'jshint:after_concat']);

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