/* jshint ignore:start */

// https://github.com/davidchambers/Base64.js (modified)
if (!('atob' in global) || !('btoa' in global)) {
	(function(){var t=global,r="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",n=function(){try{document.createElement("$")}catch(t){return t}}();t.btoa||(t.btoa=function(t){for(var o,e,a=0,c=r,f="";t.charAt(0|a)||(c="=",a%1);f+=c.charAt(63&o>>8-8*(a%1))){if(e=t.charCodeAt(a+=.75),e>255)throw n;o=o<<8|e}return f}),t.atob||(t.atob=function(t){if(t=t.replace(/=+$/,""),1==t.length%4)throw n;for(var o,e,a=0,c=0,f="";e=t.charAt(c++);~e&&(o=a%4?64*o+e:e,a++%4)?f+=String.fromCharCode(255&o>>(6&-2*a)):0)e=r.indexOf(e);return f})})();
}

if (BROWSER && !jDataView) {
	var tempKey = 'jBinary_activate';

	global[tempKey] = function () {
		try {
			delete global[tempKey];
		} catch (e) {
			// hello, old IE!
			global[tempKey] = undefined;
		}

		jDataView = global.jDataView;
	};

	document.write('<script src="//jdataview.github.io/dist/jdataview.js"></script><script>' + tempKey + '()</script>');
}

/* jshint ignore:end */