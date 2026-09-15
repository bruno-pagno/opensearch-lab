package com.airbnb.opensearch.search;

import com.airbnb.opensearch.search.dto.ListingDto;
import com.airbnb.opensearch.search.dto.SearchResultDto;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.opensearch.client.Request;
import org.opensearch.client.RestClient;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
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
    public SearchResultDto search(
            String q, String queryType, String roomType,
            String minPrice, String maxPrice,
            List<String> amenities, String minRating,
            int from, int size) throws IOException {

        Map<String, Object> queryBody = buildQuery(
            q,
            queryType != null && !queryType.isBlank() ? queryType : "best_fields",
            roomType,
            parseDouble(minPrice), parseDouble(maxPrice),
            amenities != null ? amenities : List.of(),
            parseDouble(minRating),
            from, size
        );

        String queryJson = mapper.writeValueAsString(queryBody);
        var request = new Request("POST", "/" + INDEX + "/_search");
        request.setJsonEntity(queryJson);

        Map<String, Object> raw;
        try {
            var response = restClient.performRequest(request);
            raw = mapper.readValue(response.getEntity().getContent(), Map.class);
        } catch (Exception e) {
            return new SearchResultDto(List.of(), 0, 0.0, prettyPrint(queryJson));
        }

        Map<String, Object> hitsWrapper = (Map<String, Object>) raw.get("hits");
        Map<String, Object> totalObj   = (Map<String, Object>) hitsWrapper.get("total");
        int total = ((Number) totalObj.get("value")).intValue();

        Object maxScoreRaw = hitsWrapper.get("max_score");
        double maxScore = maxScoreRaw instanceof Number n ? n.doubleValue() : 0.0;

        List<Map<String, Object>> hits = (List<Map<String, Object>>) hitsWrapper.get("hits");
        List<ListingDto> listings = hits.stream().map(this::toListing).toList();

        return new SearchResultDto(listings, total, maxScore, prettyPrint(queryJson));
    }

    private Map<String, Object> buildQuery(
            String q, String queryType, String roomType,
            Double minPrice, Double maxPrice,
            List<String> amenities, Double minRating,
            int from, int size) {

        boolean hasText = q != null && !q.isBlank();

        List<Map<String, Object>> filters = new ArrayList<>();
        if (roomType != null && !roomType.isBlank()) {
            filters.add(Map.of("term", Map.of("room_type", roomType)));
        }
        if (minPrice != null || maxPrice != null) {
            Map<String, Object> range = new HashMap<>();
            if (minPrice != null) range.put("gte", minPrice);
            if (maxPrice != null) range.put("lte", maxPrice);
            filters.add(Map.of("range", Map.of("price_per_night", range)));
        }
        for (String a : amenities) {
            filters.add(Map.of("term", Map.of("amenities", a)));
        }
        if (minRating != null) {
            filters.add(Map.of("range", Map.of("rating", Map.of("gte", minRating))));
        }

        Map<String, Object> result = new HashMap<>();
        result.put("size", size);
        result.put("from", from);

        if (!hasText && filters.isEmpty()) {
            result.put("query", Map.of("match_all", Map.of()));
            result.put("sort", List.of(Map.of("rating", Map.of("order", "desc"))));
            return result;
        }

        if (!hasText) {
            result.put("query", Map.of("bool", Map.of("filter", filters)));
            return result;
        }

        Map<String, Object> mm = new HashMap<>();
        mm.put("query", q);
        mm.put("fields", List.of("title^2", "description", "room_type", "city^1.5", "amenities", "host_name"));
        mm.put("type", queryType);
        if (!"cross_fields".equals(queryType) && !"phrase".equals(queryType)) {
            mm.put("fuzziness", "AUTO");
        }
        Map<String, Object> textQuery = Map.of("multi_match", mm);

        if (filters.isEmpty()) {
            result.put("query", textQuery);
        } else {
            Map<String, Object> bool = new HashMap<>();
            bool.put("must", List.of(textQuery));
            bool.put("filter", filters);
            result.put("query", Map.of("bool", bool));
        }
        return result;
    }

    @SuppressWarnings("unchecked")
    private ListingDto toListing(Map<String, Object> hit) {
        String id = (String) hit.get("_id");
        double score = hit.get("_score") instanceof Number n ? n.doubleValue() : 0.0;
        Map<String, Object> src = (Map<String, Object>) hit.get("_source");

        List<String> amenities = List.of();
        Object raw = src.get("amenities");
        if (raw instanceof List<?> list) {
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
            amenities,
            score
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

    private static Double parseDouble(String s) {
        if (s == null || s.isBlank()) return null;
        try { return Double.parseDouble(s); } catch (NumberFormatException e) { return null; }
    }
}
