package com.airbnb.opensearch.metrics.dto;

public record ClusterStatsDto(
    long totalDocs,
    long storeSizeBytes,
    int totalShards,
    int primaryShards,
    long queryTotal,
    long queryTimeMs,
    long indexTotal,
    long indexTimeMs
) {}
