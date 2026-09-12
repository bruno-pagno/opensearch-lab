package com.airbnb.opensearch;

import com.airbnb.opensearch.client.OpenSearchClientFactory;
import com.airbnb.opensearch.cluster.ClusterRoutes;
import com.airbnb.opensearch.cluster.ClusterService;
import io.javalin.Javalin;

public class Main {

    public static void main(String[] args) {
        String opensearchUrl = System.getenv().getOrDefault("OPENSEARCH_URL", "http://localhost:9200");

        OpenSearchClientFactory factory = new OpenSearchClientFactory(opensearchUrl);
        ClusterService clusterService = new ClusterService(factory.client(), factory.restClient());

        Javalin app = Javalin.create(config ->
            config.bundledPlugins.enableCors(cors -> cors.addRule(it -> it.anyHost()))
        );

        app.exception(Exception.class, (e, ctx) ->
            ctx.status(500).json(java.util.Map.of("error", e.getMessage()))
        );

        ClusterRoutes.register(app, clusterService);

        app.start(8080);
    }
}
