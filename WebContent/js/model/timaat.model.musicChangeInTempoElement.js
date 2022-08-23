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

	TIMAAT.MusicChangeInTempoElement = class MusicChangeInTempoElement {
		constructor(model) {
			// console.log("TCL: MusicChangeInTempoElement -> constructor -> model", model);
			// setup model
			this.model = model;
			this.active = false;

			// create and style list view element
			this.listView = $(`
				<li class="list-group-item annotationListMusicChangeInTempoElement p-0 bg-secondary">
					<div class="d-flex justify-content-between">
						<span class="font-weight-bold pt-1 text-light pl-1">
							<i class="annotationMusicChangeInTempoElementCommentIcon fas fa-fw fa-comment" aria-hidden="true"></i>
							<span class="annotationMusicChangeInTempoElementType"></span>
						</span>
					</div>
				</li>`
			);
			this.timelineView = $(`
				<div class="timelineMusicChangeInTempoElement">
					<div class="timeline__music-change-in-tempo-element-type text-white font-weight-bold"></div>
				</div>`
			);
			this.timelineView.attr('data-start', this.model.startTime);
			this.timelineView.attr('data-end', this.model.endTime);

			var musicChangeInTempoElement = this; // save annotation for events
		}

		updateUI() {
			// console.log("TCL: MusicChangeInTempoElement -> updateUI -> updateUI()");
      // console.log("TCL: MusicChangeInTempoElement -> updateUI -> this: ", this);
			this.listView.attr('data-start-time', this.model.startTime);
			this.listView.attr('data-end-time', this.model.endTime);
			this.listView.attr('id', 'musicChangeInTempoElement-'+this.model.id);
			this.listView.attr('data-type', 'musicChangeInTempoElement');
			this.timelineView.find('.timeline__music-change-in-tempo-element-type').html(this.model.changeInTempo.changeInTempoTranslations[0].type);

			// update timeline position
			let length = (this.model.endTime - this.model.startTime) / (TIMAAT.VideoPlayer.duration) * 100.0;
			let offset = this.model.startTime / (TIMAAT.VideoPlayer.duration) * 100.0;
			this.timelineView.css('width', length+'%');
			this.timelineView.css('margin-left', (offset)+'%');
		}

		addUI() {
			// console.log("TCL: MusicChangeInTempoElement -> addUI -> addUI()");
			$('#timelinePaneMusicChangeInTempo').append(this.timelineView);
			var musicChangeInTempoElement = this; // save annotation for events

			// attach event handlers
			this.timelineView.on('click', this, function(ev) {
				TIMAAT.VideoPlayer.curMusicChangeInTempoElement = musicChangeInTempoElement;
				this.classList.add('timelineSelectedMusicChangeInTempoElement');
				TIMAAT.VideoPlayer.selectedElementType = 'musicChangeInTempoElement';
				TIMAAT.VideoPlayer.jumpVisible(musicChangeInTempoElement.model.startTime, musicChangeInTempoElement.model.endTime);
				TIMAAT.VideoPlayer.pause();
				if (TIMAAT.VideoPlayer.curAnnotation) {
					TIMAAT.VideoPlayer.curAnnotation.setSelected(false);
				}
				$('#timelineKeyframePane').hide();
				TIMAAT.VideoPlayer.inspector.setItem(musicChangeInTempoElement, 'musicChangeInTempoElement');
				// TODO
				// TIMAAT.URLHistory.setURL(null, 'MusicChangeInTempoElement · '+musicChangeInTempoElement.model.musicChangeInTempoElementTranslations[0].name, '#analysis/'+TIMAAT.VideoPlayer.curAnalysisList.id+'/musicChangeInTempoElement/'+musicChangeInTempoElement.model.id);
			});

			this.timelineView.on('dblclick', this, function(ev) {
				TIMAAT.VideoPlayer.curMusicChangeInTempoElement = musicChangeInTempoElement;
				this.classList.add('timelineSelectedMusicChangeInTempoElement');
				TIMAAT.VideoPlayer.selectedElementType = 'musicChangeInTempoElement';
				// TIMAAT.VideoPlayer.jumpVisible(musicChangeInTempoElement.model.startTime, musicChangeInTempoElement.model.endTime);
				TIMAAT.VideoPlayer.jumpTo(musicChangeInTempoElement.model.startTime);
				TIMAAT.VideoPlayer.pause();
				if (TIMAAT.VideoPlayer.curAnnotation) {
					TIMAAT.VideoPlayer.curAnnotation.setSelected(false);
				}
				$('#timelineKeyframePane').hide();
				TIMAAT.VideoPlayer.inspector.setItem(musicChangeInTempoElement, 'musicChangeInTempoElement');
				TIMAAT.VideoPlayer.inspector.open('inspectorMetadata');
				// TODO
				// TIMAAT.URLHistory.setURL(null, 'MusicChangeInTempoElement · '+musicChangeInTempoElement.model.musicChangeInTempoElementTranslations[0].name, '#analysis/'+TIMAAT.VideoPlayer.curAnalysisList.id+'/musicChangeInTempoElement/'+musicChangeInTempoElement.model.id);
			});

			// console.log("TCL: MusicChangeInTempoElement -> addUI -> this.updateUI()");
			this.updateUI();
		}

		removeUI() {
			this.timelineView.remove();
			TIMAAT.VideoPlayer.selectedElementType = null;
			this.updateUI();
		}

		updateStatus(timeInSeconds, onTimeUpdate) {
			// console.log("TCL: MusicChangeInTempoElement -> updateStatus -> time", time);
			let time = timeInSeconds * 1000;
			var highlight = false;
			if ( time >= this.model.startTime && time < this.model.endTime) highlight = true;

			// TODO change appearance of element when de-/selected
			if ( highlight != this.highlighted ) { // highlight changed?
				this.highlighted = highlight;
				if ( this.highlighted ) { //  element highlighted at current time?
					if (!this.timelineView[0].classList.contains('bg-primary')) // only add bg-info if not already selected element
					this.timelineView.addClass('bg-info');
				}
				else { // element not highlighted at current time
					this.timelineView.removeClass('bg-info');
					if (!onTimeUpdate) // keep bg-primary if time changed due to timeline-slider change
						this.timelineView.removeClass('bg-primary');
				}
			} else { // highlight remains unchanged
				if (TIMAAT.VideoPlayer.selectedElementType != 'musicChangeInTempoElement') { // update bg-primary if other element in same structure is selected
          this.timelineView.removeClass('bg-primary');
					if (this.highlighted) {
						this.timelineView.addClass('bg-info');
					}
				}
				if (TIMAAT.VideoPlayer.curMusicChangeInTempoElement && this.model.id != TIMAAT.VideoPlayer.curMusicChangeInTempoElement.model.id) { // update bg-primary when switching elements on same hierarchy via timeline-slider and selecting
					this.timelineView.removeClass('bg-primary');
				}
			}
		}

	}

}, window));
