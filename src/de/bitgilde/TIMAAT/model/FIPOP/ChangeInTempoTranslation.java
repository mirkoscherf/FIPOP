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
 * The persistent class for the change_in_tempo_translation database table.
 *
 * @author Mirko Scherf <mscherf@uni-mainz.de>
 */
@Entity
@Table(name="change_in_tempo_translation")
@NamedQuery(name="ChangeInTempoTranslation.findAll", query="SELECT c FROM ChangeInTempoTranslation c")
public class ChangeInTempoTranslation implements Serializable {
	private static final long serialVersionUID = 1L;

	@Id
	@GeneratedValue(strategy=GenerationType.IDENTITY)
	private int id;

	private String description;

	private String type;

	//bi-directional many-to-one association to ChangeInTempo
	@ManyToOne
	@JoinColumn(name="change_in_tempo_id")
	@JsonIgnore
	private ChangeInTempo changeInTempo;

	//bi-directional many-to-one association to Language
	@ManyToOne
	private Language language;

	public ChangeInTempoTranslation() {
	}

	public int getId() {
		return this.id;
	}

	public void setId(int id) {
		this.id = id;
	}

	public String getDescription() {
		return this.description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public String getType() {
		return this.type;
	}

	public void setType(String type) {
		this.type = type;
	}

	public ChangeInTempo getChangeInTempo() {
		return this.changeInTempo;
	}

	public void setChangeInTempo(ChangeInTempo changeInTempo) {
		this.changeInTempo = changeInTempo;
	}

	public Language getLanguage() {
		return this.language;
	}

	public void setLanguage(Language language) {
		this.language = language;
	}

}