package de.bitgilde.TIMAAT.model.FIPOP;

import java.io.Serializable;
import java.util.Date;
import java.util.List;
import java.util.Set;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
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
 * The persistent class for the actor_person database table.
 *
 * @author Mirko Scherf <mscherf@uni-mainz.de>
 */
@Entity
@Table(name="actor_person")
@NamedQuery(name="ActorPerson.findAll", query="SELECT ap FROM ActorPerson ap")
public class ActorPerson implements Serializable {
	private static final long serialVersionUID = 1L;

	@Id
	@Column(name="actor_id")
	private int actorId;

	@Column(name="date_of_birth", columnDefinition = "DATE")
	private Date dateOfBirth;

	@Column(name="day_of_death", columnDefinition = "DATE")
	private Date dayOfDeath;

	//bi-directional many-to-one association to LineupMember
	// @OneToMany(mappedBy="actorPerson")
	// private List<LineupMember> lineupMembers;

	private String title;

	private String citizenship;

	@Column(name="place_of_birth")
	private String placeOfBirth;

	@Column(name="place_of_death")
	private String placeOfDeath;

	//bi-directional one-to-one association to Actor
	@OneToOne
	@PrimaryKeyJoinColumn(name="actor_id")
	@JsonIgnore // ActorPerson is accessed through Actor --> avoid reference cycle
	private Actor actor;

	//bi-directional many-to-one association to Location
	@ManyToOne(cascade = CascadeType.PERSIST)
	@JoinColumn(name="place_of_birth_city_location_id")
	private City placeOfBirthCityLocation;

	//bi-directional many-to-one association to Location
	@ManyToOne(cascade = CascadeType.PERSIST)
	@JoinColumn(name="place_of_death_city_location_id")
	private City placeOfDeathCityLocation;

	//bi-directional many-to-one association to Sex
	@ManyToOne(cascade = CascadeType.PERSIST)
	@JoinColumn(name="sex_id")
	private Sex sex;

	//bi-directional many-to-many association to Citizenship
	@ManyToMany
	@JoinTable(
		name="actor_person_has_citizenship"
		, joinColumns={
			@JoinColumn(name="actor_person_actor_id")
			}
		, inverseJoinColumns={
			@JoinColumn(name="citizenship_id")
			}
		)
	private Set<Citizenship> citizenships;

	//bi-directional many-to-one association to ActorPersonIsMemberOfActorCollective
	@OneToMany(mappedBy="actorPerson")
	@JsonManagedReference(value = "ActorPerson-ActorPersonIsMemberOfActorCollectives")
	private List<ActorPersonIsMemberOfActorCollective> actorPersonIsMemberOfActorCollectives;

	//bi-directional many-to-one association to ActorPersonTranslation
	@OneToMany(mappedBy="actorPerson")
	private List<ActorPersonTranslation> actorPersonTranslations;

	public ActorPerson() {
	}

	public int getActorId() {
		return this.actorId;
	}

	public void setActorId(int actorId) {
		this.actorId = actorId;
	}

	public Date getDateOfBirth() {
		return this.dateOfBirth;
	}

	public void setDateOfBirth(Date dateOfBirth) {
		this.dateOfBirth = dateOfBirth;
	}

	public Date getDayOfDeath() {
		return this.dayOfDeath;
	}

	public void setDayOfDeath(Date dayOfDeath) {
		this.dayOfDeath = dayOfDeath;
	}

	// public List<LineupMember> getLineupMembers() {
	// 	return this.lineupMembers;
	// }

	// public void setLineupMembers(List<LineupMember> lineupMembers) {
	// 	this.lineupMembers = lineupMembers;
	// }

	// public LineupMember addLineupMember(LineupMember lineupMember) {
	// 	getLineupMembers().add(lineupMember);
	// 	lineupMember.setActorPerson(this);

	// 	return lineupMember;
	// }

	// public LineupMember removeLineupMember(LineupMember lineupMember) {
	// 	getLineupMembers().remove(lineupMember);
	// 	lineupMember.setActorPerson(null);

	// 	return lineupMember;
	// }

	public String getTitle() {
		return this.title;
	}

	public void setTitle(String title) {
		this.title = title;
	}

