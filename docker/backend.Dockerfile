FROM maven:3.9-eclipse-temurin-21 AS builder
WORKDIR /app

# Cache deps — this layer only re-runs if pom.xml changes
COPY backend/pom.xml .
RUN mvn -B dependency:go-offline -q

# Build — only re-runs if source changes
COPY backend/src ./src
RUN mvn -B package -DskipTests -q

FROM eclipse-temurin:21-jre-jammy
WORKDIR /app
COPY --from=builder /app/target/app.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
