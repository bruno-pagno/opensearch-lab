package com.airbnb.opensearch.phase1.dto;

public record ClusterHealthDto(
    String clusterName,
    String status,
    int numberOfNodes,
    int numberOfDataNodes,
    int activePrimaryShards,
    int activeShards,
    int relocatingShards,
    int initializingShards,
    int unassignedShards
) {}
