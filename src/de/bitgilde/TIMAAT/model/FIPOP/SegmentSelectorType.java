package de.bitgilde.TIMAAT.model.FIPOP;

import java.io.Serializable;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonManagedReference;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.NamedQuery;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

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
 * The persistent class for the segment_selector_type database table.
 *
 * @author Jens-Martin Loebel <loebel@bitgilde.de>
 * @author Mirko Scherf <mscherf@uni-mainz.de>
 */
@Entity
@Table(name="segment_selector_type")
@NamedQuery(name="SegmentSelectorType.findAll", query="SELECT s FROM SegmentSelectorType s")
public class SegmentSelectorType implements Serializable {
	private static final long serialVersionUID = 1L;

	@Id
	@GeneratedValue(strategy=GenerationType.IDENTITY)
	private int id;

	// TODO get type from translations
	//bi-directional many-to-one association to Annotation
	@OneToMany(mappedBy="segmentSelectorType")
	@JsonManagedReference(value = "SegmentSelectorType-Annotation")
	private List<Annotation> annotations;

	//bi-directional many-to-one association to SegmentSelectorTypeTranslation
	@OneToMany(mappedBy="segmentSelectorType")
	private List<SegmentSelectorTypeTranslation> segmentSelectorTypeTranslations;

	public SegmentSelectorType() {
	}

	public int getId() {
		return this.id;
	}

	public void setId(int id) {
		this.id = id;
	}

	public List<Annotation> getAnnotations() {
		return this.annotations;
	}

	public void setAnnotations(List<Annotation> annotations) {
		this.annotations = annotations;
	}

	public Annotation addAnnotation(Annotation annotation) {
		getAnnotations().add(annotation);
		annotation.setSegmentSelectorType(this);

		return annotation;
	}

	public Annotation removeAnnotation(Annotation annotation) {
		getAnnotations().remove(annotation);
		annotation.setSegmentSelectorType(null);

		return annotation;
	}

	public List<SegmentSelectorTypeTranslation> getSegmentSelectorTypeTranslations() {
		return this.segmentSelectorTypeTranslations;
	}

	public void setSegmentSelectorTypeTranslations(List<SegmentSelectorTypeTranslation> segmentSelectorTypeTranslations) {
		this.segmentSelectorTypeTranslations = segmentSelectorTypeTranslations;
	}

	public SegmentSelectorTypeTranslation addSegmentSelectorTypeTranslation(SegmentSelectorTypeTranslation segmentSelectorTypeTranslation) {
		getSegmentSelectorTypeTranslations().add(segmentSelectorTypeTranslation);
		segmentSelectorTypeTranslation.setSegmentSelectorType(this);

		return segmentSelectorTypeTranslation;
	}

	public SegmentSelectorTypeTranslation removeSegmentSelectorTypeTranslation(SegmentSelectorTypeTranslation segmentSelectorTypeTranslation) {
		getSegmentSelectorTypeTranslations().remove(segmentSelectorTypeTranslation);
		segmentSelectorTypeTranslation.setSegmentSelectorType(null);

		return segmentSelectorTypeTranslation;
	}

}