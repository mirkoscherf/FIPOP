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
 * @author Jens-Martin Loebel <loebel@bitgilde.de>
 * @author Mirko Scherf <mscherf@uni-mainz.de>
 */
class AnalysisSegment {
	constructor(model) {
		// setup model
		this.model = model;
		this.active = false;

		// create and style list view element
		this.listView = $(`
			<li class="list-group-item analysis__list--li annotationListSegment p-0 bg-secondary">
				<div class="d-flex justify-content-between">
					<span class="font-weight-bold pt-1 text-light pl-1">
						<i class="annotationSegmentCommentIcon fas fa-fw fa-comment" aria-hidden="true"></i>
						<span class="analysis-list-element__title js-analysis-list-element__title"></span>
					</span>
				</div>
			</li>`
		);

		this.updateUI();

		var segment = this; // save annotation for events
	}

	updateUI() {
		this.listView.attr('data-start-time', this.model.startTime);
		this.listView.attr('data-end-time', this.model.endTime);
		this.listView.attr('id', 'segment-'+this.model.id);
		this.listView.attr('data-type', 'segment');
		let timeString = " "+TIMAATPub.formatTime(this.model.startTime, true);
		let name = this.model.analysisSegmentTranslations[0].name;
		let desc = ( this.model.analysisSegmentTranslations[0].shortDescription ) ? this.model.analysisSegmentTranslations[0].shortDescription : '';
		let comment = this.model.analysisSegmentTranslations[0].comment;
		let transcript = this.model.analysisSegmentTranslations[0].transcript;
		if ( this.model.startTime != this.model.endTime ) timeString += ' - '+TIMAATPub.formatTime(this.model.endTime, true);
		this.listView.find('.js-analysis-list-element__title').html(name);
		this.listView.find('.annotationSegmentShortDescription').html(desc);
		this.listView.find('.annotationSegmentComment').html(comment);
		this.listView.find('.annotationSegmentTranscript').html(transcript);
		// comment
		if ( this.model.analysisSegmentTranslations[0].comment && this.model.analysisSegmentTranslations[0].comment.length > 0 )
			this.listView.find('.annotationSegmentCommentIcon').show();
		else
			this.listView.find('.annotationSegmentCommentIcon').hide();

	}

	addUI() {
		$('#analysisList').append(this.listView);

		var segment = this; // save annotation for events
		// TODO might need to be adjusted
		// attach event handlers
		this.listView.on('click', this, function(ev) {
			TIMAATPub.jumpVisible(segment.model.startTime, segment.model.endTime);
			TIMAATPub.pause();
			TIMAATPub.selectAnnotation(null);
			$('.annotationSection').hide();
			$('.segmentSection').show();
			TIMAATPub.setSegmentMetadata(segment);
		});
		this.listView.on('dblclick', this, function(ev) {
			TIMAATPub.jumpVisible(segment.model.startTime, segment.model.endTime);
			TIMAATPub.pause();
			TIMAATPub.selectAnnotation(null);
			$('.annotationSection').hide();
			$('.segmentSection').show();
			TIMAATPub.setSegmentMetadata(segment);
		});
		this.updateUI();
	}

	removeUI() {
		this.listView.remove();
		this.updateUI();
	}

	// not in use
	updateStatus(timeInSeconds) {
		let time = timeInSeconds * 1000;
		time = Math.floor(time);
		var active = false;
		if ( time >= this.model.startTime && time < this.model.endTime) {
			active = true;
		}
		this.setActive(active)
	}

	isActive() {
		return this.active;
	}

	setActive(active) {
		if ( this.active == active ) return;
		this.active = active;
	}

}

/* ****************************************************************** */

class Marker {
	constructor(annotation) {
		this.parent = annotation;
		this.annotation = annotation;
		// this.annotationID = annotation.model.id;
		this._from = Math.min(annotation.startTime, TIMAATPub.duration);
		this._to = Math.max(annotation.startTime, annotation.model.endTime);
		this._colorHex = annotation.model.selectorSvgs[0].colorHex;

		// construct marker element
		this.ui = {
				offset: 0,
				element: $(`<div class="timeline__marker">
											<div class="timeline__marker-bar">
											</div>
											<div class="timeline__marker-head">
											</div>
											<div class="timeline__marker-start">
											</div>
											<div class="timeline__marker-end">
											</div>
										</div>`),			  };
		this.ui.element.attr('id','timaat-marker-'+this.parent.model.id);

		this.regionStart = $(this.ui.element.find('.timeline__marker-start'));
		this.regionEnd = $(this.ui.element.find('.timeline__marker-end'));

		this._updateElementColor();
		this._updateElementOffset();
		$('#timelineMarkerPane').append(this.ui.element);
		TIMAATPub.markerList.push(this);

		// add events
		this.ui.element.find('.timeline__marker-bar,.timeline__marker-head').on('click', this, function(ev) {
			TIMAATPub.pause();
			TIMAATPub.jumpTo(ev.data.from);
			TIMAATPub.selectAnnotation(ev.data.parent);
		});
		this._updateElementStyle();
	}

	get UIOffset() {
		return this.ui.offset;
	}

	set UIOffset(offset) {
		if ( this.ui.offset == offset ) return;
		this.ui.offset = offset;
		this._updateElementOffset();
	};

	get from() {
		return this._from;
	}

	get to() {
		return this._to;
	}

	get color() {
		return this._colorHex;
	}

	remove() {
		this.ui.element.remove();
	}

	updateView() {
		this._from = this.parent.startTime;
		this._to = this.parent.endTime;
		this._colorHex = this.parent.svg.colorHex;
		this._updateElementColor();
		this._updateElementOffset();
		this._updateElementStyle();

		if ( this.parent.isSelected() && this.parent.isAnimation() ) this.ui.element.addClass('timeline__marker-anim');
		else this.ui.element.removeClass('timeline__marker-anim');

		if ( this.parent.isSelected() && !this.parent.isAnimation() ) {
			this.regionStart.attr('style','position:relative;');
			this.regionStart.show();
			this.regionEnd.attr('style','position:relative;');
			this.regionEnd.show();
		} else {
			this.regionStart.hide();
			this.regionEnd.hide();
		}
	}

	_updateElementColor() {
		this.ui.element.find('.timeline__marker-bar').css('background-color', this.hexToRgbA(this._colorHex, 0.3));
		this.ui.element.css('border-left-color', '#'+this._colorHex);
		this.ui.element.find('.timeline__marker-head').css('background-color', '#'+this._colorHex);
		this.ui.element.removeClass('timeline__marker-white');
		if ( this._colorHex.toLowerCase() == 'ffffff' ) this.ui.element.addClass('timeline__marker-white');
	}

	_updateElementOffset() {
		var magicOffset = 0; // TODO replace input slider

		var width = $('.videoSeekBar').width();
		var length = (this._to - this._from) / TIMAATPub.duration * width;
		length = Math.max(0,length);
		var offset = this._from / TIMAATPub.duration * width;
		this.ui.element.css('width', length+'px');
		this.ui.element.css('margin-left', (offset+magicOffset)+'px');

		var startOffset = 20;
		if ( TIMAATPub.activeLayer == 'audio' ) startOffset += 37; // compensate for audio waveform
		this.ui.element.find('.timeline__marker-bar').css('margin-top', (startOffset+(this.ui.offset*12))+'px' );
	}

	_updateElementStyle() {
		this.ui.element.find('.timeline__marker-head').removeClass('timeline__marker-head--polygon')
																												.removeClass('timeline__marker-head--animation');
		if ( this.parent.isAnimation() ) this.ui.element.find('.timeline__marker-head').addClass('timeline__marker-head--animation');
		else if ( this.parent.hasPolygons() ) this.ui.element.find('.timeline__marker-head').addClass('timeline__marker-head--polygon');

		(this.annotation.model.layerVisual) ? this.ui.element.addClass('timelineMarkerVisual') : this.ui.element.removeClass('timelineMarkerVisual');
		(this.annotation.model.layerAudio) ? this.ui.element.addClass('timelineMarkerAudio') : this.ui.element.removeClass('timelineMarkerAudio');
	}

	hexToRgbA(hex, alpha) {
		var r = parseInt(hex.slice(0, 2), 16);
		var	g = parseInt(hex.slice(2, 4), 16);
		var b = parseInt(hex.slice(4, 6), 16);
		return 'rgba(' + r + ', ' + g + ', ' + b + ', ' + alpha + ')';
	}

}

/* ****************************************************************** */

