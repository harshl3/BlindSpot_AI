package com.blindspot.service;

import com.auth0.jwk.Jwk;
import com.auth0.jwk.JwkProvider;
import com.auth0.jwk.UrlJwkProvider;
import com.auth0.jwt.JWT;
import com.auth0.jwt.JWTVerifier;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.interfaces.DecodedJWT;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.security.interfaces.RSAPublicKey;
import java.util.Optional;

@Service
public class FirebaseAuthService {

    private static final Logger log = LoggerFactory.getLogger(FirebaseAuthService.class);
    private static final String FIREBASE_JWKS_URL = "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com";

    private final String projectId;
    private final JwkProvider jwkProvider;

    public FirebaseAuthService(@Value("${firebase.project-id:}") String projectId) {
        this.projectId = projectId;
        try {
            this.jwkProvider = new UrlJwkProvider(URI.create(FIREBASE_JWKS_URL).toURL());
        } catch (Exception e) {
            throw new IllegalStateException("Failed to initialize Firebase JWK provider", e);
        }
    }

    public record AuthenticatedUser(String uid, String email, boolean anonymous) {}

    /**
     * Verifies a Firebase ID token. Returns AuthenticatedUser if valid.
     */
    public Optional<AuthenticatedUser> verifyToken(String bearerToken) {
        if (bearerToken == null || bearerToken.isBlank()) {
            return Optional.empty();
        }

        String token = bearerToken.startsWith("Bearer ") ? bearerToken.substring(7).trim() : bearerToken.trim();
        if (token.isEmpty()) {
            return Optional.empty();
        }

        try {
            DecodedJWT jwt = JWT.decode(token);
            String keyId = jwt.getKeyId();
            if (keyId == null) {
                log.warn("Firebase ID Token missing 'kid' in header");
                return Optional.empty();
            }

            Jwk jwk = jwkProvider.get(keyId);
            Algorithm algorithm = Algorithm.RSA256((RSAPublicKey) jwk.getPublicKey(), null);

            JWTVerifier verifier = JWT.require(algorithm)
                    .withIssuer("https://securetoken.google.com/" + projectId)
                    .withAudience(projectId)
                    .build();

            DecodedJWT verified = verifier.verify(token);
            String uid = verified.getSubject();
            String email = verified.getClaim("email").asString();
            boolean isAnon = verified.getClaim("firebase").asMap() != null
                    && "anonymous".equals(((java.util.Map<?, ?>) verified.getClaim("firebase").asMap()).get("sign_in_provider"));

            return Optional.of(new AuthenticatedUser(uid, email, isAnon));
        } catch (Exception e) {
            log.warn("Failed to verify Firebase token: {}", e.getMessage());
            return Optional.empty();
        }
    }

    public String resolveActiveUserId(String authHeader, String guestSessionHeader) {
        Optional<AuthenticatedUser> user = verifyToken(authHeader);
        if (user.isPresent()) {
            return user.get().uid();
        }
        if (guestSessionHeader != null && !guestSessionHeader.isBlank()) {
            // Strictly isolated guest/anonymous session ID (e.g. guest_session_xyz)
            return "guest_" + guestSessionHeader.replaceAll("[^a-zA-Z0-9_-]", "");
        }
        return "guest_default";
    }
}
