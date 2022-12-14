package de.bitgilde.TIMAAT.model.FIPOP;

import java.io.Serializable;

import com.fasterxml.jackson.annotation.JsonBackReference;

import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.NamedQuery;
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
 * The persistent class for the user_account_has_media_collection database table.
 *
 * @author Mirko Scherf <mscherf@uni-mainz.de>
 */
@Entity
@Table(name="user_account_has_media_collection")
@NamedQuery(name="UserAccountHasMediaCollection.findAll", query="SELECT u FROM UserAccountHasMediaCollection u")
public class UserAccountHasMediaCollection implements Serializable {
	private static final long serialVersionUID = 1L;

	@EmbeddedId
	private UserAccountHasMediaCollectionPK id;

	//bi-directional many-to-one association to MediaCollection
	@ManyToOne
	@JoinColumn(name="media_collection_id")
	@JsonBackReference(value = "MediaCollection-UserAccountHasMediaCollection")
	private MediaCollection mediaCollection;

	//bi-directional many-to-one association to PermissionType
	@ManyToOne
	@JoinColumn(name="permission_type_id")
	private PermissionType permissionType;

	//bi-directional many-to-one association to UserAccount
	@ManyToOne
	@JoinColumn(name="user_account_id")
	@JsonBackReference(value = "UserAccount-UserAccountHasMediaCollection")
	private UserAccount userAccount;

	public UserAccountHasMediaCollection() {
	}

	public UserAccountHasMediaCollection(UserAccount userAccount, MediaCollection mediaCollection) {
		this.userAccount = userAccount;
		this.mediaCollection = mediaCollection;
		this.id = new UserAccountHasMediaCollectionPK(userAccount.getId(), mediaCollection.getId());
	}

	public UserAccountHasMediaCollectionPK getId() {
		return this.id;
	}

	public void setId(UserAccountHasMediaCollectionPK id) {
		this.id = id;
	}

	public MediaCollection getMediaCollection() {
		return this.mediaCollection;
	}

	public void setMediaCollection(MediaCollection mediaCollection) {
		this.mediaCollection = mediaCollection;
	}

	public PermissionType getPermissionType() {
		return this.permissionType;
	}

	public void setPermissionType(PermissionType permissionType) {
		this.permissionType = permissionType;
	}

	public UserAccount getUserAccount() {
		return this.userAccount;
	}

	public void setUserAccount(UserAccount userAccount) {
		this.userAccount = userAccount;
	}

}