class Keyframe {
	constructor(keyframe, annotation) {
		this.parent = annotation;
		// this.annotation = annotation;
		this.model = keyframe;
		// this.annotationID = annotation.model.id;
		this._time = this.model.time;
		this._visible = true;
		this._selected = false;

		this.shapes = [];
		this.shapeMap = new Map();
		for (let svgItem of this.model.shapes) {
			let shape = this._parseModel(svgItem);
			this.addShape(shape);
		}
		// init keyframe UI
		this.ui = {
				timelineTemplate : `<div class="timeline__keyframe">
															<div class="timeline__keyframe-head">
															</div>
														</div>`,
				inspectorTemplate : `<div class="list-group-item p-0">
															<div class="input-group input-group-sm">
																<div class="input-group-prepend">
																	<span class="input-group-text keyframeNumber">01</span>
																</div>
																<input type="text" class="form-control keyframeTime">
																<div class="input-group-append">
																	<button class="btn btn-secondary keyframeUndo"><i class="fas fa-undo fa-fw"></i></button>
																	<button class="btn btn-danger keyframeRemove"><i class="fas fa-trash-alt fa-fw"></i></button>
																</div>
															</div>
														</div>`
		};
		this.ui.timelineView = $(this.ui.timelineTemplate);
		this.ui.inspectorView = $(this.ui.inspectorTemplate);
		if ( this._time == 0 ) {
			this.ui.inspectorView.find('.keyframeTime').prop('disabled', true);
			this.ui.inspectorView.find('.keyframeRemove').prop('disabled', true);
		}
		this.ui.head = this.ui.timelineView.find('.timeline__keyframe-head');
		$('#timelineKeyframePane').append(this.ui.timelineView);
		if ( this.time == 0 ) this.ui.head.addClass('first');

		// add events
		this.ui.head.on('click', this, function(ev) {
			TIMAATPub.pause();
			TIMAATPub.jumpTo(ev.data.parent.startTime / 1000 + ev.data.time / 1000);
		});
		if ( this._time != 0 ) this.ui.inspectorView.find('.keyframeTime').on('blur change', this, function(ev) {
			if ( !ev.data ) return;
			let keyframe = ev.data;
			let anno = keyframe.parent;
			let newTime = TIMAAT.Util.parseTime(keyframe.ui.inspectorView.find('.keyframeTime').val()) - anno.startTime;
			let minTime = 0;
			if ( anno.svg.keyframes.indexOf(keyframe) > 0 ) minTime = anno.svg.keyframes[ anno.svg.keyframes.indexOf(keyframe)-1 ].time + 1;
			minTime = Math.floor(minTime);
			newTime = Math.max(minTime, newTime);
			let maxTime = anno.length;
			if ( anno.svg.keyframes.indexOf(keyframe) < (anno.svg.keyframes.length-1) ) maxTime = anno.svg.keyframes[ anno.svg.keyframes.indexOf(keyframe)+1 ].time - 1;
			maxTime = Math.floor(maxTime);
			newTime = Math.min(newTime, maxTime);
			if ( newTime != keyframe.time ) {
				keyframe.time = newTime;
				keyframe.updateUI();
				anno._updateShapeUI();
				anno.updateEditableUI();
			}
		});
		this.ui.inspectorView.find('.keyframeUndo').on('click', this, function(ev) {
			if ( !ev.data ) return;
			ev.data.parent._updateShapeUI();
			ev.data.parent.updateEditableUI();
		});
		this.ui.inspectorView.find('.keyframeRemove').on('click', this, function(ev) {
			if ( !ev.data ) return;
			ev.data.parent.removeKeyframe(ev.data);
		});

		this.updateUI();
		this._updateOffsetUI();
		this.updateTimeUI();
	}

	addShape(shape) {
		// check if shape id exists
		if ( this.shapeMap.has(shape.id) ) return;
		this.shapes.push(shape);
		this.shapeMap.set(shape.id, shape);
	}

	removeShape(shape) {
		if ( !shape ) return;
		let id = (shape.id) ? shape.id : shape;
		let kfShape = this.shapeMap.get(id);
		if ( !kfShape ) return;
		let index = this.shapes.indexOf(kfShape);
		if ( index < 0 ) return;
		this.shapes.splice(index, 1);
		this.shapeMap.delete(id);
	}

	get time() {
		return this._time;
	}

	getShape(id) {
		return this.shapeMap.get(id);
	}

	_parseModel(svgItem) {
		let shape = {
				type: svgItem.type,
		}
		let width = 1;
		let height = 1;
		if (TIMAATData.mediumVideo) {
			width = TIMAATPub.medium.mediumVideo.width;
			height = TIMAATPub.medium.mediumVideo.height;
		} else if (TIMAATData.mediumImage) {
			width = TIMAATPub.medium.mediumImage.width;
			height = TIMAATPub.medium.mediumImage.height;
		} else if (TIMAATData.mediumAudio) {
			width = 800;
			height = 600;
		}
		let factor = TIMAATPub.mediumBounds.getNorth() / height;
		let id = svgItem.id;
		if ( !id ) {
			// id = TIMAAT.Util.createUUIDv4();
			id = '-----';
			console.warn("WARNING: Keyframe -> _parseSVG -> svgItem: Required attribute ID missing from model", svgItem);
		}
		shape.id = id;
		switch (svgItem.type) {
			case "rectangle":
				// shape.bounds = [ [Math.round(height-((svgItem.y+svgItem.height)*height)), Math.round(svgItem.x*width)], [Math.round(height-((svgItem.y)*height)), Math.round((svgItem.x+svgItem.width)*width)] ];
				shape.bounds = [ [Math.round(TIMAATPub.mediumBounds.getNorth()-(factor*(svgItem.y+svgItem.height)*height)), Math.round(svgItem.x*factor*width)], [Math.round(TIMAATPub.mediumBounds.getNorth()-((svgItem.y)*factor*height)), Math.round((svgItem.x+svgItem.width)*factor*width)] ];
				// shape.bounds = L.latLngBounds( L.latLng(Math.round(TIMAATPub.mediumBounds.getNorth()-(factor*svgItem.y*height)), Math.round(svgItem.x*factor*width)), L.latLng(Math.round(TIMAATPub.mediumBounds.getNorth()-((svgItem.y+svgItem.height)*factor*height)), Math.round((svgItem.x+svgItem.width)*factor*width)) );
				return shape;
			case "polygon":
			case "line":
				let points = new Array();
				for (let point of svgItem.points) {
					// let lat = height-(point[1]*height);
					let lat = TIMAATPub.mediumBounds.getNorth()-(point[1]*factor*height);
					let lng = point[0]*width;
					points.push([lat, lng]);
				};
				shape.points = points;
				return shape;
			case "circle":
				// let lat = height-(svgItem.y*height);
				let lat = TIMAATPub.mediumBounds.getNorth()-(svgItem.y*factor*height);
				// let lng = svgItem.x*width;
				let lng = svgItem.x*factor*width;
				shape.point = [lat, lng];
				// shape.radius = svgItem.radius;
				shape.radius = svgItem.radius * factor;
				return shape;
		}
	}

	remove() {
		// remove UI
		this.ui.timelineView.remove();
		this.ui.inspectorView.find('.keyframeTime').off();
		this.ui.inspectorView.remove();
	}

	_updateOffsetUI() {
			var width = $('.videoSeekBar').width();
			var offset = (this.parent.startTime + this.time) / TIMAATPub.duration * width;
			this.ui.timelineView.css('margin-left', offset+'px');
	}

	updateStatus() {
	}

	updateTimeUI() {
		this.ui.inspectorView.find('.keyframeTime').val(TIMAATPub.formatTime(this.parent.startTime+this._time, true));
	}

	updateUI() {
		let visible = this.parent.isSelected() && this.parent.isAnimation();
		if ( visible != this._visible ) {
			this._visible = visible;
			if ( visible ) {
				this.ui.timelineView.show();
				this._updateOffsetUI();
			} else  this.ui.timelineView.hide();
		}
		if ( this._visible ) {
			let selected = this.parent.isOnKeyframe() && this.parent.currentKeyframe == this;
			if ( selected != this._selected ) {
				this._selected = selected;
				if ( selected ) this.ui.head.addClass('selected'); else this.ui.head.removeClass('selected');
			}

			let maxPadding = (this.parent.svg.keyframes.length+1).toString().length;
			if (maxPadding < 2) maxPadding = 2;
			let frameNumber = this.parent.svg.keyframes.indexOf(this)+1;
			let padNumber = frameNumber;
			if ( typeof(String.prototype.padStart) === 'function' ) padNumber = frameNumber.toString().padStart(maxPadding, '0');
			else {
				// TODO only for Internet Explorer
				padNumber = ('000'+frameNumber).substr(-3);
			}
			this.ui.inspectorView.find('.keyframeNumber').text(padNumber);
		}
	}

}

/* ****************************************************************** */

