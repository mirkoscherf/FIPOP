package de.bitgilde.TIMAAT.model.FIPOP;

import java.io.Serializable;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
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
 * The persistent class for the media_collection_analysis_list_translation database table.
 *
 * @author Jens-Martin Loebel <loebel@bitgilde.de>
 * @author Mirko Scherf <mscherf@uni-mainz.de>
 */
@Entity
@Table(name="media_collection_analysis_list_translation")
@NamedQuery(name="MediaCollectionAnalysisListTranslation.findAll", query="SELECT m FROM MediaCollectionAnalysisListTranslation m")
public class MediaCollectionAnalysisListTranslation implements Serializable {
	private static final long serialVersionUID = 1L;

	@Id
	@GeneratedValue(strategy=GenerationType.IDENTITY)
	@Column(unique=true, nullable=false)
	private int id;

	// @Column(name="language_id", nullable=false)
	// private int languageId;

	@Column(length=4096)
	private String text;

	@Column(nullable=false, length=255)
	private String title;

	//bi-directional many-to-one association to Language
	@ManyToOne
	private Language language;

	//bi-directional many-to-one association to MediaCollectionAnalysisList
	@ManyToOne
	@JoinColumn(name="media_collection_analysis_list_id", nullable=false)
	@JsonIgnore
	private MediaCollectionAnalysisList mediaCollectionAnalysisList;

	public MediaCollectionAnalysisListTranslation() {
	}

	public int getId() {
		return this.id;
	}

	public void setId(int id) {
		this.id = id;
	}

	// public int getLanguageId() {
	// 	return this.languageId;
	// }

	// public void setLanguageId(int languageId) {
	// 	this.languageId = languageId;
	// }

	public String getText() {
		return this.text;
	}

	public void setText(String text) {
		this.text = text;
	}

	public String getTitle() {
		return this.title;
	}

	public void setTitle(String title) {
		this.title = title;
	}

	public Language getLanguage() {
		return this.language;
	}

	public void setLanguage(Language language) {
		this.language = language;
	}

	public MediaCollectionAnalysisList getMediaCollectionAnalysisList() {
		return this.mediaCollectionAnalysisList;
	}

	public void setMediaCollectionAnalysisList(MediaCollectionAnalysisList mediaCollectionAnalysisList) {
		this.mediaCollectionAnalysisList = mediaCollectionAnalysisList;
	}

}