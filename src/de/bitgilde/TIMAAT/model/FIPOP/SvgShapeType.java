package de.bitgilde.TIMAAT.model.FIPOP;

import java.io.Serializable;
import javax.persistence.*;
import java.util.Set;


/**
 * The persistent class for the svg_shape_type database table.
 * 
 */
@Entity
@Table(name="svg_shape_type")
@NamedQuery(name="SvgShapeType.findAll", query="SELECT s FROM SvgShapeType s")
public class SvgShapeType implements Serializable {
	private static final long serialVersionUID = 1L;

	@Id
	private int id;

	//bi-directional many-to-one association to SelectorSvg
	@OneToMany(mappedBy="svgShapeType")
	private Set<SelectorSvg> selectorSvgs;

	//bi-directional many-to-one association to SvgShapeTypeTranslation
	@OneToMany(mappedBy="svgShapeType")
	private Set<SvgShapeTypeTranslation> svgShapeTypeTranslations;

	public SvgShapeType() {
	}

	public int getId() {
		return this.id;
	}

	public void setId(int id) {
		this.id = id;
	}

	public Set<SelectorSvg> getSelectorSvgs() {
		return this.selectorSvgs;
	}

	public void setSelectorSvgs(Set<SelectorSvg> selectorSvgs) {
		this.selectorSvgs = selectorSvgs;
	}

	public SelectorSvg addSelectorSvg(SelectorSvg selectorSvg) {
		getSelectorSvgs().add(selectorSvg);
		selectorSvg.setSvgShapeType(this);

		return selectorSvg;
	}

	public SelectorSvg removeSelectorSvg(SelectorSvg selectorSvg) {
		getSelectorSvgs().remove(selectorSvg);
		selectorSvg.setSvgShapeType(null);

		return selectorSvg;
	}

	public Set<SvgShapeTypeTranslation> getSvgShapeTypeTranslations() {
		return this.svgShapeTypeTranslations;
	}

	public void setSvgShapeTypeTranslations(Set<SvgShapeTypeTranslation> svgShapeTypeTranslations) {
		this.svgShapeTypeTranslations = svgShapeTypeTranslations;
	}

	public SvgShapeTypeTranslation addSvgShapeTypeTranslation(SvgShapeTypeTranslation svgShapeTypeTranslation) {
		getSvgShapeTypeTranslations().add(svgShapeTypeTranslation);
		svgShapeTypeTranslation.setSvgShapeType(this);

		return svgShapeTypeTranslation;
	}

	public SvgShapeTypeTranslation removeSvgShapeTypeTranslation(SvgShapeTypeTranslation svgShapeTypeTranslation) {
		getSvgShapeTypeTranslations().remove(svgShapeTypeTranslation);
		svgShapeTypeTranslation.setSvgShapeType(null);

		return svgShapeTypeTranslation;
	}

}