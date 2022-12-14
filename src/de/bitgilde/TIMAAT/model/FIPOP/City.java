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
 * The persistent class for the city database table.
 *
 * @author Mirko Scherf <mscherf@uni-mainz.de>
 */
@Entity
@Table(name="city")
@NamedQuery(name="City.findAll", query="SELECT c FROM City c")
public class City implements Serializable {
	private static final long serialVersionUID = 1L;

	@Id
	@Column(name="location_id")
	private int locationId;

	//bi-directional one-to-one association to Location
	@OneToOne
	@PrimaryKeyJoinColumn(name="location_id")
	@JsonIgnore // City is accessed through Location
	private Location location;

	//bi-directional many-to-one association to ActorPerson
	@OneToMany(mappedBy="placeOfBirthCityLocation")
	// @JsonManagedReference(value = "City-ActorPerson1")
	@JsonIgnore
	private List<ActorPerson> actorPersons1;

	//bi-directional many-to-one association to ActorPerson
	@OneToMany(mappedBy="placeOfDeathCityLocation")
	// @JsonManagedReference(value = "City-ActorPerson2")
	@JsonIgnore
	private List<ActorPerson> actorPersons2;

	public City() {
	}

	public int getLocationId() {
		return this.locationId;
	}

	public void setLocationId(int locationId) {
		this.locationId = locationId;
	}

	public Location getLocation() {
		return this.location;
	}

	public void setLocation(Location location) {
		this.location = location;
	}

	public List<ActorPerson> getActorPersons1() {
		return this.actorPersons1;
	}

	public void setActorPersons1(List<ActorPerson> actorPersons1) {
		this.actorPersons1 = actorPersons1;
	}

	public ActorPerson addActorPersons1(ActorPerson actorPersons1) {
		getActorPersons1().add(actorPersons1);
		// actorPersons1.setPlaceOfBirth(this); // TODO reactivate once placeOfBirth is not a string value anymore

		return actorPersons1;
	}

	public ActorPerson removeActorPersons1(ActorPerson actorPersons1) {
		getActorPersons1().remove(actorPersons1);
		// actorPersons1.setPlaceOfBirth(null); // TODO reactivate once placeOfBirth is not a string value anymore

		return actorPersons1;
	}

	public List<ActorPerson> getActorPersons2() {
		return this.actorPersons2;
	}

	public void setActorPersons2(List<ActorPerson> actorPersons2) {
		this.actorPersons2 = actorPersons2;
	}

	public ActorPerson addActorPersons2(ActorPerson actorPersons2) {
		getActorPersons2().add(actorPersons2);
		// actorPersons2.setPlaceOfDeath(this); // TODO reactivate once placeOfDeath is not a string value anymore

		return actorPersons2;
	}

	public ActorPerson removeActorPersons2(ActorPerson actorPersons2) {
		getActorPersons2().remove(actorPersons2);
		// actorPersons2.setPlaceOfDeath(null); // TODO reactivate once placeOfDeath is not a string value anymore

		return actorPersons2;
	}

}