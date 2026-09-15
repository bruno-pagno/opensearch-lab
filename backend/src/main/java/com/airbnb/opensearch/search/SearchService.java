package com.airbnb.opensearch.search;

import com.airbnb.opensearch.search.dto.ListingDto;
import com.airbnb.opensearch.search.dto.SearchResultDto;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.opensearch.client.Request;
import org.opensearch.client.RestClient;

import java.io.IOException;
import java.util.List;
import java.util.Map;

public class SearchService {

    private final RestClient restClient;
    private static final ObjectMapper mapper = new ObjectMapper();
    private static final String INDEX = "airbnb-listings";

    public SearchService(RestClient restClient) {
        this.restClient = restClient;
    }

    @SuppressWarnings("unchecked")
    public SearchResultDto search(String q) throws IOException {
        Map<String, Object> queryBody = buildQuery(q);
        String queryJson = mapper.writeValueAsString(queryBody);

        var request = new Request("POST", "/" + INDEX + "/_search");
        request.setJsonEntity(queryJson);

        Map<String, Object> raw;
        try {
            var response = restClient.performRequest(request);
            raw = mapper.readValue(response.getEntity().getContent(), Map.class);
        } catch (Exception e) {
            return new SearchResultDto(List.of(), 0, prettyPrint(queryJson));
        }

        Map<String, Object> hitsWrapper = (Map<String, Object>) raw.get("hits");
        Map<String, Object> totalObj   = (Map<String, Object>) hitsWrapper.get("total");
        int total = ((Number) totalObj.get("value")).intValue();

        List<Map<String, Object>> hits = (List<Map<String, Object>>) hitsWrapper.get("hits");
        List<ListingDto> listings = hits.stream().map(this::toListing).toList();

        return new SearchResultDto(listings, total, prettyPrint(queryJson));
    }

    private Map<String, Object> buildQuery(String q) {
        if (q == null || q.isBlank()) {
            return Map.of(
                "query", Map.of("match_all", Map.of()),
                "sort",  List.of(Map.of("rating", Map.of("order", "desc"))),
                "size",  20
            );
        }
        return Map.of(
            "query", Map.of(
                "multi_match", Map.of(
                    "query",     q,
                    "fields",    List.of("title^2", "description", "room_type", "city^1.5", "amenities", "host_name"),
                    "type",      "best_fields",
                    "fuzziness", "AUTO"
                )
            ),
            "size", 20
        );
    }

    @SuppressWarnings("unchecked")
    private ListingDto toListing(Map<String, Object> hit) {
        String id = (String) hit.get("_id");
        Map<String, Object> src = (Map<String, Object>) hit.get("_source");

        List<String> amenities = List.of();
        Object rawAmenities = src.get("amenities");
        if (rawAmenities instanceof List<?> list) {
            amenities = list.stream().map(Object::toString).toList();
        }

        return new ListingDto(
            id,
            str(src, "title"),
            str(src, "description"),
            num(src, "price_per_night").doubleValue(),
            str(src, "room_type"),
            num(src, "rating").doubleValue(),
            num(src, "num_reviews").intValue(),
            str(src, "host_name"),
            str(src, "city"),
            str(src, "country"),
            amenities
        );
    }

    private String prettyPrint(String json) {
        try {
            return mapper.writerWithDefaultPrettyPrinter()
                .writeValueAsString(mapper.readValue(json, Object.class));
        } catch (Exception e) {
            return json;
        }
    }

    private static String str(Map<String, Object> m, String key) {
        Object v = m.get(key);
        return v != null ? v.toString() : "";
    }

    private static Number num(Map<String, Object> m, String key) {
        Object v = m.get(key);
        return v instanceof Number n ? n : 0;
    }
}
