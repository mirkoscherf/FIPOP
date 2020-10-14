package de.bitgilde.TIMAAT.model.FIPOP;

import java.io.Serializable;
import javax.persistence.*;

import com.fasterxml.jackson.annotation.JsonIgnore;

import java.util.List;


/**
 * The persistent class for the change_in_dynamics database table.
 * 
 */
@Entity
@Table(name="change_in_dynamics")
@NamedQuery(name="ChangeInDynamics.findAll", query="SELECT c FROM ChangeInDynamics c")
public class ChangeInDynamics implements Serializable {
	private static final long serialVersionUID = 1L;

	@Id
	@GeneratedValue(strategy=GenerationType.IDENTITY)
	private int id;

	//bi-directional many-to-one association to AnalysisMusic
	@OneToMany(mappedBy="changeInDynamics")
	@JsonIgnore
	private List<AnalysisMusic> analysisMusics;

	//bi-directional many-to-one association to ChangeInDynamicsTranslation
	@OneToMany(mappedBy="changeInDynamics")
	private List<ChangeInDynamicsTranslation> changeInDynamicsTranslations;

	public ChangeInDynamics() {
	}

	public int getId() {
		return this.id;
	}

	public void setId(int id) {
		this.id = id;
	}

	public List<AnalysisMusic> getAnalysisMusics() {
		return this.analysisMusics;
	}

	public void setAnalysisMusics(List<AnalysisMusic> analysisMusics) {
		this.analysisMusics = analysisMusics;
	}

	public AnalysisMusic addAnalysisMusic(AnalysisMusic analysisMusic) {
		getAnalysisMusics().add(analysisMusic);
		analysisMusic.setChangeInDynamics(this);

		return analysisMusic;
	}

	public AnalysisMusic removeAnalysisMusic(AnalysisMusic analysisMusic) {
		getAnalysisMusics().remove(analysisMusic);
		analysisMusic.setChangeInDynamics(null);

		return analysisMusic;
	}

	public List<ChangeInDynamicsTranslation> getChangeInDynamicsTranslations() {
		return this.changeInDynamicsTranslations;
	}

	public void setChangeInDynamicsTranslations(List<ChangeInDynamicsTranslation> changeInDynamicsTranslations) {
		this.changeInDynamicsTranslations = changeInDynamicsTranslations;
	}

	public ChangeInDynamicsTranslation addChangeInDynamicsTranslation(ChangeInDynamicsTranslation changeInDynamicsTranslation) {
		getChangeInDynamicsTranslations().add(changeInDynamicsTranslation);
		changeInDynamicsTranslation.setChangeInDynamics(this);

		return changeInDynamicsTranslation;
	}

	public ChangeInDynamicsTranslation removeChangeInDynamicsTranslation(ChangeInDynamicsTranslation changeInDynamicsTranslation) {
		getChangeInDynamicsTranslations().remove(changeInDynamicsTranslation);
		changeInDynamicsTranslation.setChangeInDynamics(null);

		return changeInDynamicsTranslation;
	}

}