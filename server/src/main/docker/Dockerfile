FROM java:8
VOLUME /tmp
ADD ./aleator-*.jar app.jar
RUN bash -c 'touch /app.jar'
EXPOSE 8081
ENTRYPOINT ["java", "-Xmx1024m", "-Xss512k", "-Djava.security.egd=file:/dev/./urandom","-jar","/app.jar"]