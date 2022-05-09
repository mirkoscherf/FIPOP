package de.bitgilde.TIMAAT.rest.endpoint;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

import org.jvnet.hk2.annotations.Service;

import de.bitgilde.TIMAAT.TIMAATApp;
import de.bitgilde.TIMAAT.model.FIPOP.MediaCollection;
import de.bitgilde.TIMAAT.model.FIPOP.MediumAnalysisList;
import de.bitgilde.TIMAAT.model.FIPOP.PermissionType;
import de.bitgilde.TIMAAT.model.FIPOP.UserAccount;
import de.bitgilde.TIMAAT.model.FIPOP.UserAccountHasMediaCollection;
import de.bitgilde.TIMAAT.model.FIPOP.UserAccountHasMediumAnalysisList;
import de.bitgilde.TIMAAT.rest.Secured;
import de.bitgilde.TIMAAT.rest.filter.AuthenticationFilter;
import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityTransaction;
import jakarta.persistence.NoResultException;
import jakarta.persistence.Query;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.PATCH;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.container.ContainerRequestContext;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.Response.Status;

/**
*
* @author Jens-Martin Loebel <loebel@bitgilde.de>
*/

@Service
@Path("/user")
public class EndpointUserAccount {

	@Context ContainerRequestContext containerRequestContext;

	@GET
  @Produces(MediaType.TEXT_PLAIN)
	@Path("{id}/displayName")
	@Secured
	public Response getUserDisplayName(@PathParam("id") int id) {
		UserAccount user = null;
		try {
			user = (UserAccount) TIMAATApp.emf.createEntityManager()
				.createQuery("SELECT ua FROM UserAccount ua WHERE ua.id=:id")
				.setParameter("id", id)
				.getSingleResult();
		} catch (NoResultException e) {
			return Response.status(Status.NOT_FOUND).entity("User not found!").build();
		}
		if ( user == null ) return Response.status(Status.NOT_FOUND).entity("User not found!").build();

		return Response.ok().entity(user.getDisplayName()).build();
	}

	@GET
  @Produces(MediaType.TEXT_PLAIN)
	@Path("displayNameExists")
	@Secured
	public Response displayNameExists(@QueryParam("name") String name) {
		UserAccount user = null;
		try {
			user = (UserAccount) TIMAATApp.emf.createEntityManager()
				.createQuery("SELECT ua FROM UserAccount ua WHERE ua.displayName=:name")
				.setParameter("name", name)
				.getSingleResult();
		} catch (NoResultException e) {
			return Response.ok().entity(false).build(); //* it is ok if no result was found
		}
		if (user == null) { //? redundant?
			return Response.ok().entity(false).build();
		}
		return Response.ok().entity(true).build();
	}

	@GET
  @Produces(MediaType.TEXT_PLAIN)
	@Path("getIdByDisplayName")
	@Secured
	public Response getIdByDisplayName(@QueryParam("name") String name) {
		UserAccount user = null;
		try {
			user = (UserAccount) TIMAATApp.emf.createEntityManager()
				.createQuery("SELECT ua FROM UserAccount ua WHERE ua.displayName=:name")
				.setParameter("name", name)
				.getSingleResult();
		} catch (NoResultException e) {
			return Response.status(Status.NOT_FOUND).entity("User not found!").build();
		}
		if (user == null) { //? redundant?
			return Response.status(Status.NOT_FOUND).entity("User not found!").build();
		}
		return Response.ok().entity(user.getId()).build();
	}

	@GET
  @Produces(MediaType.TEXT_PLAIN)
	@Path("getAccountNameByDisplayName/{displayName}")
	@Secured
	public Response getAccountNameByDisplayName(@PathParam("displayName") String displayName) {
		UserAccount user = null;
		try {
			user = (UserAccount) TIMAATApp.emf.createEntityManager()
				.createQuery("SELECT ua FROM UserAccount ua WHERE ua.displayName=:displayName")
				.setParameter("displayName", displayName)
				.getSingleResult();
		} catch (NoResultException e) {
			return Response.status(Status.NOT_FOUND).entity("User not found!").build();
		}
		if (user == null) { //? redundant?
			return Response.status(Status.NOT_FOUND).entity("User not found!").build();
		}
		return Response.ok().entity(user.getAccountName()).build();
	}

