package de.bitgilde.TIMAAT.model.FIPOP;

import java.io.Serializable;
import jakarta.persistence.*;


import java.util.Date;


/**
 * The persistent class for the membership_detail database table.
 * 
 */
@Entity
@Table(name="membership_details")
@NamedQuery(name="MembershipDetail.findAll", query="SELECT md FROM MembershipDetail md")
public class MembershipDetail implements Serializable {
	private static final long serialVersionUID = 1L;

  @Id
  @GeneratedValue(strategy=GenerationType.IDENTITY)
	private int id;

	@Column(name="joined_at", columnDefinition = "DATE")
	private Date joinedAt;

	@Column(name="left_at", columnDefinition = "DATE")
	private Date leftAt;

	//bi-directional many-to-one association to ActorPersonIsMemberOfActorCollective
	@ManyToOne
	// @JsonBackReference(value = "ActorPersonIsMemberOFActorCollectives-MemberShipDetails")
	@JoinColumns({
		@JoinColumn(name="actor_person_actor_id", referencedColumnName="actor_person_actor_id"),
		@JoinColumn(name="member_of_actor_collective_actor_id", referencedColumnName="member_of_actor_collective_actor_id")
		})
	private ActorPersonIsMemberOfActorCollective actorPersonIsMemberOfActorCollective;

	//bi-directional many-to-one association to Role
	@ManyToOne
	private Role role;

	public MembershipDetail() {
	}

	public int getId() {
		return this.id;
	}

	public void setId(int id) {
		this.id = id;
	}

	public Date getJoinedAt() {
		return this.joinedAt;
	}

	public void setJoinedAt(Date joinedAt) {
		this.joinedAt = joinedAt;
	}

	public Date getLeftAt() {
		return this.leftAt;
	}

	public void setLeftAt(Date leftAt) {
		this.leftAt = leftAt;
	}

	public ActorPersonIsMemberOfActorCollective getActorPersonIsMemberOfActorCollective() {
		return this.actorPersonIsMemberOfActorCollective;
	}

	public void setActorPersonIsMemberOfActorCollective(ActorPersonIsMemberOfActorCollective actorPersonIsMemberOfActorCollective) {
		this.actorPersonIsMemberOfActorCollective = actorPersonIsMemberOfActorCollective;
	}

	public Role getRole() {
		return this.role;
	}

	public void setRole(Role role) {
		this.role = role;
	}

}