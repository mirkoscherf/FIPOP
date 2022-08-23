package de.bitgilde.TIMAAT.model.FIPOP;

import java.io.Serializable;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.NamedQuery;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrimaryKeyJoinColumn;
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
 * The persistent class for the playback_speed database table.
 *
 * @author Mirko Scherf <mscherf@uni-mainz.de>
 */
@Entity
@Table(name="playback_speed")
@NamedQuery(name="PlaybackSpeed.findAll", query="SELECT ps FROM PlaybackSpeed ps")
public class PlaybackSpeed implements Serializable {
	private static final long serialVersionUID = 1L;

	@Id
	@Column(name="analysis_method_id")
	private int analysisMethodId;

	//bi-directional one-to-one association to AnalysisMethod
	@OneToOne
	@PrimaryKeyJoinColumn(name="analysis_method_id")
	@JsonIgnore // PlaybackSpeed is accessed through AnalysisMethod --> avoid reference cycle
	private AnalysisMethod analysisMethod;

	//bi-directional many-to-one association to PlaybackSpeedTranslation
	@OneToMany(mappedBy="playbackSpeed")
	private List<PlaybackSpeedTranslation> playbackSpeedTranslations;

	public PlaybackSpeed() {
	}

	public int getAnalysisMethodId() {
		return this.analysisMethodId;
	}

	public void setAnalysisMethodId(int analysisMethodId) {
		this.analysisMethodId = analysisMethodId;
	}

	public AnalysisMethod getAnalysisMethod() {
		return this.analysisMethod;
	}

	public void setAnalysisMethod(AnalysisMethod analysisMethod) {
		this.analysisMethod = analysisMethod;
	}

	public List<PlaybackSpeedTranslation> getPlaybackSpeedTranslations() {
		return this.playbackSpeedTranslations;
	}

	public void setPlaybackSpeedTranslations(List<PlaybackSpeedTranslation> playbackSpeedTranslations) {
		this.playbackSpeedTranslations = playbackSpeedTranslations;
	}

	public PlaybackSpeedTranslation addPlaybackSpeedTranslation(PlaybackSpeedTranslation playbackSpeedTranslation) {
		getPlaybackSpeedTranslations().add(playbackSpeedTranslation);
		playbackSpeedTranslation.setPlaybackSpeed(this);

		return playbackSpeedTranslation;
	}

	public PlaybackSpeedTranslation removePlaybackSpeedTranslation(PlaybackSpeedTranslation playbackSpeedTranslation) {
		getPlaybackSpeedTranslations().remove(playbackSpeedTranslation);
		playbackSpeedTranslation.setPlaybackSpeed(null);

		return playbackSpeedTranslation;
	}

}