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

	TIMAAT.Province = class Province {
		constructor(model) {
			// console.log("TCL: Province -> constructor -> model", model)
			// setup model
			this.model = model;

			// create and style list view element
			var deleteProvinceButton = '<button type="button" class="btn btn-outline btn-danger btn-sm timaat-province-remove float-left"><i class="fas fa-trash-alt"></i></button>';
			if ( model.id < 0 ) deleteProvinceButton = '';
			this.listView = $('<li class="list-group__item"> ' +
				deleteProvinceButton +
				'<span class="timaat-province-list-name"></span>' +
				'<br>' +
				'<div class="timaat-province-list-count text-muted float-left"></div>' +
				'<div class="float-right text-muted timaat-user-log" style="margin-right: -14px;"><i class="fas fa-user"></i></div>' +
			'</li>'
			);

			$('#timaat-province-list').append(this.listView);
			this.updateUI();
			var province = this; // save province for system events

			// attach user log info
			this.listView.find('.timaat-user-log').popover({
				placement: 'right',
				title: '<i class="fas fa-user"></i> editing log',
				trigger: 'click',
				html: true,
				content: '<div class="timaat-user-log-details">Loading ...</div>',
				container: 'body',
				boundary: 'viewport',
			});

			this.listView.find('.timaat-user-log').on('show.bs.popover', function () {
				TIMAAT.UI.hidePopups();
			});

			this.listView.find('.timaat-user-log').on('inserted.bs.popover', function () {
				if (province.model.location.lastEditedAt == null) {
					$('.timaat-user-log-details').html(
						'<b><i class="fas fa-plus-square"></i> Created by <span class="timaat-userId" data-userId="'+province.model.location.createdByUserAccountId+'">[ID '+province.model.location.createdByUserAccountId+']</span></b><br>\
						'+TIMAAT.Util.formatDate(province.model.location.createdAt)+'<br>'
					);
					$('.timaat-user-log-details').find('.timaat-userId').each(function(index,item) {TIMAAT.Util.resolveUserID(item, "me")});
				} else {
					$('.timaat-user-log-details').html(
							'<b><i class="fas fa-plus-square"></i> Created by <span class="timaat-userId" data-userId="'+province.model.location.createdByUserAccountId+'">[ID '+province.model.location.createdByUserAccountId+']</span></b><br>\
							'+TIMAAT.Util.formatDate(province.model.location.createdAt)+'<br>\
							<b><i class="fas fa-edit"></i> Edited by <span class="timaat-userId" data-userId="'+province.model.location.lastEditedByUserAccountId+'">[ID '+province.model.location.lastEditedByUserAccountId+']</span></b><br>\
							'+TIMAAT.Util.formatDate(province.model.location.lastEditedAt)+'<br>'
					);
					$('.timaat-user-log-details').find('.timaat-userId').each(function(index,item) {TIMAAT.Util.resolveUserID(item, "me")});
				}
			});

			// attach user log info
			this.listView.find('.timaat-user-log').on('click', function(ev) {
				ev.preventDefault();
				ev.stopPropagation();
			});

			// attach province handlers
			$(this.listView).on('click', this, function(ev) {
				ev.stopPropagation();
				// show tag editor - trigger popup
				TIMAAT.UI.hidePopups();
				// province.listView.find('.timaat-province-list-tags').popover('show');
			});

			$(this.listView).on('dblclick', this, function(ev) {
				ev.stopPropagation();
				TIMAAT.UI.hidePopups();
				// show metadata editor
				$('#timaat-locationdatasets-province-meta').data('province', province);
				$('#timaat-locationdatasets-province-meta').modal('show');
			});

			// remove handler
			this.listView.find('.timaat-province-remove').on('click', this, function(ev) {
				ev.stopPropagation();
				TIMAAT.UI.hidePopups();
				$('#timaat-locationdatasets-province-delete').data('province', province);
				$('#timaat-locationdatasets-province-delete').modal('show');
			});
		}

		updateUI() {
			// console.log("TCL: Province -> updateUI -> updateUI()");
			// title
			var name = this.model.location.locationTranslations[0].name;
			if ( this.model.id < 0 ) name = "[not assigned]";
			this.listView.find('.timaat-province-list-name').text(name);
		}

		remove() {
			// console.log("TCL: Province -> remove -> remove()");
			// remove province from UI
			this.listView.remove(); // TODO remove tags from province_has_tags
			// remove from province list
			var index = TIMAAT.LocationDatasets.provinces.indexOf(this);
			if (index > -1) TIMAAT.LocationDatasets.provinces.splice(index, 1);
			// remove from model list
			index = TIMAAT.LocationDatasets.provinces.model.indexOf(this);
			if (index > -1) TIMAAT.LocationDatasets.provinces.model.splice(index, 1);
		}

	}

}, window));
