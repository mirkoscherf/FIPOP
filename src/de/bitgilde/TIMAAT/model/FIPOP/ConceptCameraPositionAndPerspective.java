package de.bitgilde.TIMAAT.model.FIPOP;

import java.io.Serializable;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.NamedQuery;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrimaryKeyJoinColumn;
import jakarta.persistence.Table;

/*
 Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
 */

/**
 * The persistent class for the editing_montage database table.
 *
 * @author Mirko Scherf <mscherf@uni-mainz.de>
 */
@Entity
@Table(name="concept_camera_position_and_perspective")
@NamedQuery(name="ConceptCameraPositionAndPerspective.findAll", query="SELECT ccpap FROM ConceptCameraPositionAndPerspective ccpap")
public class ConceptCameraPositionAndPerspective implements Serializable {
	private static final long serialVersionUID = 1L;

	@Id
	@Column(name="analysis_method_id")
	private int analysisMethodId;

	//bi-directional one-to-one association to AnalysisMethod
	@OneToOne
	@PrimaryKeyJoinColumn(name="analysis_method_id")
	@JsonIgnore // ConceptCameraPositionAndPerspective is accessed through AnalysisMethod --> avoid reference cycle
	private AnalysisMethod analysisMethod;

	//bi-directional one-to-one association to CameraDistance
	@OneToOne
	@JoinColumn(name="camera_distance_analysis_method_id")
	private CameraDistance cameraDistance;

	//bi-directional one-to-one association to CameraShotType
	@OneToOne
	@JoinColumn(name="camera_shot_type_analysis_method_id")
	private CameraShotType cameraShotType;

	//bi-directional one-to-one association to CameraVerticalAngle
	@OneToOne
	@JoinColumn(name="camera_vertical_angle_analysis_method_id")
	private CameraVerticalAngle cameraVerticalAngle;

	//bi-directional one-to-one association to CameraHorizontalAngle
	@OneToOne
	@JoinColumn(name="camera_horizontal_angle_analysis_method_id")
	private CameraHorizontalAngle cameraHorizontalAngle;

	//bi-directional one-to-one association to CameraAxisOfAction
	@OneToOne
	@JoinColumn(name="camera_axis_of_action_analysis_method_id")
	private CameraAxisOfAction cameraAxisOfAction;

	//bi-directional one-to-one association to CameraElevation
	@OneToOne
	@JoinColumn(name="camera_elevation_analysis_method_id")
	private CameraElevation cameraElevation;

	//bi-directional one-to-one association to CameraDepthOfFocus
	@OneToOne
	@JoinColumn(name="camera_depth_of_focus_analysis_method_id")
	private CameraDepthOfFocus cameraDepthOfFocus;

	public ConceptCameraPositionAndPerspective() {
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

	public CameraDistance getCameraDistance() {
		return this.cameraDistance;
	}

	public void setCameraDistance(CameraDistance cameraDistance) {
		this.cameraDistance = cameraDistance;
	}

	public CameraShotType getCameraShotType() {
		return this.cameraShotType;
	}

	public void setCameraShotType(CameraShotType cameraShotType) {
		this.cameraShotType = cameraShotType;
	}

	public CameraVerticalAngle getCameraVerticalAngle() {
		return this.cameraVerticalAngle;
	}

	public void setCameraVerticalAngle(CameraVerticalAngle cameraVerticalAngle) {
		this.cameraVerticalAngle = cameraVerticalAngle;
	}

	public CameraHorizontalAngle getCameraHorizontalAngle() {
		return this.cameraHorizontalAngle;
	}

	public void setCameraHorizontalAngle(CameraHorizontalAngle cameraHorizontalAngle) {
		this.cameraHorizontalAngle = cameraHorizontalAngle;
	}

	public CameraAxisOfAction getCameraAxisOfAction() {
		return this.cameraAxisOfAction;
	}

	public void setCameraAxisOfAction(CameraAxisOfAction cameraAxisOfAction) {
		this.cameraAxisOfAction = cameraAxisOfAction;
	}

	public CameraElevation getCameraElevation() {
		return this.cameraElevation;
	}

	public void setCameraElevation(CameraElevation cameraElevation) {
		this.cameraElevation = cameraElevation;
	}

	public CameraDepthOfFocus getCameraDepthOfFocus() {
		return this.cameraDepthOfFocus;
	}

	public void setCameraDepthOfFocus(CameraDepthOfFocus cameraDepthOfFocus) {
		this.cameraDepthOfFocus = cameraDepthOfFocus;
	}

}