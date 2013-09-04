var env = process.env;

process.chdir(__dirname + '/..');

function part(name, exec) {
	console.log(name + '...');
	return exec.apply(this,
		exec.toString()
		.match(/\((.*?)\)/)[1]
		.split(', ')
		.filter(Boolean)
		.map(function (name) {
			return require(name.replace(/[A-Z]/g, function (c) { return '-' + c.toLowerCase() }));
		})
	);
}

part('Checking configuration', function () {
	if (env.TRAVIS_JOB_NUMBER && env.TRAVIS_JOB_NUMBER.slice(-2) !== '.1') {
		console.error('Node ' + process.version + ' is not configured for publish.');
		process.exit();
	}

	var missingEnv = ['NPM_USERNAME', 'NPM_PASSWORD', 'NPM_EMAIL', 'GH_TOKEN'].filter(function (name) { return !(name in env) });

	if (missingEnv.length) {
		throw new Error(missingEnv.join(', ') + ' environment variables should be set for publish.');
	}
});

part('Publishing to npm', function (npm) {
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
});

part('Publishing to GitHub', function (fs, rimraf) {
	rimraf('dist', function () {
		part('Cloning dist repo', function (child_process) {
			var exec = child_process.exec,
				distRepo = process.argv[2];

			exec('git clone https://' + env.GH_TOKEN + '@github.com/' + distRepo + '.git dist', function (err, stdout, stderr) {
				if (err) {
					console.error(err);
					console.error('Output (stdout): ' + stdout);
					console.error('Output (stderr): ' + stderr);
					return;
				}

				var pkgInfo = JSON.parse(fs.readFileSync('package.json')),
					scriptName = pkgInfo.name + '.js';
					
				part('Minifying script', function (uglifyJs) {
					var minified = uglifyJs.minify(pkgInfo.main, {
						sourceRoot: '//raw.github.com/' + env.TRAVIS_REPO_SLUG + '/master',
						outSourceMap: scriptName + '.map'
					});

					fs.writeFileSync('dist/' + scriptName, minified.code + ['#', '@'].map(function (c) { return '\n//' + c + ' sourceMappingURL=' + scriptName + '.map' }).join(''));
					fs.writeFileSync('dist/' + scriptName + '.map', minified.map);
				});

				part('Pushing to dist repo', function () {
					exec([
						'git config user.name "' + env.NPM_USERNAME + '"',
						'git config user.email "' + env.NPM_EMAIL + '"',
						'git add .',
						'git commit -m "Updated ' + scriptName + '"',
						'git push origin'
					].join(' && '), {cwd: 'dist'}, function (err, stdout, stderr) {
						if (err) {
							console.error(err);
							console.error('Output (stdout): ' + stdout);
							console.error('Output (stderr): ' + stderr);
							return;
						}
						console.log('Pushed to dist repo.');
					});
				});
			});
		});
	});
});