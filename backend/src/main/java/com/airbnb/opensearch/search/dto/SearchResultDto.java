package com.airbnb.opensearch.search.dto;

import java.util.List;

public record SearchResultDto(
    List<ListingDto> listings,
    int total,
    double maxScore,
    String executedQuery
) {}
