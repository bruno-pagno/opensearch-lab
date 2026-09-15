package com.airbnb.opensearch.index;

import com.airbnb.opensearch.index.dto.CreateIndexDto;
import com.airbnb.opensearch.index.dto.IndexSummaryDto;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.opensearch.client.Request;
import org.opensearch.client.RestClient;

import java.io.IOException;
import java.util.List;
import java.util.Map;

public class IndexService {

    private final RestClient restClient;
    private static final ObjectMapper mapper = new ObjectMapper();

    public IndexService(RestClient restClient) {
        this.restClient = restClient;
    }

    @SuppressWarnings("unchecked")
    public List<IndexSummaryDto> list() throws IOException {
        var response = restClient.performRequest(
            new Request("GET", "/_cat/indices?format=json&s=index&expand_wildcards=open")
        );
        List<Map<String, Object>> raw = mapper.readValue(response.getEntity().getContent(), List.class);
        return raw.stream()
            .filter(idx -> !((String) idx.get("index")).startsWith("."))
            .map(idx -> new IndexSummaryDto(
                (String) idx.get("index"),
                (String) idx.getOrDefault("health", "unknown"),
                (String) idx.getOrDefault("status", "unknown"),
                parseLong(idx.get("docs.count")),
                (String) idx.getOrDefault("store.size", "0b"),
                parseInt(idx.get("pri")),
                parseInt(idx.get("rep"))
            ))
            .toList();
    }

    public void create(CreateIndexDto req) throws IOException {
        String body = """
            {"settings":{"number_of_shards":%d,"number_of_replicas":%d}}
            """.formatted(req.shards(), req.replicas());
        var request = new Request("PUT", "/" + req.name());
        request.setJsonEntity(body);
        restClient.performRequest(request);
    }

