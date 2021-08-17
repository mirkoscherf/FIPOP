package de.bitgilde.TIMAAT.rest.endpoint;

import java.math.BigInteger;
import java.nio.charset.Charset;
import java.security.Key;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Base64;
import java.util.Collection;
import java.util.Date;
import java.util.List;

import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityTransaction;
import javax.security.auth.login.CredentialException;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.PATCH;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.UriInfo;
import jakarta.ws.rs.core.Response.Status;

import org.jvnet.hk2.annotations.Service;

import de.bitgilde.TIMAAT.TIMAATApp;
import de.bitgilde.TIMAAT.model.AccountSuspendedException;
import de.bitgilde.TIMAAT.model.FIPOP.UserAccount;
import de.bitgilde.TIMAAT.model.FIPOP.UserAccountHasMediumAnalysisList;
import de.bitgilde.TIMAAT.model.FIPOP.UserAccountStatus;
import de.bitgilde.TIMAAT.model.FIPOP.UserPassword;
import de.bitgilde.TIMAAT.model.FIPOP.UserPasswordOldHash;
import de.bitgilde.TIMAAT.rest.Secured;
import de.bitgilde.TIMAAT.rest.UserCredentials;
import de.bitgilde.TIMAAT.rest.filter.AuthenticationFilter;
import de.bitgilde.TIMAAT.security.TIMAATKeyGenerator;
import de.bitgilde.TIMAAT.security.UserLogManager;
import de.mkammerer.argon2.Argon2Advanced;
import de.mkammerer.argon2.Argon2Factory;
import de.mkammerer.argon2.Argon2Factory.Argon2Types;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;

/**
*
* @author Jens-Martin Loebel <loebel@bitgilde.de>
*/

@Service
@Path("/authenticate")
public class EndpointAuthentication {
	
	@Context
	private UriInfo uriInfo;

	@POST
	@Produces(MediaType.APPLICATION_JSON)
	public Response authenticateUser(UserCredentials credentials) {

		String username = credentials.getUsername();
		String password = credentials.getPassword();
		
		try {

			// Authenticate the user using the credentials provided
			UserAccount user = authenticate(username, password);

			// Issue a token for the user
			String token = issueToken(username, user.getId());

			// write log entry
			UserLogManager.getLogger().addLogEntry(user.getId(),UserLogManager.LogEvents.LOGIN);
			// Return the token on the response
			return Response.ok("{\"token\":\""+token+"\","
					+ "\"id\":"+user.getId()+","
					// + "\"accountName\":\""+user.getAccountName()+"\""
					+ "\"displayName\":\""+user.getDisplayName()+"\""
					+ "}").build();

		} catch (AccountSuspendedException se) {
			return Response.status(Response.Status.FORBIDDEN)
					.entity("{\"reason\":\"This account has been suspended.\"}")
					.build();
		} catch (Exception e) {
			System.out.println(e.getClass());
			return Response.status(Response.Status.FORBIDDEN).build();
		}
	}
	
	@GET
  @Produces(MediaType.APPLICATION_JSON)
	public Response getAuthenticationInfo() {
		
		return Response.ok("{"
			+ "\"method\":\"argon2id\","
			+ "\"params\": {"
			+ ""
			+ "}"				
			+ "}").build();
	}

