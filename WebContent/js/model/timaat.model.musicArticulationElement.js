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

	TIMAAT.MusicArticulationElement = class MusicArticulationElement {
		constructor(model) {
			// console.log("TCL: MusicArticulationElement -> constructor -> model", model);
			// setup model
			this.model = model;
			this.active = false;

			// create and style list view element
			this.listView = $(`
				<li class="list-group-item annotationListMusicArticulationElement p-0 bg-secondary">
					<div class="d-flex justify-content-between">
						<span class="font-weight-bold pt-1 text-light pl-1">
							<i class="annotationMusicArticulationElementCommentIcon fas fa-fw fa-comment" aria-hidden="true"></i>
							<span class="annotationMusicArticulationElementType"></span>
						</span>
					</div>
				</li>`
			);
			this.timelineView = $(`
				<div class="timelineMusicArticulationElement">
					<div class="timeline__music-articulation-element-type text-white font-weight-bold"></div>
				</div>`
			);
			this.timelineView.attr('data-start', this.model.startTime);
			this.timelineView.attr('data-end', this.model.endTime);

			var musicArticulationElement = this; // save annotation for events
		}

		updateUI() {
			// console.log("TCL: MusicArticulationElement -> updateUI -> updateUI()");
      // console.log("TCL: MusicArticulationElement -> updateUI -> this: ", this);
			this.listView.attr('data-start-time', this.model.startTime);
			this.listView.attr('data-end-time', this.model.endTime);
			this.listView.attr('id', 'musicArticulationElement-'+this.model.id);
			this.listView.attr('data-type', 'musicArticulationElement');
			this.timelineView.find('.timeline__music-articulation-element-type').html(this.model.articulation.articulationTranslations[0].type);

			// update timeline position
			let length = (this.model.endTime - this.model.startTime) / (TIMAAT.VideoPlayer.duration) * 100.0;
			let offset = this.model.startTime / (TIMAAT.VideoPlayer.duration) * 100.0;
			this.timelineView.css('width', length+'%');
			this.timelineView.css('margin-left', (offset)+'%');
		}

		addUI() {
			// console.log("TCL: MusicArticulationElement -> addUI -> addUI()");
			$('#timelinePaneMusicArticulation').append(this.timelineView);
			var musicArticulationElement = this; // save annotation for events

			// attach event handlers
			this.timelineView.on('click', this, function(ev) {
				TIMAAT.VideoPlayer.curMusicArticulationElement = musicArticulationElement;
				this.classList.add('timelineSelectedMusicArticulationElement');
				TIMAAT.VideoPlayer.selectedElementType = 'musicArticulationElement';
				TIMAAT.VideoPlayer.jumpVisible(musicArticulationElement.model.startTime, musicArticulationElement.model.endTime);
				TIMAAT.VideoPlayer.pause();
				if (TIMAAT.VideoPlayer.curAnnotation) {
					TIMAAT.VideoPlayer.curAnnotation.setSelected(false);
				}
				$('#timelineKeyframePane').hide();
				TIMAAT.VideoPlayer.inspector.setItem(musicArticulationElement, 'musicArticulationElement');
				// TODO
				// TIMAAT.URLHistory.setURL(null, 'MusicArticulationElement ?? '+musicArticulationElement.model.musicArticulationElementTranslations[0].name, '#analysis/'+TIMAAT.VideoPlayer.curAnalysisList.id+'/musicArticulationElement/'+musicArticulationElement.model.id);
			});

			this.timelineView.on('dblclick', this, function(ev) {
				TIMAAT.VideoPlayer.curMusicArticulationElement = musicArticulationElement;
				this.classList.add('timelineSelectedMusicArticulationElement');
				TIMAAT.VideoPlayer.selectedElementType = 'musicArticulationElement';
				// TIMAAT.VideoPlayer.jumpVisible(musicArticulationElement.model.startTime, musicArticulationElement.model.endTime);
				TIMAAT.VideoPlayer.jumpTo(musicArticulationElement.model.startTime);
				TIMAAT.VideoPlayer.pause();
				if (TIMAAT.VideoPlayer.curAnnotation) {
					TIMAAT.VideoPlayer.curAnnotation.setSelected(false);
				}
				$('#timelineKeyframePane').hide();
				TIMAAT.VideoPlayer.inspector.setItem(musicArticulationElement, 'musicArticulationElement');
				TIMAAT.VideoPlayer.inspector.open('inspectorMetadata');
				// TODO
				// TIMAAT.URLHistory.setURL(null, 'MusicArticulationElement ?? '+musicArticulationElement.model.musicArticulationElementTranslations[0].name, '#analysis/'+TIMAAT.VideoPlayer.curAnalysisList.id+'/musicArticulationElement/'+musicArticulationElement.model.id);
			});

			// console.log("TCL: MusicArticulationElement -> addUI -> this.updateUI()");
			this.updateUI();
		}

		removeUI() {
			this.timelineView.remove();
			TIMAAT.VideoPlayer.selectedElementType = null;
			this.updateUI();
		}

		updateStatus(timeInSeconds, onTimeUpdate) {
			// console.log("TCL: MusicArticulationElement -> updateStatus -> time", time);
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
				if (TIMAAT.VideoPlayer.selectedElementType != 'musicArticulationElement') { // update bg-primary if other element in same structure is selected
          this.timelineView.removeClass('bg-primary');
					if (this.highlighted) {
						this.timelineView.addClass('bg-info');
					}
				}
				if (TIMAAT.VideoPlayer.curMusicArticulationElement && this.model.id != TIMAAT.VideoPlayer.curMusicArticulationElement.model.id) { // update bg-primary when switching elements on same hierarchy via timeline-slider and selecting
					this.timelineView.removeClass('bg-primary');
				}
			}
		}

	}

}, window));
