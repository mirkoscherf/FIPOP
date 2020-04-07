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
		constructor(model, mediumType) {
			// setup model
			this.model = model;
			
			// create and style list view element
			var displayMediumTypeIcon = '';
			if (mediumType == 'medium') { // only display icon in media list
				displayMediumTypeIcon = '  <i class="fas fa-photo-video"></i>'; // default media icon
				switch (this.model.mediaType.mediaTypeTranslations[0].type) {
					case 'audio':
						displayMediumTypeIcon = '  <i class="far fa-file-audio"></i>';
					break;
					case 'document':
						displayMediumTypeIcon = '  <i class="far fa-file-pdf"></i>';
					break;
					case 'image':
						displayMediumTypeIcon = '  <i class="far fa-file-image"></i>';
					break;
					case 'software':
						displayMediumTypeIcon = '  <i class="fas fa-compact-disc"></i>';
					break;
					case 'text':
						displayMediumTypeIcon = '  <i class="far fa-file-alt"></i>';
					break;
					case 'video':
						displayMediumTypeIcon = '  <i class="far fa-file-video"></i>';
					break;
					case 'videogame':
						displayMediumTypeIcon = '  <i class="fas fa-gamepad"></i>';
					break;
				}
			}
			this.listView = $(
				`<li class="list-group-item">
					<div class="row">
						<div class="col-lg-10">` +
							displayMediumTypeIcon +
							`  <span class="timaat-mediadatasets-`+mediumType+`-list-name">
							</span>
						</div>
						<div class="col-lg-2 float-right">
						  <div class="btn-group-vertical">
								<div class="text-muted timaat-user-log" style="margin-left: 12px; margin-bottom: 10px;">
									<i class="fas fa-user"></i>							
								</div>
								<button type="button" title="Video hochladen" class="btn btn-outline btn-primary btn-sm timaat-mediadatasets-medium-upload float-left"><i class="fas fa-upload"></i></button>
								<button type="button" title="Video annotieren" class="btn btn-outline-success btn-sm btn-block timaat-mediadatasets-medium-annotate"><i class="fas fa-draw-polygon"></i></button>
						  </div>
						</div>
					</div>
				</li>`
			);

			// console.log("TCL: append me to list:", mediumType);
			$('#timaat-mediadatasets-'+mediumType+'-list').append(this.listView);     
			var medium = this; // save medium for system events
			
			$(document).on('added.upload.TIMAAT success.upload.TIMAAT removed.upload.TIMAAT', function(event, video) {
				if ( !video ) return;
				if ( medium.model.id != video.id ) return;
				
				if ( event.type == 'success' ) {
					medium.model.mediumVideo.status = video.mediumVideo.status;
					medium.model.mediumVideo.width = video.mediumVideo.width;
					medium.model.mediumVideo.height = video.mediumVideo.height;
					medium.model.mediumVideo.length = video.mediumVideo.length;
					medium.model.mediumVideo.frameRate = video.mediumVideo.frameRate;
				}
				
				medium.updateUI();
			});

			// attach video upload functionality
			this.listView.find('.timaat-mediadatasets-medium-upload').on('click', this, function(ev) {
				ev.stopPropagation();
				// TIMAAT.UI.hidePopups();
				console.log("TCL: updateUI");
				medium.updateUI();
				// }
			});

			this.listView.find('.timaat-mediadatasets-medium-upload i').on('click', function(ev) {
				$(this).parent().click();
			});

			this.updateUI(); 

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
				// console.log("TCL: Medium -> constructor -> open medium datasheet");
				ev.stopPropagation();
				// show tag editor - trigger popup
				TIMAAT.UI.hidePopups();
				$('.form').hide();
				$('.media-nav-tabs').show();
				$('.media-data-tabs').hide();
				$('.nav-tabs a[href="#mediumDatasheet"]').tab("show");
				$('#timaat-mediadatasets-media-metadata-form').data('medium', medium);
				TIMAAT.MediaDatasets.mediumFormDatasheet("show", mediumType, medium);
				// medium.listView.find('.timaat-mediadatasets-medium-list-tags').popover('show');
			});

			// annotate handler
			this.listView.find('.timaat-mediadatasets-medium-annotate').on('click', this, function(ev) {
				ev.stopPropagation();
				TIMAAT.UI.hidePopups();
				TIMAAT.UI.showComponent('videoplayer');
				console.log("TCL: Medium -> constructor -> medium", medium);
				// setup video in player
				TIMAAT.VideoPlayer.setupVideo(medium.model);
				// load video annotations from server
				TIMAAT.Service.getAnalysisLists(medium.model.id, TIMAAT.VideoPlayer.setupAnalysisLists);
			});

		}

		updateUI() {
			// console.log("TCL: Medium -> updateUI -> updateUI()");
			// title
			var mediumType = $('#timaat-mediadatasets-media-metadata-form').data('mediumType');
			var name = this.model.displayTitle.name;
			var type = this.model.mediaType.mediaTypeTranslations[0].type;
			if ( this.model.id < 0 ) name = "[nicht zugeordnet]";
			this.listView.find('.timaat-mediadatasets-'+mediumType+'-list-name').html(name);
			if (mediumType == 'medium') {
				this.listView.find('.timaat-mediadatasets-medium-list-mediatype').html(type);
			}

			if ( this.model.mediumVideo && this.model.mediumVideo.status == "nofile" && !TIMAAT.UploadManager.isUploading(this.model) ) {
				this.listView.find('.timaat-mediadatasets-medium-upload').show();
			} else {
				this.listView.find('.timaat-mediadatasets-medium-upload').hide();
			}

			if ( this.model.mediumVideo && this.model.mediumVideo.status != "nofile" && this.model.mediumVideo.status != "unavailable" ) {
				this.listView.find('.timaat-mediadatasets-medium-annotate').show();
			} else {
				this.listView.find('.timaat-mediadatasets-medium-annotate').hide();
			}
		}

		remove() {
			// console.log("TCL: Medium -> remove -> remove()");
			// remove medium from UI
			this.listView.remove(); // TODO remove tags from medium_has_tags
			$('#timaat-mediadatasets-media-metadata-form').data('medium', null);
			// remove from media list
			var index;
			for (var i = 0; i < TIMAAT.MediaDatasets.media.length; i++) {
				if (TIMAAT.MediaDatasets.media[i].model.id == this.model.id) {
					index = i;
					break;
				}
			}
			if (index > -1) {
				TIMAAT.MediaDatasets.media.splice(index, 1);
				TIMAAT.MediaDatasets.media.model.splice(index, 1);
			}
			// remove from submedium list
			switch (this.model.mediaType.id) {
				case 1: 
					// remove from audio list
					var audioIndex;
					for (var i = 0; i < TIMAAT.MediaDatasets.audios.length; i++) {
						if (TIMAAT.MediaDatasets.audios[i].model.id == this.model.id) {
							audioIndex = i;
							break;
						}
					}
					if (audioIndex > -1) {
						 TIMAAT.MediaDatasets.audios.splice(audioIndex, 1);
						 TIMAAT.MediaDatasets.audios.model.splice(audioIndex, 1);
					}
				break;
				case 2: 
					// remove from document list
					var documentIndex;
					for (var i = 0; i < TIMAAT.MediaDatasets.documents.length; i++) {
						if (TIMAAT.MediaDatasets.documents[i].model.id == this.model.id) {
							documentIndex = i;
							break;
						}
					}
					if (documentIndex > -1) {
						 TIMAAT.MediaDatasets.documents.splice(documentIndex, 1);
						 TIMAAT.MediaDatasets.documents.model.splice(documentIndex, 1);
					}
				break;
				case 3: 
					// remove from image list
					var imageIndex;
					for (var i = 0; i < TIMAAT.MediaDatasets.images.length; i++) {
						if (TIMAAT.MediaDatasets.images[i].model.id == this.model.id) {
							imageIndex = i;
							break;
						}
					}
					if (imageIndex > -1) {
						 TIMAAT.MediaDatasets.images.splice(imageIndex, 1);
						 TIMAAT.MediaDatasets.images.model.splice(imageIndex, 1);
					}
				break;
				case 4: 
					// remove from software list
					var softwareIndex;
					for (var i = 0; i < TIMAAT.MediaDatasets.softwares.length; i++) {
						if (TIMAAT.MediaDatasets.softwares[i].model.id == this.model.id) {
							softwareIndex = i;
							break;
						}
					}
					if (softwareIndex > -1) {
						 TIMAAT.MediaDatasets.softwares.splice(softwareIndex, 1);
						 TIMAAT.MediaDatasets.softwares.model.splice(softwareIndex, 1);
					}
				break;
				case 5: 
					// remove from text list
					var textIndex;
					for (var i = 0; i < TIMAAT.MediaDatasets.texts.length; i++) {
						if (TIMAAT.MediaDatasets.texts[i].model.id == this.model.id) {
							textIndex = i;
							break;
						}
					}
					if (textIndex > -1) {
						 TIMAAT.MediaDatasets.texts.splice(textIndex, 1);
						 TIMAAT.MediaDatasets.texts.model.splice(textIndex, 1);
					}
				break;
				case 6: 
					// remove from video list
					var videoIndex;
					for (var i = 0; i < TIMAAT.MediaDatasets.videos.length; i++) {
						if (TIMAAT.MediaDatasets.videos[i].model.id == this.model.id) {
							videoIndex = i;
							break;
						}
					}
					if (videoIndex > -1) {
						 TIMAAT.MediaDatasets.videos.splice(videoIndex, 1);
						 TIMAAT.MediaDatasets.videos.model.splice(videoIndex, 1);
					}
				break;
				case 7: 
					// remove from videogame list
					var videogameIndex;
					for (var i = 0; i < TIMAAT.MediaDatasets.videogames.length; i++) {
						if (TIMAAT.MediaDatasets.videogames[i].model.id == this.model.id) {
							videogameIndex = i;
							break;
						}
					}
					if (videogameIndex > -1) {
						 TIMAAT.MediaDatasets.videogames.splice(videogameIndex, 1);
						 TIMAAT.MediaDatasets.videogames.model.splice(videogameIndex, 1);
					}
				break;
			}
		}

	}
	
}, window));
