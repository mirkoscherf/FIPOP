package de.bitgilde.TIMAAT.rest.endpoint;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

import javax.persistence.EntityManager;
import javax.persistence.EntityTransaction;
import javax.persistence.Query;
import javax.servlet.ServletContext;
import javax.ws.rs.Consumes;
import javax.ws.rs.DELETE;
import javax.ws.rs.GET;
import javax.ws.rs.PATCH;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.container.ContainerRequestContext;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.UriInfo;
import javax.ws.rs.core.Response.Status;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.jvnet.hk2.annotations.Service;

import de.bitgilde.TIMAAT.TIMAATApp;
import de.bitgilde.TIMAAT.model.DatatableInfo;
import de.bitgilde.TIMAAT.model.FIPOP.Analysis;
import de.bitgilde.TIMAAT.model.FIPOP.AnalysisMethod;
import de.bitgilde.TIMAAT.model.FIPOP.AnalysisMethodType;
import de.bitgilde.TIMAAT.model.FIPOP.AnalysisSpeech;
import de.bitgilde.TIMAAT.model.FIPOP.Annotation;
import de.bitgilde.TIMAAT.model.FIPOP.AudioPostProduction;
import de.bitgilde.TIMAAT.model.FIPOP.AudioPostProductionTranslation;
import de.bitgilde.TIMAAT.model.FIPOP.Language;
import de.bitgilde.TIMAAT.model.FIPOP.SoundEffectDescriptive;
import de.bitgilde.TIMAAT.rest.Secured;

@Service
@Path("/analysis")
public class EndpointAnalysis {
  @Context
	private UriInfo uriInfo;
	@Context
	ContainerRequestContext containerRequestContext;
	@Context
	ServletContext servletContext;	
 
  @GET
	@Produces(MediaType.APPLICATION_JSON)
	@Secured
	@Path("method/list")
	public Response getAnalysisMethodList(
			@QueryParam("draw") Integer draw,
			@QueryParam("start") Integer start,
			@QueryParam("length") Integer length,
			@QueryParam("orderby") String orderby,
			@QueryParam("dir") String direction,
			@QueryParam("search") String search,
			@QueryParam("exclude_annotation") Integer annotationID)
	{
		// System.out.println("AnalysisServiceEndpoint: getAnalysisList: draw: "+draw+" start: "+start+" length: "+length+" orderby: "+orderby+" dir: "+direction+" search: "+search+" exclude: "+annotationID);
		if ( draw == null ) draw = 0;

		// sanitize user input
		if ( direction != null && direction.equalsIgnoreCase("desc") ) direction = "DESC"; else direction = "ASC";

		String column = "amtt.id";
		if ( orderby != null ) {
			if (orderby.equalsIgnoreCase("name")) column = "amtt.name";
		}
		
		// define default query strings
		String analysisMethodTypeQuery = "SELECT amt FROM AnalysisMethodType amt, AnalysisMethodTypeTranslation amtt WHERE amt.id = amtt.id ORDER BY ";

		// calculate total # of records
		EntityManager entityManager = TIMAATApp.emf.createEntityManager();
		Query countQuery = entityManager.createQuery("SELECT COUNT(amt) FROM AnalysisMethodType amt");
		long recordsTotal = (long) countQuery.getSingleResult();
		long recordsFiltered = recordsTotal;
		// System.out.println("records total: " + recordsTotal);
		
		// search
		Query query;
		String sql;
		List<AnalysisMethodType> analysisMethodTypeList = new ArrayList<>();
		if ( search != null && search.length() > 0 ) {
			// find all matching names
			sql = "SELECT amt FROM AnalysisMethodTypeTranslation amtt, AnalysisMethodType amt WHERE amt.id = amtt.id AND lower(amtt.name) LIKE lower(concat('%', :search, '%'))";
			query = entityManager.createQuery(sql)
													 .setParameter("search", search);
			// find all analysisMethodTypeTranslations
			if ( start != null && start > 0 ) query.setFirstResult(start);
			if ( length != null && length > 0 ) query.setMaxResults(length);
			analysisMethodTypeList = castList(AnalysisMethodType.class, query.getResultList());
			recordsFiltered = analysisMethodTypeList.size();
		} else {
			query = entityManager.createQuery(
				analysisMethodTypeQuery + column + " " + direction);
				if ( start != null && start > 0 ) query.setFirstResult(start);
				if ( length != null && length > 0 ) query.setMaxResults(length);
				analysisMethodTypeList = castList(AnalysisMethodType.class, query.getResultList());
				// System.out.println("analysisMethodTypeList size: " + analysisMethodTypeList.size());
		}
		return Response.ok().entity(new DatatableInfo(draw, recordsTotal, recordsFiltered, analysisMethodTypeList)).build();
  }
	
