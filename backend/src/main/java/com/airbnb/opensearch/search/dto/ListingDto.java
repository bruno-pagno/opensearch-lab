package com.airbnb.opensearch.search.dto;

import java.util.List;

public record ListingDto(
    String id,
    String title,
    String description,
    double pricePerNight,
    String roomType,
    double rating,
    int numReviews,
    String hostName,
    String city,
    String country,
    List<String> amenities,
    double score
) {}