class Annotation {
	constructor(model) {
		// setup model
		this._destroyed = false;
		this.active = false;
		this.selected = false;
		this._animTime = -1;
		this._type = 0;
		this.model = model;
		this.svg = Object();
		this.svg.items = Array();
		this.svg.keyframes = Array();
		this.svg.strokeWidth = this.model.selectorSvgs[0].strokeWidth ? 2 : 0;
		this.svg.colorHex = this.model.selectorSvgs[0].colorHex;
		this.svg.opacity = this.model.selectorSvgs[0].opacity / 100; //* DB value is stored as Byte 0..100 range is converted to 0..1 range
		this.svg.model = JSON.parse(this.model.selectorSvgs[0].svgData);

		if ( Array.isArray(this.svg.model) ) {
			// upgrade old DB model
			let newModel = {
					keyframes: [{
						time: 0,
						shapes: this.svg.model,
					}],
			}
			for ( let shape of newModel.keyframes[0].shapes ) shape.id = "00000000-0000-4000-0000-000000000001";
			this.svg.model = newModel;
			this.model.selectorSvgs[0].svgData = JSON.stringify(this.svg.model);
		}

		// create keyframes
		for (let keyframe of this.svg.model.keyframes) this.svg.keyframes.push(new Keyframe(keyframe, this));

		this.svg.layer = L.layerGroup(null, {data:'annotationLayer', "annotation":this});

		// create and style list view element
		this.listView = $(`
			<li class="list-group-item  analysis__list--li p-0">
					<div class="annotationStatusMarker annotation__status-marker">&nbsp;</div>
					<i class="analysis-list-element__icon js-analysis-list-element__icon--visual-layer fas fa-image" aria-hidden="true"></i>
					<i class="analysis-list-element__icon js-analysis-list-element__icon--audio-layer fas fa-headphones" aria-hidden="true"></i>
					<i class="analysis-list-element__icon--comment js-analysis-list-element__icon--comment fas fa-fw fa-comment" aria-hidden="true"></i>
					<span class="annotationListTime"></span>
					<span class="text-nowrap annotationListCategories pr-1 float-right text-muted"><i class=""></i></span>
					<div class="d-flex justify-content-between">
						<div class="analysis-list-element__title js-analysis-list-element__title text-muted"></div>
					</div>
				</li>`
		);
		if (TIMAATPub.duration == 0) this.listView.find('.annotationListTime').addClass('text-muted');

		this.updateUI();

		let anno = this; // save annotation for events

		$('#analysisList').append(this.listView);
		this.listView.find('.annotationListCategories').on('click', this, function(ev) {
			ev.preventDefault();
			ev.stopPropagation();
			TIMAATPub.pause();
			if ( TIMAATPub.curAnnotation != ev.data ) TIMAATPub.selectAnnotation(ev.data);
		});

		this.listView.find('.annotationListCategories').on('dblclick', function(ev) {ev.stopPropagation();});

		//! TODO differs from timaat.annotation.js
		// convert SVG data
		this.polygonCount = this.svg.model.keyframes[0].shapes.length;
		for (let svgItem of this.svg.model.keyframes[0].shapes) {
			let item = this._parseSVG(svgItem);
			this.addSVGItem(item);
		};
		if ( !this.hasPolygons() ) this.addSVGItem(this._parseSVG({ id: "00000000-0000-4000-0000-000000000000", type: "rectangle", x: 0.0, y: 0.0, width: 1.0, height: 1.0, fill: 0 }));

		//! TODO differs from timaat.annotation.js
		// attach event handlers
		$(this.listView).on('click', this, function(ev) {
			TIMAATPub.jumpVisible(ev.data.startTime, ev.data.endTime);
			if ( TIMAATPub.curAnnotation != ev.data ) {
				TIMAATPub.selectAnnotation(ev.data);
				$('.segmentSection').hide();
				$('.annotationSection').show();
			}
			else {
				TIMAATPub.selectAnnotation(null);
				$('.annotationSection').hide();
			}
			TIMAATPub.pause();
		});
		$(this.listView).on('dblclick', this, function(ev) {
			TIMAATPub.jumpVisible(ev.data.startTime, ev.data.endTime);
			TIMAATPub.selectAnnotation(ev.data);
			$('.segmentSection').hide();
			$('.annotationSection').show();
			TIMAATPub.pause();
			TIMAATPub.openSidebar('Right');
		});

		// create marker with UI
		this.marker = new Marker(this);
		this.marker.updateView();
	}

	isAnimation() {
		return this.svg.keyframes.length > 1;
	}

	get currentKeyframe() {
		let curKeyframe = this.svg.keyframes[0];
		if ( !this.isAnimation() ) return curKeyframe;
		for (let keyframe of this.svg.keyframes) if ( this._animTime >= keyframe.time ) curKeyframe = keyframe;
		return curKeyframe;
	}

	get nextKeyframe() {
		if ( !this.isAnimation() ) return this.svg.keyframes[0];
		let index = this.svg.keyframes.indexOf(this.currentKeyframe);
		if ( index < 0 ) return this.svg.keyframes[0];
		index += 1;
		if ( index >= this.svg.keyframes.length ) index = this.svg.keyframes.length-1;
		return this.svg.keyframes[index];
	}

	isOnKeyframe() {
		let onKeyframe = false;
		if ( !this.isAnimation() ) onKeyframe = true;
		else for (let keyframe of this.svg.keyframes) if ( this._animTime == keyframe.time ) onKeyframe = true;
		return onKeyframe;
	}

	getKeyframeIndex(keyframe) {
		if ( !keyframe || !this.isAnimation() ) return 0;
		let index = this.svg.keyframes.indexOf(keyframe);
		if ( index < 0 ) index = 0;
		return index;
	}

	get opacity() {
		return this.svg.opacity;
	}

	get layerVisual() {
		return this.model.layerVisual;
	}

	get layerAudio() {
		return this.model.layerAudio;
	}

	get stroke() {
		return this.svg.strokeWidth;
	}

	get startTime() {
		return this.model.startTime;
	}

	get endTime() {
		return this.model.endTime;
	}

	get type() {
		return this._type;
	}

	get length() {
		return this.model.endTime - this.model.startTime;
	}

	hasPolygons() {
		// return this.polygonCount;
		return this.svg.items.length > 0;
	}

	updateUI() {
		this.listView.attr('data-start-time', this.model.startTime);
		this.listView.attr('data-end-time', this.model.endTime);
		this.listView.attr('id', 'annotation-'+this.model.id);
		this.listView.attr('data-type', 'annotation');
		this.listView.find('.analysis-list-element__icon').css('color', '#'+this.svg.colorHex);
		var timeString = " "+TIMAATPub.formatTime(this.model.startTime, true);
		if ( this.model.startTime != this.model.endTime ) timeString += ' - '+TIMAATPub.formatTime(this.model.endTime, true);
		// if ( TIMAATPub.duration == 0 ) timeString = ''; // empty time string for non time-based media (images)
		this.listView.find('.annotationListTime').html(timeString);
		this.listView.find('.js-analysis-list-element__title').html(this.model.annotationTranslations[0].title);
		// categories
		this.listView.find('.annotationListCategories i').attr('title', this.model.categories.length+" categories");
		if (this.model.categories.length == 0) this.listView.find('.annotationListCategories i').attr('class','fas fa-archive text-light noCategories');
		else if (this.model.categories.length == 1) this.listView.find('.annotationListCategories i').attr('class','fas fa-archive').attr('title', "one category");
		else this.listView.find('.annotationListCategories i').attr('class','fas fa-archive');
		// type
		this._updateAnnotationType();

		// comment
		if ( this.model.annotationTranslations[0].comment && this.model.annotationTranslations[0].comment.length > 0 )
			this.listView.find('.js-analysis-list-element__icon--comment').show();
		else
			this.listView.find('.js-analysis-list-element__icon--comment').hide();

		// update svg
		for (let item of this.svg.items) {
			item.setStyle({color:'#'+this.svg.colorHex, weight: this.svg.strokeWidth, fillOpacity: this.svg.opacity});
		};

		// update marker
		if ( this.marker ) this.marker.updateView();
	}

	_updateAnnotationType() {
		let layerVisualIcon = this.listView.find('.js-analysis-list-element__icon--visual-layer');
		let layerAudioIcon = this.listView.find('.js-analysis-list-element__icon--audio-layer');
		if ( this.layerVisual) {
			if ( this.isAnimation() ) {
				layerVisualIcon.removeClass('fa-image').removeClass('fa-draw-polygon').addClass('fa-running');
			} else if ( this.svg.items.length > 0 ) {
				layerVisualIcon.removeClass('fa-image').removeClass('fa-running').addClass('fa-draw-polygon');
			} else {
				layerVisualIcon.removeClass('fa-running').removeClass('fa-draw-polygon').addClass('fa-image');
			}
			layerVisualIcon.show();
		} else {
			layerVisualIcon.hide();
			layerVisualIcon.removeClass('fa-image').removeClass('fa-draw-polygon').removeClass('fa-running');
		}
		( this.layerAudio ) ? layerAudioIcon.show() : layerAudioIcon.hide();
	};

	remove() {
		// remove annotation from UI
		this.listView.remove();
		this.marker.remove();
		this.svg.layer.remove();
		this.selected = false;
		this._destroyed = true;
	}

	addSVGItem (item) {
		if ( !item || this.svg.items.includes(item) ) return;
		// generate UUID for shape and propagate through keyframes
		if ( !item.options.id ) {
			item.options.id = '-----';
			let shape = { id: item.options.id };
			if ( item instanceof L.Rectangle ) shape.type = 'rectangle';
			else if ( item instanceof L.Polygon ) shape.type = 'polygon';
			else if ( item instanceof L.Polyline ) shape.type = 'line';
			else if ( item instanceof L.Circle ) shape.type = 'circle';
			shape = this.syncShape(item, shape);
			// propagate changes to keyframes
			// TODO check if stringify needed to decouple references
			for (let keyframe of this.svg.keyframes) keyframe.addShape(Object.assign({}, shape));
		}
		// add to list of shapes
		this.svg.items.push(item);
		this.svg.layer.addLayer(item);

		// in case it was not set before, adding geometric data requires visual layer to be set
		this.model.layerVisual = true;
		$('#inspectorVisualLayerCheckbox').prop('checked', true);

		// add tooltip
		let tooltip = '<strong>'+this.model.annotationTranslations[0].title+'</strong>';
		if ( this.model.annotationTranslations[0].comment && this.model.annotationTranslations[0].comment.length > 0 ) tooltip += '<br><br>'+this.model.annotationTranslations[0].comment;
		item.bindTooltip(tooltip);

		// update UI
		this._updateAnnotationType();
		if ( this.marker ) this.marker.updateView();

		// add events
		let anno = this;
		item.on('click', function(ev) { TIMAATPub.selectAnnotation(anno); });
		item.on('dblclick', function(ev) { TIMAATPub.selectAnnotation(anno); TIMAATPub.openSidebar('Right') });
	}

