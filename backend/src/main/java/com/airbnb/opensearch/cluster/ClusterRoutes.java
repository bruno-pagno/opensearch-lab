package com.airbnb.opensearch.cluster;

import io.javalin.Javalin;

public class ClusterRoutes {

    public static void register(Javalin app, ClusterService service) {
        app.get("/api/cluster/health", ctx -> ctx.json(service.health()));
        app.get("/api/cluster/nodes", ctx -> ctx.json(service.nodes()));
        app.get("/api/cluster/settings", ctx -> ctx.json(service.settings()));
    }
}
