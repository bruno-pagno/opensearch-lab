package com.airbnb.opensearch.index.dto;

public record CreateIndexDto(
    String name,
    int shards,
    int replicas
) {}