    public void delete(String name) throws IOException {
        restClient.performRequest(new Request("DELETE", "/" + name));
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> mapping(String name) throws IOException {
        var response = restClient.performRequest(new Request("GET", "/" + name + "/_mapping"));
        Map<String, Object> raw = mapper.readValue(response.getEntity().getContent(), Map.class);
        Map<String, Object> indexData = (Map<String, Object>) raw.get(name);
        if (indexData == null) return Map.of();
        return (Map<String, Object>) indexData.getOrDefault("mappings", Map.of());
    }

    public void setReplicas(String indexName, int count) throws IOException {
        var request = new Request("PUT", "/" + indexName + "/_settings");
        request.setJsonEntity("{\"index\":{\"number_of_replicas\":" + count + "}}");
        restClient.performRequest(request);
    }

    public void seedListings() throws IOException {
        String index = "airbnb-listings";
        if (!indexExists(index)) {
            createListingsIndex(index);
            bulkIndexListings(index);
        }
    }

    private boolean indexExists(String name) {
        try {
            restClient.performRequest(new Request("HEAD", "/" + name));
            return true;
        } catch (IOException e) {
            return false;
        }
    }

    private void createListingsIndex(String name) throws IOException {
        String body = """
            {
              "settings": { "number_of_shards": 1, "number_of_replicas": 0 },
              "mappings": {
                "properties": {
                  "title":           { "type": "text" },
                  "description":     { "type": "text" },
                  "price_per_night": { "type": "float" },
                  "room_type":       { "type": "keyword" },
                  "rating":          { "type": "float" },
                  "num_reviews":     { "type": "integer" },
                  "host_name":       { "type": "keyword" },
                  "city":            { "type": "keyword" },
                  "country":         { "type": "keyword" },
                  "amenities":       { "type": "keyword" }
                }
              }
            }
            """;
        var request = new Request("PUT", "/" + name);
        request.setJsonEntity(body);
        restClient.performRequest(request);
    }

    private void bulkIndexListings(String name) throws IOException {
        // col order: title, price, room_type, rating, reviews, host, city, country, amenities (comma-sep), description
        String[][] listings = {
            {"Cozy Studio in the Mission District",      "120.0", "Entire home/apt", "4.9", "312", "Maria G.",   "San Francisco", "US", "WiFi,Kitchen,Washer,Dryer,AC",             "Bright studio in the heart of the Mission. Walk to cafes, tacos, and BART."},
            {"Luxurious Penthouse with City Views",      "450.0", "Entire home/apt", "4.8", "198", "James L.",   "New York",      "US", "WiFi,Gym,Pool,AC,TV,Balcony,Parking",      "Floor-to-ceiling windows over the Manhattan skyline. Designer kitchen and rooftop pool."},
            {"Beachfront Villa with Private Pool",       "380.0", "Entire home/apt", "4.7", "421", "Carlos R.",  "Miami",         "US", "WiFi,Pool,BBQ,Beach,AC,Parking",           "Step onto the sand from your private deck. Heated pool, outdoor BBQ, and ocean views."},
            {"Modern Loft in the West Loop",             "175.0", "Entire home/apt", "4.6", "287", "Ashley T.",  "Chicago",       "US", "WiFi,Kitchen,Parking,TV,AC",               "Open-plan loft with exposed brick and industrial finishes, steps from top restaurants."},
            {"Charming Cottage with Fireplace",          "140.0", "Entire home/apt", "4.8", "503", "Sam W.",     "Portland",      "US", "WiFi,Kitchen,Fireplace,Washer,PetFriendly", "Quiet cottage with a wood-burning fireplace. Bikes included, farmers market one block away."},
            {"Sunny Room Near Venice Beach",             "160.0", "Private room",    "4.5", "176", "Nina P.",    "Los Angeles",   "US", "WiFi,Kitchen,AC,Balcony,Parking",          "Sun-soaked private room two blocks from the Venice boardwalk and beach volleyball."},
            {"Historic Brownstone Room in Beacon Hill",  "95.0",  "Private room",    "4.7", "364", "Ethan M.",   "Boston",        "US", "WiFi,Kitchen,TV",                          "Private room in a 19th-century brownstone. Walk to the Freedom Trail and Boston Common."},
            {"Mountain Retreat with Hot Tub",            "210.0", "Entire home/apt", "4.9", "412", "Laura K.",   "Denver",        "US", "WiFi,HotTub,Fireplace,Parking,BBQ",        "Secluded cabin with a wood-burning fireplace and outdoor hot tub under the stars."},
            {"Art Deco Suite in South Beach",            "230.0", "Entire home/apt", "4.6", "143", "Diego F.",   "Miami",         "US", "WiFi,Pool,AC,TV,Balcony",                  "Restored art deco suite with terrazzo floors, steps from the beach and nightlife."},
            {"Quiet Room Near Central Park",             "110.0", "Private room",    "4.4", "258", "Priya S.",   "New York",      "US", "WiFi,Kitchen,Gym,AC",                      "Peaceful private room on the Upper West Side, one block from Central Park jogging paths."},
            {"Treehouse Studio in the Hills",            "195.0", "Entire home/apt", "5.0", "89",  "Jake R.",    "Los Angeles",   "US", "WiFi,Balcony,Parking,AC,TV",               "Treehouse studio perched in the Hollywood Hills with panoramic city views at night."},
            {"Waterfront Condo on Lake Union",           "270.0", "Entire home/apt", "4.8", "331", "Mei L.",     "Seattle",       "US", "WiFi,Kitchen,Parking,TV,Washer,Beach",     "Modern condo on Lake Union. Kayaks at the dock, walk to Pike Place Market."},
            {"Desert Adobe near Saguaros",               "155.0", "Entire home/apt", "4.7", "207", "Rosa M.",    "Scottsdale",    "US", "WiFi,Pool,HotTub,Balcony,AC",              "Adobe home surrounded by giant saguaro cacti. Heated pool and mountain trail access."},
            {"Cozy Cabin by the River",                  "130.0", "Entire home/apt", "4.9", "478", "Tom B.",     "Asheville",     "US", "WiFi,Fireplace,Balcony,BBQ,Kitchen",       "Rustic cabin beside a mountain stream with fireplace and wraparound porch."},
            {"Stylish Studio in SoHo",                   "220.0", "Entire home/apt", "4.5", "165", "Ava K.",     "New York",      "US", "WiFi,Kitchen,AC,TV",                       "SoHo studio with exposed brick and designer furniture, blocks from galleries and shops."},
            {"Sunny Bungalow in East Austin",            "145.0", "Entire home/apt", "4.7", "389", "Miguel S.",  "Austin",        "US", "WiFi,Kitchen,Parking,BBQ,PetFriendly,AC",  "Bright bungalow in the heart of East Austin. Covered porch, firepit, and pet-friendly yard."},
            {"Rooftop Suite with Nashville Views",       "185.0", "Entire home/apt", "4.8", "214", "Claire B.",  "Nashville",     "US", "WiFi,AC,TV,Balcony,Kitchen",               "Top-floor suite with a private rooftop terrace overlooking the Nashville skyline."},
            {"Shared Room in a Colorful Victorian",      "65.0",  "Shared room",     "4.3", "97",  "Jade M.",    "San Francisco", "US", "WiFi,Kitchen,TV",                          "Affordable shared room in a restored Victorian in the Haight. Great for solo travelers."},
            {"Private Room in Craftsman Bungalow",       "80.0",  "Private room",    "4.6", "156", "Owen P.",    "Portland",      "US", "WiFi,Kitchen,Fireplace,PetFriendly,Washer", "Warm private room in a classic Craftsman home. Walkable to great coffee and food carts."},
            {"Lakefront Chalet in Lake Tahoe",           "320.0", "Entire home/apt", "4.9", "267", "Sierra L.",  "Lake Tahoe",    "US", "WiFi,Fireplace,HotTub,BBQ,Parking,Beach",  "Chalet on the lake shore with a private dock, outdoor hot tub, and views of the Sierra Nevada."},
        };

        StringBuilder bulk = new StringBuilder();
        for (String[] l : listings) {
            bulk.append("{\"index\":{}}\n");
            bulk.append("""
                {"title":"%s","description":"%s","price_per_night":%s,"room_type":"%s","rating":%s,"num_reviews":%s,"host_name":"%s","city":"%s","country":"%s","amenities":[%s]}
                """.formatted(
                    l[0], l[9], l[1], l[2], l[3], l[4], l[5], l[6], l[7],
                    java.util.Arrays.stream(l[8].split(","))
                        .map(a -> "\"" + a + "\"")
                        .collect(java.util.stream.Collectors.joining(","))
                ).strip() + "\n");
        }

        var request = new Request("POST", "/" + name + "/_bulk");
        request.setJsonEntity(bulk.toString());
        restClient.performRequest(request);
    }

    private long parseLong(Object v) {
        if (v == null) return 0;
        try { return Long.parseLong(v.toString()); } catch (NumberFormatException e) { return 0; }
    }

    private int parseInt(Object v) {
        if (v == null) return 0;
        try { return Integer.parseInt(v.toString()); } catch (NumberFormatException e) { return 0; }
    }
}
