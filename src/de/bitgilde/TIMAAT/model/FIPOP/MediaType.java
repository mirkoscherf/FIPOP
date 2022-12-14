package de.bitgilde.TIMAAT.model.FIPOP;

import java.io.Serializable;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Column;
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
 * The persistent class for the media_type database table.
 *
 * @author Jens-Martin Loebel <loebel@bitgilde.de>
 * @author Mirko Scherf <mscherf@uni-mainz.de>
 */
@Entity
@Table(name="media_type")
@NamedQuery(name="MediaType.findAll", query="SELECT mt FROM MediaType mt")
public class MediaType implements Serializable {
	private static final long serialVersionUID = 1L;

	@Id
	@GeneratedValue(strategy=GenerationType.IDENTITY)
	private int id;

	@Column(name="has_audio", columnDefinition = "BOOLEAN")
	private Boolean hasAudio;

	@Column(name="has_content", columnDefinition = "BOOLEAN")
	private Boolean hasContent;

	@Column(name="has_visual", columnDefinition = "BOOLEAN")
	private Boolean hasVisual;

	//bi-directional many-to-one association to GenreGroup
	// @OneToMany(mappedBy="mediaType")
	// private List<GenreGroup> genreGroups;

	//bi-directional many-to-one association to MediaTypeTranslation
	@OneToMany(mappedBy="mediaType")
	private List<MediaTypeTranslation> mediaTypeTranslations;

	//bi-directional many-to-one association to Medium
	@OneToMany(mappedBy="mediaType")
	@JsonIgnore
	private List<Medium> mediums;

	public MediaType() {
	}

	public int getId() {
		return this.id;
	}

	public void setId(int id) {
		this.id = id;
	}

	public Boolean getHasAudio() {
		return this.hasAudio;
	}

	public void setHasAudio(Boolean hasAudio) {
		this.hasAudio = hasAudio;
	}

	public Boolean getHasContent() {
		return this.hasContent;
	}

	public void setHasContent(Boolean hasContent) {
		this.hasContent = hasContent;
	}

	public Boolean getHasVisual() {
		return this.hasVisual;
	}

	public void setHasVisual(Boolean hasVisual) {
		this.hasVisual = hasVisual;
	}

	// public List<GenreGroup> getGenreGroups() {
	// 	return this.genreGroups;
	// }

	// public void setGenreGroups(List<GenreGroup> genreGroups) {
	// 	this.genreGroups = genreGroups;
	// }

	// public GenreGroup addGenreGroup(GenreGroup genreGroup) {
	// 	getGenreGroups().add(genreGroup);
	// 	genreGroup.setMediaType(this);

	// 	return genreGroup;
	// }

	// public GenreGroup removeGenreGroup(GenreGroup genreGroup) {
	// 	getGenreGroups().remove(genreGroup);
	// 	genreGroup.setMediaType(null);

	// 	return genreGroup;
	// }

	public List<MediaTypeTranslation> getMediaTypeTranslations() {
		return this.mediaTypeTranslations;
	}

	public void setMediaTypeTranslations(List<MediaTypeTranslation> mediaTypeTranslations) {
		this.mediaTypeTranslations = mediaTypeTranslations;
	}

	public MediaTypeTranslation addMediaTypeTranslation(MediaTypeTranslation mediaTypeTranslation) {
		getMediaTypeTranslations().add(mediaTypeTranslation);
		mediaTypeTranslation.setMediaType(this);

		return mediaTypeTranslation;
	}

	public MediaTypeTranslation removeMediaTypeTranslation(MediaTypeTranslation mediaTypeTranslation) {
		getMediaTypeTranslations().remove(mediaTypeTranslation);
		mediaTypeTranslation.setMediaType(null);

		return mediaTypeTranslation;
	}

	public List<Medium> getMediums() {
		return this.mediums;
	}

	public void setMediums(List<Medium> mediums) {
		this.mediums = mediums;
	}

	public Medium addMedium(Medium medium) {
		getMediums().add(medium);
		medium.setMediaType(this);

		return medium;
	}

	public Medium removeMedium(Medium medium) {
		getMediums().remove(medium);
		medium.setMediaType(null);

		return medium;
	}

}