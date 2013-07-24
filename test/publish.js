var npm = require('npm'), env = process.env;

if (env.TRAVIS_JOB_NUMBER && env.TRAVIS_JOB_NUMBER.slice(-2) !== '.1') {
	console.log('Node ' + process.version + ' is not configured for publish.');
	process.exit();
}

npm.load(function () {
	npm.registry.adduser(env.NPM_USERNAME, env.NPM_PASSWORD, env.NPM_EMAIL, function (err) {
		if (err) return console.error(err);

		npm.config.set('email', env.NPM_EMAIL, 'user');
		npm.commands.publish(function (err) {
			if (err) return console.error(err.code === 'EPUBLISHCONFLICT' ? err.pkgid + ' was already published.' : err);
			console.log('Published to registry');
		});
	});
});