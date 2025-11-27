# Multi-stage build for the Spring Boot app targeting Render

## Build stage
FROM maven:3.9.9-eclipse-temurin-21 AS build
WORKDIR /app

# Copy Maven wrapper and project files
COPY pom.xml .
COPY mvnw mvnw
COPY .mvn .mvn
COPY src ./src

# Build without tests for faster container builds
RUN mvn -q -DskipTests package

## Runtime stage
FROM eclipse-temurin:21-jre
WORKDIR /app

# Render injects PORT; default to 53842 for local runs
ENV PORT=53842

# Copy the built jar
COPY --from=build /app/target/*.jar app.jar

# Expose default port (Render will still map to $PORT)
EXPOSE 53842

# Start the app using the injected PORT (or fallback)
ENTRYPOINT ["sh", "-c", "java -jar app.jar --server.port=${PORT:-53842}"]
