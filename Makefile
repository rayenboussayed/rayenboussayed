.PHONY: dev stop

IMAGE := portfolio-dev
CONTAINER := portfolio-dev

dev:
	docker build -f Dockerfile.dev -t $(IMAGE) . && \
	docker rm -f $(CONTAINER) 2>/dev/null; \
	docker run --rm -d --name $(CONTAINER) -p 3000:3000 \
		-v ./src:/app/src \
		-v ./public:/app/public \
		-v ./vite.config.ts:/app/vite.config.ts \
		-v ./tsconfig.json:/app/tsconfig.json \
		-v /app/node_modules \
		$(IMAGE)

stop:
	docker stop $(CONTAINER)