	@POST
	@Produces(MediaType.APPLICATION_JSON)
	@Path("permissionLevel/{mediumAnalysisListId}")
	@Secured
	public Response getPermissionLevel(@PathParam("mediumAnalysisListId") int mediumAnalysisListId,
																		 @QueryParam("authToken") String authToken) {
		// verify auth token
		if ( authToken == null ) return Response.status(401).build();
		UserAccount userAccount = null;
		try {
			String username = AuthenticationFilter.validateToken(authToken);
			try {
				// Validate user status
				userAccount = AuthenticationFilter.validateAccountStatus(username);
			} catch (AccountSuspendedException e) {
				// can't occur as user wouldn't be able to log in in the first place
				return Response.status(Status.FORBIDDEN).entity("This account has been suspended.").build();
			}
		} catch (Exception e) {
			return Response.status(Status.UNAUTHORIZED).build();
		}

		int permissionType = 0;
		UserAccountHasMediumAnalysisList userAccountHasMediumAnalysisList = null;
		EntityManager entityManager = TIMAATApp.emf.createEntityManager();
		int userAccountId = userAccount.getId();
		String sql = "SELECT uahmal FROM UserAccountHasMediumAnalysisList uahmal WHERE uahmal.userAccount.id = :userAccountId AND uahmal.mediumAnalysisList.id = :mediumAnalysisListId";
		try {
			userAccountHasMediumAnalysisList = (UserAccountHasMediumAnalysisList) entityManager.createQuery(sql)
				.setParameter("userAccountId", userAccountId)
				.setParameter("mediumAnalysisListId", mediumAnalysisListId)
				.getSingleResult();
		} catch (Exception e) {
			// System.out.println("User is neither mod nor admin");
			// no return here. Admin user needs to access all lists without having an entry everywhere
		}
		if (userAccountHasMediumAnalysisList != null) {
			permissionType = userAccountHasMediumAnalysisList.getPermissionType().getId();
		}
		if (userAccount.getAccountName().compareTo("admin") == 0) { // admin account is always authorized
			permissionType = 4;
		}
		return Response.ok().entity(permissionType).build();
	}

	@POST
	@Produces(MediaType.APPLICATION_JSON)
	@Path("isPasswordValid")
	@Secured
	public Response isPasswordValid(UserCredentials credentials) {
		Boolean isValid = false;
		String username = credentials.getUsername();
		String password = credentials.getPassword();
		try {
			UserAccount user = authenticate(username, password);
		} catch(Exception e) {
			// password does not match password stored in DB
			return Response.ok().entity(isValid).build();
		}
		isValid = true;
		// password does match password stored in DB
		return Response.ok().entity(isValid).build();
	}

	@PATCH
	@Produces(MediaType.APPLICATION_JSON)
	@Path("changePassword")
	@Secured
	public Response changePassword(UserCredentials credentials,
																 @QueryParam("authToken") String authToken) {
		// System.out.println("EndpointAuthentication - changePassword");

		// verify auth token
		String authenticatedUser;
		if ( authToken == null ) return Response.status(401).build();
		try { //* check whether the password change request came from the user whose password shall be changed
			authenticatedUser = AuthenticationFilter.validateToken(authToken);
		} catch(Exception e) {
			// should not occur
			return Response.status(Status.UNAUTHORIZED).build();
		}
		
		// TODO Check if someone tries to change 'gast'-account password and prevent it

		String username = credentials.getUsername();
		String password = credentials.getPassword();
		String newPassword = credentials.getNewPassword();

		//* check that the password of the account of the user, whose auth token is used, will become altered
		if (authenticatedUser.compareTo(username) != 0) {
			return Response.status(Status.UNAUTHORIZED).build();
		};

		UserAccount userAccount = (UserAccount) TIMAATApp.emf.createEntityManager()
			.createQuery("SELECT ua FROM UserAccount ua WHERE ua.accountName=:username")
			.setParameter("username", username)
			.getSingleResult();
		try { //* check again whether current credentials are correct
			userAccount = authenticate(username, password);
		} catch(Exception e) {
			// should not occur
			return Response.status(Status.UNAUTHORIZED).build();
		}

		//* disallow recycling of old passwords
		// hash user password hash using server user account salt
		Argon2Advanced argon2 = Argon2Factory.createAdvanced(Argon2Types.ARGON2id);
		String newHash = argon2.hash(
			8, 		// iterations
			4096,  // memory usage
			1, 		// parallel threads
			newPassword.toCharArray(),
			Charset.defaultCharset(),
			userAccount.getUserPassword().getSalt().getBytes());

		newHash = newHash.substring(newHash.lastIndexOf("$")+1); // remove hash algorithm metadata

		String hexhash = toHex(Base64.getDecoder().decode(newHash));
		while (hexhash.length() < 64) hexhash = "0" + hexhash;

		// compare calculated server hash with DB stored old hashes
		for (UserPasswordOldHash oldHash : userAccount.getUserPasswordOldHash()) {
			if ( hexhash.compareTo(oldHash.getStretchedHashEncrypted()) == 0 ) {
				return Response.status(Status.CONFLICT).build();
			}
		}

		// new password hash is acceptable, store current one in old hash list and store new one in user_password
		EntityManager entityManager = TIMAATApp.emf.createEntityManager();
		UserPassword userPassword = entityManager.find(UserPassword.class, userAccount.getUserPassword().getId());
		if (userPassword == null) return Response.status(Status.NOT_FOUND).build();
		UserPasswordOldHash userPasswordOldHash = new UserPasswordOldHash();
		userPasswordOldHash.setUserAccount(userAccount);
		userPasswordOldHash.setUserPasswordHashType(userPassword.getUserPasswordHashType());
		userPasswordOldHash.setSalt(userPassword.getSalt());
		userPasswordOldHash.setKeyStretchingIterations(userPassword.getKeyStretchingIterations());
		userPasswordOldHash.setStretchedHashEncrypted(userPassword.getStretchedHashEncrypted());

		EntityTransaction entityTransaction = entityManager.getTransaction();
		entityTransaction.begin();
		entityManager.persist(userPasswordOldHash);
		entityManager.flush();
		entityTransaction.commit();
		entityManager.refresh(userPasswordOldHash);

		userPassword.setStretchedHashEncrypted(hexhash);
		entityTransaction.begin();
		entityManager.merge(userPassword);
		entityManager.persist(userPassword);
		entityTransaction.commit();
		entityManager.refresh(userPassword);

		// Issue a new token for the user
		// String token = issueToken(username, user.getId());

		return Response.ok().build();
	}

	
	// ----------------------------------------------------------------------------
	

