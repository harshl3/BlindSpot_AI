# ==========================================
# Stage 1: Build stage with OpenJDK 21
# ==========================================
FROM eclipse-temurin:21-jdk-jammy AS builder

WORKDIR /app

# Copy Maven Wrapper and POM first to leverage Docker layer caching
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./

# Convert line endings in case Windows CRLF was committed and grant execute permissions
RUN sed -i 's/\r$//' mvnw && chmod +x mvnw

# Pre-fetch dependencies
RUN ./mvnw dependency:go-offline -B || true

# Copy source code and build production jar
COPY src/ src/
RUN ./mvnw clean package -DskipTests -B

# ==========================================
# Stage 2: Minimal Production JRE Runtime
# ==========================================
FROM eclipse-temurin:21-jre-jammy AS runner

WORKDIR /app

# Create a dedicated non-root user for security
RUN addgroup --system --gid 1001 spring && \
    adduser --system --uid 1001 --ingroup spring spring

# Copy the built executable jar from builder stage
COPY --from=builder /app/target/blindspot-backend-1.0.0.jar app.jar
RUN chown -R spring:spring /app

USER spring:spring

# Render injects PORT dynamically (default to 8080 locally)
ENV PORT=8080
EXPOSE ${PORT}

# JVM tuning options for containerized environments
ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -Djava.security.egd=file:/dev/./urandom"

ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS -Dserver.port=${PORT} -jar app.jar"]

