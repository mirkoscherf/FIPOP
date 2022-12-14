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

	TIMAAT.Music = class Music {
		constructor(model, musicType) {
      // console.log("TCL: Music -> constructor -> model, musicType", model, musicType);
			// setup model
			this.model = model;

			// create and style list view element
			var displayMusicTypeIcon = '';
			if (musicType == 'music') { // Necessary to fix upload button functionality
				musicType = model.musicType.musicTypeTranslations[0].type;
			}
			// if (musicType == 'music') { // only display icon in music list
				// displayMusicTypeIcon = '  <i class="fas fa-photo-video"></i> '; // default music icon
				switch (musicType) {
					case 'nashid':
						// displayMusicTypeIcon = '  <i class="far fa-file-audio"></i> ';
					break;
					case 'churchMusic':
						// displayMusicTypeIcon = '  <i class="far fa-file-audio"></i> ';
					break;
				}
			// }
			this.listView = $(
				`<li class="list-group-item">
					<div class="row">
						<div class="col-lg-10">` +
							displayMusicTypeIcon +
							`<span class="musicDatasets`+musicType+`ListName">
							</span>
						</div>
						<div class="col-lg-2 float-right">
						  <div class="btn-group-vertical">
								<div class="text-muted timaat__user-log">
									<i class="fas fa-user"></i>
								</div>
								<button type="button" title="Annotate `+musicType+`" class="btn btn-outline-success btn-sm btn-block musicDatasetsMusicAnnotateButton"><i class="fas fa-draw-polygon"></i></button>
						  </div>
						</div>
					</div>
				</li>`
			);

			// console.log("TCL: append me to list:", musicType);
			// $('#musicDatasets'+musicType+'List').append(this.listView);
			var music = this; // save music for system events

			this.updateUI();

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
				if (music.model.lastEditedAt == null) {
					$('.userLogDetails').html(
						'<b><i class="fas fa-plus-square"></i> Created by <span class="userId" data-user-id="'+music.model.createdByUserAccountId+'">[ID '+music.model.createdByUserAccountId+']</span></b><br>\
						'+TIMAAT.Util.formatDate(music.model.createdAt)+'<br>'
					);
					$('.userLogDetails').find('.userId').each(function(index,item) {TIMAAT.Util.resolveUserID(item, "me")});
				} else {
					$('.userLogDetails').html(
							'<b><i class="fas fa-plus-square"></i> Created by <span class="userId" data-user-id="'+music.model.createdByUserAccountId+'">[ID '+music.model.createdByUserAccountId+']</span></b><br>\
							'+TIMAAT.Util.formatDate(music.model.createdAt)+'<br>\
							<b><i class="fas fa-edit"></i> Edited by <span class="userId" data-user-id="'+music.model.lastEditedByUserAccountId+'">[ID '+music.model.lastEditedByUserAccountId+']</span></b><br>\
							'+TIMAAT.Util.formatDate(music.model.lastEditedAt)+'<br>'
					);
					$('.userLogDetails').find('.userId').each(function(index,item) {TIMAAT.Util.resolveUserID(item, "me")});
				}
			});

			// attach user log info
			this.listView.find('.timaat__user-log').on('click', function(ev) {
				ev.preventDefault();
				ev.stopPropagation();
			});
		}

		updateUI() {
			// console.log("TCL: Music -> updateUI -> updateUI()");
			// title
			var type = $('#musicFormMetadata').data('type');
			var name = this.model.displayTitle.name;
			if ( this.model.id < 0 ) name = "[not assigned]";
			this.listView.find('.musicDatasets'+type+'ListName').html(name);
			if (type == 'music') {
				this.listView.find('.musicDatasetsMusicListMusicType').html(type);
			}

			// if ( this.model.fileStatus != "noFile" && this.model.fileStatus != "unavailable" ) {
			// 	this.listView.find('.musicDatasetsMusicAnnotateButton').show();
			// } else {
			// 	this.listView.find('.musicDatasetsMusicAnnotateButton').hide();
			// }
		}

		remove() {
			// console.log("TCL: Music -> remove -> remove()");
			// remove music from UI
			this.listView.remove(); // TODO remove tags from music_has_tags
			$('#musicFormMetadata').data('music', null);
		}

	}

}, window));
