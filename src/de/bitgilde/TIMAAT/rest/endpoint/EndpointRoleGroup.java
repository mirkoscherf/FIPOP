package de.bitgilde.TIMAAT.rest.endpoint;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.jvnet.hk2.annotations.Service;

import de.bitgilde.TIMAAT.SelectElement;
import de.bitgilde.TIMAAT.TIMAATApp;
import de.bitgilde.TIMAAT.model.DataTableInfo;
import de.bitgilde.TIMAAT.model.FIPOP.Language;
import de.bitgilde.TIMAAT.model.FIPOP.Role;
import de.bitgilde.TIMAAT.model.FIPOP.RoleGroup;
import de.bitgilde.TIMAAT.model.FIPOP.RoleGroupTranslation;
import de.bitgilde.TIMAAT.rest.Secured;
import de.bitgilde.TIMAAT.security.UserLogManager;
import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityTransaction;
import jakarta.persistence.Query;
import jakarta.servlet.ServletContext;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.PATCH;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.container.ContainerRequestContext;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.Response.Status;
import jakarta.ws.rs.core.UriInfo;

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
@Service
@Path("/roleGroup")
public class EndpointRoleGroup {
  @Context
	private UriInfo uriInfo;
	@Context
	ContainerRequestContext containerRequestContext;
	@Context
  ServletContext servletContext;

  @GET
	@Produces(MediaType.APPLICATION_JSON)
	@Secured
	@Path("list")
	public Response getRoleGroupList(@QueryParam("draw") Integer draw,
																	 @QueryParam("start") Integer start,
																	 @QueryParam("length") Integer length,
																	 @QueryParam("orderby") String orderby,
																	 @QueryParam("dir") String direction,
																	 @QueryParam("search") String search,
																	 @QueryParam("language") String languageCode)
	{
		// System.out.println("EndpointRole: getRoleGroupList: draw: "+draw+" start: "+start+" length: "+length+" orderby: "+orderby+" dir: "+direction+" search: "+search);
		if ( draw == null ) draw = 0;

		if ( languageCode == null) languageCode = "default"; // as long as multi-language is not implemented yet, use the 'default' language entry
		String languageQuery = "SELECT rgt.name FROM RoleGroupTranslation rgt WHERE rgt.roleGroup.id = rg.id AND rgt.language.id = (SELECT l.id from Language l WHERE l.code = '"+languageCode+"')";

		// sanitize user input
		if ( direction != null && direction.equalsIgnoreCase("desc") ) direction = "DESC"; else direction = "ASC";
		String column = "rg.id";
		if ( orderby != null) {
			if (orderby.equalsIgnoreCase("name")) column = "rgt.name";
		}

		EntityManager entityManager = TIMAATApp.emf.createEntityManager();
		// calculate total # of records
		Query countQuery = TIMAATApp.emf.createEntityManager().createQuery("SELECT COUNT(rg) FROM RoleGroup rg");
		long recordsTotal = (long) countQuery.getSingleResult();
		long recordsFiltered = recordsTotal;

		// search
		Query query;
		String sql;
		List<RoleGroup> roleGroupList = new ArrayList<>();
		if (search != null && search.length() > 0 ) {
			// calculate search result # of records
			sql = "SELECT DISTINCT rg FROM RoleGroup rg WHERE lower("+languageQuery+") LIKE lower(concat('%', :search, '%')) ORDER BY "+column+" "+direction;
			query = entityManager.createQuery(sql)
													 .setParameter("name", search);
			roleGroupList = castList(RoleGroup.class, query.getResultList());
			if ( start != null && start > 0 ) query.setFirstResult(start);
			if ( length != null && length > 0 ) query.setMaxResults(length);
			if ( length == -1) { // display all results
				length = roleGroupList.size();
				query.setMaxResults(length);
			}
			recordsFiltered = roleGroupList.size();
			List<RoleGroup> filteredRoleGroupList = new ArrayList<>();
			int i = start;
			int end;
			if ((recordsFiltered - start) < length) {
				end = (int)recordsFiltered;
			}
			else {
				end = start + length;
			}
			for (; i < end; i++) {
				filteredRoleGroupList.add(roleGroupList.get(i));
			}
			return Response.ok().entity(new DataTableInfo(draw, recordsTotal, recordsFiltered, filteredRoleGroupList)).build();
		} else {
			query = TIMAATApp.emf.createEntityManager().createQuery(
			// "SELECT r FROM Role r ORDER BY "+column+" "+direction);
			"SELECT rg FROM RoleGroup rg, RoleGroupTranslation rgt WHERE rg.id = rgt.roleGroup.id ORDER BY "+column+" "+direction);
			if ( start != null && start > 0 ) query.setFirstResult(start);
			if ( length != null && length > 0 ) query.setMaxResults(length);
			roleGroupList = castList(RoleGroup.class, query.getResultList());
		}
		return Response.ok().entity(new DataTableInfo(draw, recordsTotal, recordsFiltered, roleGroupList)).build();
  }
	@GET
	@Produces(MediaType.APPLICATION_JSON)
	@Secured
	@Path("{id}")
	public Response getRoleGroup(@PathParam("id") Integer id) {
		// System.out.println("EndpointRole: getRoleGroup with id "+ id);
		EntityManager entityManager = TIMAATApp.emf.createEntityManager();
		RoleGroup roleGroup = entityManager.find(RoleGroup.class, id);

		return Response.ok().entity(roleGroup).build();
  }

