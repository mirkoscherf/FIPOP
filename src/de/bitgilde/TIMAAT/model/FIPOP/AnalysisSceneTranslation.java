package de.bitgilde.TIMAAT.model.FIPOP;

import java.io.Serializable;
import javax.persistence.*;


/**
 * The persistent class for the analysis_scene_translation database table.
 * 
 */
@Entity
@Table(name="analysis_scene_translation")
@NamedQuery(name="AnalysisSceneTranslation.findAll", query="SELECT a FROM AnalysisSceneTranslation a")
public class AnalysisSceneTranslation implements Serializable {
	private static final long serialVersionUID = 1L;

	@Id
	@GeneratedValue(strategy=GenerationType.IDENTITY)
	private int id;

	private String comment;

	//bi-directional many-to-one association to Language
	@ManyToOne
	private Language language;

	private String name;

	@Column(name="short_description")
	private String shortDescription;

	@Lob
	private String transcript;

	//bi-directional many-to-one association to AnalysisScene
	@ManyToOne
	@JoinColumn(name="analysis_scene_id")
	private AnalysisScene analysisScene;

	public AnalysisSceneTranslation() {
	}

	public int getId() {
		return this.id;
	}

	public void setId(int id) {
		this.id = id;
	}

	public String getComment() {
		return this.comment;
	}

	public void setComment(String comment) {
		this.comment = comment;
	}

	public Language getLanguage() {
		return this.language;
	}

	public void setLanguage(Language language) {
		this.language = language;
	}

	public String getName() {
		return this.name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getShortDescription() {
		return this.shortDescription;
	}

	public void setShortDescription(String shortDescription) {
		this.shortDescription = shortDescription;
	}

	public String getTranscript() {
		return this.transcript;
	}

	public void setTranscript(String transcript) {
		this.transcript = transcript;
	}

	public AnalysisScene getAnalysisScene() {
		return this.analysisScene;
	}

	public void setAnalysisScene(AnalysisScene analysisScene) {
		this.analysisScene = analysisScene;
	}

}