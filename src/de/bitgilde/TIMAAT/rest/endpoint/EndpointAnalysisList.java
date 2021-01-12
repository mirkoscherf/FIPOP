package de.bitgilde.TIMAAT.rest.endpoint;

import java.io.IOException;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import javax.persistence.EntityManager;
import javax.persistence.EntityTransaction;
import javax.servlet.ServletContext;
import javax.ws.rs.Consumes;
import javax.ws.rs.DELETE;
import javax.ws.rs.GET;
import javax.ws.rs.PATCH;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.container.ContainerRequestContext;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.UriInfo;
import javax.ws.rs.core.Response.Status;

import org.jvnet.hk2.annotations.Service;

import com.fasterxml.jackson.databind.ObjectMapper;

import de.bitgilde.TIMAAT.TIMAATApp;
import de.bitgilde.TIMAAT.model.FIPOP.AnalysisAction;
import de.bitgilde.TIMAAT.model.FIPOP.AnalysisActionTranslation;
import de.bitgilde.TIMAAT.model.FIPOP.AnalysisScene;
import de.bitgilde.TIMAAT.model.FIPOP.AnalysisSceneTranslation;
import de.bitgilde.TIMAAT.model.FIPOP.AnalysisSegment;
import de.bitgilde.TIMAAT.model.FIPOP.AnalysisSequence;
import de.bitgilde.TIMAAT.model.FIPOP.AnalysisSequenceTranslation;
import de.bitgilde.TIMAAT.model.FIPOP.AnalysisTake;
import de.bitgilde.TIMAAT.model.FIPOP.AnalysisTakeTranslation;
import de.bitgilde.TIMAAT.model.FIPOP.Annotation;
import de.bitgilde.TIMAAT.model.FIPOP.Category;
import de.bitgilde.TIMAAT.model.FIPOP.CategorySet;
import de.bitgilde.TIMAAT.model.FIPOP.CategorySetHasCategory;
import de.bitgilde.TIMAAT.model.FIPOP.Language;
import de.bitgilde.TIMAAT.model.FIPOP.Medium;
import de.bitgilde.TIMAAT.model.FIPOP.MediumAnalysisList;
import de.bitgilde.TIMAAT.model.FIPOP.MediumAnalysisListTranslation;
import de.bitgilde.TIMAAT.model.FIPOP.Tag;
import de.bitgilde.TIMAAT.model.FIPOP.UserAccount;
import de.bitgilde.TIMAAT.notification.NotificationWebSocket;
import de.bitgilde.TIMAAT.rest.Secured;
import de.bitgilde.TIMAAT.security.UserLogManager;

/**
*
* @author Jens-Martin Loebel <loebel@bitgilde.de>
*/

@Service
@Path("/analysislist")
public class EndpointAnalysisList {

	@Context
	private UriInfo uriInfo;
	@Context
	ContainerRequestContext crc;
	@Context
	ServletContext ctx;

	@GET
	@Produces(MediaType.APPLICATION_JSON)
	@Secured
	@Path("{id}/hasTagList")
	public Response getMediumAnalysisListTagList(@PathParam("id") Integer id)
	{
		System.out.println("EndpointAnalysisList: getTagList");
		EntityManager entityManager = TIMAATApp.emf.createEntityManager();
		MediumAnalysisList mediumAnalysisList = entityManager.find(MediumAnalysisList.class, id);
		if ( mediumAnalysisList == null ) return Response.status(Status.NOT_FOUND).build();
		entityManager.refresh(mediumAnalysisList);
		return Response.ok().entity(mediumAnalysisList.getTags()).build();
	}

	@GET
	@Produces(MediaType.APPLICATION_JSON)
	@Secured
	@Path("{id}/categorySet/list")
	public Response getCategorySetList(@PathParam("id") Integer id)
	{
		System.out.println("EndpointAnalysisList: getCategorySetList - ID: "+ id);
		EntityManager entityManager = TIMAATApp.emf.createEntityManager();
		MediumAnalysisList mediumAnalysisList = entityManager.find(MediumAnalysisList.class, id);
		List<CategorySet> categorySetList = mediumAnalysisList.getCategorySets();

		return Response.ok().entity(categorySetList).build();
	}

	@POST
	@Produces(MediaType.APPLICATION_JSON)
	@Consumes(MediaType.APPLICATION_JSON)
	@Secured
	@Path("medium/{mediumId}")
	public Response createAnalysisList(@PathParam("mediumId") int mediumId, String jsonData) {
		ObjectMapper mapper = new ObjectMapper();
		MediumAnalysisList newList = null;    	
    	EntityManager entityManager = TIMAATApp.emf.createEntityManager();
    	Medium m = entityManager.find(Medium.class, mediumId);
    	if ( m == null ) return Response.status(Status.NOT_FOUND).build();		
    	// parse JSON data
		try {
			newList = mapper.readValue(jsonData, MediumAnalysisList.class);
		} catch (IOException e) {
			e.printStackTrace();
			return Response.status(Status.BAD_REQUEST).build();
		}
		if ( newList == null ) return Response.status(Status.BAD_REQUEST).build();
		// sanitize object data
		newList.setId(0);
		newList.setMedium(m);
		// update log metadata
		newList.setCreatedAt(new Timestamp(System.currentTimeMillis()));
		if ( crc.getProperty("TIMAAT.userID") != null ) {
			newList.setCreatedByUserAccount(entityManager.find(UserAccount.class, crc.getProperty("TIMAAT.userID")));
		} else {
			// DEBUG do nothing - production system should abort with internal server error		
			return Response.serverError().build();
		}
		newList.setAnalysisSegments(new ArrayList<AnalysisSegment>());
		newList.setAnnotations(new ArrayList<Annotation>());
		newList.getMediumAnalysisListTranslations().get(0).setId(0);
		newList.getMediumAnalysisListTranslations().get(0).setLanguage(entityManager.find(Language.class, 1));
		newList.getMediumAnalysisListTranslations().get(0).setMediumAnalysisList(newList);
		// persist analysislist and polygons
		EntityTransaction entityTransaction = entityManager.getTransaction();
		entityTransaction.begin();
		entityManager.persist(newList.getMediumAnalysisListTranslations().get(0));
		entityManager.persist(newList);
		m.addMediumAnalysisList(newList);
		entityManager.persist(m);
		entityManager.flush();
		entityTransaction.commit();
		entityManager.refresh(newList);
		entityManager.refresh(m);
		
		// add log entry
		UserLogManager.getLogger().addLogEntry(newList.getCreatedByUserAccount().getId(), UserLogManager.LogEvents.ANALYSISLISTCREATED);
		
		return Response.ok().entity(newList).build();
	}

	@PATCH
	@Produces(MediaType.APPLICATION_JSON)
	@Consumes(MediaType.APPLICATION_JSON)
	@Path("{id}")
	@Secured
	public Response updateAnalysisList(@PathParam("id") int id, String jsonData) {
		System.out.println("EndpointAnalysisList: updateAnalysisList "+ jsonData);
		ObjectMapper mapper = new ObjectMapper();
		MediumAnalysisList updatedList = null;

		EntityManager entityManager = TIMAATApp.emf.createEntityManager();
		MediumAnalysisList mediumAnalysisList = entityManager.find(MediumAnalysisList.class, id);
		if ( mediumAnalysisList == null ) return Response.status(Status.NOT_FOUND).build();
		
    // parse JSON data
		try {
			updatedList = mapper.readValue(jsonData, MediumAnalysisList.class);
		} catch (IOException e) {
			System.out.println(e);
			return Response.status(Status.BAD_REQUEST).build();
		}
		if ( updatedList == null ) return Response.notModified().build();
		    	
    	// update analysislist
		if ( updatedList.getMediumAnalysisListTranslations() != null )
			for ( MediumAnalysisListTranslation trans : updatedList.getMediumAnalysisListTranslations() ) {
				mediumAnalysisList.setTitle(trans.getTitle(), trans.getLanguage().getCode());
				mediumAnalysisList.setText(trans.getText(), trans.getLanguage().getCode());
			}
		List<CategorySet> oldCategorySets = mediumAnalysisList.getCategorySets();
		mediumAnalysisList.setCategorySets(updatedList.getCategorySets());
		List<Tag> oldTags = mediumAnalysisList.getTags();
		mediumAnalysisList.setTags(updatedList.getTags());
		
		// TODO update log metadata in general log
		
		EntityTransaction entityTransaction = entityManager.getTransaction();
		entityTransaction.begin();
		entityManager.merge(mediumAnalysisList);
		entityManager.persist(mediumAnalysisList);
		entityTransaction.commit();
		entityManager.refresh(mediumAnalysisList);
		for (CategorySet categorySet : mediumAnalysisList.getCategorySets()) {
			entityManager.refresh(categorySet);
		}
		for (CategorySet categorySet : oldCategorySets) {
			entityManager.refresh(categorySet);
		}
		for (Tag tag : mediumAnalysisList.getTags()) {
			entityManager.refresh(tag);
		}
		for (Tag tag : oldTags) {
			entityManager.refresh(tag);
		}


		// add log entry
		UserLogManager.getLogger().addLogEntry((int) crc.getProperty("TIMAAT.userID"), UserLogManager.LogEvents.ANALYSISLISTEDITED);

		return Response.ok().entity(mediumAnalysisList).build();
	}

