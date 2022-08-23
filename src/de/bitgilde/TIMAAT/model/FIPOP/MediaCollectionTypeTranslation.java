package de.bitgilde.TIMAAT.model.FIPOP;

import java.io.Serializable;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.NamedQuery;
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
 * The persistent class for the media_collection_type_translation database table.
 *
 * @author Jens-Martin Loebel <loebel@bitgilde.de>
 * @author Mirko Scherf <mscherf@uni-mainz.de>
 */
@Entity
@Table(name="media_collection_type_translation")
@NamedQuery(name="MediaCollectionTypeTranslation.findAll", query="SELECT mctt FROM MediaCollectionTypeTranslation mctt")
public class MediaCollectionTypeTranslation implements Serializable {
	private static final long serialVersionUID = 1L;

	@Id
	private int id;

	//bi-directional many-to-one association to Language
	@ManyToOne
	private Language language;

	private String type;

	//bi-directional many-to-one association to MediaCollectionType
	@ManyToOne
	@JoinColumn(name="media_collection_type_id", nullable=false)
	@JsonIgnore
	private MediaCollectionType mediaCollectionType;

	public MediaCollectionTypeTranslation() {
	}

	public int getId() {
		return this.id;
	}

	public void setId(int id) {
		this.id = id;
	}

	public Language getLanguage() {
		return this.language;
	}

	public void setLanguage(Language language) {
		this.language = language;
	}

	public String getType() {
		return this.type;
	}

	public void setType(String type) {
		this.type = type;
	}

	public MediaCollectionType getMediaCollectionType() {
		return this.mediaCollectionType;
	}

	public void setMediaCollectionType(MediaCollectionType mediaCollectionType) {
		this.mediaCollectionType = mediaCollectionType;
	}

}