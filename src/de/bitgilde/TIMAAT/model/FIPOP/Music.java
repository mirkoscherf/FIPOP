package de.bitgilde.TIMAAT.model.FIPOP;

import java.io.Serializable;
import java.sql.Timestamp;
import java.util.List;
import java.util.Objects;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.NamedQuery;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Transient;

@Entity
@NamedQuery(name="Music.findAll", query="SELECT m FROM Music m")
public class Music implements Serializable {
  private static final long serialVersionUID = 1L;

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private int id;

	private String beat;

	private String harmony;

	private String instrumentation;

	private String melody;

	private short tempo;

	private String remark;

	@Column(name="created_at")
	private Timestamp createdAt;

	@Column(name="last_edited_at")
	private Timestamp lastEditedAt;

	//bi-directional many-to-one association to UserAccount
	@ManyToOne
	@JoinColumn(name="created_by_user_account_id")
	@JsonBackReference(value = "Music-CreatedByUserAccount")
	private UserAccount createdByUserAccount;

	@Transient
	@JsonProperty("createdByUserAccountId")
	private int createdByUserAccountId;

	//bi-directional many-to-one association to UserAccount
	@ManyToOne
	@JoinColumn(name="last_edited_by_user_account_id")
	@JsonBackReference(value = "Music-LastEditedByUserAccount")
	private UserAccount lastEditedByUserAccount;

	@Transient
	@JsonProperty("lastEditedByUserAccountId")
	private int lastEditedByUserAccountId;

	//bi-directional many-to-one association to AudioPostProduction
	@ManyToOne
	@JoinColumn(name="audio_post_production_id")
	private AudioPostProduction audioPostProduction;

	//bi-directional many-to-one association to Articulation
	@ManyToOne
	@JoinColumn(name="articulation_id")
	private Articulation articulation;

	//bi-directional many-to-one association to ChangeInDynamics
	@ManyToOne
	@JoinColumn(name="change_in_dynamics_id")
	private ChangeInDynamics changeInDynamics;

	//bi-directional many-to-one association to DynamicMarking
	@ManyToOne
	@JoinColumn(name="dynamic_marking_id")
	private DynamicMarking dynamicMarking;

	//bi-directional many-to-one association to Medium
	@OneToOne
	@JoinColumn(name="primary_source_medium_id")
	private Medium primarySourceMedium;

	//bi-directional many-to-one association to MusicType
	@ManyToOne
	@JoinColumn(name="music_type_id")
	private MusicType musicType;

	//bi-directional many-to-one association to MusicalKey
	@ManyToOne
	@JoinColumn(name="musical_key_id")
	private MusicalKey musicalKey;

	//bi-directional many-to-many association to ActorHasRole
	@ManyToMany
	@JoinTable(
		name="music_has_actor_with_role"
		, joinColumns={
			@JoinColumn(name="music_id")
			}
		, inverseJoinColumns={
			@JoinColumn(name="actor_has_role_actor_id", referencedColumnName="actor_id"),
			@JoinColumn(name="actor_has_role_role_id", referencedColumnName="role_id")
			}
		)
	private List<ActorHasRole> actorHasRoles;

	//bi-directional many-to-one association to MusicHasActorWithRole
	@OneToMany(mappedBy="music")
	private List<MusicHasActorWithRole> musicHasActorWithRoles;

	//bi-directional many-to-many association to CategorySet
	@ManyToMany
	@JoinTable(
		name="music_has_category_set"
		, joinColumns={
			@JoinColumn(name="music_id")
			}
		, inverseJoinColumns={
			@JoinColumn(name="category_set_id")
			}
		)
	private List<CategorySet> categorySets;

	//bi-directional many-to-many association to Category
	@ManyToMany
	@JoinTable(
		name="music_has_category"
		, joinColumns={
			@JoinColumn(name="music_id")
			}
		, inverseJoinColumns={
			@JoinColumn(name="category_id")
			}
		)
	private List<Category> categories;

