package de.bitgilde.TIMAAT.rest;

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
import javax.ws.rs.core.Response.Status;
import javax.ws.rs.core.UriInfo;

import org.jvnet.hk2.annotations.Service;

import com.fasterxml.jackson.databind.ObjectMapper;

import de.bitgilde.TIMAAT.TIMAATApp;
import de.bitgilde.TIMAAT.model.DatatableInfo;
import de.bitgilde.TIMAAT.model.FIPOP.MediaCollection;
import de.bitgilde.TIMAAT.model.FIPOP.MediaCollectionAnalysisList;
import de.bitgilde.TIMAAT.model.FIPOP.MediaCollectionHasMedium;
import de.bitgilde.TIMAAT.model.FIPOP.MediaCollectionHasTag;
import de.bitgilde.TIMAAT.model.FIPOP.MediaCollectionType;
import de.bitgilde.TIMAAT.model.FIPOP.Medium;
import de.bitgilde.TIMAAT.security.UserLogManager;

/**
*
* @author Jens-Martin Loebel <loebel@bitgilde.de>
*/

@Service
@Path("/mediaCollection")
public class MediaCollectionEndpoint {
	@Context
	private UriInfo uriInfo;
	@Context
	ContainerRequestContext containerRequestContext;
	@Context
	ServletContext servletContext;

	@GET
	@Produces(javax.ws.rs.core.MediaType.APPLICATION_JSON)
	@Secured
	@Path("list")
	public Response getMediaCollectionList(@QueryParam("draw") Integer draw,
																				 @QueryParam("start") Integer start,
																				 @QueryParam("length") Integer length,
																				 @QueryParam("orderby") String orderby,
																				 @QueryParam("dir") String direction,
																				 @QueryParam("search") String search ) {
		System.out.println("MediumCollectionServiceEndpoint: getMediaCollectionList: draw: "+draw+" start: "+start+" length: "+length+" orderby: "+orderby+" dir: "+direction+" search: "+search);
		if ( draw == null ) draw = 0;

		// sanitize user input
		if ( direction != null && direction.equalsIgnoreCase("desc") ) direction = "DESC"; else direction = "ASC";
		String column = "mc.id";
		if ( orderby != null) {
			if (orderby.equalsIgnoreCase("title")) column = "mc.title";
		}

		EntityManager entityManager = TIMAATApp.emf.createEntityManager();

		// calculate total # of records
		Query countQuery = entityManager.createQuery("SELECT COUNT(mc) FROM MediaCollection mc");
		long recordsTotal = (long) countQuery.getSingleResult();
		long recordsFiltered = recordsTotal;

		// search
		Query query;
		String sql;
		List<MediaCollection> mediumCollectionList = new ArrayList<>();
		if (search != null && search.length() > 0 ) {
			// find all matching titles
			sql = "SELECT mc FROM MediaCollection mc WHERE lower(mc.title) LIKE lower(concat('%', :search, '%'))";
			query = entityManager.createQuery(sql)
													 .setParameter("search", search);
			// find all mediacollections
			if ( start != null && start > 0 ) query.setFirstResult(start);
			if ( length != null && length > 0 ) query.setMaxResults(length);
			mediumCollectionList = castList(MediaCollection.class, query.getResultList());
			recordsFiltered = mediumCollectionList.size();
		} else {
			sql = "SELECT mc FROM MediaCollection mc ORDER BY "+column+" "+direction;
			query = entityManager.createQuery(sql);
			if ( start != null && start > 0 ) query.setFirstResult(start);
			if ( length != null && length > 0 ) query.setMaxResults(length);
			mediumCollectionList = castList(MediaCollection.class, query.getResultList());
		}
		return Response.ok().entity(new DatatableInfo(draw, recordsTotal, recordsFiltered, mediumCollectionList)).build();
	}



