# aleator
Aleator is a Spring Boot application

## Running in Docker

### Client

```
cd client && bower install
```

```
cd ..
```

### Server
```
cd server
```

```
mvn clean package docker:build && docker-compose up --build
```

```
docker-compose up --build
```