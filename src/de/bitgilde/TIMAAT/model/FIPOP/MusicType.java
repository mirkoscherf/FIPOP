package de.bitgilde.TIMAAT.model.FIPOP;

import java.io.Serializable;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

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
 * The persistent class for the music_type database table.
 *
 * @author Mirko Scherf <mscherf@uni-mainz.de>
 */
@Entity
@Table(name="music_type")
@NamedQuery(name="MusicType.findAll", query="SELECT m FROM MusicType m")
public class MusicType implements Serializable {
	private static final long serialVersionUID = 1L;

	@Id
	@GeneratedValue(strategy=GenerationType.IDENTITY)
	private int id;

	//bi-directional many-to-one association to Music
	@OneToMany(mappedBy="musicType")
	@JsonIgnore
	private List<Music> musicList;

	//bi-directional many-to-one association to MusicTypeTranslation
	@OneToMany(mappedBy="musicType")
	private List<MusicTypeTranslation> musicTypeTranslations;

	public MusicType() {
	}

	public int getId() {
		return this.id;
	}

	public void setId(int id) {
		this.id = id;
	}

	public List<Music> getMusicList() {
		return this.musicList;
	}

	public void setMusicList(List<Music> musicList) {
		this.musicList = musicList;
	}

	public Music addMusic(Music music) {
		getMusicList().add(music);
		music.setMusicType(this);

		return music;
	}

	public Music removeMusic(Music music) {
		getMusicList().remove(music);
		music.setMusicType(null);

		return music;
	}

	public List<MusicTypeTranslation> getMusicTypeTranslations() {
		return this.musicTypeTranslations;
	}

	public void setMusicTypeTranslations(List<MusicTypeTranslation> musicTypeTranslations) {
		this.musicTypeTranslations = musicTypeTranslations;
	}

	public MusicTypeTranslation addMusicTypeTranslation(MusicTypeTranslation musicTypeTranslation) {
		getMusicTypeTranslations().add(musicTypeTranslation);
		musicTypeTranslation.setMusicType(this);

		return musicTypeTranslation;
	}

	public MusicTypeTranslation removeMusicTypeTranslation(MusicTypeTranslation musicTypeTranslation) {
		getMusicTypeTranslations().remove(musicTypeTranslation);
		musicTypeTranslation.setMusicType(null);

		return musicTypeTranslation;
	}

}