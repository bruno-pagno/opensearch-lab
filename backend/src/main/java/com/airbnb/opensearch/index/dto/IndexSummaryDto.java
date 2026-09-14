package com.airbnb.opensearch.index.dto;

public record IndexSummaryDto(
    String name,
    String health,
    String status,
    long docsCount,
    String storeSize,
    int primaryShards,
    int replicaShards
) {}