	@GET
	@Produces(MediaType.APPLICATION_JSON)
	@Secured
	@Path("method/{id}/selectList")
	public Response getAnalysisMethodSelectList(@PathParam("id") Integer methodTypeId,
																							@QueryParam("start") Integer start,
																							@QueryParam("length") Integer length) //,
																							// @QueryParam("orderby") String orderby,
																							// @QueryParam("search") String search)
	{
		// System.out.println("ActorServiceEndpoint: getActorList: start: "+start+" length: "+length+" orderby: "+orderby+" search: "+search);

		String column = "a.id";
		// if ( orderby != null ) {
		// 	if (orderby.equalsIgnoreCase("name")) column = "amtt.name";
		// }

		class SelectElement{ 
			public int id; 
			public String text;
			public SelectElement(int id, String text) {
				this.id = id; this.text = text;
			};
		}
		
		// determine which analysis method entries shall be displayed
		EntityManager entityManager = TIMAATApp.emf.createEntityManager();
		AnalysisMethodType analysisMethodType = entityManager.find(AnalysisMethodType.class, methodTypeId);
		List<AnalysisMethod> analysisMethodList = analysisMethodType.getAnalysisMethods();

		List<SelectElement> analysisMethodSelectList = new ArrayList<>();
		switch (methodTypeId) {
			case 1: // Martinez Scheffel Unreliable Narration
			for (AnalysisMethod analysisMethod : analysisMethodList) {
				analysisMethodSelectList.add(new SelectElement(analysisMethod.getId(), analysisMethod.getMartinezScheffelUnreliableNarration().getMartinezScheffelUnreliableNarrationTranslations().get(0).getType()));
			}
			break;
			case 2: // Greimas Actantial Model

			break;
			case 3: // Van Sijll Cinematic Storytelling

			break;
			case 4: // Lohtman Renner Spacial Semantics

			break;
			case 5: // Genette Narrative Discourse

			break;
			case 6: // Stanzel Narrative Situations

			break;
			case 7: // Color temperature
				for (AnalysisMethod analysisMethod : analysisMethodList) {
					analysisMethodSelectList.add(new SelectElement(analysisMethod.getId(), analysisMethod.getColorTemperature().getColorTemperatureTranslations().get(0).getName()));
				}
			break;
			case 8: // Concept Camera Movement and Direction
			
			break;
			case 9: // Camera Elevation
				for (AnalysisMethod analysisMethod : analysisMethodList) {
					analysisMethodSelectList.add(new SelectElement(analysisMethod.getId(), analysisMethod.getCameraElevation().getCameraElevationTranslations().get(0).getName()));
				}
			break;
			case 10: // Camera Axis of Action
				for (AnalysisMethod analysisMethod : analysisMethodList) {
					analysisMethodSelectList.add(new SelectElement(analysisMethod.getId(), analysisMethod.getCameraAxisOfAction().getCameraAxisOfActionTranslations().get(0).getName()));
				}
			break;
			case 11: // Camera Horizontal Angle
				for (AnalysisMethod analysisMethod : analysisMethodList) {
					analysisMethodSelectList.add(new SelectElement(analysisMethod.getId(), analysisMethod.getCameraHorizontalAngle().getCameraHorizontalAngleTranslations().get(0).getName()));
				}
			break;
			case 12: // Camera Vertical Angle
				for (AnalysisMethod analysisMethod : analysisMethodList) {
					analysisMethodSelectList.add(new SelectElement(analysisMethod.getId(), analysisMethod.getCameraVerticalAngle().getCameraVerticalAngleTranslations().get(0).getName()));
				}
			break;
			case 13: // Camera Shot Type
				for (AnalysisMethod analysisMethod : analysisMethodList) {
					analysisMethodSelectList.add(new SelectElement(analysisMethod.getId(), analysisMethod.getCameraShotType().getCameraShotTypeTranslations().get(0).getType()));
				}
			break;
			case 14: // Camera Distance
				for (AnalysisMethod analysisMethod : analysisMethodList) {
					analysisMethodSelectList.add(new SelectElement(analysisMethod.getId(), analysisMethod.getCameraDistance().getCameraDistanceTranslations().get(0).getName()));
				}
			break;
			case 15: // Concept Camera Movement and Handling

			break;
			case 16: // Camera Movement

			break;
			case 17: // Camera Handling
				for (AnalysisMethod analysisMethod : analysisMethodList) {
					analysisMethodSelectList.add(new SelectElement(analysisMethod.getId(), analysisMethod.getCameraHandling().getCameraHandlingTranslations().get(0).getType()));
				}
			break;
			case 18: // Zelizer Beese Voice of the Visual
				for (AnalysisMethod analysisMethod : analysisMethodList) {
					analysisMethodSelectList.add(new SelectElement(analysisMethod.getId(), analysisMethod.getZelizerBeeseVoiceOfTheVisual().getZelizerBeeseVoiceOfTheVisualTranslations().get(0).getType()));
				}
			break;
			case 19: // Barthes Rhetoric of the Image

			break;
			case 20: // Sound Effect Descriptive
				for (AnalysisMethod analysisMethod : analysisMethodList) {
					analysisMethodSelectList.add(new SelectElement(analysisMethod.getId(), "Sound Effect (Descriptive)")); // TODO
				}
			break;
			case 21: // Analysis Ambient Sound
				
			break;
			case 22: // Analysis Music

			break;
			case 23: // Analysis Speech

			break;
			case 24: // Analysis Voice

			break;
			case 25: //? Lighting type

			break;
		}

		return Response.ok().entity(analysisMethodSelectList).build();
	}

