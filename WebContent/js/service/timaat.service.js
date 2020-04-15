'use strict';
(function (factory, window) {
    /*globals define, module, require*/

    // define an AMD module that relies on 'TIMAAT'
    if (typeof define === 'function' && define.amd) {
        define(['TIMAAT'], factory);


    // define a Common JS module that relies on 'TIMAAT'
    } else if (typeof exports === 'object') {
        module.exports = factory(require('TIMAAT'));
    }

    // attach your plugin to the global 'TIMAAT' variable
    if(typeof window !== 'undefined' && window.TIMAAT){
        factory(window.TIMAAT);
    }

}(function (TIMAAT) {
	
	TIMAAT.Service = {
		state: 0,
		session: null,
		token: null,
		idCache: new Map(),
		
		logout: function() {
    	console.log("TCL: logout: function()");
			TIMAAT.Service.state = 2;
			TIMAAT.Service.token = null;
			TIMAAT.Service.session = null;
			location.reload(true);
		},
		
		getAllCategorySets: function(callback) {
    // console.log("TCL: getAllCategorySets: function(callback)");
    // console.log("TCL: callback", callback);
			jQuery.ajax({
				url:window.location.protocol+'//'+window.location.host+"/TIMAAT/api/category/set/all",
				type:"GET",
				contentType:"application/json; charset=utf-8",
				dataType:"json",
				beforeSend: function (xhr) {
					xhr.setRequestHeader('Authorization', 'Bearer '+TIMAAT.Service.token);
				},
			}).done(function(data) {
				callback(data);
			})
			.fail(function(e) {
				console.log( "error", e );
			});
		},
		
		getUserName: function(id, callback) {
      // console.log("TCL: getUserName: function(id, callback)");
			// console.log("TCL: id, callback", id, callback);
			jQuery.ajax({
				url:window.location.protocol+'//'+window.location.host+"/TIMAAT/api/user/"+id+"/name",
				type:"GET",
				contentType:"application/json; charset=utf-8",
				dataType:"text",
				beforeSend: function (xhr) {
					xhr.setRequestHeader('Authorization', 'Bearer '+TIMAAT.Service.token);
				},
			}).done(function(data) {
				callback(data);
			})
			.fail(function(e) {
				console.log( "error", e );
			});
		},
		
		getUserLog: function(id, limit, callback) {
    // console.log("TCL: getUserLog: function(id, limit, callback)");
    // console.log("TCL: id, limit, callback", id, limit, callback);
			jQuery.ajax({
				url:window.location.protocol+'//'+window.location.host+"/TIMAAT/api/log/user/"+id+"",
				type:"GET",
				contentType:"application/json; charset=utf-8",
				dataType:"json",
				beforeSend: function (xhr) {
					xhr.setRequestHeader('Authorization', 'Bearer '+TIMAAT.Service.token);
				},
			}).done(function(data) {
				callback(data);
			})
			.fail(function(e) {
				console.log( "error", e );
			});		},

		listVideos(callback) {
      // console.log("TCL: listVideos -> listVideos(callback)");
      // console.log("TCL: listVideos -> callback", callback);
			jQuery.ajax({
				url:window.location.protocol+'//'+window.location.host+"/TIMAAT/api/medium/video/list",
				type:"GET",
				contentType:"application/json; charset=utf-8",
				dataType:"json",
				beforeSend: function (xhr) {
					xhr.setRequestHeader('Authorization', 'Bearer '+TIMAAT.Service.token);
				},
			}).done(function(data) {
				callback(data);
			})
			.fail(function(e) {
				console.log( "error", e );
			});
			
		},
		
		getMediaCollections(callback) {
			// console.log("TCL: getMediaCollections -> getMediaCollections(callback) ");
			jQuery.ajax({
				url:window.location.protocol+'//'+window.location.host+"/TIMAAT/api/mediacollection/list?nocontents=1",
				type:"GET",
				contentType:"application/json; charset=utf-8",
				dataType:"json",
				beforeSend: function (xhr) {
					xhr.setRequestHeader('Authorization', 'Bearer '+TIMAAT.Service.token);
				},
			}).done(function(data) {
				callback(data);
			})
			.fail(function(e) {
				console.log( "error", e );
			});
			
		},

		createMediacollection(title, comment, callback) {
			console.log("TCL: createMediacollection -> createMediacollection(title, comment, callback)");
			console.log("TCL: createMediacollection -> title", title);
			console.log("TCL: createMediacollection -> comment", comment);
			var model = {
					id: 0,
					isSystemic: 0,
					title: title,
					note: comment,
			};
			jQuery.ajax({
				url:window.location.protocol+'//'+window.location.host+"/TIMAAT/api/mediacollection",
				type:"POST",
				data: JSON.stringify(model),
				contentType:"application/json; charset=utf-8",
				dataType:"json",
				beforeSend: function (xhr) {
					xhr.setRequestHeader('Authorization', 'Bearer '+TIMAAT.Service.token);
				},
			}).done(function(data) {
				callback(data);
			})
			.fail(function(e) {
				console.log( "error", e );
				console.log( e.responseText );
			});			
		},
		
		updateMediacollection(collection) {
			console.log("TCL: updatMediacollection -> collection", collection);
			var col = {
					id: collection.id,
					isSystemic: 0,
					title: collection.title,
					note: collection.note,
			};
			jQuery.ajax({
				url:window.location.protocol+'//'+window.location.host+"/TIMAAT/api/mediacollection/"+col.id,
				type:"PATCH",
				data: JSON.stringify(col),
				contentType:"application/json; charset=utf-8",
				dataType:"json",
				beforeSend: function (xhr) {
					xhr.setRequestHeader('Authorization', 'Bearer '+TIMAAT.Service.token);
				},
			}).done(function(data) {
				// TODO refactor
				collection.id = data.id;
				collection.title = data.title;
				collection.note = data.note;
			})
			.fail(function(e) {
				console.log( "error", e );
				console.log( e.responseText );
			});
		},
		
		removeMediacollection(collection) {
			console.log("TCL: removeMediacollection -> collection", collection);
			var col = collection;
			jQuery.ajax({
				url:window.location.protocol+'//'+window.location.host+"/TIMAAT/api/mediacollection/"+col.id,
				type:"DELETE",
				contentType:"application/json; charset=utf-8",
				beforeSend: function (xhr) {
					xhr.setRequestHeader('Authorization', 'Bearer '+TIMAAT.Service.token);
				},
			}).done(function(data) {
			})
			.fail(function(e) {
				console.log( "error", e );
				console.log( e.responseText );
			});
		},
		
		addCollectionItem(collection, medium) {
			console.log("TCL: addCollectionItem -> collection", collection);
			console.log("TCL: addCollectionItem -> medium", medium);
			var col = collection;
			jQuery.ajax({
				url:window.location.protocol+'//'+window.location.host+"/TIMAAT/api/mediacollection/"+col.id+"/medium/"+medium.id,
				type:"POST",
				contentType:"application/json; charset=utf-8",
				beforeSend: function (xhr) {
					xhr.setRequestHeader('Authorization', 'Bearer '+TIMAAT.Service.token);
				},
			}).done(function(data) {
			})
			.fail(function(e) {
				console.log( "error", e );
				console.log( e.responseText );
			});
		},


		async removeCollectionItem(collection, medium) {
			console.log("TCL: removeCollectionItem -> collection", collection);
			console.log("TCL: removeCollectionItem -> medium", medium);
			var col = collection;
			return new Promise(resolve => {
				$.ajax({
					url:window.location.protocol+'//'+window.location.host+"/TIMAAT/api/mediacollection/"+col.id+"/medium/"+medium.id,
					type:"DELETE",
					contentType:"application/json; charset=utf-8",
					beforeSend: function (xhr) {
						xhr.setRequestHeader('Authorization', 'Bearer '+TIMAAT.Service.token);
					},
				}).done(function(data) {
					console.log("TCL: removed medium from collection");
					resolve(data);
				}).fail(function(e) {
					console.log( "error", e );
					console.log( e.responseText );
				});
			}).catch((error) => {
				console.log("error: ", error);
			});
		},

		getAnalysisLists(videoID, callback) {
			console.log("TCL: getAnalysisLists -> getAnalysisLists(videoID, callback) ");
			console.log("TCL: getAnalysisLists -> videoID", videoID);
      // console.log("TCL: getAnalysisLists -> callback", callback);
      // console.log("TCL: getAnalysisLists -> videoID, callback", videoID, callback);
			jQuery.ajax({
				url:window.location.protocol+'//'+window.location.host+"/TIMAAT/api/medium/"+videoID+"/analysislists",
				type:"GET",
				contentType:"application/json; charset=utf-8",
				dataType:"json",
				beforeSend: function (xhr) {
					xhr.setRequestHeader('Authorization', 'Bearer '+TIMAAT.Service.token);
				},
			}).done(function(data) {
				callback(data);
			})
			.fail(function(e) {
				console.log( "error", e );
			});
			
		},

		createAnalysislist(title, comment, mediumID, callback) {
			console.log("TCL: createAnalysislist -> createAnalysislist(title, comment, mediumID, callback)");
			console.log("TCL: createAnalysislist -> title", title);
			console.log("TCL: createAnalysislist -> comment", comment);
			console.log("TCL: createAnalysislist -> mediumID", mediumID);
			var model = {
					"id": 0,
					"analysisSegments": [],
					"annotations": [],
					"mediumAnalysisListTranslations": [{
						"id": 0,
						"text": comment,
						"title": title,						
					}],	
					"mediumID": mediumID
			};
			jQuery.ajax({
				url:window.location.protocol+'//'+window.location.host+"/TIMAAT/api/analysislist/medium/"+mediumID,
				type:"POST",
				data: JSON.stringify(model),
				contentType:"application/json; charset=utf-8",
				dataType:"json",
				beforeSend: function (xhr) {
					xhr.setRequestHeader('Authorization', 'Bearer '+TIMAAT.Service.token);
				},
			}).done(function(data) {
				callback(data);
			})
			.fail(function(e) {
				console.log( "error", e );
				console.log( e.responseText );
			});			
		},

		updateAnalysislist(analysislist) {
			console.log("TCL: updateAnalysislist -> analysislist", analysislist);
			var list = {
					id: analysislist.id,
					mediumAnalysisListTranslations: analysislist.mediumAnalysisListTranslations,
					mediumID: analysislist.mediumID
			};
			jQuery.ajax({
				url:window.location.protocol+'//'+window.location.host+"/TIMAAT/api/analysislist/"+list.id,
				type:"PATCH",
				data: JSON.stringify(list),
				contentType:"application/json; charset=utf-8",
				dataType:"json",
				beforeSend: function (xhr) {
					xhr.setRequestHeader('Authorization', 'Bearer '+TIMAAT.Service.token);
				},
			}).done(function(data) {
				// TODO refactor
				analysislist.id = data.id;
				TIMAAT.Util.setDefTranslation(analysislist, 'mediumAnalysisListTranslations', 'title', data.title);
				TIMAAT.Util.setDefTranslation(analysislist, 'mediumAnalysisListTranslations', 'text', data.text);
			})
			.fail(function(e) {
				console.log( "error", e );
				console.log( e.responseText );
			});
		},

		removeAnalysislist(analysislist) {
			console.log("TCL: removeAnalysislist -> analysislist", analysislist);
			var list = analysislist;
			jQuery.ajax({
				url:window.location.protocol+'//'+window.location.host+"/TIMAAT/api/analysislist/"+list.id,
				type:"DELETE",
				contentType:"application/json; charset=utf-8",
				beforeSend: function (xhr) {
					xhr.setRequestHeader('Authorization', 'Bearer '+TIMAAT.Service.token);
				},
			}).done(function(data) {
			})
			.fail(function(e) {
				console.log( "error", e );
				console.log( e.responseText );
			});
		},
		
		createAnnotation(title, comment, startTime, endTime, color, strokeWidth, layerVisual, list, callback) {
			console.log("TCL: createAnnotation -> title, comment, startTime, endTime, color, strokeWidth, layerVisual, list, callback", title, comment, startTime, endTime, color, strokeWidth, layerVisual, list, callback);
			var model = { 	
				id: 0, 
				analysisListID: list,
				sequenceStartTime: startTime,
				sequenceEndTime: endTime,
				layerVisual: layerVisual,
//				actors: [],
//				annotations1: [],
//				annotations2: [],
//				categories: [],
//				events: [],
//				locations: [],
//				mediums: [],
				annotationTranslations: [{
					id: 0,
					comment: comment,
					title: title,
				}],
				selectorSvgs: [{
					id: 0,
					colorRgba: color,
					svgData: "[]",
					strokeWidth: strokeWidth,
					svgShapeType: {
						id: 5
					}
				}]
			};
			jQuery.ajax({
				url:window.location.protocol+'//'+window.location.host+"/TIMAAT/api/annotation/medium/"+TIMAAT.VideoPlayer.model.video.id,
				type:"POST",
				data: JSON.stringify(model),
				contentType:"application/json; charset=utf-8",
				dataType:"json",
				beforeSend: function (xhr) {
					xhr.setRequestHeader('Authorization', 'Bearer '+TIMAAT.Service.token);
				},
			}).done(function(data) {
				callback(new TIMAAT.Annotation(data));
			})
			.fail(function(e) {
				console.log( "error", e );
				console.log( e.responseText );
			});			
		},
		
		updateAnnotation(annotation) {
			console.log("TCL: updateAnnotation -> annotation", annotation);
			var anno = annotation;
			jQuery.ajax({
				url:window.location.protocol+'//'+window.location.host+"/TIMAAT/api/annotation/"+anno.model.id,
				type:"PATCH",
				data: JSON.stringify(annotation.getModel()),
				contentType:"application/json; charset=utf-8",
				dataType:"json",
				beforeSend: function (xhr) {
					xhr.setRequestHeader('Authorization', 'Bearer '+TIMAAT.Service.token);
				},
			}).done(function(data) {
				anno.model = data;
			})
			.fail(function(e) {
				console.log( "error", e );
				console.log( e.responseText );
			});
		},

		removeAnnotation(annotation) {
      console.log("TCL: removeAnnotation -> annotation", annotation);
			var anno = annotation;
			jQuery.ajax({
				url:window.location.protocol+'//'+window.location.host+"/TIMAAT/api/annotation/"+anno.model.id,
				type:"DELETE",
				contentType:"application/json; charset=utf-8",
				beforeSend: function (xhr) {
					xhr.setRequestHeader('Authorization', 'Bearer '+TIMAAT.Service.token);
				},
			}).done(function(data) {
			})
			.fail(function(e) {
				console.log( "error", e );
				console.log( e.responseText );
			});
		},
		
		createSegment(name, startTime, endTime, list, callback) {
			console.log("TCL: createSegment -> name, startTime, endTime, list, callback", name, startTime, endTime, list, callback);
			var model = { 	
				id: 0,
				analysisSegmentTranslations: [{
					id: 0,
					name: name,
				}],
				startTime: startTime,
				endTime: endTime,
			};
			jQuery.ajax({
				url:window.location.protocol+'//'+window.location.host+"/TIMAAT/api/analysislist/"+list+"/segment",
				type:"POST",
				data: JSON.stringify(model),
				contentType:"application/json; charset=utf-8",
				dataType:"json",
				beforeSend: function (xhr) {
					xhr.setRequestHeader('Authorization', 'Bearer '+TIMAAT.Service.token);
				},
			}).done(function(data) {
				callback(new TIMAAT.AnalysisSegment(data));
			})
			.fail(function(e) {
				console.log( "error", e );
				console.log( e.responseText );
			});			
		},
		
		updateSegment(segment) {
      console.log("TCL: updateSegment -> segment", segment);
			jQuery.ajax({
				url:window.location.protocol+'//'+window.location.host+"/TIMAAT/api/analysislist/segment/"+segment.model.id,
				type:"PATCH",
				data: JSON.stringify(segment.model),
				contentType:"application/json; charset=utf-8",
				dataType:"json",
				beforeSend: function (xhr) {
					xhr.setRequestHeader('Authorization', 'Bearer '+TIMAAT.Service.token);
				},
			}).done(function(data) {
				segment.model = data;
			})
			.fail(function(e) {
				console.log( "error", e );
				console.log( e.responseText );
			});
		},
		
		removeSegment(segment) {
			console.log("TCL: removeSegment -> segment", segment);
			jQuery.ajax({
				url:window.location.protocol+'//'+window.location.host+"/TIMAAT/api/analysislist/segment/"+segment.model.id,
				type:"DELETE",
				contentType:"application/json; charset=utf-8",
				beforeSend: function (xhr) {
					xhr.setRequestHeader('Authorization', 'Bearer '+TIMAAT.Service.token);
				},
			}).done(function(data) {
				// TODO refactor
				
				// remove segment
				var index = TIMAAT.VideoPlayer.curList.segments.indexOf(segment);
				if (index > -1) TIMAAT.VideoPlayer.curList.segments.splice(index, 1);

				// update UI
				segment.removeUI();
			})
			.fail(function(e) {
				console.log( "error", e );
				console.log( e.responseText );
			});
			
		},

		addTag(set, tagname, callback) {
			// console.log("TCL: addTag -> addTag(set, tagname, callback)");
			// console.log("TCL: addTag -> set", set);
			// console.log("TCL: addTag -> tagname", tagname);
			// console.log("TCL: addTag -> callback", callback);
			// console.log("TCL: addTag -> set, tagname, callback", set, tagname, callback);
			var serviceEndpoint = "annotation";
			if ( set.constructor === TIMAAT.CategorySet ) serviceEndpoint = "tag/categoryset"; 
			else if ( set.constructor === TIMAAT.Actor ) serviceEndpoint = "actor";
			else if ( set.constructor === TIMAAT.Location ) serviceEndpoint = "location";
			else if ( set.constructor === TIMAAT.Country ) serviceEndpoint = "country";
			else if ( set.constructor === TIMAAT.Event ) serviceEndpoint = "event";

			jQuery.ajax({
				url:window.location.protocol+'//'+window.location.host+"/TIMAAT/api/"+serviceEndpoint+"/"+set.model.id+"/tag/"+tagname,
				type:"POST",
				contentType:"application/json; charset=utf-8",
				dataType:"json",
				beforeSend: function (xhr) {
					xhr.setRequestHeader('Authorization', 'Bearer '+TIMAAT.Service.token);
				},
			}).done(function(data) {
				TIMAAT.Service.updateCategorySets(tagname);
				callback(data);
			})
			.fail(function(e) {
				console.log( "error", e );
				console.log( e.responseText );
			});			
		},

		removeTag(set, tagname, callback) {
      // console.log("TCL: removeTag -> removeTag(set, tagname, callback)");
      // console.log("TCL: removeTag -> set", set);
      // console.log("TCL: removeTag -> tagname", tagname);
      // console.log("TCL: removeTag -> callback", callback);
      // console.log("TCL: removeTag -> set, tagname, callback", set, tagname, callback);
			var serviceEndpoint = "annotation";
			if  ( set.constructor === TIMAAT.CategorySet ) serviceEndpoint = "tag/categoryset";
			else if ( set.constructor === TIMAAT.Actor ) serviceEndpoint = "actor";
			else if ( set.constructor === TIMAAT.Location ) serviceEndpoint = "location";
			else if ( set.constructor === TIMAAT.Country ) serviceEndpoint = "country";
			else if ( set.constructor === TIMAAT.Event ) serviceEndpoint = "event";
			jQuery.ajax({
				url:window.location.protocol+'//'+window.location.host+"/TIMAAT/api/"+serviceEndpoint+"/"+set.model.id+"/tag/"+tagname,
				type:"DELETE",
				beforeSend: function (xhr) {
					xhr.setRequestHeader('Authorization', 'Bearer '+TIMAAT.Service.token);
				},
			}).done(function(data) {
				TIMAAT.Service.updateCategorySets(tagname);
				callback(tagname);
			})
			.fail(function(e) {
				console.log( "error", e );
				console.log( e.responseText );
			});			
		},

		addCategory(set, catname, callback) {
			var serviceEndpoint = "category";

			jQuery.ajax({
				url:window.location.protocol+'//'+window.location.host+"/TIMAAT/api/"+serviceEndpoint+"/set/"+set.model.id+"/category/"+catname,
				type:"POST",
				contentType:"application/json; charset=utf-8",
				dataType:"json",
				beforeSend: function (xhr) {
					xhr.setRequestHeader('Authorization', 'Bearer '+TIMAAT.Service.token);
				},
			}).done(function(data) {
				TIMAAT.Service.updateCategorySets(catname);
				callback(data);
			})
			.fail(function(e) {
				console.log( "error", e );
				console.log( e.responseText );
			});			
		},

		removeCategory(set, catname, callback) {
			var serviceEndpoint = "category"; // set/{id}/category/{name}
			jQuery.ajax({
				url:window.location.protocol+'//'+window.location.host+"/TIMAAT/api/"+serviceEndpoint+"/set/"+set.model.id+"/category/"+catname,
				type:"DELETE",
				beforeSend: function (xhr) {
					xhr.setRequestHeader('Authorization', 'Bearer '+TIMAAT.Service.token);
				},
			}).done(function(data) {
				TIMAAT.Service.updateCategorySets(catname);
				callback(catname);
			})
			.fail(function(e) {
				console.log( "error", e );
				console.log( e.responseText );
			});			
		},
		
		addMediumTag(medium, tagname, callback) {
			console.log("TCL: addMediumTag -> medium, tagname, callback", medium, tagname, callback);
			jQuery.ajax({
				url:window.location.protocol+'//'+window.location.host+"/TIMAAT/api/medium/"+medium.id+"/tag/"+tagname,
				type:"POST",
				contentType:"application/json; charset=utf-8",
				dataType:"json",
				beforeSend: function (xhr) {
					xhr.setRequestHeader('Authorization', 'Bearer '+TIMAAT.Service.token);
				},
			}).done(function(data) {
				TIMAAT.Service.updateCategorySets(tagname);
				callback(data);
			})
			.fail(function(e) {
				console.log( "error", e );
				console.log( e.responseText );
			});			
		},
		
		removeMediumTag(medium, tagname, callback) {
			console.log("TCL: removeMediumTag -> medium, tagname, callback", medium, tagname, callback);
			jQuery.ajax({
				url:window.location.protocol+'//'+window.location.host+"/TIMAAT/api/medium/"+medium.id+"/tag/"+tagname,
				type:"DELETE",
				beforeSend: function (xhr) {
					xhr.setRequestHeader('Authorization', 'Bearer '+TIMAAT.Service.token);
				},
			}).done(function(data) {
				TIMAAT.Service.updateCategorySets(tagname);
				callback(tagname);
			})
			.fail(function(e) {
				console.log( "error", e );
				console.log( e.responseText );
			});			
		},
		
		updateCategorySets(categoryname) {
			console.log("TCL: updateCategorySets -> categoryname", categoryname);
			// TODO implement for updating unassigned categories
		},
			
		createCategorySet(name, callback) {
			console.log("TCL: createCategorySet -> createCategorySet(name, callback)");
			console.log("TCL:   -> createCategorySet -> name", name);
			// console.log("TCL: createCategorySet -> callback", callback);
			// console.log("TCL: createCategorySet -> name, callback", name, callback);
			var model = {
					"id": 0,
					"name": name,
					"categorySetHasCategories": [],
			};
			jQuery.ajax({
				url:window.location.protocol+'//'+window.location.host+"/TIMAAT/api/category/set/",
				type:"POST",
				data: JSON.stringify(model),
				contentType:"application/json; charset=utf-8",
				dataType:"json",
				beforeSend: function (xhr) {
					xhr.setRequestHeader('Authorization', 'Bearer '+TIMAAT.Service.token);
				},
			}).done(function(data) {
				callback(data);
			})
			.fail(function(e) {
				console.log( "error", e );
				console.log( e.responseText );
			});			
		},
		
		updateCategorySet(categoryset) {
			console.log("TCL: updateCategorySet -> categoryset", categoryset);
			var set = {
					id: categoryset.model.id,
					name: categoryset.model.name,
					categorySetHasCategories: []
			};
			jQuery.ajax({
				url:window.location.protocol+'//'+window.location.host+"/TIMAAT/api/category/set/"+set.id,
				type:"PATCH",
				data: JSON.stringify(set),
				contentType:"application/json; charset=utf-8",
				dataType:"json",
				beforeSend: function (xhr) {
					xhr.setRequestHeader('Authorization', 'Bearer '+TIMAAT.Service.token);
				},
			}).done(function(data) {
				// TODO refactor
				categoryset.model.id = data.id;
				categoryset.model.name = data.name;
				categoryset.model.categories = data.categories;
				console.log("TCL: updateCategorySet -> categoryset.updateUI()");
				categoryset.updateUI();        
			})
			.fail(function(e) {
				console.log( "error", e );
				console.log( e.responseText );
			});
		},

		deleteCategorySet(categoryset) {
			console.log("TCL: deleteCategorySet -> categoryset", categoryset);
			jQuery.ajax({
				url:window.location.protocol+'//'+window.location.host+"/TIMAAT/api/category/set/"+categoryset.model.id,
				type:"DELETE",
				contentType:"application/json; charset=utf-8",
				beforeSend: function (xhr) {
					xhr.setRequestHeader('Authorization', 'Bearer '+TIMAAT.Service.token);
				},
			}).done(function(data) {
			})
			.fail(function(e) {
				console.log( "error", e );
				console.log( e.responseText );
			});
		},	

		deleteCategory(id) {
			console.log("TCL: removeCategory -> id", id);
			jQuery.ajax({
				url:window.location.protocol+'//'+window.location.host+"/TIMAAT/api/category/"+id,
				type:"DELETE",
				contentType:"application/json; charset=utf-8",
				beforeSend: function (xhr) {
					xhr.setRequestHeader('Authorization', 'Bearer '+TIMAAT.Service.token);
				},
			}).done(function(data) {
			})
			.fail(function(e) {
				console.log( "error", e );
				console.log( e.responseText );
			});
		},	
		
		
		
	}
	
}, window));