	@DELETE
	@Produces(MediaType.APPLICATION_JSON)
	@Path("{id}")
	@Secured
	public Response deleteAnalysisList(@PathParam("id") int id) {
    	
    	EntityManager entityManager = TIMAATApp.emf.createEntityManager();
    	MediumAnalysisList mediumAnalysisList = entityManager.find(MediumAnalysisList.class, id);
    	if ( mediumAnalysisList == null ) return Response.status(Status.NOT_FOUND).build();
		
		EntityTransaction entityTransaction = entityManager.getTransaction();
		entityTransaction.begin();
		// remove all associated annotations
		for (Annotation anno : mediumAnalysisList.getAnnotations()) entityManager.remove(anno);
		mediumAnalysisList.getAnnotations().clear();
		// remove all associated segments
		for (AnalysisSegment segment : mediumAnalysisList.getAnalysisSegments()) entityManager.remove(segment);
		mediumAnalysisList.getAnalysisSegments().clear();
		entityManager.remove(mediumAnalysisList);
		entityTransaction.commit();

		// add log entry
		UserLogManager.getLogger().addLogEntry((int) crc.getProperty("TIMAAT.userID"), UserLogManager.LogEvents.ANALYSISLISTDELETED);

		return Response.ok().build();
	}

	@POST
	@Produces(MediaType.APPLICATION_JSON)
	@Consumes(MediaType.APPLICATION_JSON)
	@Secured
	@Path("{analysisListId}/segment")
	public Response createAnalysisSegment(@PathParam("analysisListId") int analysisListId, String jsonData) {
		ObjectMapper mapper = new ObjectMapper();
		AnalysisSegment newSegment = null;    	
		EntityManager entityManager = TIMAATApp.emf.createEntityManager();
		MediumAnalysisList mediumAnalysisList = entityManager.find(MediumAnalysisList.class, analysisListId);
		if ( mediumAnalysisList == null ) return Response.status(Status.NOT_FOUND).build();	
		// parse JSON data
		try {
			newSegment = mapper.readValue(jsonData, AnalysisSegment.class);
		} catch (IOException e) {
			e.printStackTrace();
			return Response.status(Status.BAD_REQUEST).build();
		}
		if ( newSegment == null ) return Response.status(Status.BAD_REQUEST).build();
		
		// sanitize object data
		newSegment.setId(0);
		mediumAnalysisList.addAnalysisSegment(newSegment);
		newSegment.getAnalysisSegmentTranslations().get(0).setId(0);
		newSegment.getAnalysisSegmentTranslations().get(0).setAnalysisSegment(newSegment);
		newSegment.getAnalysisSegmentTranslations().get(0).setLanguage(entityManager.find(Language.class, 1));
		
		// persist analysissegment and list
		EntityTransaction entityTransaction = entityManager.getTransaction();
		entityTransaction.begin();
		entityManager.persist(newSegment.getAnalysisSegmentTranslations().get(0));
		entityManager.persist(newSegment);
		entityManager.flush();
		newSegment.setMediumAnalysisList(mediumAnalysisList);
		entityManager.persist(mediumAnalysisList);
		entityTransaction.commit();
		entityManager.refresh(newSegment);
		entityManager.refresh(mediumAnalysisList);		

		// add log entry
		UserLogManager.getLogger().addLogEntry((int) crc.getProperty("TIMAAT.userID"),
																					 UserLogManager.LogEvents.ANALYSISSEGMENTCREATED);

		// send notification action
		NotificationWebSocket.notifyUserAction((String) crc.getProperty("TIMAAT.userName"),
																					 "add-segment",
																					 newSegment.getMediumAnalysisList().getId(),
																					 newSegment);

		return Response.ok().entity(newSegment).build();
	}
	
	@PATCH
	@Produces(MediaType.APPLICATION_JSON)
	@Consumes(MediaType.APPLICATION_JSON)
	@Path("segment/{id}")
	@Secured
	public Response updateAnalysisSegment(@PathParam("id") int id, String jsonData) {
		System.out.println("EndpointAnalysisList: updateAnalysisSegment "+ jsonData);
		ObjectMapper mapper = new ObjectMapper();
		AnalysisSegment updatedSegment = null;

    	
    	EntityManager entityManager = TIMAATApp.emf.createEntityManager();
    	AnalysisSegment analysisSegment = entityManager.find(AnalysisSegment.class, id);
    	if ( analysisSegment == null ) return Response.status(Status.NOT_FOUND).build();
		
    	// parse JSON data
		try {
			updatedSegment = mapper.readValue(jsonData, AnalysisSegment.class);
		} catch (IOException e) {
			return Response.status(Status.BAD_REQUEST).build();
		}
		if ( updatedSegment == null ) return Response.notModified().build();
		    	
    	// update analysislist
		if ( updatedSegment.getAnalysisSegmentTranslations().get(0).getTitle() != null ) analysisSegment.getAnalysisSegmentTranslations().get(0).setTitle(updatedSegment.getAnalysisSegmentTranslations().get(0).getTitle());
		if ( updatedSegment.getAnalysisSegmentTranslations().get(0).getShortDescription() != null ) analysisSegment.getAnalysisSegmentTranslations().get(0).setShortDescription(updatedSegment.getAnalysisSegmentTranslations().get(0).getShortDescription());
		if ( updatedSegment.getAnalysisSegmentTranslations().get(0).getComment() != null ) analysisSegment.getAnalysisSegmentTranslations().get(0).setComment(updatedSegment.getAnalysisSegmentTranslations().get(0).getComment());
		analysisSegment.setSegmentStartTime(updatedSegment.getSegmentStartTime());
		analysisSegment.setSegmentEndTime(updatedSegment.getSegmentEndTime());
				
		EntityTransaction entityTransaction = entityManager.getTransaction();
		entityTransaction.begin();
		entityManager.merge(analysisSegment);
		entityManager.persist(analysisSegment);
		entityTransaction.commit();
		entityManager.refresh(analysisSegment);

		// add log entry
		UserLogManager.getLogger().addLogEntry((int) crc.getProperty("TIMAAT.userID"),
																					 UserLogManager.LogEvents.ANALYSISSEGMENTEDITED);
		// send notification action
		NotificationWebSocket.notifyUserAction((String) crc.getProperty("TIMAAT.userName"),
																					 "edit-segment",
																					 analysisSegment.getMediumAnalysisList().getId(),
																					 analysisSegment);
		
		return Response.ok().entity(analysisSegment).build();
	}

	@DELETE
  @Produces(MediaType.APPLICATION_JSON)
	@Path("segment/{id}")
	@Secured
	public Response deleteAnalysisSegment(@PathParam("id") int id) {
    	
    	EntityManager entityManager = TIMAATApp.emf.createEntityManager();
    	AnalysisSegment analysisSegment = entityManager.find(AnalysisSegment.class, id);
    	if ( analysisSegment == null ) return Response.status(Status.NOT_FOUND).build();
		
    	MediumAnalysisList mediumAnalysisList = analysisSegment.getMediumAnalysisList();
		EntityTransaction entityTransaction = entityManager.getTransaction();
		entityTransaction.begin();
		entityManager.remove(analysisSegment);
		entityTransaction.commit();
		entityManager.refresh(mediumAnalysisList);
		
		// add log entry
		UserLogManager.getLogger().addLogEntry((int) crc.getProperty("TIMAAT.userID"),
																					 UserLogManager.LogEvents.ANALYSISSEGMENTDELETED);

		// send notification action
		NotificationWebSocket.notifyUserAction((String) crc.getProperty("TIMAAT.userName"),
																					 "remove-segment",
																					 mediumAnalysisList.getId(),
																					 analysisSegment);

		return Response.ok().build();
	}

