package com.airbnb.opensearch.metrics.dto;

public record IndexStatsDto(
    String name,
    long docsCount,
    long storeSizeBytes,
    long queryTotal,
    long queryTimeMs,
    long indexTotal,
    long indexTimeMs,
    long refreshTotal,
    long refreshTimeMs,
    int segmentCount
) {}
