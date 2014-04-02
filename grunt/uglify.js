module.exports = {
	options: {
		compress: {
			pure_getters: true
		},
		sourceMapIn: 'dist/<%= pkgName %>.js.map'
	},
	browser: {
		options: {
			compress: {
				global_defs: {NODE: false, BROWSER: true}
			},
			sourceMap: true,
			sourceMapName: function (js) { return js + '.map' }
		},
		files: {
			'dist/browser/<%= pkgName %>.js': 'dist/<%= pkgName %>.js'
		}
	},
	node: {
		options: {
			compress: {
				global_defs: {NODE: true, BROWSER: false}
			},
			mangle: false,
			beautify: true
		},
		files: {
			'dist/node/<%= pkgName %>.js': 'dist/<%= pkgName %>.js'
		}
	}
};