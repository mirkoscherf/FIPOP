package de.bitgilde.TIMAAT.model.FIPOP;

import java.io.Serializable;

import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.NamedQuery;
import jakarta.persistence.Table;


/**
 * The persistent class for the media_collection_analysis_list_has_tag database table.
 *
 * @author Jens-Martin Loebel <loebel@bitgilde.de>
 * @author Mirko Scherf <mscherf@uni-mainz.de>
 */
@Entity
@Table(name="media_collection_analysis_list_has_tag")
@NamedQuery(name="MediaCollectionAnalysisListHasTag.findAll", query="SELECT m FROM MediaCollectionAnalysisListHasTag m")
public class MediaCollectionAnalysisListHasTag implements Serializable {
	private static final long serialVersionUID = 1L;

	@EmbeddedId
	private MediaCollectionAnalysisListHasTagPK id;

	@Column(name="tag_id", nullable=false)
	private int tagId;

	//bi-directional many-to-one association to MediaCollectionAnalysisList
	@ManyToOne
	@JoinColumn(name="media_collection_analysis_list_id")
	private MediaCollectionAnalysisList mediaCollectionAnalysisList;

	public MediaCollectionAnalysisListHasTag() {
	}

	public MediaCollectionAnalysisListHasTagPK getId() {
		return this.id;
	}

	public void setId(MediaCollectionAnalysisListHasTagPK id) {
		this.id = id;
	}

	public int getTagId() {
		return this.tagId;
	}

	public void setTagId(int tagId) {
		this.tagId = tagId;
	}

	public MediaCollectionAnalysisList getMediaCollectionAnalysisList() {
		return this.mediaCollectionAnalysisList;
	}

	public void setMediaCollectionAnalysisList(MediaCollectionAnalysisList mediaCollectionAnalysisList) {
		this.mediaCollectionAnalysisList = mediaCollectionAnalysisList;
	}

}