	@POST
	@Produces(MediaType.APPLICATION_JSON)
	@Consumes(MediaType.APPLICATION_JSON)
	@Secured
	@Path("{segmentId}/sequence")
	public Response createAnalysisSequence(@PathParam("segmentId") int segmentId, String jsonData) {
		ObjectMapper mapper = new ObjectMapper();
		AnalysisSequence newSequence = null;
		EntityManager entityManager = TIMAATApp.emf.createEntityManager();
		AnalysisSegment analysisSegment = entityManager.find(AnalysisSegment.class, segmentId);
		if ( analysisSegment == null ) return Response.status(Status.NOT_FOUND).build();	
		// parse JSON data
		try {
			newSequence = mapper.readValue(jsonData, AnalysisSequence.class);
		} catch (IOException e) {
			e.printStackTrace();
			return Response.status(Status.BAD_REQUEST).build();
		}
		if ( newSequence == null ) return Response.status(Status.BAD_REQUEST).build();
		
		// sanitize object data
		newSequence.setId(0);
		analysisSegment.addAnalysisSequence(newSequence);
		
		// persist analysissequence and list
		EntityTransaction entityTransaction = entityManager.getTransaction();
		entityTransaction.begin();
		entityManager.persist(newSequence);
		entityManager.flush();
		newSequence.setAnalysisSegment(analysisSegment);
		entityManager.persist(analysisSegment);
		entityTransaction.commit();
		entityManager.refresh(newSequence);
		entityManager.refresh(analysisSegment);

		// add log entry
		UserLogManager.getLogger().addLogEntry((int) crc.getProperty("TIMAAT.userID"),
																					 UserLogManager.LogEvents.ANALYSISSEQUENCECREATED);

		// send notification action
		NotificationWebSocket.notifyUserAction((String) crc.getProperty("TIMAAT.userName"),
																					 "add-sequence",
																					 newSequence.getAnalysisSegment().getId(),
																					 newSequence);

		return Response.ok().entity(newSequence).build();
	}
	
	@PATCH
	@Produces(MediaType.APPLICATION_JSON)
	@Consumes(MediaType.APPLICATION_JSON)
	@Path("sequence/{id}")
	@Secured
	public Response updateAnalysisSequence(@PathParam("id") int id, String jsonData) {
		ObjectMapper mapper = new ObjectMapper();
		AnalysisSequence updatedSequence = null;

		EntityManager entityManager = TIMAATApp.emf.createEntityManager();
		AnalysisSequence analysisSequence = entityManager.find(AnalysisSequence.class, id);
		if ( analysisSequence == null ) return Response.status(Status.NOT_FOUND).build();
	
		// parse JSON data
		try {
			updatedSequence = mapper.readValue(jsonData, AnalysisSequence.class);
		} catch (IOException e) {
			return Response.status(Status.BAD_REQUEST).build();
		}
		if ( updatedSequence == null ) return Response.notModified().build();
		    	
    // update analysislist
		analysisSequence.setStartTime(updatedSequence.getStartTime());
		analysisSequence.setEndTime(updatedSequence.getEndTime());
				
		EntityTransaction entityTransaction = entityManager.getTransaction();
		entityTransaction.begin();
		entityManager.merge(analysisSequence);
		entityManager.persist(analysisSequence);
		entityTransaction.commit();
		entityManager.refresh(analysisSequence);

		// add log entry
		UserLogManager.getLogger().addLogEntry((int) crc.getProperty("TIMAAT.userID"),
																					 UserLogManager.LogEvents.ANALYSISSEQUENCEEDITED);
		// send notification action
		NotificationWebSocket.notifyUserAction((String) crc.getProperty("TIMAAT.userName"),
																					 "edit-sequence",
																					 analysisSequence.getAnalysisSegment().getId(),
																					 analysisSequence);
		
		return Response.ok().entity(analysisSequence).build();
	}

	@DELETE
  @Produces(MediaType.APPLICATION_JSON)
	@Path("sequence/{id}")
	@Secured
	public Response deleteAnalysisSequence(@PathParam("id") int id) {
    	
		EntityManager entityManager = TIMAATApp.emf.createEntityManager();
		AnalysisSequence analysisSequence = entityManager.find(AnalysisSequence.class, id);
		if ( analysisSequence == null ) return Response.status(Status.NOT_FOUND).build();
	
		AnalysisSegment analysisSegment = analysisSequence.getAnalysisSegment();
		EntityTransaction entityTransaction = entityManager.getTransaction();
		entityTransaction.begin();
		entityManager.remove(analysisSequence);
		entityTransaction.commit();
		entityManager.refresh(analysisSegment);
		
		// add log entry
		UserLogManager.getLogger().addLogEntry((int) crc.getProperty("TIMAAT.userID"),
																					 UserLogManager.LogEvents.ANALYSISSEQUENCEDELETED);

		// send notification action
		NotificationWebSocket.notifyUserAction((String) crc.getProperty("TIMAAT.userName"),
																					 "remove-sequence",
																					 analysisSegment.getId(),
																					 analysisSequence);

		return Response.ok().build();
	}

	@POST
	@Produces(MediaType.APPLICATION_JSON)
	@Consumes(MediaType.APPLICATION_JSON)
	@Secured
	@Path("sequence/{sequence_id}/translation")
	public Response createAnalysisSequenceTranslation(@PathParam("sequence_id") int sequenceId,
																										String jsonData) {
		ObjectMapper mapper = new ObjectMapper();
		AnalysisSequenceTranslation newTranslation = null;
		EntityManager entityManager = TIMAATApp.emf.createEntityManager();
		AnalysisSequence analysisSequence = entityManager.find(AnalysisSequence.class, sequenceId);

		if ( analysisSequence == null ) return Response.status(Status.NOT_FOUND).build();	
		// parse JSON data
		try {
			newTranslation = mapper.readValue(jsonData, AnalysisSequenceTranslation.class);
		} catch (IOException e) {
			e.printStackTrace();
			return Response.status(Status.BAD_REQUEST).build();
		}
		if ( newTranslation == null ) return Response.status(Status.BAD_REQUEST).build();
		
		// sanitize object data
		newTranslation.setId(0);
		newTranslation.setAnalysisSequence(analysisSequence);
		Language language = entityManager.find(Language.class, newTranslation.getLanguage().getId());
		newTranslation.setLanguage(language);
		analysisSequence.addAnalysisSequenceTranslation(newTranslation);
		
		// persist analysissequence and list
		EntityTransaction entityTransaction = entityManager.getTransaction();
		entityTransaction.begin();
		entityManager.persist(newTranslation);
		entityManager.flush();
		newTranslation.setAnalysisSequence(analysisSequence);
		entityManager.persist(analysisSequence);
		entityTransaction.commit();
		entityManager.refresh(newTranslation);
		entityManager.refresh(analysisSequence);

		// add log entry
		UserLogManager.getLogger().addLogEntry((int) crc.getProperty("TIMAAT.userID"),
																					 UserLogManager.LogEvents.ANALYSISSEQUENCECREATED);

		// send notification action
		NotificationWebSocket.notifyUserAction((String) crc.getProperty("TIMAAT.userName"),
																					 "add-sequence-translation",
																					 newTranslation.getAnalysisSequence().getId(),
																					 newTranslation);

		return Response.ok().entity(newTranslation).build();
	}
	