	@PATCH
  @Produces(MediaType.APPLICATION_JSON)
  @Consumes(MediaType.APPLICATION_JSON)
	@Path("permissionFix")
	@Secured
	public Response updateAllPermissions(@QueryParam("authToken") String authToken) {
		// verify auth token
		int userId = 0;
		if (AuthenticationFilter.isTokenValid(authToken)) {
			userId = AuthenticationFilter.getTokenClaimUserId(authToken);
		} else {
			return Response.status(Status.UNAUTHORIZED).build();
		}
		if (userId != 1) { // only Admin may update file lengths
			return Response.status(Status.FORBIDDEN).build();
		}

		System.out.println("add missing permissions - mediumAnalysisLists");
		EntityManager entityManager = TIMAATApp.emf.createEntityManager();
		EntityTransaction entityTransaction = entityManager.getTransaction();
		Query query;
		String sql;
		// fix all MediumAnalysisList permissions
		try {
			List<MediumAnalysisList> mediumAnalysisListList = new ArrayList<>();
			sql = "SELECT mal FROM MediumAnalysisList mal WHERE mal.id NOT IN (SELECT uahmal.mediumAnalysisList.id FROM UserAccountHasMediumAnalysisList uahmal)";
			query = entityManager.createQuery(sql);
			mediumAnalysisListList = castList(MediumAnalysisList.class, query.getResultList());
			for (MediumAnalysisList mediumAnalysisList : mediumAnalysisListList) {
				UserAccount userAccount = mediumAnalysisList.getCreatedByUserAccount();
				UserAccountHasMediumAnalysisList userAccountHasMediumAnalysisList = new UserAccountHasMediumAnalysisList(userAccount, mediumAnalysisList);
				PermissionType permissionType = new PermissionType();
				permissionType.setId(4);
				userAccountHasMediumAnalysisList.setPermissionType(permissionType);
				mediumAnalysisList.addUserAccountHasMediumAnalysisList(userAccountHasMediumAnalysisList);
				entityTransaction.begin();
				entityManager.merge(mediumAnalysisList);
				entityManager.persist(mediumAnalysisList);
				entityTransaction.commit();
				entityManager.refresh(mediumAnalysisList);
			}
		} catch (Exception e) {
			System.err.println(e);
			e.printStackTrace();
		}

		System.out.println("add missing permissions - mediaCollections");
		// fix all MediaCollection permissions
		try {
			List<MediaCollection> mediaCollectionList = new ArrayList<>();
			sql = "SELECT mal FROM MediaCollection mal WHERE mal.id NOT IN (SELECT uahmal.mediaCollection.id FROM UserAccountHasMediaCollection uahmal)";
			query = entityManager.createQuery(sql);
			mediaCollectionList = castList(MediaCollection.class, query.getResultList());
			for (MediaCollection mediaCollection : mediaCollectionList) {
				UserAccount userAccount = mediaCollection.getCreatedByUserAccount();
				if (userAccount == null) {
					userAccount = entityManager.find(UserAccount.class, 1); //* if entry is null, give privileges to admin account (all media collections that were created before created_by_user_account attribute was available)
				}
				UserAccountHasMediaCollection userAccountHasMediaCollection = new UserAccountHasMediaCollection(userAccount, mediaCollection);
				PermissionType permissionType = new PermissionType();
				permissionType.setId(4);
				userAccountHasMediaCollection.setPermissionType(permissionType);
				mediaCollection.addUserAccountHasMediaCollection(userAccountHasMediaCollection);
				entityTransaction.begin();
				entityManager.merge(mediaCollection);
				entityManager.persist(mediaCollection);
				entityTransaction.commit();
				entityManager.refresh(mediaCollection);
			}
		} catch (Exception e) {
			System.err.println(e);
			e.printStackTrace();
		}
		// TODO fix all Work permissions
		// TODO fix all CategorySet permissions
		System.out.println("Completed updating all missing permissions.");
		return Response.ok().build();
	}

