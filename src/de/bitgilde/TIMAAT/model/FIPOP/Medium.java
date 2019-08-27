package de.bitgilde.TIMAAT.model.FIPOP;

import java.io.Serializable;
import java.sql.Timestamp;

import javax.persistence.*;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;

import de.bitgilde.TIMAAT.model.FIPOP.Category;

import java.util.Date;
import java.util.List;
import java.util.Set;


/**
 * The persistent class for the Medium database table.
 * 
 */
@Entity
@NamedQuery(name="Medium.findAll", query="SELECT m FROM Medium m")
@JsonInclude(value=Include.NON_NULL, content=Include.NON_NULL)
@SecondaryTable(name="MediumVideo", pkJoinColumns=@PrimaryKeyJoinColumn(name="MediumID"))
public class Medium implements Serializable {
	private static final long serialVersionUID = 1L;

	@Id
	@GeneratedValue(strategy=GenerationType.IDENTITY)
	private int id;
	
	@Embedded
    @AttributeOverrides({
        @AttributeOverride(name="audioCodecInformationID", column=@Column(table="MediumVideo")),
        @AttributeOverride(name="brand", column=@Column(table="MediumVideo")),
        @AttributeOverride(name="dataRate", column=@Column(table="MediumVideo")),
        @AttributeOverride(name="episodeInformationID", column=@Column(table="MediumVideo")),
        @AttributeOverride(name="frameRate", column=@Column(table="MediumVideo")),
        @AttributeOverride(name="height", column=@Column(table="MediumVideo")),
        @AttributeOverride(name="isEpisode", column=@Column(table="MediumVideo")),
        @AttributeOverride(name="length", column=@Column(table="MediumVideo")),
        @AttributeOverride(name="totalBitrate", column=@Column(table="MediumVideo")),
        @AttributeOverride(name="videoCodec", column=@Column(table="MediumVideo")),
		@AttributeOverride(name="width", column=@Column(table="MediumVideo")),
    })
    private MediumVideo mediumVideo;
	

	public MediumVideo getMediumVideo() {
		return mediumVideo;
	}

	public void setMediumVideo(MediumVideo mediumVideo) {
		this.mediumVideo = mediumVideo;
	}

	//bi-directional many-to-one association to UserAccount
	@ManyToOne
	@JoinColumn(name="CreatedBy_UserAccountId")
	private UserAccount createdBy_UserAccountID;

	//bi-directional many-to-one association to UserAccount
	@ManyToOne
	@JoinColumn(name="lastEditedBy_UserAccountId")
	private UserAccount lastEditedBy_UserAccountID;

	// private UserAccount createdBy_UserAccountID;

	// private UserAccount lastEditedBy_UserAccountID;

	private Timestamp createdAt;

	private Timestamp lastEditedAt;

	private String copyright;

	@JsonIgnore
	private String filePath;

	@JsonIgnore
	private String fileHash;

	@ManyToOne
	@JoinColumn(name="MediaTypeID")
	private MediaType mediaType;

	//bi-directional many-to-one association to Source
	@ManyToOne
	@JoinColumn(name="PrimarySource_SourceID")
	private Source source;

	@OneToOne
	@JoinColumn(name="primaryTitle_TitleID")
	private Title primaryTitle;

	//bi-directional many-to-one association to PropagandaType
	@ManyToOne
	@JoinColumn(name="PropagandaTypeID")
	private PropagandaType propagandaType;

	//bi-directional many-to-one association to Reference
	@ManyToOne
	@JoinColumn(name="ReferenceID")
	private Reference reference;

	@Temporal(TemporalType.DATE)
	private Date releaseDate;

	private String remark;

	@OneToMany
	@JoinTable(
		name="Annotation_has_Medium"
		, joinColumns={
			@JoinColumn(name="MediumID")
			}
		, inverseJoinColumns={
			@JoinColumn(name="AnnotationID")
			}
		)
	@JsonIgnore
	private List<Annotation> annotations;

	@OneToMany(mappedBy="medium")
	private List<MediumAnalysisList> mediumAnalysisLists;

	//bi-directional many-to-many association to Tag
	@ManyToMany(mappedBy="mediums")
	private List<Tag> tags;

	//bi-directional many-to-many association to Category
		@ManyToMany
		@JoinTable(
			name="medium_has_category"
			, joinColumns={
				@JoinColumn(name="medium_id")
				}
			, inverseJoinColumns={
				@JoinColumn(name="category_id")
				}
			)
		private Set<Category> categories;

	
	@Transient
	private String status;
	
