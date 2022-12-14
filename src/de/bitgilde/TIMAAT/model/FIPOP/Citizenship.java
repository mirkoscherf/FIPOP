package de.bitgilde.TIMAAT.model.FIPOP;

import java.io.Serializable;
import java.util.List;
import java.util.Set;

import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToMany;
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
 * The persistent class for the citizenship database table.
 *
 * @author Jens-Martin Loebel <loebel@bitgilde.de>
 * @author Mirko Scherf <mscherf@uni-mainz.de>
 */
@Entity
@NamedQuery(name="Citizenship.findAll", query="SELECT c FROM Citizenship c")
@JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator.class,
									property  = "id",
									scope     = Citizenship.class)
public class Citizenship implements Serializable {
	private static final long serialVersionUID = 1L;

	@Id
	@GeneratedValue(strategy=GenerationType.IDENTITY)
	private int id;

	//bi-directional many-to-one association to CitizenshipTranslation
	@OneToMany(mappedBy="citizenship", cascade = CascadeType.PERSIST)
	private List<CitizenshipTranslation> citizenshipTranslations;

	//bi-directional many-to-many association to Country
	@ManyToMany(mappedBy="citizenships")
	@JsonIgnore
	private List<Country> countries;

	//bi-directional many-to-many association to ActorPerson
	@ManyToMany(mappedBy="citizenships")
	@JsonIgnore
	private Set<ActorPerson> actorPersons;

	// tables cannot contain identifier id alone, or a query exception is thrown
	@Column(columnDefinition = "BOOLEAN")
	private Boolean dummy;

	public Citizenship() {
	}

	public int getId() {
		return this.id;
	}

	public void setId(int id) {
		this.id = id;
	}

	public List<CitizenshipTranslation> getCitizenshipTranslations() {
		return this.citizenshipTranslations;
	}

	public void setCitizenshipTranslations(List<CitizenshipTranslation> citizenshipTranslations) {
		this.citizenshipTranslations = citizenshipTranslations;
	}

	public CitizenshipTranslation addCitizenshipTranslation(CitizenshipTranslation citizenshipTranslation) {
		getCitizenshipTranslations().add(citizenshipTranslation);
		citizenshipTranslation.setCitizenship(this);

		return citizenshipTranslation;
	}

	public CitizenshipTranslation removeCitizenshipTranslation(CitizenshipTranslation citizenshipTranslation) {
		getCitizenshipTranslations().remove(citizenshipTranslation);
		citizenshipTranslation.setCitizenship(null);

		return citizenshipTranslation;
	}

	public List<Country> getCountries() {
		return this.countries;
	}

	public void setCountries(List<Country> countries) {
		this.countries = countries;
	}

	public Set<ActorPerson> getPersons() {
		return this.actorPersons;
	}

	public void setPersons(Set<ActorPerson> actorPersons) {
		this.actorPersons = actorPersons;
	}

}