	@GET
	@Produces(MediaType.APPLICATION_JSON)
	@Secured
	@Path("selectList")
	public Response getRoleGroupSelectList(@QueryParam("search") String search,
																				 @QueryParam("page") Integer page,
																				 @QueryParam("per_page") Integer per_page,
																				 @QueryParam("language") String languageCode) {
		// returns list of id and name combinations of all role groups
		// System.out.println("EndpointRole: getRoleGroupSelectList - search string: "+ search);
		if ( languageCode == null) languageCode = "default"; // as long as multi-language is not implemented yet, use the 'default' language entry

		// search
		Query query;
		if (search != null && search.length() > 0) {
			query = TIMAATApp.emf.createEntityManager().createQuery(
				"SELECT rgt FROM RoleGroupTranslation rgt WHERE rgt.language.id = (SELECT l.id FROM Language l WHERE l.code = '"+languageCode+"') AND lower(rgt.name) LIKE lower(concat('%', :name,'%')) ORDER BY rgt.name ASC");
				query.setParameter("name", search);
		} else {
			query = TIMAATApp.emf.createEntityManager().createQuery(
				"SELECT rgt FROM RoleGroupTranslation rgt WHERE rgt.language.id = (SELECT l.id FROM Language l WHERE l.code = '"+languageCode+"') ORDER BY rgt.name ASC");
		}

		if (page != null && page > 0 && per_page != null && per_page > 0) {
			query.setFirstResult(page*per_page);
			query.setMaxResults(per_page);
		}
		List<SelectElement> roleGroupSelectList = new ArrayList<>();
		List<RoleGroupTranslation> roleGroupTranslationList = castList(RoleGroupTranslation.class, query.getResultList());
		for (RoleGroupTranslation roleGroupTranslation : roleGroupTranslationList) {
			roleGroupSelectList.add(new SelectElement(roleGroupTranslation.getRoleGroup().getId(),
																								roleGroupTranslation.getName()));
		}
		return Response.ok().entity(roleGroupSelectList).build();
	}

	@GET
	@Produces(MediaType.APPLICATION_JSON)
	@Secured
	@Path("{id}/hasList")
	public Response getRoleGroupHasRoleList(@PathParam("id") Integer roleGroupId)
	{
		// System.out.println("EndpointRole: getRoleGroupHasRoleList - ID: "+ roleGroupId);
		EntityManager entityManager = TIMAATApp.emf.createEntityManager();
		RoleGroup roleGroup = entityManager.find(RoleGroup.class, roleGroupId);
		List<Role> roleList = roleGroup.getRoles();

		return Response.ok().entity(roleList).build();
  }

