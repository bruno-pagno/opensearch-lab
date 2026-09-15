# OpenSearch lab — Airbnb listings

A personal learning project for operating an OpenSearch cluster. The focus is cluster management, shard allocation, metrics, and index lifecycle. The Airbnb listings domain provides realistic sample data to search against.

## Run

Requires Docker.

```bash
cd docker && docker compose up --build
```

First run pulls Maven dependencies and Docker base images (~2-3 min). Subsequent builds skip unchanged layers.

| Service | URL |
|---------|-----|
| Search UI | http://localhost:3000 |
| Admin | http://localhost:3000/admin |
| Learn | http://localhost:3000/learn |
| Labs | http://localhost:3000/labs |
| Backend API | http://localhost:8080 |
| OpenSearch | http://localhost:9200 |
| Dashboards | http://localhost:5601 |

## Pages

**Search (`/`)** — Full-text search over 15 Airbnb listings using OpenSearch `multi_match` with fuzziness. Shows a query log panel with the executed JSON after each search.

**Admin (`/admin`)** — Three tabs:
- Cluster: health banner, node cards with heap/disk usage, cluster settings
- Indices: index list, create/delete, view mappings, seed the listings dataset
- Metrics: JVM heap, GC stats, disk usage, index throughput

**Learn (`/learn`)** — Visual explanations of OpenSearch concepts: cluster, nodes, indices, shards, replicas, documents, and mapping. Each section includes the DevTools commands to explore it on the live cluster.

**Labs (`/labs`)** — Hands-on incident simulations. Each lab walks through breaking something, diagnosing it with real API calls, and recovering.

- Lab 1: Unassigned replicas. Set `number_of_replicas: 1` on a single-node cluster, watch the cluster go yellow, use `GET /_cluster/allocation/explain` to find the cause, fix it.

## Stack

| Layer | Tool |
|-------|------|
| Backend | Java 21, Javalin 6, OpenSearch Java client 2.17 |
| Frontend | React 18, Vite, TypeScript, Tailwind CSS |
| Search | OpenSearch 2.17.0, single-node, security disabled |
| Infra | Docker Compose, Maven fat JAR, nginx |

## Project structure

```
backend/src/main/java/com/airbnb/opensearch/
  Main.java                          Javalin entrypoint, port 8080
  client/OpenSearchClientFactory.java
  cluster/  ClusterService.java, ClusterRoutes.java
  index/    IndexService.java, IndexRoutes.java
  metrics/  MetricsService.java, MetricsRoutes.java
  search/   SearchService.java, SearchRoutes.java

frontend/src/
  pages/
    SearchPage.tsx
    ClusterDashboard.tsx
    IndicesDashboard.tsx
    MetricsDashboard.tsx
    LearnPage.tsx
    LabsPage.tsx
    LabDetail.tsx
    labs/UnassignedReplicasLab.tsx
  utils/navigate.ts

docker/
  docker-compose.yml
  backend.Dockerfile    Maven build → fat JAR → eclipse-temurin JRE
  frontend.Dockerfile   Vite build → nginx
  nginx.conf
```

## API reference

```
GET  /api/cluster/health
GET  /api/cluster/nodes
GET  /api/cluster/settings
GET  /api/cluster/allocation/explain
GET  /api/cluster/shards/{index}

GET  /api/indices
POST /api/indices
DELETE /api/indices/{name}
GET  /api/indices/{name}/mapping
PUT  /api/indices/{name}/replicas
POST /api/indices/seed/listings

GET  /api/metrics/cluster-stats
GET  /api/metrics/nodes
GET  /api/metrics/index-stats

GET  /api/search/listings?q={query}
```

## Notes

The cluster runs with `DISABLE_SECURITY_PLUGIN=true`. An index template (`zero-replicas-default`) is applied at backend startup to set `number_of_replicas: 0` on all indices, keeping the single-node cluster green. The backend also patches any indices already present in the persistent volume.
