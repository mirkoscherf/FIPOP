package de.bitgilde.TIMAAT.model.FIPOP;
import java.io.Serializable;
import javax.persistence.*;

import com.fasterxml.jackson.annotation.JsonIgnore;


/**
 * The persistent class for the jins_translation database table.
 * 
 */
@Entity
@Table(name="jins_translation")
@NamedQuery(name="JinsTranslation.findAll", query="SELECT j FROM JinsTranslation j")
public class JinsTranslation implements Serializable {
	private static final long serialVersionUID = 1L;

	@Id
	@GeneratedValue(strategy=GenerationType.IDENTITY)
	private int id;

	//bi-directional many-to-one association to Language
	@ManyToOne
	private Language language;

	private String type;

	//bi-directional many-to-one association to Jins
	@ManyToOne
	@JsonIgnore
	private Jins jins;

	public JinsTranslation() {
	}

	public int getId() {
		return this.id;
	}

	public void setId(int id) {
		this.id = id;
	}

	public Language getLanguage() {
		return this.language;
	}

	public void setLanguage(Language language) {
		this.language = language;
	}

	public String getType() {
		return this.type;
	}

	public void setType(String type) {
		this.type = type;
	}

	public Jins getJins() {
		return this.jins;
	}

	public void setJins(Jins jins) {
		this.jins = jins;
	}

}