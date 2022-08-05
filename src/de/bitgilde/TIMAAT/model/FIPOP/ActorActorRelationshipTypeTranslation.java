package de.bitgilde.TIMAAT.model.FIPOP;

import java.io.Serializable;

import com.fasterxml.jackson.annotation.JsonBackReference;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.NamedQuery;
import jakarta.persistence.Table;

/**
 * The persistent class for the actor_actor_relationship_type_translation database table.
 *
 * @author Jens-Martin Loebel <loebel@bitgilde.de>
 * @author Mirko Scherf <mscherf@uni-mainz.de>
 */
@Entity
@Table(name="actor_actor_relationship_type_translation")
@NamedQuery(name="ActorActorRelationshipTypeTranslation.findAll", query="SELECT aartt FROM ActorActorRelationshipTypeTranslation aartt")
public class ActorActorRelationshipTypeTranslation implements Serializable {
	private static final long serialVersionUID = 1L;

	@Id
	private int id;

	private String type;

	//bi-directional many-to-one association to ActorActorRelationshipType
	@ManyToOne
	@JoinColumn(name="actor_actor_relationship_type_id")
	@JsonBackReference(value = "ActorActorRelationshipType-ActorActorRelationshipTypeTranslation")
	private ActorActorRelationshipType actorActorRelationshipType;

	//bi-directional many-to-one association to Language
	@ManyToOne
	private Language language;

	public ActorActorRelationshipTypeTranslation() {
	}

	public int getId() {
		return this.id;
	}

	public void setId(int id) {
		this.id = id;
	}

	public String getType() {
		return this.type;
	}

	public void setType(String type) {
		this.type = type;
	}

	public ActorActorRelationshipType getActorActorRelationshipType() {
		return this.actorActorRelationshipType;
	}

	public void setActorActorRelationshipType(ActorActorRelationshipType actorActorRelationshipType) {
		this.actorActorRelationshipType = actorActorRelationshipType;
	}

	public Language getLanguage() {
		return this.language;
	}

	public void setLanguage(Language language) {
		this.language = language;
	}

}