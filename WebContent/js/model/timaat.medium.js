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
	
	TIMAAT.Medium = class Medium {
		constructor(model) {
			// console.log("TCL: Medium -> constructor -> model", model)
			// setup model
			this.model = model;

			// create and style list view element
			var editMediumButton = '<button type="button" class="btn btn-outline btn-secondary btn-sm timaat-medium-edit float-left" id="timaat-medium-edit"><i class="fas fa-edit"></i></button>';
			var deleteMediumButton = '<button type="button" class="btn btn-outline btn-danger btn-sm timaat-medium-remove float-left" id="timaat-medium-remove"><i class="fas fa-trash-alt"></i></button>';
			if ( model.id < 0 ) { 
				deleteMediumButton = '';
				editMediumButton = '';
			};
			this.listView = $(
				`<li class="list-group-item">
					<div class="row">
						<div class="col-lg-2">
							<div class=btn-group-vertical>` +
								editMediumButton +
								deleteMediumButton +
							`</div>
						</div>
						<div class="col-lg-8">
							<span class="timaat-medium-list-name"></span>
							<br><br>
							<span class="timaat-medium-list-medium-type-id"></span>
						</div>
						<div class="col-lg-2">
							<div class="float-right text-muted timaat-user-log" style="margin-right: -14px;">
								<i class="fas fa-user"></i>
							</div>
						</div>
					</div>
				</li>`
			);

			$('#timaat-medium-list').append(this.listView);
			this.updateUI();      
			var medium = this; // save medium for system events

			// attach user log info
			this.listView.find('.timaat-user-log').popover({
				placement: 'right',
				title: '<i class="fas fa-user"></i> Bearbeitungslog',
				trigger: 'click',
				html: true,
				content: '<div class="timaat-user-log-details">Lade...</div>',
				container: 'body',
				boundary: 'viewport',				
			});

			this.listView.find('.timaat-user-log').on('show.bs.popover', function () {
				TIMAAT.UI.hidePopups();
			});

			this.listView.find('.timaat-user-log').on('inserted.bs.popover', function () {
				if (medium.model.lastEditedAt == null) {
					$('.timaat-user-log-details').html(
						'<b><i class="fas fa-plus-square"></i> Erstellt von <span class="timaat-user-id" data-userid="'+medium.model.createdByUserAccount.id+'">[ID '+medium.model.createdByUserAccount.id+']</span></b><br>\
						'+TIMAAT.Util.formatDate(medium.model.createdAt)+'<br>'
					);
					$('.timaat-user-log-details').find('.timaat-user-id').each(function(index,item) {TIMAAT.Util.resolveUserID(item, "mir")});
				} else {
					$('.timaat-user-log-details').html(
							'<b><i class="fas fa-plus-square"></i> Erstellt von <span class="timaat-user-id" data-userid="'+medium.model.createdByUserAccount.id+'">[ID '+medium.model.createdByUserAccount.id+']</span></b><br>\
							'+TIMAAT.Util.formatDate(medium.model.createdAt)+'<br>\
							<b><i class="fas fa-edit"></i> Bearbeitet von <span class="timaat-user-id" data-userid="'+medium.model.lastEditedByUserAccount.id+'">[ID '+medium.model.lastEditedByUserAccount.id+']</span></b><br>\
							'+TIMAAT.Util.formatDate(medium.model.lastEditedAt)+'<br>'
					);
					$('.timaat-user-log-details').find('.timaat-user-id').each(function(index,item) {TIMAAT.Util.resolveUserID(item, "mir")});
				}
			});

			// attach user log info
			this.listView.find('.timaat-user-log').on('click', function(ev) {
				ev.preventDefault();
				ev.stopPropagation();
			});

			// attach medium handlers
			$(this.listView).on('click', this, function(ev) {
				console.log("TCL: Medium -> constructor -> open medium datasheet");
				ev.stopPropagation();
				// show tag editor - trigger popup
				TIMAAT.UI.hidePopups();
				$('#timaat-mediadatasets-medium-form').data('medium', medium);
				TIMAAT.MediaDatasets.mediumFormData("show", medium);				
				// medium.listView.find('.timaat-medium-list-tags').popover('show');
			});

			// edit handler
			$(this.listView).find('.timaat-medium-edit').on('click', this, function(ev) {
				ev.stopPropagation();
				TIMAAT.UI.hidePopups();
				$('#timaat-mediadatasets-medium-form').data('medium', medium);
				TIMAAT.MediaDatasets.mediumFormData("edit", medium);
				// medium.listView.find('.timaat-medium-list-tags').popover('show');
			});

			// TODO: make button click in form work
			// // in-form edit handler
			// $(this.listView).find('.timaat-medium-edit-in-form').on('click', this, function(ev) {
      // console.log("TCL: Medium -> constructor -> this", this);
			// 	// console.log("TCL: Medium -> constructor -> this.listView.find('.timaat-medium-edit')");
			// 	ev.stopPropagation();
			// 	TIMAAT.UI.hidePopups();
			// 	$('#timaat-mediadatasets-medium-form').data('medium', medium);
			// 	// console.log("TCL: Medium -> constructor -> medium", medium);
			// 	TIMAAT.MediaDatasets.mediumFormData("edit", medium);
			// 	// medium.listView.find('.timaat-medium-list-tags').popover('show');
			// });

			// remove handler
			this.listView.find('.timaat-medium-remove').click(this, function(ev) {
      	console.log("TCL: Medium -> constructor -> this.listView.find('.timaat-medium-remove')");
				ev.stopPropagation();
				TIMAAT.UI.hidePopups();				
				$('#timaat-mediadatasets-medium-delete').data('medium', medium);
				$('#timaat-mediadatasets-medium-delete').modal('show');
			});
		}

		updateUI() {
			// console.log("TCL: Medium -> updateUI -> updateUI() -> model", this.model);
			// title
			var name = this.model.title.name;
			var type = this.model.mediaType.mediaTypeTranslations[0].type;
			if ( this.model.id < 0 ) name = "[nicht zugeordnet]";
			this.listView.find('.timaat-medium-list-name').text(name);
			this.listView.find('.timaat-medium-list-medium-type-id').html(type);
		}

		remove() {
			// console.log("TCL: Medium -> remove -> remove()");
			// remove medium from UI
			this.listView.remove(); // TODO remove tags from medium_has_tags
			// remove from medium list
			var index = TIMAAT.MediaDatasets.media.indexOf(this);
			if (index > -1) TIMAAT.MediaDatasets.media.splice(index, 1);
			// remove from model list
			index = TIMAAT.MediaDatasets.media.model.indexOf(this);
			if (index > -1) TIMAAT.MediaDatasets.media.model.splice(index, 1);
		}

	}
	
}, window));