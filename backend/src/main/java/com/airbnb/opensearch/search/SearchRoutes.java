package com.airbnb.opensearch.search;

import io.javalin.Javalin;

public class SearchRoutes {

    public static void register(Javalin app, SearchService service) {
        app.get("/api/search/listings", ctx ->
            ctx.json(service.search(ctx.queryParam("q")))
        );
    }
}
