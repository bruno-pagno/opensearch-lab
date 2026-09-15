package com.airbnb.opensearch.search;

import io.javalin.Javalin;

public class SearchRoutes {

    public static void register(Javalin app, SearchService service) {
        app.get("/api/search/listings", ctx -> {
            int from = ctx.queryParamAsClass("from", Integer.class).getOrDefault(0);
            int size = ctx.queryParamAsClass("size", Integer.class).getOrDefault(9);
            ctx.json(service.search(
                ctx.queryParam("q"),
                ctx.queryParam("queryType"),
                ctx.queryParam("roomType"),
                ctx.queryParam("minPrice"),
                ctx.queryParam("maxPrice"),
                ctx.queryParams("amenities"),
                ctx.queryParam("minRating"),
                from, size
            ));
        });
    }
}
