dev:
	docker build  \
		-f Dockerfile.dev \
		-t react-layout-image-dev .

prod:
	docker build  \
		-f Dockerfile.prod \
		-t react-layout-image-prod .

watch:
	docker run \
		-it --rm \
		-v `pwd`:/app \
		-v /app/node_modules \
		--env-file ./.env \
		-p 3000:3000 \
		--name react-app \
		react-layout-image-dev

nginx:
	docker run \
		--env-file ./.env \
		-p 8080:80 \
		--name react-app-prod \
		react-layout-image-prod

app-sh:
	docker exec -it react-app /bin/sh

compose-build:
	docker compose -f docker-compose-prod.yml up --build

up:
	docker compose -f docker-compose-prod.yml up

down:
	docker compose -f docker-compose-prod.yml down