package de.bitgilde.TIMAAT.model.FIPOP;

import java.io.Serializable;
import jakarta.persistence.*;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;


/**
 * The persistent class for the physical_expression database table.
 * 
 */
@Entity
@Table(name="physical_expression")
@NamedQuery(name="PhysicalExpression.findAll", query="SELECT p FROM PhysicalExpression p")
public class PhysicalExpression implements Serializable {
	private static final long serialVersionUID = 1L;

	@Id
	@Column(name="analysis_method_id")
	private int analysisMethodId;

	//bi-directional one-to-one association to AnalysisMethod
	@OneToOne
	@PrimaryKeyJoinColumn(name="analysis_method_id")
	@JsonIgnore // PyhsicalExpression is accessed through AnalysisMethod --> avoid reference cycle
	private AnalysisMethod analysisMethod;

	//bi-directional many-to-one association to PhysicalExpressionTranslation
	@OneToMany(mappedBy="physicalExpression")
	private List<PhysicalExpressionTranslation> physicalExpressionTranslations;

	public PhysicalExpression() {
	}

	public int getAnalysisMethodId() {
		return this.analysisMethodId;
	}

	public void setAnalysisMethodId(int analysisMethodId) {
		this.analysisMethodId = analysisMethodId;
	}

	public AnalysisMethod getAnalysisMethod() {
		return this.analysisMethod;
	}

	public void setAnalysisMethod(AnalysisMethod analysisMethod) {
		this.analysisMethod = analysisMethod;
	}

	public List<PhysicalExpressionTranslation> getPhysicalExpressionTranslations() {
		return this.physicalExpressionTranslations;
	}

	public void setPhysicalExpressionTranslations(List<PhysicalExpressionTranslation> physicalExpressionTranslations) {
		this.physicalExpressionTranslations = physicalExpressionTranslations;
	}

	public PhysicalExpressionTranslation addPhysicalExpressionTranslation(PhysicalExpressionTranslation physicalExpressionTranslation) {
		getPhysicalExpressionTranslations().add(physicalExpressionTranslation);
		physicalExpressionTranslation.setPhysicalExpression(this);

		return physicalExpressionTranslation;
	}

	public PhysicalExpressionTranslation removePhysicalExpressionTranslation(PhysicalExpressionTranslation physicalExpressionTranslation) {
		getPhysicalExpressionTranslations().remove(physicalExpressionTranslation);
		physicalExpressionTranslation.setPhysicalExpression(null);

		return physicalExpressionTranslation;
	}

}