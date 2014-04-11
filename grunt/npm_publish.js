module.exports = function (grunt) {
	grunt.registerTask('npm_publish', function () {
		var npm = require('npm'), done = this.async(), options = this.options();

		npm.load({}, function(err) {
			npm.registry.adduser(options.username, options.password, options.email, function (err) {
				if (err) {
					console.log(err);
					done(false);
				} else {
					npm.config.set('email', options.email);

					npm.commands.publish([], function (err) {
						console.log(err || 'Published to npm.');
						done(!err);
					});
				}
			});
		});
	});

	return {
		options: {
			username: process.env.NPM_USERNAME,
			password: process.env.NPM_PASSWORD,
			email: process.env.EMAIL
		}
	};
};