	getModel() {
		return this.model;
	}

	updateStatus(timeInSeconds) {
		let time = timeInSeconds * 1000;
		time = Math.floor(time);
		let animTime = time - this.model.startTime;
		animTime = Math.floor(animTime);
		var active = false;
		if (  TIMAATPub.duration == 0 || (time >= this.startTime && time < this.endTime)  ) active = true;
		this.setActive(active);
		if ( animTime == this._animTime ) return;
		this._animTime = animTime;
		this._updateShapeUI();
		// update keyframe UI
		if ( this.isAnimation() ) for (let keyframe of this.svg.keyframes) keyframe.updateUI();
	}

	isActive() {
		return this.active;
	}

	setActive(active) {
		if ( this.active == active ) return;
		this.active = active;
		if ( active ) {
			this.listView.find('.annotationStatusMarker').addClass('bg-success');
			TIMAATPub.viewer.annoLayer.addLayer(this.svg.layer);
			// scroll list
			this._scrollIntoView(this.listView);
		} else {
			this.listView.find('.annotationStatusMarker').removeClass('bg-success');
			TIMAATPub.viewer.annoLayer.removeLayer(this.svg.layer);
			this.svg.layer.options.removed = true;
		}
	}

	setSelected(selected) {
		if (this._destroyed) return;
		if ( this.selected == selected ) return;
		this.selected = selected;
		if ( selected ) {
			this.listView.addClass('annotation__list--selected');
			for (let item of this.svg.items) {
				try {item.bringToFront();} catch(e){};
			};
		}
		else {
			this.listView.removeClass('annotation__list--selected');
			TIMAATPub.curAnnotation = null;
		}
		// update marker
		if ( this.marker ) this.marker.updateView();
		// update keyframe UI
		if ( this.isAnimation() ) for (let keyframe of this.svg.keyframes) keyframe.updateUI();
	}

	isSelected() {
		return this.selected;
	}

	syncShape(svgItem, shape = null, force = this.isOnKeyframe()) {
		if ( !svgItem || !svgItem.options || !svgItem.options.id || !force) return;
		let id = svgItem.options.id;
		if ( !shape ) shape = this.currentKeyframe.getShape(id);
		if ( !shape ) return;
		switch (shape.type) {
			case 'rectangle':
				shape.bounds = [ [svgItem.getBounds().getSouthWest().lat, svgItem.getBounds().getSouthWest().lng], [svgItem.getBounds().getNorthEast().lat, svgItem.getBounds().getNorthEast().lng] ];
				break;

			case "polygon":
				shape.points = this._copyLatLngs(svgItem.getLatLngs()[0]);
				break;
			case "line":
				shape.points = this._copyLatLngs(svgItem.getLatLngs());
				break;

			case "circle":
				shape.point = [svgItem.getLatLng().lat, svgItem.getLatLng().lng];
				shape.radius = svgItem.getRadius();
				break;
		}
		return shape;
	}

	_copyLatLngs(latLngs) {
		let points = new Array();
		for (let latLng of latLngs) points.push([latLng.lat, latLng.lng]);
		return points;
	}

	_updateShapeUI() {
		if ( this._destroyed || !this.isAnimation() || !this.isActive() ) return;
		let fromKeyframe = this.currentKeyframe;
		let toKeyframe = this.nextKeyframe;
		let interpolate = ( fromKeyframe != toKeyframe );
		let percent = (this._animTime-fromKeyframe.time) / (toKeyframe.time-fromKeyframe.time);
		for (let item of this.svg.items) {
			if ( interpolate ) {
				this._updateSVGItem(item, TIMAATPub.getInterpolatedShape(
						fromKeyframe.getShape(item.options.id),
						toKeyframe.getShape(item.options.id),
						percent
				));
			} else this._updateSVGItem(item, fromKeyframe.getShape(item.options.id));
		}
	}

	_updateSVGItem(item, shape) {
		if ( !item || !shape ) return;
		if ( item.options.id != shape.id ) return;
		switch (shape.type) {
			case 'rectangle':
				item.setBounds(shape.bounds);
				return;
			case "polygon":
				item.setLatLngs([shape.points]);
				return;
			case "line":
				item.setLatLngs(shape.points);
				return;
			case "circle":
				item.setLatLng(shape.point);
				item.setRadius(shape.radius);
				return;
		}
	}

	_scrollIntoView(listItem) {
		var listTop = $('.annotation__wrapper').scrollTop();
		var listHeight = $('.annotation__wrapper').height();
		var elementTop = listItem.position().top;
		// TODO scroll from bottom if out of view
		if ( elementTop < 0 )
			$('.annotation__wrapper').animate({scrollTop:(listTop+elementTop)}, 100);
		if ( elementTop > listHeight )
			$('.annotation__wrapper').animate({scrollTop:(listTop+elementTop)-listHeight+48}, 100);
	}

	_parseSVG(svgItem) {
		let width = 0;
		let height = 0;
		if (TIMAATData.mediumVideo) {
			width = TIMAATPub.medium.mediumVideo.width;
			height = TIMAATPub.medium.mediumVideo.height;
		} else if (TIMAATData.mediumImage) {
			width = TIMAATPub.medium.mediumImage.width;
			height = TIMAATPub.medium.mediumImage.height;
		} else if (TIMAATData.mediumAudio) {
			width = 800;
			height = 600;
		}
		let factor = TIMAATPub.mediumBounds.getNorth() / height;
		let id = svgItem.id;
		if ( !id ) {
			id = '-----';
			console.warn("WARNING: Annotation -> _parseSVG -> svgItem: Required attribute ID missing from model", svgItem);
		}
		switch (svgItem.type) {
			case "rectangle":
				// [[ height, x], [ y, width]]
				// var bounds = [[ Math.round(height-(svgItem.y*height)), Math.round(svgItem.x*width)], [ Math.round(height-((svgItem.y+svgItem.height)*height)), Math.round((svgItem.x+svgItem.width)*width)]];
				// let options = {transform: true, id: id, draggable: true, color: '#'+this.svg.colorHex, weight: this.svg.strokeWidth}
				var bounds = [[ Math.round(TIMAATPub.mediumBounds.getNorth()-(factor*svgItem.y*height)), Math.round(svgItem.x*factor*width)], [ Math.round(TIMAATPub.mediumBounds.getNorth()-((svgItem.y+svgItem.height)*factor*height)), Math.round((svgItem.x+svgItem.width)*factor*width)]];
				return L.rectangle(bounds, {transform: true, id: id, draggable: true, color: '#'+this.svg.colorHex, weight: this.svg.strokeWidth, fillOpacity: this.svg.opacity});
				// TODO still required?
				// if ( svgItem.fill == 0 ) {
				// 	options.fill = false;
				// 	options.weight = 5
				// 	options.opacity = 0.7;
				// }
				// return L.rectangle(bounds, options);
			case "polygon":
				var points = new Array();
				$(svgItem.points).each(function(index,point) {
					// var lat = height-(point[1]*height);
					var lat = TIMAATPub.mediumBounds.getNorth()-(point[1]*factor*height);
					// var lng = point[0]*width;
					var lng = point[0]*factor*width;
					points.push([lat,lng]);
				});
				return L.polygon(points, {transform: true, id: id, draggable: true, color: '#'+this.svg.colorHex, weight: this.svg.strokeWidth, fillOpacity: this.svg.opacity});
			case "line":
				var points = new Array();
				$(svgItem.points).each(function(index,point) {
					// var lat = height-(point[1]*height);
					var lat = TIMAATPub.mediumBounds.getNorth()-(point[1]*factor*height);
					// var lng = point[0]*width;
					var lng = point[0]*factor*width;
					points.push([lat,lng]);
				});
				return L.polyline(points, {id: id, draggable: true, color: '#'+this.svg.colorHex, weight: this.svg.strokeWidth, opacity: this.svg.opacity});
			case "circle":
				// var lat = height-(svgItem.y*height);
				var lat = TIMAATPub.mediumBounds.getNorth()-(svgItem.y*factor*height);
				// var lng = svgItem.x*width;
				var lng = svgItem.x*factor*width;
				// var radius = svgItem.radius;
				var radius = svgItem.radius * factor;
				return L.circle([lat,lng], radius, {id: id, draggable: true, color: '#'+this.svg.colorHex, weight: this.svg.strokeWidth, fillOpacity: this.svg.opacity});
		}
	}
}

/* ****************************************************************** */

class TIMAATPublication {
	constructor() {
		this.version = "v1.3";
		// setup model
		if ( TIMAATData.mediaCollectionHasMediums != null ) {
			this.collection = TIMAATData;
			this.medium = null;
		} else if (TIMAATData.mediumVideo) {
			this.collection = null;
			this.medium = TIMAATData;
			this.duration = this.medium.mediumVideo.length;
		} else if (TIMAATData.mediumImage) {
			this.collection = null;
			this.medium = TIMAATData;
			this.duration = 0;
		} else if (TIMAATData.mediumAudio) {
			this.collection = null;
			this.medium = TIMAATData;
			this.duration = this.medium.mediumAudio.length;
		}
		this.analysisList = TIMAATAnalysis;
		this.frameRate = 25;
		this.volume = 1.0;
		this.markerList = [];

		// setup UI
		this.setupUI();

		// animation player shape updater
		let animFrameRate = 20;
		if ( this.medium ) this.animInterval = setInterval(this._updateAnimations, 1000 / animFrameRate);

		console.info("TIMAAT::Publication:"+this.version+" ready");
	}

