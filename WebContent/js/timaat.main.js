(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.TIMAAT = {})));
}(this, (function (exports) { 'use strict';

	var version = 'v0.11.2e-dev (2021-04-13)';

	document.title = 'TIMAAT - Client '+version;
	$('#timaat-version-info').text(version);
	
	exports.version = version;
	window.TIMAAT = exports;
	
})));