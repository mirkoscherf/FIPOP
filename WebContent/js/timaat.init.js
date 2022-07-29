requirejs.config({
	baseUrl: 'js',
	paths: {
		"argon2"                          : '../vendor/argon2/argon2-asm.min',
		"jquery"                          : '../vendor/jquery/jquery.min',
		"jquery-ui"                       : '../vendor/jquery/plugins/jquery-ui/jquery-ui.min',
		"jquery-validate"                 : '../vendor/jquery/plugins/jquery.validate',
		"jquery-datetime"                 : '../vendor/jquery/plugins/jquery-datetimepicker/jquery.datetimepicker.full',
		"jquery-mousewheel"               : '../vendor/jquery/plugins/jquery-mousewheel',
		"jquery-tinycolorpicker"          : '../vendor/tinycolorpicker/jquery.tinycolorpicker',
		"jquery-dropzone"                 : '../vendor/dropzone/dropzone',
		"bootstrap"                       : '../vendor/bootstrap/js/bootstrap.bundle.min',
		"dataTables"                      : '../vendor/datatables/datatables.min',
		"dataTables.net"                  : '../vendor/datatables/DataTables-1.11.5/js/jquery.dataTables.min',
		"dataTables.net-bs"               : '../vendor/datatables/DataTables-1.11.5/js/dataTables.bootstrap.min',
		"domReady"                        : '../vendor/requirejs/domReady',
		"moment"                          : '../vendor/moment/moment-with-locales',
		"leaflet"                         : '../vendor/leaflet/leaflet',
		"leaflet-editable"                : '../vendor/leaflet/plugins/Leaflet.Editable/src/Leaflet.Editable',
		"leaflet-pathdrag"                : '../vendor/leaflet/plugins/Path.Drag.js/src/Path.Drag',
		"leaflet-pathtransform"           : '../vendor/leaflet/plugins/Path.Transform.js/L.Path.Transform',
		"leaflet-customcontrol"           : '../vendor/leaflet/plugins/Leaflet.Control.Custom/Leaflet.Control.Custom',
		"leaflet-sidebar"                 : '../vendor/leaflet/plugins/leaflet-sidebar-v2/js/leaflet-sidebar.min',
		"popper"                          : '../vendor/popper/popper.min',
		"select2"                         : '../vendor/select2/js/select2.min',
		"summernote"                      : '../vendor/summernote/summernote.min',
		"TIMAAT"                          : 'timaat.main',
		"TIMAAT-html"                     : 'timaat.html',
		"TIMAAT-URLHistory"               : 'timaat.url',
		"TIMAAT-ui"                       : 'ui/timaat.ui',
		"TIMAAT-ui-inspector"             : 'ui/timaat.inspector',
		"TIMAAT-ui-timeline"              : 'ui/timaat.timeline',
		"TIMAAT-uploadManager"            : 'components/timaat.uploadmanager',
		"TIMAAT-videoPlayer"              : 'components/timaat.component.videoplayer',
		"TIMAAT-settings"                 : 'components/timaat.component.settings',
		"TIMAAT-userSettings"             : 'components/timaat.component.usersettings',
		"TIMAAT-datasets"                 : 'datasets/timaat.datasets',
		"TIMAAT-actorDatasets"            : 'datasets/timaat.datasets.actor',
		"TIMAAT-analysisDatasets"         : 'datasets/timaat.datasets.analysis',
		"TIMAAT-eventDatasets"            : 'datasets/timaat.datasets.event',
		"TIMAAT-locationDatasets"         : 'datasets/timaat.datasets.location',
		"TIMAAT-mediumDatasets"           : 'datasets/timaat.datasets.medium',
		"TIMAAT-mediumCollectionDatasets" : 'datasets/timaat.datasets.mediumcollection',
		"TIMAAT-musicDatasets"            : 'datasets/timaat.datasets.music',
		"TIMAAT-lists"                    : 'datasets/timaat.lists',
		"TIMAAT-roleLists"                : 'datasets/timaat.lists.role',
		"TIMAAT-categoryLists"            : 'datasets/timaat.lists.category',
		"TIMAAT-languageLists"            : 'datasets/timaat.lists.language',
		"TIMAAT-tagLists"                 : 'datasets/timaat.lists.tag',
		"TIMAAT-service"                  : 'service/timaat.service',
		"TIMAAT-userService"              : 'service/timaat.service.usersettings',
		"TIMAAT-publicationService"       : 'service/timaat.service.publication',
		"TIMAAT-categoryService"          : 'service/timaat.service.category',
		"TIMAAT-categorySetService"       : 'service/timaat.service.categoryset',
		"TIMAAT-actorService"             : 'service/timaat.service.actor',
		"TIMAAT-analysisService"          : 'service/timaat.service.analysis',
		"TIMAAT-analysisListService"      : 'service/timaat.service.analysislist',
		"TIMAAT-annotationService"        : 'service/timaat.service.annotation',
		"TIMAAT-roleService"              : 'service/timaat.service.role',
		"TIMAAT-languageService"          : 'service/timaat.service.language',
		"TIMAAT-locationService"          : 'service/timaat.service.location',
		"TIMAAT-mediumService"            : 'service/timaat.service.medium',
		"TIMAAT-mediumCollectionService"  : 'service/timaat.service.mediumcollection',
		"TIMAAT-eventService"             : 'service/timaat.service.event',
		"TIMAAT-musicService"             : 'service/timaat.service.music',
		"TIMAAT-util"                     : 'timaat.util',
		"TIMAAT-marker"                   : 'model/timaat.marker',
		"TIMAAT-keyframe"                 : 'model/timaat.keyframe',
		"TIMAAT-annotation"               : 'model/timaat.annotation',
		"TIMAAT-category"                 : 'model/timaat.model.category',
		"TIMAAT-categorySet"              : 'model/timaat.model.categoryset',
		"TIMAAT-analysisSegment"          : 'model/timaat.model.analysissegment',
		"TIMAAT-analysisSequence"         : 'model/timaat.model.analysissequence',
		"TIMAAT-analysisTake"             : 'model/timaat.model.analysistake',
		"TIMAAT-analysisScene"            : 'model/timaat.model.analysisscene',
		"TIMAAT-analysisAction"           : 'model/timaat.model.analysisaction',
		"TIMAAT-actor"                    : 'model/timaat.model.actor',
		"TIMAAT-actorType"                : 'model/timaat.model.actortype',
		"TIMAAT-role"                     : 'model/timaat.model.role',
		"TIMAAT-roleGroup"                : 'model/timaat.model.rolegroup',
		"TIMAAT-language"                 : 'model/timaat.model.language',
		"TIMAAT-addressType"              : 'model/timaat.model.addresstype',
		"TIMAAT-emailAddressType"         : 'model/timaat.model.emailaddresstype',
		"TIMAAT-event"                    : 'model/timaat.model.event',
		"TIMAAT-medium"                   : 'model/timaat.model.medium',
		"TIMAAT-mediumCollection"         : 'model/timaat.model.mediumcollection',
		"TIMAAT-music"                    : 'model/timaat.model.music',
		"TIMAAT-musicArticulationElement" : 'model/timaat.model.musicArticulationElement',
		"TIMAAT-musicChangeInTempoElement": 'model/timaat.model.musicChangeInTempoElement',
		"TIMAAT-musicDynamicsElement"		  : 'model/timaat.model.musicDynamicsElement',
		"TIMAAT-musicTextSettingElement"  : 'model/timaat.model.musicTextSettingElement',
		"TIMAAT-musicFormElement"         : 'model/timaat.model.musicFormElement',
		"TIMAAT-mediumType"               : 'model/timaat.model.mediumtype',
		"TIMAAT-location"                 : 'model/timaat.model.location',
		"TIMAAT-locationType"             : 'model/timaat.model.locationtype',
		"TIMAAT-country"                  : 'model/timaat.model.location.country',
		"TIMAAT-province"                 : 'model/timaat.model.location.province',
		"TIMAAT-county"                   : 'model/timaat.model.location.county',
		"TIMAAT-city"                     : 'model/timaat.model.location.city',
		"TIMAAT-street"                   : 'model/timaat.model.location.street',

	},
	shim: {
		'jquery'                : { exports: 'jquery' },
		'jquery-ui'             : { deps: [ 'jquery' ], exports: 'jQuery.ui' },
		'jquery-validate'       : { deps: [ 'jquery' ], exports: 'jQuery.validate' },
		'jquery-datetime'       : { deps: [ 'jquery' ], exports: 'jQuery.datetimepicker' },
		'jquery-tinycolorpicker': { deps: [ 'jquery' ], exports: 'jQuery.tinycolorpicker' },
		'jquery-dropzone'       : { deps: [ 'jquery' ], exports: 'jQuery.dropzone' },
		'bootstrap'             : { deps: [ 'jquery', 'jquery-ui' ], },
		'moment'                : { deps: [ 'jquery' ], exports: 'moment' },
		'dataTables'            : { deps: [ 'bootstrap', 'jquery' ], exports: 'dataTables' },
		'summernote'            : { deps: [ 'bootstrap', 'jquery', 'jquery-ui' ], exports: 'summernote' },
		'leaflet-editable'      : { deps: [ 'leaflet' ], },
		'leaflet-pathdrag'      : { deps: [ 'leaflet' ], exports: 'L.PathDraggable' },
		'leaflet-pathtransform' : { deps: [ 'leaflet', 'leaflet-pathdrag' ], },
		'leaflet-customcontrol' : { deps: [ 'leaflet' ], },
		'leaflet-sidebar'       : { deps: [ 'leaflet' ], },
	},
	packages: [{
		name    : 'moment',
		location: '../vendor/moment',
		main    : 'moment'
	}],
});

