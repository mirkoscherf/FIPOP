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
			location.reload();
			// TODO refactor
			if ( TIMAAT.UI.notificationSocket ) TIMAAT.UI.notificationSocket.close();
		},
		
		async getSinglePublication(mediumID) {
			return new Promise(resolve => {
				$.ajax({
					url:window.location.protocol+'//'+window.location.host+"/TIMAAT/api/publication/medium/"+mediumID,
					type:"GET",
					contentType:"application/json; charset=utf-8",
					dataType:"json",
					beforeSend: function (xhr) {
						xhr.setRequestHeader('Authorization', 'Bearer '+TIMAAT.Service.token);
					},
				}).done(function(data) {
					console.log("TCL: getSinglePublication -> data", data);
					resolve(data);
				}).fail(function(e) {
					// resolve(null);
					console.log(e.responseText);
					console.log( "error", e );
				});	
			}).catch((error) => {
				console.log( "error: ", error );
			});		
		},
		
		async updateSinglePublication(publication) {
			return new Promise(resolve => {
				$.ajax({
					url:window.location.protocol+'//'+window.location.host+"/TIMAAT/api/publication/medium/"+publication.startMediumId,
					type:"POST",
					data: JSON.stringify(publication),
					contentType:"application/json; charset=utf-8",
					dataType:"json",
					beforeSend: function (xhr) {
						xhr.setRequestHeader('Authorization', 'Bearer '+TIMAAT.Service.token);
					},
				}).done(function(data) {
					console.log("TCL: updateSinglePublication -> data", data);
					resolve(data);
				}).fail(function(e) {
					resolve(null);
				});	
			}).catch((error) => {
				console.log( "error: ", error );
			});		
		},

		async deleteSinglePublication(mediumID) {
			return new Promise(resolve => {
				$.ajax({
					url:window.location.protocol+'//'+window.location.host+"/TIMAAT/api/publication/medium/"+mediumID,
					type:"DELETE",
					contentType:"application/json; charset=utf-8",
					dataType:"json",
					beforeSend: function (xhr) {
						xhr.setRequestHeader('Authorization', 'Bearer '+TIMAAT.Service.token);
					},
				}).done(function(data) {
					console.log("TCL: getSinglePublication -> data", data);
					resolve(data);
				}).fail(function(e) {
					resolve(null);
				});	
			}).catch((error) => {
				console.log( "error: ", error );
			});		
		},

		async getCollectionPublication(colID) {
			return new Promise(resolve => {
				$.ajax({
					url:window.location.protocol+'//'+window.location.host+"/TIMAAT/api/publication/collection/"+colID,
					type:"GET",
					contentType:"application/json; charset=utf-8",
					dataType:"json",
					beforeSend: function (xhr) {
						xhr.setRequestHeader('Authorization', 'Bearer '+TIMAAT.Service.token);
					},
				}).done(function(data) {
					console.log("TCL: getCollectionPublication -> data", data);
					resolve(data);
				}).fail(function(e) {
					resolve(null);
				});	
			}).catch((error) => {
				console.log( "error: ", error );
			});		
		},
		
		async updateCollectionPublication(publication) {
			return new Promise(resolve => {
				$.ajax({
					url:window.location.protocol+'//'+window.location.host+"/TIMAAT/api/publication/collection/"+publication.collectionId,
					type:"POST",
					data: JSON.stringify(publication),
					contentType:"application/json; charset=utf-8",
					dataType:"json",
					beforeSend: function (xhr) {
						xhr.setRequestHeader('Authorization', 'Bearer '+TIMAAT.Service.token);
					},
				}).done(function(data) {
					console.log("TCL: updateCollectionPublication -> data", data);
					resolve(data);
				}).fail(function(e) {
					resolve(null);
				});	
			}).catch((error) => {
				console.log( "error: ", error );
			});		
		},

		async deleteCollectionPublication(colID) {
			return new Promise(resolve => {
				$.ajax({
					url:window.location.protocol+'//'+window.location.host+"/TIMAAT/api/publication/collection/"+colID,
					type:"DELETE",
					contentType:"application/json; charset=utf-8",
					dataType:"json",
					beforeSend: function (xhr) {
						xhr.setRequestHeader('Authorization', 'Bearer '+TIMAAT.Service.token);
					},
				}).done(function(data) {
					console.log("TCL: deleteCollectionPublication -> data", data);
					resolve(data);
				}).fail(function(e) {
					resolve(null);
				});	
			}).catch((error) => {
				console.log( "error: ", error );
			});		
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
			});		
		},

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

		async createTag(tagName) {
			// console.log("TCL: createTag -> tagName", tagName);
			return new Promise(resolve => {
				$.ajax({
					url:window.location.protocol+'//'+window.location.host+"/TIMAAT/api/tag/"+tagName,
					type:"POST",
					contentType:"application/json; charset=utf-8",
					dataType:"json",
					beforeSend: function (xhr) {
						xhr.setRequestHeader('Authorization', 'Bearer '+TIMAAT.Service.token);
					},
				}).done(function(data) {
					resolve(data);
				})
				.fail(function(e) {
					console.log( "error", e );
					console.log( e.responseText );
				});
			}).catch((error) => {
				console.log( "error: ", error );
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

		// addCategory(set, catname, callback) {
		// 	var serviceEndpoint = "category";

		// 	jQuery.ajax({
		// 		url:window.location.protocol+'//'+window.location.host+"/TIMAAT/api/"+serviceEndpoint+"/set/"+set.model.id+"/category/"+catname,
		// 		type:"POST",
		// 		contentType:"application/json; charset=utf-8",
		// 		dataType:"json",
		// 		beforeSend: function (xhr) {
		// 			xhr.setRequestHeader('Authorization', 'Bearer '+TIMAAT.Service.token);
		// 		},
		// 	}).done(function(data) {
		// 		TIMAAT.Service.updateCategorySets(catname);
		// 		callback(data);
		// 	})
		// 	.fail(function(e) {
		// 		console.log( "error", e );
		// 		console.log( e.responseText );
		// 	});			
		// },

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

		updateCategorySets(categoryName) {
			// console.log("TCL: updateCategorySets -> categoryName", categoryName);
			// TODO implement for updating unassigned categories
		},

		createCategorySet(name, callback) {
			// console.log("TCL: createCategorySet -> createCategorySet(name, callback)");
			// console.log("TCL:   -> createCategorySet -> name", name);
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
			// console.log("TCL: updateCategorySet -> categoryset", categoryset);
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

		// deleteCategorySet(categoryset) {
		// 	console.log("TCL: deleteCategorySet -> categoryset", categoryset);
		// 	jQuery.ajax({
		// 		url:window.location.protocol+'//'+window.location.host+"/TIMAAT/api/category/set/"+categoryset.model.id,
		// 		type:"DELETE",
		// 		contentType:"application/json; charset=utf-8",
		// 		beforeSend: function (xhr) {
		// 			xhr.setRequestHeader('Authorization', 'Bearer '+TIMAAT.Service.token);
		// 		},
		// 	}).done(function(data) {
		// 	})
		// 	.fail(function(e) {
		// 		console.log( "error", e );
		// 		console.log( e.responseText );
		// 	});
		// },	

		deleteCategory(id) {
			// console.log("TCL: removeCategory -> id", id);
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
