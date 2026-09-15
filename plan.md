# Project plan

## Goal

Build practical understanding of operating an OpenSearch cluster. The focus is cluster management, shard allocation, metrics, and index lifecycle. Search features exist as a demo layer, not the primary goal.

---

## What's built

### Infrastructure
- Docker Compose: OpenSearch 2.17, OpenSearch Dashboards, Java backend, React frontend
- Backend: Java 21 + Javalin, Maven fat JAR, built inside Docker
- Frontend: React + Vite + TypeScript + Tailwind, served by nginx
- nginx proxies `/api/` to the backend
- HTML5 History API routing (`/admin`, `/learn`, `/labs`)
- Index template applied at startup sets `number_of_replicas: 0` on all indices (keeps the single-node cluster green)

### Admin (`/admin`)
- Cluster tab: health banner (green/yellow/red), shard counts, node cards with heap/disk bars, cluster settings
- Indices tab: list indices, create/delete, view mappings, seed the listings dataset
- Metrics tab: JVM heap and GC, disk usage, index throughput (polling every 10s)

### Search (`/`)
- `multi_match` with fuzziness over 15 Airbnb listings
- Query log panel shows the executed OpenSearch JSON, auto-dismisses after 5s, pauses on hover

### Learn (`/learn`)
- Seven concept sections: cluster, nodes, indices, shards, replicas, documents, mapping
- Each section has a visual diagram and DevTools commands for the live cluster

### Labs (`/labs`)
- Lab 1 (Unassigned Replicas): 7-step interactive incident. Set replicas to 1, watch the cluster go yellow, run `GET /_cluster/allocation/explain`, fix it. Each step calls the real backend API and shows the live response.
- Coming: Disk Watermark Breach, Circuit Breaker Trip

---

## Backend API

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

---

## Next

### Search filters and scoring
- Expose `_score` on each search result card
- Add filters: room type, price range, amenities, min rating
- Multiple query modes: `best_fields`, `most_fields`, `cross_fields`, `phrase`

### Shard allocation (phase 4)
- Shard map in admin: which shard lives on which node, colored by state
- Manual reroute via API

### ILM (phase 5)
- Create a hot/warm/cold policy
- Rollover on the listings index
- Show phase transitions in the UI

### Performance (phase 6)
- Bulk indexing benchmark: adjustable batch size, measure docs/sec
- `refresh_interval` tuning demo
- Circuit breaker state in the metrics tab
