package de.bitgilde.TIMAAT.model.FIPOP;

import java.io.Serializable;
import javax.persistence.*;
import java.util.List;


/**
 * The persistent class for the actor_type database table.
 * 
 */
@Entity
@Table(name="actor_type")
@NamedQuery(name="ActorType.findAll", query="SELECT a FROM ActorType a")
public class ActorType implements Serializable {
	private static final long serialVersionUID = 1L;

	@Id
	private int id;

	//bi-directional many-to-many association to Actor
	@ManyToMany
	@JoinTable(
		name="actor_has_actor_type"
		, joinColumns={
			@JoinColumn(name="actor_type_id")
			}
		, inverseJoinColumns={
			@JoinColumn(name="actor_id")
			}
		)
	private List<Actor> actors;

	//bi-directional many-to-one association to ActorTypeTranslation
	@OneToMany(mappedBy="actorType")
	private List<ActorTypeTranslation> actorTypeTranslations;

	public ActorType() {
	}

	public int getId() {
		return this.id;
	}

	public void setId(int id) {
		this.id = id;
	}

	public List<Actor> getActors() {
		return this.actors;
	}

	public void setActors(List<Actor> actors) {
		this.actors = actors;
	}

	public List<ActorTypeTranslation> getActorTypeTranslations() {
		return this.actorTypeTranslations;
	}

	public void setActorTypeTranslations(List<ActorTypeTranslation> actorTypeTranslations) {
		this.actorTypeTranslations = actorTypeTranslations;
	}

	public ActorTypeTranslation addActorTypeTranslation(ActorTypeTranslation actorTypeTranslation) {
		getActorTypeTranslations().add(actorTypeTranslation);
		actorTypeTranslation.setActorType(this);

		return actorTypeTranslation;
	}

	public ActorTypeTranslation removeActorTypeTranslation(ActorTypeTranslation actorTypeTranslation) {
		getActorTypeTranslations().remove(actorTypeTranslation);
		actorTypeTranslation.setActorType(null);

		return actorTypeTranslation;
	}

}