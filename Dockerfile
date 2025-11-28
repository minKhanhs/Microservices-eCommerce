# Giai đoạn Build
FROM maven:4.0.0-rc-5-eclipse-temurin-25-alpine AS build
WORKDIR /workspace

COPY . /workspace

# 2. Build service cụ thể
ARG SERVICE_NAME
# -pl: project list, -am: also make dependents (build cả các module phụ thuộc)
RUN --mount=type=cache,target=/root/.m2 mvn clean package -DskipTests -pl ${SERVICE_NAME} -am

# Giai đoạn Runtime
FROM eclipse-temurin:25-jre-alpine
WORKDIR /app

ARG SERVICE_NAME
# Copy file jar từ thư mục target của service tương ứng
COPY --from=build /workspace/${SERVICE_NAME}/target/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]