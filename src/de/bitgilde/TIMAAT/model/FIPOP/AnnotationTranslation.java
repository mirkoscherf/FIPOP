package de.bitgilde.TIMAAT.model.FIPOP;

import java.io.Serializable;
import javax.persistence.*;


/**
 * The persistent class for the annotation_translation database table.
 * 
 */
@Entity
@Table(name="annotation_translation")
@NamedQuery(name="AnnotationTranslation.findAll", query="SELECT a FROM AnnotationTranslation a")
public class AnnotationTranslation implements Serializable {
	private static final long serialVersionUID = 1L;

	@Id
	private int id;

	private String comment;

	private String title;

	//bi-directional many-to-one association to Annotation
	@ManyToOne
	private Annotation annotation;

	//bi-directional many-to-one association to Language
	@ManyToOne
	private Language language;

	public AnnotationTranslation() {
	}

	public int getId() {
		return this.id;
	}

	public void setId(int id) {
		this.id = id;
	}

	public String getComment() {
		return this.comment;
	}

	public void setComment(String comment) {
		this.comment = comment;
	}

	public String getTitle() {
		return this.title;
	}

	public void setTitle(String title) {
		this.title = title;
	}

	public Annotation getAnnotation() {
		return this.annotation;
	}

	public void setAnnotation(Annotation annotation) {
		this.annotation = annotation;
	}

	public Language getLanguage() {
		return this.language;
	}

	public void setLanguage(Language language) {
		this.language = language;
	}

}