	@POST
	@Produces(MediaType.APPLICATION_JSON)
	@Consumes(MediaType.APPLICATION_JSON)
	@Path("{id}")
	@Secured
	public Response createRoleGroup(@PathParam("id") int id,
																	String jsonData) {
		// System.out.println("EndpointRole: createRoleGroup " + jsonData);

		ObjectMapper mapper = new ObjectMapper();
		EntityManager entityManager = TIMAATApp.emf.createEntityManager();
		RoleGroup roleGroup = new RoleGroup();
		// sanitize object data
		roleGroup.setId(0);

		// persist roleGroup
		EntityTransaction entityTransaction = entityManager.getTransaction();
		entityTransaction.begin();
		entityManager.persist(roleGroup);
		entityManager.flush();
		entityTransaction.commit();
		entityManager.refresh(roleGroup);

		RoleGroup roleGroupContent = null;
		try {
			roleGroupContent = mapper.readValue(jsonData, RoleGroup.class);
		} catch (IOException e) {
			e.printStackTrace();
			return Response.status(Status.BAD_REQUEST).build();
		}
		if ( roleGroupContent == null) {
			return Response.status(Status.BAD_REQUEST).build();
		}

		roleGroupContent.getRoleGroupTranslations().get(0).setRoleGroup(roleGroup);
		roleGroup.setRoleGroupTranslations(roleGroupContent.getRoleGroupTranslations());
		roleGroup.setRoles(roleGroupContent.getRoles());

		// persist roleGroup data
		entityTransaction.begin();
		entityManager.merge(roleGroup);
		entityManager.persist(roleGroup);
		entityTransaction.commit();
		entityManager.refresh(roleGroup);
		for (Role role : roleGroup.getRoles()) {
			entityManager.refresh(role);
		}

		// add log entry
		UserLogManager.getLogger()
									.addLogEntry((int) containerRequestContext.getProperty("TIMAAT.userID"),
															 UserLogManager.LogEvents.ROLEGROUPCREATED);
		return Response.ok().entity(roleGroup).build();
	}

	@PATCH
	@Produces(MediaType.APPLICATION_JSON)
	@Consumes(MediaType.APPLICATION_JSON)
	@Path("/{id}")
	@Secured
	public Response updateRoleGroup(@PathParam("id") int id,
																	String jsonData) {
		// System.out.println("EndpointRole: updateRoleGroup - jsonData: "+ jsonData);
		ObjectMapper mapper = new ObjectMapper();
		mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
		RoleGroup updatedRoleGroup = null;
		EntityManager entityManager = TIMAATApp.emf.createEntityManager();
		RoleGroup roleGroup = entityManager.find(RoleGroup.class, id);
		if ( roleGroup == null ) {
			return Response.status(Status.NOT_FOUND).build();
		}
		// parse JSON data
		try {
			updatedRoleGroup = mapper.readValue(jsonData, RoleGroup.class);
		} catch (IOException e) {
			System.out.println("EndpointRole: updateRoleGroup: IOException e!");
			e.printStackTrace();
			return Response.status(Status.BAD_REQUEST).build();
		}
		if ( updatedRoleGroup == null ) {
			return Response.notModified().build();
		}

		List<Role> oldRoles = roleGroup.getRoles();
		// update role group
		roleGroup.setRoles(updatedRoleGroup.getRoles());

		// persist role group
		EntityTransaction entityTransaction = entityManager.getTransaction();
		entityTransaction.begin();
		entityManager.merge(roleGroup);
		entityManager.persist(roleGroup);
		entityTransaction.commit();
		entityManager.refresh(roleGroup);
	  for (Role role : roleGroup.getRoles()) {
			entityManager.refresh(role);
		}
		for (Role role : oldRoles) {
			entityManager.refresh(role);
		}

		// add log entry
		UserLogManager.getLogger()
									.addLogEntry((int) containerRequestContext.getProperty("TIMAAT.userID"),
															 UserLogManager.LogEvents.ROLEGROUPEDITED);

		return Response.ok().entity(roleGroup).build();
	}

	@DELETE
	@Produces(MediaType.APPLICATION_JSON)
	@Path("{id}")
	@Secured
	public Response deleteRoleGroup(@PathParam("id") int id) {
		// System.out.println("EndpointRole: deleteRoleGroup");
		EntityManager entityManager = TIMAATApp.emf.createEntityManager();
		RoleGroup roleGroup = entityManager.find(RoleGroup.class, id);

		if ( roleGroup == null ) return Response.status(Status.NOT_FOUND).build();

		List<Role> roleList = roleGroup.getRoles();

		EntityTransaction entityTransaction = entityManager.getTransaction();
		entityTransaction.begin();
		entityManager.remove(roleGroup);
		//* ON DELETE CASCADE deletes connected role_group_translation entries
		entityTransaction.commit();
		for (Role role : roleList) {
			entityManager.refresh(role);
		}

		// add log entry
		UserLogManager.getLogger()
									.addLogEntry((int) containerRequestContext
									.getProperty("TIMAAT.userID"), UserLogManager.LogEvents.ROLEGROUPDELETED);
		return Response.ok().build();
	}