	run() {
		let hash = location.hash;

		if ( this.analysisList ) this.setupAnalysisList(this.analysisList);

		// restore session
		if ( hash && hash.length > 1 ) location.hash = hash;
	}

	pause() {
		var isPlaying = this.ui.video.currentTime > 0 && !this.ui.video.paused && !this.ui.video.ended && this.ui.video.readyState > this.ui.video.HAVE_CURRENT_DATA;
		if (isPlaying) {
			this.ui.video.pause();
		}
		$('.toggle-play-pause').removeClass('pause').addClass('play');
	}

	play() {
		var isPlaying = this.ui.video.currentTime > 0 && !this.ui.video.paused && !this.ui.video.ended && this.ui.video.readyState > this.ui.video.HAVE_CURRENT_DATA;
		if (!isPlaying) {
			this.ui.video.play();
		}
		$('.toggle-play-pause').removeClass('play').addClass('pause');
	}

	jumpTo(timeInSeconds) {
		this.ui.video.currentTime = timeInSeconds; //* html5 player always uses seconds
		// this.updateListUI(); // obsolete as updateListUI() is called within on(timeupdate), which is also called upon clicking within the time slider
	}

	jumpVisible(startInMilliseconds, endInMilliseconds) {
		let curTime = this.ui.video.currentTime * 1000;
		if ( curTime < startInMilliseconds || curTime >= endInMilliseconds ) this.ui.video.currentTime = startInMilliseconds / 1000;
		// this.updateListUI(); // obsolete as on timeupdate is called afterward
	}

	setVolume(volume) {
		if ( volume <= 0 ) $('.toggle-volume').removeClass('on').addClass('off');
		else $('.toggle-volume').removeClass('off').addClass('on');
		this.ui.video.volume = volume;
		// adjust slider
		this.ui.volumeSlider.css('width', parseFloat(this.ui.video.volume * 100.0).toString()+'%' );
	}

	openSidebar(position='Left') {
		$('#publication'+position+'Sidebar').css('width', "250px");
		$('#publication'+position+'Sidebar').removeClass('collapsed');
		$('#publicationMain').css('margin-'+position.toLowerCase(), "250px");
		$('#publicationVideoControls').css('margin-'+position.toLowerCase(), "250px");
		$('.toggle'+position+'Sidebar').addClass('btn-secondary');
		this.fitVideo();
	}

	closeSidebar(position='Left') {
		$('#publication'+position+'Sidebar').css('width', '0');
		$('#publication'+position+'Sidebar').addClass('collapsed');
		$('#publicationMain').css('margin-'+position.toLowerCase(), "0");
		$('#publicationVideoControls').css('margin-'+position.toLowerCase(), "0");
		$('.toggle'+position+'Sidebar').removeClass('btn-secondary');
		this.fitVideo();
	}

	toggleSidebar(position='Left') {
		if ( $('#publication'+position+'Sidebar').hasClass('collapsed') ) this.openSidebar(position);
		else this.closeSidebar(position);
	}

	fitVideo() {
		if ( !this.medium ) return;
		this.viewer.invalidateSize();
		this.viewer.fitBounds(TIMAATPub.mediumBounds);
/*
		let left = $(this.ui.video).offset().left;
		let right = $(this.ui.video).width();
		$('#publicationVideoControls').css('left', left+'px');
		$('#publicationVideoControls').css('width', right+'px');
*/
	}

	updateSeekBar() {
		this.ui.videoProgress.css('width', parseFloat( ((this.ui.video.currentTime * 1000 / this.duration) * 100.0).toString() )+'%' );
	}

	updateTimeInfo() {
		this.ui.timeLabel.text(this.formatTime(this.ui.video.currentTime * 1000, true));
	}

	_updateAnimations() {
		if ( TIMAATPub.ui.video.paused ) return;

		for (let annotation of TIMAATPub.annotationList) {
			let wasActive = annotation.isActive();
			annotation.updateStatus(TIMAATPub.ui.video.currentTime);
			if ( annotation.isActive() && !wasActive ) {
				// console.log("pause annotation");
				if ( TIMAATSettings.stopImage ) TIMAATPub.pause();
				if ( TIMAATSettings.stopPolygon ) TIMAATPub.pause();
				if ( TIMAATSettings.stopAudio ) TIMAATPub.pause();
			}
		}
		for (let segment of TIMAATPub.analysisList.analysisSegmentsUI) {
			let wasActive = segment.isActive();
			segment.updateStatus(TIMAATPub.ui.video.currentTime);
			if ( segment.isActive() && !wasActive) {
				// console.log("pause segment");
				if ( TIMAATSettings.stopSegment ) TIMAATPub.pause();
			}
		}
	}

	getInterpolatedShape(shapeFrom, shapeTo, percent) {
			if ( !shapeFrom || !shapeTo || percent == null ) return null;
			percent = percent < 0 ? 0 : percent;
			percent = percent > 1 ? 1 : percent;
			if ( shapeFrom.id != shapeTo.id ) return null;
			if ( shapeFrom == shapeTo ) return shapeFrom;
			if ( percent == 0 ) return shapeFrom;
			if ( percent == 1 ) return shapeTo;
			let interShape = { id: shapeFrom.id, type: shapeFrom.type };
			switch (shapeFrom.type) {
				case 'rectangle':
					interShape.bounds = [ this._lerpValue(shapeFrom.bounds[0], shapeTo.bounds[0], percent), this._lerpValue(shapeFrom.bounds[1], shapeTo.bounds[1], percent) ];
					break;
				case "polygon":
				case "line":
					interShape.points = new Array();
					for (let index=0; index < shapeFrom.points.length; index++)
						interShape.points.push(this._lerpValue(shapeFrom.points[index], shapeTo.points[index], percent));
					break;
				case "circle":
					interShape.point = this._lerpValue(shapeFrom.point, shapeTo.point, percent);
					interShape.radius = this._lerpValue(shapeFrom.radius, shapeTo.radius, percent);
					break;
			}
			return interShape;
	}

	_lerpValue(from, to, percent) {
			if ( !from || !to || percent == null ) return null;
			if ( Array.isArray(from) )
				return [from[0] + (to[0] - from[0]) * percent, from[1] + (to[1] - from[1]) * percent];
			else
				return from + (to - from) * percent;
	}

	formatTime(timeInMilliseconds, withFraction = false) {
		var timeInSeconds = timeInMilliseconds / 1000;
		var hours         = Math.floor(timeInSeconds / 3600);
		var minutes       = Math.floor((timeInSeconds - (hours * 3600)) / 60);
		var seconds       = timeInSeconds - ((hours * 3600) + (minutes * 60));
		var fraction      = seconds - Math.floor(seconds);
		seconds       		= Math.floor(seconds);

		var time = "";
		if ( hours < 10) time += "0";
		time += hours + ":";
		if ( minutes < 10 ) time += "0";
		time += minutes + ":";
		if ( seconds < 10 ) time += "0";
		time += seconds;
		if ( withFraction ) time += fraction.toFixed(3).substring(1);

		return time;
	}

	formatDate(timestamp) {
		var a      = new Date(timestamp);
		// var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Okt','Nov','Dez'];
		var year   = a.getFullYear();
		var month  = ("0" + (a.getMonth()+1)).substr(-2);
		var date   = ("0" + a.getDate()).substr(-2);
		var hour   = ("0" + a.getHours()).substr(-2);
		var min    = ("0" + a.getMinutes()).substr(-2);
		var sec    = ("0" + a.getSeconds()).substr(-2);
		var time   = date + '.' + month + '.' + year + ', ' + hour + ':' + min + ':' + sec ;
		return time;
	}

	setListMetadata() {
		if ( !this.analysisList ) return;

		if ( !this.analysisList.mediumAnalysisListTranslations[0].title || this.analysisList.mediumAnalysisListTranslations[0].title.length == 0) this.ui.list.title.addClass('empty');
		else {
			this.ui.list.title.removeClass('empty');
			this.ui.list.title.find('.contents').html(this.analysisList.mediumAnalysisListTranslations[0].title);
		}
		if ( !this.analysisList.mediumAnalysisListTranslations[0].text || this.analysisList.mediumAnalysisListTranslations[0].text.length == 0) this.ui.list.comment.addClass('empty');
		else {
			this.ui.list.comment.removeClass('empty');
			this.ui.list.comment.find('.contents').html(this.analysisList.mediumAnalysisListTranslations[0].text);
		}
		if ( !this.analysisList.categorySets || this.analysisList.categorySets.length == 0) {
			this.ui.list.categorySets.addClass('empty');
		}	else {
			let i = 0;
			let categorySetString = '';
			for (; i < this.analysisList.categorySets.length; i++) {
				categorySetString += this.analysisList.categorySets[i].name + ', ';
			}
			categorySetString = categorySetString.slice(0, -2); // remove last ', ' from string
			this.ui.list.categorySets.removeClass('empty');
			this.ui.list.categorySets.find('.contents').html(categorySetString);
		}
		if ( !this.analysisList.tags || this.analysisList.tags.length == 0) {
			this.ui.list.tags.addClass('empty');
		} else {
			let i = 0;
			let tagString = '';
			for (; i < this.analysisList.tags.length; i++) {
				tagString += this.analysisList.tags[i].name + ', ';
			}
			tagString = tagString.slice(0, -2); // remove last ', ' from string
			this.ui.list.tags.removeClass('empty');
			this.ui.list.tags.find('.contents').html(tagString);
		}
	}

