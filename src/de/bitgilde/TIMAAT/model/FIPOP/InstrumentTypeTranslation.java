package de.bitgilde.TIMAAT.model.FIPOP;

import java.io.Serializable;
import javax.persistence.*;

import com.fasterxml.jackson.annotation.JsonIgnore;


/**
 * The persistent class for the instrument_type_translation database table.
 * 
 */
@Entity
@Table(name="instrument_type_translation")
@NamedQuery(name="InstrumentTypeTranslation.findAll", query="SELECT i FROM InstrumentTypeTranslation i")
public class InstrumentTypeTranslation implements Serializable {
	private static final long serialVersionUID = 1L;

	@Id
	@GeneratedValue(strategy=GenerationType.IDENTITY)
	private int id;

	private String type;

	//bi-directional many-to-one association to InstrumentType
	@ManyToOne
	@JoinColumn(name="instrument_type_id")
	@JsonIgnore
	private InstrumentType instrumentType;

	//bi-directional many-to-one association to Language
	@ManyToOne
	private Language language;

	public InstrumentTypeTranslation() {
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

	public InstrumentType getInstrumentType() {
		return this.instrumentType;
	}

	public void setInstrumentType(InstrumentType instrumentType) {
		this.instrumentType = instrumentType;
	}

	public Language getLanguage() {
		return this.language;
	}

	public void setLanguage(Language language) {
		this.language = language;
	}

}