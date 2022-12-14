package de.bitgilde.TIMAAT.publication;

import java.io.IOException;
import java.util.Base64;

import com.fasterxml.jackson.databind.ObjectMapper;

import de.bitgilde.TIMAAT.TIMAATApp;
import de.bitgilde.TIMAAT.model.FIPOP.Publication;
import de.bitgilde.TIMAAT.model.publication.PublicationAuthentication;
import jakarta.annotation.Priority;
import jakarta.persistence.EntityManager;
import jakarta.ws.rs.Priorities;
import jakarta.ws.rs.container.ContainerRequestContext;
import jakarta.ws.rs.container.ContainerRequestFilter;
import jakarta.ws.rs.core.HttpHeaders;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.Response.Status;
import jakarta.ws.rs.ext.Provider;

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
 * @author Jens-Martin Loebel <loebel@bitgilde.de>
 * @author Mirko Scherf <mscherf@uni-mainz.de>
 *
 */
@SecurePublication
@Provider
@Priority(Priorities.AUTHENTICATION)
public class PublicationAuthenticationFilter implements ContainerRequestFilter {

	@Override
	public void filter(ContainerRequestContext requestContext) throws IOException {

		String slug = requestContext.getUriInfo().getPath().split("/")[0];
		// find publication
		EntityManager em = TIMAATApp.emf.createEntityManager();
		Publication pub = null;
		try {
		pub = em.createQuery("SELECT p FROM Publication p WHERE p.slug=:slug", Publication.class)
		.setParameter("slug", slug).getSingleResult();
		} catch (Exception e) {
			requestContext.abortWith(Response.status(Status.NOT_FOUND).build());
			return;
		}
		if ( pub == null ) {
			requestContext.abortWith(Response.status(Status.NOT_FOUND).build());
			return;
		}

		if ( pub.getAccess() == null || pub.getAccess().equalsIgnoreCase("protected") ) {
			// retrieve authentication settings
			ObjectMapper mapper = new ObjectMapper();
			PublicationAuthentication auth = null;
			try {
				auth = mapper.readValue(pub.getCredentials(), PublicationAuthentication.class);

			} catch (Exception e) {
				e.printStackTrace();
				requestContext.abortWith(Response.serverError().build());
				return;
			}
			if ( auth == null || !auth.getScheme().equalsIgnoreCase("password") ) {
				requestContext.abortWith(Response.serverError().build());
				return;
			}
			// check supplied credentials
			String userAuth = requestContext.getHeaderString("Authorization");
			if ( userAuth == null ) { requireAuthentication(pub, requestContext); return; }
			if ( userAuth.split("\\s+").length > 1 ) userAuth = userAuth.split("\\s+")[1];
			try {
				userAuth = new String(Base64.getDecoder().decode(userAuth));

			} catch (Exception e) {
				requireAuthentication(pub, requestContext);
				return;
			}
			if ( userAuth.split(":").length != 2 ) { requireAuthentication(pub, requestContext); return; }
			else {
				String user = userAuth.split(":")[0];
				String pass = userAuth.split(":")[1];
				if ( user.compareTo(auth.getUser()) != 0 || pass.compareTo(auth.getPassword()) != 0 )
					requireAuthentication(pub, requestContext);
			}




		}

	}

	private void requireAuthentication(Publication pub, ContainerRequestContext requestContext) {
		requestContext.abortWith(Response.status(Response.Status.UNAUTHORIZED)
		        .header(HttpHeaders.WWW_AUTHENTICATE,
		                "Basic" + " realm=\"" + pub.getTitle() + " (TIMAAT Publication)" + "\"")
		        .build());
	}

}
