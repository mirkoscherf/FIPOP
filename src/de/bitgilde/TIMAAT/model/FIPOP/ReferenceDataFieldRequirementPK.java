package de.bitgilde.TIMAAT.model.FIPOP;

import java.io.Serializable;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

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
 * The primary key class for the reference_data_field_requirements database table.
 *
 * @author Jens-Martin Loebel <loebel@bitgilde.de>
 * @author Mirko Scherf <mscherf@uni-mainz.de>
 */
@Embeddable
public class ReferenceDataFieldRequirementPK implements Serializable {
	//default serial version id, required for serializable classes.
	private static final long serialVersionUID = 1L;

	@Column(name="reference_entry_type_id", insertable=false, updatable=false)
	private int referenceEntryTypeId;

	@Column(name="reference_id", insertable=false, updatable=false)
	private int referenceId;

	public ReferenceDataFieldRequirementPK() {
	}
	public int getReferenceEntryTypeId() {
		return this.referenceEntryTypeId;
	}
	public void setReferenceEntryTypeId(int referenceEntryTypeId) {
		this.referenceEntryTypeId = referenceEntryTypeId;
	}
	public int getReferenceId() {
		return this.referenceId;
	}
	public void setReferenceId(int referenceId) {
		this.referenceId = referenceId;
	}

	public boolean equals(Object other) {
		if (this == other) {
			return true;
		}
		if (!(other instanceof ReferenceDataFieldRequirementPK)) {
			return false;
		}
		ReferenceDataFieldRequirementPK castOther = (ReferenceDataFieldRequirementPK)other;
		return
			(this.referenceEntryTypeId == castOther.referenceEntryTypeId)
			&& (this.referenceId == castOther.referenceId);
	}

	public int hashCode() {
		final int prime = 31;
		int hash = 17;
		hash = hash * prime + this.referenceEntryTypeId;
		hash = hash * prime + this.referenceId;

		return hash;
	}
}