	public String getCitizenship() {
		return this.citizenship;
	}

	public void setCitizenship(String citizenship) {
		this.citizenship = citizenship;
	}

	public String getPlaceOfBirth() {
		return this.placeOfBirth;
	}

	public void setPlaceOfBirth(String placeOfBirth) {
		this.placeOfBirth = placeOfBirth;
	}

	public String getPlaceOfDeath() {
		return this.placeOfDeath;
	}

	public void setPlaceOfDeath(String placeOfDeath) {
		this.placeOfDeath = placeOfDeath;
	}

	public Actor getActor() {
		return this.actor;
	}

	public void setActor(Actor actor) {
		this.actor = actor;
	}

	// TODO currently replaced by string inputs until location data structure is implemented
	// public City getPlaceOfBirth() {
	// 	return this.placeOfBirthCityLocation;
	// }

	// public void setPlaceOfBirth(City placeOfBirthCityLocation) {
	// 	this.placeOfBirthCityLocation = placeOfBirthCityLocation;
	// }

	// public City getPlaceOfDeath() {
	// 	return this.placeOfDeathCityLocation;
	// }

	// public void setPlaceOfDeath(City placeOfDeathCityLocation) {
	// 	this.placeOfDeathCityLocation = placeOfDeathCityLocation;
	// }

	public Sex getSex() {
		return this.sex;
	}

	public void setSex(Sex sex) {
		this.sex = sex;
	}

	// TODO currently replaced by string input until location and citizenship data structure is implemented
	// public Set<Citizenship> getCitizenships() {
	// 	return this.citizenships;
	// }

	// public void setCitizenships(Set<Citizenship> citizenships) {
	// 	this.citizenships = citizenships;
	// }

	public List<ActorPersonIsMemberOfActorCollective> getActorPersonIsMemberOfActorCollectives() {
		return this.actorPersonIsMemberOfActorCollectives;
	}

	public void setActorPersonIsMemberOfActorCollectives(List<ActorPersonIsMemberOfActorCollective> actorPersonIsMemberOfActorCollectives) {
		this.actorPersonIsMemberOfActorCollectives = actorPersonIsMemberOfActorCollectives;
	}

	public ActorPersonIsMemberOfActorCollective addActorPersonIsMemberOfActorCollective(ActorPersonIsMemberOfActorCollective actorPersonIsMemberOfActorCollective) {
		getActorPersonIsMemberOfActorCollectives().add(actorPersonIsMemberOfActorCollective);
		actorPersonIsMemberOfActorCollective.setActorPerson(this);

		return actorPersonIsMemberOfActorCollective;
	}

	public ActorPersonIsMemberOfActorCollective removeActorPersonIsMemberOfActorCollective(ActorPersonIsMemberOfActorCollective actorPersonIsMemberOfActorCollective) {
		getActorPersonIsMemberOfActorCollectives().remove(actorPersonIsMemberOfActorCollective);
		actorPersonIsMemberOfActorCollective.setActorPerson(null);

		return actorPersonIsMemberOfActorCollective;
	}

	// public void addCollectives(List<ActorCollective> actorCollectives) {

	// }

	// public void addCollective(ActorCollective actorCollective) {
	// 	ActorPersonIsMemberOfActorCollective actorPersonIsMemberOfActorCollective = new ActorPersonIsMemberOfActorCollective(this, actorCollective);
	// }

	public List<ActorPersonTranslation> getActorPersonTranslations() {
		return this.actorPersonTranslations;
	}

	public void setActorPersonTranslations(List<ActorPersonTranslation> actorPersonTranslations) {
		this.actorPersonTranslations = actorPersonTranslations;
	}

	public ActorPersonTranslation addActorPersonTranslation(ActorPersonTranslation actorPersonTranslation) {
		getActorPersonTranslations().add(actorPersonTranslation);
		actorPersonTranslation.setActorPerson(this);

		return actorPersonTranslation;
	}

	public ActorPersonTranslation removeActorPersonTranslation(ActorPersonTranslation actorPersonTranslation) {
		getActorPersonTranslations().remove(actorPersonTranslation);
		actorPersonTranslation.setActorPerson(null);

		return actorPersonTranslation;
	}

}