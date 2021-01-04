package de.bitgilde.TIMAAT.model.FIPOP;

import java.io.Serializable;
import javax.persistence.*;

import com.fasterxml.jackson.annotation.JsonBackReference;

import java.util.List;


/**
 * The persistent class for the analysis_segment database table.
 * 
 */
@Entity
@Table(name="analysis_segment")
@NamedQuery(name="AnalysisSegment.findAll", query="SELECT a FROM AnalysisSegment a")
public class AnalysisSegment implements Serializable {
	private static final long serialVersionUID = 1L;

	@Id
	@GeneratedValue(strategy=GenerationType.IDENTITY)
	private int id;

	// TODO get name from translation

	@Column(name="segment_end_time", columnDefinition = "INT")
	private long segmentEndTime;

	@Column(name="segment_start_time", columnDefinition = "INT")
	private long segmentStartTime;

	//bi-directional many-to-one association to MediumAnalysisList
	@ManyToOne
	@JoinColumn(name="analysis_list_id")
	@JsonBackReference(value = "MediumAnalysisList-AnalysisSegment")
	private MediumAnalysisList mediumAnalysisList;

	//bi-directional many-to-one association to AnalysisSegmentTranslation
	@OneToMany(mappedBy="analysisSegment", cascade = CascadeType.ALL)
	// @JsonManagedReference(value = "AnalysisSegment-AnalysisSegmentTranslation")
	private List<AnalysisSegmentTranslation> analysisSegmentTranslations;

	public AnalysisSegment() {
	}

	public int getId() {
		return this.id;
	}

	public void setId(int id) {
		this.id = id;
	}

	public long getSegmentEndTime() { // TODO get and set correct segment time values after change from Timestamp to Time
		return this.segmentEndTime;
		// if ( segmentEndTime == null ) return -1;
		// return segmentEndTime.getTime()/1000f;
	}

	public void setSegmentEndTime(long segmentEndTime) {
		this.segmentEndTime = segmentEndTime;
		// this.segmentEndTime = new java.sql.Timestamp((long)(segmentEndTime*1000f));
	}

	public long getSegmentStartTime() {
		return this.segmentStartTime;
		// if ( segmentStartTime == null ) return -1;
		// return segmentStartTime.getTime()/1000f;
	}

	public void setSegmentStartTime(long segmentStartTime) {
		this.segmentStartTime = segmentStartTime;
		// this.segmentStartTime = new java.sql.Timestamp((long)(segmentStartTime*1000f));
	}

	// public float getStartTime() {
	// 	if ( this.segmentStartTime == null ) return -1;
	// 	return segmentStartTime.getTime()/1000f;
	// }

	// public void setStartTime(float startTime) {
	// 	if ( this.segmentStartTime == null ) this.segmentStartTime = new Time(0);
	// 	this.segmentStartTime.setTime((long)(startTime*1000f));
	// }

	// public float getEndTime() {
	// 	if ( segmentEndTime == null ) return -1;
	// 	return segmentEndTime.getTime()/1000f;
	// }

	// public void setEndTime(float endTime) {
	// 	if ( this.segmentEndTime == null ) this.segmentEndTime = new Time(0);
	// 	this.segmentEndTime.setTime((long)(endTime*1000f));
	// }

	public MediumAnalysisList getMediumAnalysisList() {
		return this.mediumAnalysisList;
	}

	public void setMediumAnalysisList(MediumAnalysisList mediumAnalysisList) {
		this.mediumAnalysisList = mediumAnalysisList;
	}

	public List<AnalysisSegmentTranslation> getAnalysisSegmentTranslations() {
		return this.analysisSegmentTranslations;
	}

	public void setAnalysisSegmentTranslations(List<AnalysisSegmentTranslation> analysisSegmentTranslations) {
		this.analysisSegmentTranslations = analysisSegmentTranslations;
	}

	public AnalysisSegmentTranslation addAnalysisSegmentTranslation(AnalysisSegmentTranslation analysisSegmentTranslation) {
		getAnalysisSegmentTranslations().add(analysisSegmentTranslation);
		analysisSegmentTranslation.setAnalysisSegment(this);

		return analysisSegmentTranslation;
	}

	public AnalysisSegmentTranslation removeAnalysisSegmentTranslation(AnalysisSegmentTranslation analysisSegmentTranslation) {
		getAnalysisSegmentTranslations().remove(analysisSegmentTranslation);
		analysisSegmentTranslation.setAnalysisSegment(null);

		return analysisSegmentTranslation;
	}

}