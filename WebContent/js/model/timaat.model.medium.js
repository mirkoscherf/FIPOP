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
			// console.log("TCL: Medium -> constructor -> model", model)
			// setup model
			this.model = model;
			// console.log("TCL: Medium -> constructor -> model", model);
			
			// create and style list view element
			// var mediumType = $('#timaat-mediadatasets-media-metadata-form').data('mediumType');
      // console.log("TCL: Medium -> constructor -> mediumType", mediumType);
			var deleteMediumButton = '<button type="button" class="btn btn-outline btn-danger btn-sm timaat-mediadatasets-medium-remove float-left" id="timaat-mediadatasets-medium-remove"><i class="fas fa-trash-alt"></i></button>';
			var uploadVideoButton = "";
			if ( this.model.mediumVideo && model.mediumVideo.status == "nofile" ) {
				uploadVideoButton = '<button type="button" class="btn btn-outline btn-primary btn-sm timaat-mediadatasets-video-list-upload float-left"><i class="fas fa-upload"></i></button>';
			}
			// console.log("TCL: Medium -> constructor -> uploadVideoButton", uploadVideoButton);
			if ( model.id < 0 ) { 
				deleteMediumButton = '';
			};
			var displayMediaType = "";
			if (mediumType == 'medium') {
				displayMediaType = 
				`<br><br>
				<span class="timaat-mediadatasets-medium-list-mediatype"></span>`;
			}
			this.listView = $(
				`<li class="list-group-item">
					<div class="row">
						<div class="col-lg-2">
							<div class=btn-group-vertical>` +
								deleteMediumButton +
							`</div>
						</div>
						<div class="col-lg-8">
							<span class="timaat-mediadatasets-`+mediumType+`-list-name"></span>` +
							displayMediaType +
						`</div>
						<div class="col-lg-2 float-right">
						  <div class=btn-group-vertical>
								<div class="text-muted timaat-user-log" style="margin-left: 12px; margin-bottom: 10px;">
									<i class="fas fa-user"></i>							
								</div>` +
								uploadVideoButton +
						  `</div>
						</div>
					</div>
				</li>`
			);

			// console.log("TCL: append me to list:", mediumType);
			$('#timaat-mediadatasets-'+mediumType+'-list').append(this.listView);     
			var medium = this; // save medium for system events
			
			// attach video upload functionality
			if ( mediumType == 'video' && model.status == 'nofile' ) {
				var video = this.model.mediumVideo;
				this.listView.find('.timaat-mediadatasets-video-list-upload').dropzone({
					url: "/TIMAAT/api/medium/video/"+medium.model.id+"/upload",
					createImageThumbnails: false,
					acceptedFiles: 'video/mp4',
					maxFilesize: 1024,
					timeout: 60*60*1000, // 1 hour
					maxFiles: 1,
					headers: {'Authorization': 'Bearer '+TIMAAT.Service.token},
					previewTemplate: '<div class="dz-preview dz-file-preview" style="margin-top:0px"> \
						<div class="progress" style="height: 24px;"> \
						  	<div class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" aria-valuemin="0" aria-valuemax="100" data-dz-uploadprogress><span data-dz-name></span></div> \
							</div> \
						</div>',
					complete: function(file) {
							if ( file.status == "success" && file.accepted ) {
								var newVideo = JSON.parse(file.xhr.response);
								video.status = newVideo;
								this.listView.find('.timaat-mediadatasets-video-list-upload').hide();
								video.width = newVideo.width;
								video.height = newVideo.height;
								video.length = newVideo.length;
								video.frameRate = newVideo.frameRate;
							}
							this.removeFile(file);
					}
				});
				this.listView.find('.timaat-mediadatasets-video-list-upload i').on('click', function(ev) {$(this).parent().click();});
			}

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

			// remove handler
			this.listView.find('.timaat-mediadatasets-medium-remove').click(this, function(ev) {
				ev.stopPropagation();
				TIMAAT.UI.hidePopups();				
				$('#timaat-mediadatasets-medium-delete').data('medium', medium);
				$('#timaat-mediadatasets-medium-delete').modal('show');
			});
		}

		updateUI() {
			// console.log("TCL: Medium -> updateUI -> updateUI() -> model", this.model);
			// title
			var mediumType = $('#timaat-mediadatasets-media-metadata-form').data('mediumType');
			var name = this.model.title.name;
			var type = this.model.mediaType.mediaTypeTranslations[0].type;
			if ( this.model.id < 0 ) name = "[nicht zugeordnet]";
			this.listView.find('.timaat-mediadatasets-'+mediumType+'-list-name').text(name);
			if (mediumType == 'medium') {
				this.listView.find('.timaat-mediadatasets-medium-list-mediatype').html(type);
			}
		}

		remove() {
			// console.log("TCL: Medium -> remove -> remove()");
			// remove medium from UI
			this.listView.remove(); // TODO remove tags from medium_has_tags
			$('#timaat-mediadatasets-media-metadata-form').data('medium', null);
			// remove from media list
			var index = TIMAAT.MediaDatasets.media.indexOf(this);
			var mediumIdToDelete;
			if (index > -1) {
				 console.log("TCL: Medium -> remove -> index", index);
				mediumIdToDelete = TIMAAT.MediaDatasets.media[index].model.id
				TIMAAT.MediaDatasets.media.splice(index, 1);
				TIMAAT.MediaDatasets.media.model.splice(index, 1);
			}
			console.log("TCL: Medium -> remove -> mediumIdToDelete", mediumIdToDelete);
			// remove from media model list
			// var indexModel = TIMAAT.MediaDatasets.media.model.indexOf(this);
      // console.log("TCL: Medium -> remove -> indexModel", indexModel);
			// if (indexModel > -1) {
      //   console.log("TCL: Medium -> remove -> indexModel", indexModel);
				// TIMAAT.MediaDatasets.media.model.splice(index, 1);
			// }
			switch (this.model.mediaType.id) {
				case 6: 
					// remove from video list
					console.log("TCL: Medium -> remove -> video", this);
					console.log("TCL: Medium -> remove -> TIMAAT.MediaDatasets.videos", TIMAAT.MediaDatasets.videos);
					var videoIndex;
					// var index = TIMAAT.MediaDatasets.videos.indexOf(this);
					for (var i = 0; i < TIMAAT.MediaDatasets.videos.length; i++) {
						if (TIMAAT.MediaDatasets.videos[i].model.id == mediumIdToDelete) {
							videoIndex = i;
							break;
						}
					}
          console.log("TCL: Medium -> remove -> videoIndex", videoIndex);
					if (videoIndex > -1) {
						 TIMAAT.MediaDatasets.videos.splice(videoIndex, 1);
						 TIMAAT.MediaDatasets.videos.model.splice(videoIndex, 1);
					}
					// // remove from model list
					// var indexModel = TIMAAT.MediaDatasets.videos.model.indexOf(this);
          // console.log("TCL: Medium -> remove -> indexModel", indexModel);
					// if (indexModel > -1) TIMAAT.MediaDatasets.videos.model.splice(index, 1);
					// console.log("TCL: Medium -> remove -> TIMAAT.MediaDatasets.videos", TIMAAT.MediaDatasets.videos);
			break;
			}
		}

	}
	
}, window));
