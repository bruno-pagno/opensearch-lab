package com.airbnb.opensearch.phase1.dto;

import java.util.List;

public record NodeDto(
    String id,
    String name,
    String host,
    String version,
    List<String> roles,
    Long heapUsedBytes,
    Long heapMaxBytes,
    Double heapPercent,
    Long diskTotalBytes,
    Long diskAvailableBytes
) {}