	@Transient
	private String viewToken;
	
	public Medium() {
	}

	public int getId() {
		return this.id;
	}

	public void setId(int id) {
		this.id = id;
	}

	public String getCopyright() {
		return this.copyright;
	}

	public void setCopyright(String copyright) {
		this.copyright = copyright;
	}

	public String getFilePath() {
		return this.filePath;
	}

	public void setFilePath(String filePath) {
		this.filePath = filePath;
	}

	public String getFileHash() {
		return this.fileHash;
	}

	public void setFileHash(String fileHash) {
		this.fileHash = fileHash;
	}

	public MediaType getMediaType() {
		return this.mediaType;
	}

	public void setMediaType(MediaType mediaType) {
		this.mediaType = mediaType;
	}

	public Source getSource() {
		return this.source;
	}

	public void setSource(Source source) {
		this.source = source;
	}

	public Title getPrimaryTitle() {
		return this.primaryTitle;
	}

	public void setPrimaryTitle(Title primaryTitle) {
		this.primaryTitle = primaryTitle;
	}

	public PropagandaType getPropagandaType() {
		return this.propagandaType;
	}

	public void setPropagandaType(PropagandaType propagandaType) {
		this.propagandaType = propagandaType;
	}

	public Reference getReference() {
		return this.reference;
	}

	public void setReference(Reference reference) {
		this.reference = reference;
	}

	public Date getReleaseDate() {
		return this.releaseDate;
	}

	public void setReleaseDate(Date releaseDate) {
		this.releaseDate = releaseDate;
	}

	public String getRemark() {
		return this.remark;
	}

	public void setRemark(String remark) {
		this.remark = remark;
	}

	public List<Annotation> getAnnotations() {
		return this.annotations;
	}

	public void setAnnotations(List<Annotation> annotations) {
		this.annotations = annotations;
	}

	public List<MediumAnalysisList> getMediumAnalysisLists() {
		return this.mediumAnalysisLists;
	}

	public void setMediumAnalysisLists(List<MediumAnalysisList> mediumAnalysisLists) {
		this.mediumAnalysisLists = mediumAnalysisLists;
	}

	public MediumAnalysisList addMediumAnalysisList(MediumAnalysisList mediumAnalysisList) {
		getMediumAnalysisLists().add(mediumAnalysisList);
		mediumAnalysisList.setMedium(this);

		return mediumAnalysisList;
	}

	public MediumAnalysisList removeMediumAnalysisList(MediumAnalysisList mediumAnalysisList) {
		getMediumAnalysisLists().remove(mediumAnalysisList);
		mediumAnalysisList.setMedium(null);

		return mediumAnalysisList;
	}

	public List<Tag> getTags() {
		return this.tags;
	}

	public void setTags(List<Tag> tags) {
		this.tags = tags;
	}
	
	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}

	public String getViewToken() {
		return viewToken;
	}

	public void setViewToken(String viewToken) {
		this.viewToken = viewToken;
	}

	public UserAccount getCreatedBy_UserAccountID() {
		return this.createdBy_UserAccountID;
	}

	public void setCreatedBy_UserAccountID(UserAccount createdBy_UserAccountID) {
		this.createdBy_UserAccountID = createdBy_UserAccountID;
	}
	
	public UserAccount getLastEditedBy_UserAccountID() {
		return this.lastEditedBy_UserAccountID;
	}

	public void setLastEditedBy_UserAccountID(UserAccount lastEditedBy_UserAccountID) {
		this.lastEditedBy_UserAccountID = lastEditedBy_UserAccountID;
	}

	public Timestamp getCreatedAt() {
		return this.createdAt;
	}

	public void setCreatedAt(Timestamp createdAt) {
		this.createdAt = createdAt;
	}

	public Timestamp getLastEditedAt() {
		return this.lastEditedAt;
	}

	public void setLastEditedAt(Timestamp lastEditedAt) {
		this.lastEditedAt = lastEditedAt;
	}


	// public UserAccount getUserAccount1() {
	// 	return this.userAccount1;
	// }

	// public void setUserAccount1(UserAccount userAccount1) {
	// 	this.userAccount1 = userAccount1;
	// }

	// public UserAccount getUserAccount2() {
	// 	return this.userAccount2;
	// }

	// public void setUserAccount2(UserAccount userAccount2) {
	// 	this.userAccount2 = userAccount2;
	// }

}