	//bi-directional many-to-many association to Tag
	@ManyToMany
	@JoinTable(
		name="music_has_tag"
		, inverseJoinColumns={
			@JoinColumn(name="tag_id")
			}
		, joinColumns={
			@JoinColumn(name="music_id")
			}
		)
	private List<Tag> tags;

	//bi-directional many-to-many association to VoiceLeadingPattern
	@ManyToMany
	@JoinTable(
		name="music_has_voice_leading_pattern"
		, inverseJoinColumns={
			@JoinColumn(name="voice_leading_pattern_id")
			}
		, joinColumns={
			@JoinColumn(name="music_id")
			}
		)
	private List<VoiceLeadingPattern> voiceLeadingPatternList;

	//bi-directional many-to-one association to Title
	@ManyToOne(cascade = CascadeType.PERSIST)
	@JoinColumn(name="display_title_title_id")
	private Title displayTitle;

	//bi-directional many-to-one association to Title
	@ManyToOne(cascade = CascadeType.PERSIST)
	@JoinColumn(name="original_title_title_id")
	private Title originalTitle;

	//bi-directional many-to-many association to Title
	@ManyToMany(mappedBy="musicList")
	private List<Title> titleList;

	//bi-directional one-to-one association to MusicNashid
	@OneToOne(mappedBy="music")
	private MusicNashid musicNashid;

	//bi-directional one-to-one association to MusicChurchMusic
	@OneToOne(mappedBy="music")
	private MusicChurchMusic musicChurchMusic;

	//bi-directional many-to-one association to TempoMarking
	@ManyToOne
	@JoinColumn(name="tempo_marking_id")
	private TempoMarking tempoMarking;

	//bi-directional many-to-one association to TextSetting
	@ManyToOne
	@JoinColumn(name="text_setting_id")
	private TextSetting textSetting;
	

	public Music() {
	}

	public int getId() {
		return this.id;
	}

	public void setId(int id) {
		this.id = id;
	}

	public Timestamp getCreatedAt() {
		return this.createdAt;
	}

	public void setCreatedAt(Timestamp createdAt) {
		this.createdAt = createdAt;
	}

	public UserAccount getCreatedByUserAccount() {
		return this.createdByUserAccount;
	}

	public void setCreatedByUserAccount(UserAccount createdByUserAccount) {
		this.createdByUserAccount = createdByUserAccount;
	}

	public Timestamp getLastEditedAt() {
		return this.lastEditedAt;
	}

	public void setLastEditedAt(Timestamp lastEditedAt) {
		this.lastEditedAt = lastEditedAt;
	}

	public int getCreatedByUserAccountId() {
		return this.getCreatedByUserAccount().getId();
	}

	public UserAccount getLastEditedByUserAccount() {
		return this.lastEditedByUserAccount;
	}

	public void setLastEditedByUserAccount(UserAccount lastEditedByUserAccount) {
		this.lastEditedByUserAccount = lastEditedByUserAccount;
	}

	public int getLastEditedByUserAccountId() {
		if (Objects.isNull(this.getLastEditedByUserAccount())) return 0;
		return this.getLastEditedByUserAccount().getId();
	}

	public String getBeat() {
		return this.beat;
	}

	public void setBeat(String beat) {
		this.beat = beat;
	}

	public String getHarmony() {
		return this.harmony;
	}

	public void setHarmony(String harmony) {
		this.harmony = harmony;
	}

	public String getInstrumentation() {
		return this.instrumentation;
	}

	public void setInstrumentation(String instrumentation) {
		this.instrumentation = instrumentation;
	}

	public String getMelody() {
		return this.melody;
	}

	public void setMelody(String melody) {
		this.melody = melody;
	}

	public short getTempo() {
		return this.tempo;
	}

	public void setTempo(short tempo) {
		this.tempo = tempo;
	}

	public String getRemark() {
		return this.remark;
	}

	public void setRemark(String remark) {
		this.remark = remark;
	}

	public AudioPostProduction getAudioPostProduction() {
		return this.audioPostProduction;
	}

