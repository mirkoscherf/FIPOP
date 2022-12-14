package de.bitgilde.TIMAAT.model.FIPOP;

import java.io.Serializable;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.NamedQuery;
import jakarta.persistence.OneToMany;

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
 * The persistent class for the title database table.
 *
 * @author Jens-Martin Loebel <loebel@bitgilde.de>
 * @author Mirko Scherf <mscherf@uni-mainz.de>
 */
@Entity
@NamedQuery(name="Title.findAll", query="SELECT t FROM Title t")
public class Title implements Serializable {
	private static final long serialVersionUID = 1L;

	@Id
	@GeneratedValue(strategy=GenerationType.IDENTITY)
	private int id;

	private String name;

	//bi-directional many-to-one association to Medium
	@OneToMany(mappedBy="displayTitle")
	@JsonIgnore
	private List<Medium> mediums1;

	//bi-directional many-to-one association to Medium
	@OneToMany(mappedBy="originalTitle")
	@JsonIgnore
	private List<Medium> mediums2;


	//bi-directional many-to-one association to Language
	@ManyToOne(cascade = CascadeType.PERSIST)
	private Language language;

	//bi-directional many-to-many association to Medium
	@ManyToMany
	@JsonIgnore
	@JoinTable(
		name="medium_has_title"
		, joinColumns={
			@JoinColumn(name="title_id")
			}
		, inverseJoinColumns={
			@JoinColumn(name="medium_id")
			}
		)
	private List<Medium> mediums3;

	//bi-directional many-to-many association to Music
	@ManyToMany
	@JsonIgnore
	@JoinTable(
		name="music_has_title"
		, joinColumns={
			@JoinColumn(name="title_id")
			}
		, inverseJoinColumns={
			@JoinColumn(name="music_id")
			}
		)
	private List<Music> musicList;

	public Title() {
	}

	public int getId() {
		return this.id;
	}

	public void setId(int id) {
		this.id = id;
	}

	public String getName() {
		return this.name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public List<Medium> getMediums1() {
		return this.mediums1;
	}

	public void setMediums1(List<Medium> mediums1) {
		this.mediums1 = mediums1;
	}

	public Medium addMediums1(Medium mediums1) {
		getMediums1().add(mediums1);
		mediums1.setDisplayTitle(this);

		return mediums1;
	}

	public Medium removeMediums1(Medium mediums1) {
		getMediums1().remove(mediums1);
		mediums1.setDisplayTitle(null);

		return mediums1;
	}

	public List<Medium> getMediums2() {
		return this.mediums2;
	}

	public void setMediums2(List<Medium> mediums2) {
		this.mediums2 = mediums2;
	}

	public Medium addMediums2(Medium mediums2) {
		getMediums2().add(mediums2);
		mediums2.setOriginalTitle(this);

		return mediums2;
	}

	public Medium removeMediums2(Medium mediums2) {
		getMediums2().remove(mediums2);
		mediums2.setOriginalTitle(null);

		return mediums2;
	}

	public Language getLanguage() {
		return this.language;
	}

	public void setLanguage(Language language) {
		this.language = language;
	}

	public List<Medium> getMediums3() {
		return this.mediums3;
	}

	public void setMediums3(List<Medium> mediums3) {
		this.mediums3 = mediums3;
	}

	public List<Music> getMusicList() {
		return this.musicList;
	}

	public void setMusicList(List<Music> musicList) {
		this.musicList = musicList;
	}

}