	@PATCH
	@Produces(MediaType.APPLICATION_JSON)
	@Consumes(MediaType.APPLICATION_JSON)
	@Path("sequence/translation/{translation_id}")
	@Secured
	public Response updateAnalysisSequenceTranslation(@PathParam("translation_id") int translationId,
																										String jsonData) {
		ObjectMapper mapper = new ObjectMapper();
		AnalysisSequenceTranslation updatedTranslation = null;
		EntityManager entityManager = TIMAATApp.emf.createEntityManager();
		AnalysisSequenceTranslation analysisSequenceTranslation = entityManager.find(AnalysisSequenceTranslation.class, translationId);

		if ( analysisSequenceTranslation == null ) return Response.status(Status.NOT_FOUND).build();	
		// parse JSON data
		try {
			updatedTranslation = mapper.readValue(jsonData, AnalysisSequenceTranslation.class);
		} catch (IOException e) {
			return Response.status(Status.BAD_REQUEST).build();
		}
		if ( updatedTranslation == null ) return Response.notModified().build();
		    	
    	// update analysislist
		if ( updatedTranslation.getName() != null ) analysisSequenceTranslation.setName(updatedTranslation.getName());
		if ( updatedTranslation.getShortDescription() != null ) analysisSequenceTranslation.setShortDescription(updatedTranslation.getShortDescription());
		if ( updatedTranslation.getComment() != null ) analysisSequenceTranslation.setComment(updatedTranslation.getComment());
		if ( updatedTranslation.getTranscript() != null ) analysisSequenceTranslation.setTranscript(updatedTranslation.getTranscript());
				
		EntityTransaction entityTransaction = entityManager.getTransaction();
		entityTransaction.begin();
		entityManager.merge(analysisSequenceTranslation);
		entityManager.persist(analysisSequenceTranslation);
		entityTransaction.commit();
		entityManager.refresh(analysisSequenceTranslation);

		// add log entry
		// UserLogManager.getLogger().addLogEntry((int) crc.getProperty("TIMAAT.userID"), UserLogManager.LogEvents.ANALYSISSEQUENCEEDITED);

		// send notification action
		NotificationWebSocket.notifyUserAction((String) crc.getProperty("TIMAAT.userName"), "edit-sequence", analysisSequenceTranslation.getAnalysisSequence().getId(), analysisSequenceTranslation);
		
		return Response.ok().entity(analysisSequenceTranslation).build();
	}

	@DELETE
  @Produces(MediaType.APPLICATION_JSON)
	@Path("sequence/translation/{translation_id}")
	@Secured
	public Response deleteAnalysisSequenceTranslation(@PathParam("translation_id") int translationId,
																										String jsonData) {
    	
		EntityManager entityManager = TIMAATApp.emf.createEntityManager();
		AnalysisSequenceTranslation analysisSequenceTranslation = entityManager.find(AnalysisSequenceTranslation.class, translationId);

		if ( analysisSequenceTranslation == null ) return Response.status(Status.NOT_FOUND).build();
	
		AnalysisSequence analysisSequence = analysisSequenceTranslation.getAnalysisSequence();
		EntityTransaction entityTransaction = entityManager.getTransaction();
		entityTransaction.begin();
		entityManager.remove(analysisSequenceTranslation);
		entityTransaction.commit();
		entityManager.refresh(analysisSequence);
		
		// add log entry
		UserLogManager.getLogger().addLogEntry((int) crc.getProperty("TIMAAT.userID"), UserLogManager.LogEvents.ANALYSISSEQUENCEDELETED);

		// send notification action
		NotificationWebSocket.notifyUserAction((String) crc.getProperty("TIMAAT.userName"), "remove-sequence", analysisSequence.getId(), analysisSequenceTranslation);

		return Response.ok().build();
	}

	@POST
	@Produces(MediaType.APPLICATION_JSON)
	@Consumes(MediaType.APPLICATION_JSON)
	@Secured
	@Path("{segmentId}/scene")
	public Response createAnalysisScene(@PathParam("segmentId") int segmentId, String jsonData) {
		ObjectMapper mapper = new ObjectMapper();
		AnalysisScene newScene = null;
		EntityManager entityManager = TIMAATApp.emf.createEntityManager();
		AnalysisSegment analysisSegment = entityManager.find(AnalysisSegment.class, segmentId);
		if ( analysisSegment == null ) return Response.status(Status.NOT_FOUND).build();	
		// parse JSON data
		try {
			newScene = mapper.readValue(jsonData, AnalysisScene.class);
		} catch (IOException e) {
			e.printStackTrace();
			return Response.status(Status.BAD_REQUEST).build();
		}
		if ( newScene == null ) return Response.status(Status.BAD_REQUEST).build();
		
		// sanitize object data
		newScene.setId(0);
		analysisSegment.addAnalysisScene(newScene);
		
		// persist analysisscene and list
		EntityTransaction entityTransaction = entityManager.getTransaction();
		entityTransaction.begin();
		entityManager.persist(newScene);
		entityManager.flush();
		newScene.setAnalysisSegment(analysisSegment);
		entityManager.persist(analysisSegment);
		entityTransaction.commit();
		entityManager.refresh(newScene);
		entityManager.refresh(analysisSegment);

		// add log entry
		UserLogManager.getLogger().addLogEntry((int) crc.getProperty("TIMAAT.userID"),
																					 UserLogManager.LogEvents.ANALYSISSCENECREATED);

		// send notification action
		NotificationWebSocket.notifyUserAction((String) crc.getProperty("TIMAAT.userName"),
																					 "add-scene",
																					 newScene.getAnalysisSegment().getId(),
																					 newScene);

		return Response.ok().entity(newScene).build();
	}
	
	@PATCH
	@Produces(MediaType.APPLICATION_JSON)
	@Consumes(MediaType.APPLICATION_JSON)
	@Path("scene/{id}")
	@Secured
	public Response updateAnalysisScene(@PathParam("id") int id, String jsonData) {
		ObjectMapper mapper = new ObjectMapper();
		AnalysisScene updatedScene = null;

		EntityManager entityManager = TIMAATApp.emf.createEntityManager();
		AnalysisScene analysisScene = entityManager.find(AnalysisScene.class, id);
		if ( analysisScene == null ) return Response.status(Status.NOT_FOUND).build();
	
		// parse JSON data
		try {
			updatedScene = mapper.readValue(jsonData, AnalysisScene.class);
		} catch (IOException e) {
			return Response.status(Status.BAD_REQUEST).build();
		}
		if ( updatedScene == null ) return Response.notModified().build();
		    	
    // update analysislist
		analysisScene.setStartTime(updatedScene.getStartTime());
		analysisScene.setEndTime(updatedScene.getEndTime());
				
		EntityTransaction entityTransaction = entityManager.getTransaction();
		entityTransaction.begin();
		entityManager.merge(analysisScene);
		entityManager.persist(analysisScene);
		entityTransaction.commit();
		entityManager.refresh(analysisScene);

		// add log entry
		UserLogManager.getLogger().addLogEntry((int) crc.getProperty("TIMAAT.userID"),
																					 UserLogManager.LogEvents.ANALYSISSCENEEDITED);
		// send notification action
		NotificationWebSocket.notifyUserAction((String) crc.getProperty("TIMAAT.userName"),
																					 "edit-scene",
																					 analysisScene.getAnalysisSegment().getId(),
																					 analysisScene);
		
		return Response.ok().entity(analysisScene).build();
	}

	@DELETE
  @Produces(MediaType.APPLICATION_JSON)
	@Path("scene/{id}")
	@Secured
	public Response deleteAnalysisScene(@PathParam("id") int id) {
    	
		EntityManager entityManager = TIMAATApp.emf.createEntityManager();
		AnalysisScene analysisScene = entityManager.find(AnalysisScene.class, id);
		if ( analysisScene == null ) return Response.status(Status.NOT_FOUND).build();
	
		AnalysisSegment analysisSegment = analysisScene.getAnalysisSegment();
		EntityTransaction entityTransaction = entityManager.getTransaction();
		entityTransaction.begin();
		entityManager.remove(analysisScene);
		entityTransaction.commit();
		entityManager.refresh(analysisSegment);
		
		// add log entry
		UserLogManager.getLogger().addLogEntry((int) crc.getProperty("TIMAAT.userID"),
																					 UserLogManager.LogEvents.ANALYSISSCENEDELETED);

		// send notification action
		NotificationWebSocket.notifyUserAction((String) crc.getProperty("TIMAAT.userName"),
																					 "remove-scene",
																					 analysisSegment.getId(),
																					 analysisScene);

		return Response.ok().build();
	}