	@POST
	@Produces(MediaType.APPLICATION_JSON)
	@Consumes(MediaType.APPLICATION_JSON)
	@Path("{annotationId}/{analysisMethodId}")
	@Secured
	public Response createAnalysis(@PathParam("annotationId") int annotationId,
																 @PathParam("analysisMethodId") int analysisMethodId, 
																 String jsonData) {
		System.out.println("AnalysisServiceEndpoint: createAnalysis: " + jsonData);
		ObjectMapper mapper = new ObjectMapper();
		// mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
		// mapper.configure(SerializationFeature.WRITE_NULL_MAP_VALUES, false);
		Analysis newAnalysis = null;
		EntityManager entityManager = TIMAATApp.emf.createEntityManager();
		Annotation annotation = entityManager.find(Annotation.class, annotationId);
		AnalysisMethod analysisMethod = entityManager.find(AnalysisMethod.class, analysisMethodId);
		
		// parse JSON data
		if (annotation == null) return Response.status(Status.NOT_FOUND).build();
		try {
			newAnalysis = mapper.readValue(jsonData, Analysis.class);
		} catch (IOException e) {
			System.out.println("AnalysisServiceEndpoint: createAnalysis - IOException");
			e.printStackTrace();
			return Response.status(Status.BAD_REQUEST).build();
		}
		if ( newAnalysis == null ) {
			System.out.println("AnalysisServiceEndpoint: createAnalysis - newAnalysis == null");
			return Response.status(Status.BAD_REQUEST).build();
		}

		// sanitize object data
		newAnalysis.setId(0);
		if (analysisMethodId > 0) { // assign pre-existing analysis method
			analysisMethod = entityManager.find(AnalysisMethod.class, analysisMethodId);
		} else if (analysisMethodId == 0) { // create new analysis method
			analysisMethod = new AnalysisMethod();
			AnalysisMethodType analysisMethodType = entityManager.find(AnalysisMethodType.class, newAnalysis.getAnalysisMethod().getAnalysisMethodType().getId());
			analysisMethod.setId(0);
			analysisMethod.setAnalysisMethodType(analysisMethodType);
		} 
		newAnalysis.setAnnotation(annotation);
		newAnalysis.setAnalysisMethod(analysisMethod);
		annotation.addAnalysis(newAnalysis);

		// update log metadata
		// Timestamp creationDate = new Timestamp(System.currentTimeMillis());
		// newAnalysis.setCreatedAt(creationDate);
		// newAnalysis.setLastEditedAt(creationDate);
		// if ( containerRequestContext.getProperty("TIMAAT.userID") != null ) {
		// 	// System.out.println("containerRequestContext.getProperty('TIMAAT.userID') " + containerRequestContext.getProperty("TIMAAT.userID"));
		// 	newAnalysis.setCreatedByUserAccount(entityManager.find(UserAccount.class, containerRequestContext.getProperty("TIMAAT.userID")));
		// 	newAnalysis.setLastEditedByUserAccount((entityManager.find(UserAccount.class, containerRequestContext.getProperty("TIMAAT.userID"))));
		// } else {
		// 	// DEBUG do nothing - production system should abort with internal server error
		// 	return Response.serverError().build();
		// }

		// persist analysis
		EntityTransaction entityTransaction = entityManager.getTransaction();
		entityTransaction.begin();
		entityManager.persist(analysisMethod);
		entityManager.persist(newAnalysis);
		entityManager.flush();
		entityTransaction.commit();
		entityManager.refresh(newAnalysis);
		entityManager.refresh(annotation);

		// add log entry
		// UserLogManager.getLogger().addLogEntry(newAnalysis.getCreatedByUserAccount().getId(), UserLogManager.LogEvents.ANALYSISCREATED);
		System.out.println("AnalysisServiceEndpoint: createAnalysis - done");
		return Response.ok().entity(newAnalysis).build();
	}
	
