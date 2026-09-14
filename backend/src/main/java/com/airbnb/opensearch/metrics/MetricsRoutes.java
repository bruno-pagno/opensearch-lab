package com.airbnb.opensearch.metrics;

import io.javalin.Javalin;

public class MetricsRoutes {

    public static void register(Javalin app, MetricsService service) {
        app.get("/api/metrics/cluster", ctx -> ctx.json(service.clusterStats()));
        app.get("/api/metrics/nodes",   ctx -> ctx.json(service.nodeMetrics()));
        app.get("/api/metrics/indices", ctx -> ctx.json(service.indexStats()));
    }
}
