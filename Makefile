DB_CONTAINER_NAME = fcc-exercise-tracker-mongodb
help:
	@echo "Run make [option] .Options: "
	@echo "localhost.run"
	@echo "start-app"
	@echo "start-db"
	@echo "stop-db"
	@echo "remove-db"

localhost.run:
	@ssh -R 80:localhost:3000 localhost.run

start-app: start-db
	@nodemon start

MONGO_INITDB_ROOT_USERNAME:=rootu
MONGO_INITDB_ROOT_PASSWORD:=rootpwd
start-db:
	@if docker inspect -f '{{.State.Running}}' ${DB_CONTAINER_NAME} 2>/dev/null | grep -q "true"; then \
		echo "DB container is already running."; \
	else \
		docker run \
		--name ${DB_CONTAINER_NAME} \
		-e MONGO_INITDB_ROOT_USERNAME=${MONGO_INITDB_ROOT_USERNAME} \
		-e MONGO_INITDB_ROOT_PASSWORD=${MONGO_INITDB_ROOT_PASSWORD} \
		-e MONGO_INITDB_DATABASE=test \
		-v /tmp/data/mongodb/${DB_CONTAINER_NAME}:/data/db \
		-p 27017:27017 \
		-d mongo:6; \
		echo "Started DB container."; \
	fi


stop-db:
	@if docker inspect -f '{{.State.Running}}' ${DB_CONTAINER_NAME} 2>/dev/null | grep -q "true"; then \
		docker stop ${DB_CONTAINER_NAME}; \
		echo "STOPPED DB!"; \
	else \
		echo "DB container is not running."; \
	fi

remove-db: stop-db
	@if docker inspect -f '{{.State.Running}}' ${DB_CONTAINER_NAME} 2>/dev/null | grep -q "true"; then \
		echo "Error: DB container is still running. Please stop it first."; \
		exit 1; \
	else \
		docker rm ${DB_CONTAINER_NAME}; \
		echo "REMOVED DB!"; \
	fi
