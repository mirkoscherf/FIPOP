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

	TIMAAT.AddressType = class AddressType {
		constructor(model) {
			// console.log("TCL: AddressType -> constructor -> model", model)
			// setup model
			this.model = model;
			// model.ui = this;

			// create and style list view element
			var deleteAddressTypeButton = '<button type="button" class="btn btn-outline btn-danger btn-sm addressTypeRemoveButton float-left"><i class="fas fa-trash-alt"></i></button>';
			if ( model.id < 0 ) deleteAddressTypeButton = '';
			this.listView = $('<li class="list-group-item"> '
				+ deleteAddressTypeButton +
				'<span class="addressTypeListType"></span>' +
				'<br> \
				<div class="addressTypeListCount text-muted float-left"></div> \
				</li>'
			);

			$('#actorDatasetsAddressTypeList').append(this.listView);
			this.updateUI();
			var AddressType = this; // save AddressType for system AddressTypes

			// attach user log info
			this.listView.find('.timaat__user-log').popover({
				placement: 'right',
				title: '<i class="fas fa-user"></i> editing log',
				trigger: 'click',
				html: true,
				content: '<div class="userLogDetails">Loading ...</div>',
				container: 'body',
				boundary: 'viewport',
			});

			this.listView.find('.timaat__user-log').on('show.bs.popover', function () {
				TIMAAT.UI.hidePopups();
			});

			this.listView.find('.timaat__user-log').on('inserted.bs.popover', function () {
				if (addressType.model.lastEditedAt == null) {
					$('.userLogDetails').html(
						'<b><i class="fas fa-plus-square"></i> Created by <span class="userId" data-user-id="'+addressType.model.createdByUserAccountId+'">[ID '+addressType.model.createdByUserAccountId+']</span></b><br>\
						'+TIMAAT.Util.formatDate(addressType.model.createdAt)+'<br>'
					);
					$('.userLogDetails').find('.userId').each(function(index,item) {TIMAAT.Util.resolveUserID(item, "me")});
				} else {
					$('.userLogDetails').html(
							'<b><i class="fas fa-plus-square"></i> Created by <span class="userId" data-user-id="'+addressType.model.createdByUserAccountId+'">[ID '+addressType.model.createdByUserAccountId+']</span></b><br>\
							'+TIMAAT.Util.formatDate(addressType.model.createdAt)+'<br>\
							<b><i class="fas fa-edit"></i> Edited by <span class="userId" data-user-id="'+addressType.model.lastEditedByUserAccountId+'">[ID '+addressType.model.lastEditedByUserAccountId+']</span></b><br>\
							'+TIMAAT.Util.formatDate(addressType.model.lastEditedAt)+'<br>'
					);
					$('.userLogDetails').find('.userId').each(function(index,item) {TIMAAT.Util.resolveUserID(item, "me")});
				}
			});

			// attach user log info
			this.listView.find('.timaat__user-log').on('click', function(ev) {
				ev.preventDefault();
				ev.stopPropagation();
			});

			// attach AddressType handlers
			$(this.listView).on('dblclick', this, function(ev) {
				ev.stopPropagation();
				TIMAAT.UI.hidePopups();
				// show metadata editor
				$('#actorDatasetsAddressTypeMeta').data('AddressType', AddressType);
				$('#actorDatasetsAddressTypeMeta').modal('show');
			});

			// remove handler
			this.listView.find('.addressTypeRemoveButton').on('click', this, function(ev) {
				ev.stopPropagation();
				TIMAAT.UI.hidePopups();
				$('#actorDatasetsAddressTypeDeleteModal').data('AddressType', AddressType);
				$('#actorDatasetsAddressTypeDeleteModal').modal('show');
			});
		}

		updateUI() {
			// console.log("TCL: AddressType -> updateUI -> updateUI() -> model", this.model);
			// title
			var type = this.model.addressTypeTranslations[0].type;
			if ( this.model.id < 0 ) type = "[not assigned]";
			this.listView.find('.addressTypeListName').text(type);
		}

		remove() {
			// console.log("TCL: AddressType -> remove -> remove()");
			// remove AddressType from UI
			this.listView.remove();
			// remove from AddressType list
			var index = TIMAAT.ActorDatasets.addressTypes.indexOf(this);
			if (index > -1) TIMAAT.ActorDatasets.addressTypes.splice(index, 1);
			// remove from model list
			index = TIMAAT.ActorDatasets.addressTypes.model.indexOf(this);
			if (index > -1) TIMAAT.ActorDatasets.addressTypes.model.splice(index, 1);
		}
	}

}, window));