	@GET
	@Path("listCard")
	@Produces(MediaType.APPLICATION_JSON)
	@Secured
	@SuppressWarnings("unchecked")
	public Response getAllCollections(@QueryParam("noContents") String noContents) {
		EntityManager em = TIMAATApp.emf.createEntityManager();
		
		// TODO get all mediacollections no matter the type, display type in frontend instead
		List<MediaCollection> cols = (List<MediaCollection>) em.createQuery("SELECT mc from MediaCollection mc WHERE mc.mediaCollectionType=:type ORDER BY mc.title ASC")
				.setParameter("type", em.find(MediaCollectionType.class, 2)) // TODO refactor type
				.getResultList();
		
		// strip analysislists
		for ( MediaCollection col : cols ) {
			if ( noContents != null ) col.getMediaCollectionHasMediums().clear();
			for ( MediaCollectionHasMedium m : col.getMediaCollectionHasMediums() ) {
				m.getMedium().getMediumAnalysisLists().clear();
				m.getMedium().getFileStatus();
				m.getMedium().getViewToken();
			}
		}
		
		return Response.ok().entity(cols).build();
	}

	@GET
	@Path("{id}")
	@Produces(MediaType.APPLICATION_JSON)
	@Secured
	public Response getCollection(
			@PathParam("id") int id,
			@QueryParam("noContents") String noContents
			) {
		EntityManager em = TIMAATApp.emf.createEntityManager();
		
		MediaCollection col = em.find(MediaCollection.class, id);
		
		if ( col == null ) return Response.status(Status.NOT_FOUND).build();
		
		if ( noContents != null ) col.getMediaCollectionHasMediums().clear();
		// strip analysislists
		for ( MediaCollectionHasMedium m : col.getMediaCollectionHasMediums() ) {
			m.getMedium().getMediumAnalysisLists().clear();
			m.getMedium().getFileStatus();
			m.getMedium().getViewToken();

		}
	
		return Response.ok().entity(col).build();
	}

	
	@GET
	@Path("{id}/media")
	@Produces(MediaType.APPLICATION_JSON)
	@Secured
	public Response getCollectionMedia(
			@PathParam("id") int id,
			@QueryParam("draw") Integer draw,
			@QueryParam("start") Integer start,
			@QueryParam("length") Integer length,
			@QueryParam("mediumsubtype") String mediumSubType,
			@QueryParam("orderby") String orderby,
			@QueryParam("dir") String direction,
			@QueryParam("search") String search
			) {
		EntityManager em = TIMAATApp.emf.createEntityManager();
		
		if ( draw == null ) draw = 0;
		
		MediaCollection col = em.find(MediaCollection.class, id);
		if ( col == null ) return Response.status(Status.NOT_FOUND).build();

		// sanitize user input
		if ( direction != null && direction.equalsIgnoreCase("desc" ) ) direction = "DESC"; else direction = "ASC";

		String column = "mchm.medium.id";
		if ( orderby != null ) {
			if (orderby.equalsIgnoreCase("title")) column = "mchm.medium.title1.name";
			if (orderby.equalsIgnoreCase("duration")) column = "mchm.medium.mediumVideo.length";
			if (orderby.equalsIgnoreCase("releaseDate")) column = "mchm.medium.releaseDate";
			// TODO producer, seems way to complex to put in DB query
			// - dependencies  --> actor --> actornames --> actorname.isdisplayname
			// + --> role == 5 --> producer 
		}

		String subType = "";
		if ( mediumSubType != null && mediumSubType.compareTo("video") == 0 ) subType = "AND mchm.medium.mediumVideo != NULL";

		// calculate total # of records
		Query countQuery = TIMAATApp.emf.createEntityManager().createQuery("SELECT COUNT(mchm.medium) FROM MediaCollectionHasMedium mchm WHERE mchm.mediaCollection.id=:id "+subType);
		countQuery.setParameter("id", id);
		long recordsTotal = (long) countQuery.getSingleResult();
		long recordsFiltered = recordsTotal;

		// search
		Query query;
		if ( search != null && search.length() > 0 ) {
			// calculate search result # of records
			countQuery = TIMAATApp.emf.createEntityManager().createQuery(
					"SELECT COUNT(mchm.medium) FROM MediaCollectionHasMedium mchm WHERE lower(mchm.medium.title1.name) LIKE lower(concat('%', :title1,'%')) AND mchm.mediaCollection.id=:id "+subType);
			countQuery.setParameter("id", id);
			countQuery.setParameter("title1", search);
			recordsFiltered = (long) countQuery.getSingleResult();
			// perform search
			query = TIMAATApp.emf.createEntityManager().createQuery(
					"SELECT mchm.medium FROM MediaCollectionHasMedium mchm WHERE lower(mchm.medium.title1.name) LIKE lower(concat('%', :title1,'%')) AND mchm.mediaCollection.id=:id "+subType+" ORDER BY "+column+" "+direction);
			query.setParameter("title1", search);
//			query.setParameter("title2", search);
		} else {
			query = TIMAATApp.emf.createEntityManager().createQuery(
					"SELECT mchm.medium FROM MediaCollectionHasMedium mchm WHERE mchm.mediaCollection.id=:id "+subType+" ORDER BY "+column+" "+direction);
		}
		query.setParameter("id", id);

		if ( start != null && start > 0 ) query.setFirstResult(start);
		if ( length != null && length > 0 ) query.setMaxResults(length);

		List<Medium> media = castList(Medium.class, query.getResultList());

		// strip analysislists
		for ( Medium m : media ) {
			m.getMediumAnalysisLists().clear();
			m.getFileStatus();
			m.getViewToken();
		}
	
		return Response.ok().entity(new DatatableInfo(draw, recordsTotal, recordsFiltered, media)).build();
	}
	
	
	@POST
	@Produces(MediaType.APPLICATION_JSON)
	@Consumes(MediaType.APPLICATION_JSON)
	@Secured
	// @Path("/")
	public Response createMediaCollection(String jsonData) {
		ObjectMapper mapper = new ObjectMapper();
		MediaCollection newCol = null;    	
    	EntityManager em = TIMAATApp.emf.createEntityManager();
    	// parse JSON data
		try {
			newCol = mapper.readValue(jsonData, MediaCollection.class);
		} catch (IOException e) {
			e.printStackTrace();
			return Response.status(Status.BAD_REQUEST).build();
		}
		if ( newCol == null ) return Response.status(Status.BAD_REQUEST).build();
		// sanitize object data
		newCol.setId(0);
		newCol.setIsSystemic(0);
		newCol.setMediaCollectionAlbum(null);
		newCol.setMediaCollectionAnalysisLists(new ArrayList<MediaCollectionAnalysisList>());
		newCol.setMediaCollectionHasMediums(new ArrayList<MediaCollectionHasMedium>());
		newCol.setMediaCollectionHasTags(new ArrayList<MediaCollectionHasTag>());
		newCol.setMediaCollectionSeries(null);
		newCol.setMediaCollectionType(em.find(MediaCollectionType.class, 2)); // TODO refactor
		// update log metadata
		// TODO log not in model

		// persist mediacollection
		EntityTransaction tx = em.getTransaction();
		tx.begin();
		em.persist(newCol);
		em.flush();
		tx.commit();
		em.refresh(newCol);
		
		// add log entry
		if ( containerRequestContext.getProperty("TIMAAT.userID") != null ) {
			UserLogManager.getLogger().addLogEntry((int)containerRequestContext.getProperty("TIMAAT.userID"), UserLogManager.LogEvents.MEDIACOLLECTIONCREATED);

		} else {
			// DEBUG do nothing - production system should abort with internal server error		
			return Response.serverError().build();
		}
		
		return Response.ok().entity(newCol).build();
	}
	
