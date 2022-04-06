docker:
	docker build  \
		-t react-layout-image .

docker-watch:
	docker run \
		-it --rm \
		-e CHOKIDAR_USEPOLLING=true \
		-v `pwd`:/app \
		-v /app/node_modules \
		-p 3000:3000 \
		--name react-app \
		react-layout-image

app-sh:
	docker exec -it react-app /bin/sh

clean:
	docker rm 