	@POST
	@Produces(MediaType.APPLICATION_JSON)
	@Consumes(MediaType.APPLICATION_JSON)
	@Secured
	@Path("scene/{scene_id}/translation")
	public Response createAnalysisSceneTranslation(@PathParam("scene_id") int sceneId, String jsonData) {
		ObjectMapper mapper = new ObjectMapper();
		AnalysisSceneTranslation newTranslation = null;
		EntityManager entityManager = TIMAATApp.emf.createEntityManager();
		AnalysisScene analysisScene = entityManager.find(AnalysisScene.class, sceneId);

		if ( analysisScene == null ) return Response.status(Status.NOT_FOUND).build();	
		// parse JSON data
		try {
			newTranslation = mapper.readValue(jsonData, AnalysisSceneTranslation.class);
		} catch (IOException e) {
			e.printStackTrace();
			return Response.status(Status.BAD_REQUEST).build();
		}
		if ( newTranslation == null ) return Response.status(Status.BAD_REQUEST).build();
		
		// sanitize object data
		newTranslation.setId(0);
		newTranslation.setAnalysisScene(analysisScene);
		Language language = entityManager.find(Language.class, newTranslation.getLanguage().getId());
		newTranslation.setLanguage(language);
		analysisScene.addAnalysisSceneTranslation(newTranslation);
		
		// persist analysisscene and list
		EntityTransaction entityTransaction = entityManager.getTransaction();
		entityTransaction.begin();
		entityManager.persist(newTranslation);
		entityManager.flush();
		newTranslation.setAnalysisScene(analysisScene);
		entityManager.persist(analysisScene);
		entityTransaction.commit();
		entityManager.refresh(newTranslation);
		entityManager.refresh(analysisScene);

		// add log entry
		UserLogManager.getLogger().addLogEntry((int) crc.getProperty("TIMAAT.userID"),
																					 UserLogManager.LogEvents.ANALYSISSCENECREATED);

		// send notification action
		NotificationWebSocket.notifyUserAction((String) crc.getProperty("TIMAAT.userName"),
																					 "add-scene-translation",
																					 newTranslation.getAnalysisScene().getId(),
																					 newTranslation);

		return Response.ok().entity(newTranslation).build();
	}
	
	@PATCH
	@Produces(MediaType.APPLICATION_JSON)
	@Consumes(MediaType.APPLICATION_JSON)
	@Path("scene/translation/{translation_id}")
	@Secured
	public Response updateAnalysisSceneTranslation(@PathParam("translation_id") int translationId, String jsonData) {
		ObjectMapper mapper = new ObjectMapper();
		AnalysisSceneTranslation updatedTranslation = null;
		EntityManager entityManager = TIMAATApp.emf.createEntityManager();
		AnalysisSceneTranslation analysisSceneTranslation = entityManager.find(AnalysisSceneTranslation.class, translationId);

		if ( analysisSceneTranslation == null ) return Response.status(Status.NOT_FOUND).build();	
		// parse JSON data
		try {
			updatedTranslation = mapper.readValue(jsonData, AnalysisSceneTranslation.class);
		} catch (IOException e) {
			return Response.status(Status.BAD_REQUEST).build();
		}
		if ( updatedTranslation == null ) return Response.notModified().build();
		    	
    	// update analysislist
		if ( updatedTranslation.getName() != null ) analysisSceneTranslation.setName(updatedTranslation.getName());
		if ( updatedTranslation.getShortDescription() != null ) analysisSceneTranslation.setShortDescription(updatedTranslation.getShortDescription());
		if ( updatedTranslation.getComment() != null ) analysisSceneTranslation.setComment(updatedTranslation.getComment());
		if ( updatedTranslation.getTranscript() != null ) analysisSceneTranslation.setTranscript(updatedTranslation.getTranscript());
				
		EntityTransaction entityTransaction = entityManager.getTransaction();
		entityTransaction.begin();
		entityManager.merge(analysisSceneTranslation);
		entityManager.persist(analysisSceneTranslation);
		entityTransaction.commit();
		entityManager.refresh(analysisSceneTranslation);

		// add log entry
		// UserLogManager.getLogger().addLogEntry((int) crc.getProperty("TIMAAT.userID"), UserLogManager.LogEvents.ANALYSISSCENEEDITED);

		// send notification action
		NotificationWebSocket.notifyUserAction((String) crc.getProperty("TIMAAT.userName"), "edit-scene", analysisSceneTranslation.getAnalysisScene().getId(), analysisSceneTranslation);
		
		return Response.ok().entity(analysisSceneTranslation).build();
	}

	@DELETE
  @Produces(MediaType.APPLICATION_JSON)
	@Path("scene/translation/{translation_id}")
	@Secured
	public Response deleteAnalysisSceneTranslation(@PathParam("translation_id") int translationId) {
    	
		EntityManager entityManager = TIMAATApp.emf.createEntityManager();
		AnalysisSceneTranslation analysisSceneTranslation = entityManager.find(AnalysisSceneTranslation.class, translationId);

		if ( analysisSceneTranslation == null ) return Response.status(Status.NOT_FOUND).build();
	
		AnalysisScene analysisScene = analysisSceneTranslation.getAnalysisScene();
		EntityTransaction entityTransaction = entityManager.getTransaction();
		entityTransaction.begin();
		entityManager.remove(analysisSceneTranslation);
		entityTransaction.commit();
		entityManager.refresh(analysisScene);
		
		// add log entry
		UserLogManager.getLogger().addLogEntry((int) crc.getProperty("TIMAAT.userID"), UserLogManager.LogEvents.ANALYSISSCENEDELETED);

		// send notification action
		NotificationWebSocket.notifyUserAction((String) crc.getProperty("TIMAAT.userName"), "remove-scene", analysisScene.getId(), analysisSceneTranslation);

		return Response.ok().build();
	}
	
	@POST
	@Produces(MediaType.APPLICATION_JSON)
	@Consumes(MediaType.APPLICATION_JSON)
	@Secured
	@Path("{sequenceId}/take")
	public Response createAnalysisTake(@PathParam("sequenceId") int sequenceId, String jsonData) {
		ObjectMapper mapper = new ObjectMapper();
		AnalysisTake newTake = null;
		EntityManager entityManager = TIMAATApp.emf.createEntityManager();
		AnalysisSequence analysisSequence = entityManager.find(AnalysisSequence.class, sequenceId);
		if ( analysisSequence == null ) return Response.status(Status.NOT_FOUND).build();	
		// parse JSON data
		try {
			newTake = mapper.readValue(jsonData, AnalysisTake.class);
		} catch (IOException e) {
			e.printStackTrace();
			return Response.status(Status.BAD_REQUEST).build();
		}
		if ( newTake == null ) return Response.status(Status.BAD_REQUEST).build();
		
		// sanitize object data
		newTake.setId(0);
		analysisSequence.addAnalysisTake(newTake);
		
		// persist analysistake and list
		EntityTransaction entityTransaction = entityManager.getTransaction();
		entityTransaction.begin();
		entityManager.persist(newTake);
		entityManager.flush();
		newTake.setAnalysisSequence(analysisSequence);
		entityManager.persist(analysisSequence);
		entityTransaction.commit();
		entityManager.refresh(newTake);
		entityManager.refresh(analysisSequence);

		// add log entry
		UserLogManager.getLogger().addLogEntry((int) crc.getProperty("TIMAAT.userID"),
																					 UserLogManager.LogEvents.ANALYSISTAKECREATED);

		// send notification action
		NotificationWebSocket.notifyUserAction((String) crc.getProperty("TIMAAT.userName"),
																					 "add-take",
																					 newTake.getAnalysisSequence().getId(),
																					 newTake);

		return Response.ok().entity(newTake).build();
	}
	