	@PATCH
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.APPLICATION_JSON)
	@Path("{id}")
	@Secured
	public Response updateMediaCollection(@PathParam("id") int id, String jsonData) {
		ObjectMapper mapper = new ObjectMapper();
		MediaCollection updatedCol = null;

    	
    	EntityManager em = TIMAATApp.emf.createEntityManager();
    	MediaCollection col = em.find(MediaCollection.class, id);
    	if ( col == null ) return Response.status(Status.NOT_FOUND).build();
		
    	// parse JSON data
		try {
			updatedCol = mapper.readValue(jsonData, MediaCollection.class);
		} catch (IOException e) {
			System.out.println(e);
			return Response.status(Status.BAD_REQUEST).build();
		}
		if ( updatedCol == null ) return Response.notModified().build();
		    	
    	// update analysislist
		if ( updatedCol.getTitle() != null ) col.setTitle(updatedCol.getTitle());
		if ( updatedCol.getNote() != null ) col.setNote(updatedCol.getNote());

		// TODO update log metadata in general log
		
		EntityTransaction tx = em.getTransaction();
		tx.begin();
		em.merge(col);
		em.persist(col);
		tx.commit();
		em.refresh(col);

		// add log entry
		UserLogManager.getLogger().addLogEntry((int) containerRequestContext.getProperty("TIMAAT.userID"), UserLogManager.LogEvents.MEDIACOLLECTIONEDITED);

		return Response.ok().entity(col).build();
	}
	
	@DELETE
    @Produces(MediaType.APPLICATION_JSON)
	@Path("{id}")
	@Secured
	public Response deleteMediaCollection(@PathParam("id") int id) {
    	
    	EntityManager em = TIMAATApp.emf.createEntityManager();
    	MediaCollection col = em.find(MediaCollection.class, id);
    	if ( col == null ) return Response.status(Status.NOT_FOUND).build();

		EntityTransaction tx = em.getTransaction();
		tx.begin();
		for ( MediaCollectionHasMedium mchm : col.getMediaCollectionHasMediums() ) em.remove(mchm);
	    col.getMediaCollectionHasMediums().clear();
		em.remove(col);
		tx.commit();

		// add log entry
		UserLogManager.getLogger().addLogEntry((int) containerRequestContext.getProperty("TIMAAT.userID"), UserLogManager.LogEvents.MEDIACOLLECTIONDELETED);

		return Response.ok().build();
	}
	
	@POST
    @Produces(MediaType.APPLICATION_JSON)
	@Path("{id}/medium/{mediumId}")
	@Secured
	public Response addMediaCollectionItem(@PathParam("id") int id, @PathParam("mediumId") int mediumId) {
    	
    	EntityManager em = TIMAATApp.emf.createEntityManager();
    	MediaCollection col = em.find(MediaCollection.class, id);
    	if ( col == null ) return Response.status(Status.NOT_FOUND).build();
    	Medium m = em.find(Medium.class, mediumId);
    	if ( m == null ) return Response.status(Status.NOT_FOUND).build();

    	
    	MediaCollectionHasMedium mchm = null;
    	try {
        	mchm = (MediaCollectionHasMedium) em.createQuery(
        			"SELECT mchm FROM MediaCollectionHasMedium mchm WHERE mchm.mediaCollection=:collection AND mchm.medium=:medium")
                	.setParameter("collection", col)
                	.setParameter("medium", m)
                	.getSingleResult();    		
    	} catch (Exception e) {
    		// doesn't matter
    	}
    	
    	if ( mchm == null ) {
    		mchm = new MediaCollectionHasMedium();
    		mchm.setMediaCollection(col);
    		mchm.setMedium(m);
        	try {
        		EntityTransaction tx = em.getTransaction();
        		tx.begin();
        		em.persist(mchm);
        		tx.commit();
            	em.refresh(col);
        	} catch (Exception e) {
        		e.printStackTrace();
        		return Response.notModified().build();
        	}
    	}
    	    	
		// add log entry
		UserLogManager.getLogger().addLogEntry((int) containerRequestContext.getProperty("TIMAAT.userID"), UserLogManager.LogEvents.MEDIACOLLECTIONEDITED);

		return Response.ok().build();
	}


	@DELETE
    @Produces(MediaType.APPLICATION_JSON)
	@Path("{id}/medium/{mediumId}")
	@Secured
	public Response deleteMediaCollectionItem(@PathParam("id") int id, @PathParam("mediumId") int mediumId) {
    	
    	EntityManager em = TIMAATApp.emf.createEntityManager();
    	MediaCollection col = em.find(MediaCollection.class, id);
    	if ( col == null ) return Response.status(Status.NOT_FOUND).build();
    	Medium m = em.find(Medium.class, mediumId);
    	if ( m == null ) return Response.status(Status.NOT_FOUND).build();

    	try {
    		EntityTransaction tx = em.getTransaction();
    		tx.begin();
        	em.createQuery("DELETE FROM MediaCollectionHasMedium mchm WHERE mchm.mediaCollection=:collection AND mchm.medium=:medium")
        	.setParameter("collection", col)
        	.setParameter("medium", m)
        	.executeUpdate();
    		tx.commit();
        	em.refresh(col);
    	} catch (Exception e) {
    		e.printStackTrace();
    		return Response.notModified().build();
    	}
    	
		// add log entry
		UserLogManager.getLogger().addLogEntry((int) containerRequestContext.getProperty("TIMAAT.userID"), UserLogManager.LogEvents.MEDIACOLLECTIONDELETED);

		return Response.ok().build();
	}



	public static <T> List<T> castList(Class<? extends T> clazz, Collection<?> c) {
		List<T> r = new ArrayList<T>(c.size());
		for(Object o: c)
			r.add(clazz.cast(o));
		return r;
    }
	
}
