package de.bitgilde.TIMAAT.model.FIPOP;

import java.io.Serializable;
import javax.persistence.*;
import java.util.Set;


/**
 * The persistent class for the medium_software database table.
 * 
 */
@Entity
@Table(name="medium_software")
@NamedQuery(name="MediumSoftware.findAll", query="SELECT m FROM MediumSoftware m")
public class MediumSoftware implements Serializable {
	private static final long serialVersionUID = 1L;

	@Id
	@Column(name="medium_id")
	private int mediumId;

	private String version;

	//bi-directional one-to-one association to Medium
	@OneToOne
	@PrimaryKeyJoinColumn(name="medium_id")
	private Medium medium;

	//bi-directional many-to-many association to Platform
	@ManyToMany(mappedBy="mediumSoftwares")
	private Set<Platform> platforms;

	public MediumSoftware() {
	}

	public int getMediumId() {
		return this.mediumId;
	}

	public void setMediumId(int mediumId) {
		this.mediumId = mediumId;
	}

	public int getId() { // TODO not necessary with getMediumId? (BUG: removing these unused functions prevents software list from being displayed=)
		return this.getMedium().getId();
	}

	public void setId(int id) { // TODO not necessary with setMediumId?
		this.getMedium().setId(id);
	}

	public String getVersion() {
		return this.version;
	}

	public void setVersion(String version) {
		this.version = version;
	}

	public Medium getMedium() {
		return this.medium;
	}

	public void setMedium(Medium medium) {
		this.medium = medium;
	}

	public Set<Platform> getPlatforms() {
		return this.platforms;
	}

	public void setPlatforms(Set<Platform> platforms) {
		this.platforms = platforms;
	}

}