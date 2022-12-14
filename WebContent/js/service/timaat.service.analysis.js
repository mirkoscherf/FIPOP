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
 * @author Mirko Scherf <mscherf@uni-mainz.de>
 */
'use strict';
(function (factory, window) {
	/*globals define, module, require*/

	// define an AMD module that relies on 'TIMAAT'
	if (typeof define === 'function' && define.amd) {
		define(['TIMAAT'], factory);


	// define a Common JS module that relies on 'TIMAAT'
	} else if (typeof exports === 'object') {
		module.exports = factory(require('TIMAAT'));
	}

	// attach your plugin to the global 'TIMAAT' variable
	if(typeof window !== 'undefined' && window.TIMAAT){
		factory(window.TIMAAT);
	}

}(function (TIMAAT) {

	TIMAAT.AnalysisService = {

	async addAnalysisMethodToAnalysis(model) {
	  // console.log("TCL: addAnalysisMethodToAnalysis -> model", model);
		return new Promise(resolve => {
			$.ajax({
				url:window.location.protocol+'//'+window.location.host+"/TIMAAT/api/analysis/"+model.annotation.id+"/"+model.analysisMethod.id+'/?authToken='+TIMAAT.Service.session.token,
				type:"POST",
				data: JSON.stringify(model),
				contentType:"application/json; charset=utf-8",
				dataType:"json",
				beforeSend: function (xhr) {
					xhr.setRequestHeader('Authorization', 'Bearer '+TIMAAT.Service.token);
				},
			}).done(function(data) {
      	// console.log("TCL: addAnalysisMethodToAnalysis -> data", data);
				resolve(data);
			}).fail(function(error) {
				console.error("ERROR: ", error);
				console.error("ERROR responseText:", error.responseText);
			});
		}).catch((error) => {
			console.error("ERROR: ", error);
		});
	},

	// removes analysis with link to reusable analysis method
	async deleteStaticAnalysis(analysisId) {
	  // console.log("TCL: deleteStaticAnalysis -> analysisId", analysisId);
		return new Promise(resolve => {
			$.ajax({
				url:window.location.protocol+'//'+window.location.host+"/TIMAAT/api/analysis/"+analysisId+'/?authToken='+TIMAAT.Service.session.token,
				type:"DELETE",
				contentType:"application/json; charset=utf-8",
				beforeSend: function (xhr) {
					xhr.setRequestHeader('Authorization', 'Bearer '+TIMAAT.Service.token);
				},
			}).done(function(data) {
				resolve(data);
			}).fail(function(error) {
				console.error("ERROR: ", error);
				console.error("ERROR responseText:", error.responseText);
			});
		}).catch((error) => {
			console.error("ERROR: ", error);
		});
	},

	async createAnalysisMethodVariant(model, variantType) {
  	// console.log("TCL: createAnalysisMethodVariant -> model, variantType", model, variantType);
		return new Promise(resolve => {
			$.ajax({
				url:window.location.protocol+'//'+window.location.host+"/TIMAAT/api/analysis/"+variantType+"/"+model.analysisMethodId,
				type:"POST",
				data: JSON.stringify(model),
				contentType:"application/json; charset=utf-8",
				dataType:"json",
				beforeSend: function (xhr) {
					xhr.setRequestHeader('Authorization', 'Bearer '+TIMAAT.Service.token);
				},
			}).done(function(data) {
      	// console.log("TCL: createAnalysisMethodVariant -> data", data);
				resolve(data);
			}).fail(function(error) {
				console.error("ERROR: ", error);
				console.error("ERROR responseText:", error.responseText);
			});
		}).catch((error) => {
			console.error("ERROR: ", error);
		});
	},

	// removes analysis and corresponding analysis method and method variant data as it is unique to this analysis
	async deleteDynamicAnalysis(analysisMethodId) {
		// console.log("TCL: deleteDynamicAnalysis -> analysisMethodId", analysisMethodId);
		return new Promise(resolve => {
			$.ajax({
				url:window.location.protocol+'//'+window.location.host+"/TIMAAT/api/analysis/analysisAndMethod/"+analysisMethodId+'/?authToken='+TIMAAT.Service.session.token,
				type:"DELETE",
				contentType:"application/json; charset=utf-8",
				beforeSend: function (xhr) {
					xhr.setRequestHeader('Authorization', 'Bearer '+TIMAAT.Service.token);
				},
			}).done(function(data) {
      	// console.log("TCL: createAnalysisMethodVariant -> data", data);
				resolve(data);
			}).fail(function(error) {
				console.error("ERROR: ", error);
				console.error("ERROR responseText:", error.responseText);
			});
		}).catch((error) => {
			console.error("ERROR: ", error);
		});
	},

	async createAudioPostProduction() {
  	// console.log("TCL: createAudioPostProduction");
		return new Promise(resolve => {
			$.ajax({
				url:window.location.protocol+'//'+window.location.host+"/TIMAAT/api/analysis/audioPostProduction/0",
				type:"POST",
				contentType:"application/json; charset=utf-8",
				dataType:"json",
				beforeSend: function (xhr) {
					xhr.setRequestHeader('Authorization', 'Bearer '+TIMAAT.Service.token);
				},
			}).done(function(data) {
      	// console.log("TCL: createAudioPostProduction -> data", data);
				resolve(data);
			}).fail(function(error) {
				console.error("ERROR: ", error);
				console.error("ERROR responseText:", error.responseText);
			});
		}).catch((error) => {
			console.error("ERROR: ", error);
		});
	},

	async deleteAudioPostProduction(id) {
		// console.log("TCL: deleteAudioPostProduction -> id", id);
		return new Promise(resolve => {
			$.ajax({
				url:window.location.protocol+'//'+window.location.host+"/TIMAAT/api/analysis/audioPostProduction/"+id,
				type:"DELETE",
				contentType:"application/json; charset=utf-8",
				beforeSend: function (xhr) {
					xhr.setRequestHeader('Authorization', 'Bearer '+TIMAAT.Service.token);
				},
			}).done(function(data) {
      	// console.log("TCL: deleteAudioPostProduction -> data", data);
				resolve(data);
			}).fail(function(error) {
				console.error("ERROR: ", error);
				console.error("ERROR responseText:", error.responseText);
			});
		}).catch((error) => {
			console.error("ERROR: ", error);
		});
	},

	async createAudioPostProductionTranslation(model) {
  	// console.log("TCL: createAudioPostProductionTranslation -> model", model);
		return new Promise(resolve => {
			$.ajax({
				url:window.location.protocol+'//'+window.location.host+"/TIMAAT/api/analysis/audioPostProduction/"+model.audioPostProduction.id+"/translation",
				type:"POST",
				data: JSON.stringify(model),
				contentType:"application/json; charset=utf-8",
				dataType:"json",
				beforeSend: function (xhr) {
					xhr.setRequestHeader('Authorization', 'Bearer '+TIMAAT.Service.token);
				},
			}).done(function(data) {
      	// console.log("TCL: createAudioPostProductionTranslation -> data", data);
				resolve(data);
			}).fail(function(error) {
				console.error("ERROR: ", error);
				console.error("ERROR responseText:", error.responseText);
			});
		}).catch((error) => {
			console.error("ERROR: ", error);
		});
	},

  }
}, window));
