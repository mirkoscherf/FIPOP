package de.bitgilde.TIMAAT.model.FIPOP;

import java.io.Serializable;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.NamedQuery;
import jakarta.persistence.Table;


/**
 * The persistent class for the light_position_angle_horizontal_translation database table.
 *
 * @author Mirko Scherf <mscherf@uni-mainz.de>
 */
@Entity
@Table(name="light_position_angle_horizontal_translation")
@NamedQuery(name="LightPositionAngleHorizontalTranslation.findAll", query="SELECT l FROM LightPositionAngleHorizontalTranslation l")
public class LightPositionAngleHorizontalTranslation implements Serializable {
	private static final long serialVersionUID = 1L;

	@Id
	@GeneratedValue(strategy=GenerationType.IDENTITY)
	private int id;

	private String name;

	//bi-directional many-to-one association to Language
	@ManyToOne
	private Language language;

	//bi-directional many-to-one association to LightPositionAngleHorizontal
	@ManyToOne
	@JoinColumn(name="light_position_angle_horizontal_analysis_method_id")
	@JsonIgnore
	private LightPositionAngleHorizontal lightPositionAngleHorizontal;

	public LightPositionAngleHorizontalTranslation() {
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

	public Language getLanguage() {
		return this.language;
	}

	public void setLanguage(Language language) {
		this.language = language;
	}

	public LightPositionAngleHorizontal getLightPositionAngleHorizontal() {
		return this.lightPositionAngleHorizontal;
	}

	public void setLightPositionAngleHorizontal(LightPositionAngleHorizontal lightPositionAngleHorizontal) {
		this.lightPositionAngleHorizontal = lightPositionAngleHorizontal;
	}

}