	@DELETE
	@Produces(MediaType.APPLICATION_JSON)
	@Path("{analysisId}")
	@Secured
	public Response deleteAnalysis(@PathParam("analysisId") int analysisId) {   
		System.out.println("AnalysisServiceEndpoint: deleteAnalysis"); 	
		EntityManager entityManager = TIMAATApp.emf.createEntityManager();

		Analysis analysis = entityManager.find(Analysis.class, analysisId);
		if ( analysis == null ) return Response.status(Status.NOT_FOUND).build();
		Annotation annotation = analysis.getAnnotation();
		if ( annotation.getAnalysis().contains(analysis) == false) return Response.ok().entity(false).build();

		annotation.getAnalysis().remove(analysis);

		EntityTransaction entityTransaction = entityManager.getTransaction();
		entityTransaction.begin();
		entityManager.remove(analysis);
		entityTransaction.commit();
		entityManager.refresh(annotation);
		// add log entry
		// UserLogManager.getLogger()
		// 							.addLogEntry((int) containerRequestContext.getProperty("TIMAAT.userID"), 
		// 														UserLogManager.LogEvents.ANALYSISDELETED);
		System.out.println("AnalysisServiceEndpoint: deleteAnalysis - delete complete");
		return Response.ok().build();
	}

	@DELETE
	@Produces(MediaType.APPLICATION_JSON)
	@Path("analysisAndMethod/{analysisMethodId}")
	@Secured
	public Response deleteAnalysisAndAnalysisMethod(@PathParam("analysisMethodId") int analysisMethodId) {   
		System.out.println("AnalysisServiceEndpoint: deleteAnalysisAndMethod"); 	
		EntityManager entityManager = TIMAATApp.emf.createEntityManager();

		AnalysisMethod analysisMethod = entityManager.find(AnalysisMethod.class, analysisMethodId);
		if ( analysisMethod == null ) return Response.status(Status.NOT_FOUND).build();
		Analysis analysis = analysisMethod.getAnalysis().get(0); //* dynamically created analysis methods will only exist in one analysis
		Annotation annotation = analysis.getAnnotation();
		if ( annotation.getAnalysis().contains(analysis) == false) return Response.ok().entity(false).build();

		// annotation.getAnalysis().remove(analysisMethodId);

		EntityTransaction entityTransaction = entityManager.getTransaction();
		entityTransaction.begin();
		entityManager.remove(analysisMethod);
		entityTransaction.commit();
		entityManager.refresh(annotation);
		// add log entry
		// UserLogManager.getLogger()
		// 							.addLogEntry((int) containerRequestContext.getProperty("TIMAAT.userID"), 
		// 														UserLogManager.LogEvents.ANALYSISDELETED);
		System.out.println("AnalysisServiceEndpoint: deleteAnalysisAndMethod - delete complete");
		return Response.ok().build();
	}