	@PATCH
	@Produces(MediaType.APPLICATION_JSON)
	@Consumes(MediaType.APPLICATION_JSON)
	@Path("take/{id}")
	@Secured
	public Response updateAnalysisTake(@PathParam("id") int id, String jsonData) {
		ObjectMapper mapper = new ObjectMapper();
		AnalysisTake updatedTake = null;

		EntityManager entityManager = TIMAATApp.emf.createEntityManager();
		AnalysisTake analysisTake = entityManager.find(AnalysisTake.class, id);
		if ( analysisTake == null ) return Response.status(Status.NOT_FOUND).build();
	
		// parse JSON data
		try {
			updatedTake = mapper.readValue(jsonData, AnalysisTake.class);
		} catch (IOException e) {
			return Response.status(Status.BAD_REQUEST).build();
		}
		if ( updatedTake == null ) return Response.notModified().build();
		    	
    // update analysislist
		analysisTake.setStartTime(updatedTake.getStartTime());
		analysisTake.setEndTime(updatedTake.getEndTime());
				
		EntityTransaction entityTransaction = entityManager.getTransaction();
		entityTransaction.begin();
		entityManager.merge(analysisTake);
		entityManager.persist(analysisTake);
		entityTransaction.commit();
		entityManager.refresh(analysisTake);

		// add log entry
		UserLogManager.getLogger().addLogEntry((int) crc.getProperty("TIMAAT.userID"),
																					 UserLogManager.LogEvents.ANALYSISTAKEEDITED);
		// send notification action
		NotificationWebSocket.notifyUserAction((String) crc.getProperty("TIMAAT.userName"),
																					 "edit-take",
																					 analysisTake.getAnalysisSequence().getId(),
																					 analysisTake);
		
		return Response.ok().entity(analysisTake).build();
	}

	@DELETE
  @Produces(MediaType.APPLICATION_JSON)
	@Path("take/{id}")
	@Secured
	public Response deleteAnalysisTake(@PathParam("id") int id) {
    	
		EntityManager entityManager = TIMAATApp.emf.createEntityManager();
		AnalysisTake analysisTake = entityManager.find(AnalysisTake.class, id);
		if ( analysisTake == null ) return Response.status(Status.NOT_FOUND).build();
	
		AnalysisSequence analysisSequence = analysisTake.getAnalysisSequence();
		EntityTransaction entityTransaction = entityManager.getTransaction();
		entityTransaction.begin();
		entityManager.remove(analysisTake);
		entityTransaction.commit();
		entityManager.refresh(analysisSequence);
		
		// add log entry
		UserLogManager.getLogger().addLogEntry((int) crc.getProperty("TIMAAT.userID"),
																					 UserLogManager.LogEvents.ANALYSISTAKEDELETED);

		// send notification action
		NotificationWebSocket.notifyUserAction((String) crc.getProperty("TIMAAT.userName"),
																					 "remove-take",
																					 analysisSequence.getId(),
																					 analysisTake);

		return Response.ok().build();
	}

	@POST
	@Produces(MediaType.APPLICATION_JSON)
	@Consumes(MediaType.APPLICATION_JSON)
	@Secured
	@Path("take/{take_id}/translation")
	public Response createAnalysisTakeTranslation(@PathParam("take_id") int takeId, String jsonData) {
		ObjectMapper mapper = new ObjectMapper();
		AnalysisTakeTranslation newTranslation = null;
		EntityManager entityManager = TIMAATApp.emf.createEntityManager();
		AnalysisTake analysisTake = entityManager.find(AnalysisTake.class, takeId);

		if ( analysisTake == null ) return Response.status(Status.NOT_FOUND).build();	
		// parse JSON data
		try {
			newTranslation = mapper.readValue(jsonData, AnalysisTakeTranslation.class);
		} catch (IOException e) {
			e.printStackTrace();
			return Response.status(Status.BAD_REQUEST).build();
		}
		if ( newTranslation == null ) return Response.status(Status.BAD_REQUEST).build();
		
		// sanitize object data
		newTranslation.setId(0);
		newTranslation.setAnalysisTake(analysisTake);
		Language language = entityManager.find(Language.class, newTranslation.getLanguage().getId());
		newTranslation.setLanguage(language);
		analysisTake.addAnalysisTakeTranslation(newTranslation);
		
		// persist analysistake and list
		EntityTransaction entityTransaction = entityManager.getTransaction();
		entityTransaction.begin();
		entityManager.persist(newTranslation);
		entityManager.flush();
		newTranslation.setAnalysisTake(analysisTake);
		entityManager.persist(analysisTake);
		entityTransaction.commit();
		entityManager.refresh(newTranslation);
		entityManager.refresh(analysisTake);

		// add log entry
		UserLogManager.getLogger().addLogEntry((int) crc.getProperty("TIMAAT.userID"),
																					 UserLogManager.LogEvents.ANALYSISTAKECREATED);

		// send notification action
		NotificationWebSocket.notifyUserAction((String) crc.getProperty("TIMAAT.userName"),
																					 "add-take-translation",
																					 newTranslation.getAnalysisTake().getId(),
																					 newTranslation);

		return Response.ok().entity(newTranslation).build();
	}
	
	@PATCH
	@Produces(MediaType.APPLICATION_JSON)
	@Consumes(MediaType.APPLICATION_JSON)
	@Path("take/translation/{translation_id}")
	@Secured
	public Response updateAnalysisTakeTranslation(@PathParam("translation_id") int translationId, String jsonData) {
		ObjectMapper mapper = new ObjectMapper();
		AnalysisTakeTranslation updatedTranslation = null;
		EntityManager entityManager = TIMAATApp.emf.createEntityManager();
		AnalysisTakeTranslation analysisTakeTranslation = entityManager.find(AnalysisTakeTranslation.class, translationId);

		if ( analysisTakeTranslation == null ) return Response.status(Status.NOT_FOUND).build();	
		// parse JSON data
		try {
			updatedTranslation = mapper.readValue(jsonData, AnalysisTakeTranslation.class);
		} catch (IOException e) {
			return Response.status(Status.BAD_REQUEST).build();
		}
		if ( updatedTranslation == null ) return Response.notModified().build();
		    	
    	// update analysislist
		if ( updatedTranslation.getName() != null ) analysisTakeTranslation.setName(updatedTranslation.getName());
		if ( updatedTranslation.getShortDescription() != null ) analysisTakeTranslation.setShortDescription(updatedTranslation.getShortDescription());
		if ( updatedTranslation.getComment() != null ) analysisTakeTranslation.setComment(updatedTranslation.getComment());
		if ( updatedTranslation.getTranscript() != null ) analysisTakeTranslation.setTranscript(updatedTranslation.getTranscript());
				
		EntityTransaction entityTransaction = entityManager.getTransaction();
		entityTransaction.begin();
		entityManager.merge(analysisTakeTranslation);
		entityManager.persist(analysisTakeTranslation);
		entityTransaction.commit();
		entityManager.refresh(analysisTakeTranslation);

		// add log entry
		// UserLogManager.getLogger().addLogEntry((int) crc.getProperty("TIMAAT.userID"), UserLogManager.LogEvents.ANALYSISTAKEEDITED);

		// send notification action
		NotificationWebSocket.notifyUserAction((String) crc.getProperty("TIMAAT.userName"), "edit-take", analysisTakeTranslation.getAnalysisTake().getId(), analysisTakeTranslation);
		
		return Response.ok().entity(analysisTakeTranslation).build();
	}

	@DELETE
  @Produces(MediaType.APPLICATION_JSON)
	@Path("take/translation/{translation_id}")
	@Secured
	public Response deleteAnalysisTakeTranslation(@PathParam("translation_id") int translationId) {
    	
		EntityManager entityManager = TIMAATApp.emf.createEntityManager();
		AnalysisTakeTranslation analysisTakeTranslation = entityManager.find(AnalysisTakeTranslation.class, translationId);

		if ( analysisTakeTranslation == null ) return Response.status(Status.NOT_FOUND).build();
	
		AnalysisTake analysisTake = analysisTakeTranslation.getAnalysisTake();
		EntityTransaction entityTransaction = entityManager.getTransaction();
		entityTransaction.begin();
		entityManager.remove(analysisTakeTranslation);
		entityTransaction.commit();
		entityManager.refresh(analysisTake);
		
		// add log entry
		UserLogManager.getLogger().addLogEntry((int) crc.getProperty("TIMAAT.userID"), UserLogManager.LogEvents.ANALYSISTAKEDELETED);

		// send notification action
		NotificationWebSocket.notifyUserAction((String) crc.getProperty("TIMAAT.userName"), "remove-take", analysisTake.getId(), analysisTakeTranslation);

		return Response.ok().build();
	}