	public void setAudioPostProduction(AudioPostProduction audioPostProduction) {
		this.audioPostProduction = audioPostProduction;
	}

	public Articulation getArticulation() {
		return this.articulation;
	}

	public void setArticulation(Articulation articulation) {
		this.articulation = articulation;
	}

	public ChangeInDynamics getChangeInDynamics() {
		return this.changeInDynamics;
	}

	public void setChangeInDynamics(ChangeInDynamics changeInDynamics) {
		this.changeInDynamics = changeInDynamics;
	}

	public DynamicMarking getDynamicMarking() {
		return this.dynamicMarking;
	}

	public void setDynamicMarking(DynamicMarking dynamicMarking) {
		this.dynamicMarking = dynamicMarking;
	}

	public Medium getPrimarySourceMedium() {
		return this.primarySourceMedium;
	}

	public void setPrimarySourceMedium(Medium primarySourceMedium) {
		this.primarySourceMedium = primarySourceMedium;
	}

	public MusicType getMusicType() {
		return this.musicType;
	}

	public void setMusicType(MusicType musicType) {
		this.musicType = musicType;
	}

	public MusicalKey getMusicalKey() {
		return this.musicalKey;
	}

	public void setMusicalKey(MusicalKey musicalKey) {
		this.musicalKey = musicalKey;
	}

	public List<ActorHasRole> getActorHasRoles() {
		return this.actorHasRoles;
	}

	public void setActorHasRoles(List<ActorHasRole> actorHasRoles) {
		this.actorHasRoles = actorHasRoles;
	}

	public List<MusicHasActorWithRole> getMusicHasActorWithRoles() {
		return this.musicHasActorWithRoles;
	}

	public void setMusicHasActorWithRoles(List<MusicHasActorWithRole> musicHasActorWithRoles) {
		this.musicHasActorWithRoles = musicHasActorWithRoles;
	}

	public List<Title> getTitles() {
		return this.titleList;
	}

	public void setTitles(List<Title> titles) {
		this.titleList = titles;
	}

	public Title getDisplayTitle() {
		return this.displayTitle;
	}

	public void setDisplayTitle(Title title) {
		this.displayTitle = title;
	}

	public Title getOriginalTitle() {
		return this.originalTitle;
	}

	public void setOriginalTitle(Title title) {
		this.originalTitle = title;
	}

	public List<CategorySet> getCategorySets() {
		return this.categorySets;
	}

	public void setCategorySets(List<CategorySet> categorySets) {
		this.categorySets = categorySets;
	}

	public List<Category> getCategories() {
		return this.categories;
	}

	public void setCategories(List<Category> categories) {
		this.categories = categories;
	}

	public List<Tag> getTags() {
		return this.tags;
	}

	public void setTags(List<Tag> tags) {
		this.tags = tags;
	}

	public MusicNashid getMusicNashid() {
		return this.musicNashid;
	}

	public void setMusicNashid(MusicNashid musicNashid) {
		this.musicNashid = musicNashid;
	}

	public MusicChurchMusic getMusicChurchMusic() {
		return this.musicChurchMusic;
	}

	public void setMusicChurchMusic(MusicChurchMusic musicChurchMusic) {
		this.musicChurchMusic = musicChurchMusic;
	}

	public TempoMarking getTempoMarking() {
		return this.tempoMarking;
	}

	public void setTempoMarking(TempoMarking tempoMarking) {
		this.tempoMarking = tempoMarking;
	}

	public TextSetting getTextSetting() {
		return this.textSetting;
	}

	public void setTextSetting(TextSetting textSetting) {
		this.textSetting = textSetting;
	}

	public List<VoiceLeadingPattern> getVoiceLeadingPatternList() {
		return this.voiceLeadingPatternList;
	}

	public void setVoiceLeadingPatternList(List<VoiceLeadingPattern> voiceLeadingPatternList) {
		this.voiceLeadingPatternList = voiceLeadingPatternList;
	}
}