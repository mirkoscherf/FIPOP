/*
 Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
 */

/**
 * @author Jens-Martin Loebel <loebel@bitgilde.de>
 * @author Mirko Scherf <mscherf@uni-mainz.de>
 */
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

	TIMAAT.ActorDatasets = {
		actors: null,
		actorTypes: null,
		persons: null,
		collectives: null,
		names: null,
		actorHasAddresses: null,
		addressTypes: null,
		emailAddresses: null,
		emailAddressTypes: null,
		phoneNumbers: null,
		phoneNumberTypes: null,
		personIsMemberOfCollectives: null,
		actorsLoaded: false,

		init: function() {
			this.initActors();
			this.initNames();
			this.initAddresses();
			this.initEmailAddresses();
			this.initPhoneNumbers();
			this.initMemberOfCollectives();
			this.initRoles();
			this.initRoleMedium();
		},

		initActorComponent: function() {
    // console.log("TCL: initActorComponent");
			if (!this.actorsLoaded) {
				this.setActorList();
			}
			if (TIMAAT.UI.component != 'actors') {
				TIMAAT.UI.showComponent('actors');
				$('#actorTab').trigger('click');
			}
		},

		//* not implemented
		initActorTypes: function() {
			// console.log("TCL: ActorDatasets: initActorTypes: function()");
			// delete actorType functionality
			$('#actorTypeDeleteSubmitButton').on('click', function(ev) {
				var modal = $('#actorDatasetsDeleteActorTypeModal');
				var actorType = modal.data('actorType');
				if (actorType) TIMAAT.ActorDatasets._actorTypeRemoved(actorType);
				modal.modal('hide');
			});

			// add actorType button
			$('#addActorTypeButton').attr('onclick','TIMAAT.ActorDatasets.addActorType()');

			// add/edit actorType functionality
			$('#actorDatasetsActorTypeMetaModal').on('show.bs.modal', function (ev) {
				// Create/Edit actorType window setup
				var modal = $(this);
				var actorType = modal.data('actorType');
				var heading = (actorType) ? "Edit actor type" : "Add actor type";
				var submit = (actorType) ? "Save" : "Add";
				var type = (actorType) ? actorType.model.type : 0;
				// setup UI
				$('#actorTypeMetaLabel').html(heading);
				$('#actorDatasetsActorTypeMetaModalSubmitButton').html(submit);
				$('#actorDatasetsActorTypeMetaModalName').val(type).trigger('input');
			});

			// Submit actorType data
			$('#actorDatasetsActorTypeMetaModalSubmitButton').on('click', function(ev) {
				// Create/Edit actorType window submitted data validation
				var modal = $('#actorDatasetsActorTypeMetaModal');
				var actorType = modal.data('actorType');
				var type = $('#actorDatasetsActorTypeMetaModalName').val();

				if (actorType) {
					actorType.model.actor.actorTypeTranslations[0].type = type;
					// actorType.updateUI();
					TIMAAT.ActorService.updateActorType(actorType);
					TIMAAT.ActorService.updateActorTypeTranslation(actorType);
				} else { // create new actorType
					var model = {
						id: 0,
						actorTypeTranslations: [],
					};
					var modelTranslation = {
						id: 0,
						type: type,
					};
					TIMAAT.ActorService.createActorType(model, modelTranslation, TIMAAT.ActorDatasets._actorTypeAdded); // TODO add actorType parameters
				}
				modal.modal('hide');
			});

			// validate actorType data
			// TODO validate all required fields
			$('#actorDatasetsActorTypeMetaModalName').on('input', function(ev) {
				if ( $('#actorDatasetsActorTypeMetaModalName').val().length > 0 ) {
					$('#actorDatasetsActorTypeMetaModalSubmitButton').prop('disabled', false);
					$('#actorDatasetsActorTypeMetaModalSubmitButton').removeAttr('disabled');
				} else {
					$('#actorDatasetsActorTypeMetaModalSubmitButton').prop('disabled', true);
					$('#actorDatasetsActorTypeMetaModalSubmitButton').attr('disabled');
				}
			});
		},

		initActors: function() {
			// console.log("TCL: ActorDatasets: initActors: function()");
			$('#actorTab').on('click', function(event) {
				TIMAAT.ActorDatasets.loadActors();
				TIMAAT.UI.displayComponent('actor', 'actorTab', 'actorDataTable');
				TIMAAT.URLHistory.setURL(null, 'Actor Datasets ', '#actor/list');
			});

			$('#personTab').on('click', function(event) {
				TIMAAT.ActorDatasets.loadActorSubtype('person');
				TIMAAT.UI.displayComponent('actor', 'personTab', 'personDataTable');
				TIMAAT.URLHistory.setURL(null, 'Person Datasets ', '#actor/person/list');
			});

			$('#collectiveTab').on('click', function(event) {
				TIMAAT.ActorDatasets.loadActorSubtype('collective');
				TIMAAT.UI.displayComponent('actor', 'collectiveTab', 'collectiveDataTable');
				TIMAAT.URLHistory.setURL(null, 'Collective Datasets ', '#actor/collective/list');
			});

			// nav-bar functionality
			$('#actorTabMetadata').on('click', function(event) {
				let actor = $('#actorFormMetadata').data('actor');
				let type = $('#actorFormMetadata').data('type');
				let name = actor.model.displayName.name;
				let id = actor.model.id;
				TIMAAT.UI.displayDataSetContentArea('actorFormMetadata');
				TIMAAT.UI.displayDataSetContent('dataSheet', actor, 'actor');
				if ( type == 'actor') {
					TIMAAT.URLHistory.setURL(null, name + ' ?? Datasets ?? ' + type[0].toUpperCase() + type.slice(1), '#actor/' + id);
				} else {
					TIMAAT.URLHistory.setURL(null, name + ' ?? Datasets ?? ' + type[0].toUpperCase() + type.slice(1), '#actor/' + type + '/' + id);
				}
			});

			$('.toggleAble > legend').on('click', function(event) {
				if ($('#actorProfileImages').hasClass('visibility--hidden')) {
					$('#actorProfileImages').toggleClass('visibility--hidden visibility--visible');
					$('.legendCollapseIcon').toggleClass('fa-caret-down fa-caret-up');
					let actor = $('#actorFormMetadata').data('actor');
					let maxHeight = Math.max.apply(Math, actor.model.profileImages.map(function(o) {return o.height}));
					if (maxHeight > 480)
						$('#profileImageCarouselInner').css('height', 480);
					else
						$('#profileImageCarouselInner').css('height', maxHeight);
				}
				else {
					$('#profileImageCarouselInner').css('height', 0);
					$('.legendCollapseIcon').toggleClass('fa-caret-down fa-caret-up');
				}
			});

			// delete actor button (in form) handler
			$('#actorFormMetadataDeleteButton').on('click', function(event) {
				event.stopPropagation();
				TIMAAT.UI.hidePopups();
				$('#actorDatasetsActorDeleteModal').data('actor', $('#actorFormMetadata').data('actor'));
				$('#actorDatasetsActorDeleteModal').modal('show');
			});

			// confirm delete actor modal functionality
			$('#actorDatasetsActorDeleteModalSubmitButton').on('click', async function(ev) {
				var modal = $('#actorDatasetsActorDeleteModal');
				var actor = modal.data('actor');
				let type = $('#actorFormMetadata').data('type');
				if (actor) {
					try {
						await TIMAAT.ActorDatasets._actorRemoved(actor);
					} catch (error) {
						console.error("ERROR: ", error);
					}
					try {
						if ($('#actorTab').hasClass('active')) {
							await TIMAAT.UI.refreshDataTable('actor');
						} else {
							await TIMAAT.UI.refreshDataTable(type);
						}
					} catch (error) {
						console.error("ERROR: ", error);
					}
				}
				modal.modal('hide');
				if ( $('#actorTab').hasClass('active') ) {
					$('#actorTab').trigger('click');
				} else {
					$('#'+type+'Tab').trigger('click');
				}
			});

			// edit content form button handler
			$('.actorDataSheetFormEditButton').on('click', function(event) {
				event.stopPropagation();
				TIMAAT.UI.hidePopups();
				TIMAAT.UI.displayDataSetContent(TIMAAT.UI.subNavTab, $('#actorFormMetadata').data('actor'), 'actor', 'edit');
			});

			// actor form handlers
			// carousel button handler
			$('a[data-slide="prev"]').on('click', function() {
				$('#dynamicProfileImageFields').carousel('prev');
			});

			// carousel button handler
			$('a[data-slide="next"]').on('click', function() {
				$('#dynamicProfileImageFields').carousel('next');
			});

			//* not in use
			// add profile image to list
			$('.actorFormDataSheetAddProfileImageButton').on('click', function(event) {
				// TODO something is missing here?
				var entryToAppend =
					`<div class="form-group" data-role="ActorProfileImageEntry">
						<div class="form-row">
							<div class="col-md-12">
								<label class="sr-only">Has Role(s)</label>
								<select class="form-control form-control-sm"
												id="ActorProfileImageMultiSelectDropdown"
												name="mediumId"
												data-placeholder="Select media"
												multiple="multiple"
												readonly="true">
								</select>
							</div>
						</div>
					</div>`;
			});

			//* not in use
			// remove currently displayed profile image
			$('.actorFormDataSheetRemoveProfileImageButton').on('click', function(event) {
				$('#dynamicProfileImageFields').find('.carousel-indicators > li.active').remove();
				$('#dynamicProfileImageFields').find('.carousel-indicators > li').first().addClass('active');
				$('#dynamicProfileImageFields').find('.carousel-item.active').remove();
				$('#dynamicProfileImageFields').find('.carousel-item').first().addClass('active');
				var remainingElements = $('.carousel-inner > div').length;
				if (remainingElements == 0) {
					$('#dynamicProfileImageFields').hide();
					$('#dynamicProfileImageFieldsPlaceholder').show();
				} else {
					var i = 1;
					for (; i <= remainingElements; i++) {
						$('.carousel-indicators > li:nth-child('+i+')').attr('data-slide-to', i-1); // adjust carousel-indicators order
					}
				}
			});

			// submit actor metadata button functionality
			$('#actorFormMetadataSubmitButton').on('click', async function(event) {
				// continue only if client side validation has passed
				event.preventDefault();
				if (!$('#actorFormMetadata').valid()) return false;

				var actor = $('#actorFormMetadata').data('actor');
				var type = $('#actorFormMetadata').data('type');
				// var type = actor.model.actorType.actorTypeTranslations[0].type; // won't work for adding new actors

				// create/Edit actor window submitted data
				var formData = $('#actorFormMetadata').serializeArray();
				var formDataObject = {};
				$(formData).each(function(i, field){
					formDataObject[field.name] = field.value;
				});
				var formDataSanitized = formDataObject;
				formDataSanitized.dateOfBirth   = moment.utc(formDataObject.dateOfBirth, "YYYY-MM-DD");
				formDataSanitized.dayOfDeath    = moment.utc(formDataObject.dayOfDeath, "YYYY-MM-DD");
				formDataSanitized.disbanded     = moment.utc(formDataObject.disbanded, "YYYY-MM-DD");
				formDataSanitized.founded       = moment.utc(formDataObject.founded, "YYYY-MM-DD");
				formDataSanitized.isFictional   = (formDataObject.isFictional == "on") ? true : false;
				formDataSanitized.nameUsedFrom  = moment.utc(formDataObject.nameUsedFrom, "YYYY-MM-DD");
				formDataSanitized.nameUsedUntil = moment.utc(formDataObject.nameUsedUntil, "YYYY-MM-DD");
				// formDataSanitized.placeOfBirth  = (formDataObject.placeOfBirth == "") ? null : Number(formDataObject.placeOfBirth);
				// formDataSanitized.placeOfDeath  = (formDataObject.placeOfDeath == "") ? null : Number(formDataObject.placeOfDeath);
				formDataSanitized.sexId         = Number(formDataObject.sexId);
				delete formDataSanitized.imageId;
        // console.log("TCL: $ -> formDataSanitized", formDataSanitized);

				var formImageIds = [];
				var i = 0;
				for (; i < formData.length; i++) {
					if (formData[i].name == 'imageId') {
						formImageIds.push({ mediumId: Number(formData[i].value)});
					}
				}
				// console.log("TCL: formImageIds", formImageIds);
				formDataSanitized.profileImages = formImageIds;
        // console.log("TCL: formDataSanitized", formDataSanitized);

				if (actor) { // update actor
					// actor data
					actor.model.isFictional = formDataObject.isFictional;
					// displayName data
					actor.model.displayName.name = formDataObject.displayName;
					actor.model.displayName.usedFrom = formDataObject.nameUsedFrom;
					actor.model.displayName.usedUntil = formDataObject.nameUsedUntil;
					var i = 0;
					for (; i < actor.model.actorNames.length; i++) {
						if (actor.model.actorNames[i].id == actor.model.displayName.id) {
							actor.model.actorNames[i] = actor.model.displayName;
							break;
						}
					}
					// actor subtype data
					switch (type) {
						case 'person':
							actor.model.actorPerson.title = formDataSanitized.title;
							actor.model.actorPerson.dateOfBirth = formDataSanitized.dateOfBirth;
							actor.model.actorPerson.placeOfBirth = formDataSanitized.placeOfBirth;
							actor.model.actorPerson.dayOfDeath = formDataSanitized.dayOfDeath;
							actor.model.actorPerson.placeOfDeath = formDataSanitized.placeOfDeath;
							actor.model.actorPerson.sex.id = formDataSanitized.sexId;
							actor.model.actorPerson.citizenship = formDataSanitized.citizenshipName;
							// actor.model.actorPerson.citizenships[0].citizenshipTranslations[0].name = formDataSanitized.citizenshipName; // TODO
							actor.model.actorPerson.actorPersonTranslations[0].specialFeatures = formDataSanitized.specialFeatures;
						break;
						case 'collective':
							actor.model.actorCollective.founded = formDataSanitized.founded;
							actor.model.actorCollective.disbanded = formDataSanitized.disbanded;
						break;
					}
					await TIMAAT.ActorDatasets.updateActor(type, actor);
					await TIMAAT.ActorDatasets.updateActorHasMediumImageList(actor, formImageIds);
					// actor.updateUI();
				} else { // create new actor
					var actorModel = await TIMAAT.ActorDatasets.createActorModel(type, formDataSanitized);
					var actorSubtypeModel = await TIMAAT.ActorDatasets.createActorSubtypeModel(type, formDataSanitized);
					var displayNameModel = await TIMAAT.ActorDatasets.createNameModel(formDataSanitized);
					var actorSubtypeTranslationModel = null;
					var citizenshipModel = null;
					if (type == 'person') {
						actorSubtypeTranslationModel = await TIMAAT.ActorDatasets.createActorPersonTranslationModel(formDataSanitized);
						// citizenshipModel = await TIMAAT.ActorDatasets.createCitizenshipModel(formDataSanitized); // TODO
					}
					var newActor = await TIMAAT.ActorDatasets.createActor(type, actorModel, actorSubtypeModel, displayNameModel, actorSubtypeTranslationModel, citizenshipModel);
					actor = new TIMAAT.Actor(newActor, type);
					$('#actorFormMetadata').data('actor', actor);
					TIMAAT.UI.displayDataSetContentContainer('actorDataTab', 'actorFormMetadata', 'actor');
					$('#actorTab-metadata').trigger('click');
				}
				TIMAAT.ActorDatasets.showAddActorButton();
				if ($('#actorTab').hasClass('active')) {
					await TIMAAT.UI.refreshDataTable('actor');
				} else {
					await TIMAAT.UI.refreshDataTable(type);
				}
				// TIMAAT.UI.addSelectedClassToSelectedItem(type, actor.model.id);
				TIMAAT.UI.displayDataSetContent('dataSheet', actor, 'actor');
			});

			// cancel add/edit button in content form functionality
			$('#actorFormMetadataDismissButton').on('click', async function(event) {
				TIMAAT.ActorDatasets.showAddActorButton();
				let currentUrlHash = window.location.hash;
        await TIMAAT.URLHistory.setupView(currentUrlHash);
			});

			// tag button handler
			$('#actorFormMetadataTag').on('click', async function(event) {
				event.stopPropagation();
				TIMAAT.UI.hidePopups();
				var modal = $('#actorDatasetsActorTagModal');
				modal.data('actor', $('#actorFormMetadata').data('actor'));
				var actor = modal.data('actor');
				modal.find('.modal-body').html(`
					<form role="form" id="actorTagsModalForm">
						<div class="form-group">
							<label for="actorTagsMultiSelectDropdown">Actor tags</label>
							<div class="col-md-12">
								<select class="form-control form-control-md multi-select-dropdown"
												style="width:100%;"
												id="actorTagsMultiSelectDropdown"
												name="tagId"
												data-role="tagId"
												data-placeholder="Select actor tags"
												multiple="multiple">
								</select>
							</div>
						</div>`+
					`</form>`);
        $('#actorTagsMultiSelectDropdown').select2({
					closeOnSelect: false,
					scrollAfterSelect: true,
					allowClear: true,
					tags: true,
					tokenSeparators: [',', ' '],
					ajax: {
						url: 'api/tag/selectList/',
						type: 'GET',
						dataType: 'json',
						delay: 250,
						headers: {
							"Authorization": "Bearer "+TIMAAT.Service.token,
							"Content-Type": "application/json",
						},
						// additional parameters
						data: function(params) {
							return {
								search: params.term,
								page: params.page
							};
						},
						processResults: function(data, params) {
							params.page = params.page || 1;
							return {
								results: data
							};
						},
						cache: false
					},
					minimumInputLength: 0,
				});
				await TIMAAT.ActorService.getTagList(actor.model.id).then(function(data) {
					// console.log("TCL: then: data", data);
					var tagSelect = $('#actorTagsMultiSelectDropdown');
					if (data.length > 0) {
						// create the options and append to Select2
						var i = 0;
						for (; i < data.length; i++) {
							var option = new Option(data[i].name, data[i].id, true, true);
							tagSelect.append(option).trigger('change');
						}
						// manually trigger the 'select2:select' event
						tagSelect.trigger({
							type: 'select2:select',
							params: {
								data: data
							}
						});
					}
				});
				$('#actorDatasetsActorTagModal').modal('show');
			});

			// submit tag modal button functionality
			$('#actorDatasetsActorTagModalSubmitButton').on('click', async function(event) {
				event.preventDefault();
				var modal = $('#actorDatasetsActorTagModal');
				if (!$('#actorTagsModalForm').valid())
					return false;
				var actor = modal.data('actor');
        // console.log("TCL: actor", actor);
				var formData = $('#actorTagsModalForm').serializeArray();
        // console.log("TCL: formData", formData);
				var i = 0;
				var tagIdList = [];
				var newTagList = [];
				for (; i < formData.length; i++) {
					if (isNaN(Number(formData[i].value))) {
						newTagList.push( { id: 0, name: formData[i].value} ); // new tags that have to be added to the system first
					} else {
						tagIdList.push( {id: formData[i].value} );
					}
				}
				actor.model = await TIMAAT.ActorDatasets.updateActorHasTagsList(actor.model, tagIdList);
				if (newTagList.length > 0) {
					var updatedActorModel = await TIMAAT.ActorDatasets.createNewTagsAndAddToActor(actor.model, newTagList);
					// console.log("TCL: updatedActorModel", updatedActorModel);
					actor.model.tags = updatedActorModel.tags;
				}
				$('#actorFormMetadata').data('actor', actor);
				modal.modal('hide');
			});

			//* not in use
			$('#actorDatasetsMetadataTypeId').on('change', function(event) {
				event.stopPropagation();
				let type = $('#actorDatasetsMetadataTypeId').find('option:selected').html();
				TIMAAT.ActorDatasets.initFormDataSheetData(type);
			});

			// data table events
			$('#actorDatasetsActorDataTable').on( 'page.dt', function () {
				$('.dataTables_scrollBody').scrollTop(0);
			});

			$('#actorDatasetsPersonDataTable').on( 'page.dt', function () {
				$('.dataTables_scrollBody').scrollTop(0);
			});

			$('#actorDatasetsCollectiveDataTable').on( 'page.dt', function () {
				$('.dataTables_scrollBody').scrollTop(0);
			});

			// key press events
			$('#actorFormMetadataSubmitButton').on('keypress', function(event) {
				event.stopPropagation();
				if (event.which == '13') { // == enter
					$('#actorFormMetadataSubmitButton').trigger('click');
				}
			});

			$('#actorFormMetadataDismissButton').on('keypress', function(event) {
				event.stopPropagation();
				if (event.which == '13') { // == enter
					$('#actorFormMetadataDismissButton').trigger('click');
				}
			});

		},

		initNames: function() {
			$('#actorTabNames').on('click', function(event) {
				let actor = $('#actorFormMetadata').data('actor');
				let type = $('#actorFormMetadata').data('type');
				let name = actor.model.displayName.name;
				let id = actor.model.id;
				TIMAAT.UI.displayDataSetContentArea('actorFormNames');
				TIMAAT.ActorDatasets.setActorNameList(actor);
				TIMAAT.UI.displayDataSetContent('names', actor, 'actor');
				if ( type == 'actor') {
					TIMAAT.URLHistory.setURL(null, name + ' ?? Names ?? ' + type[0].toUpperCase() + type.slice(1), '#actor/' + id + '/names');
				} else {
					TIMAAT.URLHistory.setURL(null, name + ' ?? Names ?? ' + type[0].toUpperCase() + type.slice(1), '#actor/' + type + '/' + id + '/names');
				}
			});

			$(document).on('click', '.isBirthName', function(event) {
        if ($(this).data('wasChecked') == true) {
          $(this).prop('checked', false);
					$('input[name="isBirthName"]').data('wasChecked', false);
        }
        else {
					$('input[name="isBirthName"]').data('wasChecked', false);
					$(this).data('wasChecked', true);
				}
			});

			// Add name button click
			// $(document).on('click','[data-role="newActorNameFields"] > .form-group [data-role="add"]', function(event) {
			$(document).on('click','.addActorNameButton', function(event) {
					event.preventDefault();
				// console.log("TCL: add name to list");
				var listEntry = $(this).closest('[data-role="newActorNameFields"]');
				var newName = [];
				if (listEntry.find('input').each(function(){
					newName.push($(this).val());
          // console.log("TCL: $(this).val()", $(this).val());
          // console.log("TCL: newName", newName);
				}));
				if (!$('#actorFormNames').valid())
					return false;
				if (newName != '') { // TODO is '' proper check?
					var namesInForm = $('#actorFormNames').serializeArray();
					// console.log("TCL: namesInForm", namesInForm);
					var numberOfNameElements = 3;
					var indexName = namesInForm[namesInForm.length-numberOfNameElements-1].name; // find last used indexed name (first prior to new address fields)
					var indexString = indexName.substring(indexName.lastIndexOf("[") + 1, indexName.lastIndexOf("]"));
					var i = Number(indexString)+1;
					// console.log("TCL: namesInForm", namesInForm);
					// console.log("TCL: i", i);
					$('#dynamicActorNameFields').append(
						`<div class="form-group" data-role="name-entry">
						<div class="form-row">
							<div class="col-sm-1 col-md-1 text-center">
								<div class="form-check">
									<label class="sr-only" for="isDisplayName"></label>
									<input class="form-check-input isDisplayName"
												 type="radio"
												 name="isDisplayName"
												 data-role="displayName"
												 placeholder="Is Display Name">
								</div>
							</div>
							<div class="col-sm-1 col-md-1 text-center">
								<div class="form-check">
									<label class="sr-only" for="isBirthName"></label>
									<input class="form-check-input isBirthName"
												 type="radio"
												 name="isBirthName"
												 data-role="birthName"
												 data-wasChecked="false"
												 placeholder="Is birth Name">
								</div>
							</div>
							<div class="col-sm-5 col-md-5">
								<label class="sr-only">Name</label>
								<input class="form-control form-control-sm"
											 name="newActorName[`+i+`]"
											 data-role="newActorName[`+i+`]"
											 value="`+newName[0]+`"
											 placeholder="[Enter name]"
											 aria-describedby="Name" minlength="3"
											 maxlength="200"
											 rows="1"
											 required>
							</div>
							<div class="col-md-2">
								<label class="sr-only">Name used from</label>
								<input type="text"
											 class="form-control form-control-sm actorDatasetsActorActorNamesNameUsedFrom"
											 name="newNameUsedFrom[`+i+`]"
											 data-role="newNameUsedFrom[`+i+`]"
											 value="`+newName[1]+`"
											 placeholder="[Enter name used from]"
											 aria-describedby="Name used from">
							</div>
							<div class="col-md-2">
								<label class="sr-only">Name used until</label>
								<input type="text"
											 class="form-control form-control-sm actorDatasetsActorActorNamesNameUsedUntil"
											 name="newNameUsedUntil[`+i+`]"
											 data-role="newNameUsedUntil[`+i+`]"
											 value="`+newName[2]+`"
											 placeholder="[Enter name used until]"
											 aria-describedby="Name used until">
							</div>
							<div class="col-sm-1 col-md-1 text-center">
								<button class="form-group__button js-form-group__button removeActorNameButton btn btn-danger" data-role="remove">
									<i class="fas fa-trash-alt"></i>
								</button>
							</div>
						</div>
					</div>`
					);
					$('input[name="newActorName['+i+']"]').rules("add", { required: true, minlength: 3, maxlength: 200, });
					if (listEntry.find('input').each(function(){
						$(this).val('');
					}));
					if (listEntry.find('select').each(function(){
						$(this).val('');
					}));
					$('.actorDatasetsActorActorNamesNameUsedFrom').datetimepicker({timepicker: false, changeMonth: true, changeYear: true, scrollInput: false, format: 'YYYY-MM-DD', yearStart: 1900, yearEnd: new Date().getFullYear()});
					$('.actorDatasetsActorActorNamesNameUsedUntil').datetimepicker({timepicker: false, changeMonth: true, changeYear: true, scrollInput: false, format: 'YYYY-MM-DD', yearStart: 1900, yearEnd: new Date().getFullYear()});
				}
				else {
					// TODO open modal showing error that not all required fields are set.
				}
			});

			// Remove name button click
			// $(document).on('click','[data-role="dynamicActorNameFields"] > .form-group [data-role="remove"]', function(event) {
			$(document).on('click','.removeActorNameButton', function(event) {
					event.preventDefault();
				var isDisplayName = $(this).closest('.form-group').find('input[name=isDisplayName]:checked').val();
				if (isDisplayName == "on") {
					// TODO modal informing that display name entry cannot be deleted
					console.error("CANNOT DELETE DISPLAY NAME");
				}
				else {
					// TODO consider undo function or popup asking if user really wants to delete a name
					console.info("DELETE NAME ENTRY");
					$(this).closest('.form-group').remove();
				}
			});

			// Submit actor names button functionality
			$('#actorFormNamesSubmitButton').on('click', async function(event) {
				// console.log("TCL: Names form: submit");
				// add rules to dynamically added form fields
				event.preventDefault();
				var node = document.getElementById("newActorNameFields");
				while (node.lastChild) {
					node.removeChild(node.lastChild);
				}
				// test if form is valid
				if (!$('#actorFormNames').valid()) {
					$('[data-role="newActorNameFields"]').append(TIMAAT.ActorDatasets.appendNewNameField());
					return false;
				}

				// the original actor model (in case of editing an existing actor)
				var actor = $('#actorFormNames').data("actor");
				var type = actor.model.actorType.actorTypeTranslations[0].type;

				// Create/Edit actor window submitted data
				var formData = $('#actorFormNames').serializeArray();
				var formNameList = [];
				var i = 0;
				while ( i < formData.length) { // fill formNameList with data
					var element = {
						isDisplayName: false,
						isBirthName: false,
						name: '',
						usedFrom: '',
						usedUntil: '',
					};
					if (formData[i].name == 'isDisplayName' && formData[i].value == 'on' ) {
						element.isDisplayName = true;
						if (formData[i+1].name == 'isBirthName' && formData[i+1].value == 'on' ) {
							// display name set, birth name set
							element.isBirthName = true;
							element.name = formData[i+2].value;
							element.usedFrom = formData[i+3].value;
							element.usedUntil = formData[i+4].value
							i = i+5;
						} else { // display name set, birth name not set
							element.isBirthName = false;
							element.name = formData[i+1].value;
							element.usedFrom = formData[i+2].value;
							element.usedUntil = formData[i+3].value
							i = i+4;
						}
					} else { // display name not set, birth name set
						element.isDisplayName = false;
						if (formData[i].name == 'isBirthName' && formData[i].value == 'on' ) {
							element.isBirthName = true;
							element.name = formData[i+1].value;
							element.usedFrom = formData[i+2].value;
							element.usedUntil = formData[i+3].value
							i = i+4;
						} else {
							// display name not set, birth name not set
							element.isBirthName = false;
							element.name = formData[i].value;
							element.usedFrom = formData[i+1].value;
							element.usedUntil = formData[i+2].value
							i = i+3;
						}
					}
					formNameList[formNameList.length] = element;
				}
				// console.log("TCL: formNameList", formNameList);

				// only updates to existing name entries
				if (formNameList.length == actor.model.actorNames.length) {
					var i = 0;
					for (; i < actor.model.actorNames.length; i++ ) { // update existing names
						var name = {
							id: actor.model.actorNames[i].id,
							name: formNameList[i].name,
							usedFrom: formNameList[i].usedFrom,
							usedUntil: formNameList[i].usedUntil,
						};
						// only update if anything changed // TODO check will always pass due to different data formats
						if (name != actor.model.actorNames[i]) {
							// console.log("TCL: update existing name");
							await TIMAAT.ActorDatasets.updateName(name, actor);
						}
						// update display name
						var displayNameChanged = false;
						if (formNameList[i].isDisplayName) {
							actor.model.displayName = actor.model.actorNames[i];
							displayNameChanged = true;
						}
						// update birth name
						var birthNameChanged = false
						if (formNameList[i].isBirthName) {
							actor.model.birthName = actor.model.actorNames[i];
							birthNameChanged = true;
						// // update display name
						// var displayNameChanged = false;
						// if (formNameList[i].isDisplayName && (actor.model.displayName == null || actor.model.displayName.id != actor.model.actorNames[i].id)) {
						// 	actor.model.displayName = actor.model.actorNames[i];
						// 	displayNameChanged = true;
						// } else if (!formNameList[i].isDisplayName && actor.model.displayName != null && actor.model.displayName.id == actor.model.actorNames[i].id) {
						// 	actor.model.displayName = null;
						// 	displayNameChanged = true;
						// }
						// var birthNameChanged = false;
						// // update birth name
						// if (formNameList[i].isBirthName && (actor.model.birthName == null || actor.model.birthName.id != actor.model.actorNames[i].id)) {
						// 	actor.model.birthName = actor.model.actorNames[i];
						// 	birthNameChanged = true;
						} else if (!formNameList[i].isBirthName && actor.model.birthName != null && actor.model.birthName.id == actor.model.actorNames[i].id) {
							actor.model.birthName = null;
							birthNameChanged = true;
						}
						if ( birthNameChanged || displayNameChanged) {
							// console.log("TCL type, actor", type, actor);
							await TIMAAT.ActorDatasets.updateActor(type, actor);
						}
					}
				}
				// update existing names and add new ones
				else if (formNameList.length > actor.model.actorNames.length) {
					var i = 0;
					for (; i < actor.model.actorNames.length; i++ ) { // update existing names
						var name = {
							id: actor.model.actorNames[i].id,
							name: formNameList[i].name,
							usedFrom: formNameList[i].usedFrom,
							usedUntil: formNameList[i].usedUntil,
						};
						// only update if anything changed // TODO check will always pass due to different data formats
						if (name != actor.model.actorNames[i]) {
							// console.log("TCL: update existing names (and add new ones)");
							await TIMAAT.ActorDatasets.updateName(name, actor);
						}
					}
					i = actor.model.actorNames.length;
					var newNames = [];
					for (; i < formNameList.length; i++) { // create new names
						var name = {
							id: 0,
							name: formNameList[i].name,
							usedFrom: formNameList[i].usedFrom,
							usedUntil: formNameList[i].usedUntil,
						};
						newNames.push(name);
					}
					// console.log("TCL: newNames", newNames);
					// console.log("TCL: (update existing names and) add new ones");
					await TIMAAT.ActorDatasets.addNames(actor, newNames);
					// for the whole list check new birth name
					i = 0;
					for (; i < formNameList.length; i++) {
						// console.log("TCL: formNameList", formNameList);
						// console.log("TCL: actor.model", actor.model);
						// update display name
						var displayNameChanged = false;
						if (formNameList[i].isDisplayName) {
							actor.model.displayName = actor.model.actorNames[i];
							displayNameChanged = true;
						}
						// update birth name
						var birthNameChanged = false
						if (formNameList[i].isBirthName) {
							actor.model.birthName = actor.model.actorNames[i];
							birthNameChanged = true;
						// // update display name
						// var displayNameChanged = false;
						// if (formNameList[i].isDisplayName && (actor.model.displayName == null || actor.model.displayName.id != actor.model.actorNames[i].id)) {
						// 	actor.model.displayName = actor.model.actorNames[i];
						// 	displayNameChanged = true;
						// } else if (!formNameList[i].isDisplayName && actor.model.displayName != null && actor.model.displayName.id == actor.model.actorNames[i].id) {
						// 	actor.model.displayName = null;
						// 	displayNameChanged = true;
						// }
						// // update birth name
						// var birthNameChanged = false;
						// if (formNameList[i].isBirthName && (actor.model.birthName == null || actor.model.birthName.id != actor.model.actorNames[i].id)) {
						// 	actor.model.birthName = actor.model.actorNames[i];
						// 	birthNameChanged = true;
						} else if (!formNameList[i].isBirthName && actor.model.birthName != null && actor.model.birthName.id == actor.model.actorNames[i].id) {
							actor.model.birthName = null;
							birthNameChanged = true;
						}
						// only update if anything changed // TODO check will always pass due to different data formats
						if ( birthNameChanged || displayNameChanged) {
							// console.log("TCL type, actor", type, actor);
							await TIMAAT.ActorDatasets.updateActor(type, actor);
						}
					}
				}
				// update existing names and delete obsolete ones
				else if (formNameList.length < actor.model.actorNames.length) {
					var i = 0;
					for (; i < formNameList.length; i++ ) { // update existing names
						var name = {
							id: actor.model.actorNames[i].id,
							name: formNameList[i].name,
							usedFrom: formNameList[i].usedFrom,
							usedUntil: formNameList[i].usedUntil,
						};
						if (name != actor.model.actorNames[i]) {
							// console.log("TCL: update existing names (and delete obsolete ones)");
							await TIMAAT.ActorDatasets.updateName(name, actor);
						}
						// update display name
						var displayNameChanged = false;
						if (formNameList[i].isDisplayName) {
							actor.model.displayName = actor.model.actorNames[i];
							displayNameChanged = true;
						}
						// update birth name
						var birthNameChanged = false
						if (formNameList[i].isBirthName) {
							actor.model.birthName = actor.model.actorNames[i];
							birthNameChanged = true;
						// // update display name
						// var displayNameChanged = false;
						// if (formNameList[i].isDisplayName && (actor.model.displayName == null || actor.model.displayName.id != actor.model.actorNames[i].id)) {
						// 	actor.model.displayName = actor.model.actorNames[i];
						// 	displayNameChanged = true;
						// } else if (!formNameList[i].isDisplayName && actor.model.displayName != null && actor.model.displayName.id == actor.model.actorNames[i].id) {
						// 	actor.model.displayName = null;
						// 	displayNameChanged = true;
						// }
						// // update birth name
						// var birthNameChanged = false;
						// if (formNameList[i].isBirthName && (actor.model.birthName == null || actor.model.birthName.id != actor.model.actorNames[i].id)) {
						// 	actor.model.birthName = actor.model.actorNames[i];
						// 	birthNameChanged = true;
						} else if (!formNameList[i].isBirthName && actor.model.birthName != null && actor.model.birthName.id == actor.model.actorNames[i].id) {
							actor.model.birthName = null;
							birthNameChanged = true;
						}
						if (birthNameChanged || displayNameChanged) {
							// console.log("TCL type, actor", type, actor);
							await TIMAAT.ActorDatasets.updateActor(type, actor);
						}
					}
					var i = actor.model.actorNames.length - 1;
					for (; i >= formNameList.length; i-- ) { // remove obsolete names starting at end of list
						// console.log("TCL: actor.model", actor.model);
						if (actor.model.birthName != null && actor.model.birthName.id == actor.model.actorNames[i].id) {
							actor.model.birthName = null;
							// console.log("TCL: remove birthName before deleting name");
							// console.log("TCL type, actor", type, actor);
							await TIMAAT.ActorDatasets.updateActor(type, actor);
						}
						// console.log("TCL: (update existing names and) delete obsolete ones");
						TIMAAT.ActorService.removeName(actor.model.actorNames[i]);
						actor.model.actorNames.pop();
					}
				}
				// console.log("TCL: show actor name form");
				if ($('#actorTab').hasClass('active')) {
					await TIMAAT.UI.refreshDataTable('actor');
				} else {
					await TIMAAT.UI.refreshDataTable(type);
				}
				// TIMAAT.UI.addSelectedClassToSelectedItem(type, actor.model.id);
				TIMAAT.UI.displayDataSetContent('names', actor, 'actor');
			});

			// Cancel add/edit button in names form functionality
			$('#actorFormNamesDismissButton').on('click', function(event) {
				let actor = $('#actorFormMetadata').data('actor');
				TIMAAT.UI.displayDataSetContent('names', actor, 'actor');
			});

			// Key press events
			$('#actorFormNamesSubmitButton').on('keypress', function(event) {
				event.stopPropagation();
				if (event.which == '13') { // == enter
					$('#actorFormNamesSubmitButton').trigger('click');
				}
			});

			$('#actorFormNamesDismissButton').on('keypress', function(event) {
				event.stopPropagation();
				if (event.which == '13') { // == enter
					$('#actorFormNamesDismissButton').trigger('click');
				}
			});

			$('#dynamicActorNameFields').on('keypress', function(event) {
				// event.stopPropagation();
				if (event.which == '13') { // == enter
					event.preventDefault(); // prevent activating delete button when pressing enter in a field of the row
				}
			});

			$('#newActorNameFields').on('keypress', function(event) {
				event.stopPropagation();
				if (event.which == '13') { // == enter
					event.preventDefault();
					$('#newActorNameFields').find('[data-role="add"]').trigger('click');
				}
			});
		},

		initAddresses: function() {
			$('#actorTabAddresses').on('click', function(event) {
				let actor = $('#actorFormMetadata').data('actor');
				let type = $('#actorFormMetadata').data('type');
				let name = actor.model.displayName.name;
				let id = actor.model.id;
				TIMAAT.UI.displayDataSetContentArea('actorFormAddresses');
				TIMAAT.ActorDatasets.setActorHasAddressList(actor);
				TIMAAT.UI.displayDataSetContent('addresses', actor, 'actor');
				if ( type == 'actor') {
					TIMAAT.URLHistory.setURL(null, name + ' ?? Addresses ?? ' + type[0].toUpperCase() + type.slice(1), '#actor/' + id + '/addresses');
				} else {
					TIMAAT.URLHistory.setURL(null, name + ' ?? Addresses ?? ' + type[0].toUpperCase() + type.slice(1), '#actor/' + type + '/' + id + '/addresses');
				}
			});

			// Add address button click
			// $(document).on('click','[data-role="newActorHasAddressFields"] > .form-group [data-role="add"]', function(event) {
			$(document).on('click','.addActorAddressButton', function(event) {
					event.preventDefault();
				// console.log("TCL: add address to list");
				var listEntry = $(this).closest('[data-role="newActorHasAddressFields"]');
				var newAddress = [];
				var addressTypeId = 1;
				if (listEntry.find('select').each(function(){
					addressTypeId = $(this).val();
				}));
				if (listEntry.find('input').each(function(){
					newAddress.push($(this).val());
				}));
				if (!$('#actorFormAddresses').valid())
					return false;
				// console.log("TCL: newAddress", newAddress);
				if (newAddress != '') { // TODO is '' proper check?
					var addressesInForm = $('#actorFormAddresses').serializeArray();
					// console.log("TCL: addressesInForm", addressesInForm);
					var i;
					var numberOfAddressElements = 9;
					if (addressesInForm.length > numberOfAddressElements) {
						var indexName = addressesInForm[addressesInForm.length-numberOfAddressElements-1].name; // find last used indexed name (first prior to new address fields)
						var indexString = indexName.substring(indexName.lastIndexOf("[") + 1, indexName.lastIndexOf("]"));
						i = Number(indexString)+1;
					}
					else {
						i = 0;
					}
					// console.log("TCL: i", i);
					$('#dynamicActorHasAddressFields').append(
						`<div class="form-group" data-role="addressEntry">
							<div class="form-row">
								<div class="col-md-11">
									<fieldset>
										<legend>Address</legend>
										<div class="form-row align-items-center">
											<div class="col-md-2 col-auto">
												<div class="form-check form-check-inline">
													<input class="form-check-input isPrimaryAddress"
																 type="radio" name="isPrimaryAddress"
																 data-role="primaryAddress"
																 placeholder="Is primary address">
													<label class="form-check-label col-form-label col-form-label-sm" for="isPrimaryAddress">Primary address</label>
												</div>
											</div>
											<div class="col-md-5">
												<label class="col-form-label col-form-label-sm">Street name</label>
												<input type="text"
															 class="form-control form-control-sm"
															 name="newStreet[`+i+`]"
															 data-role="newStreet[`+i+`]"
															 value="`+newAddress[0]+`"
															 placeholder="[Enter street name]"
															 aria-describedby="Street name"
															 minlength="3"
															 maxlength="100"
															 rows="1">
											</div>
											<div class="col-md-2">
												<label class="col-form-label col-form-label-sm">Street number</label>
												<input type="text"
															 class="form-control form-control-sm"
															 name="newStreetNumber[`+i+`]"
															 data-role="newStreetNumber[`+i+`]"
															 value="`+newAddress[1]+`"
															 placeholder="[Enter street number]"
															 aria-describedby="Street number"
															 maxlength="10">
											</div>
											<div class="col-md-3">
												<label class="col-form-label col-form-label-sm">Street addition</label>
												<input type="text"
															 class="form-control form-control-sm"
															 name="newStreetAddition[`+i+`]" data-role="newStreetAddition[`+i+`]"
															 value="`+newAddress[2]+`"
															 placeholder="[Enter street addition]"
															 aria-describedby="Street addition" maxlength="50">
											</div>
										</div>
										<div class="form-row">
											<div class="col-md-3">
												<label class="col-form-label col-form-label-sm">Postal code</label>
												<input type="text"
															 class="form-control form-control-sm"
															 name="newPostalCode[`+i+`]"
															 data-role="newPostalCode[`+i+`]"
															 value="`+newAddress[3]+`"
															 placeholder="[Enter postal code]"
															 aria-describedby="Postal code"
															 maxlength="8">
											</div>
											<div class="col-md-6">
												<label class="col-form-label col-form-label-sm">City</label>
												<input type="text"
															 class="form-control form-control-sm"
															 name="newCity[`+i+`]"
															 data-role="newCity[`+i+`]"
															 value="`+newAddress[4]+`"
															 placeholder="[Enter city]"
															 aria-describedby="City"
															 maxlength="100">
											</div>
											<div class="col-md-3">
												<label class="col-form-label col-form-label-sm">Post office box</label>
												<input type="text"
															 class="form-control form-control-sm"
															 name="newPostOfficeBox[`+i+`]"
															 data-role="newPostOfficeBox[`+i+`]"
															 value="`+newAddress[5]+`"
															 placeholder="[Enter post office box]"
															 aria-describedby="Post office box"
															 maxlength="10">
											</div>
										</div>
										<div class="form-row">
											<div class="col-md-4">
												<label class="col-form-label col-form-label-sm">Address type*</label>
												<select class="form-control form-control-sm" name="newAddressTypeId[`+i+`]" data-role="newAddressTypeId[`+i+`]" required>
													<option value="" disabled selected hidden>[Choose address type...]</option>
													<option value="1"> </option>
													<option value="2">business</option>
													<option value="3">home</option>
													<option value="4">other</option>
												</select>
											</div>
											<div class="col-md-4">
												<label class="col-form-label col-form-label-sm">Address used from</label>
												<input type="text" class="form-control form-control-sm actorDatasetsActorAddressesAddressUsedFrom" name="addressUsedFrom[`+i+`]" data-role="addressUsedFrom" value="`+newAddress[6]+`" placeholder="[Enter used from]" aria-describedby="Address used from">
											</div>
											<div class="col-md-4">
												<label class="col-form-label col-form-label-sm">Address used until</label>
												<input type="text" class="form-control form-control-sm actorDatasetsActorAddressesAddressUsedUntil" name="addressUsedUntil[`+i+`]" data-role="addressUsedUntil" value="`+newAddress[7]+`" placeholder="[Enter used until]" aria-describedby="Address used until">
											</div>
										</div>
									</fieldset>
								</div>
								<div class="col-md-1 align-items--vertically">
									<button class="form-group__button js-form-group__button removeActorAddressButton btn btn-danger" data-role="remove">
										<i class="fas fa-trash-alt"></i>
									</button>
								</div>
							</div>
						</div>`
					);
					$('input[name="newActorAddress['+i+']"]').rules("add", { required: true, minlength: 3, maxlength: 200});
					$('[data-role="newAddressTypeId['+i+']"]').find('option[value='+addressTypeId+']').attr('selected', true);
					if (listEntry.find('input').each(function(){
						// console.log("TCL: find(input) $(this).val()", $(this).val());
						$(this).val('');
					}));
					if (listEntry.find('select').each(function(){
						// console.log("TCL: find(select) $(this).val()", $(this).val());
						$(this).val('');
					}));
					$('.actorDatasetsActorAddressesAddressUsedFrom').datetimepicker({timepicker: false, changeMonth: true, changeYear: true, scrollInput: false, format: 'YYYY-MM-DD', yearStart: 1900, yearEnd: new Date().getFullYear()});
					$('.actorDatasetsActorAddressesAddressUsedUntil').datetimepicker({timepicker: false, changeMonth: true, changeYear: true, scrollInput: false, format: 'YYYY-MM-DD', yearStart: 1900, yearEnd: new Date().getFullYear()});
				}
				else {
					// TODO open modal showing error that not all required fields are set.
				}
			});

			// Remove address button click
			// $(document).on('click','[data-role="dynamicActorHasAddressFields"] > .form-group [data-role="remove"]', function(event) {
			$(document).on('click','.removeActorAddressButton', function(event) {
					event.preventDefault();
					$(this).closest('.form-group').remove();
			});

			// Submit actor addresses button functionality
			$('#actorFormAddressesSubmitButton').on('click', async function(event) {
				// console.log("TCL: Addresses form: submit");
				// add rules to dynamically added form fields
				event.preventDefault();
				var node = document.getElementById("newActorHasAddressFields");
				while (node.lastChild) {
					node.removeChild(node.lastChild);
				}
				// test if form is valid
				if (!$('#actorFormAddresses').valid()) {
					$('[data-role="newActorHasAddressFields"]').append(TIMAAT.ActorDatasets.appendNewAddressField());
					return false;
				}

				// the original actor model (in case of editing an existing actor)
				var actor = $('#actorFormAddresses').data("actor");
				var actorType = actor.model.actorType.actorTypeTranslations[0].type;

				// Create/Edit actor window submitted data
				var formData = $('#actorFormAddresses').serializeArray();
				var formActorHasAddressesList = [];
				var i = 0;
				while ( i < formData.length) { // fill formActorHasAddressesList with data
					var element = {
						isPrimaryAddress: false,
						street: '',
						streetNumber: '',
						streetAddition: '',
						postalCode: '',
						city: '',
						postOfficeBox: '',
						addressTypeId: 0,
						addressUsedFrom: '',
						addressUsedUntil: '',
					};
						// console.log("TCL: formData", formData);
						if (formData[i].name == 'isPrimaryAddress' && formData[i].value == 'on' ) {
							element.isPrimaryAddress = true;
							element.street = formData[i+1].value;
							element.streetNumber = formData[i+2].value;
							element.streetAddition = formData[i+3].value;
							element.postalCode = formData[i+4].value;
							element.city = formData[i+5].value;
							element.postOfficeBox = formData[i+6].value;
							element.addressTypeId = formData[i+7].value;
							element.addressUsedFrom = formData[i+8].value;
							element.addressUsedUntil = formData[i+9].value;
							i = i+10;
						} else {
							element.isPrimaryAddress = false;
							element.street = formData[i].value;
							element.streetNumber = formData[i+1].value;
							element.streetAddition = formData[i+2].value;
							element.postalCode = formData[i+3].value;
							element.city = formData[i+4].value;
							element.postOfficeBox = formData[i+5].value;
							element.addressTypeId = formData[i+6].value;
							element.addressUsedFrom = formData[i+7].value;
							element.addressUsedUntil = formData[i+8].value;
							i = i+9;
						}
					formActorHasAddressesList[formActorHasAddressesList.length] = element;
				}
				// console.log("TCL: formActorHasAddressesList", formActorHasAddressesList);

				// only updates to existing actorHasAddress entries
				if (formActorHasAddressesList.length == actor.model.actorHasAddresses.length) {
					var i = 0;
					for (; i < actor.model.actorHasAddresses.length; i++ ) { // update existing actorHasAddresses
						var updatedActorHasAddress = await TIMAAT.ActorDatasets.updateActorHasAddressModel(actor.model.actorHasAddresses[i], formActorHasAddressesList[i]);
						// only update if anything changed
						// if (updatedActorHasAddress != actor.model.actorHasAddresses[i]) { // TODO currently actorHasAddresses[i] values change too early causing this check to always fail
							// console.log("TCL: update existing address");
							await TIMAAT.ActorDatasets.updateActorHasAddress(updatedActorHasAddress, actor);
						// }
						var primaryAddressChanged = false;
						// update primary actorHasAddress
						if (formActorHasAddressesList[i].isPrimaryAddress && (actor.model.primaryAddress == null || actor.model.primaryAddress.id != actor.model.actorHasAddresses[i].id.addressId)) {
							actor.model.primaryAddress = actor.model.actorHasAddresses[i].address;
							primaryAddressChanged = true;
						} else if (!formActorHasAddressesList[i].isPrimaryAddress && actor.model.primaryAddress != null && actor.model.primaryAddress.id == actor.model.actorHasAddresses[i].id.addressId) {
							actor.model.primaryAddress = null;
							primaryAddressChanged = true;
						}
						if (primaryAddressChanged) {
							// console.log("TCL actorType, actor", actorType, actor);
							await TIMAAT.ActorDatasets.updateActor(actorType, actor);
						}
					}
				}
				// update existing actorHasAddresses and add new ones
				else if (formActorHasAddressesList.length > actor.model.actorHasAddresses.length) {
					var i = 0;
					for (; i < actor.model.actorHasAddresses.length; i++ ) { // update existing actorHasAddresses
						// console.log("TCL: actor", actor);
						var actorHasAddress = {};
						actorHasAddress = await TIMAAT.ActorDatasets.updateActorHasAddressModel(actor.model.actorHasAddresses[i], formActorHasAddressesList[i]);
						// only update if anything changed
						// if (actorHasAddress != actor.model.actorHasAddresses[i]) { // TODO currently actorHasAddresses[i] values change too early causing this check to always fail
							// console.log("TCL: update existing actorHasAddresses (and add new ones)");
							await TIMAAT.ActorDatasets.updateActorHasAddress(actorHasAddress, actor);
						// }
					}
					i = actor.model.actorHasAddresses.length;
					var newActorHasAddresses = [];
					for (; i < formActorHasAddressesList.length; i++) { // create new actorHasAddresses
						var actorHasAddress = await TIMAAT.ActorDatasets.createActorHasAddressModel(formActorHasAddressesList[i], actor.model.id, 0);
						newActorHasAddresses.push(actorHasAddress);
					}
					// console.log("TCL: (update existing addresses and) add new ones");
					await TIMAAT.ActorDatasets.addActorHasAddresses(actor, newActorHasAddresses);
					// for the whole list check new primary actorHasAddress
					i = 0;
					for (; i < formActorHasAddressesList.length; i++) {
						// update primary address
						var primaryAddressChanged = false;
						if (formActorHasAddressesList[i].isPrimaryAddress && (actor.model.primaryAddress == null || actor.model.primaryAddress.id != actor.model.actorHasAddresses[i].id.addressId)) {
							actor.model.primaryAddress = actor.model.actorHasAddresses[i].address;
							primaryAddressChanged = true;
						} else if (!formActorHasAddressesList[i].isPrimaryAddress && actor.model.primaryAddress != null && actor.model.primaryAddress.id == actor.model.actorHasAddresses[i].id.addressId) {
							actor.model.primaryAddress = null;
							primaryAddressChanged = true;
						}
						if (primaryAddressChanged) {
							await TIMAAT.ActorDatasets.updateActor(actorType, actor);
							break; // only one primary actorHasAddress needs to be found
						}
					}
				}
				// update existing actorHasAddresses and delete obsolete ones
				else if (formActorHasAddressesList.length < actor.model.actorHasAddresses.length) {
					var i = 0;
					for (; i < formActorHasAddressesList.length; i++ ) { // update existing actorHasAddresses
						var actorHasAddress = await TIMAAT.ActorDatasets.updateActorHasAddressModel(actor.model.actorHasAddresses[i], formActorHasAddressesList[i]);
						// if (actorHasAddress != actor.model.actorHasAddresses[i]) { // TODO currently actorHasAddresses[i] values change too early causing this check to always fail
							// console.log("TCL: update existing actorHasAddresses (and delete obsolete ones)");
							await TIMAAT.ActorDatasets.updateActorHasAddress(actorHasAddress, actor);
						// }
						// update primary address
						var primaryAddressChanged = false;
						if (formActorHasAddressesList[i].isPrimaryAddress && (actor.model.primaryAddress == null || actor.model.primaryAddress.id != actor.model.actorHasAddresses[i].id.addressId)) {
							actor.model.primaryAddress = actor.model.actorHasAddresses[i].address;
							primaryAddressChanged = true;
						} else if (!formActorHasAddressesList[i].isPrimaryAddress && actor.model.primaryAddress != null && actor.model.primaryAddress.id == actor.model.actorHasAddresses[i].id.addressId) {
							actor.model.primaryAddress = null;
							primaryAddressChanged = true;
						}
						if (primaryAddressChanged) {
							await TIMAAT.ActorDatasets.updateActor(actorType, actor);
						}
					}
					var i = actor.model.actorHasAddresses.length - 1;
					for (; i >= formActorHasAddressesList.length; i-- ) { // remove obsolete addresses starting at end of list
						if (actor.model.primaryAddress != null && actor.model.primaryAddress.id == actor.model.actorHasAddresses[i].address.id) {
							actor.model.primaryAddress = null;
							// console.log("TCL: remove primaryActorHasAddress before deleting address");
							await TIMAAT.ActorDatasets.updateActor(actorType, actor);
						}
						// console.log("TCL: (update existing actorHasAddresses and) delete obsolete ones");
						TIMAAT.ActorService.removeAddress(actor.model.actorHasAddresses[i].address);
						actor.model.actorHasAddresses.pop();
					}
				}
				// console.log("TCL: show actor address form");
				TIMAAT.UI.displayDataSetContent('addresses', actor, 'actor');
			});

			// Cancel add/edit button in addresses form functionality
			$('#actorFormAddressesDismissButton').on('click', function(event) {
				let actor = $('#actorFormMetadata').data('actor');
				TIMAAT.UI.displayDataSetContent('addresses', actor, 'actor');
			});

			// Key press events
			$('#actorFormAddressesSubmitButton').on('keypress', function(event) {
				event.stopPropagation();
				if (event.which == '13') { // == enter
					$('#actorFormAddressesSubmitButton').trigger('click');
				}
			});

			$('#actorFormAddressesDismissButton').on('keypress', function(event) {
				event.stopPropagation();
				if (event.which == '13') { // == enter
					$('#actorFormAddressesDismissButton').trigger('click');
				}
			});

			$('#dynamicActorHasAddressFields').on('keypress', function(event) {
				// event.stopPropagation();
				if (event.which == '13') { // == enter
					event.preventDefault(); // prevent activating delete button when pressing enter in a field of the row
				}
			});

			$('#newActorHasAddressFields').on('keypress', function(event) {
				event.stopPropagation();
				if (event.which == '13') { // == enter
					event.preventDefault();
					$('#newActorHasAddressFields').find('[data-role="add"]').trigger('click');
				}
			});

		},

		initAddressTypes: function() {
			// console.log("TCL: ActorDatasets: initAddressTypes: function()");
			// delete addressType functionality
			$('#addressTypeDeleteSubmitButton').on('click', function(ev) {
				var modal = $('#actorDatasetsAddressTypeDeleteModal');
				var addressType = modal.data('addressType');
				if (addressType) TIMAAT.ActorDatasets._addressTypeRemoved(addressType);
				modal.modal('hide');
			});

			// add addressType button
			$('#addressTypeAddButton').attr('onclick','TIMAAT.ActorDatasets.addAddressType()');

			// add/edit addressType functionality
			$('#actorDatasetsAddressTypeMeta').on('show.bs.modal', function (ev) {
				// Create/Edit addressType window setup
				var modal = $(this);
				var addressType = modal.data('addressType');
				var heading = (addressType) ? "Edit address type" : "Add address type";
				var submit = (addressType) ? "Save" : "Add";
				var type = (addressType) ? addressType.model.type : 0;
				// setup UI
				$('#addressTypeMetaLabel').html(heading);
				$('#actorDatasetsAddressTypeMetaSubmitButton').html(submit);
				$('#actorDatasetsAddressTypeMetaName').val(type).trigger('input');
			});

			// Submit addressType data
			$('#actorDatasetsAddressTypeMetaSubmitButton').on('click', function(ev) {
				// Create/Edit addressType window submitted data validation
				var modal = $('#actorDatasetsAddressTypeMeta');
				var addressType = modal.data('addressType');
				var type = $('#actorDatasetsAddressTypeMetaName').val();

				if (addressType) {
					addressType.model.actor.addressTypeTranslations[0].type = type;
					// addressType.updateUI();
					TIMAAT.ActorService.updateAddressType(addressType);
					TIMAAT.ActorService.updateAddressTypeTranslation(addressType);
				} else { // create new addressType
					var model = {
						id: 0,
						addressTypeTranslations: [],
					};
					var modelTranslation = {
						id: 0,
						type: type,
					}
					TIMAAT.ActorService.createAddressType(model, modelTranslation, TIMAAT.ActorDatasets._addressTypeAdded); // TODO add addressType parameters
				}
				modal.modal('hide');
			});

			// validate addressType data
			// TODO validate all required fields
			$('#actorDatasetsAddressTypeMetaName').on('input', function(ev) {
				if ( $('#actorDatasetsAddressTypeMetaName').val().length > 0 ) {
					$('#actorDatasetsAddressTypeMetaSubmitButton').prop('disabled', false);
					$('#actorDatasetsAddressTypeMetaSubmitButton').removeAttr('disabled');
				} else {
					$('#actorDatasetsAddressTypeMetaSubmitButton').prop('disabled', true);
					$('#actorDatasetsAddressTypeMetaSubmitButton').attr('disabled');
				}
			});
		},

		initEmailAddresses: function() {
			$('#actorTabEmailAddresses').on('click',function(event) {
				let actor = $('#actorFormMetadata').data('actor');
				let type = $('#actorFormMetadata').data('type');
				let name = actor.model.displayName.name;
				let id = actor.model.id;
				TIMAAT.UI.displayDataSetContentArea('actorFormEmailAddresses');
				TIMAAT.ActorDatasets.setActorHasEmailAddressList(actor);
				TIMAAT.UI.displayDataSetContent('emails', actor, 'actor');
				if ( type == 'actor') {
					TIMAAT.URLHistory.setURL(null, name + ' ?? Emails ?? ' + type[0].toUpperCase() + type.slice(1), '#actor/' + id + '/emails');
				} else {
					TIMAAT.URLHistory.setURL(null, name + ' ?? Emails ?? ' + type[0].toUpperCase() + type.slice(1), '#actor/' + type + '/' + id + '/emails');
				}
			});

			// Add email address button click
			// $(document).on('click','[data-role="newActorHasEmailAddressFields"] > .form-group [data-role="add"]', function(event) {
			$(document).on('click','.addEmailAddressButton', function(event) {
					event.preventDefault();
				// console.log("TCL: add email address to list");
				var listEntry = $(this).closest('[data-role="newActorHasEmailAddressFields"]');
				var newEmailAddress = [];
				var emailAddressTypeId = 1;
				if (listEntry.find('select').each(function(){
					emailAddressTypeId = $(this).val();
				}));
				if (listEntry.find('input').each(function(){
					newEmailAddress.push($(this).val());
				}));
				if (!$('#actorFormEmailAddresses').valid())
					return false;
				// console.log("TCL: newEmailAddress", newEmailAddress);
				if (newEmailAddress != '') { // TODO is '' proper check?
					var emailAddressesInForm = $('#actorFormEmailAddresses').serializeArray();
					// console.log("TCL: emailAddressesInForm", emailAddressesInForm);
					var i;
					var numberOfEmailAddressElements = 2;
					if (emailAddressesInForm.length > numberOfEmailAddressElements) {
						var indexName = emailAddressesInForm[emailAddressesInForm.length-numberOfEmailAddressElements-1].name; // find last used indexed name (first prior to new address fields)
						var indexString = indexName.substring(indexName.lastIndexOf("[") + 1, indexName.lastIndexOf("]"));
						i = Number(indexString)+1;
					}
					else {
						i = 0;
					}
					// console.log("TCL: i", i);
					$('#dynamicActorHasEmailAddressFields').append(
						`<div class="form-group" data-role="emailAddressEntry">
							<div class="form-row">
									<div class="col-md-2 text-center">
										<div class="form-check">
											<input class="form-check-input isPrimaryEmailAddress" type="radio" name="isPrimaryEmailAddress" data-role="primaryEmailAddress" placeholder="Is primary email address">
											<label class="sr-only" for="isPrimaryEmailAddress"></label>
										</div>
									</div>
									<div class="col-md-3">
									<label class="sr-only">Email address type*</label>
									<select class="form-control form-control-sm" name="newEmailAddressTypeId[`+i+`]" data-role="newEmailAddressTypeId[`+i+`]" required>
										<option value="" disabled selected hidden>[Choose email type...]</option>
										<option value="1"> </option>
										<option value="2">home</option>
										<option value="3">work</option>
										<option value="4">other</option>
										<option value="5">mobile</option>
										<option value="6">custom</option>
									</select>
								</div>
									<div class="col-md-6">
										<label class="sr-only">Email address</label>
										<input type="text" class="form-control form-control-sm" name="newEmailAddress[`+i+`]" data-role="newEmailAddress[`+i+`]" value="`+newEmailAddress[0]+`" placeholder="[Enter email address]" aria-describedby="Email address" required>
									</div>
								<div class="col-md-1 text-center">
									<button class="form-group__button js-form-group__button removeEmailAddressButton btn btn-danger" data-role="remove">
										<i class="fas fa-trash-alt"></i>
									</button>
								</div>
							</div>
						</div>`
					);
					$('[data-role="newEmailAddressTypeId['+i+']"]')
						.find('option[value='+emailAddressTypeId+']')
						.attr('selected', true);
					$('input[name="newEmailAddress['+i+']"]').rules("add", { required: true, email: true});
					if (listEntry.find('input').each(function(){
						$(this).val('');
					}));
					if (listEntry.find('select').each(function(){
						$(this).val('');
					}));
				}
				else {
					// TODO open modal showing error that not all required fields are set.
				}
			});

			// Remove email address button click
			// $(document).on('click','[data-role="dynamicActorHasEmailAddressFields"] > .form-group [data-role="remove"]', function(event) {
			$(document).on('click','.removeEmailAddressButton', function(event) {
					event.preventDefault();
					$(this).closest('.form-group').remove();
			});

			// Submit actor email addresses button functionality
			$('#actorFormEmailAddressesSubmitButton').on('click', async function(event) {
				// console.log("TCL: Email addresses form: submit");
				// add rules to dynamically added form fields
				event.preventDefault();
				var node = document.getElementById("newActorHasEmailAddressFields");
				while (node.lastChild) {
					node.removeChild(node.lastChild);
				}
				// test if form is valid
				if (!$('#actorFormEmailAddresses').valid()) {
					$('[data-role="newActorHasEmailAddressFields"]').append(TIMAAT.ActorDatasets.appendNewEmailAddressField());
					return false;
				}

				// the original actor model (in case of editing an existing actor)
				var actor = $('#actorFormEmailAddresses').data("actor");
				var actorType = actor.model.actorType.actorTypeTranslations[0].type;

				// Create/Edit actor window submitted data
				var formData = $('#actorFormEmailAddresses').serializeArray();
				var formActorHasEmailAddressesList = [];
				var i = 0;
				while ( i < formData.length) { // fill formActorHasEmailAddressesList with data
					var element = {
						isPrimaryEmailAddress: false,
						emailAddressTypeId: 0,
						email: '',
					};
						// console.log("TCL: formData", formData);
						if (formData[i].name == 'isPrimaryEmailAddress' && formData[i].value == 'on' ) {
							element.isPrimaryEmailAddress = true;
							element.emailAddressTypeId = formData[i+1].value;
							element.email = formData[i+2].value;
							i = i+3;
						} else {
							element.isPrimaryEmailAddress = false;
							element.emailAddressTypeId = formData[i].value;
							element.email = formData[i+1].value;
							i = i+2;
						}
					formActorHasEmailAddressesList[formActorHasEmailAddressesList.length] = element;
				}
				// console.log("TCL: formActorHasEmailAddressesList", formActorHasEmailAddressesList);

				// only updates to existing actorHasEmailAddress entries
				if (formActorHasEmailAddressesList.length == actor.model.actorHasEmailAddresses.length) {
					var i = 0;
					for (; i < actor.model.actorHasEmailAddresses.length; i++ ) { // update existing actorHasEmailAddresses
						var updatedActorHasEmailAddress = await TIMAAT.ActorDatasets.updateActorHasEmailAddressModel(actor.model.actorHasEmailAddresses[i], formActorHasEmailAddressesList[i]);
						// only update if anything changed
						// if (updatedActorHasEmailAddress != actor.model.actorHasEmailAddresses[i]) { // TODO currently actorHasEmailAddresses[i] values change too early causing this check to always fail
							// console.log("TCL: update existing email address");
							await TIMAAT.ActorDatasets.updateActorHasEmailAddress(updatedActorHasEmailAddress, actor);
						// }
						var primaryEmailAddressChanged = false;
						// update primary actorHasEmailAddress
						if (formActorHasEmailAddressesList[i].isPrimaryEmailAddress && (actor.model.primaryEmailAddress == null || actor.model.primaryEmailAddress.id != actor.model.actorHasEmailAddresses[i].id.emailAddressId)) {
							actor.model.primaryEmailAddress = actor.model.actorHasEmailAddresses[i].emailAddress;
							primaryEmailAddressChanged = true;
						} else if (!formActorHasEmailAddressesList[i].isPrimaryEmailAddress && actor.model.primaryEmailAddress != null && actor.model.primaryEmailAddress.id == actor.model.actorHasEmailAddresses[i].id.emailAddressId) {
							actor.model.primaryEmailAddress = null;
							primaryEmailAddressChanged = true;
						}
						if (primaryEmailAddressChanged) {
							// console.log("TCL actorType, actor", actorType, actor);
							await TIMAAT.ActorDatasets.updateActor(actorType, actor);
						}
					}
				}
				// update existing actorHasEmailAddresses and add new ones
				else if (formActorHasEmailAddressesList.length > actor.model.actorHasEmailAddresses.length) {
					var i = 0;
					for (; i < actor.model.actorHasEmailAddresses.length; i++ ) { // update existing actorHasEmailAddresses
						// console.log("TCL: actor", actor);
						var actorHasEmailAddress = {};
						actorHasEmailAddress = await TIMAAT.ActorDatasets.updateActorHasEmailAddressModel(actor.model.actorHasEmailAddresses[i], formActorHasEmailAddressesList[i]);
						// only update if anything changed
						// if (actorHasEmailAddress != actor.model.actorHasEmailAddresses[i]) { // TODO currently actorHasEmailAddresses[i] values change too early causing this check to always fail
							// console.log("TCL: update existing actorHasEmailAddresses (and add new ones)");
							await TIMAAT.ActorDatasets.updateActorHasEmailAddress(actorHasEmailAddress, actor);
						// }
					}
					i = actor.model.actorHasEmailAddresses.length;
					var newActorHasEmailAddresses = [];
					for (; i < formActorHasEmailAddressesList.length; i++) { // create new actorHasEmailAddresses
						var actorHasEmailAddress = await TIMAAT.ActorDatasets.createActorHasEmailAddressModel(formActorHasEmailAddressesList[i], actor.model.id, 0);
						newActorHasEmailAddresses.push(actorHasEmailAddress);
					}
					// console.log("TCL: (update existing actorHasEmailAddresses and) add new ones");
					await TIMAAT.ActorDatasets.addActorHasEmailAddresses(actor, newActorHasEmailAddresses);
					// for the whole list check new primary actorHasEmailAddress
					i = 0;
					for (; i < formActorHasEmailAddressesList.length; i++) {
						// update primary email address
						var primaryEmailAddressChanged = false;
						if (formActorHasEmailAddressesList[i].isPrimaryEmailAddress && (actor.model.primaryEmailAddress == null || actor.model.primaryEmailAddress.id != actor.model.actorHasEmailAddresses[i].id.emailAddressId)) {
							actor.model.primaryEmailAddress = actor.model.actorHasEmailAddresses[i].emailAddress;
							primaryEmailAddressChanged = true;
						} else if (!formActorHasEmailAddressesList[i].isPrimaryEmailAddress && actor.model.primaryEmailAddress != null && actor.model.primaryEmailAddress.id == actor.model.actorHasEmailAddresses[i].id.emailAddressId) {
							actor.model.primaryEmailAddress = null;
							primaryEmailAddressChanged = true;
						}
						if (primaryEmailAddressChanged) {
							await TIMAAT.ActorDatasets.updateActor(actorType, actor);
							break; // only one primary actorHasEmailAddress needs to be found
						}
					}
				}
				// update existing actorHasEmailAddresses and delete obsolete ones
				else if (formActorHasEmailAddressesList.length < actor.model.actorHasEmailAddresses.length) {
					var i = 0;
					for (; i < formActorHasEmailAddressesList.length; i++ ) { // update existing actorHasEmailAddresses
						var actorHasEmailAddress = await TIMAAT.ActorDatasets.updateActorHasEmailAddressModel(actor.model.actorHasEmailAddresses[i], formActorHasEmailAddressesList[i]);
						// if (actorHasEmailAddress != actor.model.actorHasEmailAddresses[i]) { // TODO currently actorHasEmailAddresses[i] values change too early causing this check to always fail
							// console.log("TCL: update existing actorHasEmailAddresses (and delete obsolete ones)");
							await TIMAAT.ActorDatasets.updateActorHasEmailAddress(actorHasEmailAddress, actor);
						// }
						// update primary address
						var primaryEmailAddressChanged = false;
						if (formActorHasEmailAddressesList[i].isPrimaryEmailAddress && (actor.model.primaryEmailAddress == null || actor.model.primaryEmailAddress.id != actor.model.actorHasEmailAddresses[i].id.emailAddressId)) {
							actor.model.primaryEmailAddress = actor.model.actorHasEmailAddresses[i].emailAddress;
							primaryEmailAddressChanged = true;
						} else if (!formActorHasEmailAddressesList[i].isPrimaryEmailAddress && actor.model.primaryEmailAddress != null && actor.model.primaryEmailAddress.id == actor.model.actorHasEmailAddresses[i].id.emailAddressId) {
							actor.model.primaryEmailAddress = null;
							primaryEmailAddressChanged = true;
						}
						if (primaryEmailAddressChanged) {
							await TIMAAT.ActorDatasets.updateActor(actorType, actor);
						}
					}
					var i = actor.model.actorHasEmailAddresses.length - 1;
					for (; i >= formActorHasEmailAddressesList.length; i-- ) { // remove obsolete addresses starting at end of list
						if (actor.model.primaryEmailAddress != null && actor.model.primaryEmailAddress.id == actor.model.actorHasEmailAddresses[i].emailAddress.id) {
							actor.model.primaryEmailAddress = null;
							// console.log("TCL: remove primaryActorHasEmailAddress before deleting email address");
							await TIMAAT.ActorDatasets.updateActor(actorType, actor);
						}
						// console.log("TCL: (update existing actorHasEmailAddresses and) delete obsolete ones");
						TIMAAT.ActorService.removeEmailAddress(actor.model.actorHasEmailAddresses[i].emailAddress);
						actor.model.actorHasEmailAddresses.pop();
					}
				}
				// console.log("TCL: show actor email address form");
				TIMAAT.UI.displayDataSetContent('emails', actor, 'actor');
			});

			// Cancel add/edit button in email addresses form functionality
			$('#actorFormEmailAddressesDismissButton').on('click', function(event) {
				let actor = $('#actorFormMetadata').data('actor');
				TIMAAT.UI.displayDataSetContent('emails', actor, 'actor');
			});

			// Key press events
			$('#actorFormEmailAddressesSubmitButton').on('keypress', function(event) {
				event.stopPropagation();
				if (event.which == '13') { // == enter
					$('#actorFormEmailAddressesSubmitButton').trigger('click');
				}
			});

			$('#actorFormEmailAddressesDismissButton').on('keypress', function(event) {
				event.stopPropagation();
				if (event.which == '13') { // == enter
					$('#actorFormEmailAddressesDismissButton').trigger('click');
				}
			});

			$('#dynamicActorHasEmailAddressFields').on('keypress', function(event) {
				// event.stopPropagation();
				if (event.which == '13') { // == enter
					event.preventDefault(); // prevent activating delete button when pressing enter in a field of the row
				}
			});

			$('#newActorHasEmailAddressFields').on('keypress', function(event) {
				event.stopPropagation();
				if (event.which == '13') { // == enter
					event.preventDefault();
					$('#newActorHasEmailAddressFields').find('[data-role="add"]').trigger('click');
				}
			});
		},

		initEmailAddressTypes: function() {
			// console.log("TCL: ActorDatasets: initEmailAddressTypes: function()");
			// delete emailAddressType functionality
			$('#emailAddressTypeDeleteSubmitButton').on('click', function(ev) {
				var modal = $('#actorDatasetsEmailAddressTypeDeleteModal');
				var emailAddressType = modal.data('emailAddressType');
				if (emailAddressType) TIMAAT.ActorDatasets._emailAddressTypeRemoved(emailAddressType);
				modal.modal('hide');
			});

			// add emailAddressType button
			$('#emailAddressTypeAddButton').attr('onclick','TIMAAT.ActorDatasets.addEmailAddressType()');

			// add/edit emailAddressType functionality
			$('#actorDatasetsEmailAddressTypeMetaModal').on('show.bs.modal', function (ev) {
				// Create/Edit emailAddressType window setup
				var modal = $(this);
				var emailAddressType = modal.data('emailAddressType');
				var heading = (emailAddressType) ? "Edit email-address type" : "Add email-address type";
				var submit = (emailAddressType) ? "Save" : "Add";
				var type = (emailAddressType) ? emailAddressType.model.type : 0;
				// setup UI
				$('#emailAddressTypeMetaLabel').html(heading);
				$('#actorDatasetsEmailAddressTypeMetaSubmitButton').html(submit);
				$('#actorDatasetsEmailAddressTypeMetaName').val(type).trigger('input');
			});

			// Submit emailAddressType data
			$('#actorDatasetsEmailAddressTypeMetaSubmitButton').on('click', function(ev) {
				// Create/Edit emailAddressType window submitted data validation
				var modal = $('#actorDatasetsEmailAddressTypeMetaModal');
				var emailAddressType = modal.data('emailAddressType');
				var type = $('#actorDatasetsEmailAddressTypeMetaName').val();

				if (emailAddressType) {
					emailAddressType.model.actor.emailAddressTypeTranslations[0].type = type;
					// emailAddressType.updateUI();
					TIMAAT.ActorService.updateEmailAddressType(emailAddressType);
					TIMAAT.ActorService.updateEmailAddressTypeTranslation(emailAddressType);
				} else { // create new emailAddressType
					var model = {
						id: 0,
						emailAddressTypeTranslations: [],
					};
					var modelTranslation = {
						id: 0,
						type: type,
					}
					TIMAAT.ActorService.createEmailAddressType(model, modelTranslation, TIMAAT.ActorDatasets._emailAddressTypeAdded); // TODO add emailAddressType parameters
				}
				modal.modal('hide');
			});

			// validate emailAddressType data
			// TODO validate all required fields
			$('#actorDatasetsEmailAddressTypeMetaName').on('input', function(ev) {
				if ( $('#actorDatasetsEmailAddressTypeMetaName').val().length > 0 ) {
					$('#actorDatasetsEmailAddressTypeMetaSubmitButton').prop('disabled', false);
					$('#actorDatasetsEmailAddressTypeMetaSubmitButton').removeAttr('disabled');
				} else {
					$('#actorDatasetsEmailAddressTypeMetaSubmitButton').prop('disabled', true);
					$('#actorDatasetsEmailAddressTypeMetaSubmitButton').attr('disabled');
				}
			});
		},

		initPhoneNumbers: function() {
			$('#actorTabPhoneNumbers').on('click', function(event) {
				let actor = $('#actorFormMetadata').data('actor');
				let type = $('#actorFormMetadata').data('type');
				let name = actor.model.displayName.name;
				let id = actor.model.id;
				TIMAAT.UI.displayDataSetContentArea('actorFormPhoneNumbers');
				TIMAAT.ActorDatasets.setActorHasPhoneNumberList(actor);
				TIMAAT.UI.displayDataSetContent('phoneNumbers', actor, 'actor');
				if ( type == 'actor') {
					TIMAAT.URLHistory.setURL(null, name + ' ?? Phone Numbers ?? ' + type[0].toUpperCase() + type.slice(1), '#actor/' + id + '/phoneNumbers');
				} else {
					TIMAAT.URLHistory.setURL(null, name + ' ?? Phone Numbers ?? ' + type[0].toUpperCase() + type.slice(1), '#actor/' + type + '/' + id + '/phoneNumbers');
				}
			});

			// Add phone number button click
			// $(document).on('click','[data-role="newActorHasPhoneNumberFields"] > .form-group [data-role="add"]', function(event) {
			$(document).on('click','.addActorPhoneNumberButton', function(event) {
					event.preventDefault();
				// console.log("TCL: add phone number to list");
				var listEntry = $(this).closest('[data-role="newActorHasPhoneNumberFields"]');
				var newPhoneNumber = [];
				var phoneNumberTypeId = 1;
				if (listEntry.find('select').each(function(){
					phoneNumberTypeId = $(this).val();
				}));
				if (listEntry.find('input').each(function(){
					newPhoneNumber.push($(this).val());
				}));
				if (!$('#actorFormPhoneNumbers').valid())
					return false;
				// console.log("TCL: newPhoneNumber", newPhoneNumber);
				if (newPhoneNumber != '') { // TODO is '' proper check?
					var phoneNumbersInForm = $('#actorFormPhoneNumbers').serializeArray();
					// console.log("TCL: phoneNumbersInForm", phoneNumbersInForm);
					var i;
					var numberOfPhoneNumberElements = 2;
					if (phoneNumbersInForm.length > numberOfPhoneNumberElements) {
						var indexName = phoneNumbersInForm[phoneNumbersInForm.length-numberOfPhoneNumberElements-1].name; // find last used indexed name (first prior to new phone number fields)
						var indexString = indexName.substring(indexName.lastIndexOf("[") + 1, indexName.lastIndexOf("]"));
						i = Number(indexString)+1;
					}
					else {
						i = 0;
					}
					// console.log("TCL: i", i);
					$('#dynamicActorHasPhoneNumberFields').append(
						`<div class="form-group" data-role="phoneNumberEntry">
							<div class="form-row">
									<div class="col-md-2 text-center">
										<div class="form-check">
											<input class="form-check-input isPrimaryPhoneNumber" type="radio" name="isPrimaryPhoneNumber" data-role="primaryPhoneNumber" placeholder="Is primary phone number">
											<label class="sr-only" for="isPrimaryPhoneNumber"></label>
										</div>
									</div>
									<div class="col-md-3">
									<label class="sr-only">Phone number type*</label>
									<select class="form-control form-control-sm" name="newPhoneNumberTypeId[`+i+`]" data-role="newPhoneNumberTypeId[`+i+`]" required>
										<option value="" disabled selected hidden>[Choose phone number type...]</option>
										<option value="1"> </option>
										<option value="2">mobile</option>
										<option value="3">home</option>
										<option value="4">work</option>
										<option value="5">pager</option>
										<option value="6">other</option>
										<option value="7">custom</option>
									</select>
								</div>
								<div class="col-md-6">
									<label class="sr-only">Phone number</label>
									<input type="text" class="form-control form-control-sm" name="newPhoneNumber[`+i+`]" data-role="newPhoneNumber[`+i+`]" value="`+newPhoneNumber[0]+`" maxlength="30" placeholder="[Enter phone number] "aria-describedby="Phone number" required>
								</div>
								<div class="col-md-1 text-center">
									<button class="form-group__button js-form-group__button removePhoneNumberButton btn btn-danger" data-role="remove">
										<i class="fas fa-trash-alt"></i>
									</button>
								</div>
							</div>
						</div>`
					);
					($('[data-role="newPhoneNumberTypeId['+i+']"]'))
						.find('option[value='+phoneNumberTypeId+']')
						.attr('selected', true);
					$('input[name="newPhoneNumber['+i+']"]').rules("add", { required: true, maxlength: 30 });
					if (listEntry.find('input').each(function(){
						$(this).val('');
					}));
					if (listEntry.find('select').each(function(){
						$(this).val('');
					}));
				}
				else {
					// TODO open modal showing error that not all required fields are set.
				}
			});

			// Remove phone number button click
			// $(document).on('click','[data-role="dynamicActorHasPhoneNumberFields"] > .form-group [data-role="remove"]', function(event) {
			$(document).on('click','.removePhoneNumberButton', function(event) {
					event.preventDefault();
					$(this).closest('.form-group').remove();
			});

			// Submit actor phone numbers button functionality
			$('#actorFormPhoneNumbersSubmitButton').on('click', async function(event) {
				// console.log("TCL: Phone numbers form: submit");
				// add rules to dynamically added form fields
				event.preventDefault();
				var node = document.getElementById("newActorHasPhoneNumberFields");
				while (node.lastChild) {
					node.removeChild(node.lastChild);
				}
				// test if form is valid
				if (!$('#actorFormPhoneNumbers').valid()) {
					$('[data-role="newActorHasPhoneNumberFields"]').append(TIMAAT.ActorDatasets.appendNewPhoneNumberField());
					return false;
				}

				// the original actor model (in case of editing an existing actor)
				var actor = $('#actorFormPhoneNumbers').data("actor");
				var actorType = actor.model.actorType.actorTypeTranslations[0].type;

				// Create/Edit actor window submitted data
				var formData = $('#actorFormPhoneNumbers').serializeArray();
				var formActorHasPhoneNumbersList = [];
				var i = 0;
				while ( i < formData.length) { // fill formActorHasPhoneNumbersList with data
					var element = {
						isPrimaryPhoneNumber: false,
						phoneNumberTypeId: 0,
						phoneNumber: '',
					};
						// console.log("TCL: formData", formData);
						if (formData[i].name == 'isPrimaryPhoneNumber' && formData[i].value == 'on' ) {
							element.isPrimaryPhoneNumber = true;
							element.phoneNumberTypeId = formData[i+1].value;
							element.phoneNumber = formData[i+2].value;
							i = i+3;
						} else {
							element.isPrimaryPhoneNumber = false;
							element.phoneNumberTypeId = Number(formData[i].value);
							element.phoneNumber = formData[i+1].value;
							i = i+2;
						}
					formActorHasPhoneNumbersList[formActorHasPhoneNumbersList.length] = element;
				}
				// console.log("TCL: formActorHasPhoneNumbersList", formActorHasPhoneNumbersList);

				// only updates to existing actorHasPhoneNumber entries
				if (formActorHasPhoneNumbersList.length == actor.model.actorHasPhoneNumbers.length) {
					var i = 0;
					for (; i < actor.model.actorHasPhoneNumbers.length; i++ ) { // update existing actorHasPhoneNumbers
						var updatedActorHasPhoneNumber = await TIMAAT.ActorDatasets.updateActorHasPhoneNumberModel(actor.model.actorHasPhoneNumbers[i], formActorHasPhoneNumbersList[i]);
						// only update if anything changed
						// if (updatedActorHasPhoneNumber != actor.model.actorHasPhoneNumbers[i]) { // TODO currently actorHasPhoneNumbers[i] values change too early causing this check to always fail
							// console.log("TCL: update existing phone number");
							await TIMAAT.ActorDatasets.updateActorHasPhoneNumber(updatedActorHasPhoneNumber, actor);
						// }
						var primaryPhoneNumberChanged = false;
						// update primary actorHasPhoneNumber
						if (formActorHasPhoneNumbersList[i].isPrimaryPhoneNumber && (actor.model.primaryPhoneNumber == null || actor.model.primaryPhoneNumber.id != actor.model.actorHasPhoneNumbers[i].id.phoneNumberId)) {
							actor.model.primaryPhoneNumber = actor.model.actorHasPhoneNumbers[i].phoneNumber;
							primaryPhoneNumberChanged = true;
						} else if (!formActorHasPhoneNumbersList[i].isPrimaryPhoneNumber && actor.model.primaryPhoneNumber != null && actor.model.primaryPhoneNumber.id == actor.model.actorHasPhoneNumbers[i].id.phoneNumberId) {
							actor.model.primaryPhoneNumber = null;
							primaryPhoneNumberChanged = true;
						}
						if (primaryPhoneNumberChanged) {
							// console.log("TCL actorType, actor", actorType, actor);
							await TIMAAT.ActorDatasets.updateActor(actorType, actor);
						}
					}
				}
				// update existing actorHasPhoneNumbers and add new ones
				else if (formActorHasPhoneNumbersList.length > actor.model.actorHasPhoneNumbers.length) {
					var i = 0;
					for (; i < actor.model.actorHasPhoneNumbers.length; i++ ) { // update existing actorHasPhoneNumbers
						// console.log("TCL: actor", actor);
						var actorHasPhoneNumber = {};
						actorHasPhoneNumber = await TIMAAT.ActorDatasets.updateActorHasPhoneNumberModel(actor.model.actorHasPhoneNumbers[i], formActorHasPhoneNumbersList[i]);
						// only update if anything changed
						// if (actorHasPhoneNumber != actor.model.actorHasPhoneNumbers[i]) { // TODO currently actorHasPhoneNumbers[i] values change too early causing this check to always fail
							// console.log("TCL: update existing actorHasPhoneNumbers (and add new ones)");
							await TIMAAT.ActorDatasets.updateActorHasPhoneNumber(actorHasPhoneNumber, actor);
						// }
					}
					i = actor.model.actorHasPhoneNumbers.length;
					var newActorHasPhoneNumbers = [];
					for (; i < formActorHasPhoneNumbersList.length; i++) { // create new actorHasPhoneNumbers
						var actorHasPhoneNumber = await TIMAAT.ActorDatasets.createActorHasPhoneNumberModel(formActorHasPhoneNumbersList[i], actor.model.id, 0);
						newActorHasPhoneNumbers.push(actorHasPhoneNumber);
					}
					// console.log("TCL: (update existing actorHasPhoneNumbers and) add new ones");
					await TIMAAT.ActorDatasets.addActorHasPhoneNumbers(actor, newActorHasPhoneNumbers);
					// for the whole list check new primary actorHasPhoneNumber
					i = 0;
					for (; i < formActorHasPhoneNumbersList.length; i++) {
						// update primary phone number
						var primaryPhoneNumberChanged = false;
						if (formActorHasPhoneNumbersList[i].isPrimaryPhoneNumber && (actor.model.primaryPhoneNumber == null || actor.model.primaryPhoneNumber.id != actor.model.actorHasPhoneNumbers[i].id.phoneNumberId)) {
							actor.model.primaryPhoneNumber = actor.model.actorHasPhoneNumbers[i].phoneNumber;
							primaryPhoneNumberChanged = true;
						} else if (!formActorHasPhoneNumbersList[i].isPrimaryPhoneNumber && actor.model.primaryPhoneNumber != null && actor.model.primaryPhoneNumber.id == actor.model.actorHasPhoneNumbers[i].id.phoneNumberId) {
							actor.model.primaryPhoneNumber = null;
							primaryPhoneNumberChanged = true;
						}
						if (primaryPhoneNumberChanged) {
							await TIMAAT.ActorDatasets.updateActor(actorType, actor);
							break; // only one primary actorHasPhoneNumber needs to be found
						}
					}
				}
				// update existing actorHasPhoneNumbers and delete obsolete ones
				else if (formActorHasPhoneNumbersList.length < actor.model.actorHasPhoneNumbers.length) {
					var i = 0;
					for (; i < formActorHasPhoneNumbersList.length; i++ ) { // update existing actorHasPhoneNumbers
						var actorHasPhoneNumber = await TIMAAT.ActorDatasets.updateActorHasPhoneNumberModel(actor.model.actorHasPhoneNumbers[i], formActorHasPhoneNumbersList[i]);
						// if (actorHasPhoneNumber != actor.model.actorHasPhoneNumbers[i]) { // TODO currently actorHasPhoneNumbers[i] values change too early causing this check to always fail
							// console.log("TCL: update existing actorHasPhoneNumbers (and delete obsolete ones)");
							await TIMAAT.ActorDatasets.updateActorHasPhoneNumber(actorHasPhoneNumber, actor);
						// }
						// update primary phone number
						var primaryPhoneNumberChanged = false;
						if (formActorHasPhoneNumbersList[i].isPrimaryPhoneNumber && (actor.model.primaryPhoneNumber == null || actor.model.primaryPhoneNumber.id != actor.model.actorHasPhoneNumbers[i].id.phoneNumberId)) {
							actor.model.primaryPhoneNumber = actor.model.actorHasPhoneNumbers[i].phoneNumber;
							primaryPhoneNumberChanged = true;
						} else if (!formActorHasPhoneNumbersList[i].isPrimaryPhoneNumber && actor.model.primaryPhoneNumber != null && actor.model.primaryPhoneNumber.id == actor.model.actorHasPhoneNumbers[i].id.phoneNumberId) {
							actor.model.primaryPhoneNumber = null;
							primaryPhoneNumberChanged = true;
						}
						if (primaryPhoneNumberChanged) {
							await TIMAAT.ActorDatasets.updateActor(actorType, actor);
						}
					}
					var i = actor.model.actorHasPhoneNumbers.length - 1;
					for (; i >= formActorHasPhoneNumbersList.length; i-- ) { // remove obsolete phone numbers starting at end of list
						if (actor.model.primaryPhoneNumber != null && actor.model.primaryPhoneNumber.id == actor.model.actorHasPhoneNumbers[i].phoneNumber.id) {
							actor.model.primaryPhoneNumber = null;
							// console.log("TCL: remove primaryActorHasPhoneNumber before deleting phone number");
							await TIMAAT.ActorDatasets.updateActor(actorType, actor);
						}
						// console.log("TCL: (update existing actorHasPhoneNumbers and) delete obsolete ones");
						TIMAAT.ActorService.removePhoneNumber(actor.model.actorHasPhoneNumbers[i].phoneNumber);
						actor.model.actorHasPhoneNumbers.pop();
					}
				}
				// console.log("TCL: show actor phone number form");
				TIMAAT.UI.displayDataSetContent('phoneNumbers', actor, 'actor');
			});

			// Cancel add/edit button in phone numbers form functionality
			$('#actorFormPhoneNumbersDismissButton').on('click', function(event) {
				let actor = $('#actorFormMetadata').data('actor');
				TIMAAT.UI.displayDataSetContent('phoneNumbers', actor, 'actor');
			});

			// Key press events
			$('#actorFormPhoneNumbersSubmitButton').on('keypress', function(event) {
				event.stopPropagation();
				if (event.which == '13') { // == enter
					$('#actorFormPhoneNumbersSubmitButton').trigger('click');
				}
			});

			$('#actorFormPhoneNumbersDismissButton').on('keypress', function(event) {
				event.stopPropagation();
				if (event.which == '13') { // == enter
					$('#actorFormPhoneNumbersDismissButton').trigger('click');
				}
			});

			$('#dynamicActorHasPhoneNumberFields').on('keypress', function(event) {
				// event.stopPropagation();
				if (event.which == '13') { // == enter
					event.preventDefault(); // prevent activating delete button when pressing enter in a field of the row
				}
			});

			$('#newActorHasPhoneNumberFields').on('keypress', function(event) {
				event.stopPropagation();
				if (event.which == '13') { // == enter
					event.preventDefault();
					$('#newActorHasPhoneNumberFields').find('[data-role="add"]').trigger('click');
				}
			});
		},

		initPhoneNumberTypes: function() {
			// console.log("TCL: ActorDatasets: initPhoneNumberTypes: function()");
			// delete phoneNumberType functionality
			$('#phoneNumberTypeDeleteSubmitButton').on('click', function(ev) {
				var modal = $('#actorDatasetsPhoneNumberTypeDeleteModal');
				var phoneNumberType = modal.data('phoneNumberType');
				if (phoneNumberType) TIMAAT.ActorDatasets._phoneNumberTypeRemoved(phoneNumberType);
				modal.modal('hide');
			});

			// add phoneNumberType button
			$('#phoneNumberTypeAddButton').attr('onclick','TIMAAT.ActorDatasets.addPhoneNumberType()');

			// add/edit phoneNumberType functionality
			$('#actorDatasetsPhoneNumberTypeMetaModal').on('show.bs.modal', function (ev) {
				// Create/Edit phoneNumberType window setup
				var modal = $(this);
				var phoneNumberType = modal.data('phoneNumberType');
				var heading = (phoneNumberType) ? "Edit phone number type" : "Add phone number type";
				var submit = (phoneNumberType) ? "Save" : "Add";
				var type = (phoneNumberType) ? phoneNumberType.model.type : 0;
				// setup UI
				$('#phoneNumberTypeMetaLabel').html(heading);
				$('#actorDatasetsPhoneNumberTypeMetaSubmitButton').html(submit);
				$('#actorDatasetsPhoneNumberTypeMetaName').val(type).trigger('input');
			});

			// Submit phoneNumberType data
			$('#actorDatasetsPhoneNumberTypeMetaSubmitButton').on('click', function(ev) {
				// Create/Edit phoneNumberType window submitted data validation
				var modal = $('#actorDatasetsPhoneNumberTypeMetaModal');
				var phoneNumberType = modal.data('phoneNumberType');
				var type = $('#actorDatasetsPhoneNumberTypeMetaName').val();

				if (phoneNumberType) {
					phoneNumberType.model.actor.phoneNumberTypeTranslations[0].type = type;
					// phoneNumberType.updateUI();
					TIMAAT.ActorService.updatePhoneNumberType(phoneNumberType);
					TIMAAT.ActorService.updatePhoneNumberTypeTranslation(phoneNumberType);
				} else { // create new phoneNumberType
					var model = {
						id: 0,
						phoneNumberTypeTranslations: [],
					};
					var modelTranslation = {
						id: 0,
						type: type,
					}
					TIMAAT.ActorService.createPhoneNumberType(model, modelTranslation, TIMAAT.ActorDatasets._phoneNumberTypeAdded); // TODO add phoneNumberType parameters
				}
				modal.modal('hide');
			});

			// validate phoneNumberType data
			// TODO validate all required fields
			$('#actorDatasetsPhoneNumberTypeMetaName').on('input', function(ev) {
				if ( $('#actorDatasetsPhoneNumberTypeMetaName').val().length > 0 ) {
					$('#actorDatasetsPhoneNumberTypeMetaSubmitButton').prop('disabled', false);
					$('#actorDatasetsPhoneNumberTypeMetaSubmitButton').removeAttr('disabled');
				} else {
					$('#actorDatasetsPhoneNumberTypeMetaSubmitButton').prop('disabled', true);
					$('#actorDatasetsPhoneNumberTypeMetaSubmitButton').attr('disabled');
				}
			});
		},

		initMemberOfCollectives: function() {
			$('#actorTabMemberOfCollectives').on('click', function(event) {
				let actor = $('#actorFormMetadata').data('actor');
				let type = $('#actorFormMetadata').data('type');
				let name = actor.model.displayName.name;
				let id = actor.model.id;
				TIMAAT.UI.displayDataSetContentArea('actorFormMemberOfCollectives');
				TIMAAT.ActorDatasets.setPersonIsMemberOfCollectiveList(actor, type);
				TIMAAT.UI.displayDataSetContent('memberOfCollectives', actor, 'actor');
				if ( type == 'actor') {
					TIMAAT.URLHistory.setURL(null, name + ' ?? Member of Collectives ?? ' + type[0].toUpperCase() + type.slice(1), '#actor/' + id + '/memberOfCollectives');
				} else {
					TIMAAT.URLHistory.setURL(null, name + ' ?? Member of Collectives ?? ' + type[0].toUpperCase() + type.slice(1), '#actor/' + type + '/' + id + '/memberOfCollectives');
				}
			});

			// add membership button click
			// $(document).on('click','[data-role="newPersonIsMemberOfCollectiveFields"] > .form-group [data-role="add"]', async function(event) {
			$(document).on('click','.addActorMemberOfCollectiveButton', async function(event) {
					// console.log("TCL: MemberOfCollective form: add new membership");
				event.preventDefault();
				var listEntry = $(this).closest('[data-role="newPersonIsMemberOfCollectiveFields"]');
				var newFormEntry = [];
				var newEntryId = null;
				if (listEntry.find('select').each(function(){
					newEntryId = Number($(this).val());
				}));
				if (listEntry.find('input').each(function(){
					newFormEntry.push($(this).val());
				}));
				// console.log("TCL: newFormEntry", newFormEntry);

				if (!$('#actorFormMemberOfCollectives').valid()) {
					return false;
				}
				var actor = $('#actorFormMetadata').data('actor');
				var type = actor.model.actorType.actorTypeTranslations[0].type;

				$('.actorDatasetsActorMemberOfCollectiveActorId').prop('disabled', false);
				$('.disableOnSubmit').prop('disabled', true);
				var existingEntriesInForm = $('#actorFormMemberOfCollectives').serializeArray();
				$('.disableOnSubmit').prop('disabled', false);
				// console.log("TCL: existingEntriesInForm", existingEntriesInForm);

				// create list of collectiveIds that the person is is already a member of
				var existingEntriesIdList = [];
				var i = 0;
				for (; i < existingEntriesInForm.length; i++) {
					if (existingEntriesInForm[i].name == "actorId") {
						existingEntriesIdList.push(Number(existingEntriesInForm[i].value));
					}
				}
				existingEntriesIdList.pop(); // remove new membership collective/person id
				// console.log("TCL: existingEntriesIdList", existingEntriesIdList);
				// check for duplicate person-collective relation. only one allowed
				var duplicate = false;
				i = 0;
				while (i < existingEntriesIdList.length) {
					if (newEntryId == existingEntriesIdList[i]) {
						duplicate = true;
						// console.log("TCL: duplicate entry found");
						break;
					}
					// console.log("TCL: newEntryId", newEntryId);
					// console.log("TCL: existingEntriesIdList[i]", existingEntriesIdList[i]);
					i++;
				}

				if (!duplicate) {
					var newEntryDetails = [];
					i = 0;
					var j = 0;
					for (; j < newFormEntry.length -3; i++) { // -3 for empty fields of new entry that is not added yet
						newEntryDetails[i] = {
							actorPersonActorId: (type == 'person') ? actor.model.id : newEntryId,
							memberOfActorCollectiveActorId: (type == 'person') ? newEntryId : actor.model.id,
							id: Number(newFormEntry[j]), // == 0
							joinedAt: newFormEntry[j+1],
							leftAt: newFormEntry[j+2]
						};
            // console.log("TCL: newEntryDetails[i]", newEntryDetails[i]);
						j += 3;
					}
					let actorName = await TIMAAT.ActorService.getActorName(newEntryId);
					var appendNewFormDataEntry = TIMAAT.ActorDatasets.appendMemberOfCollectiveDataset(existingEntriesIdList.length, newEntryId, actorName, newEntryDetails, 'sr-only', true);
					$('#dynamicPersonIsMemberOfCollectiveFields').append(appendNewFormDataEntry);
					$('.actorDatasetsActorMemberOfCollectiveActorId').prop('disabled', true);

					$('[data-role="newPersonIsMemberOfCollectiveFields"]').find('[data-role="memberOfCollectiveDetailsEntry"]').remove();
					if (listEntry.find('input').each(function(){
						$(this).val('');
					}));
					if (listEntry.find('select').each(function(){
						$(this).val('');
					}));
					$('.actorDatasetsActorMemberOfCollectivesJoinedAt').datetimepicker({timepicker: false, changeMonth: true, changeYear: true, scrollInput: false, format: 'YYYY-MM-DD', yearStart: 1900, yearEnd: new Date().getFullYear()});
					$('.actorDatasetsActorMemberOfCollectivesLeftAt').datetimepicker({timepicker: false, changeMonth: true, changeYear: true, scrollInput: false, format: 'YYYY-MM-DD', yearStart: 1900, yearEnd: new Date().getFullYear()});

					// only needed when changes have to be saved immediately
					// await TIMAAT.ActorDatasets.addPersonIsMemberOfCollective(actor.model.id, newMemberOfCollectiveEntry);
					// actor.updateUI();
					// TIMAAT.ActorDatasets.actorFormMemberOfCollectives('edit', type, actor);
				}
				else { // duplicate collective
					$('#actorDatasetsMemberOfCollectiveDuplicateModal').modal('show');
				}
			});

			// add membership detail button click
			// $(document).on('click', '.form-group [data-role="addMembershipDetails"]', async function(event) {
			$(document).on('click', '.addMembershipDetailsButton', async function(event) {
						// console.log("TCL: MemberOfCollective form: add details to membership");
				event.preventDefault();
				var listEntry = $(this).closest('[data-role="newPersonIsMemberOfCollectiveDetailsFields"]');
				var newMemberOfCollectiveData = [];
				var actorId = $(this).closest(('[data-role="personIsMemberOfCollectiveEntry"]')).attr("data-actor-id");
				if (listEntry.find('input').each(function(){
					newMemberOfCollectiveData.push($(this).val());
				}));
				// console.log("TCL: newMemberOfCollectiveData", newMemberOfCollectiveData);
				if (newMemberOfCollectiveData[1] == "" && newMemberOfCollectiveData[2] == "") { // [0] is hidden id field
					// console.log("no data entered");
					return false; // don't add if all add fields were empty
				}
				var newMembershipDetailsEntry = {
					id: 0,
					joinedAt: newMemberOfCollectiveData[1],
					leftAt: newMemberOfCollectiveData[2]
				};
				var dataId = $(this).closest('[data-role="personIsMemberOfCollectiveEntry"]').attr('data-id');
				var dataDetailsId = $(this).closest('[data-role="newPersonIsMemberOfCollectiveDetailsFields"]').attr("data-details-id");
				$(this).closest('[data-role="newPersonIsMemberOfCollectiveDetailsFields"]').before(TIMAAT.ActorDatasets.appendMemberOfCollectiveDetailFields(dataId, dataDetailsId, actorId, newMembershipDetailsEntry, 'sr-only'));

				$('[data-role="actorId['+actorId+']"]').find('option[value='+actorId+']').attr('selected', true);
				if (listEntry.find('input').each(function(){
					$(this).val('');
				}));
				if (listEntry.find('select').each(function(){
					$(this).val('');
				}));
				$('.actorDatasetsActorMemberOfCollectivesJoinedAt').datetimepicker({timepicker: false, changeMonth: true, changeYear: true, scrollInput: false, format: 'YYYY-MM-DD', yearStart: 1900, yearEnd: new Date().getFullYear()});
				$('.actorDatasetsActorMemberOfCollectivesLeftAt').datetimepicker({timepicker: false, changeMonth: true, changeYear: true, scrollInput: false, format: 'YYYY-MM-DD', yearStart: 1900, yearEnd: new Date().getFullYear()});
			});

			// remove member of collective button click
			// $(document).on('click','[data-role="dynamicPersonIsMemberOfCollectiveFields"] > .form-group [data-role="remove"]', async function(event) {
			$(document).on('click','.removeActorMemberOfCollectiveButton', async function(event) {
					// console.log("TCL: MemberOfCollective form: remove membership");
				event.preventDefault();
				$(this).closest('.form-group').remove();
			});

			// remove membership detail button click
			// $(document).on('click','.form-group [data-role="removeMembershipDetails"]', async function(event) {
			$(document).on('click','.removeMembershipDetails', async function(event) {
					// console.log("TCL: MemberOfCollective form: remove details");
				event.preventDefault();
				$(this).closest('.form-group').remove();
			});

			// submit actor member of collectives button functionality
			$('#actorFormMemberOfCollectivesSubmitButton').on('click', async function(event) {
				// console.log("TCL: MemberOfCollective form: submit");
				// add rules to dynamically added form fields
				event.preventDefault();
				var node = document.getElementById("newPersonIsMemberOfCollectiveFields");
				while (node.lastChild) {
					node.removeChild(node.lastChild);
				}
				// the original actor model (in case of editing an existing actor)
				var actor = $('#actorFormMetadata').data('actor');
				var type = actor.model.actorType.actorTypeTranslations[0].type;

				// test if form is valid
				if (!$('#actorFormMemberOfCollectives').valid()) {
					$('[data-role="newPersonIsMemberOfCollectiveFields"]').append(TIMAAT.ActorDatasets.appendNewMemberOfCollectiveField());
					var listType = (type == 'person') ? 'collective' : 'person'; // person needs collective entries and vice versa
					$('#actorSelectDropdown').select2({
						closeOnSelect: true,
						scrollAfterSelect: true,
						allowClear: true,
						ajax: {
							url: 'api/actor/'+listType+'/selectList/',
							type: 'GET',
							dataType: 'json',
							delay: 250,
							headers: {
								"Authorization": "Bearer "+TIMAAT.Service.token,
								"Content-Type": "application/json",
							},
							// additional parameters
							data: function(params) {
								// console.log("TCL: data: params", params);
								return {
									search: params.term,
									page: params.page
								};
							},
							processResults: function(data, params) {
								// console.log("TCL: processResults: data", data);
								params.page = params.page || 1;
								return {
									results: data
								};
							},
							cache: false
						},
						minimumInputLength: 0,
					});
					return false;
				}

				// create/edit actor window submitted data
				$('.actorDatasetsActorMemberOfCollectiveActorId').prop('disabled', false);
				$('.disableOnSubmit').prop('disabled', true);
				var formData = $('#actorFormMemberOfCollectives').serializeArray();
				$('.disableOnSubmit').prop('disabled', false);
        // console.log("TCL: formData", formData);
				var formEntries = [];
				var formEntryIds = []; // List of all collectives containing membership data for this actor
				var formEntriesIdIndexes = []; // Index list of all collectiveIds/personIds and number of detail sets
				var i = 0;
				for (; i < formData.length; i++) {
					if (formData[i].name == 'actorId') {
						formEntriesIdIndexes.push({entryIndex: i, numDetailSets: 0});
					}
				}
				var numDetailElements = 3; // hidden membershipDetailId, joinedAt, leftAt
				i = 0;
				for (; i < formEntriesIdIndexes.length; i++) {
					if (i < formEntriesIdIndexes.length -1) {
						formEntriesIdIndexes[i].numDetailSets = (formEntriesIdIndexes[i+1].entryIndex - formEntriesIdIndexes[i].entryIndex - 2) / numDetailElements;
					} else { // last entry has to be calculated differently
						formEntriesIdIndexes[i].numDetailSets = (formData.length - formEntriesIdIndexes[i].entryIndex - 2) / numDetailElements;
					}
				}
				i = 0;
				for (; i < formEntriesIdIndexes.length; i++) {
						var element = {
							actorId: (type == 'person') ? actor.model.id : Number(formData[formEntriesIdIndexes[i].entryIndex].value),
							collectiveId: (type == 'person') ? Number(formData[formEntriesIdIndexes[i].entryIndex].value) : actor.model.id,
							membershipDetails: []
						};
						formEntryIds.push(Number(formData[formEntriesIdIndexes[i].entryIndex].value));
					var j = 0;
					for (; j < formEntriesIdIndexes[i].numDetailSets; j++) {
						var details = {
							id: Number(formData[formEntriesIdIndexes[i].entryIndex+numDetailElements*j+2].value),
							joinedAt: moment.utc(formData[formEntriesIdIndexes[i].entryIndex+numDetailElements*j+3].value, "YYYY-MM-DD"),
							leftAt: moment.utc(formData[formEntriesIdIndexes[i].entryIndex+numDetailElements*j+4].value, "YYYY-MM-DD"),
							role: null
						};
						element.membershipDetails.push(details);
            // console.log("TCL: details", details);
					}
					formEntries.push(element);
				}
				// create collective/person id list for all already existing memberships
				i = 0;
				var existingEntriesIdList = [];
				switch (type) {
					case 'person':
						for (; i < actor.model.actorPerson.actorPersonIsMemberOfActorCollectives.length; i++) {
							existingEntriesIdList.push(actor.model.actorPerson.actorPersonIsMemberOfActorCollectives[i].id.memberOfActorCollectiveActorId);
						}
					break;
					case 'collective':
						for (; i < actor.model.actorCollective.actorPersonIsMemberOfActorCollectives.length; i++) {
							existingEntriesIdList.push(actor.model.actorCollective.actorPersonIsMemberOfActorCollectives[i].id.actorPersonActorId);
						}
					break;
				}
				// DELETE memberOfCollective data if id is in existingEntriesIdList but not in formEntryIds
				i = 0;
				for (; i < existingEntriesIdList.length; i++) {
					// console.log("TCL: check for DELETE COLLECTIVE: ", existingEntriesIdList[i]);
					var j = 0;
					var deleteDataset = true;
					for (; j < formEntryIds.length; j ++) {
						if (existingEntriesIdList[i] == formEntryIds[j]) {
							deleteDataset = false;
							break; // no need to check further if match was found
						}
					}
					if (deleteDataset) {
						switch (type) {
							case 'person':
								await TIMAAT.ActorService.removeMemberOfCollective(actor.model.actorPerson.actorPersonIsMemberOfActorCollectives[i]);
								actor.model.actorPerson.actorPersonIsMemberOfActorCollectives.splice(i,1); // TODO should be moved to ActorDatasets.removeMemberOfCollective(..)
							break;
							case 'collective':
								await TIMAAT.ActorService.removeMemberOfCollective(actor.model.actorCollective.actorPersonIsMemberOfActorCollectives[i]);
								actor.model.actorCollective.actorPersonIsMemberOfActorCollectives.splice(i,1); // TODO should be moved to ActorDatasets.removeMemberOfCollective(..)
							break;
						}
						existingEntriesIdList.splice(i,1);
						i--; // so the next list item is not jumped over due to the splicing
					}
				}
				// ADD memberOfCollective data if id is not in existingEntriesIdList but in formEntryIds
				i = 0;
				for (; i < formEntryIds.length; i++) {
					var j = 0;
					var datasetExists = false;
					for (; j < existingEntriesIdList.length; j++) {
						if (formEntryIds[i] == existingEntriesIdList[j]) {
							datasetExists = true;
							break; // no need to check further if match was found
						}
					}
					if (!datasetExists) {
						await TIMAAT.ActorDatasets.addPersonIsMemberOfCollective(actor, formEntries[i]);
						formEntryIds.splice(i,1);
						formEntries.splice(i,1);
						i--; // so the next list item is not jumped over due to the splicing
					}
				}
				//* the splicing in remove and add sections reduced both id lists to the same entries remaining to compute
				// UPDATE memberOfCollective data if id is in existingEntriesIdList and in formEntryIds
				i = 0;
				for (; i < existingEntriesIdList.length; i++) {
					// console.log("TCL: check for UPDATE COLLECTIVE: ", existingEntriesIdList[i]);
					// find corresponding actorPersonIsMemberOfActorCollectives id/index
					var currentMemberOfCollectiveIndex = -1;
					var j = 0;
					switch (type) {
						case 'person':
							for (; j < actor.model.actorPerson.actorPersonIsMemberOfActorCollectives.length; j++) {
								if (existingEntriesIdList[i] == actor.model.actorPerson.actorPersonIsMemberOfActorCollectives[j].id.memberOfActorCollectiveActorId) {
									currentMemberOfCollectiveIndex = j;
									break; // no need to check further if index was found
								}
							}
							var currentMemberOfCollective = actor.model.actorPerson.actorPersonIsMemberOfActorCollectives[currentMemberOfCollectiveIndex];
							// var currentMemberOfCollectiveId = actor.model.actorPerson.actorPersonIsMemberOfActorCollectives[currentMemberOfCollectiveIndex].id.memberOfActorCollectiveActorId;
						break;
						case 'collective':
							for (; j < actor.model.actorCollective.actorPersonIsMemberOfActorCollectives.length; j++) {
								if (existingEntriesIdList[i] == actor.model.actorCollective.actorPersonIsMemberOfActorCollectives[j].id.actorPersonActorId) {
									currentMemberOfCollectiveIndex = j;
									break; // no need to check further if index was found
								}
							}
							var currentMemberOfCollective = actor.model.actorCollective.actorPersonIsMemberOfActorCollectives[currentMemberOfCollectiveIndex];
							// var currentMemberOfCollectiveId = actor.model.actorCollective.actorPersonIsMemberOfActorCollectives[currentMemberOfCollectiveIndex].id.actorPersonActorId;
						break;
					}
					// go through all membershipDetails and update/delete/add entries
					// create membershipDetail id list for all already existing memberships with this collective
					var existingMembershipDetailIdList = [];
					j = 0;
					for (; j < currentMemberOfCollective.membershipDetails.length; j++) {
						existingMembershipDetailIdList.push(currentMemberOfCollective.membershipDetails[j].id);
					}
					// create membershipDetail id list for all form memberships for this collective
					var formMembershipDetailIdList = [];
					j = 0;
					for (; j < formEntries[i].membershipDetails.length; j++ ) {
						formMembershipDetailIdList.push(formEntries[i].membershipDetails[j].id);
					}
					// DELETE membershipDetail data if id is in existingMembershipDetailIdList but not in membershipDetails of formEntries
					j = 0;
					for (; j < existingMembershipDetailIdList.length; j++) {
						var k = 0;
						var deleteDataset = true;
						for (; k < formMembershipDetailIdList.length; k++) { // 'j' since both collective id lists match after delete and add memberOfCollective operations
							if (existingMembershipDetailIdList[j] == formMembershipDetailIdList[k]) {
								deleteDataset = false;
								break; // no need to check further if match was found
							}
						}
						if (deleteDataset) {
							switch (type) {
								case 'person':
									await TIMAAT.ActorService.removeMembershipDetails(actor.model.actorPerson.actorPersonIsMemberOfActorCollectives[i].membershipDetails[j]);
									actor.model.actorPerson.actorPersonIsMemberOfActorCollectives[i].membershipDetails.splice(j,1); // TODO should be moved to ActorDatasets.removeMembershipDetail(..)
								break;
								case 'collective':
									await TIMAAT.ActorService.removeMembershipDetails(actor.model.actorCollective.actorPersonIsMemberOfActorCollectives[i].membershipDetails[j]);
									actor.model.actorCollective.actorPersonIsMemberOfActorCollectives[i].membershipDetails.splice(j,1); // TODO should be moved to ActorDatasets.removeMembershipDetail(..)
								break;
							}
							existingMembershipDetailIdList.splice(j,1);
							j--; // so the next list item is not jumped over due to the splicing
						}
					}
					// console.log("TCL: DELETE membershipDetail (end)");
					// ADD membershipDetail data if id is not in existingMembershipDetailIdList but in membershipDetails of formEntries
					j = 0;
					var newMembershipDetails;
					for (; j < formMembershipDetailIdList.length; j++) {
						if (formMembershipDetailIdList[j] == 0) {
							switch (type) {
								case 'person':
									newMembershipDetails = await TIMAAT.ActorService.addMembershipDetails(actor.model.id, formEntries[i].collectiveId, formEntries[i].membershipDetails[j]);
									actor.model.actorPerson.actorPersonIsMemberOfActorCollectives[i].membershipDetails.push(newMembershipDetails);
								break;
								case 'collective':
									newMembershipDetails = await TIMAAT.ActorService.addMembershipDetails(formEntries[i].actorId, actor.model.id, formEntries[i].membershipDetails[j]);
									actor.model.actorCollective.actorPersonIsMemberOfActorCollectives[i].membershipDetails.push(newMembershipDetails);
								break;
							}
							formMembershipDetailIdList.splice(j,1);
							j--; // so the next list item is not jumped over due to the splicing
						}
					}
					//* the splicing in remove and add sections reduced both id lists to the same entries remaining to compute
					// UPDATE membershipDetail data if id is in existingMembershipDetailIdList and in membershipDetails of formEntries
					j = 0;
					for (; j < existingMembershipDetailIdList.length; j++) {
						await TIMAAT.ActorService.updateMembershipDetails(formEntries[i].membershipDetails[j]);
						switch (type) {
							case 'person':
								actor.model.actorPerson.actorPersonIsMemberOfActorCollectives[i].membershipDetails[j] = formEntries[i].membershipDetails[j];
							break;
							case 'collective':
								actor.model.actorCollective.actorPersonIsMemberOfActorCollectives[i].membershipDetails[j] = formEntries[i].membershipDetails[j];
							break;
						}
					}
				}
				// actor.updateUI();
				if ($('#actorTab').hasClass('active')) {
					await TIMAAT.UI.refreshDataTable('actor');
				} else {
					await TIMAAT.UI.refreshDataTable(type);
				}
				// console.log("TCL: show actor memberOfCollective form");
				TIMAAT.UI.displayDataSetContent('memberOfCollectives', actor, 'actor');
			});

			// cancel add/edit button in memberOfCollective form functionality
			$('#actorFormMemberOfCollectivesDismissButton').on('click', function(event) {
				let actor = $('#actorFormMemberOfCollectives').data('actor');
				TIMAAT.UI.displayDataSetContent('memberOfCollectives', actor, 'actor');
			});

		},

		initRoles: function() {
			// nav-bar functionality
			$('#actorTabRoles').on('click', function(event) {
				let actor = $('#actorFormMetadata').data('actor');
				let type = $('#actorFormMetadata').data('type');
				let name = actor.model.displayName.name;
				let id = actor.model.id;
				TIMAAT.UI.displayDataSetContentArea('actorFormRoles');
				TIMAAT.UI.displayDataSetContent('roles', actor, 'actor');
				if ( type == 'actor') {
					TIMAAT.URLHistory.setURL(null, name + ' ?? Roles ?? ' + type[0].toUpperCase() + type.slice(1), '#actor/' + id + '/roles');
				} else {
					TIMAAT.URLHistory.setURL(null, name + ' ?? Roles ?? ' + type[0].toUpperCase() + type.slice(1), '#actor/' + type + '/' + id + '/roles');
				}
			});

			// actor role form handlers
			// submit actor role button functionality
			$('#actorFormRolesSubmitButton').on('click', async function(event) {
				// continue only if client side validation has passed
				event.preventDefault();
				// if (!$('#actorFormRoles').valid()) return false;

				// the original actor model (in case of editing an existing actor)
				var actor = $('#actorFormMetadata').data('actor');
        // console.log("TCL: actor", actor);

				// create/edit role window submitted data
				var formSelectData = $('#actorFormRoles').serializeArray();
        // console.log("TCL: formSelectData", formSelectData);
        // console.log("TCL: formData", formData);
        // var formDataObject = {};
        // $(formData).each(function(i, field){
				// 	formDataObject[field.name] = field.value;
        // });
        // // delete formDataObject.roleId;
        // console.log("TCL: formDataObject", formDataObject);
        // var formSelectData = formData;
        // formSelectData.splice(0,1); // remove entries not part of multi select data
        // console.log("TCL: formSelectData", formSelectData);
        // create proper id list
        var i = 0;
        var roleIdList = [];
        for (; i < formSelectData.length; i++) {
          roleIdList.push( {id: formSelectData[i].value})
        }
        // console.log("TCL: roleIdList", roleIdList);

				// update actor
				let actorModel = actor.model;
				await TIMAAT.ActorDatasets.updateActorHasRole(actorModel, roleIdList);
				// actor.updateUI();
				TIMAAT.UI.displayDataSetContent('roles', actor, 'actor');
			});

			// cancel add/edit button in actor roles form functionality
			$('#actorFormRolesDismissButton').on('click', function(event) {
				let actor = $('#actorFormMetadata').data('actor');
				TIMAAT.UI.displayDataSetContent('roles', actor, 'actor');
			});

		},

		initRoleMedium: function() {
			// nav-bar functionality
			$('#actorTabRoleInMedium').on('click', function(event) {
				let actor = $('#actorFormMetadata').data('actor');
				let type = $('#actorFormMetadata').data('type');
				let name = actor.model.displayName.name;
				let id = actor.model.id;
				TIMAAT.UI.displayDataSetContentArea('actorFormActorRoleInMedium');
				TIMAAT.ActorDatasets.setActorHasAddressList(actor);
				TIMAAT.UI.displayDataSetContent('rolesInMedia', actor, 'actor');
				if ( type == 'actor') {
					TIMAAT.URLHistory.setURL(null, name + ' ?? Roles in Media ?? ' + type[0].toUpperCase() + type.slice(1), '#actor/' + id + '/rolesInMedia');
				} else {
					TIMAAT.URLHistory.setURL(null, name + ' ?? Roles in Media ?? ' + type[0].toUpperCase() + type.slice(1), '#actor/' + type + '/' + id + '/rolesInMedia');
				}
			});

			// actor role medium form handlers
			// submit actor role medium button functionality
			$('#actorFormActorRoleInMediumSubmitButton').on('click', async function(event) {
				// continue only if client side validation has passed
				event.preventDefault();
				// if (!$('#actorFormRoles').valid()) return false;

				// the original actor model (in case of editing an existing actor)
				var actor = $('#actorFormMetadata').data('actor');
        // console.log("TCL: actor", actor);

				// create/edit role medium window submitted data
				var formSelectData = $('#actorFormActorRoleInMedium').serializeArray();
        // console.log("TCL: formSelectData", formSelectData);
        // console.log("TCL: formData", formData);
        // var formDataObject = {};
        // $(formData).each(function(i, field){
				// 	formDataObject[field.name] = field.value;
        // });
        // // delete formDataObject.roleId;
        // console.log("TCL: formDataObject", formDataObject);
        // var formSelectData = formData;
        // formSelectData.splice(0,1); // remove entries not part of multi select data
        // console.log("TCL: formSelectData", formSelectData);
        // create proper id list
        var i = 0;
        var mediumIdList = [];
        for (; i < formSelectData.length; i++) {
          mediumIdList.push( { id: Number(formSelectData[i].value) })
        }
        // console.log("TCL: mediumIdList", mediumIdList);
				// TODO currently only Producer (5) is checked. Change once other roles have to be altered here
				// var roleId = 5;
				// update actor
				await TIMAAT.ActorDatasets.updateActorRoleInMedium(actor.model, mediumIdList, 5); // TODO once more than one Producer can be assigned, a list of role ids is required here
				// actor.updateUI();
				TIMAAT.UI.displayDataSetContent('rolesInMedia', actor, 'actor');
			});

			// cancel add/edit button in actor role medium form functionality
			$('#actorFormActorRoleInMediumDismissButton').on('click', function(event) {
				let actor = ('#actorFormMetadata').data('actor');
				TIMAAT.UI.displayDataSetContent('rolesInMedia', actor, 'actor');
			});

		},

		load: function() {
			this.loadActors();
			this.loadActorTypes();
			this.loadAddressTypes();
			this.loadEmailAddressTypes();
			this.loadPhoneNumberTypes();
		},

		loadActorTypes: function() {
    	// console.log("TCL: loadActorTypes: function()");
			TIMAAT.ActorService.listActorTypes(this.setActorTypeList);
		},

		loadActors: function() {
			$('#actorFormMetadata').data('type', 'actor');
			TIMAAT.UI.addSelectedClassToSelectedItem('actor', null);
			TIMAAT.UI.subNavTab = 'dataSheet';
			this.setActorList();
		},

		loadActorDataTables: async function() {
			this.setupActorDataTable();
			this.setupPersonDataTable();
			this.setupCollectiveDataTable();
		},

		loadActorSubtype: function(type) {
			$('#actorFormMetadata').data('type', type);
			TIMAAT.UI.addSelectedClassToSelectedItem(type, null);
			TIMAAT.UI.subNavTab = 'dataSheet';
			this.showAddActorButton();
			switch (type) {
				case 'person':
					this.setPersonList();
					break;
				case 'collective':
					this.setCollectiveList();
					break;
			}
		},

		loadAddressTypes: function() {
			TIMAAT.ActorService.listAddressTypes(this.setAddressTypeList);
		},

		loadEmailAddressTypes: function() {
			TIMAAT.ActorService.listEmailAddressTypes(this.setEmailAddressTypeList);
		},

		loadPhoneNumberTypes: function() {
			TIMAAT.ActorService.listPhoneNumberTypes(this.setPhoneNumberTypeList);
		},

		setActorTypeList: function(actorTypes) {
			// console.log("TCL: actorTypes", actorTypes);
			if ( !actorTypes ) return;
			// setup model
			var actTypes = Array();
			actorTypes.forEach(function(actorType) {
				if ( actorType.id > 0 )
					actTypes.push(new TIMAAT.ActorType(actorType));
			});
			TIMAAT.ActorDatasets.actorTypes = actTypes;
			TIMAAT.ActorDatasets.actorTypes.model = actorTypes;
		},

		setActorList: function() {
			if ( this.actors == null ) return;
			if ( this.dataTableActor ) {
				this.dataTableActor.ajax.reload(null, false);
				TIMAAT.UI.clearLastSelection('actor');
			}
			this.actorsLoaded = true;
		},

		setPersonList: function() {
			if ( this.persons == null) return;
			if ( this.dataTablePerson ) {
				this.dataTablePerson.ajax.reload(null, false);
				TIMAAT.UI.clearLastSelection('person');
			}
		},

		setCollectiveList: function() {
			if ( this.collectives == null ) return;
			if ( this.dataTableCollective ) {
				this.dataTableCollective.ajax.reload(null, false);
				TIMAAT.UI.clearLastSelection('collective');
			}
		},

		setActorNameList: function(actor) {
			// console.log("TCL: setActorNameList -> actor", actor);
			if ( !actor ) return;
			// setup model
			var names = Array();
			actor.model.actorNames.forEach(function(name) {
				if ( name.id > 0 )
					names.push(name);
			});
			this.names = names;
		},

		setActorHasAddressList: function(actor) {
			// console.log("TCL: setActorHasAddressList -> actor", actor);
			if ( !actor ) return;
			// setup model
			var actorHasAddresses = Array();
			actor.model.actorHasAddresses.forEach(function(actorHasAddress) {
				if ( actorHasAddress.id.actorId > 0 && actorHasAddress.id.addressId > 0 )
				// actorHasAddress.address.street = "TEMP NAME";
				// actorHasAddress.address.city = "TEMP NAME";
				actorHasAddresses.push(actorHasAddress);
			});
			this.actorHasAddresses = actorHasAddresses;
		},

		setActorHasEmailAddressList: function(actor) {
			// console.log("TCL: setActorHasEmailAddressList -> actor", actor);
			if ( !actor ) return;
			// setup model
			var actorHasEmailAddresses = Array();
			actor.model.actorHasEmailAddresses.forEach(function(actorHasEmailAddress) {
				if ( actorHasEmailAddress.id.actorId > 0 && actorHasEmailAddress.id.emailAddressId > 0 )
				actorHasEmailAddresses.push(actorHasEmailAddress);
			});
			this.actorHasEmailAddresses = actorHasEmailAddresses;
		},

		setActorHasPhoneNumberList: function(actor) {
			// console.log("TCL: setActorHasPhoneNumberList -> actor", actor);
			if ( !actor ) return;
			// setup model
			var actorHasPhoneNumbers = Array();
			actor.model.actorHasPhoneNumbers.forEach(function(actorHasPhoneNumber) {
				if ( actorHasPhoneNumber.id.actorId > 0 && actorHasPhoneNumber.id.emailAddressId > 0 )
				actorHasPhoneNumbers.push(actorHasPhoneNumber);
			});
			this.actorHasPhoneNumbers = actorHasPhoneNumbers;
		},

		setPersonIsMemberOfCollectiveList: function(actor, type) {
    	// console.log("TCL ~ $ ~ actor, type", actor, type);
			if ( !actor ) return;
			// setup model
			var actorIsMOfCs = Array();
			switch (type) {
				case 'person':
					actor.model.actorPerson.actorPersonIsMemberOfActorCollectives.forEach(function(personIsMemberOfCollective) {
						if ( personIsMemberOfCollective.id.actorPersonActorId > 0 && personIsMemberOfCollective.id.memberOfActorCollectiveActorId > 0 )
						actorIsMOfCs.push(personIsMemberOfCollective);
					});
				break;
				case 'collective':
					actor.model.actorCollective.actorPersonIsMemberOfActorCollectives.forEach(function(personIsMemberOfCollective) {
						if ( personIsMemberOfCollective.id.actorPersonActorId > 0 && personIsMemberOfCollective.id.memberOfActorCollectiveActorId > 0 )
						actorIsMOfCs.push(personIsMemberOfCollective);
					});
				break;
			}
			this.personIsMemberOfCollectives = actorIsMOfCs;
		},

		// TODO
		setCitizenshipsList: function(actor) {

		},

		setAddressTypeList: function(addressTypes) {
			// console.log("TCL: setAddressTypeList -> addressTypes", addressTypes);
			if ( !addressTypes ) return;
			// setup model
			var addrTypes = Array();
			addressTypes.forEach(function(addressType) {
				if ( addressType.id > 0 )
					addrTypes.push(addressType);
			});
			TIMAAT.ActorDatasets.addressTypes = addrTypes;
		},

		setEmailAddressTypeList: function(emailAddressTypes) {
			// console.log("TCL: setAddressTypeList -> emailAddressTypes", emailAddressTypes);
			if ( !emailAddressTypes ) return;
			// setup model
			var emailAddrTypes = Array();
			emailAddressTypes.forEach(function(emailAddressType) {
				if ( emailAddressType.id > 0 )
					emailAddrTypes.push(emailAddressType);
			});
			TIMAAT.ActorDatasets.emailAddressTypes = emailAddrTypes;
		},

		setPhoneNumberTypeList: function(phoneNumberTypes) {
			// console.log("TCL: setPhoneNumberTypeList -> phoneNumberTypes", phoneNumberTypes);
			if ( !phoneNumberTypes ) return;
			// setup model
			var types = Array();
			phoneNumberTypes.forEach(function(phoneNumberType) {
				if ( phoneNumberType.id > 0 )
					types.push(phoneNumberType);
			});
			TIMAAT.ActorDatasets.phoneNumberTypes = types;
		},

		addActor: function(type) {
			// console.log("TCL: addActor: type", type);
			TIMAAT.UI.displayDataSetContentContainer('actorTabMetadata', 'actorFormMetadata');
			this.hideAddActorButton();
			$('#actorFormMetadata').data('type', type);
			$('#actorFormMetadata').data('actor', null);
			$('#personSexTypeSelectDropdown').empty().trigger('change');
			actorFormMetadataValidator.resetForm();

			$('.carousel-inner').empty();
			$('.carousel-indicators').empty();
			var node = document.getElementById("actorFormDataSheetProfileImageSelection");
			while (node.lastChild) {
				node.removeChild(node.lastChild);
			}

			TIMAAT.UI.addSelectedClassToSelectedItem(type, null);
			TIMAAT.UI.subNavTab = 'dataSheet';
			$('#actorFormMetadata').trigger('reset');

			// setup form
			this.initFormDataSheetData(type);
			if (type == 'person') {
				this.getActorFormDataSheetPersonSexDropdownData();
			}
			// this.getActorFormImageDropdownData();
			this.initFormDataSheetForEdit(type);
			$('#actorFormMetadataSubmitButton').html('Add');
			$('#actorFormHeader').html("Add "+type);

			$('#dynamicProfileImageFields').hide();
			$('#dynamicProfileImageFieldsPlaceholder').show();
			$('.carousel-item').first().addClass('active');
			$('.carousel-indicators > li').first().addClass('active');
			$('#dynamicProfileImageFields').carousel();
			// $('#actorDatasetsMetadataActorIsFictional').prop('checked', false);
		},

		actorFormDataSheet: async function(action, type, data) {
			// console.log("TCL: actorFormDataSheet - action, type, data: ", action, type, data);
			$('.carousel-inner').empty();
			$('.carousel-indicators').empty();
			var node = document.getElementById("actorFormDataSheetProfileImageSelection");
			while (node.lastChild) {
				node.removeChild(node.lastChild);
			}
			$('#actorFormMetadata').trigger('reset');

			if (data.model.profileImages.length == 0) {
				$('#dynamicProfileImageFields').hide();
				$('#dynamicProfileImageFieldsPlaceholder').show();
			} else {
				$('#dynamicProfileImageFieldsPlaceholder').hide();
				$('#dynamicProfileImageFields').show();
				var i = 0;
				for (; i < data.model.profileImages.length; i++) {
					// console.log("TCL: data.model.profileImages["+i+"]", data.model.profileImages[i]);
					let viewToken = await TIMAAT.MediumService.getViewToken(data.model.profileImages[i].mediumId);
					$(`<div class="carousel-item"
									data-id=`+data.model.profileImages[i].mediumId+`>
							<img src="/TIMAAT/api/actor/profileImage/`+data.model.profileImages[i].mediumId+`?token=`+viewToken+`"
									class="center max-height--100 max-width--100">
						</div>`).appendTo('.carousel-inner');
					$(`<li data-target="#dynamicProfileImageFields"
								data-slide-to="`+i+`">
						</li>`).appendTo('.carousel-indicators');
				}
				let maxHeight = Math.max.apply(Math, data.model.profileImages.map(function(o) {return o.height}));
				if (maxHeight > 480)
					$('#profileImageCarouselInner').css('height', 480);
				else
					$('#profileImageCarouselInner').css('height', maxHeight);
				$('.carousel-item').first().addClass('active');
				$('.carousel-indicators > li').first().addClass('active');
				$('#dynamicProfileImageFields').carousel();
			}

			this.initFormDataSheetData(type);
			actorFormMetadataValidator.resetForm();

			// this.getActorFormImageDropdownData();
			if (type == 'person') {
				this.getActorFormDataSheetPersonSexDropdownData();
				let sexSelect = $('#personSexTypeSelectDropdown');
				let option = new Option(data.model.actorPerson.sex.sexTranslations[0].type, data.model.actorPerson.sex.id, true, true);
				sexSelect.append(option).trigger('change');
			}

			$('#actorProfileImages').removeClass('visibility--hidden').addClass('visibility--visible');

			if ( action == 'show') {
				$('#actorFormMetadata :input').prop('disabled', true);
				this.initFormForShow();
				$('#actorFormDataSheetProfileImageSelection').hide();
				$('#actorFormHeader').html(type+" Data Sheet (#"+ data.model.id+')');
				if (type == 'person') {
					$('#personSexTypeSelectDropdown').select2('destroy').attr('readonly', true);
				}
			}
			else if (action == 'edit') {
				this.initFormDataSheetForEdit(type);
				this.hideAddActorButton();
				$('#actorFormMetadataSubmitButton').html("Save");
				$('#actorFormHeader').html("Edit "+type);

				var profileImageSelect = $('#actorProfileImageMultiSelectDropdown');
				await TIMAAT.ActorService.getActorHasImageList(data.model.id).then(async function(data) {
					// console.log("TCL: then: data", data);
					if (data.length > 0) {
						let i = 0;
						let mediumList = [];
						for (; i < data.length; i++) {
							let medium = await TIMAAT.MediumService.getMedium(data[i].mediumId);
							mediumList.push(medium);
						}
						mediumList.sort((a, b) => (a.displayTitle.name > b.displayTitle.name)? 1 : -1);
						// create the options and append to Select2
						i = 0;
						for (; i < mediumList.length; i++) {
							var option = new Option(mediumList[i].displayTitle.name, mediumList[i].id, true, true);
							profileImageSelect.append(option).trigger('change');
						}
						// manually trigger the 'select2:select' event
						profileImageSelect.trigger({
							type: 'select2:select',
							params: {
								data: data
							}
						});
					}
				});
			}

			// setup UI
			if (data.model.profileImages.length == 0) {
				$('.actorFormDataSheetRemoveProfileImageButton').prop('disabled', true);
				$('.actorFormDataSheetRemoveProfileImageButton :input').prop('disabled', true);
				$('.actorFormDataSheetRemoveProfileImageButton').removeClass('btn-danger').removeClass('btn-outline').addClass('btn-secondary');
			} else if (data.model.profileImages.length >= 5) {
				$('.actorFormDataSheetAddProfileImageButton').prop('disabled', true);
				$('.actorFormDataSheetAddProfileImageButton :input').prop('disabled', true);
				$('.actorFormDataSheetAddProfileImageButton').removeClass('btn-primary').removeClass('btn-outline').addClass('btn-secondary');
			} else {
				$('.actorFormDataSheetAddProfileImageButton').prop('disabled', false);
				$('.actorFormDataSheetAddProfileImageButton :input').prop('disabled', false);
				$('.actorFormDataSheetAddProfileImageButton').removeClass('btn-secondary').addClass('btn-outline').addClass('btn-primary');
				$('.actorFormDataSheetRemoveProfileImageButton').prop('disabled', false);
				$('.actorFormDataSheetRemoveProfileImageButton :input').prop('disabled', false);
				$('.actorFormDataSheetRemoveProfileImageButton').removeClass('btn-secondary').addClass('btn-outline').addClass('btn-danger');
			}
			$('#actorDatasetsMetadataActorTypeId').val(data.model.actorType.id);
			$('#actorDatasetsMetadataActorName').val(data.model.displayName.name);
			if (data.model.displayName.usedFrom != null && !(isNaN(data.model.displayName.usedFrom)))
				$('#actorDatasetsMetadataActorNameUsedFrom').val(moment.utc(data.model.displayName.usedFrom).format('YYYY-MM-DD'));
				else $('#actorDatasetsMetadataActorNameUsedFrom').val('');
			if(data.model.displayName.usedUntil != null && !(isNaN(data.model.displayName.usedUntil)))
				$('#actorDatasetsMetadataActorNameUsedUntil').val(moment.utc(data.model.displayName.usedUntil).format('YYYY-MM-DD'));
				else $('#actorDatasetsMetadataActorNameUsedUntil').val('');
			if (data.model.isFictional)
				$('#actorDatasetsMetadataActorIsFictional').prop('checked', true);
				else $('#actorDatasetsMetadataActorIsFictional').prop('checked', false);

			// actor subtype specific data
			switch (type) {
				case 'person':
					$('#actorDatasetsMetadataPersonTitle').val(data.model.actorPerson.title);
					if (data.model.actorPerson.dateOfBirth != null && !(isNaN(data.model.actorPerson.dateOfBirth)))
						$('#actorDatasetsMetadataPersonDateOfBirth').val(moment.utc(data.model.actorPerson.dateOfBirth).format('YYYY-MM-DD'));
						else $('#actorDatasetsMetadataPersonDateOfBirth').val('');
					$('#actorDatasetsMetadataPersonPlaceOfBirth').val(data.model.actorPerson.placeOfBirth);
					if (data.model.actorPerson.dayOfDeath != null && !(isNaN(data.model.actorPerson.dayOfDeath)))
						$('#actorDatasetsMetadataPersonDayOfDeath').val(moment.utc(data.model.actorPerson.dayOfDeath).format('YYYY-MM-DD'));
						else $('#actorDatasetsMetadataPersonDayOfDeath').val('');
					$('#actorDatasetsMetadataPersonPlaceOfDeath').val(data.model.actorPerson.placeOfDeath);
					// $('#actorDatasetsMetadataPersonCitizenshipName').val(data.actorPerson.citizenships[0].citizenshipTranslations[0].name);
					$('#actorDatasetsMetadataPersonCitizenshipName').val(data.model.actorPerson.citizenship);
					$('#actorDatasetsMetadataPersonSpecialFeatures').val(data.model.actorPerson.actorPersonTranslations[0].specialFeatures);
					// TODO remove once location is properly connected
					// $('#actorDatasetsMetadataPersonPlaceOfBirth').prop('disabled', true);
					// $('#actorDatasetsMetadataPersonPlaceOfDeath').prop('disabled', true);
				break;
				case 'collective':
					if (data.model.actorCollective.founded != null && !(isNaN(data.model.actorCollective.founded)))
						$('#actorDatasetsMetadataCollectiveFounded').val(moment.utc(data.model.actorCollective.founded).format('YYYY-MM-DD'));
						else $('#actorDatasetsMetadataCollectiveFounded').val('');
					if (data.model.actorCollective.disbanded != null && !(isNaN(data.model.actorCollective.disbanded)))
						$('#actorDatasetsMetadataCollectiveDisbanded').val(moment.utc(data.model.actorCollective.disbanded).format('YYYY-MM-DD'));
						else $('#actorDatasetsMetadataCollectiveDisbanded').val('');
				break;
			}
			$('#actorFormMetadata').data('actor', data);
		},

		actorFormNames: function(action, actor) {
			// console.log("TCL: actorFormNames: action, actor", action, actor);
			var node = document.getElementById("dynamicActorNameFields");
			while (node.lastChild) {
				node.removeChild(node.lastChild);
			}
			var node = document.getElementById("newActorNameFields");
			while (node.lastChild) {
				node.removeChild(node.lastChild);
			}
			$('#actorFormNames').trigger('reset');
			actorFormNamesValidator.resetForm();

			// setup UI
			// display-name data
			var i = 0;
			var numNames = actor.model.actorNames.length;
      // console.log("TCL: actor.model.actorNames", actor.model.actorNames);
			for (; i < numNames; i++) {
				$('[data-role="dynamicActorNameFields"]').append(
					`<div class="form-group" data-role="name-entry">
						<div class="form-row">
							<div class="col-sm-1 col-md-1 text-center">
								<div class="form-check">
									<label class="sr-only" for="isDisplayName"></label>
									<input class="form-check-input isDisplayName"
												 type="radio"
												 name="isDisplayName"
												 data-role="displayName[`+actor.model.actorNames[i].id+`]"
												 placeholder="Is display name">
								</div>
							</div>
							<div class="col-sm-1 col-md-1 text-center">
								<div class="form-check">
									<label class="sr-only" for="isBirthName"></label>
									<input class="form-check-input isBirthName"
												 type="radio"
												 name="isBirthName"
												 data-role="birthName[`+actor.model.actorNames[i].id+`]"
												 data-wasChecked="true"
												 placeholder="Is birth name"">
								</div>
							</div>
							<div class="col-sm-5 col-md-5">
								<label class="sr-only">Name</label>
								<input class="form-control form-control-sm"
											 name="actorName[`+i+`]"
											 data-role="actorName[`+actor.model.actorNames[i].id+`]"
											 placeholder="[Enter name]"
											 aria-describedby="Name"
											 minlength="3"
											 maxlength="200"
											 rows="1"
											 required>
							</div>
							<div class="col-md-2">
								<label class="sr-only">Name used from</label>
								<input type="text"
											 class="form-control form-control-sm actorDatasetsActorActorNamesNameUsedFrom"
											 id="nameUsedFrom[`+i+`]"
											 name="nameUsedFrom[`+i+`]"
											 data-role="nameUsedFrom[`+actor.model.actorNames[i].id+`]"
											 placeholder="[Enter name used from]"
											 aria-describedby="Name used from">
							</div>
							<div class="col-md-2">
								<label class="sr-only">Name used until</label>
								<input type="text"
											 class="form-control form-control-sm actorDatasetsActorActorNamesNameUsedUntil"
											 id="nameUsedUntil[`+i+`]"
											 name="nameUsedUntil[`+i+`]"
											 data-role="nameUsedUntil[`+actor.model.actorNames[i].id+`]"
											 placeholder="[Enter name used until]"
											 aria-describedby="Name used until">
							</div>
							<div class="col-sm-1 col-md-1 text-center">
								<button class="form-group__button js-form-group__button removeActorNameButton btn btn-danger" data-role="remove">
									<i class="fas fa-trash-alt"></i>
								</button>
							</div>
						</div>
					</div>`
				);
				var name = actor.model.actorNames[i];
				if (actor.model.displayName.id == name.id) {
					$('[data-role="displayName['+name.id+']"]').prop('checked', true);
				}
				if (actor.model.birthName && actor.model.birthName.id == name.id) {
					$('[data-role="birthName['+name.id+']"]').prop('checked', true);
				}
				$('input[name="name['+i+']"]').rules("add", { required: true, minlength: 3, maxlength: 200 });
				$('[data-role="actorName['+name.id+']"]').attr('value', name.name);
				if (name.usedFrom != null && !(isNaN(name.usedFrom)))
					$('[data-role="nameUsedFrom['+name.id+']"]').val(moment.utc(name.usedFrom).format('YYYY-MM-DD'));
					else $('[data-role="nameUsedFrom['+name.id+']"]').val('');
				if (name.usedUntil != null && !(isNaN(name.usedUntil)))
					$('[data-role="nameUsedUntil['+name.id+']"]').val(moment.utc(name.usedUntil).format('YYYY-MM-DD'));
					else $('[data-role="nameUsedUntil['+name.id+']"]').val('');
			}
			if ( action == 'show') {
				$('#actorFormNames :input').prop('disabled', true);
				this.initFormForShow();
				$('#actorFormNamesSubmitButton').hide();
				$('#actorFormNamesDismissButton').hide();
				$('[data-role="newActorNameFields"').hide();
				$('.actorFormNameDivider').hide();
				// $('[data-role="remove"]').hide();
				// $('[data-role="add"]').hide();
				$('.js-form-group__button').hide();
				$('#actorNamesLabel').html("Actor name list");
				if (actor.model.actorType.actorTypeTranslations[0].type == "person") {
					$('#actorDisplayNameHeader').html("Display Name");
					$('#actorBirthNameHeader').html("Birth Name");
				}
				if (actor.model.actorType.actorTypeTranslations[0].type == "collective") {
					$('#actorDisplayNameHeader').html("Display Designation");
					$('#actorBirthNameHeader').html("Original Designation");
				}
			}
			else if (action == 'edit') {
				$('#actorFormNames :input').prop('disabled', false);
				this.hideFormButtons();
				$('#actorFormNamesSubmitButton').html("Save");
				$('#actorFormNamesSubmitButton').show();
				$('#actorFormNamesDismissButton').show();
				$('#actorNamesLabel').html("Edit actor name list");
				$('[data-role="newActorNameFields"').show();
				$('.actorFormNameDivider').show();
				$('#actorDatasetsMetadataActorName').focus();

				// fields for new name entry
				$('[data-role="newActorNameFields"]').append(this.appendNewNameField());
				// $('.actorNamesContainer').find('.js-form-group__button').show(); //* enable after dynamic fields are added

				$('.actorDatasetsActorActorNamesNameUsedFrom').datetimepicker({timepicker: false, changeMonth: true, changeYear: true, scrollInput: false, format: 'YYYY-MM-DD', yearStart: 1900, yearEnd: new Date().getFullYear()});
				$('.actorDatasetsActorActorNamesNameUsedUntil').datetimepicker({timepicker: false, changeMonth: true, changeYear: true, scrollInput: false, format: 'YYYY-MM-DD', yearStart: 1900, yearEnd: new Date().getFullYear()});

				$('#actorFormNames').data('actor', actor);
			}
		},

		actorFormAddresses: function(action, actor) {
    	// console.log("TCL: actorFormAddresses: action, actor", action, actor);
			var node = document.getElementById("dynamicActorHasAddressFields");
			while (node.lastChild) {
				node.removeChild(node.lastChild);
			}
			var node = document.getElementById("newActorHasAddressFields");
			while (node.lastChild) {
				node.removeChild(node.lastChild);
			}
			$('#actorFormAddresses').trigger('reset');
			actorFormAddressesValidator.resetForm();

			// setup UI
			var i = 0;
			var numAddresses = actor.model.actorHasAddresses.length;
      // console.log("TCL: actor.model.actorHasAddresses", actor.model.actorHasAddresses);
			for (; i< numAddresses; i++) {
				$('[data-role="dynamicActorHasAddressFields"]').append(
					`<div class="form-group" data-role="addressEntry">
						<div class="form-row">
							<div class="col-md-11">
								<fieldset>
									<legend>Address</legend>
									<div class="form-row align-items-center">
										<div class="col-md-2 col-auto">
											<div class="form-check form-check-inline">
												<input class="form-check-input isPrimaryAddress"
															 type="radio" name="isPrimaryAddress"
															 data-role="primaryAddress[`+actor.model.actorHasAddresses[i].id.addressId+`]"
															 placeholder="Is primary address">
												<label class="form-check-label col-form-label col-form-label-sm" for="isPrimaryAddress">Primary address</label>
											</div>
										</div>
										<div class="col-md-5">
											<label class="col-form-label col-form-label-sm">Street name</label>
											<input type="text"
														 class="form-control form-control-sm"
														 name="street[`+i+`]"
														 data-role="street[`+actor.model.actorHasAddresses[i].id.addressId+`]"
														 value="`+actor.model.actorHasAddresses[i].address.street+`"
														 placeholder="[Enter street name]"
														 aria-describedby="Street name"
														 minlength="3"
														 maxlength="100"
														 rows="1">
										</div>
										<div class="col-md-2">
											<label class="col-form-label col-form-label-sm">Street number</label>
											<input type="text"
														 class="form-control form-control-sm"
														 name="streetNumber[`+i+`]"
														 data-role="streetNumber[`+actor.model.actorHasAddresses[i].id.addressId+`]"
														 value="`+actor.model.actorHasAddresses[i].address.streetNumber+`"
														 placeholder="[Enter street number]"
														 aria-describedby="Street number"
														 maxlength="10">
										</div>
										<div class="col-md-3">
											<label class="col-form-label col-form-label-sm">Street addition</label>
											<input type="text"
														 class="form-control form-control-sm"
														 name="streetAddition[`+i+`]"
														 data-role="streetAddition[`+actor.model.actorHasAddresses[i].id.addressId+`]"
														 value="`+actor.model.actorHasAddresses[i].address.streetAddition+`"
														 placeholder="[Enter street addition]"
														 aria-describedby="Street addition"
														 maxlength="50">
										</div>
									</div>
									<div class="form-row">
										<div class="col-md-3">
											<label class="col-form-label col-form-label-sm">Postal code</label>
											<input type="text"
														 class="form-control form-control-sm"
														 name="postalCode[`+i+`]"
														 data-role="postalCode[`+actor.model.actorHasAddresses[i].id.addressId+`]"
														 value="`+actor.model.actorHasAddresses[i].address.postalCode+`"
														 placeholder="[Enter postal code]"
														 aria-describedby="Postal code"
														 maxlength="8">
										</div>
										<div class="col-md-6">
											<label class="col-form-label col-form-label-sm">City</label>
											<input type="text"
														 class="form-control form-control-sm"
														 name="city[`+i+`]"
														 data-role="city[`+actor.model.actorHasAddresses[i].id.addressId+`]"
														 value="`+actor.model.actorHasAddresses[i].address.city+`"
														 placeholder="[Enter city]"
														 aria-describedby="City"
														 maxlength="100">
										</div>
										<div class="col-md-3">
											<label class="col-form-label col-form-label-sm">Post office box</label>
											<input type="text"
														 class="form-control form-control-sm"
														 name="postOfficeBox[`+i+`]"
														 data-role="postOfficeBox[`+actor.model.actorHasAddresses[i].id.addressId+`]"
														 value="`+actor.model.actorHasAddresses[i].address.postOfficeBox+`"
														 placeholder="[Enter post office box]"
														 aria-describedby="Post office box"
														 maxlength="10">
										</div>
									</div>
									<div class="form-row">
										<div class="col-md-4">
											<label class="col-form-label col-form-label-sm">Address type*</label>
											<select class="form-control form-control-sm"
															name="addressTypeId[`+i+`]"
															data-role="addressTypeId[`+actor.model.actorHasAddresses[i].id.addressId+`]"
															required>
												<-- <option value="" disabled selected hidden>[Choose address type...]</option>
												<option value="1"> </option>
												<option value="2">business</option>
												<option value="3">home</option>
												<option value="4">other</option>
											</select>
										</div>
										<div class="col-md-4">
											<label class="col-form-label col-form-label-sm">Address used from</label>
											<input type="text"
														 class="form-control form-control-sm actorDatasetsActorAddressesAddressUsedFrom"
														 name="addressUsedFrom[`+i+`]"
														 data-role="addressUsedFrom[`+actor.model.actorHasAddresses[i].id.addressId+`]"
														 placeholder="[Enter used from]"
														 aria-describedby="Address used from">
										</div>
										<div class="col-md-4">
											<label class="col-form-label col-form-label-sm">Address used until</label>
											<input type="text"
														 class="form-control form-control-sm actorDatasetsActorAddressesAddressUsedUntil"
														 name="addressUsedUntil[`+i+`]"
														 data-role="addressUsedUntil[`+actor.model.actorHasAddresses[i].id.addressId+`]"
														 placeholder="[Enter used until]"
														 aria-describedby="Address used until">
										</div>
									</div>
								</fieldset>
							</div>
							<div class="col-md-1 align-items--vertically">
								<button class="form-group__button js-form-group__button removeActorAddressButton btn btn-danger" data-role="remove">
									<i class="fas fa-trash-alt"></i>
								</button>
							</div>
						</div>
					</div>`
				);
				var address = actor.model.actorHasAddresses[i];
				if (actor.model.primaryAddress && actor.model.primaryAddress.id == address.id.addressId) {
					$('[data-role="primaryAddress['+address.id.addressId+']"]').prop('checked', true);
				}
				// $('input[name="name['+i+']"]').rules("add", { required: true, minlength: 3, maxlength: 200});
				$('[data-role="addressTypeId['+address.id.addressId+']"]').find('option[value='+address.addressType.id+']')
																																	.attr('selected', true);
				if (address.usedFrom != null && !(isNaN(address.usedFrom)))
					$('[data-role="addressUsedFrom['+address.id.addressId+']"]').val(moment.utc(address.usedFrom).format('YYYY-MM-DD'));
					else $('[data-role="addressUsedFrom['+address.id.addressId+']"]').val('');
				if (address.usedUntil != null && !(isNaN(address.usedUntil)))
					$('[data-role="addressUsedUntil['+address.id.addressId+']"]').val(moment.utc(address.usedUntil).format('YYYY-MM-DD'));
					else $('[data-role="addressUsedUntil['+address.id.addressId+']"]').val('');
			}
			if ( action == 'show') {
				$('#actorFormAddresses :input').prop('disabled', true);
				this.initFormForShow();
				$('#actorFormAddressesSubmitButton').hide();
				$('#actorFormAddressesDismissButton').hide();
				$('[data-role="newActorHasAddressFields"').hide();
				$('.actorFormAddressDivider').hide();
				// $('[data-role="remove"]').hide();
				// $('[data-role="add"]').hide();
				$('.js-form-group__button').hide();
				$('#actorAddressesLabel').html("Actor address list");
			}
			else if (action == 'edit') {
				$('#actorFormAddresses :input').prop('disabled', false);
				this.hideFormButtons();
				$('#actorFormAddressesSubmitButton').html("Save");
				$('#actorFormAddressesSubmitButton').show();
				$('#actorFormAddressesDismissButton').show();
				$('#actorAddressesLabel').html("Edit actor address list");
				$('[data-role="newActorHasAddressFields"').show();
				$('.actorFormAddressDivider').show();
				$('#actorDatasetsMetadataActorAddress').focus();

				// fields for new address entry
				$('[data-role="newActorHasAddressFields"]').append(this.appendNewAddressField());

				$('.actorDatasetsActorAddressesAddressUsedFrom').datetimepicker({timepicker: false, changeMonth: true, changeYear: true, scrollInput: false, format: 'YYYY-MM-DD', yearStart: 1900, yearEnd: new Date().getFullYear()});
				$('.actorDatasetsActorAddressesAddressUsedUntil').datetimepicker({timepicker: false, changeMonth: true, changeYear: true, scrollInput: false, format: 'YYYY-MM-DD', yearStart: 1900, yearEnd: new Date().getFullYear()});

				// console.log("TCL: actor", actor);
				$('#actorFormAddresses').data('actor', actor);
			}
		},

		actorFormEmailAddresses: function(action, actor) {
    	// console.log("TCL: actorFormEmailAddresses: action, actor", action, actor);
			var node = document.getElementById("dynamicActorHasEmailAddressFields");
			while (node.lastChild) {
				node.removeChild(node.lastChild);
			}
			var node = document.getElementById("newActorHasEmailAddressFields");
			while (node.lastChild) {
				node.removeChild(node.lastChild);
			}
			$('#actorFormEmailAddresses').trigger('reset');
			actorFormEmailAddressesValidator.resetForm();

			// setup UI
			var i = 0;
			var numEmailAddresses = actor.model.actorHasEmailAddresses.length;
      // console.log("TCL: actor.model.actorHasEmailAddresses", actor.model.actorHasEmailAddresses);
			for (; i< numEmailAddresses; i++) {
				$('[data-role="dynamicActorHasEmailAddressFields"]').append(
					`<div class="form-group" data-role="emailAddressEntry">
							<div class="form-row">
									<div class="col-md-2 text-center">
										<div class="form-check">
											<input class="form-check-input isPrimaryEmailAddress" type="radio" name="isPrimaryEmailAddress" data-role="primaryEmailAddress[`+actor.model.actorHasEmailAddresses[i].id.emailAddressId+`]" placeholder="Is primary email address">
											<label class="sr-only" for="isPrimaryEmailAddress"></label>
										</div>
									</div>
									<div class="col-md-3">
									<label class="sr-only">Email address type*</label>
									<select class="form-control form-control-sm" name="emailAddressTypeId[`+i+`]" data-role="emailAddressTypeId[`+actor.model.actorHasEmailAddresses[i].id.emailAddressId+`]" required>
										<option value="" disabled selected hidden>[Choose email type...]</option>
										<option value="1"> </option>
										<option value="2">home</option>
										<option value="3">work</option>
										<option value="4">other</option>
										<option value="5">mobile</option>
										<option value="6">custom</option>
									</select>
								</div>
									<div class="col-md-6">
										<label class="sr-only">Email address</label>
										<input type="text" class="form-control form-control-sm" name="emailAddress[`+i+`]" data-role="emailAddress[`+actor.model.actorHasEmailAddresses[i].id.emailAddressId+`]" value="`+actor.model.actorHasEmailAddresses[i].emailAddress.email+`" placeholder="[Enter email address]" aria-describedby="Email address" required>
									</div>
								<div class="col-md-1 text-center">
									<button class="form-group__button js-form-group__button removeEmailAddressButton btn btn-danger" data-role="remove">
										<i class="fas fa-trash-alt"></i>
									</button>
								</div>
							</div>
						</div>`
				);
				var email = actor.model.actorHasEmailAddresses[i];
				if (actor.model.primaryEmailAddress && actor.model.primaryEmailAddress.id == email.id.emailAddressId) {
					$('[data-role="primaryEmailAddress['+email.id.emailAddressId+']"]').prop('checked', true);
				}
				$('[data-role="emailAddressTypeId['+email.id.emailAddressId+']"]').find('option[value='+email.emailAddressType.id+']')
																																					.attr('selected', true);
				$('input[name="emailAddress['+i+']"]').rules("add", { required: true, email: true});
			}
			if ( action == 'show') {
				$('#actorFormEmailAddresses :input').prop('disabled', true);
				this.initFormForShow();
				$('#actorFormEmailAddressesSubmitButton').hide();
				$('#actorFormEmailAddressesDismissButton').hide();
				$('[data-role="newActorHasEmailAddressFields"').hide();
				$('.actorFormEmailAddressDivider').hide();
				// $('[data-role="remove"]').hide();
				// $('[data-role="add"]').hide();
				$('.js-form-group__button').hide();
				$('#actorEmailAddressesLabel').html("Actor email list");
			}
			else if (action == 'edit') {
				$('#actorFormEmailAddresses :input').prop('disabled', false);
				this.hideFormButtons();
				$('#actorFormEmailAddressesSubmitButton').show();
				$('#actorFormEmailAddressesDismissButton').show();
				$('#actorFormEmailAddressesSubmitButton').html("Save");
				$('#actorEmailAddressesLabel').html("Edit Actor email list");
				$('[data-role="newActorHasEmailAddressFields"').show();
				$('.actorFormEmailAddressDivider').show();
				$('#actorDatasetsMetadataActorEmailAddress').focus();

				// fields for new email address entry
				$('[data-role="newActorHasEmailAddressFields"]').append(this.appendNewEmailAddressField());
				$('#actorFormEmailAddresses').data('actor', actor);
			}
		},

		actorFormPhoneNumbers: function(action, actor) {
    	// console.log("TCL: actorFormPhoneNumbers: action, actor", action, actor);
			var node = document.getElementById("dynamicActorHasPhoneNumberFields");
			while (node.lastChild) {
				node.removeChild(node.lastChild);
			}
			var node = document.getElementById("newActorHasPhoneNumberFields");
			while (node.lastChild) {
				node.removeChild(node.lastChild);
			}
			$('#actorFormPhoneNumbers').trigger('reset');
			actorFormPhoneNumbersValidator.resetForm();

			// setup UI
			var i = 0;
			var numPhoneNumbers = actor.model.actorHasPhoneNumbers.length;
      // console.log("TCL: actor.model.actorHasPhoneNumbers", actor.model.actorHasPhoneNumbers);
			for (; i < numPhoneNumbers; i++) {
				$('[data-role="dynamicActorHasPhoneNumberFields"]').append(
					`<div class="form-group" data-role="phoneNumberEntry">
							<div class="form-row">
									<div class="col-md-2 text-center">
										<div class="form-check">
											<input class="form-check-input isPrimaryPhoneNumber" type="radio" name="isPrimaryPhoneNumber" data-role="primaryPhoneNumber[`+actor.model.actorHasPhoneNumbers[i].id.phoneNumberId+`]" placeholder="Is primary phone number">
											<label class="sr-only" for="isPrimaryPhoneNumber"></label>
										</div>
									</div>
									<div class="col-md-3">
									<label class="sr-only">Phone number type*</label>
									<select class="form-control form-control-sm" name="phoneNumberTypeId[`+i+`]" data-role="phoneNumberTypeId[`+actor.model.actorHasPhoneNumbers[i].id.phoneNumberId+`]" required>
										<option value="" disabled selected hidden>[Choose phone number type...]</option>
										<option value="1"> </option>
										<option value="2">mobile</option>
										<option value="3">home</option>
										<option value="4">work</option>
										<option value="5">pager</option>
										<option value="6">other</option>
										<option value="7">custom</option>
									</select>
								</div>
								<div class="col-md-6">
									<label class="sr-only">Phone number</label>
									<input type="text" class="form-control form-control-sm" name="phoneNumber[`+i+`]" data-role="phoneNumber[`+actor.model.actorHasPhoneNumbers[i].id.phoneNumberId+`]" value="`+actor.model.actorHasPhoneNumbers[i].phoneNumber.phoneNumber+`" maxlength="30" placeholder="[Enter phone number]" aria-describedby="Phone number" required>
								</div>
								<div class="col-md-1 text-center">
									<button class="form-group__button js-form-group__button removePhoneNumberButton btn btn-danger" data-role="remove">
										<i class="fas fa-trash-alt"></i>
									</button>
								</div>
							</div>
						</div>`
				);
				var phoneNumber = actor.model.actorHasPhoneNumbers[i];
				if (actor.model.primaryPhoneNumber && actor.model.primaryPhoneNumber.id == phoneNumber.id.phoneNumberId) {
					$('[data-role="primaryPhoneNumber['+phoneNumber.id.phoneNumberId+']"]').prop('checked', true);
				}
				$('[data-role="phoneNumberTypeId['+phoneNumber.id.phoneNumberId+']"]').find('option[value='+phoneNumber.phoneNumberType.id+']')
																																							.attr('selected', true);
				$('input[name="phoneNumber['+i+']"]').rules("add", { required: true, maxlength: 30});
			}
			if ( action == 'show') {
				$('#actorFormPhoneNumbers :input').prop('disabled', true);
				this.initFormForShow();
				$('#actorFormPhoneNumbersSubmitButton').hide();
				$('#actorFormPhoneNumbersDismissButton').hide();
				$('[data-role="newActorHasPhoneNumberFields"').hide();
				$('.actorFormPhoneNumberDivider').hide();
				// $('[data-role="remove"]').hide();
				// $('[data-role="add"]').hide();
				$('.js-form-group__button').hide();
				$('#actorPhoneNumbersLabel').html("Actor phone number list");
			}
			else if (action == 'edit') {
				$('#actorFormPhoneNumbers :input').prop('disabled', false);
				this.hideFormButtons();
				$('#actorFormPhoneNumbersSubmitButton').html("Save");
				$('#actorFormPhoneNumbersSubmitButton').show();
				$('#actorFormPhoneNumbersDismissButton').show();
				$('#actorPhoneNumbersLabel').html("Edit Actor phone number list");
				$('[data-role="newActorHasPhoneNumberFields"').show();
				$('.actorFormPhoneNumberDivider').show();
				$('#actorDatasetsMetadataActorPhoneNumber').focus();

				// fields for new phone number entry
				$('[data-role="newActorHasPhoneNumberFields"]').append(this.appendNewPhoneNumberField());
				$('#actorFormPhoneNumbers').data('actor', actor);
			}
		},

		actorFormMemberOfCollectives: async function(action, type, actor) {
    	// console.log("TCL: actorFormMemberOfCollectives: action, type, actor", action, type, actor);
			var node = document.getElementById("dynamicPersonIsMemberOfCollectiveFields");
			while (node.lastChild) {
				node.removeChild(node.lastChild);
			}
			var node = document.getElementById("newPersonIsMemberOfCollectiveFields");
			while (node.lastChild) {
				node.removeChild(node.lastChild);
			}
			$('#actorFormMemberOfCollectives').trigger('reset');
			actorFormMemberOfCollectivesValidator.resetForm();

			// setup UI
			var i = 0;
			switch (type) {
				case 'person':
					var numMemberOfCollectives = actor.model.actorPerson.actorPersonIsMemberOfActorCollectives.length;
					// console.log("TCL: actor.model.actorPerson.actorPersonIsMemberOfActorCollectives", actor.model.actorPerson.actorPersonIsMemberOfActorCollectives);
				break;
				case 'collective':
					var numMemberOfCollectives = actor.model.actorCollective.actorPersonIsMemberOfActorCollectives.length;
          // console.log("TCL: actor.model.actorCollective.actorPersonIsMemberOfActorCollectives", actor.model.actorCollective.actorPersonIsMemberOfActorCollectives);
				break;
			}
			var listType = (type == 'person') ? 'collective' : 'person'; // person needs collective entries and vice versa
			// console.log("TCL: listType", listType);
			var editMode = (action == 'edit') ? true : false;
			for (; i < numMemberOfCollectives; i++) {
				switch (type) {
					case 'person':
						var apimoac = actor.model.actorPerson.actorPersonIsMemberOfActorCollectives[i];
						var actorId = apimoac.id.memberOfActorCollectiveActorId;
					break;
					case 'collective':
						var apimoac = actor.model.actorCollective.actorPersonIsMemberOfActorCollectives[i];
						var actorId = apimoac.id.actorPersonActorId;
					break;
				}
				var numMembershipDetails;
				if (apimoac.membershipDetails == null) {
					numMembershipDetails = 0;
				} else numMembershipDetails = apimoac.membershipDetails.length;
				let actorName = await TIMAAT.ActorService.getActorName(actorId);
				var memberOfCollectiveFormData = this.appendMemberOfCollectiveDataset(i, actorId, actorName, apimoac.membershipDetails, 'sr-only', editMode);
				// TODO expand form by membershipDetail information
				$('#dynamicPersonIsMemberOfCollectiveFields').append(memberOfCollectiveFormData);
				var j = 0;
				for (; j < numMembershipDetails; j++) {
					var apimoacmd = apimoac.membershipDetails[j];
          // console.log("TCL: apimoacmd", apimoacmd);
					if (apimoacmd.joinedAt != null && !(isNaN(apimoacmd.joinedAt)))
						$('[data-role="joinedAt['+actorId+']['+j+']"]').val(moment.utc(apimoacmd.joinedAt).format('YYYY-MM-DD'));
						else $('[data-role="joinedAt['+actorId+']['+j+']"]').val('');
					if (apimoacmd.leftAt != null && !(isNaN(apimoacmd.leftAt)))
						$('[data-role="leftAt['+actorId+']['+j+']"]').val(moment.utc(apimoacmd.leftAt).format('YYYY-MM-DD'));
						else $('[data-role="leftAt['+actorId+']['+j+']"]').val('');
				}
			}
			if ( action == 'show') {
				$('#actorFormMemberOfCollectives :input').prop('disabled', true);
				this.initFormForShow();
				$('#actorFormMemberOfCollectivesSubmitButton').hide();
				$('#actorFormMemberOfCollectivesDismissButton').hide();
				$('[data-role="newPersonIsMemberOfCollectiveFields"]').hide();
				$('.actorFormMemberOfCollectiveDivider').hide();
				// $('[data-role="remove"]').hide();
				// $('[data-role="removeMembershipDetails"]').hide();
				$('[data-role="add"]').hide();
				// $('[data-role="addMembershipDetails"]').hide();
				// $('.add-membership-details').hide();
				$('.js-form-group__button').hide();
				// $('[data-role="save"]').hide();
				switch (type) {
					case 'person':
						$('#actorMemberOfCollectiveLabel').html("Person is member of collective list");
						$('#memberLabel').html("Member of collective");
					break;
					case 'collective':
						$('#actorMemberOfCollectiveLabel').html("Collective has member list");
						$('#memberLabel').html("Member");
					break;
				}
			}
			else if (action == 'edit') {
				$('#actorFormMemberOfCollectives :input').prop('disabled', false);
				this.hideFormButtons();
				$('#actorFormMemberOfCollectivesSubmitButton').show();
				$('#actorFormMemberOfCollectivesDismissButton').show();
				$('.actorDatasetsActorMemberOfCollectiveActorId').prop('disabled', true);
				$('[data-role="newPersonIsMemberOfCollectiveFields"]').show();
				$('.actorFormMemberOfCollectiveDivider').show();
				switch (type) {
					case 'person':
						$('#actorMemberOfCollectiveLabel').html("Edit person is member of collective list");
						$('#memberLabel').html("Member of collective");
						$('#newMemberLabel').html("Member of collective");
					break;
					case 'collective':
						$('#actorMemberOfCollectiveLabel').html("Edit collective has member list");
						$('#memberLabel').html("Member");
						$('#newMemberLabel').html("Member");
					break;
				}
				// $('#actorFormMemberOfCollectivesSubmitButton').html("Save");
				$('#actorSelectDropdown').focus();

				// fields for new member of collective entry
				$('[data-role="newPersonIsMemberOfCollectiveFields"]').append(this.appendNewMemberOfCollectiveFields());
				$('#actorSelectDropdown').select2({
					closeOnSelect: true,
					scrollAfterSelect: true,
					allowClear: true,
					ajax: {
						url: 'api/actor/'+listType+'/selectList/',
						type: 'GET',
						dataType: 'json',
						delay: 250,
						headers: {
							"Authorization": "Bearer "+TIMAAT.Service.token,
							"Content-Type": "application/json",
						},
						// additional parameters
						data: function(params) {
							// console.log("TCL: data: params", params);
							return {
								search: params.term,
								page: params.page
							};
						},
						processResults: function(data, params) {
							// console.log("TCL: processResults: data", data);
							params.page = params.page || 1;
							return {
								results: data
							};
						},
						cache: false
					},
					minimumInputLength: 0,
				});

				$('.actorDatasetsActorMemberOfCollectivesJoinedAt').datetimepicker({timepicker: false, changeMonth: true, changeYear: true, scrollInput: false, format: 'YYYY-MM-DD', yearStart: 1900, yearEnd: new Date().getFullYear()});
				$('.actorDatasetsActorMemberOfCollectivesLeftAt').datetimepicker({timepicker: false, changeMonth: true, changeYear: true, scrollInput: false, format: 'YYYY-MM-DD', yearStart: 1900, yearEnd: new Date().getFullYear()});

				// console.log("TCL: actor", actor);
				$('#actorFormMemberOfCollectives').data('actor', actor);
			}
		},

		actorFormRoles: async function(action, actor) {
			// console.log("TCL: actorFormRoles: action, actor", action, actor);
			var node = document.getElementById("dynamicActorHasRoleFields");
			while (node.lastChild) {
				node.removeChild(node.lastChild);
			}
			$('#actorFormRoles').trigger('reset');
			// actorFormRolesValidator.resetForm();

			$('#dynamicActorHasRoleFields').append(this.appendActorHasRolesDataset());
			$('#actorRolesMultiSelectDropdown').select2({
				closeOnSelect: false,
				scrollAfterSelect: true,
				allowClear: true,
				ajax: {
					url: 'api/role/selectList/',
					type: 'GET',
					dataType: 'json',
					delay: 250,
					headers: {
						"Authorization": "Bearer "+TIMAAT.Service.token,
						"Content-Type": "application/json",
					},
					// additional parameters
					data: function(params) {
						// console.log("TCL: data: params", params);
						return {
							search: params.term,
							page: params.page
						};
					},
					processResults: function(data, params) {
						// console.log("TCL: processResults: data", data);
						params.page = params.page || 1;
						return {
							results: data
						};
					},
					cache: false
				},
				minimumInputLength: 0,
			});
			var roleSelect = $('#actorRolesMultiSelectDropdown');
			await TIMAAT.ActorService.getActorHasRoleList(actor.model.id).then(function(data) {
				// console.log("TCL: then: data", data);
				if (data.length > 0) {
					data.sort((a, b) => (a.roleTranslations[0].name > b.roleTranslations[0].name)? 1 : -1);
					// create the options and append to Select2
					var i = 0;
					for (; i < data.length; i++) {
						var option = new Option(data[i].roleTranslations[0].name, data[i].id, true, true);
						roleSelect.append(option).trigger('change');
					}
					// manually trigger the 'select2:select' event
					roleSelect.trigger({
						type: 'select2:select',
						params: {
							data: data
						}
					});
				}
			});

			if ( action == 'show') {
				$('#actorFormRoles :input').prop('disabled', true);
				this.initFormForShow();
				$('#actorFormRolesSubmitButton').hide();
				$('#actorFormRolesDismissButton').hide();
				$('.actorFormActorHasRoleDivider').hide();
				// $('[data-role="save"]').hide();
				$('#actorRolesLabel').html("Actor has role(s) list");
			}
			else if (action == 'edit') {
				$('#actorFormRoles :input').prop('disabled', false);
				this.hideFormButtons();
				$('#actorFormRolesSubmitButton').html("Save");
				$('#actorFormRolesSubmitButton').show();
				$('#actorFormRolesDismissButton').show();
				$('#actorRolesLabel').html("Edit actor roles list");
				$('.actorFormActorHasRoleDivider').show();
				$('#actorRolesMultiSelectDropdown').focus();

				// console.log("TCL: actor", actor);
				$('#actorFormRoles').data('actor', actor);
			}
		},

		actorFormRoleMedium: async function(action, actor) {
			// console.log("TCL: actorFormRoleMedium: action, actor", action, actor);
			var node = document.getElementById("dynamicActorRoleInMediumFields");
			while (node.lastChild) {
				node.removeChild(node.lastChild);
			}
			$('#actorFormActorRoleInMedium').trigger('reset');
			var actorIsProducer = false;
			let index = -1;
			index = actor.model.roles.findIndex(({id}) => id == 5);
			if ( index > -1) {
				actorIsProducer = true;
			}
			if (actorIsProducer) {

				$('.form-subheader').show();

				$('#dynamicActorRoleInMediumFields').append(this.appendActorRoleInMediumDataset());
				$('#actorRoleInMediumMultiSelectDropdown').select2({
					closeOnSelect: false,
					scrollAfterSelect: false,
					allowClear: true,
					ajax: {
						url: 'api/medium/video/selectList/',
						type: 'GET',
						dataType: 'json',
						delay: 250,
						headers: {
							"Authorization": "Bearer "+TIMAAT.Service.token,
							"Content-Type": "application/json",
						},
						// additional parameters
						data: function(params) {
							// console.log("TCL: data: params", params);
							return {
								search: params.term,
								page: params.page
							};
						},
						processResults: function(data, params) {
							// console.log("TCL: processResults: data", data);
							params.page = params.page || 1;
							return {
								results: data
							};
						},
						cache: false
					},
					minimumInputLength: 0,
				});
				var roleMediumSelect = $('#actorRoleInMediumMultiSelectDropdown');
				await TIMAAT.ActorService.getActorRoleInMediumList(actor.model.id, 5).then(function(data) { // TODO 5 = Producer
					// console.log("TCL: then: data", data);
					if (data.length > 0) {
						data.sort((a, b) => (a.displayTitle.name > b.displayTitle.name)? 1 : -1);
						// create the options and append to Select2
						var i = 0;
						for (; i < data.length; i++) {
							var option = new Option(data[i].displayTitle.name, data[i].id, true, true);
							roleMediumSelect.append(option).trigger('change');
						}
						// manually trigger the 'select2:select' event
						roleMediumSelect.trigger({
							type: 'select2:select',
							params: {
								data: data
							}
						});
					}
				});

				if ( action == 'show') {
					$('#actorFormActorRoleInMedium :input').prop('disabled', true);
					this.initFormForShow();
					$('#actorFormActorRoleInMediumSubmitButton').hide();
					$('#actorFormActorRoleInMediumDismissButton').hide();
					$('.actorRoleMediumFormDivider').hide();
					// $('[data-role="save"]').hide();
					$('#actorRoleMediumLabel').html("Actor has role in medium list");
				}
				else if (action == 'edit') {
					$('#actorFormActorRoleInMedium :input').prop('disabled', false);
					this.hideFormButtons();
					$('#actorFormActorRoleInMediumSubmitButton').html("Save");
					$('#actorFormActorRoleInMediumSubmitButton').show();
					$('#actorFormActorRoleInMediumDismissButton').show();
					$('#actorRoleMediumLabel').html("Edit actor has role in medium list");
					$('.actorRoleMediumFormDivider').show();
					$('#actorRoleInMediumMultiSelectDropdown').focus();
					$('#actorFormActorRoleInMedium').data('actor', actor);
				}
			} else {
				$('.form-subheader').hide();
				$('.formButtons').hide();
				$('.formButtons').prop('disabled', true);
				$('.formButtons :input').prop('disabled', true);
				$('#actorFormActorRoleInMediumSubmitButton').hide();
				$('#actorFormActorRoleInMediumDismissButton').hide();
				$('#actorRoleMediumLabel').html("Actor is no Producer");
			}
		},

		createActor: async function(actorType, actorModel, actorSubtypeModel, displayNameModel, actorSubtypeTranslationModel, citizenshipModel) {
			// console.log("TCL: createActor: async function(actorType, actorModel, actorSubtypeModel, displayNameModel, actorSubtypeTranslationModel, citizenshipModel)",
									// actorType, actorModel, actorSubtypeModel, displayNameModel, actorSubtypeTranslationModel, citizenshipModel);
			try {
				// create actor
				var tempActorModel = actorModel;
				var newActorModel = await TIMAAT.ActorService.createActor(tempActorModel);
			} catch(error) {
				console.error("ERROR: ", error);
			}

			try {
				// create display name
				displayNameModel.actor.id = newActorModel.id;
				var newDisplayName = await TIMAAT.ActorService.addName(newActorModel.id, displayNameModel);
				newActorModel.displayName = newDisplayName;
				newActorModel.birthName = newDisplayName;
				newActorModel.actorNames[0] = newDisplayName;
			} catch(error) {
				console.error("ERROR: ", error);
			}

			try {
				// update display and birth name in actor
				await TIMAAT.ActorService.updateActor(newActorModel);
			} catch(error) {
				console.error("ERROR: ", error);
			}

			try {
				// create actorSubtype with actor id
				actorSubtypeModel.actorId = newActorModel.id;
				if (actorType == 'person') {
					// actorSubtypeModel.placeOfBirth = null; // TODO implement
					// actorSubtypeModel.placeOfDeath = null; // TODO implement
				}
				actorSubtypeModel = await TIMAAT.ActorService.createActorSubtype(actorType, newActorModel, actorSubtypeModel);
			} catch(error) {
				console.error("ERROR: ", error);
			}

			try {
				// create person translation with person id
				if (actorType == "person" && actorSubtypeTranslationModel != null) {
					var newActorPersonModelTranslation = await TIMAAT.ActorService.createActorPersonTranslation(newActorModel, actorSubtypeTranslationModel[0]); // TODO more than one translation?
					actorSubtypeModel.actorPersonTranslations[0] = newActorPersonModelTranslation;
				}
			} catch(error) {
				console.error("ERROR: ", error);
			}

			try {
				// create person_has_citizenship with person id
				if (actorType == "person" && citizenshipModel != null) {
          // console.log("TCL: citizenshipModel", citizenshipModel);
					var addedCitizenshipModel = await TIMAAT.ActorService.addCitizenship(newActorModel.id, citizenshipModel); // TODO more than one citizenship
					// var addedCitizenshipModel = await TIMAAT.ActorService.addCitizenship(newActorModel.id, newCitizenshipModel); // <- once createCitizenship is used again
					actorSubtypeModel.citizenships[0] = addedCitizenshipModel;
				}
			} catch(error) {
				console.error("ERROR: ", error);
			}

			try {
				// push new actor to dataset model
				switch (actorType) {
					case 'person':
						newActorModel.actorPerson = actorSubtypeModel;
					break;
					case 'collective':
						newActorModel.actorCollective = actorSubtypeModel;
					break;
				}
				// console.log("TCL: newActorModel", newActorModel);
				// await this._actorAdded(actorType, newActorModel); //* commented out with dataTables
			} catch(error) {
				console.error("ERROR: ", error);
			}
			return (newActorModel);
		},

		// createName: async function(nameModel) {
		// 	// console.log("TCL: createName: async function -> nameModel", nameModel);
		// 	try {
		// 		// create name
		// 		var newNameModel = await TIMAAT.ActorService.createName(nameModel.model);
    //     // console.log("TCL: newNameModel", newNameModel);
		// 	} catch(error) {
		// 		console.error("ERROR: ", error);
		// 	}
		// },

		addNames: async function(actor, newNames) {
			// console.log("TCL: addNames: async function -> actor, newNames", actor, newNames);
			try {
				// create name
				var i = 0;
				for (; i < newNames.length; i++) {
					// var newName = await TIMAAT.ActorService.createName(newNames[i]);
					var addedNameModel = await TIMAAT.ActorService.addName(actor.model.id, newNames[i]);
					actor.model.actorNames.push(addedNameModel);
				}
			} catch(error) {
				console.error("ERROR: ", error);
			}
		},

		addActorHasAddresses: async function(actor, newActorHasAddresses) {
			// console.log("TCL: addActorHasAddresses: async function -> actor, newActorHasAddresses", actor, newActorHasAddresses);
			try {
				// create address
				var i = 0;
				for (; i < newActorHasAddresses.length; i++) {
					// modify models for backend
					var tempAddress = newActorHasAddresses[i].address;
					var tempActorHasAddress = newActorHasAddresses[i];
					// tempAddress.street = {};
					// tempAddress.street = { locationId: 282 }; // TODO temporarily until street location is properly connected
					// delete tempAddress.street;
					// delete tempAddress.city;
					delete tempActorHasAddress.address;

					var addedAddressModel = await TIMAAT.ActorService.addAddress(actor.model.id, tempAddress);
					var addedActorHasAddressModel = await TIMAAT.ActorService.updateActorHasAddress(actor.model.id, addedAddressModel.id, tempActorHasAddress);
					addedActorHasAddressModel.address = {};
					addedActorHasAddressModel.address = addedAddressModel;
					// addedActorHasAddressModel.address.street = 'TEMP NAME';
					// addedActorHasAddressModel.address.city = 'TEMP NAME';
					actor.model.actorHasAddresses.push(addedActorHasAddressModel);
				}
			} catch(error) {
				console.error("ERROR: ", error);
			}
		},

		addActorHasEmailAddresses: async function(actor, newActorHasEmailAddresses) {
			// console.log("TCL: addActorHasEmailAddresses: async function -> actor, newActorHasEmailAddresses", actor, newActorHasEmailAddresses);
			try {
				// create email address
				var i = 0;
				for (; i < newActorHasEmailAddresses.length; i++) {
					// modify models for backend
					var tempEmailAddress = newActorHasEmailAddresses[i].emailAddress;
					var tempActorHasEmailAddress = newActorHasEmailAddresses[i];
					delete tempActorHasEmailAddress.emailAddress;

					var addedEmailAddressModel = await TIMAAT.ActorService.addEmailAddress(actor.model.id, tempEmailAddress);
					var addedActorHasEmailAddressModel = await TIMAAT.ActorService.updateActorHasEmailAddress(actor.model.id, addedEmailAddressModel.id, tempActorHasEmailAddress);
					addedActorHasEmailAddressModel.emailAddress = {};
					addedActorHasEmailAddressModel.emailAddress = addedEmailAddressModel;
					actor.model.actorHasEmailAddresses.push(addedActorHasEmailAddressModel);
				}
			} catch(error) {
				console.error("ERROR: ", error);
			}
		},

		addActorHasPhoneNumbers: async function(actor, newActorHasPhoneNumbers) {
			// console.log("TCL: addActorHasPhoneNumbers: async function -> actor, newActorHasPhoneNumbers", actor, newActorHasPhoneNumbers);
			try {
				// create phone number
				var i = 0;
				for (; i < newActorHasPhoneNumbers.length; i++) {
					// modify models for backend
					var tempPhoneNumber = newActorHasPhoneNumbers[i].phoneNumber;
					var tempActorHasPhoneNumber = newActorHasPhoneNumbers[i];
					delete tempActorHasPhoneNumber.phoneNumber;

					var addedPhoneNumberModel = await TIMAAT.ActorService.addPhoneNumber(actor.model.id, tempPhoneNumber);
					var addedActorHasPhoneNumberModel = await TIMAAT.ActorService.updateActorHasPhoneNumber(actor.model.id, addedPhoneNumberModel.id, tempActorHasPhoneNumber);
					addedActorHasPhoneNumberModel.phoneNumber = {};
					addedActorHasPhoneNumberModel.phoneNumber = addedPhoneNumberModel;
					actor.model.actorHasPhoneNumbers.push(addedActorHasPhoneNumberModel);
				}
			} catch(error) {
				console.error("ERROR: ", error);
			}
		},

		addPersonIsMemberOfCollective: async function(actor, personIsMemberOfCollectiveData) {
			// console.log("TCL: addPersonIsMemberOfCollective: async function -> actor, personIsMemberOfCollectiveData", actor, personIsMemberOfCollectiveData);
			try {
				// create member of collective
				// TODO create and add membershipDetails
				//? create model?
				var newPersonIsMemberOfCollective = await TIMAAT.ActorService.addPersonIsMemberOfCollective(personIsMemberOfCollectiveData.actorId, personIsMemberOfCollectiveData.collectiveId);
				// console.log("TCL: newPersonIsMemberOfCollective", newPersonIsMemberOfCollective);
				var i = 0;
				for (; i < personIsMemberOfCollectiveData.membershipDetails.length; i++) {
					var newDetails = await TIMAAT.ActorService.addMembershipDetails(personIsMemberOfCollectiveData.actorId, personIsMemberOfCollectiveData.collectiveId, personIsMemberOfCollectiveData.membershipDetails[i]);
          // console.log("TCL: newDetails", newDetails);
					newPersonIsMemberOfCollective.membershipDetails.push(newDetails);
				}
				// console.log("TCL: newPersonIsMemberOfCollective", newPersonIsMemberOfCollective);
				switch (actor.model.actorType.actorTypeTranslations[0].type) {
					case 'person':
						actor.model.actorPerson.actorPersonIsMemberOfActorCollectives.push(newPersonIsMemberOfCollective);
					break;
					case 'collective':
						actor.model.actorCollective.actorPersonIsMemberOfActorCollectives.push(newPersonIsMemberOfCollective);
					break;
				}

			} catch(error) {
				console.error("ERROR: ", error);
			}
		},

		updateActor: async function(actorSubtype, actor) {
			console.log("TCL: updateActor:function -> actorSubtype, actor", actorSubtype, actor);
				try {
					// update birth name
					if (actor.model.birthName) { // actor initially has no birth name set
						var tempBirthName = await TIMAAT.ActorService.updateName(actor.model.birthName);
						actor.model.birthName = tempBirthName;
					}
					// update display name
					var tempDisplayName = await TIMAAT.ActorService.updateName(actor.model.displayName);
					actor.model.displayName = tempDisplayName;
					// update primary address
					if (actor.model.primaryAddress) { // actor initially has no primary address set
						var tempPrimaryAddress = await TIMAAT.ActorService.updateAddress(actor.model.primaryAddress);
						actor.model.primaryAddress = tempPrimaryAddress;
					}
					// update primary email address
					if (actor.model.primaryEmailAddress) { // actor initially has no primary email address set
						var tempPrimaryEmailAddress = await TIMAAT.ActorService.updateEmailAddress(actor.model.primaryEmailAddress);
						actor.model.primaryEmailAddress = tempPrimaryEmailAddress;
					}
					// update phone number address
					if (actor.model.primaryPhoneNumber) { // actor initially has no primary phone number set
						var tempPrimaryPhoneNumber = await TIMAAT.ActorService.updatePhoneNumber(actor.model.primaryPhoneNumber);
						actor.model.primaryPhoneNumber = tempPrimaryPhoneNumber;
					}
				} catch(error) {
					console.error("ERROR: ", error);
				}

				try {
					// update data that is part of actorSubtypeData
					var tempSubtypeModel;
					switch (actorSubtype) {
						case 'person':
							tempSubtypeModel = actor.model.actorPerson;
							// TODO remove deletions once implemented
							// tempSubtypeModel.placeOfBirth = null;
							// tempSubtypeModel.placeOfDeath = null;
						break;
						case 'collective':
							tempSubtypeModel = actor.model.actorCollective;
						break;
					}
					// console.log("TCL: tempSubtypeModel", tempSubtypeModel);
					var tempActorSubtypeModel = await TIMAAT.ActorService.updateActorSubtype(actorSubtype, tempSubtypeModel);
				} catch(error) {
					console.error("ERROR: ", error);
				}

				try {
					switch (actorSubtype) {
						case 'person':
							// update data that is part of person translation
							// TODO: send request for each translation or for all translations
							var tempActorPersonTranslation = await TIMAAT.ActorService.updateActorPersonTranslation(actor.model.id, actor.model.actorPerson.actorPersonTranslations[0]);
							// TODO
							// if (actor.model.actorPerson.citizenships.length > 0) {
							// 	var tempActorPersonCitizenshipTranslation = await TIMAAT.ActorService.updateCitizenshipTranslation(actor.model.actorPerson.citizenships[0].citizenshipTranslations[0], actor.model.actorPerson.citizenships[0].citizenshipTranslations[0].language.id);
							// }
						break;
					}
				} catch(error) {
					console.error("ERROR: ", error);
				};

				try { // update actor
					// update data that is part of actor (includes updating last edited by/at)
					var tempActorModel = await TIMAAT.ActorService.updateActor(actor.model);
				} catch(error) {
					console.error("ERROR: ", error);
				};
		},

		updateActorHasMediumImageList: async function(actor, imageIdList) {
			// console.log("TCL: updateActorHasMediumImageList:function -> actor, imageIdList", actor, imageIdList);
				try { // update actor_has_medium_image table entries
					var existingActorHasImageEntries = await TIMAAT.ActorService.getActorHasImageList(actor.model.id);
					// console.log("TCL: existingActorHasImageEntries", existingActorHasImageEntries);
					// console.log("TCL: imageIdList", imageIdList);
					if (imageIdList == null) { //* all entries will be deleted
						// console.log("TCL: delete all existingActorHasImageEntries: ", existingActorHasImageEntries);
						actor.model.profileImages = [];
						actor.model = await TIMAAT.ActorService.updateActor(actor.model);
					} else if (existingActorHasImageEntries.length == 0) { //* all entries will be added
						// console.log("TCL: add all imageIdList: ", imageIdList);
						var i = 0;
						for (; i < imageIdList.length; i++ ) {
							actor.model.profileImages.push(imageIdList[i]);
						}
						// console.log("TCL: actor.model.profileImages", actor.model.profileImages);
						actor.model = await TIMAAT.ActorService.updateActor(actor.model);
					} else { //* add/remove entries
						// delete removed entries
						var actorHasImageEntriesToDelete = [];
						var i = 0;
						for (; i < existingActorHasImageEntries.length; i++) {
							var deleteId = true;
							var item = {};
							var j = 0;
							for (; j < imageIdList.length; j++) {
								if (existingActorHasImageEntries[i].mediumId == imageIdList[j]) {
									deleteId = false;
									break; // no need to check further if match was found
								}
							}
							if (deleteId) { // id is in existingActorHasImageEntries but not in imageIdList
								// console.log("TCL: delete entry: ", existingActorHasImageEntries[i]);
								item = existingActorHasImageEntries[i];
								actorHasImageEntriesToDelete.push(item);
								existingActorHasImageEntries.splice(i,1); // remove entry so it won't have to be checked again in the next step when adding new ids
								i--; // so the next list item is not jumped over due to the splicing
							}
						}

						// console.log("TCL: actorHasImageEntriesToDelete", actorHasImageEntriesToDelete);
						if (actorHasImageEntriesToDelete.length > 0) { // anything to delete?
							var i = 0;
							for (; i < actorHasImageEntriesToDelete.length; i++) {
								var index = actor.model.profileImages.findIndex(({mediumId}) => mediumId === actorHasImageEntriesToDelete[i].mediumId);
								actor.model.profileImages.splice(index,1);
							}
							// console.log("TCL: actor.model.profileImages", actor.model.profileImages);
							await TIMAAT.ActorService.updateActor(actor.model);
						}

						// create new entries
						var idsToCreate = [];
						i = 0;
						for (; i < imageIdList.length; i++) {
							// console.log("TCL: imageIdList", imageIdList);
							var idExists = false;
							var j = 0;
							for (; j < existingActorHasImageEntries.length; j++) {
								// console.log("TCL: existingActorHasImageEntries", existingActorHasImageEntries);
								if (imageIdList[i] == existingActorHasImageEntries[j].mediumId) {
									idExists = true;
									break; // no need to check further if match was found
								}
							}
							if (!idExists) {
								idsToCreate.push(imageIdList[i]);
							}
						}
						// console.log("TCL: idsToCreate", idsToCreate);
						if (idsToCreate.length > 0) { // anything to add?
							// console.log("TCL: idsToCreate", idsToCreate);
							var i = 0;
							for (; i < idsToCreate.length; i++) {
								actor.model.profileImages.push(idsToCreate[i]);
							}
							// console.log("TCL: actor.model.profileImages", actor.model.profileImages);
							actor.model = await TIMAAT.ActorService.updateActor(actor.model);
						}
					}
				} catch(error) {
					console.error("ERROR: ", error);
				};

				// update data that is part of actor (includes updating last edited by/at)
				var tempActorModel = await TIMAAT.ActorService.updateActor(actor.model);
				// return tempActorModel;
		},

		updateName: async function(name, actor) {
			// console.log("TCL: updateName: async function -> name at beginning of update process: ", name, actor);
			try {
				// update name
				var tempName = await TIMAAT.ActorService.updateName(name);
				// console.log("TCL: tempName", tempName);
				var i = 0;
				for (; i < actor.model.actorNames.length; i++) {
					if (actor.model.actorNames[i].id == name.id)
						actor.model.actorNames[i] = tempName;
				}
			} catch(error) {
				console.error("ERROR: ", error);
			}
		},

		updateActorHasAddress: async function(actorHasAddress, actor) {
			// console.log("TCL: updateActorHasAddress: async function -> actorHasAddress at beginning of update process: ", actorHasAddress, actor);
			try {
				// update address
				var tempActorHasAddress = actorHasAddress;
				var tempAddress = actorHasAddress.address;
				// modify models for backend
				delete tempActorHasAddress.address;
				// delete tempAddress.street;
				// delete tempAddress.city;
				var updatedTempAddress = await TIMAAT.ActorService.updateAddress(tempAddress);
				tempActorHasAddress.id.actorId = actor.model.id;
				tempActorHasAddress.id.addressId = updatedTempAddress.id;
				var updatedTempActorHasAddress = await TIMAAT.ActorService.updateActorHasAddress(actorHasAddress.id.actorId, actorHasAddress.id.addressId, tempActorHasAddress);
				updatedTempActorHasAddress.address = updatedTempAddress;
				// updatedTempActorHasAddress.address.street = 'TEMP NAME';
				// updatedTempActorHasAddress.address.city = 'TEMP NAME';

				var i = 0;
				for (; i < actor.model.actorHasAddresses.length; i++) {
					if (actor.model.actorHasAddresses[i].id == actorHasAddress.id)
						actor.model.actorHasAddresses[i] = updatedTempActorHasAddress;
				}
			} catch(error) {
				console.error("ERROR: ", error);
			}
		},

		updateActorHasEmailAddress: async function(actorHasEmailAddress, actor) {
			// console.log("TCL: updateActorHasEmailAddress: async function -> actorHasEmailAddress at beginning of update process: ", actorHasEmailAddress, actor);
			try {
				// update address
				var tempActorHasEmailAddress = actorHasEmailAddress;
				var tempEmailAddress = actorHasEmailAddress.emailAddress;
				// modify models for backend
				delete tempActorHasEmailAddress.emailAddress;
				var updatedTempEmailAddress = await TIMAAT.ActorService.updateEmailAddress(tempEmailAddress);
				tempActorHasEmailAddress.id.actorId = actor.model.id;
				tempActorHasEmailAddress.id.emailAddressId = updatedTempEmailAddress.id;
				var updatedTempActorHasEmailAddress = await TIMAAT.ActorService.updateActorHasEmailAddress(actorHasEmailAddress.id.actorId, actorHasEmailAddress.id.emailAddressId, tempActorHasEmailAddress);
				updatedTempActorHasEmailAddress.emailAddress = updatedTempEmailAddress;

				var i = 0;
				for (; i < actor.model.actorHasEmailAddresses.length; i++) {
					if (actor.model.actorHasEmailAddresses[i].id == actorHasEmailAddress.id)
						actor.model.actorHasEmailAddresses[i] = updatedTempActorHasEmailAddress;
				}
			} catch(error) {
				console.error("ERROR: ", error);
			}
		},

		updateActorHasPhoneNumber: async function(actorHasPhoneNumber, actor) {
			// console.log("TCL: updateActorHasPhoneNumber: async function -> actorHasPhoneNumber at beginning of update process: ", actorHasPhoneNumber, actor);
			try {
				// update address
				var tempActorHasPhoneNumber = actorHasPhoneNumber;
				var tempPhoneNumber = actorHasPhoneNumber.phoneNumber;
				// modify models for backend
				delete tempActorHasPhoneNumber.phoneNumber;
				var updatedTempPhoneNumber = await TIMAAT.ActorService.updatePhoneNumber(tempPhoneNumber);
				tempActorHasPhoneNumber.id.actorId = actor.model.id;
				tempActorHasPhoneNumber.id.phoneNumberId = updatedTempPhoneNumber.id;
				var updatedTempActorHasPhoneNumber = await TIMAAT.ActorService.updateActorHasPhoneNumber(actorHasPhoneNumber.id.actorId, actorHasPhoneNumber.id.phoneNumberId, tempActorHasPhoneNumber);
				updatedTempActorHasPhoneNumber.phoneNumber = updatedTempPhoneNumber;

				var i = 0;
				for (; i < actor.model.actorHasPhoneNumbers.length; i++) {
					if (actor.model.actorHasPhoneNumbers[i].id == actorHasPhoneNumber.id)
						actor.model.actorHasPhoneNumbers[i] = updatedTempActorHasPhoneNumber;
				}
			} catch(error) {
				console.error("ERROR: ", error);
			}
		},

		updateActorHasRole: async function(actorModel, roleIdList) {
    // console.log("TCL: actorModel, roleIdList", actorModel, roleIdList);
			try { // update actor_has_role table entries
        var existingActorHasRoleEntries = await TIMAAT.ActorService.getActorHasRoleList(actorModel.id);
        // console.log("TCL: existingActorHasRoleEntries", existingActorHasRoleEntries);
        // console.log("TCL: roleIdList", roleIdList);
        if (roleIdList == null) { //* all entries will be deleted
          // console.log("TCL: delete all existingActorHasRoleEntries: ", existingActorHasRoleEntries);
					actorModel.roles = [];
					await TIMAAT.ActorService.updateActor(actorModel);
        } else if (existingActorHasRoleEntries.length == 0) { //* all entries will be added
          // console.log("TCL: add all roleIdList: ", roleIdList);
					actorModel.roles = roleIdList;
					await TIMAAT.ActorService.updateActor(actorModel);
        } else { //* add/remove entries
          // delete removed entries
          var actorHasRoleEntriesToDelete = [];
          var i = 0;
          for (; i < existingActorHasRoleEntries.length; i++) {
            var deleteId = true;
            var item = {};
            var j = 0;
            for (; j < roleIdList.length; j++) {
              if( existingActorHasRoleEntries[i].id == roleIdList[j].id) {
                deleteId = false;
                break; // no need to check further if match was found
              }
            }
            if (deleteId) { // id is in existingActorHasRoleEntries but not in roleIdList
              // console.log("TCL: delete entry: ", existingActorHasRoleEntries[i]);
              item = existingActorHasRoleEntries[i];
              actorHasRoleEntriesToDelete.push(item);
              existingActorHasRoleEntries.splice(i,1); // remove entry so it won't have to be checked again in the next step when adding new ids
              i--; // so the next list item is not jumped over due to the splicing
            }
					}

          // console.log("TCL: actorHasRoleEntriesToDelete", actorHasRoleEntriesToDelete);
          if (actorHasRoleEntriesToDelete.length > 0) { // anything to delete?
						var i = 0;
						for (; i < actorHasRoleEntriesToDelete.length; i++) {
							var index = actorModel.roles.findIndex(({id}) => id === actorHasRoleEntriesToDelete[i].id);
							actorModel.roles.splice(index,1);
						}
						await TIMAAT.ActorService.updateActor(actorModel);
          }

          // create new entries
          var idsToCreate = [];
          i = 0;
          for (; i < roleIdList.length; i++) {
            // console.log("TCL: roleIdList", roleIdList);
            var idExists = false;
            var item = { id: 0 };
            var j = 0;
            for (; j < existingActorHasRoleEntries.length; j++) {
              // console.log("TCL: existingActorHasRoleEntries", existingActorHasRoleEntries);
              if (roleIdList[i].id == existingActorHasRoleEntries[j].id) {
                idExists = true;
                break; // no need to check further if match was found
              }
            }
            if (!idExists) {
              item.id = roleIdList[i].id;
              idsToCreate.push(item);
            }
          }
          // console.log("TCL: idsToCreate", idsToCreate);
          if (idsToCreate.length > 0) { // anything to add?
            // console.log("TCL: idsToCreate", idsToCreate);
						var i = 0;
						for (; i < idsToCreate.length; i++) {
							actorModel.roles.push(idsToCreate[i]);
							await TIMAAT.ActorService.updateActor(actorModel);
						}
          }
        }
      } catch(error) {
        console.error("ERROR: ", error);
      };
			if ($('#actorTab').hasClass('active')) {
				await TIMAAT.UI.refreshDataTable('actor');
			} else {
				await TIMAAT.UI.refreshDataTable(actorModel.actorType.actorTypeTranslations[0].type);
			}
			// TIMAAT.UI.addSelectedClassToSelectedItem(actorModel.actorType.actorTypeTranslations[0].type, actorModel.id);
		},

		// TODO currently only for Producer.
		updateActorRoleInMedium: async function(actorModel, mediumIdList, roleId) {
			// console.log("TCL: updateActorRoleInMedium - actorModel, mediumIdList, roleId", actorModel, mediumIdList, roleId);
			try { // update medium_has_actor_with_role table entries
				var existingEntries = await TIMAAT.ActorService.getActorRoleInMediumList(actorModel.id, roleId);
				// console.log("TCL: existingEntries", existingEntries);
				// console.log("TCL: mediumIdList", mediumIdList);
				if (mediumIdList == null) { //* all entries will be deleted
					// console.log("TCL: delete all existingEntries: ", existingEntries);
					var i = 0;
					for (; i < existingEntries.length; i++) {
						await TIMAAT.MediumService.removeRoleFromMediumHasActorWithRoles(existingEntries[i].id, actorModel.id, roleId);
					}
				} else if (existingEntries.length == 0) { //* all entries will be added
					// console.log("TCL: add all mediumIdList: ", mediumIdList);
					var i = 0;
					for (; i < mediumIdList.length; i++) {
						await TIMAAT.MediumService.addMediumHasActorWithRoles(mediumIdList[i].id, actorModel.id, roleId);
					}
				} else { //* add/remove entries
					// delete removed entries
					var entriesToDelete = [];
					var i = 0;
					for (; i < existingEntries.length; i++) {
						var deleteId = true;
						var item = {};
						var j = 0;
						for (; j < mediumIdList.length; j++) {
							if( existingEntries[i].id == mediumIdList[j].id) {
								deleteId = false;
								break; // no need to check further if match was found
							}
						}
						if (deleteId) { // id is in existingEntries but not in mediumIdList
							// console.log("TCL: delete entry: ", existingEntries[i]);
							item = existingEntries[i];
							entriesToDelete.push(item);
							existingEntries.splice(i,1); // remove entry so it won't have to be checked again in the next step when adding new ids
							i--; // so the next list item is not jumped over due to the splicing
						}
					}

					// console.log("TCL: entriesToDelete", entriesToDelete);
					if (entriesToDelete.length > 0) { // anything to delete?
						var i = 0;
						for (; i < entriesToDelete.length; i++) {
							await TIMAAT.MediumService.removeRoleFromMediumHasActorWithRoles(entriesToDelete[i].id, actorModel.id, roleId);
						}
					}

					// create new entries
					var idsToCreate = [];
					i = 0;
					for (; i < mediumIdList.length; i++) {
						// console.log("TCL: mediumIdList", mediumIdList);
						var idExists = false;
						var item = { id: 0 };
						var j = 0;
						for (; j < existingEntries.length; j++) {
							// console.log("TCL: existingEntries", existingEntries);
							if (mediumIdList[i].id == existingEntries[j].id) {
								idExists = true;
								break; // no need to check further if match was found
							}
						}
						if (!idExists) {
							item.id = mediumIdList[i].id;
							idsToCreate.push(item);
						}
					}
					// console.log("TCL: idsToCreate", idsToCreate);
					if (idsToCreate.length > 0) { // anything to add?
						// console.log("TCL: idsToCreate", idsToCreate);
						var i = 0;
						for (; i < idsToCreate.length; i++) {
							await TIMAAT.MediumService.addMediumHasActorWithRoles(idsToCreate[i].id, actorModel.id, roleId);
						}
					}
				}
			} catch(error) {
				console.error("ERROR: ", error);
			};
			// await TIMAAT.UI.refreshDataTable('video'); // TODO still needed?
		},

		updateActorHasTagsList: async function(actorModel, tagIdList) {
    	// console.log("TCL: actorModel, tagIdList", actorModel, tagIdList);
			try {
				var existingActorHasTagsEntries = await TIMAAT.ActorService.getTagList(actorModel.id);
        // console.log("TCL: existingActorHasTagsEntries", existingActorHasTagsEntries);
				if (tagIdList == null) { //* all entries will be deleted
					actorModel.tags = [];
					await TIMAAT.ActorService.updateActor(actorModel);
				} else if (existingActorHasTagsEntries.length == 0) { //* all entries will be added
					actorModel.tags = tagIdList;
					await TIMAAT.ActorService.updateActor(actorModel);
				} else { //* delete removed entries
					var entriesToDelete = [];
					var i = 0;
					for (; i < existingActorHasTagsEntries.length; i++) {
						var deleteId = true;
						var j = 0;
						for (; j < tagIdList.length; j++) {
							if (existingActorHasTagsEntries[i].id == tagIdList[j].id) {
								deleteId = false;
								break; // no need to check further if match was found
							}
						}
						if (deleteId) { // id is in existingActorHasTagEntries but not in tagIdList
              // console.log("TCL: deleteId", deleteId);
							entriesToDelete.push(existingActorHasTagsEntries[i]);
							existingActorHasTagsEntries.splice(i,1); // remove entry so it won't have to be checked again in the next step when adding new ids
							i--; // so the next list item is not jumped over due to the splicing
						}
					}
					if (entriesToDelete.length > 0) { // anything to delete?
						var i = 0;
						for (; i < entriesToDelete.length; i++) {
							var index = actorModel.tags.findIndex(({id}) => id === entriesToDelete[i].id);
							actorModel.tags.splice(index,1);
							await TIMAAT.ActorService.removeTag(actorModel.id, entriesToDelete[i].id);
						}
					}
					//* add existing tags
					var idsToCreate = [];
          i = 0;
          for (; i < tagIdList.length; i++) {
            var idExists = false;
            var item = { id: 0 };
            var j = 0;
            for (; j < existingActorHasTagsEntries.length; j++) {
              if (tagIdList[i].id == existingActorHasTagsEntries[j].id) {
                idExists = true;
                break; // no need to check further if match was found
              }
            }
            if (!idExists) {
              item.id = tagIdList[i].id;
              idsToCreate.push(item);
            }
          }
          // console.log("TCL: idsToCreate", idsToCreate);
          if (idsToCreate.length > 0) { // anything to add?
            // console.log("TCL: idsToCreate", idsToCreate);
						var i = 0;
						for (; i < idsToCreate.length; i++) {
							actorModel.tags.push(idsToCreate[i]);
							await TIMAAT.ActorService.addTag(actorModel.id, idsToCreate[i].id);
						}
          }
				}
			} catch(error) {
				console.error("ERROR: ", error);
			}
			return actorModel;
		},

		createNewTagsAndAddToActor: async function(actorModel, newTagList) {
			var i = 0;
			for (; i < newTagList.length; i++) {
				newTagList[i] = await TIMAAT.Service.createTag(newTagList[i].name);
				await TIMAAT.ActorService.addTag(actorModel.id, newTagList[i].id);
				actorModel.tags.push(newTagList[i]);
			}
			return actorModel;
		},

		_actorRemoved: async function(actor) {
			// console.log("TCL: actor", actor);
			if (actor.model.actorType.actorTypeTranslations[0].type == "collective") {
				try {
					// delete actorPersonIsMemberOfActorCollectives information from currently loaded actorPersons // TODO
					var i = 0;
					for (; i < actor.model.actorCollective.actorPersonIsMemberOfActorCollectives.length; i++) {
						await TIMAAT.ActorService.removeMemberOfCollective(actor.model.actorCollective.actorPersonIsMemberOfActorCollectives[i]);
					}
				} catch (error) {
					console.error("ERROR: ", error);
				}
			}
			// sync to server
			try {
				await TIMAAT.ActorService.removeActor(actor);
			} catch (error) {
				console.error("ERROR: ", error);
			}
			actor.remove();
		},

		createActorModel: async function(actorType, formDataObject) {
   	//  console.log("TCL: actorType, formDataObject", actorType, formDataObject);
			let typeId = 0;
			switch (actorType) {
				case 'person':
					typeId = 1;
				break;
				case 'collective':
					typeId = 2;
				break;
			}
			var model = {
				id         : 0,
				isFictional: formDataObject.isFictional,
				actorType  : {
					id: typeId,
				},
				displayName: {
					id   : 0,
					actor: {
						id: 0
					},
					name     : formDataObject.displayName,
					usedFrom : formDataObject.nameUsedFrom,
					usedUntil: formDataObject.nameUsedUntil,
				},
				birthName: {
					id   : 0,
					actor: {
						id: 0
					},
					name     : formDataObject.displayName,
					usedFrom : formDataObject.nameUsedFrom,
					usedUntil: formDataObject.nameUsedUntil,
				},
				profileImages: formDataObject.profileImages
			};
			// var i = 0;
			// for (; i < profileImageList.length; i++) {
			// 	model.profileImages[i] = {mediumId: profileImageList[i]};
			// }
			// console.log("TCL: actorModel", model);
			return model;
		},

		createActorSubtypeModel: async function(actorType, formDataObject) {
    	// console.log("TCL: formDataObject, actorType", formDataObject, actorType);
			var model = {};
			switch(actorType) {
				case 'person':
					model = {
						actorId     : 0,
						title       : formDataObject.title,
						dateOfBirth : formDataObject.dateOfBirth,
						placeOfBirth: formDataObject.placeOfBirth,
						// placeOfBirth: { // TODO
						// 	id: formDataObject.placeOfBirth
						// 	},
						dayOfDeath  : formDataObject.dayOfDeath,
						placeOfDeath: formDataObject.placeOfDeath,
						// placeOfDeath: { // TODO
						// 	id: formDataObject.placeOfDeath
						// },
						sex: {
							id: formDataObject.sexId
						},
						actorPersonIsMemberOfActorCollectives: [],
						actorPersonTranslations              : [],
						// citizenships : []
						citizenship: formDataObject.citizenship,
					};
				break;
				case 'collective':
					model	= {
						actorId: 0,
						founded: formDataObject.founded,
						disbanded: formDataObject.disbanded,
					};
				break;
			}
      // console.log("model", model);
			return model;
		},

		createActorPersonTranslationModel: async function(formDataObject) {
			var model = [{
					id: 0,
					language: {
						id: 1 // TODO change to correct language
					},
					specialFeatures: formDataObject.specialFeatures,
				}];
			return model;
		},

		createNameModel: async function(formDataObject) {
    	// console.log("TCL: createNameModel: formDataObject", formDataObject);
			var model = {
				id: 0,
				actor: {
					id: 0,
				},
				name: formDataObject.displayName,
				usedFrom: formDataObject.nameUsedFrom,
				usedUntil: formDataObject.nameUsedUntil,
			};
      // console.log("TCL: name", model);
			return model;
		},

		createActorHasAddressModel: function(data, actorId, addressId) {
    	// console.log("TCL: data, actorId, addressId", data, actorId, addressId);
			var actorHasAddressModel = {};
			actorHasAddressModel.id = {
				actorId: actorId,
				addressId: addressId
			};
			actorHasAddressModel.usedFrom = data.addressUsedFrom;
			actorHasAddressModel.usedUntil = data.addressUsedUntil;
			actorHasAddressModel.address = {
				id: addressId,
				postOfficeBox: data.postOfficeBox,
				postalCode: data.postalCode,
				streetNumber: data.streetNumber,
				streetAddition: data.streetAddition,
				street: data.street,
				city: data.city,
			};
			actorHasAddressModel.addressType = this.addressTypes[Number(data.addressTypeId)-1];
			return actorHasAddressModel;
		},

		updateActorHasAddressModel: function(originalModel, data) {
    // console.log("TCL ~ $ ~ originalModel, data", originalModel, data);
			var updatedModel = originalModel;
			updatedModel.usedFrom = data.addressUsedFrom;
			updatedModel.usedUntil = data.addressUsedUntil;
			updatedModel.addressType = this.addressTypes[Number(data.addressTypeId)-1];
			updatedModel.address.postOfficeBox = data.postOfficeBox;
			updatedModel.address.postalCode = data.postalCode;
			updatedModel.address.streetNumber = data.streetNumber;
			updatedModel.address.streetAddition = data.streetAddition;
			updatedModel.address.street = data.street;
			updatedModel.address.city = data.city;
			return updatedModel;
		},

		createActorHasEmailAddressModel: async function(data, actorId, emailAddressId) {
    	// console.log("TCL: data, actorId, emailAddressId", data, actorId, emailAddressId);
			var model = {};
			model.id = {
				actorId: actorId,
				emailAddressId: emailAddressId
			};
			model.emailAddress = {
				id: emailAddressId,
				email: data.email,
			};
			model.emailAddressType = this.emailAddressTypes[Number(data.emailAddressTypeId)-1];
			return model;
		},

		updateActorHasEmailAddressModel: async function(originalModel, data) {
      // console.log("TCL ~ updateActorHasEmailAddressModel:function ~ originalModel, data", originalModel, data);
			var updatedModel = originalModel;
			updatedModel.emailAddressType = this.emailAddressTypes[Number(data.emailAddressTypeId)-1];
			updatedModel.emailAddress.email = data.email;
			return updatedModel;
		},

		createActorHasPhoneNumberModel: async function(data, actorId, phoneNumberId) {
    	// console.log("TCL: data, actorId, phoneNumberId", data, actorId, phoneNumberId);
			var model = {};
			model.id = {
				actorId: actorId,
				phoneNumberId: phoneNumberId
			};
			model.phoneNumber = {
				id: phoneNumberId,
				phoneNumber: data.phoneNumber,
			};
			model.phoneNumberType = this.phoneNumberTypes[Number(data.phoneNumberTypeId)-1];
			return model;
		},

		updateActorHasPhoneNumberModel: async function(originalModel, data) {
      // console.log("TCL ~ updateActorHasPhoneNumberModel:function ~ originalModel, data", originalModel, data);
			var updatedModel = originalModel;
			updatedModel.phoneNumberType = this.phoneNumberTypes[Number(data.phoneNumberTypeId)-1];
			updatedModel.phoneNumber.phoneNumber = data.phoneNumber;
			return updatedModel;
		},

		createCitizenshipModel: async function(formDataObject) {
    // console.log("TCL: createCitizenshipModel: formDataObject", formDataObject);
			var model = {
					id: 0,
					citizenshipTranslations: [{
						id: 0,
						language: {
							id: 1, // TODO set proper language
						},
						name: formDataObject.citizenshipName, // TODO link actual citizenships
					}],
				};
				// console.log("TCL: model", model);
			return model;
		},

		appendNewNameField: function() {
			var nameToAppend =
				`<div class="form-group" data-role="name-entry">
				<div class="form-row">
					<div class="col-md-2 text-center">
						<div class="form-check">
							<span>Add new name:</span>
						</div>
					</div>
					<div class="col-md-5">
						<label class="sr-only">Name*</label>
						<input type="text" class="form-control form-control-sm" name="actorName" placeholder="[Enter name]" aria-describedby="Name" minlength="3" maxlength="200" rows="1" data-role="actorName" required>
					</div>
					<div class="col-md-2">
						<label class="sr-only">Name used from</label>
						<input type="text" class="form-control form-control-sm actorDatasetsActorActorNamesNameUsedFrom" id="actorDatasetsActorActorNamesNameUsedFrom" name="nameUsedFrom" data-role="nameUsedFrom" placeholder="[Enter name used from]" aria-describedby="Name used from">
					</div>
					<div class="col-md-2">
						<label class="sr-only">Name used until</label>
						<input type="text" class="form-control form-control-sm actorDatasetsActorActorNamesNameUsedUntil" id="actorDatasetsActorActorNamesNameUsedUntil" name="nameUsedUntil" data-role="nameUsedUntil" placeholder="[Enter name used until]" aria-describedby="Name used until">
					</div>
					<div class="col-md-1">
						<button class="form-group__button js-form-group__button addActorNameButton btn btn-primary" data-role="add">
							<i class="fas fa-plus"></i>
						</button>
					</div>
				</div>
			</div>`;
			return nameToAppend;
		},

		appendNewAddressField: function() {
			var addressToAppend =
			`<div class="form-group" data-role="addressEntry">
				<div class="form-row">
					<div class="col-md-11">
						<fieldset>
							<legend>Add new Address:</legend>
							<div class="form-row">
								<div class="col-md-6">
									<label class="col-form-label col-form-label-sm">Street name</label>
									<input type="text"
												 class="form-control form-control-sm"
												 name="street"
												 data-role="street"
												 placeholder="[Enter street name]"
												 aria-describedby="Street name"
												 minlength="3"
												 maxlength="100"
												 rows="1">
								</div>
								<div class="col-md-2">
									<label class="col-form-label col-form-label-sm">Street number</label>
									<input type="text"
												 class="form-control form-control-sm"
												 name="streetNumber"
												 data-role="streetNumber"
												 placeholder="[Enter street number]"
												 aria-describedby="Street number"
												 maxlength="10">
								</div>
								<div class="col-md-4">
									<label class="col-form-label col-form-label-sm">Street addition</label>
									<input type="text"
												 class="form-control form-control-sm"
												 name="streetAddition"
												 data-role="streetAddition"
												 placeholder="[Enter street addition]"
												 aria-describedby="Street addition"
												 maxlength="50">
								</div>
							</div>
							<div class="form-row">
								<div class="col-md-3">
									<label class="col-form-label col-form-label-sm">Postal code</label>
									<input type="text"
												 class="form-control form-control-sm"
												 name="postalCode"
												 data-role="postalCode"
												 placeholder="[Enter postal code]"
												 aria-describedby="Postal code"
												 maxlength="8">
								</div>
								<div class="col-md-6">
									<label class="col-form-label col-form-label-sm">City</label>
									<input type="text"
												 class="form-control form-control-sm"
												 name="city"
												 data-role="city"
												 placeholder="[Enter city]"
												 aria-describedby="City"
												 maxlength="100">
								</div>
								<div class="col-md-3">
									<label class="col-form-label col-form-label-sm">Post office box</label>
									<input type="text"
												 class="form-control form-control-sm"
												 name="postOfficeBox"
												 ata-role="postOfficeBox"
												 placeholder="[Enter post office box]"
												 aria-describedby="Post office box"
												 maxlength="10">
								</div>
							</div>
							<div class="form-row">
								<div class="col-md-4">
									<label class="col-form-label col-form-label-sm">Address type*</label>
									<select class="form-control form-control-sm"
													name="addressTypeId"
													data-role="addressTypeId"
													required>
										<option value="" disabled selected hidden>[Choose address type...]</option>
										<option value="1"> </option>
										<option value="2">business</option>
										<option value="3">home</option>
										<option value="4">other</option>
									</select>
								</div>
								<div class="col-md-4">
									<label class="col-form-label col-form-label-sm">Address used from</label>
									<input type="text"
												 class="form-control form-control-sm actorDatasetsActorAddressesAddressUsedFrom"
												 name="addressUsedFrom"
												 data-role="addressUsedFrom"
												 placeholder="[Enter used from]"
												 aria-describedby="Address used from">
								</div>
								<div class="col-md-4">
									<label class="col-form-label col-form-label-sm">Address used until</label>
									<input type="text"
												 class="form-control form-control-sm actorDatasetsActorAddressesAddressUsedUntil"
												 name="addressUsedUntil"
												 data-role="addressUsedUntil"
												 placeholder="[Enter used until]"
												 aria-describedby="Address used until">
								</div>
							</div>
						</fieldset>
					</div>
					<div class="col-md-1 align-items--vertically">
						<button class="form-group__button js-form-group__button addActorAddressButton btn btn-primary" data-role="add">
							<i class="fas fa-plus"></i>
						</button>
					</div>
				</div>
			</div>`;
			return addressToAppend;
		},

		appendNewEmailAddressField: function() {
			var emailAddressToAppend =
				`<div class="form-group" data-role="emailAddressEntry">
					<div class="form-row">
						<div class="col-md-2 text-center">
							<div class="form-check">
								<span>Add new email:</span>
							</div>
						</div>
						<div class="col-md-3">
							<label class="sr-only">Email address type*</label>
							<select class="form-control form-control-sm" name="emailAddressTypeId" data-role="emailAddressTypeId" required>
								<option value="" disabled selected hidden>[Choose email type...]</option>
								<option value="1"> </option>
								<option value="2">home</option>
								<option value="3">work</option>
								<option value="4">other</option>
								<option value="5">mobile</option>
								<option value="6">custom</option>
							</select>
						</div>
						<div class="col-md-6">
							<label class="sr-only">Email address</label>
							<input type="text" class="form-control form-control-sm" name="emailAddress" data-role="emailAddress" placeholder="[Enter email address]" aria-describedby="Email address" required>
						</div>
						<div class="col-md-1">
							<button class="form-group__button js-form-group__button addEmailAddressButton btn btn-primary" data-role="add">
								<i class="fas fa-plus"></i>
							</button>
						</div>
					</div>
				</div>`;
			return emailAddressToAppend;
		},

		appendNewPhoneNumberField: function() {
			var phoneNumberToAppend =
				`<div class="form-group" data-role="phoneNumberEntry">
					<div class="form-row">
						<div class="col-md-2 text-center">
							<div class="form-check">
								<span>Add new phone number:</span>
							</div>
						</div>
						<div class="col-md-3">
							<label class="sr-only">Phone number type*</label>
							<select class="form-control form-control-sm" name="phoneNumberTypeId" data-role="phoneNumberTypeId" required>
								<option value="" disabled selected hidden>[Choose phone number type...]</option>
								<option value="1"> </option>
								<option value="2">mobile</option>
										<option value="3">home</option>
										<option value="4">work</option>
										<option value="5">pager</option>
										<option value="6">other</option>
										<option value="7">custom</option>
							</select>
						</div>
						<div class="col-md-6">
							<label class="sr-only">Phone number</label>
							<input type="text" class="form-control form-control-sm" name="phoneNumber" data-role="phoneNumber" maxlength="30" placeholder="[Enter phone number]" aria-describedby="Phone number" required>
						</div>
						<div class="col-md-1">
							<button class="form-group__button js-form-group__button addActorPhoneNumberButton btn btn-primary" data-role="add">
								<i class="fas fa-plus"></i>
							</button>
						</div>
					</div>
				</div>`;
			return phoneNumberToAppend;
		},

		appendMemberOfCollectiveDataset: function(i, actorId, actorName, memberOfCollectiveData, labelClassString, editMode) {
			// console.log("TCL: appendMemberOfCollectiveDataset -> i, actorId, actorName, memberOfCollectiveData, labelClassString, editMode", i, actorId, actorName, memberOfCollectiveData, labelClassString, editMode);
			var memberOfCollectiveFormData =
			`<div class="form-group" data-role="personIsMemberOfCollectiveEntry" data-id=`+i+` data-actor-id=`+actorId+`>
				<div class="form-row">
					<div class="col-md-11">
						<fieldset>
							<legend>Membership `+(i+1)+`</legend>
							<div class="form-row">
								<div class="hidden" aria-hidden="true">
									<input type="hidden"
												class="form-control form-control-sm"
												name="actorId"
												value="`+actorId+`">
								</div>
								<div class="col-md-6">
									<label class="sr-only">Member of collective</label>
									<input type="text" class="form-control form-control-sm actorDatasetsActorMemberOfCollectiveActorId"
													id="actorName_`+actorId+`"
													name="actorName"
													value="`+actorName.name+`"
													data-role="actorId[`+actorId+`]"
													placeholder="Select actor"
													aria-describedby="actor name"
													required>
								</div>
								<div class="col-md-6">
									<div data-role="personMemberOfCollectivesDetailsEntries">`;
			// append list of membership details
			var j = 0;
			for (; j < memberOfCollectiveData.length; j++) {
				memberOfCollectiveFormData +=	this.appendMemberOfCollectiveDetailFields(i, j, actorId, memberOfCollectiveData[j], labelClassString);
			}
			memberOfCollectiveFormData +=
									`</div>
									<div class="form-group" data-role="newPersonIsMemberOfCollectiveDetailsFields" data-details-id="`+j+`">`;
			if (editMode) {
				memberOfCollectiveFormData += this.appendMemberOfCollectiveNewDetailFields();
			}
			memberOfCollectiveFormData +=
										`<!-- form sheet: one row for new memberOfCollective detail information that shall be added to the member of collective -->
									</div>
								</div>
							</div>
						</fieldset>
					</div>
					<div class="col-md-1 align-items--vertically">
						<button type="button" class="form-group__button js-form-group__button removeActorMemberOfCollectiveButton btn btn-danger" data-role="remove">
							<i class="fas fa-trash-alt"></i>
						</button>
					</div>
				</div>
			</div>`;
			return memberOfCollectiveFormData;
		},

		/** adds empty fields for new memberOfCollective dataset */
		appendNewMemberOfCollectiveFields: function() {
    	// console.log("TCL: appendNewMemberOfCollectiveFields");
			// var numMembershipDetails = 0; // TODO
			var memberOfCollectiveToAppend =
			`<div class="form-group" data-role="personIsMemberOfCollectiveEntry" data-id=-1>
				<div class="form-row">
					<div class="col-md-11">
						<fieldset>
							<legend>Add new member of collective:</legend>
							<div class="form-row">
								<div class="col-md-6">
									<label class="sr-only">Member of collective</label>
									<select class="form-control form-control-sm"
													id="actorSelectDropdown"
													name="actorId"
													data-role="actorId"
													data-placeholder="Select actor"
													required>
									</select>
								</div>
								<div class="col-md-6">
									<div class="form-group"
											 data-role="newPersonIsMemberOfCollectiveDetailsFields"
											 data-details-id="0">`;
			memberOfCollectiveToAppend += this.appendMemberOfCollectiveNewDetailFields();
			memberOfCollectiveToAppend +=
									`</div>
								</div>
							</div>
						</fieldset>
					</div>
					<div class="col-md-1 align-items--vertically">
						<button type="button" class="form-group__button js-form-group__button addActorMemberOfCollectiveButton btn btn-primary" data-role="add">
							<i class="fas fa-plus"></i>
						</button>
					</div>
				</div>
			</div>`;
			return memberOfCollectiveToAppend;
		},

		/** adds fields for details of memberIsCollective data */
		appendMemberOfCollectiveDetailFields: function(i, j, actorId, memberOfCollectiveData, labelClassString) {
    	// console.log("TCL: appendMemberOfCollectiveDetailFields: i, j, actorId, memberOfCollectiveData, labelClassString", i, j, actorId, memberOfCollectiveData, labelClassString);
			var membershipDetails =
				`<div class="form-group" data-role="memberOfCollectiveDetailsEntry" data-details-id="`+j+`">
					<div class="form-row">
						<div class="hidden" aria-hidden="true">
							<input type="hidden"
										 class="form-control form-control-sm"
										 name="membershipDetailId"
										 value="`+memberOfCollectiveData.id+`">
						</div>
						<div class="col-md-5">
							<label class="`+labelClassString+`">Joined at</label>
							<input type="text"
										 class="form-control form-control-sm actorDatasetsActorMemberOfCollectivesJoinedAt"
										 name="joinedAt[`+actorId+`][`+j+`]"
										 data-role="joinedAt[`+actorId+`][`+j+`]"`;
				if (memberOfCollectiveData != null) { membershipDetails += `value="`+memberOfCollectiveData.joinedAt+`"`; }
				membershipDetails +=
										`placeholder="[Enter joined at]"
										aria-describedby="Collective joined at">
						</div>
						<div class="col-md-5">
							<label class="`+labelClassString+`">Left at</label>
							<input type="text"
										 class="form-control form-control-sm actorDatasetsActorMemberOfCollectivesLeftAt"
										 name="leftAt[`+actorId+`][`+j+`]"
										 data-role="leftAt[`+actorId+`][`+j+`]"`;
				if (memberOfCollectiveData != null) { membershipDetails += `value="`+memberOfCollectiveData.leftAt+`"`; }
				membershipDetails +=
										`placeholder="[Enter left at]"
										aria-describedby="Collective left at">
						</div>
						<div class="col-md-2 align-items--vertically">
							<button type="button" class="form-group__button js-form-group__button removeMembershipDetails btn btn-danger" data-role="removeMembershipDetails">
								<i class="fas fa-trash-alt"></i>
							</button>
						</div>
					</div>
				</div>`;
			return membershipDetails;
		},

		/** adds new fields for details of memberIsCollective data */
		appendMemberOfCollectiveNewDetailFields: function() {
			// console.log("TCL: appendMemberOfCollectiveNewDetailFields");
			var newMembershipDetails =
			`<div class="form-row">
				<div class="hidden" aria-hidden="true">
					<input type="hidden"
									class="form-control form-control-sm disableOnSubmit disableOnAdd"
									name="membershipDetailId"
									value="0">
				</div>
				<div class="col-md-5">
					<label class="sr-only">Joined at</label>
					<input type="text"
								class="form-control disableOnSubmit form-control-sm actorDatasetsActorMemberOfCollectivesJoinedAt"
								name="joinedAt"
								data-role="joinedAt"
								placeholder="[Enter joined at]"
								aria-describedby="Collective joined at">
				</div>
				<div class="col-md-5">
					<label class="sr-only">Left at</label>
					<input type="text"
								class="form-control disableOnSubmit form-control-sm actorDatasetsActorMemberOfCollectivesLeftAt"
								name="leftAt"
								data-role="leftAt"
								placeholder="[Enter left at]"
								aria-describedby="Collective left at">
				</div>
				<div class="col-md-2 align-items--vertically">
					<button type="button" class="form-group__button js-form-group__button addMembershipDetailsButton btn btn-primary" data-role="addMembershipDetails">
						<i class="fas fa-plus"></i>
					</button>
				</div>
			</div>`;
			return newMembershipDetails;
		},

		appendActorHasRolesDataset: function() {
			var entryToAppend =
			`<div class="form-group" data-role="actorHasRoleEntry">
				<div class="form-row">
					<div class="col-md-12">
            <label class="sr-only">Has Role(s)</label>
            <select class="form-control form-control-sm"
                    id="actorRolesMultiSelectDropdown"
                    name="roleId"
                    data-placeholder="Select role(s)"
                    multiple="multiple"
                    readonly="true">
            </select>
					</div>
				</div>
			</div>`;
			return entryToAppend;
		},

		appendActorRoleInMediumDataset: function() {
			var entryToAppend =
			`<div class="form-group" data-role="actorRoleInMediumEntry">
				<div class="form-row">
					<div class="col-md-12">
            <label class="sr-only">Has Role(s)</label>
            <select class="form-control form-control-sm"
                    id="actorRoleInMediumMultiSelectDropdown"
                    name="mediumId"
                    data-placeholder="Select media"
                    multiple="multiple"
                    readonly="true">
            </select>
					</div>
				</div>
			</div>`;
			return entryToAppend;
		},

		initFormDataSheetForEdit: function(type) {
			$('#actorDatasetsMetadataActorNameUsedFrom').datetimepicker({timepicker: false, changeMonth: true, changeYear: true, scrollInput: false, format: 'YYYY-MM-DD', yearStart: 1900, yearEnd: new Date().getFullYear()});
			$('#actorDatasetsMetadataActorNameUsedUntil').datetimepicker({timepicker: false, changeMonth: true, changeYear: true, scrollInput: false, format: 'YYYY-MM-DD', yearStart: 1900, yearEnd: new Date().getFullYear()});
			$('#actorDatasetsMetadataPersonDateOfBirth').datetimepicker({timepicker: false, changeMonth: true, changeYear: true, scrollInput: false, format: 'YYYY-MM-DD', yearStart: 1900, yearEnd: new Date().getFullYear()});
			$('#actorDatasetsMetadataPersonDayOfDeath').datetimepicker({timepicker: false, changeMonth: true, changeYear: true, scrollInput: false, format: 'YYYY-MM-DD', yearStart: 1900, yearEnd: new Date().getFullYear()});
			$('#actorDatasetsMetadataCollectiveFounded').datetimepicker({timepicker: false, changeMonth: true, changeYear: true, scrollInput: false, format: 'YYYY-MM-DD', yearStart: 1900, yearEnd: new Date().getFullYear()});
			$('#actorDatasetsMetadataCollectiveDisbanded').datetimepicker({timepicker: false, changeMonth: true, changeYear: true, scrollInput: false, format: 'YYYY-MM-DD', yearStart: 1900, yearEnd: new Date().getFullYear()});
			$('#actorFormMetadata :input').prop('disabled', false);
			this.hideFormButtons();
			$('#actorFormMetadataSubmitButton').show();
			$('#actorFormMetadataDismissButton').show();
			$('#actorFormDataSheetProfileImageSelection').show();
			$('#actorDatasetsMetadataActorName').focus();
			let imageSelect =
				`<label class="col-form-label col-form-label-sm">Change the associated profile images (max. 5 in total):</label>
				<div class="form-group" data-role="profileImagesEntry">
					<div class="form-row">
						<div class="col-md-12">
							<label class="sr-only">Profile Image(s)</label>
							<select class="form-control form-control-sm"
											id="actorProfileImageMultiSelectDropdown"
											name="imageId"
											data-placeholder="Select images"
											multiple="multiple"
											readonly="true">
							</select>
						</div>
					</div>
				</div>`;
			$('#actorFormDataSheetProfileImageSelection').append(imageSelect);
			function formatPreview(data) {
				// console.log("TCL: formatPreview -> data", data);
				if (data.loading) {
					return data.text;
				}
				var $container = $(
					"<div class='select2-result-repository clearfix display--flex'>" +
						"<div class='select2-result-repository__avatar max-height--100 max-width--100'><img src='/TIMAAT/api/medium/image/"+data.id+"/thumbnail"+"?token="+data.token+"'></div>" +
						"<div class='select2-result-repository__meta'>" +
							"<div class='select2-result-repository__title'></div>" +
							"<div class='select2-result-repository__description'></div>" +
						"</div>" +
					"</div>");
				$container.find('.select2-result-repository__title').text(data.text);
				return $container;
			};

			function formatSelection(data) {
				return data.text;
			}
			$('#actorProfileImageMultiSelectDropdown').select2({
				closeOnSelect: false,
				scrollAfterSelect: false,
				maximumSelectionLength: 5,
				allowClear: true,
				ajax: {
					url: 'api/medium/image/selectList/',
					type: 'GET',
					dataType: 'json',
					delay: 250,
					headers: {
						"Authorization": "Bearer "+TIMAAT.Service.token,
						"Content-Type": "application/json",
					},
					// additional parameters
					data: function(params) {
						// console.log("TCL: data: params", params);
						return {
							search: params.term,
							page: params.page
						};
					},
					processResults: function(data, params) {
						// console.log("TCL: processResults: data", data);
						params.page = params.page || 1;
						return {
							results: data,
							// pagination: {
							// 	more: (params.page * 10) < data.total_count
							// }
						};
					},
					cache: false
				},
				templateResult: formatPreview,
				templateSelection: formatSelection,
				minimumInputLength: 0,
				placeholder: 'Select image(s) (max. 5)'
			});
		},

		initFormForShow: function() {
			$('.formButtons').prop('disabled', false);
			$('.formButtons :input').prop('disabled', false);
			$('.formButtons').show();
      $('.formSubmitButton').hide();
      $('.formDismissButton').hide();
		},

		initFormDataSheetData: function(type) {
			$('.dataSheetData').hide();
			// $('.nameData').show();
			$('.actorData').show();
			$('.'+type+'Data').show();
		},

		hideFormButtons: function() {
			$('.formButtons').hide();
			$('.formButtons').prop('disabled', true);
			$('.formButtons :input').prop('disabled', true);
		},

		showAddActorButton: function() {
			$('.addActorButton').prop('disabled', false);
			$('.addActorButton :input').prop('disabled', false);
			$('.addActorButton').show();
		},

		hideAddActorButton: function() {
			$('.addActorButton').hide();
			$('.addActorButton').prop('disabled', true);
			$('.addActorButton :input').prop('disabled', true);
		},

		getActorFormDataSheetPersonSexDropdownData: function() {
			$('#personSexTypeSelectDropdown').select2({
				closeOnSelect: true,
				scrollAfterSelect: true,
				allowClear: true,
				ajax: {
					url: 'api/actor/sex/selectList/',
					type: 'GET',
					dataType: 'json',
					delay: 250,
					headers: {
						"Authorization": "Bearer "+TIMAAT.Service.token,
						"Content-Type": "application/json",
					},
					// additional parameters
					data: function(params) {
						// console.log("TCL: data: params", params);
						return {
							search: params.term,
							page: params.page
						};
					},
					processResults: function(data, params) {
						// console.log("TCL: processResults: data", data);
						params.page = params.page || 1;
						return {
							results: data
						};
					},
					cache: false
				},
				minimumInputLength: 0,
			});
		},

		setupActorDataTable: function() {
			// console.log("TCL: setupActorDataTable");
			// setup dataTable
			this.dataTableActor = $('#actorDatasetsActorDataTable').DataTable({
				"lengthMenu"    : [[10, 25, 50, 100, -1], [10, 25, 50, 100, "All"]],
				"order"         : [[ 0, 'asc' ]],
				"pagingType"    : "full", // "simple_numbers",
				"dom"           : '<lf<t>ip>',
				"processing"    : true,
				"stateSave"     : true,
				"scrollY"       : "60vh",
				"scrollCollapse": true,
				"scrollX"       : false,
				"rowId"					: 'id',
				"serverSide"    : true,
				"ajax"          : {
					"url"        : "api/actor/list",
					"contentType": "application/json; charset=utf-8",
					"dataType"   : "json",
					"data"       : function(data) {
						let serverData = {
							draw   : data.draw,
							start  : data.start,
							length : data.length,
							orderby: data.columns[data.order[0].column].name,
							dir    : data.order[0].dir,
							// actorSubtype: ''
						}
						if ( data.search && data.search.value && data.search.value.length > 0 )
							serverData.search = data.search.value;
						return serverData;
					},
					"beforeSend": function (xhr) {
						xhr.setRequestHeader('Authorization', 'Bearer '+TIMAAT.Service.token);
					},
					"dataSrc": function(data) {
						// console.log("TCL: TIMAAT.ActorDatasets.actor (last)", TIMAAT.ActorDatasets.actor);
						// setup model
						var actorArray = Array();
						data.data.forEach(function(actor) {
							if ( actor.id > 0 ) {
								actorArray.push(new TIMAAT.Actor(actor, 'actor'));
							}
						});
						TIMAAT.ActorDatasets.actors = actorArray;
						TIMAAT.ActorDatasets.actors.model = data.data;
						// console.log("TCL: TIMAAT.ActorDatasets.actor (current)", TIMAAT.ActorDatasets.actor);
						return data.data; // data.map(actor => new TIMAAT.Actor(actor));
					}
				},
				"initComplete": async function( settings, json ) {
					TIMAAT.ActorDatasets.dataTableActor.draw(); //* to scroll to selected row
				},
				"drawCallback": function( settings ) {
					let api = this.api();
					let i = 0;
					for (; i < api.context[0].aoData.length; i++) {
						if ($(api.context[0].aoData[i].nTr).hasClass('selected')) {
							let index = i+1;
							let position = $('table tbody > tr:nth-child('+index+')').position();
							if (position) {
								$('.dataTables_scrollBody').animate({
									scrollTop: api.context[0].aoData[i].nTr.offsetTop
								},100);
							}
						}
					}
				},
				"rowCallback": function( row, data ) {
					// console.log("TCL: rowCallback(actor) - row, data", row, data);
					if (data.id == TIMAAT.UI.selectedActorId) {
						TIMAAT.UI.clearLastSelection('actor');
						// $(row).addClass('selected');
						TIMAAT.UI.selectedActorId = data.id; //* as it is set to null in clearLastSelection
					}
				},
				"createdRow": function(row, data, dataIndex) {
        	// console.log("TCL: row, data, dataIndex", row, data, dataIndex);
					let actorElement = $(row);
					let actor = data;
					actor.ui = actorElement;
					actorElement.data('actor', actor);

					actorElement.on('click', '.name', function(event) {
						event.stopPropagation();
						TIMAAT.ActorDatasets.setDataTableOnItemSelect('actor', actor.id);
					});
				},
				"columns": [{
					data: 'id', name: 'name', className: 'name', render: function(data, type, actor, meta) {
						let displayActorTypeIcon = '';
						let actorType = actor.actorType.actorTypeTranslations[0].type;
						switch (actorType) {
							case 'person':
								displayActorTypeIcon = '  <i class="far fa-address-card"></i>';
							break;
							case 'collective':
								displayActorTypeIcon = '  <i class="fas fa-users"></i>';
							break;
						}
						let nameDisplay = `<p>` + displayActorTypeIcon + `  ` + actor.displayName.name +`</p>`;
						if (actor.birthName != null && actor.displayName.id != actor.birthName.id) {
							if (actorType == 'person') {
								nameDisplay += `<p><i>(BN: `+actor.birthName.name+`)</i></p>`;
							} else {
								nameDisplay += `<p><i>(OD: `+actor.birthName.name+`)</i></p>`;
							}
						}
						actor.actorNames.forEach(function(name) { // make additional names searchable in actor library
							if (name.id != actor.displayName.id && (actor.birthName == null || name.id != actor.birthName.id)) {
								nameDisplay += `<div class="display--none">`+name.name+`</div>`;
							}
						});
						return nameDisplay;
					}
				}],
				"language": {
					"decimal"     : ",",
					"thousands"   : ".",
					"search"      : "Search",
					"lengthMenu"  : "Show _MENU_ entries",
					"zeroRecords" : "No actors found.",
					"info"        : "Page _PAGE_ of _PAGES_ &middot; (_MAX_ actors total)",
					"infoEmpty"   : "No actors available.",
					"infoFiltered": "(&mdash; _TOTAL_ of _MAX_ actors(s))",
					"paginate"    : {
						"first"   : "<<",
						"previous": "<",
						"next"    : ">",
						"last"    : ">>"
					},
				},
			});
		},

		setupPersonDataTable: function() {
			// console.log("TCL: setupPersonDataTable");
			// setup dataTable
			this.dataTablePerson = $('#actorDatasetsPersonDataTable').DataTable({
				"lengthMenu"    : [[10, 25, 50, 100, -1], [10, 25, 50, 100, "All"]],
				"order"         : [[ 0, 'asc' ]],
				"pagingType"    : "full", // "simple_numbers",
				"dom"           : '<lf<t>ip>',
				"processing"    : true,
				"stateSave"     : true,
				"scrollY"       : "60vh",
				"scrollCollapse": true,
				"scrollX"       : false,
				"rowId"					: 'id',
				"serverSide"    : true,
				"ajax"          : {
					"url"        : "api/actor/person/list",
					"contentType": "application/json; charset=utf-8",
					"dataType"   : "json",
					"data"       : function(data) {
						let serverData = {
							draw   : data.draw,
							start  : data.start,
							length : data.length,
							orderby: data.columns[data.order[0].column].name,
							dir    : data.order[0].dir,
							// actorSubtype: 'person'
						}
						if ( data.search && data.search.value && data.search.value.length > 0 )
							serverData.search = data.search.value;
						return serverData;
					},
					"beforeSend": function (xhr) {
						xhr.setRequestHeader('Authorization', 'Bearer '+TIMAAT.Service.token);
					},
					"dataSrc": function(data) {
          	// console.log("TCL: data", data);
						// console.log("TCL: TIMAAT.ActorDatasets.persons (last)", TIMAAT.ActorDatasets.persons);
						// setup model
						var personArray = Array();
						data.data.forEach(function(actor) {
							if ( actor.id > 0 ) {
								personArray.push(new TIMAAT.Actor(actor, 'person'));
							}
						});
						TIMAAT.ActorDatasets.persons = personArray;
						TIMAAT.ActorDatasets.persons.model = data.data;
						// console.log("TCL: TIMAAT.ActorDatasets.persons (current)", TIMAAT.ActorDatasets.persons);
						return data.data;
					}
				},
				"initComplete": async function( settings, json ) {
					TIMAAT.ActorDatasets.dataTablePerson.draw(); //* to scroll to selected row
				},
				"drawCallback": function( settings ) {
					let api = this.api();
					let i = 0;
					for (; i < api.context[0].aoData.length; i++) {
						if ($(api.context[0].aoData[i].nTr).hasClass('selected')) {
							let index = i+1;
							let position = $('table tbody > tr:nth-child('+index+')').position();
							if (position) {
								$('.dataTables_scrollBody').animate({
									scrollTop: api.context[0].aoData[i].nTr.offsetTop
								},100);
							}
						}
					}
				},
				"rowCallback": function( row, data ) {
					// console.log("TCL: rowCallback(person) - row, data", row, data);
					if (data.id == TIMAAT.UI.selectedActorId) {
						// console.log("TCL: clear last selection 'person'");
						TIMAAT.UI.clearLastSelection('person');
						// $(row).addClass('selected');
						// $(row).child().addClass('table__row--selected-td');
						TIMAAT.UI.selectedActorId = data.id; //* as it is set to null in clearLastSelection
					}
				},
				"createdRow": function(row, data, dataIndex) {
        	// console.log("TCL: row, data, dataIndex", row, data, dataIndex);
					let actorElement = $(row);
					let actor = data;
					actor.ui = actorElement;
					actorElement.data('actor', actor);

					actorElement.on('click', '.name', function(event) {
						event.stopPropagation();
						TIMAAT.ActorDatasets.setDataTableOnItemSelect('person', actor.id);
					});
				},
				"columns": [{
					data: 'id', name: 'name', className: 'name', render: function(data, type, actor, meta) {
						// console.log("TCL: actor", actor);
						let nameDisplay = `<p>` + actor.displayName.name +`</p>`;
						if (actor.birthName != null && actor.displayName.id != actor.birthName.id) {
							nameDisplay += `<p><i>(BN: `+actor.birthName.name+`)</i></p>`;
						}
						actor.actorNames.forEach(function(name) { // make additional names searchable in actor library
							if (name.id != actor.displayName.id && (actor.birthName == null || name.id != actor.birthName.id)) {
								nameDisplay += `<div class="display--none">`+name.name+`</div>`;
							}
						});
						return nameDisplay;
					}
				}],
				"language": {
					"decimal"     : ",",
					"thousands"   : ".",
					"search"      : "Search",
					"lengthMenu"  : "Show _MENU_ entries",
					"zeroRecords" : "No person found.",
					"info"        : "Page _PAGE_ of _PAGES_ &middot; (_MAX_ persons total)",
					"infoEmpty"   : "No persons available.",
					"infoFiltered": "(&mdash; _TOTAL_ of _MAX_ person(s))",
					"paginate"    : {
						"first"   : "<<",
						"previous": "<",
						"next"    : ">",
						"last"    : ">>"
					},
				},
			});
		},

		setupCollectiveDataTable: function() {
			// console.log("TCL: setupCollectiveDataTable");
			// setup dataTable
			this.dataTableCollective = $('#actorDatasetsCollectiveDataTable').DataTable({
				"lengthMenu"    : [[10, 25, 50, 100, -1], [10, 25, 50, 100, "All"]],
				"order"         : [[ 0, 'asc' ]],
				"pagingType"    : "full", // "simple_numbers",
				"dom"           : '<lf<t>ip>',
				"processing"    : true,
				"stateSave"     : true,
				"scrollY"       : "60vh",
				"scrollCollapse": true,
				"scrollX"       : false,
				"rowId"					: 'id',
				"serverSide"    : true,
				"ajax"          : {
					"url"        : "api/actor/collective/list",
					"contentType": "application/json; charset=utf-8",
					"dataType"   : "json",
					"data"       : function(data) {
						let serverData = {
							draw   : data.draw,
							start  : data.start,
							length : data.length,
							orderby: data.columns[data.order[0].column].name,
							dir    : data.order[0].dir,
							// actorSubtype: 'collective'
						}
						if ( data.search && data.search.value && data.search.value.length > 0 )
							serverData.search = data.search.value;
						return serverData;
					},
					"beforeSend": function (xhr) {
						xhr.setRequestHeader('Authorization', 'Bearer '+TIMAAT.Service.token);
					},
					"dataSrc": function(data) {
          	// console.log("TCL: data", data);
						// console.log("TCL: TIMAAT.ActorDatasets.collectives (last)", TIMAAT.ActorDatasets.collectives);
						// setup model
						var collectiveArray = Array();
						data.data.forEach(function(actor) {
							if ( actor.id > 0 ) {
								collectiveArray.push(new TIMAAT.Actor(actor, 'collective'));
							}
						});
						TIMAAT.ActorDatasets.collectives = collectiveArray;
						TIMAAT.ActorDatasets.collectives.model = data.data;
						// console.log("TCL: TIMAAT.ActorDatasets.collectives (current)", TIMAAT.ActorDatasets.collectives);
						return data.data;
					}
				},
				"initComplete": async function( settings, json ) {
					TIMAAT.ActorDatasets.dataTableCollective.draw(); //* to scroll to selected row
				},
				"drawCallback": function( settings ) {
					let api = this.api();
					let i = 0;
					for (; i < api.context[0].aoData.length; i++) {
						if ($(api.context[0].aoData[i].nTr).hasClass('selected')) {
							let index = i+1;
							let position = $('table tbody > tr:nth-child('+index+')').position();
							if (position) {
								$('.dataTables_scrollBody').animate({
									scrollTop: api.context[0].aoData[i].nTr.offsetTop
								},100);
							}
						}
					}
				},
				"rowCallback": function( row, data ) {
					// console.log("TCL: rowCallback(collective) -  row, data", row, data);
					if (data.id == TIMAAT.UI.selectedActorId) {
						// console.log("TCL: clear last selection 'collective'");
						TIMAAT.UI.clearLastSelection('collective');
						// $(row).addClass('selected');
						// $(row).child().addClass('table__row--selected-td');
						TIMAAT.UI.selectedActorId = data.id; //* as it is set to null in clearLastSelection
					}
				},
				"createdRow": function(row, data, dataIndex) {
        	// console.log("TCL: row, data, dataIndex", row, data, dataIndex);
					let actorElement = $(row);
					let actor = data;
					actor.ui = actorElement;
					actorElement.data('actor', actor);

					actorElement.on('click', '.name', function(event) {
						event.stopPropagation();
						TIMAAT.ActorDatasets.setDataTableOnItemSelect('collective', actor.id);
					});
				},
				"columns": [{
					data: 'id', name: 'name', className: 'name', render: function(data, type, actor, meta) {
						// console.log("TCL: actor", actor);
						let nameDisplay = `<p>` + actor.displayName.name +`</p>`;
						if (actor.birthName != null && actor.displayName.id != actor.birthName.id) {
							nameDisplay += `<p><i>(OD: `+actor.birthName.name+`)</i></p>`;
						}
						actor.actorNames.forEach(function(name) { // make additional names searchable in actor library
							if (name.id != actor.displayName.id && (actor.birthName == null || name.id != actor.birthName.id)) {
								nameDisplay += `<div class="display--none">`+name.name+`</div>`;
							}
						});
						return nameDisplay;
					}
				}],
				"language": {
					"decimal"     : ",",
					"thousands"   : ".",
					"search"      : "Search",
					"lengthMenu"  : "Show _MENU_ entries",
					"zeroRecords" : "No collectives found.",
					"info"        : "Page _PAGE_ of _PAGES_ &middot; (_MAX_ collectives total)",
					"infoEmpty"   : "No collectives available.",
					"infoFiltered": "(&mdash; _TOTAL_ of _MAX_ collective(s))",
					"paginate"    : {
						"first"   : "<<",
						"previous": "<",
						"next"    : ">",
						"last"    : ">>"
					}
				}
			});
		},

		setDataTableOnItemSelect: function(type, selectedItemId) {
    	// console.log("TCL: setDataTableOnItemSelect -> type, selectedItemId", type, selectedItemId);
			// show tag editor - trigger popup
			TIMAAT.UI.hidePopups();
			switch (TIMAAT.UI.subNavTab) {
				case 'dataSheet':
					TIMAAT.UI.displayDataSetContentContainer('actorDataTab', 'actorFormMetadata', 'actor');
				break;
				case 'names':
					TIMAAT.UI.displayDataSetContentContainer('actorDataTab', 'actorFormNames', 'actor');
				break;
				case 'addresses':
					TIMAAT.UI.displayDataSetContentContainer('actorDataTab', 'actorFormAddresses', 'actor');
				break;
				case 'emails':
					TIMAAT.UI.displayDataSetContentContainer('actorDataTab', 'actorFormEmailAddresses', 'actor');
				break;
				case 'phoneNumbers':
					TIMAAT.UI.displayDataSetContentContainer('actorDataTab', 'actorFormPhoneNumbers', 'actor');
				break;
				case 'memberOfCollectives':
					TIMAAT.UI.displayDataSetContentContainer('actorDataTab', 'actorFormMemberOfCollectives', 'actor');
				break;
				case 'roles':
					TIMAAT.UI.displayDataSetContentContainer('actorDataTab', 'actorFormRoles', 'actor');
				break;
				case 'rolesInMedia':
					TIMAAT.UI.displayDataSetContentContainer('actorDataTab', 'actorFormActorRoleInMedium', 'actor');
				break;
			}
			TIMAAT.UI.clearLastSelection(type);
			let index;
			let selectedItem;
			switch (type) {
				case 'actor':
					index = this.actors.findIndex(({model}) => model.id === selectedItemId);
					selectedItem = this.actors[index];
				break;
				case 'person':
					index = this.persons.findIndex(({model}) => model.id === selectedItemId);
					selectedItem = this.persons[index];
				break;
				case 'collective':
					index = this.collectives.findIndex(({model}) => model.id === selectedItemId);
					selectedItem = this.collectives[index];
				break;
			}
			// TIMAAT.UI.addSelectedClassToSelectedItem(type, selectedItemId);
			if (type == 'actor') {
				if (TIMAAT.UI.subNavTab == 'dataSheet') {
					TIMAAT.URLHistory.setURL(null, selectedItem.model.displayName.name + ' ?? Datasets ?? ' + type[0].toUpperCase() + type.slice(1), '#actor/' + selectedItem.model.id);
				} else {
					TIMAAT.URLHistory.setURL(null, selectedItem.model.displayName.name + ' ?? Datasets ?? ' + type[0].toUpperCase() + type.slice(1), '#actor/' + selectedItem.model.id + '/' + TIMAAT.UI.subNavTab);
				}
				type = selectedItem.model.actorType.actorTypeTranslations[0].type;
			} else {
				if (TIMAAT.UI.subNavTab == 'dataSheet') {
					TIMAAT.URLHistory.setURL(null, selectedItem.model.displayName.name + ' ?? Datasets ?? ' + type[0].toUpperCase() + type.slice(1), '#actor/' + type + '/' + selectedItem.model.id);
				} else {
					TIMAAT.URLHistory.setURL(null, selectedItem.model.displayName.name + ' ?? Datasets ?? ' + type[0].toUpperCase() + type.slice(1), '#actor/' + type + '/' + selectedItem.model.id + '/' + TIMAAT.UI.subNavTab);
				}
			}
			$('#actorFormMetadata').data('type', type);
			$('#actorFormMetadata').data('actor', selectedItem);
			this.showAddActorButton();
			TIMAAT.UI.displayDataSetContent(TIMAAT.UI.subNavTab, selectedItem, 'actor');
		},

	}

}, window));
