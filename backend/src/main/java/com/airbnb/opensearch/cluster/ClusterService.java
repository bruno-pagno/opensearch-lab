package com.airbnb.opensearch.cluster;

import com.airbnb.opensearch.cluster.dto.ClusterHealthDto;
import com.airbnb.opensearch.cluster.dto.ClusterSettingsDto;
import com.airbnb.opensearch.cluster.dto.NodeDto;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.opensearch.client.Request;
import org.opensearch.client.RestClient;
import org.opensearch.client.opensearch.OpenSearchClient;
import org.opensearch.client.opensearch.nodes.NodesInfoResponse;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class ClusterService {

    private final OpenSearchClient client;
    private final RestClient restClient;
    private static final ObjectMapper mapper = new ObjectMapper();

    public ClusterService(OpenSearchClient client, RestClient restClient) {
        this.client = client;
        this.restClient = restClient;
    }

    public ClusterHealthDto health() throws IOException {
        var r = client.cluster().health();
        return new ClusterHealthDto(
            r.clusterName(),
            r.status().jsonValue(),
            r.numberOfNodes(),
            r.numberOfDataNodes(),
            r.activePrimaryShards(),
            r.activeShards(),
            r.relocatingShards(),
            r.initializingShards(),
            r.unassignedShards()
        );
    }

    @SuppressWarnings("unchecked")
    public List<NodeDto> nodes() throws IOException {
        NodesInfoResponse info = client.nodes().info();

        var statsResponse = restClient.performRequest(new Request("GET", "/_nodes/stats/jvm,fs"));
        Map<String, Object> statsJson = mapper.readValue(statsResponse.getEntity().getContent(), Map.class);
        Map<String, Object> statsNodes = (Map<String, Object>) statsJson.get("nodes");

        List<NodeDto> nodes = new ArrayList<>();
        info.nodes().forEach((id, node) -> {
            Long heapUsedBytes = null, heapMaxBytes = null;
            Double heapPercent = null;
            Long diskTotalBytes = null, diskAvailableBytes = null;

            if (statsNodes != null) {
                Map<String, Object> ns = (Map<String, Object>) statsNodes.get(id);
                if (ns != null) {
                    Map<String, Object> jvm = (Map<String, Object>) ns.get("jvm");
                    if (jvm != null) {
                        Map<String, Object> mem = (Map<String, Object>) jvm.get("mem");
                        if (mem != null) {
                            heapUsedBytes = ((Number) mem.get("heap_used_in_bytes")).longValue();
                            heapMaxBytes = ((Number) mem.get("heap_max_in_bytes")).longValue();
                            heapPercent = heapMaxBytes > 0 ? (heapUsedBytes * 100.0 / heapMaxBytes) : 0.0;
                        }
                    }
                    Map<String, Object> fs = (Map<String, Object>) ns.get("fs");
                    if (fs != null) {
                        Map<String, Object> total = (Map<String, Object>) fs.get("total");
                        if (total != null) {
                            diskTotalBytes = ((Number) total.get("total_in_bytes")).longValue();
                            diskAvailableBytes = ((Number) total.get("available_in_bytes")).longValue();
                        }
                    }
                }
            }

            nodes.add(new NodeDto(
                id,
                node.name(),
                node.host(),
                node.version(),
                node.roles().stream().map(r -> r.jsonValue()).toList(),
                heapUsedBytes,
                heapMaxBytes,
                heapPercent,
                diskTotalBytes,
                diskAvailableBytes
            ));
        });
        return nodes;
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> allocationExplain() throws IOException {
        try {
            var response = restClient.performRequest(new Request("GET", "/_cluster/allocation/explain"));
            return mapper.readValue(response.getEntity().getContent(), Map.class);
        } catch (org.opensearch.client.ResponseException e) {
            if (e.getResponse().getStatusLine().getStatusCode() == 400) {
                return Map.of("message", "All shards are assigned — cluster is healthy.");
            }
            throw e;
        }
    }

    @SuppressWarnings("unchecked")
    public List<Map<String, Object>> shards(String index) throws IOException {
        var response = restClient.performRequest(
            new Request("GET", "/_cat/shards/" + index + "?format=json&h=index,shard,prirep,state,node,store,unassigned.reason,unassigned.details")
        );
        return mapper.readValue(response.getEntity().getContent(), List.class);
    }

    @SuppressWarnings("unchecked")
    public ClusterSettingsDto settings() throws IOException {
        var response = restClient.performRequest(new Request("GET", "/_cluster/settings?include_defaults=false"));
        Map<String, Object> raw = mapper.readValue(response.getEntity().getContent(), Map.class);
        return new ClusterSettingsDto(
            (Map<String, Object>) raw.get("persistent"),
            (Map<String, Object>) raw.get("transient")
        );
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> updateSettings(String body) throws IOException {
        var request = new Request("PUT", "/_cluster/settings");
        request.setJsonEntity(body);
        var response = restClient.performRequest(request);
        return mapper.readValue(response.getEntity().getContent(), Map.class);
    }

    @SuppressWarnings("unchecked")
    public List<Map<String, Object>> diskAllocation() throws IOException {
        var response = restClient.performRequest(
            new Request("GET", "/_cat/allocation?format=json&h=node,disk.indices,disk.used,disk.avail,disk.total,disk.percent,shards")
        );
        return mapper.readValue(response.getEntity().getContent(), List.class);
    }
}
