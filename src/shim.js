import 'es5-ext/array/from/implement';
import 'es6-weak-map/implement';

export {atob, btoa} from 'Base64';

var {Promise} = global;
if (!Promise) {
	import {Promise} from 'es6-promise';
	if (BROWSER && !Promise) {
		Promise = then => {
			if (global.console) {
				(console.warn || console.log).call(console, (
					'Your browser does not support Promises.\n' +
					'Composing promises might behave incorrectly.'
				));
			}
			return (Promise = then => ({then}))(then);
		};
	}
}
export {Promise};

import '6to5/runtime';
