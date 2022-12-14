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

	TIMAAT.MusicFormElement = class MusicFormElement {
		constructor(model) {
			// console.log("TCL: MusicFormElement -> constructor -> model", model);
			// setup model
			this.model = model;
			this.active = false;

			// create and style list view element
			this.listView = $(`
				<li class="list-group-item annotationListMusicFormElement p-0 bg-secondary">
					<div class="d-flex justify-content-between">
						<span class="font-weight-bold pt-1 text-light pl-1">
							<i class="annotationMusicFormElementCommentIcon fas fa-fw fa-comment" aria-hidden="true"></i>
							<span class="annotationMusicFormElementType"></span>
						</span>
					</div>
				</li>`
			);
			this.timelineView = $(`
				<div class="timeline__music-form-element">
					<div class="timeline__music-form-element-type text-white font-weight-bold"></div>
					<div class="timeline__music-form-element-lyrics" data-role="lyricsTooltip" title="" html="true" data-html="true" data-toggle="tooltip"></div>
				</div>`
			);
			this.timelineView.attr('data-start', this.model.startTime);
			this.timelineView.attr('data-end', this.model.endTime);

			var musicFormElement = this; // save annotation for events
		}

		updateUI() {
			// console.log("TCL: MusicFormElement -> updateUI -> updateUI()");
      // console.log("TCL: MusicFormElement -> updateUI -> this: ", this);
			this.listView.attr('data-start-time', this.model.startTime);
			this.listView.attr('data-end-time', this.model.endTime);
			this.listView.attr('id', 'musicFormElement-'+this.model.id);
			this.listView.attr('data-type', 'musicFormElement');
			this.timelineView.find('.timeline__music-form-element-type').html(this.model.musicFormElementType.musicFormElementTypeTranslations[0].type);
			// if (this.model.repeatLastRow && this.model.musicFormElementTranslations[0].text.length > 11) { // default value when empty, due to summernote, is '<p><br></p>
			if (this.model.musicFormElementTranslations[0].text.length > 0) { // default value when empty, due to summernote, is '<p><br></p>
			// 	this.timelineView.find('.timeline__music-form-element-lyrics').html('<i class="timelineMusicFormElementRepeatLastRowrepeatLastRow-icon fas fa-fw fa-redo-alt"></i>' + this.model.musicFormElementTranslations[0].text);
			// } else {
			this.timelineView.find('.timeline__music-form-element-lyrics').html(this.model.musicFormElementTranslations[0].text);
			// }
			// this.timelineView.find('.timeline__music-form-element-lyrics').prop('title', this.model.musicFormElementTranslations[0].text);
			this.timelineView.find('.timeline__music-form-element-lyrics').attr('data-original-title', this.model.musicFormElementTranslations[0].text);
			} else {
				this.timelineView.find('.timeline__music-form-element-lyrics').html('');
				this.timelineView.find('.timeline__music-form-element-lyrics').attr('data-original-title', '');
			}
			// update timeline position
			let length = (this.model.endTime - this.model.startTime) / (TIMAAT.VideoPlayer.duration) * 100.0;
			let offset = this.model.startTime / (TIMAAT.VideoPlayer.duration) * 100.0;
			let colorHex = this.model.musicFormElementType.colorHex;
			this.timelineView.css('width', length+'%');
			this.timelineView.css('margin-left', (offset)+'%');
			this.timelineView.css('background-color', '#'+colorHex);
		}

		addUI() {
			// console.log("TCL: MusicFormElement -> addUI -> addUI()");
			$('#timelinePaneMusicFormElement').append(this.timelineView);
			var musicFormElement = this; // save annotation for events

			// attach event handlers
			this.timelineView.on('click', this, function(ev) {
				TIMAAT.VideoPlayer.curMusicFormElement = musicFormElement;
				this.classList.add('timeline__music-form-element--selected');
				TIMAAT.VideoPlayer.selectedElementType = 'musicFormElement';
				TIMAAT.VideoPlayer.jumpVisible(musicFormElement.model.startTime, musicFormElement.model.endTime);
				TIMAAT.VideoPlayer.pause();
				if (TIMAAT.VideoPlayer.curAnnotation) {
					TIMAAT.VideoPlayer.curAnnotation.setSelected(false);
				}
				$('#timelineKeyframePane').hide();
				TIMAAT.VideoPlayer.inspector.setItem(musicFormElement, 'musicFormElement');
				// TODO
				// TIMAAT.URLHistory.setURL(null, 'MusicFormElement ?? '+musicFormElement.model.musicFormElementTranslations[0].name, '#analysis/'+TIMAAT.VideoPlayer.curAnalysisList.id+'/musicFormElement/'+musicFormElement.model.id);
			});
			this.timelineView.on('dblclick', this, function(ev) {
				TIMAAT.VideoPlayer.curMusicFormElement = musicFormElement;
				this.classList.add('timeline__music-form-element--selected');
				TIMAAT.VideoPlayer.selectedElementType = 'musicFormElement';
				// TIMAAT.VideoPlayer.jumpVisible(musicFormElement.model.startTime, musicFormElement.model.endTime);
				TIMAAT.VideoPlayer.jumpTo(musicFormElement.model.startTime);
				TIMAAT.VideoPlayer.pause();
				if (TIMAAT.VideoPlayer.curAnnotation) {
					TIMAAT.VideoPlayer.curAnnotation.setSelected(false);
				}
				$('#timelineKeyframePane').hide();
				TIMAAT.VideoPlayer.inspector.setItem(musicFormElement, 'musicFormElement');
				TIMAAT.VideoPlayer.inspector.open('inspectorMetadata');
				// TODO
				// TIMAAT.URLHistory.setURL(null, 'MusicFormElement ?? '+musicFormElement.model.musicFormElementTranslations[0].name, '#analysis/'+TIMAAT.VideoPlayer.curAnalysisList.id+'/musicFormElement/'+musicFormElement.model.id);
			});
			this.timelineView.on('.timeline__music-form-element-lyrics > mouseover', this, function(event) {
				// if (musicFormElement.model.musicFormElementTranslations[0].text.length > 11) { // default value when empty, due to summernote, is '<p><br></p>
					$('.timeline__music-form-element > [data-toggle="tooltip"]').tooltip({boundary: "window", trigger: "hover"});
				// }
			});
			// console.log("TCL: MusicFormElement -> addUI -> this.updateUI()");
			this.updateUI();
		}

		removeUI() {
			this.timelineView.remove();
			TIMAAT.VideoPlayer.selectedElementType = null;
			this.updateUI();
		}

		updateStatus(timeInSeconds, onTimeUpdate) {
			// console.log("TCL: MusicFormElement -> updateStatus -> time", time);
			let time = timeInSeconds * 1000;
			var highlight = false;
			if ( time >= this.model.startTime && time < this.model.endTime) highlight = true;

			// TODO change appearance of element when de-/selected
			if ( highlight != this.highlighted ) { // highlight changed?
				this.highlighted = highlight;
				if ( this.highlighted ) { //  element highlighted at current time?
					if (!this.timelineView[0].classList.contains('timeline__music-form-element--selected')) // only add bg-info if not already selected element
					this.timelineView.removeClass('timeline__music-form-element--selected');
				}
				else { // element not highlighted at current time
					this.timelineView.addClass('timeline__music-form-element--selected');
					if (!onTimeUpdate) // keep bg-primary if time changed due to timeline-slider change
						this.timelineView.removeClass('timeline__music-form-element--selected');
				}
			} else { // highlight remains unchanged
				if (TIMAAT.VideoPlayer.selectedElementType != 'musicFormElement') { // update bg-primary if other element in same structure is selected
          this.timelineView.removeClass('timeline__music-form-element--selected');
					if (this.highlighted) {
						this.timelineView.removeClass('timeline__music-form-element--selected');
					}
				}
				if (TIMAAT.VideoPlayer.curMusicFormElement && this.model.id != TIMAAT.VideoPlayer.curMusicFormElement.model.id) { // update bg-primary when switching elements on same hierarchy via timeline-slider and selecting
					this.timelineView.removeClass('timeline__music-form-element--selected');
				}
			}
		}

	}

}, window));