	@POST
	@Produces(MediaType.APPLICATION_JSON)
	@Consumes(MediaType.APPLICATION_JSON)
	@Secured
	@Path("{sceneId}/action")
	public Response createAnalysisAction(@PathParam("sceneId") int sceneId, String jsonData) {
		ObjectMapper mapper = new ObjectMapper();
		AnalysisAction newAction = null;
		EntityManager entityManager = TIMAATApp.emf.createEntityManager();
		AnalysisScene analysisScene = entityManager.find(AnalysisScene.class, sceneId);
		if ( analysisScene == null ) return Response.status(Status.NOT_FOUND).build();	
		// parse JSON data
		try {
			newAction = mapper.readValue(jsonData, AnalysisAction.class);
		} catch (IOException e) {
			e.printStackTrace();
			return Response.status(Status.BAD_REQUEST).build();
		}
		if ( newAction == null ) return Response.status(Status.BAD_REQUEST).build();
		
		// sanitize object data
		newAction.setId(0);
		analysisScene.addAnalysisAction(newAction);
		
		// persist analysisaction and list
		EntityTransaction entityTransaction = entityManager.getTransaction();
		entityTransaction.begin();
		entityManager.persist(newAction);
		entityManager.flush();
		newAction.setAnalysisScene(analysisScene);
		entityManager.persist(analysisScene);
		entityTransaction.commit();
		entityManager.refresh(newAction);
		entityManager.refresh(analysisScene);

		// add log entry
		UserLogManager.getLogger().addLogEntry((int) crc.getProperty("TIMAAT.userID"),
																					 UserLogManager.LogEvents.ANALYSISACTIONCREATED);

		// send notification action
		NotificationWebSocket.notifyUserAction((String) crc.getProperty("TIMAAT.userName"),
																					 "add-action",
																					 newAction.getAnalysisScene().getId(),
																					 newAction);

		return Response.ok().entity(newAction).build();
	}
	
	@PATCH
	@Produces(MediaType.APPLICATION_JSON)
	@Consumes(MediaType.APPLICATION_JSON)
	@Path("action/{id}")
	@Secured
	public Response updateAnalysisAction(@PathParam("id") int id, String jsonData) {
		ObjectMapper mapper = new ObjectMapper();
		AnalysisAction updatedAction = null;

		EntityManager entityManager = TIMAATApp.emf.createEntityManager();
		AnalysisAction analysisAction = entityManager.find(AnalysisAction.class, id);
		if ( analysisAction == null ) return Response.status(Status.NOT_FOUND).build();
	
		// parse JSON data
		try {
			updatedAction = mapper.readValue(jsonData, AnalysisAction.class);
		} catch (IOException e) {
			return Response.status(Status.BAD_REQUEST).build();
		}
		if ( updatedAction == null ) return Response.notModified().build();
		    	
    // update analysislist
		analysisAction.setStartTime(updatedAction.getStartTime());
		analysisAction.setEndTime(updatedAction.getEndTime());
				
		EntityTransaction entityTransaction = entityManager.getTransaction();
		entityTransaction.begin();
		entityManager.merge(analysisAction);
		entityManager.persist(analysisAction);
		entityTransaction.commit();
		entityManager.refresh(analysisAction);

		// add log entry
		UserLogManager.getLogger().addLogEntry((int) crc.getProperty("TIMAAT.userID"),
																					 UserLogManager.LogEvents.ANALYSISACTIONEDITED);
		// send notification action
		NotificationWebSocket.notifyUserAction((String) crc.getProperty("TIMAAT.userName"),
																					 "edit-action",
																					 analysisAction.getAnalysisScene().getId(),
																					 analysisAction);
		
		return Response.ok().entity(analysisAction).build();
	}

	@DELETE
  @Produces(MediaType.APPLICATION_JSON)
	@Path("action/{id}")
	@Secured
	public Response deleteAnalysisAction(@PathParam("id") int id) {
    	
		EntityManager entityManager = TIMAATApp.emf.createEntityManager();
		AnalysisAction analysisAction = entityManager.find(AnalysisAction.class, id);
		if ( analysisAction == null ) return Response.status(Status.NOT_FOUND).build();
	
		AnalysisScene analysisScene = analysisAction.getAnalysisScene();
		EntityTransaction entityTransaction = entityManager.getTransaction();
		entityTransaction.begin();
		entityManager.remove(analysisAction);
		entityTransaction.commit();
		entityManager.refresh(analysisScene);
		
		// add log entry
		UserLogManager.getLogger().addLogEntry((int) crc.getProperty("TIMAAT.userID"),
																					 UserLogManager.LogEvents.ANALYSISACTIONDELETED);

		// send notification action
		NotificationWebSocket.notifyUserAction((String) crc.getProperty("TIMAAT.userName"),
																					 "remove-action",
																					 analysisScene.getId(),
																					 analysisAction);

		return Response.ok().build();
	}

	@POST
	@Produces(MediaType.APPLICATION_JSON)
	@Consumes(MediaType.APPLICATION_JSON)
	@Secured
	@Path("action/{action_id}/translation")
	public Response createAnalysisActionTranslation(@PathParam("action_id") int actionId, String jsonData) {
		ObjectMapper mapper = new ObjectMapper();
		AnalysisActionTranslation newTranslation = null;
		EntityManager entityManager = TIMAATApp.emf.createEntityManager();
		AnalysisAction analysisAction = entityManager.find(AnalysisAction.class, actionId);

		if ( analysisAction == null ) return Response.status(Status.NOT_FOUND).build();	
		// parse JSON data
		try {
			newTranslation = mapper.readValue(jsonData, AnalysisActionTranslation.class);
		} catch (IOException e) {
			e.printStackTrace();
			return Response.status(Status.BAD_REQUEST).build();
		}
		if ( newTranslation == null ) return Response.status(Status.BAD_REQUEST).build();
		
		// sanitize object data
		newTranslation.setId(0);
		newTranslation.setAnalysisAction(analysisAction);
		Language language = entityManager.find(Language.class, newTranslation.getLanguage().getId());
		newTranslation.setLanguage(language);
		analysisAction.addAnalysisActionTranslation(newTranslation);
		
		// persist analysisaction and list
		EntityTransaction entityTransaction = entityManager.getTransaction();
		entityTransaction.begin();
		entityManager.persist(newTranslation);
		entityManager.flush();
		newTranslation.setAnalysisAction(analysisAction);
		entityManager.persist(analysisAction);
		entityTransaction.commit();
		entityManager.refresh(newTranslation);
		entityManager.refresh(analysisAction);

		// add log entry
		UserLogManager.getLogger().addLogEntry((int) crc.getProperty("TIMAAT.userID"),
																					 UserLogManager.LogEvents.ANALYSISACTIONCREATED);

		// send notification action
		NotificationWebSocket.notifyUserAction((String) crc.getProperty("TIMAAT.userName"),
																					 "add-action-translation",
																					 newTranslation.getAnalysisAction().getId(),
																					 newTranslation);

		return Response.ok().entity(newTranslation).build();
	}
	
	@PATCH
	@Produces(MediaType.APPLICATION_JSON)
	@Consumes(MediaType.APPLICATION_JSON)
	@Path("action/translation/{translation_id}")
	@Secured
	public Response updateAnalysisActionTranslation(@PathParam("translation_id") int translationId, String jsonData) {
		ObjectMapper mapper = new ObjectMapper();
		AnalysisActionTranslation updatedTranslation = null;
		EntityManager entityManager = TIMAATApp.emf.createEntityManager();
		AnalysisActionTranslation analysisActionTranslation = entityManager.find(AnalysisActionTranslation.class, translationId);

		if ( analysisActionTranslation == null ) return Response.status(Status.NOT_FOUND).build();	
		// parse JSON data
		try {
			updatedTranslation = mapper.readValue(jsonData, AnalysisActionTranslation.class);
		} catch (IOException e) {
			return Response.status(Status.BAD_REQUEST).build();
		}
		if ( updatedTranslation == null ) return Response.notModified().build();
		    	
    	// update analysislist
		if ( updatedTranslation.getName() != null ) analysisActionTranslation.setName(updatedTranslation.getName());
		if ( updatedTranslation.getShortDescription() != null ) analysisActionTranslation.setShortDescription(updatedTranslation.getShortDescription());
		if ( updatedTranslation.getComment() != null ) analysisActionTranslation.setComment(updatedTranslation.getComment());
		if ( updatedTranslation.getTranscript() != null ) analysisActionTranslation.setTranscript(updatedTranslation.getTranscript());
				
		EntityTransaction entityTransaction = entityManager.getTransaction();
		entityTransaction.begin();
		entityManager.merge(analysisActionTranslation);
		entityManager.persist(analysisActionTranslation);
		entityTransaction.commit();
		entityManager.refresh(analysisActionTranslation);

		// add log entry
		// UserLogManager.getLogger().addLogEntry((int) crc.getProperty("TIMAAT.userID"), UserLogManager.LogEvents.ANALYSISACTIONEDITED);

		// send notification action
		NotificationWebSocket.notifyUserAction((String) crc.getProperty("TIMAAT.userName"), "edit-action", analysisActionTranslation.getAnalysisAction().getId(), analysisActionTranslation);
		
		return Response.ok().entity(analysisActionTranslation).build();
	}