	@POST
  @Produces(MediaType.APPLICATION_JSON)
  @Consumes(MediaType.APPLICATION_JSON)
	@Path("{roleGroupId}/translation/{id}")
	@Secured
	public Response createRoleGroupTranslation(@PathParam("id") int id,
																						 @PathParam("roleGroupId") int roleGroupId,
																						 String jsonData) {
		// System.out.println("EndpointRole: createRoleGroupTranslation: jsonData: "+jsonData);
		ObjectMapper mapper = new ObjectMapper();
		RoleGroupTranslation newRoleGroupTranslation = null;
		EntityManager entityManager = TIMAATApp.emf.createEntityManager();

		// parse JSON data
		try {
			newRoleGroupTranslation = mapper.readValue(jsonData, RoleGroupTranslation.class);
		} catch (IOException e) {
			System.out.println("EndpointRole: createRoleGroupTranslation: IOException e !");
			e.printStackTrace();
			return Response.status(Status.BAD_REQUEST).build();
		}
		if ( newRoleGroupTranslation == null ) {
			System.out.println("EndpointRole: createRoleGroupTranslation: newRoleGroupTranslation == null !");
			return Response.status(Status.BAD_REQUEST).build();
		}
		// sanitize object data
		newRoleGroupTranslation.setId(0);
		Language language = entityManager.find(Language.class, newRoleGroupTranslation.getLanguage().getId());
		newRoleGroupTranslation.setLanguage(language);
		RoleGroup roleGroup = entityManager.find(RoleGroup.class, roleGroupId);
		newRoleGroupTranslation.setRoleGroup(roleGroup);

		// update log metadata
		// Not necessary, a translation will always be created in conjunction with a medium

		// persist translation
		EntityTransaction entityTransaction = entityManager.getTransaction();
		entityTransaction.begin();
		entityManager.persist(language);
		entityManager.persist(newRoleGroupTranslation);
		entityManager.flush();
		newRoleGroupTranslation.setLanguage(language);
		newRoleGroupTranslation.setRoleGroup(roleGroup);
		entityTransaction.commit();
		entityManager.refresh(newRoleGroupTranslation);
		entityManager.refresh(language);
		entityManager.refresh(roleGroup);

		// add log entry
		// UserLogManager.getLogger()
		// 							.addLogEntry((int) containerRequestContext
		// 							.getProperty("TIMAAT.userID"), UserLogManager.LogEvents.ROLEGROUPCREATED);

		return Response.ok().entity(newRoleGroupTranslation).build();
	}

	@PATCH
	@Produces(MediaType.APPLICATION_JSON)
	@Consumes(MediaType.APPLICATION_JSON)
	@Path("translation/{id}")
	@Secured
	public Response updateRoleGroupTranslation(@PathParam("id") int id,
																						 String jsonData) {
		// System.out.println("EndpointRole: update translation - jsonData: " + jsonData);

		ObjectMapper mapper = new ObjectMapper();
		RoleGroupTranslation updatedRoleGroupTranslation = null;
		EntityManager entityManager = TIMAATApp.emf.createEntityManager();
		RoleGroupTranslation roleGroupTranslation = entityManager.find(RoleGroupTranslation.class, id);

		if ( roleGroupTranslation == null ) {
			return Response.status(Status.NOT_FOUND).build();
		}
		// parse JSON data
		try {
			updatedRoleGroupTranslation = mapper.readValue(jsonData, RoleGroupTranslation.class);
		} catch (IOException e) {
			System.out.println("EndpointRole: update translation: IOException e!");
			e.printStackTrace();
			return Response.status(Status.BAD_REQUEST).build();
		}
		if ( updatedRoleGroupTranslation == null ) {
			return Response.notModified().build();
		}

		// update translation
		if ( updatedRoleGroupTranslation.getName() != null ) roleGroupTranslation.setName(updatedRoleGroupTranslation.getName());
		if ( updatedRoleGroupTranslation.getLanguage() != null ) roleGroupTranslation.setLanguage(updatedRoleGroupTranslation.getLanguage());

		EntityTransaction entityTransaction = entityManager.getTransaction();
		entityTransaction.begin();
		entityManager.merge(roleGroupTranslation);
		entityManager.persist(roleGroupTranslation);
		entityTransaction.commit();
		entityManager.refresh(roleGroupTranslation);

		// add log entry
		UserLogManager.getLogger()
									.addLogEntry((int) containerRequestContext
									.getProperty("TIMAAT.userID"), UserLogManager.LogEvents.ROLEGROUPEDITED);
		return Response.ok().entity(roleGroupTranslation).build();
	}

	// TODO deleteRoleGroupTranslation

  public static <T> List<T> castList(Class<? extends T> clazz, Collection<?> c) {
    List<T> r = new ArrayList<T>(c.size());
    for(Object o: c)
      r.add(clazz.cast(o));
    return r;
	}

}