	@POST
	@Produces(MediaType.APPLICATION_JSON)
	@Consumes(MediaType.APPLICATION_JSON)
	@Path("audioPostProduction/{id}")
	@Secured
	public Response createAudioPostProduction(@PathParam("id") int id) {
		System.out.println("AnalysisServiceEndpoint: createAudioPostProduction: ");
		EntityManager entityManager = TIMAATApp.emf.createEntityManager();

		// parse JSON data
		AudioPostProduction audioPostProduction = new AudioPostProduction();

		// sanitize object data
		audioPostProduction.setId(0);

		// persist analysis method
		EntityTransaction entityTransaction = entityManager.getTransaction();
		entityTransaction.begin();
		entityManager.persist(audioPostProduction);
		entityManager.flush();
		entityTransaction.commit();
		entityManager.refresh(audioPostProduction);
		// entityManager.refresh(audioPostProduction.getAnalysisMethod());

		// add log entry
		// UserLogManager.getLogger().addLogEntry(newAnalysis.getCreatedByUserAccount().getId(), UserLogManager.LogEvents.ANALYSISCREATED);
		System.out.println("AnalysisServiceEndpoint: createAudioPostProduction - done");
		return Response.ok().entity(audioPostProduction).build();
	}

	@DELETE
	@Produces(MediaType.APPLICATION_JSON)
	@Path("audioPostProduction/{id}")
	@Secured
	public Response deleteAudioPostProduction(@PathParam("id") int id) {
		System.out.println("AnalysisServiceEndpoint: deleteAudioPostProduction");
		EntityManager entityManager = TIMAATApp.emf.createEntityManager();
		AudioPostProduction audioPostProduction = entityManager.find(AudioPostProduction.class, id);

		if ( audioPostProduction == null ) return Response.status(Status.NOT_FOUND).build();

		EntityTransaction entityTransaction = entityManager.getTransaction();
		entityTransaction.begin();
		entityManager.remove(audioPostProduction);
		//* ON DELETE CASCADE deletes connected audio_post_production_translation entries
		entityTransaction.commit();
		
		// add log entry
		// UserLogManager.getLogger()
		// 							.addLogEntry((int) containerRequestContext
		// 							.getProperty("TIMAAT.userID"), UserLogManager.LogEvents.ROLEDELETED);
		System.out.println("AnalysisServiceEndpoint: deleteAudioPostProduction - delete complete");	
		return Response.ok().build();
	}

