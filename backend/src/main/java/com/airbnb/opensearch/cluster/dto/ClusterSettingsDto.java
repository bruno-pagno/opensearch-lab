package com.airbnb.opensearch.cluster.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Map;

public record ClusterSettingsDto(
    Map<String, Object> persistent,
    @JsonProperty("transient") Map<String, Object> transientSettings
) {}
