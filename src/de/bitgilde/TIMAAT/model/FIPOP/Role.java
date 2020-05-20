package de.bitgilde.TIMAAT.model.FIPOP;

import java.io.Serializable;
import javax.persistence.*;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;

import java.util.List;
import java.util.Set;


/**
 * The persistent class for the role database table.
 * 
 */
@Entity
@NamedQuery(name="Role.findAll", query="SELECT r FROM Role r")
public class Role implements Serializable {
	private static final long serialVersionUID = 1L;

	@Id
	@GeneratedValue(strategy=GenerationType.IDENTITY)
	private int id;

	//bi-directional many-to-many association to Actor
	@ManyToMany
	@JsonIgnore
	@JoinTable(
		name="actor_has_role"
		, joinColumns={
			@JoinColumn(name="role_id")
			}
		, inverseJoinColumns={
			@JoinColumn(name="actor_id")
			}
		)
	private Set<Actor> actors;

	//bi-directional many-to-many association to RoleGroup
	@ManyToMany(mappedBy="roles")
	@JsonIgnore
	// @JsonIgnoreProperties(value="roles", allowGetters = true, allowSetters = true)
	private List<RoleGroup> roleGroups;

	//bi-directional many-to-one association to RoleTranslation
	@OneToMany(mappedBy="role", cascade=CascadeType.PERSIST)
	@JsonManagedReference(value="Role-RoleTranslation")
	private List<RoleTranslation> roleTranslations;

	//bi-directional many-to-one association to MembershipDetail
	@OneToMany(mappedBy="role")
	@JsonIgnore
	private List<MembershipDetail> membershipDetails;

	//bi-directional many-to-one association to SiocContainerHasRoleInArea
	// @OneToMany(mappedBy="role")
	// private List<SiocContainerHasRoleInArea> siocContainerHasRoleInAreas;

	//bi-directional many-to-one association to SiocContainerHasSiocUserAccount
	// @OneToMany(mappedBy="role")
	// private List<SiocContainerHasSiocUserAccount> siocContainerHasSiocUserAccounts;

	//bi-directional many-to-one association to SiocSiteHasSiocUserAccount
	// @OneToMany(mappedBy="role")
	// private List<SiocSiteHasSiocUserAccount> siocSiteHasSiocUserAccounts;

	// tables cannot contain identifier id alone, or a query exception is thrown
	@Column(columnDefinition = "BOOLEAN")
	private Boolean dummy;

	public Role() {
	}

	public int getId() {
		return this.id;
	}

	public void setId(int id) {
		this.id = id;
	}

	public Set<Actor> getActors() {
		return this.actors;
	}

	public void setActors(Set<Actor> actors) {
		this.actors = actors;
	}

	public List<RoleGroup> getRoleGroups() {
		return this.roleGroups;
	}

	public void setRoleGroups(List<RoleGroup> roleGroups) {
		this.roleGroups = roleGroups;
	}

		public RoleGroup addRoleGroup(RoleGroup roleGroup) {
		getRoleGroups().add(roleGroup);
		// roleGroup.addRole(this);

		return roleGroup;
	}

	public RoleGroup removeRoleGroup(RoleGroup roleGroup) {
		getRoleGroups().remove(roleGroup);
		// roleGroup.removeRole(this);

		return roleGroup;
	}

	public List<RoleTranslation> getRoleTranslations() {
		return this.roleTranslations;
	}

	public void setRoleTranslations(List<RoleTranslation> roleTranslations) {
		this.roleTranslations = roleTranslations;
	}

	public RoleTranslation addRoleTranslation(RoleTranslation roleTranslation) {
		getRoleTranslations().add(roleTranslation);
		roleTranslation.setRole(this);

		return roleTranslation;
	}

	public RoleTranslation removeRoleTranslation(RoleTranslation roleTranslation) {
		getRoleTranslations().remove(roleTranslation);
		roleTranslation.setRole(null);

		return roleTranslation;
	}

	public List<MembershipDetail> getMembershipDetails() {
		return this.membershipDetails;
	}

	public void setMembershipDetails(List<MembershipDetail> membershipDetails) {
		this.membershipDetails = membershipDetails;
	}