	@POST
	@Produces(MediaType.APPLICATION_JSON)
	@Consumes(MediaType.APPLICATION_JSON)
	@Path("audioPostProduction/{id}/translation")
	@Secured
	public Response createAudioPostProductionTranslation(@PathParam("id") int id, 
																											 String jsonData) {
		System.out.println("AnalysisServiceEndpoint: createAudioPostProductionTranslation: " + jsonData);
		ObjectMapper mapper = new ObjectMapper();
		AudioPostProductionTranslation audioPostProductionTranslation = null;
		EntityManager entityManager = TIMAATApp.emf.createEntityManager();

		// parse JSON data
		try {
			audioPostProductionTranslation = mapper.readValue(jsonData, AudioPostProductionTranslation.class);
		} catch (IOException e) {
			System.out.println("AnalysisServiceEndpoint: createAudioPostProductionTranslation: IOException e !");
			e.printStackTrace();
			return Response.status(Status.BAD_REQUEST).build();
		}
		if ( audioPostProductionTranslation == null ) {
			System.out.println("AnalysisServiceEndpoint: createAudioPostProductionTranslation: newAudio == null !");
			return Response.status(Status.BAD_REQUEST).build();
		}

		// sanitize object data
		audioPostProductionTranslation.setId(0);
		Language language = entityManager.find(Language.class, audioPostProductionTranslation.getLanguage().getId());
		audioPostProductionTranslation.setLanguage(language);
		AudioPostProduction audioPostProduction = entityManager.find(AudioPostProduction.class, id);
		audioPostProductionTranslation.setAudioPostProduction(audioPostProduction);

		// update log metadata
		// Timestamp creationDate = new Timestamp(System.currentTimeMillis());
		// newAnalysis.setCreatedAt(creationDate);
		// newAnalysis.setLastEditedAt(creationDate);
		// if ( containerRequestContext.getProperty("TIMAAT.userID") != null ) {
		// 	// System.out.println("containerRequestContext.getProperty('TIMAAT.userID') " + containerRequestContext.getProperty("TIMAAT.userID"));
		// 	newAnalysis.setCreatedByUserAccount(entityManager.find(UserAccount.class, containerRequestContext.getProperty("TIMAAT.userID")));
		// 	newAnalysis.setLastEditedByUserAccount((entityManager.find(UserAccount.class, containerRequestContext.getProperty("TIMAAT.userID"))));
		// } else {
		// 	// DEBUG do nothing - production system should abort with internal server error
		// 	return Response.serverError().build();
		// }

		// persist analysis method
		EntityTransaction entityTransaction = entityManager.getTransaction();
		entityTransaction.begin();
		entityManager.persist(language);
		entityManager.persist(audioPostProductionTranslation);
		entityManager.flush();
		audioPostProductionTranslation.setLanguage(language);
		audioPostProductionTranslation.setAudioPostProduction(audioPostProduction);
		entityTransaction.commit();
		entityManager.refresh(audioPostProductionTranslation);
		entityManager.refresh(language);
		entityManager.refresh(audioPostProduction);
		// entityManager.refresh(audioPostProduction.getAnalysisMethod());

		// add log entry
		// UserLogManager.getLogger().addLogEntry(newAnalysis.getCreatedByUserAccount().getId(), UserLogManager.LogEvents.ANALYSISCREATED);
		System.out.println("AnalysisServiceEndpoint: createAudioPostProductionTranslation - done");
		return Response.ok().entity(audioPostProductionTranslation).build();
	}

	@POST
	@Produces(MediaType.APPLICATION_JSON)
	@Consumes(MediaType.APPLICATION_JSON)
	@Path("analysisSpeech/{analysisMethodId}")
	@Secured
	public Response createAnalysisMethodAnalysisSpeech(@PathParam("analysisMethodId") int analysisMethodId, 
																										 String jsonData) {
		System.out.println("AnalysisServiceEndpoint: createAnalysisMethodAnalysisSpeech: " + jsonData);
		ObjectMapper mapper = new ObjectMapper();
		// mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
		// mapper.configure(SerializationFeature.WRITE_NULL_MAP_VALUES, false);
		AnalysisSpeech analysisSpeech = null;
		EntityManager entityManager = TIMAATApp.emf.createEntityManager();

		// parse JSON data
		try {
			analysisSpeech = mapper.readValue(jsonData, AnalysisSpeech.class);
		} catch (IOException e) {
			System.out.println("AnalysisServiceEndpoint: createAnalysisMethodAnalysisSpeech: IOException e !");
			e.printStackTrace();
			return Response.status(Status.BAD_REQUEST).build();
		}
		if ( analysisSpeech == null ) {
			System.out.println("AnalysisServiceEndpoint: createAnalysisMethodAnalysisSpeech: newAudio == null !");
			return Response.status(Status.BAD_REQUEST).build();
		}

		// sanitize object data

		// update log metadata
		// Timestamp creationDate = new Timestamp(System.currentTimeMillis());
		// newAnalysis.setCreatedAt(creationDate);
		// newAnalysis.setLastEditedAt(creationDate);
		// if ( containerRequestContext.getProperty("TIMAAT.userID") != null ) {
		// 	// System.out.println("containerRequestContext.getProperty('TIMAAT.userID') " + containerRequestContext.getProperty("TIMAAT.userID"));
		// 	newAnalysis.setCreatedByUserAccount(entityManager.find(UserAccount.class, containerRequestContext.getProperty("TIMAAT.userID")));
		// 	newAnalysis.setLastEditedByUserAccount((entityManager.find(UserAccount.class, containerRequestContext.getProperty("TIMAAT.userID"))));
		// } else {
		// 	// DEBUG do nothing - production system should abort with internal server error
		// 	return Response.serverError().build();
		// }

		// persist analysis method
		EntityTransaction entityTransaction = entityManager.getTransaction();
		entityTransaction.begin();
		entityManager.persist(analysisSpeech);
		entityManager.flush();
		entityTransaction.commit();
		entityManager.refresh(analysisSpeech);
		entityManager.refresh(analysisSpeech.getAnalysisMethod());

		// add log entry
		// UserLogManager.getLogger().addLogEntry(newAnalysis.getCreatedByUserAccount().getId(), UserLogManager.LogEvents.ANALYSISCREATED);
		System.out.println("AnalysisServiceEndpoint: createAnalysisMethodAnalysisSpeech - done");
		return Response.ok().entity(analysisSpeech).build();
	}
	
