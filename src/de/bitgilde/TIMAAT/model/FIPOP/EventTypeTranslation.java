package de.bitgilde.TIMAAT.model.FIPOP;

import java.io.Serializable;
import javax.persistence.*;

import com.fasterxml.jackson.annotation.JsonIgnore;


/**
 * The persistent class for the event_type_translation database table.
 * 
 */
@Entity
@Table(name="event_type_translation")
@NamedQuery(name="EventTypeTranslation.findAll", query="SELECT e FROM EventTypeTranslation e")
public class EventTypeTranslation implements Serializable {
	private static final long serialVersionUID = 1L;

	@Id
	private int id;

	private String type;

	//bi-directional many-to-one association to EventType
	@ManyToOne
	@JsonIgnore
	@JoinColumn(name="event_type_id")
	private EventType eventType;

	//bi-directional many-to-one association to Language
	@ManyToOne
	private Language language;

	public EventTypeTranslation() {
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

	public EventType getEventType() {
		return this.eventType;
	}

	public void setEventType(EventType eventType) {
		this.eventType = eventType;
	}

	public Language getLanguage() {
		return this.language;
	}

	public void setLanguage(Language language) {
		this.language = language;
	}

}