requirejs.config({
	baseUrl: 'js',
	paths: {
		"jquery": 					'../vendor/jquery/jquery.min',
		"jquery-ui":				'../vendor/jquery/plugins/jquery-ui/jquery-ui.min',
		"jquery-validate":			'../vendor/jquery/plugins/jquery.validate',
		"jquery-datetime":			'../vendor/jquery/plugins/jquery-datetimepicker/jquery.datetimepicker.full',
		"jquery-tinycolorpicker":	'../vendor/tinycolorpicker/jquery.tinycolorpicker',
		"jquery-dropzone":			'../vendor/dropzone/dropzone',

		"popper":					'../vendor/popper/popper.min',
		"bootstrap":				'../vendor/bootstrap/js/bootstrap.bundle.min',
		
		"argon2":					'../vendor/argon2/argon2-asm.min',

	    "leaflet":					'../vendor/leaflet/leaflet',
	    "leaflet-editable":			'../vendor/leaflet/plugins/Leaflet.Editable/src/Leaflet.Editable',
	    "leaflet-pathdrag":			'../vendor/leaflet/plugins/Path.Drag.js/src/Path.Drag',
	    "leaflet-customcontrol":	'../vendor/leaflet/plugins/Leaflet.Control.Custom/Leaflet.Control.Custom',

	    "moment":					'../vendor/moment/moment',
		
		"sbadmin2":					'sb-admin-2',
		"timaathtml":				'timaat.html',
		
		"TIMAAT":					'timaat.main',
		"TIMAAT-ui":				'timaat.ui',
		"TIMAAT-videochooser":		'components/timaat.component.videochooser',
		"TIMAAT-videoplayer":		'components/timaat.component.videoplayer',
		"TIMAAT-settings":			'components/timaat.component.settings',
		"TIMAAT-datasets":			'datasets/timaat.datasets',
		"TIMAAT-actordatasets":		'datasets/timaat.datasets.actor',
		"TIMAAT-eventdatasets":		'datasets/timaat.datasets.event',
		"TIMAAT-locationdatasets":	'datasets/timaat.datasets.location',
		"TIMAAT-mediadatasets":		'datasets/timaat.datasets.media',
		"TIMAAT-service":			'service/timaat.service',
		"TIMAAT-actorservice":		'service/timaat.service.actor',
		"TIMAAT-locationservice":	'service/timaat.service.location',		
		"TIMAAT-mediaservice":		'service/timaat.service.media',
		"TIMAAT-eventservice":		'service/timaat.service.event',
		"TIMAAT-util":				'timaat.util',
		"TIMAAT-marker":			'model/timaat.marker',
		"TIMAAT-annotation":		'model/timaat.annotation', 
		"TIMAAT-categoryset":		'model/timaat.categoryset', 
		"TIMAAT-analysissegment":	'model/timaat.analysissegment', 
		"TIMAAT-medium":			'model/timaat.medium', 
		"TIMAAT-mediatype":			'model/timaat.model.mediatype', 
		"TIMAAT-audio":				'model/timaat.model.audio', 
		"TIMAAT-document":			'model/timaat.model.document', 
		"TIMAAT-image":				'model/timaat.model.image', 
		"TIMAAT-software":			'model/timaat.model.software', 
		"TIMAAT-text":				'model/timaat.model.text', 
		"TIMAAT-video":				'model/timaat.model.video', 
		"TIMAAT-videogame":			'model/timaat.model.videogame', 
		"TIMAAT-actor":				'model/timaat.model.actor', 
		"TIMAAT-location":			'model/timaat.model.location', 
		"TIMAAT-locationtype":		'model/timaat.model.locationtype', 
		"TIMAAT-country":			'model/timaat.model.country', 
		"TIMAAT-province":			'model/timaat.model.province', 
		"TIMAAT-county":			'model/timaat.model.county', 
		"TIMAAT-city":				'model/timaat.model.city', 
		"TIMAAT-street":			'model/timaat.model.street', 
		"TIMAAT-event":				'model/timaat.model.event', 

	}, 
	shim: {
	    'jquery-ui': { deps: [ 'jquery' ], exports: 'jQuery.ui' },
	    'jquery-validate': { deps: [ 'jquery' ], exports: 'jQuery.validate' },
	    'jquery-datetime': { deps: [ 'jquery' ], exports: 'jQuery.datetimepicker' },
	    'jquery-tinycolorpicker': { deps: [ 'jquery' ], exports: 'jQuery.tinycolorpicker' },
	    'jquery-dropzone': { deps: [ 'jquery' ], exports: 'jQuery.dropzone' },
	    'bootstrap': { deps: ['jquery'], },
	    'leaflet-editable': { deps: ['leaflet'], },
	    'leaflet-pathdrag': { deps: ['leaflet'], exports: 'L.PathDraggable' },
	    'leaflet-customcontrol': { deps: ['leaflet'], },
	    'moment': { deps: [ 'jquery' ], exports: 'moment' },
	}
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
	
	'argon2',
	
	'leaflet',
	'leaflet-editable',
	'leaflet-pathdrag',
	'leaflet-customcontrol',
	], function (domReady) { domReady(function () {
	  console.log("TIMAAT::Init");
	  requirejs(['moment', 'sbadmin2', 'timaathtml', 
		  'TIMAAT', 'TIMAAT-ui', 'TIMAAT-videochooser', 'TIMAAT-videoplayer', 'TIMAAT-settings', 'TIMAAT-util', 
		  'TIMAAT-datasets', 'TIMAAT-actordatasets', 'TIMAAT-eventdatasets', 'TIMAAT-locationdatasets', 'TIMAAT-mediadatasets',
		  'TIMAAT-service', 'TIMAAT-actorservice', 'TIMAAT-locationservice', 'TIMAAT-mediaservice', 'TIMAAT-eventservice',
		  'TIMAAT-marker', 'TIMAAT-annotation', 'TIMAAT-categoryset', 'TIMAAT-analysissegment', 'TIMAAT-medium',
		  'TIMAAT-mediatype', 'TIMAAT-audio', 'TIMAAT-document', 'TIMAAT-image', 'TIMAAT-software', 'TIMAAT-text', 'TIMAAT-video', 'TIMAAT-videogame', 
		  'TIMAAT-actor', 'TIMAAT-location', 'TIMAAT-locationtype', 'TIMAAT-country', 'TIMAAT-province', 'TIMAAT-county', 'TIMAAT-city', 'TIMAAT-street', 'TIMAAT-event', 
		  
		  ], function (moment) {
		  console.log("TIMAAT::Setup");
		  window.moment = moment;		  
		  
			var map = L.map('map', {
				zoomControl: false,
				attributionControl: false,
				zoom: 1,
				maxZoom: 0,
				center: [0,0],
				crs: L.CRS.Simple,
				editable: true,		
			});
			
			window.map = map; // TODO refactor	
			map.on('layeradd', function(ev) {
				if ( ev.layer.options.data ) 
					ev.layer.eachLayer(function (layer) {
						if ( !layer.options.editable ) layer.enableEdit();
						layer.options.editable = true;
					});
			});
			
			var bounds = [[450,0], [0,800]];
			map.setMaxBounds(bounds);
			map.fitBounds(bounds);	
			map.dragging.disable();
			map.touchZoom.disable();
			map.doubleClickZoom.disable();
			map.scrollWheelZoom.disable();

			$(window).resize(function() {
				TIMAAT.VideoPlayer.markerList.forEach(function(marker) {
					marker._updateElementOffset();
				});
			});
			
			TIMAAT.UI.init();

			console.log("TIMAAT::Ready");

	  });
	  
		  
  });
});