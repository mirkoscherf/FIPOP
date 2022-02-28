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

	TIMAAT.MusicDynamicsElement = class MusicDynamicsElement {
		constructor(model) {
			// console.log("TCL: MusicDynamicsElement -> constructor -> model", model);
			// setup model
			this.model = model;
			this.active = false;

			// create and style list view element
			this.listView = $(`
				<li class="list-group-item timaat-annotation-list-music-dynamics-element p-0 bg-secondary">
					<div class="d-flex justify-content-between">
						<span class="font-weight-bold pt-1 text-light pl-1">
							<i class="timaat-annotation-music-dynamics-element-comment-icon fas fa-fw fa-comment" aria-hidden="true"></i>
							<span class="timaat-annotation-music-dynamics-element-type"></span>
						</span>
					</div>
				</li>`
			);
			this.timelineView = $(`
				<div class="timaat-timeline-music-dynamics-element">
					<div class="timaat-timeline-music-dynamics-element-type text-white font-weight-bold"></div>
				</div>`
			);
			this.timelineView.attr('data-start', this.model.startTime);
			this.timelineView.attr('data-end', this.model.endTime);

			var musicDynamicsElement = this; // save annotation for events
		}

		updateUI() {
			// console.log("TCL: MusicDynamicsElement -> updateUI -> updateUI()");
      // console.log("TCL: MusicDynamicsElement -> updateUI -> this: ", this);
			this.listView.attr('data-starttime', this.model.startTime);
			this.listView.attr('data-endtime', this.model.endTime);
			this.listView.attr('id', 'musicDynamicsElement-'+this.model.id);
			this.listView.attr('data-type', 'musicDynamicsElement');
			this.timelineView.find('.timaat-timeline-music-dynamics-element-type').html(this.model.musicDynamicsElementType.musicDynamicsElementTypeTranslations[0].type);

			// update timeline position
			let length = (this.model.endTime - this.model.startTime) / (TIMAAT.VideoPlayer.duration) * 100.0;
			let offset = this.model.startTime / (TIMAAT.VideoPlayer.duration) * 100.0;
			this.timelineView.css('width', length+'%');
			this.timelineView.css('margin-left', (offset)+'%');
		}

		addUI() {
			// console.log("TCL: MusicDynamicsElement -> addUI -> addUI()");
			$('#timaat-timeline-music-dynamics-element-pane').append(this.timelineView);
			var musicDynamicsElement = this; // save annotation for events

			// attach event handlers
			this.timelineView.on('click', this, function(ev) {
				TIMAAT.VideoPlayer.curMusicDynamicsElement = musicDynamicsElement;
				this.classList.add('timaat-timeline-selected-music-dynamics-element');
				TIMAAT.VideoPlayer.selectedElementType = 'musicDynamicsElement';
				TIMAAT.VideoPlayer.jumpVisible(musicDynamicsElement.model.startTime, musicDynamicsElement.model.endTime);
				TIMAAT.VideoPlayer.pause();
				if (TIMAAT.VideoPlayer.curAnnotation) {
					TIMAAT.VideoPlayer.curAnnotation.setSelected(false);
				}
				$('#timaat-timeline-keyframe-pane').hide();
				TIMAAT.VideoPlayer.inspector.setItem(musicDynamicsElement, 'musicDynamicsElement');
				// TODO
				// TIMAAT.URLHistory.setURL(null, 'MusicDynamicsElement · '+musicDynamicsElement.model.musicDynamicsElementTranslations[0].name, '#analysis/'+TIMAAT.VideoPlayer.curAnalysisList.id+'/musicDynamicsElement/'+musicDynamicsElement.model.id);
			});

			this.timelineView.on('dblclick', this, function(ev) {
				TIMAAT.VideoPlayer.curMusicDynamicsElement = musicDynamicsElement;
				this.classList.add('timaat-timeline-selected-music-dynamics-element');
				TIMAAT.VideoPlayer.selectedElementType = 'musicDynamicsElement';
				// TIMAAT.VideoPlayer.jumpVisible(musicDynamicsElement.model.startTime, musicDynamicsElement.model.endTime);
				TIMAAT.VideoPlayer.jumpTo(musicDynamicsElement.model.startTime);
				TIMAAT.VideoPlayer.pause();
				if (TIMAAT.VideoPlayer.curAnnotation) {
					TIMAAT.VideoPlayer.curAnnotation.setSelected(false);
				}
				$('#timaat-timeline-keyframe-pane').hide();
				TIMAAT.VideoPlayer.inspector.setItem(musicDynamicsElement, 'musicDynamicsElement');
				TIMAAT.VideoPlayer.inspector.open('timaat-inspector-metadata');
				// TODO
				// TIMAAT.URLHistory.setURL(null, 'MusicDynamicsElement · '+musicDynamicsElement.model.musicDynamicsElementTranslations[0].name, '#analysis/'+TIMAAT.VideoPlayer.curAnalysisList.id+'/musicDynamicsElement/'+musicDynamicsElement.model.id);
			});

			// console.log("TCL: MusicDynamicsElement -> addUI -> this.updateUI()");
			this.updateUI();
		}

		removeUI() {
			this.timelineView.remove();
			TIMAAT.VideoPlayer.selectedElementType = null;
			this.updateUI();
		}

		updateStatus(timeInSeconds, onTimeUpdate) {
			// console.log("TCL: MusicDynamicsElement -> updateStatus -> time", time);
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
				if (TIMAAT.VideoPlayer.selectedElementType != 'musicDynamicsElement') { // update bg-primary if other element in same structure is selected
          this.timelineView.removeClass('bg-primary');
					if (this.highlighted) {
						this.timelineView.addClass('bg-info');
					}
				}
				if (TIMAAT.VideoPlayer.curMusicDynamicsElement && this.model.id != TIMAAT.VideoPlayer.curMusicDynamicsElement.model.id) { // update bg-primary when switching elements on same hierarchy via timeline-slider and selecting
					this.timelineView.removeClass('bg-primary');
				}
			}
		}

	}

}, window));
