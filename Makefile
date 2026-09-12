.PHONY: up down restart dev-backend dev-frontend

up:
	cd docker && docker compose up --build

down:
	cd docker && docker compose down

restart: down up

# Local dev without Docker (requires Bazelisk)
dev-backend:
	bazel run //backend:Main

dev-frontend:
	cd frontend && npm run dev
