package com.airbnb.opensearch.metrics.dto;

public record NodeMetricsDto(
    String id,
    String name,
    long heapUsedBytes,
    long heapMaxBytes,
    long gcYoungCount,
    long gcYoungTimeMs,
    long gcOldCount,
    long gcOldTimeMs,
    int searchActive,
    int searchQueue,
    long searchRejected,
    int writeActive,
    int writeQueue,
    long writeRejected,
    double parentBreakerPercent,
    double requestBreakerPercent,
    double fielddataBreakerPercent
) {}