require(['domReady',
	'jquery',
	'jquery-ui',
	'jquery-validate',
	'jquery-datetime',
	'jquery-tinycolorpicker',
	'jquery-dropzone',

	'popper',
	'bootstrap',
	'select2',
	'summernote',
	'argon2',
	'leaflet',
	'leaflet-editable',
	'leaflet-pathdrag',
//	'leaflet-pathtransform',
	'leaflet-customcontrol',
	'leaflet-sidebar',
	], function (domReady) { domReady(function () {
	  console.info("TIMAAT::Init");
		requirejs([
			'moment',
			'dataTables',
			'TIMAAT',
			'TIMAAT-html',
			'TIMAAT-URLHistory',
			'TIMAAT-ui',
			'TIMAAT-ui-inspector',
			'TIMAAT-ui-timeline',
			'TIMAAT-uploadManager',
			'TIMAAT-videoPlayer',
			'TIMAAT-settings',
			'TIMAAT-userSettings',
			'TIMAAT-util',
			'TIMAAT-datasets',
			'TIMAAT-lists',
			'TIMAAT-service',
			'TIMAAT-userService',
			'TIMAAT-publicationService',
			'TIMAAT-marker',
			'TIMAAT-keyframe',
			'TIMAAT-annotation',
			'TIMAAT-annotationService',
			'TIMAAT-analysisSegment',
			'TIMAAT-analysisSequence',
			'TIMAAT-analysisTake',
			'TIMAAT-analysisScene',
			'TIMAAT-analysisAction',
			'TIMAAT-actor',
			'TIMAAT-actorDatasets',
			'TIMAAT-actorService',
			'TIMAAT-actorType',
			'TIMAAT-addressType',
			'TIMAAT-emailAddressType',
			'TIMAAT-analysisDatasets',
			'TIMAAT-analysisListService',
			'TIMAAT-analysisService',
			'TIMAAT-category',
			'TIMAAT-categorySet',
			'TIMAAT-categoryLists',
			'TIMAAT-categoryService',
			'TIMAAT-categorySetService',
			'TIMAAT-event',
			'TIMAAT-eventDatasets',
			'TIMAAT-eventService',
			'TIMAAT-language',
			'TIMAAT-languageLists',
			'TIMAAT-languageService',
			'TIMAAT-location',
			'TIMAAT-locationDatasets',
			'TIMAAT-locationService',
			'TIMAAT-locationType',
			'TIMAAT-country',
			'TIMAAT-province',
			'TIMAAT-county',
			'TIMAAT-city',
			'TIMAAT-street',
			'TIMAAT-medium',
			'TIMAAT-mediumDatasets',
			'TIMAAT-mediumService',
			'TIMAAT-mediumType',
			'TIMAAT-mediumCollection',
			'TIMAAT-mediumCollectionDatasets',
			'TIMAAT-mediumCollectionService',
			'TIMAAT-music',
			'TIMAAT-musicArticulationElement',
			'TIMAAT-musicChangeInTempoElement',
			'TIMAAT-musicDynamicsElement',
			'TIMAAT-musicTextSettingElement',
			'TIMAAT-musicFormElement',
			'TIMAAT-musicDatasets',
			'TIMAAT-musicService',
			'TIMAAT-role',
			'TIMAAT-roleGroup',
			'TIMAAT-roleLists',
			'TIMAAT-roleService',
			'TIMAAT-tagLists',
		  ], function (moment) {
		  console.info("TIMAAT::Setup");
		  window.moment = moment;
		  // init UI
		  TIMAAT.UI.init();
			console.info("TIMAAT::Ready");
		});
  });
});
