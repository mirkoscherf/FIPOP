package de.bitgilde.TIMAAT.model.FIPOP;

import java.io.Serializable;
import javax.persistence.*;

import com.fasterxml.jackson.annotation.JsonIgnore;


/**
 * The persistent class for the camera_horizontal_angle_translation database table.
 * 
 */
@Entity
@Table(name="camera_horizontal_angle_translation")
@NamedQuery(name="CameraHorizontalAngleTranslation.findAll", query="SELECT c FROM CameraHorizontalAngleTranslation c")
public class CameraHorizontalAngleTranslation implements Serializable {
	private static final long serialVersionUID = 1L;

	@Id
	@GeneratedValue(strategy=GenerationType.IDENTITY)
	private int id;

	private String name;

	//bi-directional many-to-one association to CameraHorizontalAngle
	@ManyToOne
	@JoinColumn(name="camera_horizontal_angle_analysis_method_id")
	@JsonIgnore
	private CameraHorizontalAngle cameraHorizontalAngle;

	//bi-directional many-to-one association to Language
	@ManyToOne
	private Language language;

	public CameraHorizontalAngleTranslation() {
	}

	public int getId() {
		return this.id;
	}

	public void setId(int id) {
		this.id = id;
	}

	public String getName() {
		return this.name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public CameraHorizontalAngle getCameraHorizontalAngle() {
		return this.cameraHorizontalAngle;
	}

	public void setCameraHorizontalAngle(CameraHorizontalAngle cameraHorizontalAngle) {
		this.cameraHorizontalAngle = cameraHorizontalAngle;
	}

	public Language getLanguage() {
		return this.language;
	}

	public void setLanguage(Language language) {
		this.language = language;
	}

}