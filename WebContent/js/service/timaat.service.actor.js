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
	
	TIMAAT.ActorService = {

		listActorTypes(callback) {
			jQuery.ajax({
				url:window.location.protocol+'//'+window.location.host+"/TIMAAT/api/actor/actortype/list",
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
				console.log(e.responseText);
				console.log( "error", e );
			});			
		},

		listActors(callback) {
			jQuery.ajax({
				url:window.location.protocol+'//'+window.location.host+"/TIMAAT/api/actor/list",
				type:"GET",
				contentType:"application/json; charset=utf-8",
				dataType:"json",
				beforeSend: function (xhr) {
					xhr.setRequestHeader('Authorization', 'Bearer '+TIMAAT.Service.token);
				},
			}).done(function(data) {
				console.log("TCL: listActors -> data", data);
				callback(data);
			}).fail(function(e) {
//				console.log(e.responseText);
				console.log( "error", e );
			});			
		},

		listActorSubtype(actorSubtype, callback) {
			console.log("TCL: listActorSubtype", actorSubtype);
			jQuery.ajax({
				url:window.location.protocol+'//'+window.location.host+"/TIMAAT/api/actor/"+actorSubtype+"/list",
				type:"GET",
				// data: JSON.stringify(actorType),
				contentType:"application/json; charset=utf-8",
				dataType:"json",
				beforeSend: function (xhr) {
					xhr.setRequestHeader('Authorization', 'Bearer '+TIMAAT.Service.token);
				},
			}).done(function(data) {
      	console.log("TCL: listActorSubtype -> data", data);
				callback(data);
			})
			.fail(function(e) {
				console.log(e.responseText);
				console.log( "error", e );
			});			
		},

		async createActor(actorModel) {
			console.log("TCL: async createActor -> actorModel", actorModel);
			var newActorModel = {
				id: 0,
				actorType: {
					id: actorModel.actorType.id,
				},
				isFictional: actorModel.isFictional,
			};
      console.log("TCL: createActor -> newActorModel", newActorModel);
			return new Promise(resolve => {
				$.ajax({
					url:window.location.protocol+'//'+window.location.host+"/TIMAAT/api/actor/"+actorModel.id,
					type:"POST",
					data: JSON.stringify(newActorModel),
					contentType:"application/json; charset=utf-8",
					dataType:"json",
					beforeSend: function (xhr) {
						xhr.setRequestHeader('Authorization', 'Bearer '+TIMAAT.Service.token);
					},
				}).done(function(actorData) {
					console.log("TCL: createActor -> returning actorData", actorData);
					resolve(actorData);
				}).fail(function(e) {
					console.log( "error: ", e.responseText);
				});
			}).catch((error) => {
				console.log( "error: ", error );
			});
		},

		async createActorSubtype(actorSubtype, actorModel, subtypeModel) {
      console.log("TCL: createActorSubtype -> actorSubtype, actorModel, subtypeModel", actorSubtype, actorModel, subtypeModel);			
			return new Promise(resolve => {
				$.ajax({
					url:window.location.protocol+'//'+window.location.host+"/TIMAAT/api/actor/"+actorSubtype+"/"+actorModel.id,
					type:"POST",
					data: JSON.stringify(subtypeModel),
					contentType:"application/json; charset=utf-8",
					dataType:"json",
					beforeSend: function (xhr) {
						xhr.setRequestHeader('Authorization', 'Bearer '+TIMAAT.Service.token);
					},
				}).done(function(subtypeData) {
					console.log("TCL: createActorSubtype - returning subtypeData", subtypeData);
					resolve(subtypeData);
				}).fail(function(e) {
					console.log( "error: ", e.responseText );
				});
			}).catch((error) => {
				console.log( "error: ", error );
			});
		},

		async createPersonTranslation(model, modelTranslation) {
      console.log("TCL: createPersonTranslation -> async createPersonTranslation(model, modelTranslation)",  model, modelTranslation);
			return new Promise(resolve => {
				$.ajax({
					url:window.person.protocol+'//'+window.person.host+"/TIMAAT/api/person/"+model.id+"/translation/"+modelTranslation.id,
					type:"POST",
					data: JSON.stringify(modelTranslation),
					contentType:"application/json; charset=utf-8",
					dataType:"json",
					beforeSend: function (xhr) {
						xhr.setRequestHeader('Authorization', 'Bearer '+TIMAAT.Service.token);
					},
				}).done(function(translationData) {
					resolve(translationData);
				}).fail(function(e) {
					console.log( "error: ", e.responseText );
				});
			}).catch((error) => {
				console.log( "error: ", error );
			});
		},

		async createName(name) {
			console.log("TCL: async createName -> name", name);
			// console.log("TCL: async createName -> JSON.stringify(name)", JSON.stringify(name));
			return new Promise(resolve => {
				$.ajax({
					url:window.location.protocol+'//'+window.location.host+"/TIMAAT/api/actor/name/"+name.id,
					type:"POST",
					data: JSON.stringify(name),
					contentType:"application/json; charset=utf-8",
					dataType:"json",
					beforeSend: function (xhr) {
						xhr.setRequestHeader('Authorization', 'Bearer '+TIMAAT.Service.token);
					},
				}).done(function(nameData) {
					// console.log("TCL: createName -> nameData", nameData);
					resolve(nameData);
				}).fail(function(e) {
					console.log( "error: ", e.responseText );
				});
			}).catch((error) => {
				console.log( "error: ", error );
			});
		},

		async addName(actorId, name) {
      // console.log("TCL: addName -> actorId", actorId);
			// console.log("TCL: async addName -> name", name);
			return new Promise(resolve => {
				$.ajax({
					url:window.location.protocol+'//'+window.location.host+"/TIMAAT/api/actor/"+actorId+"/name/"+name.id,
					type:"POST",
					data: JSON.stringify(name),
					contentType:"application/json; charset=utf-8",
					dataType:"json",
					beforeSend: function (xhr) {
						xhr.setRequestHeader('Authorization', 'Bearer '+TIMAAT.Service.token);
					},
				}).done(function(nameData) {
					console.log("TCL: addName -> nameData", nameData);
					resolve(nameData);
				}).fail(function(e) {
					console.log( "error: ", e.responseText );
				});
			}).catch((error) => {
				console.log( "error: ", error );
			});
		},

		async createAddress(address) {
			console.log("TCL: async createAddress -> address", address);
			// console.log("TCL: async createAddress -> JSON.stringify(address)", JSON.stringify(address));
			return new Promise(resolve => {
				$.ajax({
					url:window.location.protocol+'//'+window.location.host+"/TIMAAT/api/actor/address/"+address.id,
					type:"POST",
					data: JSON.stringify(address),
					contentType:"application/json; charset=utf-8",
					dataType:"json",
					beforeSend: function (xhr) {
						xhr.setRequestHeader('Authorization', 'Bearer '+TIMAAT.Service.token);
					},
				}).done(function(addressData) {
					// console.log("TCL: createAddress -> addressData", addressData);
					resolve(addressData);
				}).fail(function(e) {
					console.log( "error: ", e.responseText );
				});
			}).catch((error) => {
				console.log( "error: ", error );
			});
		},

		async createEmailAddress(emailAddress) {
			console.log("TCL: async createEmailAddress -> emailAddress", emailAddress);
			// console.log("TCL: async createEmailAddress -> JSON.stringify(emailAddress)", JSON.stringify(emailAddress));
			return new Promise(resolve => {
				$.ajax({
					url:window.location.protocol+'//'+window.location.host+"/TIMAAT/api/actor/emailAddress/"+emailAddress.id,
					type:"POST",
					data: JSON.stringify(emailAddress),
					contentType:"application/json; charset=utf-8",
					dataType:"json",
					beforeSend: function (xhr) {
						xhr.setRequestHeader('Authorization', 'Bearer '+TIMAAT.Service.token);
					},
				}).done(function(emailAddressData) {
					// console.log("TCL: createEmailAddress -> emailAddressData", emailAddressData);
					resolve(emailAddressData);
				}).fail(function(e) {
					console.log( "error: ", e.responseText );
				});
			}).catch((error) => {
				console.log( "error: ", error );
			});
		},

		async createPhoneNumber(phoneNumber) {
			console.log("TCL: async createPhoneNumber -> phoneNumber", phoneNumber);
			// console.log("TCL: async createPhoneNumber -> JSON.stringify(phoneNumber)", JSON.stringify(phoneNumber));
			return new Promise(resolve => {
				$.ajax({
					url:window.location.protocol+'//'+window.location.host+"/TIMAAT/api/actor/phoneNumber/"+phoneNumber.id,
					type:"POST",
					data: JSON.stringify(phoneNumber),
					contentType:"application/json; charset=utf-8",
					dataType:"json",
					beforeSend: function (xhr) {
						xhr.setRequestHeader('Authorization', 'Bearer '+TIMAAT.Service.token);
					},
				}).done(function(phoneNumberData) {
					// console.log("TCL: createPhoneNumber -> phoneNumberData", phoneNumberData);
					resolve(phoneNumberData);
				}).fail(function(e) {
					console.log( "error: ", e.responseText );
				});
			}).catch((error) => {
				console.log( "error: ", error );
			});
		},

		async updateActor(actorModel) {
			console.log("TCL: ActorService: async updateActor -> actorModel", actorModel);
			var tempActorModel = {};
			// tempActorModel.releaseDate = actorModel.releaseDate;
			// tempActorModel.remark = actorModel.remark;
			// tempActorModel.copyright = actorModel.copyright;
			tempActorModel.displayName = actorModel.displayName;
			tempActorModel.birthName = actorModel.birthName;
			tempActorModel.names = actorModel.names;
      console.log("TCL: updateActor -> tempActorModel", tempActorModel);
			// delete tempActorModel.ui;
			return new Promise(resolve => {
				$.ajax({
					url:window.location.protocol+'//'+window.location.host+"/TIMAAT/api/actor/"+actorModel.id,
					type:"PATCH",
					data: JSON.stringify(tempActorModel),
					contentType:"application/json; charset=utf-8",
					dataType:"json",
					beforeSend: function (xhr) {
						xhr.setRequestHeader('Authorization', 'Bearer '+TIMAAT.Service.token);
					},
				}).done(function(updateData) {
					console.log("TCL: async updateActor -> returning updateData", updateData);
					resolve(updateData);
				}).fail(function(e) {
					console.log( "error", e );
					console.log( e.responseText );
				});
			}).catch((error) => {
				console.log( "error: ", error );
			});
		},

		// not yet needed (no translation data or translation table available at the moment)
		async updateActorTranslation(actor) {
			// console.log("TCL: ActorService async updateActorTranslation -> actor", actor);
			var updatedActorTranslation = {
				id: actor.model.actorTranslations[0].id, // TODO get the correct translation_id
				name: actor.model.actorTranslations[0].name,
			};
			return new Promise(resolve => {
				$.ajax({
					url:window.location.protocol+'//'+window.location.host+"/TIMAAT/api/actor/"+actor.model.id+"/translation/"+updatedActorTranslation.id,
					type:"PATCH",
					data: JSON.stringify(updatedActorTranslation),
					contentType:"application/json; charset=utf-8",
					dataType:"json",
					beforeSend: function (xhr) {
						xhr.setRequestHeader('Authorization', 'Bearer '+TIMAAT.Service.token);
					},
				}).done(function(translationData) {
				// console.log("TCL: updateActorTranslation -> translationData", translationData);
					resolve(translationData);
				}).fail(function(e) {
					console.log( "error", e );
					console.log( e.responseText );
				});
			}).catch((error) => {
				console.log( "error: ", error );
			});
		},

		async updateActorSubtype(actorSubtype, subtypeModel) {
			console.log("TCL: updateActorSubtype -> actorSubtype, subtypeModel", actorSubtype, subtypeModel);
			return new Promise(resolve => {
				$.ajax({
					url:window.location.protocol+'//'+window.location.host+"/TIMAAT/api/actor/"+actorSubtype+"/"+subtypeModel.actorId,
					type:"PATCH",
					data: JSON.stringify(subtypeModel),
					contentType:"application/json; charset=utf-8",
					dataType:"json",
					beforeSend: function (xhr) {
						xhr.setRequestHeader('Authorization', 'Bearer '+TIMAAT.Service.token);
					},
				}).done(function(updateData) {
					console.log("TCL: async updateActorSubtype -> returning updateData", updateData);
					resolve(updateData);
				}).fail(function(e) {
					console.log( "error", e );
					console.log( e.responseText );
				});
			}).catch((error) => {
				console.log( "error: ", error);
			});
		},

		async updateName(name) {
			console.log("TCL: async updateName -> name", name);
			return new Promise(resolve => {
				$.ajax({
					url:window.location.protocol+'//'+window.location.host+"/TIMAAT/api/actor/name/"+name.id,
					type:"PATCH",
					data: JSON.stringify(name),
					contentType:"application/json; charset=utf-8",
					dataType:"json",
					beforeSend: function (xhr) {
						xhr.setRequestHeader('Authorization', 'Bearer '+TIMAAT.Service.token);
					},
				}).done(function(updateData) {
					console.log("TCL: async updateName -> updateData", updateData);
					resolve(updateData);
				}).fail(function(e) {
					console.log( "error", e );
					console.log( e.responseText );
				});
			}).catch((error) => {
				console.log( "error: ", error);
			});
		},
		removeActor(actor) {
			console.log("TCL: removeActor -> actor", actor);
			$.ajax({
				url:window.location.protocol+'//'+window.location.host+"/TIMAAT/api/actor/"+actor.model.id,
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

		removeActorSubtype(subtype, subtypeData) {
      console.log("TCL: removesubtypeData -> subtype, subtypeData", subtype, subtypeData);
			$.ajax({
				url:window.location.protocol+'//'+window.location.host+"/TIMAAT/api/actor/"+subtype+"/"+subtypeData.model.actorId,
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

		removeName(name) {
			console.log("TCL: removeName -> name", name);
			$.ajax({
				url:window.location.protocol+'//'+window.location.host+"/TIMAAT/api/actor/name/"+name.id,
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
