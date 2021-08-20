/**
 * 
 */
package de.bitgilde.TIMAAT.rest.filter;

import java.io.IOException;
import java.security.Key;

import jakarta.annotation.Priority;
import jakarta.ws.rs.container.ContainerRequestContext;
import jakarta.ws.rs.container.ContainerRequestFilter;
import jakarta.ws.rs.core.HttpHeaders;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.Provider;
import jakarta.ws.rs.Priorities;

import de.bitgilde.TIMAAT.TIMAATApp;
import de.bitgilde.TIMAAT.model.AccountSuspendedException;
import de.bitgilde.TIMAAT.model.FIPOP.UserAccount;
import de.bitgilde.TIMAAT.model.FIPOP.UserAccountStatus;
import de.bitgilde.TIMAAT.rest.Secured;
import de.bitgilde.TIMAAT.security.TIMAATKeyGenerator;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.InvalidClaimException;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;

/**
 * @author Jens-Martin Loebel <loebel@bitgilde.de>
 *
 */
@Secured
@Provider
@Priority(Priorities.AUTHENTICATION)
public class AuthenticationFilter implements ContainerRequestFilter {

	private static final String REALM = "TIMAAT";
  private static final String AUTHENTICATION_SCHEME = "Bearer";

	@Override
	public void filter(ContainerRequestContext requestContext) throws IOException {
		// Get the Authorization header from the request
    String authorizationHeader = requestContext.getHeaderString(HttpHeaders.AUTHORIZATION);

    // Validate the Authorization header
    if (!isTokenBasedAuthentication(authorizationHeader)) {
      abortWithUnauthorized(requestContext);
      return;
    }

    // Extract the token from the Authorization header
    String token = authorizationHeader.substring(AUTHENTICATION_SCHEME.length()).trim();

    try {

      // Validate the token
      String username = validateToken(token);
      
      try {
        // Validate user status
        UserAccount user = validateAccountStatus(username);
        
        // Authentication succeeded, set request context
        requestContext.setProperty("TIMAAT.userID", user.getId());
        requestContext.setProperty("TIMAAT.userName", user.getAccountName());
        requestContext.setProperty("TIMAAT.user", user);

      } catch (AccountSuspendedException e) {
        abortWithForbidden(requestContext, "This account has been suspended.");
      }
        
    } catch (Exception e) {
        abortWithUnauthorized(requestContext);
    }
	}
	
	private boolean isTokenBasedAuthentication(String authorizationHeader) {

    // Check if the Authorization header is valid
    // It must not be null and must be prefixed with "Bearer" plus a whitespace
    // The authentication scheme comparison must be case-insensitive
    return authorizationHeader != null && authorizationHeader.toLowerCase()
                .startsWith(AUTHENTICATION_SCHEME.toLowerCase() + " ");
  }

  private void abortWithUnauthorized(ContainerRequestContext requestContext) {
    // Abort the filter chain with a 401 status code response
    // The WWW-Authenticate header is sent along with the response
    requestContext.abortWith(
              Response.status(Response.Status.UNAUTHORIZED)
                      .header(HttpHeaders.WWW_AUTHENTICATE, 
                              AUTHENTICATION_SCHEME + " realm=\"" + REALM + "\"")
                      .build());
  }

  private void abortWithForbidden(ContainerRequestContext requestContext, String reason) {
    // Abort the filter chain with a 403 status code response
    // The WWW-Authenticate header is sent along with the response
    requestContext.abortWith(
              Response.status(Response.Status.FORBIDDEN)
                      .header(HttpHeaders.WWW_AUTHENTICATE, 
                              AUTHENTICATION_SCHEME + " realm=\"" + REALM + "\"")
                      .entity("{\"reason\":\""+reason+"\"}")
                      .build());
  }
  
  public static UserAccount validateAccountStatus(String username) throws Exception {
    // verify user and user status
    if ( username == null ) throw new Exception("provided credentials invalid");
  
    UserAccount user = (UserAccount) TIMAATApp.emf.createEntityManager()
      .createQuery("SELECT ua FROM UserAccount ua WHERE ua.accountName=:username")
      .setParameter("username", username)
      .getSingleResult();
    
    // don't allow suspended accounts
    if ( user.getUserAccountStatus() == UserAccountStatus.suspended ) 
      throw new AccountSuspendedException();
    
    return user;
  }

  public static String validateToken(String token) {
      // Check if the token was issued by the server and if it's not expired
      // Throw an Exception if the token is invalid
    Key key = TIMAATKeyGenerator.generateKey();
    String username = "";
      try {
        username = Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token).getBody().getSubject();
      } catch (JwtException e) {
        e.printStackTrace();
      } catch (Exception e) {
        e.printStackTrace();   
      }
  return username;
  }

  public static Boolean isTokenValid(String token) {
      Jws<Claims> jws;
      try {
        jws = Jwts.parserBuilder().setSigningKey(TIMAATKeyGenerator.generateKey()).build().parseClaimsJws(token);
      } catch (JwtException e) {
          e.printStackTrace();
          return false;
      }
      return true;
  }

  public static int getTokenClaimUserId(String token) {
      Key key = TIMAATKeyGenerator.generateKey();
      Claims claims = null;
      try {
          claims = Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token).getBody();
      } catch(InvalidClaimException ice) {
        ice.printStackTrace();
      }
      int id = claims.get("id", Integer.class);
      return id;
  }

}
