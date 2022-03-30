(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.TIMAAT = {})));
}(this, (function (exports) { 'use strict';

	var version = 'v0.15.1h-dev (2022-03-30)';

	document.title = 'TIMAAT - Client ' + version;
	$('#timaat-version-info').text(version);
	$('#timaat-title-info').text(`TIMAAT - Time-based Image Area Annotation Tool ` + version);

	exports.version = version;
	window.TIMAAT = exports;

})));