package com.airbnb.opensearch.index;

import com.airbnb.opensearch.index.dto.CreateIndexDto;
import io.javalin.Javalin;

public class IndexRoutes {

    public static void register(Javalin app, IndexService service) {
        app.get("/api/indices", ctx -> ctx.json(service.list()));

        app.post("/api/indices", ctx -> {
            var req = ctx.bodyAsClass(CreateIndexDto.class);
            service.create(req);
            ctx.status(201);
        });

        app.delete("/api/indices/{name}", ctx -> {
            service.delete(ctx.pathParam("name"));
            ctx.status(204);
        });

        app.get("/api/indices/{name}/mapping", ctx ->
            ctx.json(service.mapping(ctx.pathParam("name")))
        );

        app.put("/api/indices/{name}/replicas", ctx -> {
            var body = ctx.bodyAsClass(java.util.Map.class);
            int count = ((Number) body.get("count")).intValue();
            service.setReplicas(ctx.pathParam("name"), count);
            ctx.status(200).json(java.util.Map.of("ok", true));
        });

        app.post("/api/indices/seed/listings", ctx -> {
            service.seedListings();
            ctx.status(200).json(java.util.Map.of("seeded", "airbnb-listings"));
        });
    }
}
