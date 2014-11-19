export function getContext(filter) {
	switch (typeof filter) {
		case 'undefined':
			filter = 0;
		/* falls through */
		case 'number':
			return this.contexts[filter];

		case 'string':
			return this.getContext(context => filter in context);

		case 'function':
			for (var i = 0; i < this.contexts.length; i++) {
				var context = this.contexts[i];
				if (filter.call(this, context)) {
					return context;
				}
			}
	}
};

export function pushContext(newContext) {
	this.contexts.unshift(newContext);
};

export function popContext() {
	this.contexts.shift();
};

export function inContext(newContext, callback) {
	this.pushContext(newContext);
	var result = callback.call(this);
	this.popContext();
	return result;
};
