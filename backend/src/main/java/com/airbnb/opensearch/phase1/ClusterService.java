package com.airbnb.opensearch.phase1;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.opensearch.client.Request;
import org.opensearch.client.RestClient;
import org.opensearch.client.opensearch.OpenSearchClient;
import org.opensearch.client.opensearch._types.HealthStatus;
import org.opensearch.client.opensearch.cluster.HealthResponse;
import org.opensearch.client.opensearch.nodes.NodesInfoResponse;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class ClusterService {

    private final OpenSearchClient client;
    private final RestClient restClient;
    private final ObjectMapper mapper = new ObjectMapper();

    public ClusterService(OpenSearchClient client, RestClient restClient) {
        this.client = client;
        this.restClient = restClient;
    }

    public Map<String, Object> health() throws IOException {
        HealthResponse r = client.cluster().health();
        Map<String, Object> result = new HashMap<>();
        result.put("clusterName", r.clusterName());
        result.put("status", r.status().jsonValue());
        result.put("numberOfNodes", r.numberOfNodes());
        result.put("numberOfDataNodes", r.numberOfDataNodes());
        result.put("activePrimaryShards", r.activePrimaryShards());
        result.put("activeShards", r.activeShards());
        result.put("relocatingShards", r.relocatingShards());
        result.put("initializingShards", r.initializingShards());
        result.put("unassignedShards", r.unassignedShards());
        return result;
    }

    @SuppressWarnings("unchecked")
    public List<Map<String, Object>> nodes() throws IOException {
        NodesInfoResponse info = client.nodes().info();

        var statsResponse = restClient.performRequest(new Request("GET", "/_nodes/stats/jvm,fs"));
        Map<String, Object> statsJson = mapper.readValue(statsResponse.getEntity().getContent(), Map.class);
        Map<String, Object> statsNodes = (Map<String, Object>) statsJson.get("nodes");

        List<Map<String, Object>> nodes = new ArrayList<>();
        info.nodes().forEach((id, node) -> {
            Map<String, Object> n = new HashMap<>();
            n.put("id", id);
            n.put("name", node.name());
            n.put("host", node.host());
            n.put("version", node.version());
            n.put("roles", node.roles().stream().map(r -> r.jsonValue()).toList());

            if (statsNodes != null) {
                Map<String, Object> ns = (Map<String, Object>) statsNodes.get(id);
                if (ns != null) {
                    Map<String, Object> jvm = (Map<String, Object>) ns.get("jvm");
                    if (jvm != null) {
                        Map<String, Object> mem = (Map<String, Object>) jvm.get("mem");
                        if (mem != null) {
                            long heapUsed = ((Number) mem.get("heap_used_in_bytes")).longValue();
                            long heapMax = ((Number) mem.get("heap_max_in_bytes")).longValue();
                            n.put("heapUsedBytes", heapUsed);
                            n.put("heapMaxBytes", heapMax);
                            n.put("heapPercent", heapMax > 0 ? (heapUsed * 100.0 / heapMax) : 0);
                        }
                    }
                    Map<String, Object> fs = (Map<String, Object>) ns.get("fs");
                    if (fs != null) {
                        Map<String, Object> total = (Map<String, Object>) fs.get("total");
                        if (total != null) {
                            n.put("diskTotalBytes", ((Number) total.get("total_in_bytes")).longValue());
                            n.put("diskAvailableBytes", ((Number) total.get("available_in_bytes")).longValue());
                        }
                    }
                }
            }

            nodes.add(n);
        });
        return nodes;
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> settings() throws IOException {
        var response = restClient.performRequest(new Request("GET", "/_cluster/settings?include_defaults=false"));
        return mapper.readValue(response.getEntity().getContent(), Map.class);
    }
}
