/* jshint ignore:start */

if (BROWSER) {
	var document = global.document;
}

// https://github.com/davidchambers/Base64.js (modified)
if (!('atob' in global) || !('btoa' in global)) {
	(function(){var a="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";var d=[-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,62,-1,-1,-1,63,52,53,54,55,56,57,58,59,60,61,-1,-1,-1,-1,-1,-1,-1,0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,-1,-1,-1,-1,-1,-1,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,-1,-1,-1,-1,-1];function b(l){var g,j,e;var k,h,f;e=l.length;j=0;g="";while(j<e){k=l.charCodeAt(j++)&255;if(j==e){g+=a.charAt(k>>2);g+=a.charAt((k&3)<<4);g+="==";break}h=l.charCodeAt(j++);if(j==e){g+=a.charAt(k>>2);g+=a.charAt(((k&3)<<4)|((h&240)>>4));g+=a.charAt((h&15)<<2);g+="=";break}f=l.charCodeAt(j++);g+=a.charAt(k>>2);g+=a.charAt(((k&3)<<4)|((h&240)>>4));g+=a.charAt(((h&15)<<2)|((f&192)>>6));g+=a.charAt(f&63)}return g}function c(m){var l,k,h,f;var j,e,g;e=m.length;j=0;g="";while(j<e){do{l=d[m.charCodeAt(j++)&255]}while(j<e&&l==-1);if(l==-1){break}do{k=d[m.charCodeAt(j++)&255]}while(j<e&&k==-1);if(k==-1){break}g+=String.fromCharCode((l<<2)|((k&48)>>4));do{h=m.charCodeAt(j++)&255;if(h==61){return g}h=d[h]}while(j<e&&h==-1);if(h==-1){break}g+=String.fromCharCode(((k&15)<<4)|((h&60)>>2));do{f=m.charCodeAt(j++)&255;if(f==61){return g}f=d[f]}while(j<e&&f==-1);if(f==-1){break}g+=String.fromCharCode(((h&3)<<6)|f)}return g}if(!global.btoa){global.btoa=b}if(!global.atob){global.atob=c}})();
}

/* jshint ignore:end */

var Promise = global.Promise || (NODE ? require('es6-promise').Promise : function (executor) {
	this.then = executor;
});