	setSegmentMetadata(segment) {
		if ( !segment ) return;

		this.ui.segmentMetadata.removeClass('d-none');

		let name = segment.model.analysisSegmentTranslations[0].name;
		let desc = ( segment.model.analysisSegmentTranslations[0].shortDescription ) ? segment.model.analysisSegmentTranslations[0].shortDescription : '';
		let comment = segment.model.analysisSegmentTranslations[0].comment;
		let transcript = segment.model.analysisSegmentTranslations[0].transcript;

		if ( !name || name.length == 0) this.ui.segment.name.addClass('empty');
		else {
			this.ui.segment.title.removeClass('empty');
			this.ui.segment.title.find('.contents').html(name);
		}
		if ( !desc || desc.length == 0) this.ui.segment.description.addClass('empty');
		else {
			this.ui.segment.description.removeClass('empty');
			this.ui.segment.description.find('.contents').html(desc);
		}
		if ( !comment || comment.length == 0) this.ui.segment.comment.addClass('empty');
		else {
			this.ui.segment.comment.removeClass('empty');
			this.ui.segment.comment.find('.contents').html(comment);
		}
		if ( !transcript || transcript.length == 0) this.ui.segment.transcript.addClass('empty');
		else {
			this.ui.segment.transcript.removeClass('empty');
			this.ui.segment.transcript.find('.contents').html(transcript);
		}
		if ( !segment.model.categories || segment.model.categories.length == 0) {
			this.ui.segment.categories.addClass('empty');
		}	else {
			let i = 0;
			let categoryString = '';
			for (; i < segment.model.categories.length; i++) {
				categoryString += segment.model.categories[i].name + ', ';
			}
			categoryString = categoryString.slice(0, -2); // remove last ', ' from string
			this.ui.segment.categories.removeClass('empty');
			this.ui.segment.categories.find('.contents').html(categoryString);
		}
	}

	selectAnnotation(annotation, changeHash=true) {
		if ( this.curAnnotation == annotation && annotation != null ) return;
		if ( this.curAnnotation ) this.curAnnotation.setSelected(false);
		this.curAnnotation = annotation;
		if ( this.curAnnotation ) {
			this.ui.segmentMetadata.addClass('d-none');
			this.curAnnotation.setSelected(true);
			this.ui.annoMetadata.removeClass('d-none');
		} else {
			this.ui.annoMetadata.addClass('d-none');
		}
		if ( changeHash ) {
			if (annotation) location.hash = '#'+annotation.model.uuid;
			else location.hash = '#' // UUIDs not yet available in timaat db
		}
		this.setAnnotationMetadata();
	}

	setAnnotationMetadata() {
		if ( !this.curAnnotation ) return;
		if ( !this.curAnnotation.model.annotationTranslations[0].title || this.curAnnotation.model.annotationTranslations[0].title == 0) this.ui.annotation.title.addClass('empty');
		else {
			this.ui.annotation.title.removeClass('empty');
			this.ui.annotation.title.find('.contents').html(this.curAnnotation.model.annotationTranslations[0].title);
		}
		if ( !this.curAnnotation.model.annotationTranslations[0].comment || this.curAnnotation.model.annotationTranslations[0].comment == 0) this.ui.annotation.comment.addClass('empty');
		else {
			this.ui.annotation.comment.removeClass('empty');
			this.ui.annotation.comment.find('.contents').html(this.curAnnotation.model.annotationTranslations[0].comment);
		}
		if ( !this.curAnnotation.model.categories || this.curAnnotation.model.categories.length == 0) {
			this.ui.annotation.categories.addClass('empty');
		}	else {
			let i = 0;
			let categoryString = '';
			for (; i < this.curAnnotation.model.categories.length; i++) {
				categoryString += this.curAnnotation.model.categories[i].name + ', ';
			}
			categoryString = categoryString.slice(0, -2); // remove last ', ' from string
			this.ui.annotation.categories.removeClass('empty');
			this.ui.annotation.categories.find('.contents').html(categoryString);
		}
		if ( !this.curAnnotation.model.tags || this.curAnnotation.model.tags.length == 0) {
			this.ui.annotation.tags.addClass('empty');
		} else {
			let i = 0;
			let tagString = '';
			for (; i < this.curAnnotation.model.tags.length; i++) {
				tagString += this.curAnnotation.model.tags[i].name + ', ';
			}
			tagString = tagString.slice(0, -2); // remove last ', ' from string
			this.ui.annotation.tags.removeClass('empty');
			this.ui.annotation.tags.find('.contents').html(tagString);
		}
		if ( !this.curAnnotation.model.actors || this.curAnnotation.model.actors.length == 0) {
			this.ui.annotation.actors.addClass('empty');
		} else {
			let i = 0;
			let actorString = '';
			for (; i < this.curAnnotation.model.actors.length; i++) {
				actorString += this.curAnnotation.model.actors[i].displayName.name + ', ';
			}
			actorString = actorString.slice(0, -2); // remove last ', ' from string
			this.ui.annotation.actors.removeClass('empty');
			this.ui.annotation.actors.find('.contents').html(actorString);
		}
		if ( !this.curAnnotation.model.events || this.curAnnotation.model.events.length == 0) {
			this.ui.annotation.events.addClass('empty');
		} else {
			let i = 0;
			let eventString = '';
			for (; i < this.curAnnotation.model.events.length; i++) {
				eventString += this.curAnnotation.model.events[i].eventTranslations[0].name + ', ';
			}
			eventString = eventString.slice(0, -2); // remove last ', ' from string
			this.ui.annotation.events.removeClass('empty');
			this.ui.annotation.events.find('.contents').html(eventString);
		}
		// this.ui.annotation.places.addClass('empty');

	}

	setupAnalysisList(analysisList, changeHash=true) {
		if ( !this.medium ) return;
		if ( this.curAnnotation ) this.curAnnotation.setSelected(false);

		// setup model
		this.analysisList = analysisList;
		this.ui.listLabel.text(this.analysisList.mediumAnalysisListTranslations[0].title);
		// clear polygon UI
		this.viewer.annoLayer.eachLayer(function(layer) {layer.remove()});

		// clear old list contents if any
		if ( this.analysisList != null && this.analysisList.analysisSegmentsUI != null) {
			this.analysisList.analysisSegmentsUI.forEach(function(segment) {
				segment.removeUI();
			});
			this.annotationList.forEach(function(anno) {
				anno.remove();
			});
		}
		this.annotationList = [];
		this.analysisList = analysisList;
		this.setListMetadata();

		// setup segment model
		if ( !this.analysisList.analysisSegmentsUI ) {
			this.analysisList.analysisSegmentsUI = [];
			for ( let segment of this.analysisList.analysisSegments ) this.analysisList.analysisSegmentsUI.push(new AnalysisSegment(segment));
		}
		this.sortSegments();

		// build annotation list from model
		if ( analysisList )
			for (let annotation of analysisList.annotations) this.annotationList.push(new Annotation(annotation));

		if ( this.analysisList != null && this.analysisList.analysisSegmentsUI != null) this.analysisList.analysisSegmentsUI.forEach(function(segment) {
			segment.addUI();
		});
		this.selectAnnotation(null, changeHash);
		this.updateListUI();
		this.sortListUI();

		if (TIMAATData.mediumVideo || TIMAATData.mediumAudio) {
			this.ui.video.pause();
		}
	}

	sortSegments() {
		this.analysisList.analysisSegmentsUI.sort(function (a, b) {
			if ( b.model.startTime < a.model.startTime ) return 1;
			if ( b.model.startTime > a.model.startTime ) return -1;
			return 0;
		})
	}

	updateControlsTimeout() {
		if ( this.ui.controlsTimeout ) clearTimeout(this.ui.controlsTimeout);
		if ( !this.ui.onControls ) this.ui.controlsTimeout = setTimeout(function() {$('#publicationVideoControls').fadeOut('slow')}, 3000);
	}

	updateListUI() {
		if (this.annotationList) for (let annotation of this.annotationList) annotation.updateStatus(TIMAATPub.ui.video.currentTime);
		if (this.analysisList.analysisSegmentsUI) for (let segment of this.analysisList.analysisSegmentsUI) segment.updateStatus(TIMAATPub.ui.video.currentTime);
	}

	sortListUI() {
		$(".analysis__list--li").sort(function (a, b) {
			if ( (parseFloat($(b).attr('data-start-time'))) < (parseFloat($(a).attr('data-start-time'))) ) return 1;
			if ( (parseFloat($(b).attr('data-start-time'))) > (parseFloat($(a).attr('data-start-time'))) ) return -1;
			if ( !$(b).hasClass('annotationListSegment') &&  $(a).hasClass('annotationListSegment') ) return -1;
			return 0;
		}).appendTo('#analysisList');
	}

