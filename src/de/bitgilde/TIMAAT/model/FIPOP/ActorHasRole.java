package de.bitgilde.TIMAAT.model.FIPOP;

import java.io.Serializable;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.NamedQuery;
import jakarta.persistence.Table;


/**
 * The persistent class for the actor_has_role database table.
 *
 */
@Entity
@Table(name="actor_has_role")
@NamedQuery(name="ActorHasRole.findAll", query="SELECT ahr FROM ActorHasRole ahr")
public class ActorHasRole implements Serializable {
	private static final long serialVersionUID = 1L;

	@EmbeddedId
	private ActorHasRolePK id;

	//bi-directional many-to-one association to Actor
	@ManyToOne
	@JoinColumn(name="actor_id")
	@JsonIgnore
	private Actor actor;

	//bi-directional many-to-one association to ROle
	@ManyToOne
	@JoinColumn(name="role_id")
	private Role role;

	//bi-directional many-to-many association to Event
	@ManyToMany(mappedBy="actorHasRoles")
	@JsonIgnore
	private List<Event> events;

	//bi-directional many-to-many association to Medium
	@ManyToMany(mappedBy="actorHasRoles")
	@JsonIgnore
	private List<Medium> mediums;

	//bi-directional many-to-many association to Music
	@ManyToMany(mappedBy="actorHasRoles")
	@JsonIgnore
	private List<Music> musicList;

	public ActorHasRole() {
	}

	public ActorHasRole(Actor actor, Role role) {
		this.actor = actor;
		this.role = role;
		this.id = new ActorHasRolePK(actor.getId(), role.getId());
	}

	public ActorHasRolePK getId() {
		return this.id;
	}

	public void setId(ActorHasRolePK id) {
		this.id = id;
	}

	public List<Event> getEvents() {
		return this.events;
	}

	public void setEvents(List<Event> events) {
		this.events = events;
	}

	public List<Medium> getMediums() {
		return this.mediums;
	}

	public void setMediums(List<Medium> mediums) {
		this.mediums = mediums;
	}

	public List<Music> getMusicList() {
		return this.musicList;
	}

	public void setMusicList(List<Music> musicList) {
		this.musicList = musicList;
	}

}