	public MembershipDetail addMembershipDetail(MembershipDetail membershipDetail) {
		getMembershipDetails().add(membershipDetail);
		membershipDetail.setRole(this);

		return membershipDetail;
	}

	public MembershipDetail removeMembershipDetail(MembershipDetail membershipDetail) {
		getMembershipDetails().remove(membershipDetail);
		membershipDetail.setRole(null);

		return membershipDetail;
	}

	// public List<SiocContainerHasRoleInArea> getSiocContainerHasRoleInAreas() {
	// 	return this.siocContainerHasRoleInAreas;
	// }

	// public void setSiocContainerHasRoleInAreas(List<SiocContainerHasRoleInArea> siocContainerHasRoleInAreas) {
	// 	this.siocContainerHasRoleInAreas = siocContainerHasRoleInAreas;
	// }

	// public SiocContainerHasRoleInArea addSiocContainerHasRoleInArea(SiocContainerHasRoleInArea siocContainerHasRoleInArea) {
	// 	getSiocContainerHasRoleInAreas().add(siocContainerHasRoleInArea);
	// 	siocContainerHasRoleInArea.setRole(this);

	// 	return siocContainerHasRoleInArea;
	// }

	// public SiocContainerHasRoleInArea removeSiocContainerHasRoleInArea(SiocContainerHasRoleInArea siocContainerHasRoleInArea) {
	// 	getSiocContainerHasRoleInAreas().remove(siocContainerHasRoleInArea);
	// 	siocContainerHasRoleInArea.setRole(null);

	// 	return siocContainerHasRoleInArea;
	// }

	// public List<SiocContainerHasSiocUserAccount> getSiocContainerHasSiocUserAccounts() {
	// 	return this.siocContainerHasSiocUserAccounts;
	// }

	// public void setSiocContainerHasSiocUserAccounts(List<SiocContainerHasSiocUserAccount> siocContainerHasSiocUserAccounts) {
	// 	this.siocContainerHasSiocUserAccounts = siocContainerHasSiocUserAccounts;
	// }

	// public SiocContainerHasSiocUserAccount addSiocContainerHasSiocUserAccount(SiocContainerHasSiocUserAccount siocContainerHasSiocUserAccount) {
	// 	getSiocContainerHasSiocUserAccounts().add(siocContainerHasSiocUserAccount);
	// 	siocContainerHasSiocUserAccount.setRole(this);

	// 	return siocContainerHasSiocUserAccount;
	// }

	// public SiocContainerHasSiocUserAccount removeSiocContainerHasSiocUserAccount(SiocContainerHasSiocUserAccount siocContainerHasSiocUserAccount) {
	// 	getSiocContainerHasSiocUserAccounts().remove(siocContainerHasSiocUserAccount);
	// 	siocContainerHasSiocUserAccount.setRole(null);

	// 	return siocContainerHasSiocUserAccount;
	// }

	// public List<SiocSiteHasSiocUserAccount> getSiocSiteHasSiocUserAccounts() {
	// 	return this.siocSiteHasSiocUserAccounts;
	// }

	// public void setSiocSiteHasSiocUserAccounts(List<SiocSiteHasSiocUserAccount> siocSiteHasSiocUserAccounts) {
	// 	this.siocSiteHasSiocUserAccounts = siocSiteHasSiocUserAccounts;
	// }

	// public SiocSiteHasSiocUserAccount addSiocSiteHasSiocUserAccount(SiocSiteHasSiocUserAccount siocSiteHasSiocUserAccount) {
	// 	getSiocSiteHasSiocUserAccounts().add(siocSiteHasSiocUserAccount);
	// 	siocSiteHasSiocUserAccount.setRole(this);

	// 	return siocSiteHasSiocUserAccount;
	// }

	// public SiocSiteHasSiocUserAccount removeSiocSiteHasSiocUserAccount(SiocSiteHasSiocUserAccount siocSiteHasSiocUserAccount) {
	// 	getSiocSiteHasSiocUserAccounts().remove(siocSiteHasSiocUserAccount);
	// 	siocSiteHasSiocUserAccount.setRole(null);

	// 	return siocSiteHasSiocUserAccount;
	// }

}