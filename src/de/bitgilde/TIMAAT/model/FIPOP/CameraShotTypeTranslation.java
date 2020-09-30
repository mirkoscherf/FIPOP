package de.bitgilde.TIMAAT.model.FIPOP;

import java.io.Serializable;
import javax.persistence.*;

import com.fasterxml.jackson.annotation.JsonIgnore;


/**
 * The persistent class for the camera_shot_type_translation database table.
 * 
 */
@Entity
@Table(name="camera_shot_type_translation")
@NamedQuery(name="CameraShotTypeTranslation.findAll", query="SELECT c FROM CameraShotTypeTranslation c")
public class CameraShotTypeTranslation implements Serializable {
	private static final long serialVersionUID = 1L;

	@Id
	@GeneratedValue(strategy=GenerationType.IDENTITY)
	private int id;

	private String type;

	//bi-directional many-to-one association to CameraShotType
	@ManyToOne
	@JoinColumn(name="camera_shot_type_analysis_method_id")
	@JsonIgnore
	private CameraShotType cameraShotType;

	//bi-directional many-to-one association to Language
	@ManyToOne
	private Language language;

	public CameraShotTypeTranslation() {
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

	public CameraShotType getCameraShotType() {
		return this.cameraShotType;
	}

	public void setCameraShotType(CameraShotType cameraShotType) {
		this.cameraShotType = cameraShotType;
	}

	public Language getLanguage() {
		return this.language;
	}

	public void setLanguage(Language language) {
		this.language = language;
	}

}