SHELL := /bin/sh
.PHONY: install test build deploy build_and_push up down logs version-sync version-bump-major version-bump-minor version-bump-patch

# ---- Configuration ----

DOCKER_COMPOSE ?= docker compose
BACKEND_DIR := backend
FRONTEND_DIR := frontend
SCRIPTS_DIR := scripts

# Docker image for combined fullstack app (backend + frontend)
# Override via: FULLSTACK_IMAGE=myuser/kennzeichen-sammler
FULLSTACK_IMAGE ?= larsbuecker/kennzeichen-sammler
TAG ?= latest

# Read version from version.json
VERSION := $(shell node -p "require('./version.json').version")

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
	@echo "Tagging image with version $(VERSION)..."
	docker tag $(FULLSTACK_IMAGE):$(TAG) $(FULLSTACK_IMAGE):$(VERSION)

deploy:
	@echo "Starting application stack via docker compose..."
	$(DOCKER_COMPOSE) up -d

build_and_push: build
	@echo "Pushing fullstack image $(FULLSTACK_IMAGE):$(TAG) to Docker Hub..."
	docker push $(FULLSTACK_IMAGE):$(TAG)
	@echo "Pushing fullstack image $(FULLSTACK_IMAGE):$(VERSION) to Docker Hub..."
	docker push $(FULLSTACK_IMAGE):$(VERSION)

up: deploy

down:
	@echo "Stopping and removing docker-compose services..."
	$(DOCKER_COMPOSE) down

logs:
	$(DOCKER_COMPOSE) logs -f

# ---- Version Management ----

version-sync:
	@echo "Synchronizing version from version.json to package.json files..."
	@node $(SCRIPTS_DIR)/sync-version.js

version-bump-major:
	@echo "Bumping major version..."
	@node $(SCRIPTS_DIR)/bump-version.js major

version-bump-minor:
	@echo "Bumping minor version..."
	@node $(SCRIPTS_DIR)/bump-version.js minor

version-bump-patch:
	@echo "Bumping patch version..."
	@node $(SCRIPTS_DIR)/bump-version.js patch


