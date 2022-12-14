package de.bitgilde.TIMAAT.model.FIPOP;

import java.io.Serializable;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.NamedQuery;
import jakarta.persistence.OneToOne;
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
 * The persistent class for the episode_information database table.
 *
 * @author Jens-Martin Loebel <loebel@bitgilde.de>
 * @author Mirko Scherf <mscherf@uni-mainz.de>
 */
@Entity
@Table(name="episode_information")
@NamedQuery(name="EpisodeInformation.findAll", query="SELECT e FROM EpisodeInformation e")
public class EpisodeInformation implements Serializable {
	private static final long serialVersionUID = 1L;

	@Id
	private int id;

	@Column(name="episode_number")
	private int episodeNumber;

	@Column(name="season_number")
	private byte seasonNumber;

	//bi-directional one-to-one association to MediumVideo
	@OneToOne
	@JoinColumn(name="medium_video_medium_id")
	private MediumVideo mediumVideo;

	//bi-directional one-to-one association to MediumVideogame
	// @OneToOne
	// @JoinColumn(name="medium_videogame_medium_software_medium_id")
	// private MediumVideogame mediumVideogame;

	public EpisodeInformation() {
	}

	public int getId() {
		return this.id;
	}

	public void setId(int id) {
		this.id = id;
	}

	public int getEpisodeNumber() {
		return this.episodeNumber;
	}

	public void setEpisodeNumber(int episodeNumber) {
		this.episodeNumber = episodeNumber;
	}

	public byte getSeasonNumber() {
		return this.seasonNumber;
	}

	public void setSeasonNumber(byte seasonNumber) {
		this.seasonNumber = seasonNumber;
	}

	public MediumVideo getMediumVideo() {
		return this.mediumVideo;
	}

	public void setMediumVideo(MediumVideo mediumVideo) {
		this.mediumVideo = mediumVideo;
	}

	// public MediumVideogame getMediumVideogame() {
	// 	return this.mediumVideogame;
	// }

	// public void setMediumVideogame(MediumVideogame mediumVideogame) {
	// 	this.mediumVideogame = mediumVideogame;
	// }
}