	@POST
	@Produces(MediaType.APPLICATION_JSON)
	@Consumes(MediaType.APPLICATION_JSON)
	@Path("soundEffectDescriptive/{analysisMethodId}")
	@Secured
	public Response createAnalysisMethodSoundEffectDescriptive(@PathParam("analysisMethodId") int analysisMethodId, 
																														 String jsonData) {
		System.out.println("AnalysisServiceEndpoint: createAnalysisMethodSoundEffectDescriptive: " + jsonData);
		ObjectMapper mapper = new ObjectMapper();
		// mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
		// mapper.configure(SerializationFeature.WRITE_NULL_MAP_VALUES, false);
		SoundEffectDescriptive soundEffectDescriptive = null;
		EntityManager entityManager = TIMAATApp.emf.createEntityManager();

		// parse JSON data
		try {
			soundEffectDescriptive = mapper.readValue(jsonData, SoundEffectDescriptive.class);
		} catch (IOException e) {
			System.out.println("AnalysisServiceEndpoint: createAnalysisMethodSoundEffectDescriptive: IOException e !");
			e.printStackTrace();
			return Response.status(Status.BAD_REQUEST).build();
		}
		if ( soundEffectDescriptive == null ) {
			System.out.println("AnalysisServiceEndpoint: createAnalysisMethodSoundEffectDescriptive: newAudio == null !");
			return Response.status(Status.BAD_REQUEST).build();
		}

		// sanitize object data

		// update log metadata
		// Timestamp creationDate = new Timestamp(System.currentTimeMillis());
		// newAnalysis.setCreatedAt(creationDate);
		// newAnalysis.setLastEditedAt(creationDate);
		// if ( containerRequestContext.getProperty("TIMAAT.userID") != null ) {
		// 	// System.out.println("containerRequestContext.getProperty('TIMAAT.userID') " + containerRequestContext.getProperty("TIMAAT.userID"));
		// 	newAnalysis.setCreatedByUserAccount(entityManager.find(UserAccount.class, containerRequestContext.getProperty("TIMAAT.userID")));
		// 	newAnalysis.setLastEditedByUserAccount((entityManager.find(UserAccount.class, containerRequestContext.getProperty("TIMAAT.userID"))));
		// } else {
		// 	// DEBUG do nothing - production system should abort with internal server error
		// 	return Response.serverError().build();
		// }

		// persist analysis method
		EntityTransaction entityTransaction = entityManager.getTransaction();
		entityTransaction.begin();
		entityManager.persist(soundEffectDescriptive);
		entityManager.flush();
		entityTransaction.commit();
		entityManager.refresh(soundEffectDescriptive);
		entityManager.refresh(soundEffectDescriptive.getAnalysisMethod());

		// add log entry
		// UserLogManager.getLogger().addLogEntry(newAnalysis.getCreatedByUserAccount().getId(), UserLogManager.LogEvents.ANALYSISCREATED);
		System.out.println("AnalysisServiceEndpoint: createAnalysisMethodSoundEffectDescriptive - done");
		return Response.ok().entity(soundEffectDescriptive).build();
	}
	
  public static <T> List<T> castList(Class<? extends T> clazz, Collection<?> c) {
    List<T> r = new ArrayList<T>(c.size());
    for(Object o: c)
      r.add(clazz.cast(o));
    return r;
}

}