	private UserAccount authenticate(String username, String password) throws Exception {
		// Authenticate against the FIP-OP database
		// Throw an Exception if the credentials are invalid
		UserAccount user = (UserAccount) TIMAATApp.emf.createEntityManager()
			.createQuery("SELECT ua FROM UserAccount ua WHERE ua.accountName=:username")
			.setParameter("username", username)
			.getSingleResult();
		// check if account is suspended
		if ( user.getUserAccountStatus() == UserAccountStatus.suspended )
			throw new AccountSuspendedException();
		// hash user password hash using server user account salt
		Argon2Advanced argon2 = Argon2Factory.createAdvanced(Argon2Types.ARGON2id);
		String hash = argon2.hash(
			8, 		// iterations
			4096,  // memory usage
			1, 		// parallel threads
			password.toCharArray(),
			Charset.defaultCharset(),
			user.getUserPassword().getSalt().getBytes());

		hash = hash.substring(hash.lastIndexOf("$")+1); // remove hash algorithm metadata
		
		String hexhash = toHex(Base64.getDecoder().decode(hash));
		while (hexhash.length() < 64) hexhash = "0" + hexhash;

		System.out.println(hexhash);
		System.out.println("Stored: "+user.getUserPassword().getStretchedHashEncrypted());
		System.out.println("User logged in: " + user.getDisplayName());

		// compare calculated server hash with DB stored hash
		if ( hexhash.compareTo(user.getUserPassword().getStretchedHashEncrypted()) != 0 )
			throw new CredentialException();

		return user;
	
	}

	private String issueToken(String username, int userID) {
		Key key = TIMAATKeyGenerator.generateKey();
		String token = Jwts.builder()
		// .setHeaderParam("typ", "JWT")
		.setSubject(username)
		.claim("id", userID)
		.setIssuer(uriInfo.getAbsolutePath().toString())
		.setIssuedAt(new Date())
		.setExpiration(toDate(LocalDateTime.now().plusHours(8L)))
		.signWith(key, SignatureAlgorithm.HS512)
		.compact();
	return token;
	}
	
	public static Date toDate(LocalDateTime localDateTime) {
		return Date.from(localDateTime.atZone(ZoneId.systemDefault()).toInstant());
	}
	
	private static String toHex(byte[] arg) {
		return String.format("%x", new BigInteger(1, arg));
	}
	
	private static byte[] hexStringToByteArray(String s) {
		int len = s.length();
		byte[] data = new byte[len / 2];
		for (int i = 0; i < len; i += 2) {
				data[i / 2] = (byte) ((Character.digit(s.charAt(i), 16) << 4)
															+ Character.digit(s.charAt(i+1), 16));
		}
		return data;
	}

	public static <T> List<T> castList(Class<? extends T> clazz, Collection<?> c) {
		List<T> r = new ArrayList<T>(c.size());
		for(Object o: c)
			r.add(clazz.cast(o));
		return r;
    }
	
}
