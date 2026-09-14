package com.airbnb.opensearch.metrics;

import com.airbnb.opensearch.metrics.dto.ClusterStatsDto;
import com.airbnb.opensearch.metrics.dto.IndexStatsDto;
import com.airbnb.opensearch.metrics.dto.NodeMetricsDto;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.opensearch.client.Request;
import org.opensearch.client.RestClient;

import java.io.IOException;
import java.util.List;
import java.util.Map;

public class MetricsService {

    private final RestClient restClient;
    private static final ObjectMapper mapper = new ObjectMapper();

    public MetricsService(RestClient restClient) {
        this.restClient = restClient;
    }

    public ClusterStatsDto clusterStats() throws IOException {
        var csRes = restClient.performRequest(new Request("GET", "/_cluster/stats"));
        Map<String, Object> cs = mapper.readValue(csRes.getEntity().getContent(), Map.class);

        var statsRes = restClient.performRequest(new Request("GET", "/_stats/indexing,search"));
        Map<String, Object> stats = mapper.readValue(statsRes.getEntity().getContent(), Map.class);

        long totalDocs     = longAt(cs,    "indices", "docs", "count");
        long storeSizeBytes = longAt(cs,   "indices", "store", "size_in_bytes");
        int  totalShards   = intAt(cs,     "indices", "shards", "total");
        int  primaryShards = intAt(cs,     "indices", "shards", "primaries");
        long queryTotal    = longAt(stats, "_all", "primaries", "search", "query_total");
        long queryTimeMs   = longAt(stats, "_all", "primaries", "search", "query_time_in_millis");
        long indexTotal    = longAt(stats, "_all", "primaries", "indexing", "index_total");
        long indexTimeMs   = longAt(stats, "_all", "primaries", "indexing", "index_time_in_millis");

        return new ClusterStatsDto(totalDocs, storeSizeBytes, totalShards, primaryShards,
            queryTotal, queryTimeMs, indexTotal, indexTimeMs);
    }

    @SuppressWarnings("unchecked")
    public List<NodeMetricsDto> nodeMetrics() throws IOException {
        var res = restClient.performRequest(new Request("GET", "/_nodes/stats/jvm,thread_pool,breaker"));
        Map<String, Object> raw = mapper.readValue(res.getEntity().getContent(), Map.class);
        Map<String, Object> nodes = (Map<String, Object>) raw.get("nodes");

        return nodes.entrySet().stream().map(e -> {
            String id = e.getKey();
            Map<String, Object> n = (Map<String, Object>) e.getValue();

            return new NodeMetricsDto(
                id,
                (String) n.getOrDefault("name", id),
                longAt(n, "jvm", "mem", "heap_used_in_bytes"),
                longAt(n, "jvm", "mem", "heap_max_in_bytes"),
                longAt(n, "jvm", "gc", "collectors", "young", "collection_count"),
                longAt(n, "jvm", "gc", "collectors", "young", "collection_time_in_millis"),
                longAt(n, "jvm", "gc", "collectors", "old", "collection_count"),
                longAt(n, "jvm", "gc", "collectors", "old", "collection_time_in_millis"),
                intAt(n,  "thread_pool", "search", "active"),
                intAt(n,  "thread_pool", "search", "queue"),
                longAt(n, "thread_pool", "search", "rejected"),
                intAt(n,  "thread_pool", "write", "active"),
                intAt(n,  "thread_pool", "write", "queue"),
                longAt(n, "thread_pool", "write", "rejected"),
                breakerPercent(n, "parent"),
                breakerPercent(n, "request"),
                breakerPercent(n, "fielddata")
            );
        }).toList();
    }

    @SuppressWarnings("unchecked")
    public List<IndexStatsDto> indexStats() throws IOException {
        var res = restClient.performRequest(
            new Request("GET", "/_stats/docs,store,indexing,search,refresh,segments")
        );
        Map<String, Object> raw = mapper.readValue(res.getEntity().getContent(), Map.class);
        Map<String, Object> indices = (Map<String, Object>) raw.get("indices");

        return indices.entrySet().stream()
            .filter(e -> !e.getKey().startsWith("."))
            .map(e -> {
                String name = e.getKey();
                Map<String, Object> idx = (Map<String, Object>) e.getValue();
                return new IndexStatsDto(
                    name,
                    longAt(idx, "primaries", "docs", "count"),
                    longAt(idx, "primaries", "store", "size_in_bytes"),
                    longAt(idx, "primaries", "search", "query_total"),
                    longAt(idx, "primaries", "search", "query_time_in_millis"),
                    longAt(idx, "primaries", "indexing", "index_total"),
                    longAt(idx, "primaries", "indexing", "index_time_in_millis"),
                    longAt(idx, "primaries", "refresh", "total"),
                    longAt(idx, "primaries", "refresh", "total_time_in_millis"),
                    intAt(idx,  "primaries", "segments", "count")
                );
            })
            .toList();
    }

    // --- helpers ---

    private static double breakerPercent(Map<String, Object> node, String name) {
        long used  = longAt(node, "breakers", name, "estimated_size_in_bytes");
        long limit = longAt(node, "breakers", name, "limit_size_in_bytes");
        return limit > 0 ? (used * 100.0 / limit) : 0.0;
    }

    @SuppressWarnings("unchecked")
    private static long longAt(Map<String, Object> m, String... keys) {
        Object cur = m;
        for (String k : keys) {
            if (!(cur instanceof Map)) return 0L;
            cur = ((Map<String, Object>) cur).get(k);
        }
        return cur instanceof Number ? ((Number) cur).longValue() : 0L;
    }

    @SuppressWarnings("unchecked")
    private static int intAt(Map<String, Object> m, String... keys) {
        Object cur = m;
        for (String k : keys) {
            if (!(cur instanceof Map)) return 0;
            cur = ((Map<String, Object>) cur).get(k);
        }
        return cur instanceof Number ? ((Number) cur).intValue() : 0;
    }
}
