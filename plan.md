# Project Plan

## Goal

Build a deep, practical understanding of OpenSearch infrastructure — not just how to query it, but how to operate it. Cluster management, metrics, shard allocation, ILM, and performance tuning are the primary focus. Search features come last.

---

## Current Phase: Phase 2 — Index Management

### What's implemented

**Backend**
- `OpenSearchClientFactory` — creates both a high-level `OpenSearchClient` (typed API) and a low-level `RestClient` (raw HTTP)
- `ClusterService` — wraps three cluster APIs:
  - `_cluster/health` → status, shard counts, node counts
  - `_nodes/info` + `_nodes/stats` → node roles, heap usage, disk usage
  - `_cluster/settings` → persistent and transient settings
- `ClusterRoutes` — registers the three endpoints on Javalin (`/api/cluster/*`)
- `Main` — wires everything together, starts on port 8080

**Frontend**
- Cluster Dashboard with auto-refresh every 10 seconds
  - Health badge (green / yellow / red)
  - Shard breakdown (active, primary, relocating, unassigned)
  - Node cards with roles, heap bar, disk bar
  - Settings table (persistent vs transient)

**Infrastructure**
- Docker Compose: OpenSearch 2.17 + OpenSearch Dashboards + backend + frontend
- Backend built with Bazel inside Docker (fat JAR → JRE image)
- Frontend built with Vite → served by nginx
- nginx proxies `/api/` to the backend

---

## Next Steps

### Phase 2 — Index Management ✅ Done
- Create, delete indices with configurable shards/replicas
- Define explicit mappings for the Listing document (text, keyword, geo_point, date, nested)
- Index settings: `number_of_shards`, `number_of_replicas`, `refresh_interval`
- Index templates and component templates
- Aliases: write alias, read alias, zero-downtime reindex pattern
- UI: index browser — list indices, inspect mapping, view settings

### Phase 3 — Metrics & Monitoring
- `_cluster/stats` — cluster-wide metrics
- `_nodes/stats` — JVM heap, GC, thread pools, circuit breakers per node
- `_stats` — per-index: docs count, store size, indexing rate, search rate, refresh/merge time
- `_cat/indices`, `_cat/shards`, `_cat/nodes`, `_cat/thread_pool`
- `_nodes/hot_threads` — diagnosing CPU spikes
- UI: metrics dashboard with time-series feel (polling)

### Phase 4 — Shard Management
- `_cluster/allocation/explain` — why a shard is unassigned
- Shard states: STARTED, INITIALIZING, RELOCATING, UNASSIGNED
- Allocation filtering: include/exclude/require rules, rack awareness
- Manual reroute API

### Phase 5 — Index Lifecycle Management (ILM)
- Create policies with hot / warm / cold / delete phases
- Rollover conditions: age, doc count, size
- Write alias pattern for rollover
- Apply to a Listing-views event stream

### Phase 6 — Performance & Operations
- Bulk indexing: batch sizes, error handling, partial failures
- `refresh_interval` tuning: near-real-time vs throughput trade-off
- Force merge, `max_num_segments`
- Circuit breakers: request / fielddata / parent
- Indexing pressure and back-pressure (`_nodes/stats/indexing_pressure`)

### Phase 7 — Search (last)
- Basic queries: match, term, bool, range
- Full-text analysis: analyzers, tokenizers, the Analyze API
- Relevance scoring: BM25, Explain API, function_score
- Aggregations: terms, range, stats, nested
