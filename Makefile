SHELL := /bin/sh
.PHONY: install test build deploy build_and_push up down logs

# ---- Configuration ----

DOCKER_COMPOSE ?= docker compose
BACKEND_DIR := backend
FRONTEND_DIR := frontend

# Docker image for combined fullstack app (backend + frontend)
# Override via: FULLSTACK_IMAGE=myuser/kennzeichen-sammler
FULLSTACK_IMAGE ?= larsbuecker/kennzeichen-sammler
TAG ?= latest

# ---- Targets ----

install:
	@echo "Installing backend dependencies..."
	cd $(BACKEND_DIR) && npm install
	@echo "Installing frontend dependencies..."
	cd $(FRONTEND_DIR) && npm install

test:
	@echo "No tests defined yet. Skipping..."

build:
	@echo "Building docker-compose services (postgres, backend, frontend)..."
	$(DOCKER_COMPOSE) build
	@echo "Building fullstack Docker image $(FULLSTACK_IMAGE):$(TAG)..."
	docker build --platform linux/amd64 -f Dockerfile.fullstack -t $(FULLSTACK_IMAGE):$(TAG) .

deploy:
	@echo "Starting application stack via docker compose..."
	$(DOCKER_COMPOSE) up -d

build_and_push: build
	@echo "Pushing fullstack image $(FULLSTACK_IMAGE):$(TAG) to Docker Hub..."
	docker push $(FULLSTACK_IMAGE):$(TAG)

up: deploy

down:
	@echo "Stopping and removing docker-compose services..."
	$(DOCKER_COMPOSE) down

logs:
	$(DOCKER_COMPOSE) logs -f


