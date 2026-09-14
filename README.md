# OpenSearch Learning — Airbnb Infrastructure Lab

## Goal

Learn to operate an OpenSearch cluster, not only query it. The focus is on cluster management, metrics, shard allocation, index lifecycle, and performance tuning. Search features (queries, analyzers, relevance) come later, after the infrastructure basics.

The domain is an Airbnb-style listing marketplace, used as sample data.

See [`plan.md`](./plan.md) for the full roadmap and current progress.

## Stack

| Layer | Tool |
|-------|------|
| Backend | Java 21 + Javalin + OpenSearch Java client 2.x |
| Frontend | React + Vite + TypeScript + Tailwind |
| Build | Bazel 7 (Java), npm/Vite (React) |
| Infra | Docker Compose |

## Run

Requires Docker.

```bash
make up
```

Or directly:
```bash
cd docker && docker compose up --build
```

First run downloads Maven deps and Docker base images (~2-3 min). After that, rebuilds are fast: if only Java source changed, Maven recompiles in seconds. If only frontend changed, the backend layer is skipped entirely.

| Service | URL |
|---------|-----|
| UI | http://localhost:3000 |
| Backend API | http://localhost:8080 |
| OpenSearch | http://localhost:9200 |
| Dashboards | http://localhost:5601 |

```bash
make down      # stop containers
make restart   # stop + rebuild + start
```

Local dev without Docker (requires [Bazelisk](https://github.com/bazelbuild/bazelisk)):
```bash
brew install bazelisk
make dev-backend   # runs backend on port 8080
make dev-frontend  # runs Vite on port 5173
```

## Learning phases

| Phase | Topic | Status |
|-------|-------|--------|
| 1 | Cluster fundamentals: health, nodes, settings | ✅ Done |
| 2 | Index management: CRUD, mappings, seed data | ✅ Done |
| 3 | Metrics and monitoring: stats APIs, cat APIs, JVM/GC | 🔜 |
| 4 | Shard management: allocation, routing, rack awareness | 🔜 |
| 5 | Index lifecycle management (ILM): rollover policies | 🔜 |
| 6 | Performance: bulk indexing, refresh, circuit breakers | 🔜 |
| 7 | Search: queries, analyzers, relevance scoring | 🔜 |

## Project structure

```
backend/
  src/main/java/com/airbnb/opensearch/
    Main.java                    ← Javalin entrypoint (port 8080)
    client/OpenSearchClientFactory.java
    phase1/ClusterService.java   ← calls OpenSearch cluster APIs
    phase1/ClusterRoutes.java    ← registers /api/cluster/* routes

frontend/
  src/pages/ClusterDashboard.tsx ← Phase 1 UI

docker/
  docker-compose.yml
  backend.Dockerfile             ← Bazel build → fat JAR → JRE
  frontend.Dockerfile            ← Vite build → nginx
```

## API reference

```
GET /api/cluster/health    → cluster status, shard counts, node counts
GET /api/cluster/nodes     → node list with roles, heap %, disk %
GET /api/cluster/settings  → persistent and transient cluster settings
```