	@DELETE
  @Produces(MediaType.APPLICATION_JSON)
	@Path("action/translation/{translation_id}")
	@Secured
	public Response deleteAnalysisActionTranslation(@PathParam("translation_id") int translationId) {
    	
		EntityManager entityManager = TIMAATApp.emf.createEntityManager();
		AnalysisActionTranslation analysisActionTranslation = entityManager.find(AnalysisActionTranslation.class, translationId);

		if ( analysisActionTranslation == null ) return Response.status(Status.NOT_FOUND).build();
	
		AnalysisAction analysisAction = analysisActionTranslation.getAnalysisAction();
		EntityTransaction entityTransaction = entityManager.getTransaction();
		entityTransaction.begin();
		entityManager.remove(analysisActionTranslation);
		entityTransaction.commit();
		entityManager.refresh(analysisAction);
		
		// add log entry
		UserLogManager.getLogger().addLogEntry((int) crc.getProperty("TIMAAT.userID"), UserLogManager.LogEvents.ANALYSISACTIONDELETED);

		// send notification action
		NotificationWebSocket.notifyUserAction((String) crc.getProperty("TIMAAT.userName"), "remove-action", analysisAction.getId(), analysisActionTranslation);

		return Response.ok().build();
	}

	@POST
  @Produces(MediaType.APPLICATION_JSON)
	@Path("{analysisListId}/categorySet/{categorySetId}")
	@Secured
	public Response addExistingCategorySet(@PathParam("analysisListId") int analysisListId,
																 				 @PathParam("categorySetId") int categorySetId) {
		
		EntityManager entityManager = TIMAATApp.emf.createEntityManager();
		MediumAnalysisList analysisList = entityManager.find(MediumAnalysisList.class, analysisListId);
		if ( analysisList == null ) return Response.status(Status.NOT_FOUND).build();
		CategorySet categorySet = entityManager.find(CategorySet.class, categorySetId);
		if ( categorySet == null ) return Response.status(Status.NOT_FOUND).build();
		
		// attach categorySet to annotation and vice versa    	
		EntityTransaction entityTransaction = entityManager.getTransaction();
		entityTransaction.begin();
		analysisList.getCategorySets().add(categorySet);
		categorySet.getMediumAnalysisLists().add(analysisList);
		entityManager.merge(categorySet);
		entityManager.merge(analysisList);
		entityManager.persist(analysisList);
		entityManager.persist(categorySet);
		entityTransaction.commit();
		entityManager.refresh(analysisList);
 	
		return Response.ok().entity(categorySet).build();
	}

	@DELETE
  @Produces(MediaType.APPLICATION_JSON)
	@Path("{analysisListId}/categorySet/{categorySetId}")
	@Secured
	public Response removeCategorySet(@PathParam("analysisListId") int analysisListId,
																		@PathParam("categorySetId") int categorySetId) {
		
		EntityManager entityManager = TIMAATApp.emf.createEntityManager();
		MediumAnalysisList analysisList = entityManager.find(MediumAnalysisList.class, analysisListId);
		if ( analysisList == null ) return Response.status(Status.NOT_FOUND).build();
		CategorySet categorySet = entityManager.find(CategorySet.class, categorySetId);
		if ( categorySet == null ) return Response.status(Status.NOT_FOUND).build();

		// TODO delete categories from annotations of matching categorySets
		List<Category> categoryList = new ArrayList<>();
		Set<CategorySetHasCategory> cshc = categorySet.getCategorySetHasCategories();
		Iterator<CategorySetHasCategory> itr = cshc.iterator();
		EntityTransaction entityTransaction = entityManager.getTransaction();

		while (itr.hasNext()) {
			// categorySelectList.add(new SelectElement(itr.next().getCategory().getId(), itr.next().getCategory().getName()));
			categoryList.add(itr.next().getCategory());
		}
		for (Annotation annotation : analysisList.getAnnotations()) {
			List<Category> annotationCategoryList = annotation.getCategories();
			List<Category> categoriesToRemove = categoryList.stream()
																										 .distinct()
																										 .filter(annotationCategoryList::contains)
																										 .collect(Collectors.toList());
			entityTransaction.begin();
			for (Category category : categoriesToRemove) {
				annotation.getCategories().remove(category);
			}
			entityManager.merge(annotation);
			entityManager.persist(annotation);
			entityTransaction.commit();
			entityManager.refresh(annotation);
		}

		// attach categorySet to annotation and vice versa    	
		entityTransaction.begin();
		analysisList.getCategorySets().remove(categorySet);
		categorySet.getMediumAnalysisLists().remove(analysisList);
		entityManager.merge(categorySet);
		entityManager.merge(analysisList);
		entityManager.persist(analysisList);
		entityManager.persist(categorySet);
		entityTransaction.commit();
		entityManager.refresh(analysisList);
 	
		return Response.ok().build();
	}

	@POST
  @Produces(MediaType.APPLICATION_JSON)
	@Path("{analysisListId}/tag/{tagId}")
	@Secured
	public Response addExistingTag(@PathParam("analysisListId") int analysisListId,
																 @PathParam("tagId") int tagId) {
		
		EntityManager entityManager = TIMAATApp.emf.createEntityManager();
		MediumAnalysisList analysisList = entityManager.find(MediumAnalysisList.class, analysisListId);
		if ( analysisList == null ) return Response.status(Status.NOT_FOUND).build();
		Tag tag = entityManager.find(Tag.class, tagId);
		if ( tag == null ) return Response.status(Status.NOT_FOUND).build();
		
		// attach tag to annotation and vice versa    	
		EntityTransaction entityTransaction = entityManager.getTransaction();
		entityTransaction.begin();
		analysisList.getTags().add(tag);
		tag.getMediumAnalysisLists().add(analysisList);
		entityManager.merge(tag);
		entityManager.merge(analysisList);
		entityManager.persist(analysisList);
		entityManager.persist(tag);
		entityTransaction.commit();
		entityManager.refresh(analysisList);
 	
		return Response.ok().entity(tag).build();
	}

	@DELETE
  @Produces(MediaType.APPLICATION_JSON)
	@Path("{analysisListId}/tag/{tagId}")
	@Secured
	public Response removeTag(@PathParam("analysisListId") int analysisListId,
														@PathParam("tagId") int tagId) {
		
		EntityManager entityManager = TIMAATApp.emf.createEntityManager();
		MediumAnalysisList analysisList = entityManager.find(MediumAnalysisList.class, analysisListId);
		if ( analysisList == null ) return Response.status(Status.NOT_FOUND).build();
		Tag tag = entityManager.find(Tag.class, tagId);
		if ( tag == null ) return Response.status(Status.NOT_FOUND).build();
		
			// attach tag to annotation and vice versa    	
			EntityTransaction entityTransaction = entityManager.getTransaction();
			entityTransaction.begin();
			analysisList.getTags().remove(tag);
			tag.getMediumAnalysisLists().remove(analysisList);
			entityManager.merge(tag);
			entityManager.merge(analysisList);
			entityManager.persist(analysisList);
			entityManager.persist(tag);
			entityTransaction.commit();
			entityManager.refresh(analysisList);
 	
		return Response.ok().build();
	}

}
