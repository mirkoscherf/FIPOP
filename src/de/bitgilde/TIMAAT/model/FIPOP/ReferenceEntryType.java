package de.bitgilde.TIMAAT.model.FIPOP;

import java.io.Serializable;
import javax.persistence.*;
import java.util.List;


/**
 * The persistent class for the ReferenceEntryType database table.
 * 
 */
@Entity
@NamedQuery(name="ReferenceEntryType.findAll", query="SELECT r FROM ReferenceEntryType r")
public class ReferenceEntryType implements Serializable {
	private static final long serialVersionUID = 1L;

	@Id
	@GeneratedValue(strategy=GenerationType.IDENTITY)
	private int id;

	private String type;

	//bi-directional many-to-one association to Reference
	@OneToMany(mappedBy="referenceEntryType")
	private List<Reference> references;

	//bi-directional many-to-one association to ReferenceDataFieldRequirement
	@OneToMany(mappedBy="referenceEntryType")
	private List<ReferenceDataFieldRequirement> referenceDataFieldRequirements;

	public ReferenceEntryType() {
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

	public List<Reference> getReferences() {
		return this.references;
	}

	public void setReferences(List<Reference> references) {
		this.references = references;
	}

	public Reference addReference(Reference reference) {
		getReferences().add(reference);
		reference.setReferenceEntryType(this);

		return reference;
	}

	public Reference removeReference(Reference reference) {
		getReferences().remove(reference);
		reference.setReferenceEntryType(null);

		return reference;
	}

	public List<ReferenceDataFieldRequirement> getReferenceDataFieldRequirements() {
		return this.referenceDataFieldRequirements;
	}

	public void setReferenceDataFieldRequirements(List<ReferenceDataFieldRequirement> referenceDataFieldRequirements) {
		this.referenceDataFieldRequirements = referenceDataFieldRequirements;
	}

	public ReferenceDataFieldRequirement addReferenceDataFieldRequirement(ReferenceDataFieldRequirement referenceDataFieldRequirement) {
		getReferenceDataFieldRequirements().add(referenceDataFieldRequirement);
		referenceDataFieldRequirement.setReferenceEntryType(this);

		return referenceDataFieldRequirement;
	}

	public ReferenceDataFieldRequirement removeReferenceDataFieldRequirement(ReferenceDataFieldRequirement referenceDataFieldRequirement) {
		getReferenceDataFieldRequirements().remove(referenceDataFieldRequirement);
		referenceDataFieldRequirement.setReferenceEntryType(null);

		return referenceDataFieldRequirement;
	}

}