module.exports = {
	options: {
		exports: 'jBinary',
		external: {
			'es6-promise': false,
			'fs': false,
			'jdataview': {
				global: 'jDataView'
			},
			'request-promise': false,
			'stream': false
		},
		map: true
	},
	all: {
		files: {
			'dist/browser/<%= pkgName %>.js': 'dist/es5/index.js'
		}
	}
};