	public static int getPermissionLevelForAnalysisList(int userAccountId, int mediumAnalysisListId) {
		// System.out.println("getPermissionLevelForAnalysisList - userId: " + userAccountId + " listId: " + mediumAnalysisListId);
		if (userAccountId == 1) return 4; //* admin always has full access

		UserAccountHasMediumAnalysisList uahmal = null;
		try {
			String countQuerySQL = "SELECT COUNT (uahmal) FROM UserAccountHasMediumAnalysisList uahmal WHERE uahmal.userAccount.id = :userAccountId AND uahmal.mediumAnalysisList.id = :mediumAnalysisListId";
			Query countQuery = TIMAATApp.emf.createEntityManager()
													.createQuery(countQuerySQL)
													.setParameter("userAccountId", userAccountId)
													.setParameter("mediumAnalysisListId", mediumAnalysisListId);
			long recordsTotal = (long) countQuery.getSingleResult();
			if (recordsTotal == 1) {
				uahmal = (UserAccountHasMediumAnalysisList) TIMAATApp.emf.createEntityManager()
					.createQuery("SELECT uahmal FROM UserAccountHasMediumAnalysisList uahmal WHERE uahmal.userAccount.id = :userAccountId AND uahmal.mediumAnalysisList.id = :mediumAnalysisListId")
					.setParameter("userAccountId", userAccountId)
					.setParameter("mediumAnalysisListId", mediumAnalysisListId)
					.getSingleResult();
			}
		} catch (NoResultException nre) {
			// System.out.println("No entry found. Setting value to 0");
			nre.printStackTrace();
			return 0; // no permission set for this user on this mediumAnalysisList
		} catch (Exception e) {
			// System.out.println("No entry found. Setting value to 0");
			e.printStackTrace();
			return 0; // no permission set for this user on this mediumAnalysisList
		}
		// System.out.println("getPermissionLevelForAnalysisList - permission level found: " + uahmal.getPermissionType().getId());

		EntityManager entityManager = TIMAATApp.emf.createEntityManager();
		MediumAnalysisList mediumAnalysisList = entityManager.find(MediumAnalysisList.class, mediumAnalysisListId);
		byte globalPermissionType = mediumAnalysisList.getGlobalPermission();
		int permissionType = 0;
		if (uahmal != null)
		{
			permissionType = uahmal.getPermissionType().getId();
		}
		if ( permissionType < 1 && globalPermissionType < 1) {
			return 0;
		} else {
			int maxPermissionType = Math.max(permissionType, globalPermissionType);
			return maxPermissionType;
		}
	}

	public static int getPermissionLevelForMediumCollection(int userAccountId, int mediaCollectionId) {
		// System.out.println("getPermissionLevelForMediaCollection - userId: " + userAccountId + " listId: " + mediaCollectionId);
		if (userAccountId == 1) return 4; //* admin always has full access

		UserAccountHasMediaCollection uahmc = null;
		try {
			String countQuerySQL = "SELECT COUNT (uahmc) FROM UserAccountHasMediaCollection uahmc WHERE uahmc.userAccount.id = :userAccountId AND uahmc.mediaCollection.id = :mediaCollectionId";
			Query countQuery = TIMAATApp.emf.createEntityManager()
													.createQuery(countQuerySQL)
													.setParameter("userAccountId", userAccountId)
													.setParameter("mediaCollectionId", mediaCollectionId);
			long recordsTotal = (long) countQuery.getSingleResult();
			if (recordsTotal == 1) {
				uahmc = (UserAccountHasMediaCollection) TIMAATApp.emf.createEntityManager()
					.createQuery("SELECT uahmc FROM UserAccountHasMediaCollection uahmc WHERE uahmc.userAccount.id = :userAccountId AND uahmc.mediaCollection.id = :mediaCollectionId")
					.setParameter("userAccountId", userAccountId)
					.setParameter("mediaCollectionId", mediaCollectionId)
					.getSingleResult();
			}
		} catch (NoResultException nre) {
			// System.out.println("No entry found. Setting value to 0");
			nre.printStackTrace();
			return 0; // no permission set for this user on this mediaCollection
		} catch (Exception e) {
			// System.out.println("No entry found. Setting value to 0");
			e.printStackTrace();
			return 0; // no permission set for this user on this mediaCollection
		}
		// System.out.println("getPermissionLevelForMediaCollection- permission level found: " + uahmc.getPermissionType().getId());
		EntityManager entityManager = TIMAATApp.emf.createEntityManager();
		MediaCollection mediaCollection = entityManager.find(MediaCollection.class, mediaCollectionId);
		byte globalPermissionType = mediaCollection.getGlobalPermission();
		int permissionType = 0;
		if (uahmc != null)
		{
			permissionType = uahmc.getPermissionType().getId();
		}
		if ( permissionType < 1 && globalPermissionType < 1) {
			return 0;
		} else {
			int maxPermissionType = Math.max(permissionType, globalPermissionType);
			return maxPermissionType;
		}
	}

	public static <T> List<T> castList(Class<? extends T> clazz, Collection<?> c) {
		List<T> r = new ArrayList<T>(c.size());
		for(Object o: c)
			r.add(clazz.cast(o));
		return r;
    }

}