	setupUI() {
		if (this.ui) return;
		this.ui = {
			videoSeekBar: $('.videoSeekBar'),
			videoProgress: $('.videoSeekBar').find('.progress'),
			volumeSlider: $('.volumeSeekBar').find('.progress'),
			timeLabel: $('.startTime'),
			durationLabel: $('.endTime'),
			listLabel: $('.list__title'),
			timeInfoLabel: $('#publicationVideoControls .timeInfo'),
			mediumMetadata: $('.mediumMetadata'),
			medium: {
				title : $('.mediumTitle'),
				remark : $('.mediumRemark'),
				releaseDate : $('.mediumReleaseData'),
				source : $('.mediumSource'),
				copyright : $('.mediumCopyright'),
				categories : $('.mediumCategories'),
				tags : $('.mediumTags'),
			},
			annotation: {
				title : $('.annotationTitle'),
				comment : $('.annotationComment'),
				categories : $('.annotationCategories'),
				tags : $('.annotationTags'),
				actors : $('.annotationActors'),
				events : $('.annotationEvents'),
				places : $('.annotationPlaces'),
				links : $('.annotationLinks'),
			},
			list: {
				title : $('.listTitle'),
				comment : $('.listComment'),
				categorySets : $('.listCategorySets'),
				tags : $('.listTags'),
			},
			segment: {
				title : $('.segmentName'),
				description : $('.segmentDescription'),
				comment : $('.segmentComment'),
				transcript : $('.segmentTranscript'),
				categories : $('.segmentCategories'),
			},
			annoMetadata: $('.annotationMetadata'),
			listMetadata: $('.listMetadata'),
			segmentMetadata: $('.segmentMetadata'),
			videoTemplate: `<li class="card mr-2 mb-2 bg-dark width--268">
												<a href="#" title="">
													<img src="#" alt="" class="preview img-responsive card m-auto b-block border-dark" height="150px">
													<h6 class="pt-1 pl-1 pr-1 text-light font__size--80">
														<i class="fas fa-video"></i>
														<span class="title">Video</span>
													</h6>
													<span class="duration badge badge-dark badge-pill video-template--duration">00:00</span>
												</a>
											</li>`,
		};

		if ( this.medium ) {
			// viewer
			this.viewer = L.map('publication__viewer', {
				zoomControl: false,
				attributionControl: false,
				zoom: 0.0,
				zoomSnap: 0.0001,
				maxZoom: 2.0,
				minZoom: -2.0,
				center: [0,0],
				crs: L.CRS.Simple,
				editable: true,
				keyboard: false,
			});
			this.viewer.dragging.disable();
			this.viewer.touchZoom.disable();
			this.viewer.doubleClickZoom.disable();
			this.viewer.scrollWheelZoom.disable();

			// video
			if (TIMAATData.mediumVideo) {
				this.mediumBounds = L.latLngBounds([[ this.medium.mediumVideo.height, 0], [ 0, this.medium.mediumVideo.width]]);
				this.viewer.setMaxBounds(this.mediumBounds);
				this.viewer.fitBounds(this.mediumBounds);
				let filename = ( TIMAATSettings.offline ) ? this.medium.id+'.mp4' : window.location.pathname.substring(0,window.location.pathname.lastIndexOf('/')+1) + 'item-'+this.medium.id;
				this.overlay = L.videoOverlay(filename, this.mediumBounds, { autoplay: false, loop: false} ).addTo(this.viewer);
				this.ui.video = this.overlay.getElement();
			} else if (TIMAATData.mediumImage) {
				this.mediumBounds = L.latLngBounds([[ this.medium.mediumImage.height, 0], [ 0, this.medium.mediumImage.width]]);
				this.viewer.setMaxBounds(this.mediumBounds);
				this.viewer.fitBounds(this.mediumBounds);
				let filename = ( TIMAATSettings.offline ) ? this.medium.id+'.png' : window.location.pathname.substring(0,window.location.pathname.lastIndexOf('/')+1) + 'item-'+this.medium.id;
				this.overlay = L.imageOverlay( filename, this.mediumBounds, { autoplay: false, loop: false} ).addTo(this.viewer);
				this.ui.video = this.overlay.getElement();
			} else if (TIMAATData.mediumAudio) {
				this.mediumBounds = L.latLngBounds([[ 600, 0], [ 0, 800]]);
				this.viewer.setMaxBounds(this.mediumBounds);
				this.viewer.fitBounds(this.mediumBounds);
				let filename = ( TIMAATSettings.offline ) ? this.medium.id+'.mp3' : window.location.pathname.substring(0,window.location.pathname.lastIndexOf('/')+1) + 'item-'+this.medium.id;
				this.overlay = L.videoOverlay(filename, this.mediumBounds, { autoplay: false, loop: false} ).addTo(this.viewer);
				this.ui.video = this.overlay.getElement();
			}

			// polygon layer
			this.viewer.annoLayer = new L.LayerGroup();
			this.viewer.addLayer(this.viewer.annoLayer);

			// initial display adjustments
			$('.annotationSection').hide();
			$('.segmentSection').hide();

			// medium metadata
			let title = this.medium.displayTitle.name+' ('+this.medium.displayTitle.language.code+')';
			if ( this.medium.originalTitle ) title += '<br>OT: '+this.medium.originalTitle.name+' ('+this.medium.originalTitle.language.code+')'
			this.ui.medium.title.find('.contents').html(title);
			if ( !this.medium.remark || this.medium.remark.length == 0) this.ui.medium.remark.addClass('empty')
			else this.ui.medium.remark.find('.contents').html(this.medium.remark);
			this.ui.medium.releaseDate.find('.contents').html(this.formatDate(this.medium.releaseDate));
			if ( !this.medium.sources || this.medium.sources.length == 0 ) this.ui.medium.source.addClass('empty');
			else {
				let sources = '';
				for (let source of this.medium.sources) {
					if ( source.isPrimarySource ) sources += '<div class="d-flex justify-content-between"><span class="badge badge-primary mt-1">Primary</span><span>'+this.formatDate(source.lastAccessed)+'</span></div>';
					else sources += '<div class="d-flex justify-content-end"><span>'+this.formatDate(source.lastAccessed)+'</span></div>';
					if ( source.isStillAvailable ) sources += '<a href="'+source.url+'">'+source.url+'</a>'; else sources += '<span class="text-muted">'+source.url+'</span>';
				}
				this.ui.medium.source.find('.contents').html(sources);
			}
			if ( !this.medium.copyright || this.medium.copyright.length == 0) this.ui.medium.copyright.addClass('empty');
			else this.ui.medium.copyright.find('.contents').html(this.medium.copyright);
			if ( !this.medium.categories || this.medium.categories.length == 0) this.ui.medium.categories.addClass('empty');
			else {
				let i = 0;
				let categoryString = '';
				for (; i < this.medium.categories.length; i++) {
					categoryString += this.medium.categories[i].name + ', ';
				}
				categoryString = categoryString.slice(0, -2); // remove last ', ' from string
				this.ui.medium.categories.removeClass('empty');
				this.ui.medium.categories.find('.contents').html(categoryString);
			}
			if ( !this.medium.tags || this.medium.tags.length == 0) this.ui.medium.tags.addClass('empty');
			else {
				let i = 0;
				let tagString = '';
				for (; i < this.medium.tags.length; i++) {
					tagString += this.medium.tags[i].name + ', ';
				}
				tagString = tagString.slice(0, -2); // remove last ', ' from string
				this.ui.medium.tags.removeClass('empty');
				this.ui.medium.tags.find('.contents').html(tagString);
			}
		} else {
			// setup video list
			let list = $('#publicationCollectionList');
			for ( let medium of this.collection.mediaCollectionHasMediums ) {
				medium = medium.medium;
				let title = medium.displayTitle.name+' ('+medium.displayTitle.language.code+')';
				if ( medium.originalTitle ) title += ' - OT: '+medium.originalTitle.name+' ('+medium.originalTitle.language.code+')';
				let item = $(this.ui.videoTemplate);
				item.find('a').attr('href', medium.id);
				item.find('.preview').attr('src', 'item-'+medium.id+'/preview.jpg');
				item.find('.preview').attr('alt', title);
				item.find('.title').text(title);
				if (medium.mediumVideo) item.find('.duration').html(this.formatTime(medium.mediumVideo.length,true));
				if (medium.mediumAudio) item.find('.duration').html(this.formatTime(medium.mediumAudio.length,true));
				list.append(item);
			}
		}

		// settings events
		$('.publication__settings').on('click', function(ev) {ev.stopPropagation();});
		$('.settingsStopAtImage').prop('checked', TIMAATSettings.stopImage == true);
		$('.settingsStopAtPolygon').prop('checked', TIMAATSettings.stopPolygon == true);
		$('.settingsStopAtAudio').prop('checked', TIMAATSettings.stopAudio == true);
		$('.settingsStopAtSegment').prop('checked', TIMAATSettings.stopSegment == true);
		$('.settingsStopAtImage, .settingsStopAtPolygon, .settingsStopAtAudio, .settingsStopAtSegment').on('change', ev => {
			let status = $(ev.currentTarget).prop('checked');
			if ( $(ev.currentTarget).hasClass('settingsStopAtImage') ) TIMAATSettings.stopImage = status;
			if ( $(ev.currentTarget).hasClass('settingsStopAtPolygon') ) TIMAATSettings.stopPolygon = status;
			if ( $(ev.currentTarget).hasClass('settingsStopAtAudio') ) TIMAATSettings.stopAudio = status;
			if ( $(ev.currentTarget).hasClass('settingsStopAtSegment') ) TIMAATSettings.stopSegment = status;
		});

		// events
		$('#publicationToggleFullscreen').on('click', ev => {
			try {
				if ( document.fullscreenElement ) document.exitFullscreen();
				else $('#publicationMain')[0].requestFullscreen();

			} catch (e) {};
		});
		$(document).on('fullscreenChange', ev => {
			if ( document.fullscreenElement ) $('#publicationToggleFullscreen').removeClass('btn-outline-dark').addClass('btn-dark');
			else $('#publicationToggleFullscreen').addClass('btn-outline-dark').removeClass('btn-dark');
		});

		if (TIMAATData.mediumVideo) {
			$('#publication__viewer').on('mousemove', ev=> { $('#publicationVideoControls').fadeIn(); TIMAATPub.updateControlsTimeout(); });
			$('#publicationVideoControls').on('mouseenter', ev=> { TIMAATPub.ui.onControls = true; TIMAATPub.updateControlsTimeout(); });
			$('#publicationVideoControls').on('mouseleave', ev=> { TIMAATPub.ui.onControls = false; TIMAATPub.updateControlsTimeout(); });
		} else if (TIMAATData.mediumImage) {
			$('.stopPlaybackConditions').hide();
			$('#publicationVideoControls').show();
			$('.top-control').hide();
			$('.playback-controls').hide();
			$('.video-volume-control').hide();
			$('.video-timings').removeClass('d-inline-flex');
			$('.video-timings').hide();
			$('.playbackSpeedInfo').closest('div').hide();
			$('.toggleRightSidebar').trigger('click');
		} else if (TIMAATData.mediumAudio) {
			$('#publication__viewer').on('mousemove', ev=> { $('#publicationVideoControls').fadeIn(); TIMAATPub.updateControlsTimeout(); });
			$('#publicationVideoControls').on('mouseenter', ev=> { TIMAATPub.ui.onControls = true; TIMAATPub.updateControlsTimeout(); });
			$('#publicationVideoControls').on('mouseleave', ev=> { TIMAATPub.ui.onControls = false; TIMAATPub.updateControlsTimeout(); });
		}

		$('.sidebar').on('transitionend', function(ev) { TIMAATPub.fitVideo(); });

		$('.videoSeekBar').on('mouseenter mouseleave', ev => { TIMAATPub.ui.seekBarPos = ev.originalEvent.layerX;
			if ( ev.type == 'mouseenter' ) TIMAATPub.ui.timeInfoLabel.addClass('show');
			else TIMAATPub.ui.timeInfoLabel.removeClass('show');
			TIMAATPub.ui.timeInfoLabel.text(TIMAATPub.formatTime(parseFloat(ev.originalEvent.layerX / $('.videoSeekBar').width() * TIMAATPub.duration)));
		});

		$('.videoSeekBar').on('click mousemove', e => {
			TIMAATPub.ui.timeInfoLabel.css('left', (e.originalEvent.layerX-30)+'px');
			TIMAATPub.ui.timeInfoLabel.text(TIMAATPub.formatTime(parseFloat(e.originalEvent.layerX / $('.videoSeekBar').width() * TIMAATPub.duration)));
			if ( e.type == 'mousemove' && e.originalEvent.buttons != 1 ) return;
			let seekPos = e.pageX - $('#publicationVideoControls')[0].offsetLeft - $('.videoSeekBar')[0].offsetLeft;
			let seekVal = seekPos / $('.videoSeekBar')[0].clientWidth;
			TIMAATPub.jumpTo(seekVal * TIMAATPub.duration / 1000);
		});

		$('.volumeSeekBar').on('click mousemove', e => {
			e.preventDefault();
			if ( e.type == 'mousemove' && e.originalEvent.buttons != 1 ) return;
			let seekVal = e.originalEvent.layerX / ($('.volumeSeekBar').width() + 2.0);
			seekVal = Math.max(0.0, Math.min(seekVal, 1.0));
			TIMAATPub.setVolume(seekVal);
		});

		$('.stepBackButton').on('click dblclick', ev => {
			ev.preventDefault();
			ev.stopPropagation();
			TIMAATPub.pause();
			let frameTime = 1 / TIMAATPub.frameRate;
			TIMAATPub.jumpTo(
				Math.max(0, (Math.round(TIMAATPub.ui.video.currentTime / frameTime) * frameTime) - frameTime)
			);
		});

		$('.stepForwardButton').on('click dblclick', ev => {
			ev.preventDefault();
			ev.stopPropagation();
			TIMAATPub.pause();
			let frameTime = 1 / TIMAATPub.frameRate;
			TIMAATPub.jumpTo(
				Math.min(TIMAATPub.duration, (Math.round(TIMAATPub.ui.video.currentTime / frameTime) * frameTime) + frameTime)
			);
		});

		$('.playbackSpeed').on('click', function() {
			var playbackSpeeds = [1,2,0.5,0.25]; // TODO move to config

			var speed = playbackSpeeds.indexOf(TIMAATPub.ui.video.playbackRate);
			if ( speed < 0 ) TIMAATPub.ui.video.playbackRate = 1;
			else {
				speed++;
				if ( speed > playbackSpeeds.length-1 ) speed = 0;
				TIMAATPub.ui.video.playbackRate = playbackSpeeds[speed];
			}
			let rateInfo = TIMAATPub.ui.video.playbackRate;
			if ( rateInfo == 0.5 ) rateInfo = "&frac12;";
			if ( rateInfo == 0.25 ) rateInfo = "&frac14;";
			// update UI
			$(this).find('.playbackSpeedInfo').html(rateInfo+"&times;");
			if ( TIMAATPub.ui.video.playbackRate != 1 ) $(this).addClass('active'); else $(this).removeClass('active');
		});

		$('.toggleLeftSidebar').on('click', ev => { this.toggleSidebar('Left'); });
		$('.toggleRightSidebar').on('click', ev => { this.toggleSidebar('Right'); });

	    $(this.ui.video).on('loadeddata timeupdate', () => {
			this.updateSeekBar();
			this.updateTimeInfo();
			this.updateListUI();
		});
 	    $(this.ui.video).on('ended', () => {
			this.pause();
			this.updateSeekBar();
			this.updateTimeInfo();
		});

		$('.toggle-play-pause').on('click', ev => {
			ev.preventDefault();
			if (TIMAATData.mediumVideo || TIMAATData.mediumAudio) {
				if ( $('.toggle-play-pause').hasClass('play') ) TIMAATPub.play(); else TIMAATPub.pause();
			}
		});

		$('.toggle-volume').on('click', ev => {
			ev.preventDefault();
			if ( TIMAATPub.ui.video.volume > 0 ) {
				TIMAATPub.volume = TIMAATPub.ui.video.volume;
				TIMAATPub.setVolume(0);
			} else TIMAATPub.setVolume(TIMAATPub.volume);
		});

		$(window).resize(function() { TIMAATPub.fitVideo(); });

		// key events
		let viewElement = ( this.medium ) ? this.viewer : $('#publicationCollectionList');
		$([document.body,viewElement]).keydown(function(ev) {
			if ( ev.target != document.body && ev.target != TIMAATPub.viewer ) return;

			var key;
			if ( ev.originalEvent.key ) key = ev.originalEvent.key;
			else key = ev.originalEvent.originalEvent.key;

			switch (key) {
			case " ":
				ev.preventDefault();
				$('.toggle-play-pause').click();
				break;
			case "ArrowLeft":
				ev.preventDefault();
				$('.stepBackButton').click();
				break;
			case "ArrowRight":
				ev.preventDefault();
				$('.stepForwardButton').click();
				break;
			case "m":
				ev.preventDefault();
				$('.toggle-volume').click();
				break;
			case "a":
				ev.preventDefault();
				$('.toggleLeftSidebar').click();
				break;
			case "i":
				ev.preventDefault();
				$('.toggleRightSidebar').click();
				break;
			case "f":
				ev.preventDefault();
				$('#publicationToggleFullscreen').click();
				break;
			case "s":
				ev.preventDefault();
				$('.playbackSpeed').click();
				break;
			}
		});

		$(window).on('hashchange', ev=>{
			let hash = location.hash;
			if ( !hash || hash.length < 1 ) return;
			let id = 0;
//			try { id = parseInt(hash.substring(1)); } catch(e) {};
			id = hash.substring(1);
			if ( id == 0 ) return;

			TIMAATPub.setupAnalysisList(this.analysisList, false);

			if ( !TIMAATPub.curAnnotation || TIMAATPub.curAnnotation.model.uuid != id ) for ( let anno of TIMAATPub.annotationList ) if ( anno.model.uuid == id ) {
				TIMAATPub.selectAnnotation(anno);
				TIMAATPub.pause();
				TIMAATPub.jumpVisible(anno.startTime, anno.endTime);
			}
		});

		// text
		if ( this.medium ) {
			$('.mediumTitle').text(this.medium.displayTitle.name);
			this.ui.durationLabel.html(this.formatTime(this.duration, true));
		} else {
			$('.mediumTitle').text(this.collection.title);
		}

	}

}
