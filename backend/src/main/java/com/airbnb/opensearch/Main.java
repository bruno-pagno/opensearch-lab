package com.airbnb.opensearch;

import com.airbnb.opensearch.client.OpenSearchClientFactory;
import com.airbnb.opensearch.cluster.ClusterRoutes;
import com.airbnb.opensearch.cluster.ClusterService;
import com.airbnb.opensearch.index.IndexRoutes;
import com.airbnb.opensearch.index.IndexService;
import com.airbnb.opensearch.metrics.MetricsRoutes;
import com.airbnb.opensearch.metrics.MetricsService;
import com.airbnb.opensearch.search.SearchRoutes;
import com.airbnb.opensearch.search.SearchService;
import io.javalin.Javalin;

public class Main {

    private static void applyZeroReplicas(org.opensearch.client.RestClient restClient) {
        // Patch all existing indices (e.g. from a previous run's persistent volume)
        try {
            var patch = new org.opensearch.client.Request("PUT", "/_all/_settings");
            patch.setJsonEntity("{\"index\":{\"number_of_replicas\":0}}");
            restClient.performRequest(patch);
        } catch (Exception ignored) {}

        // Index template so every future index (including Dashboards system indices) starts with 0 replicas
        try {
            var tpl = new org.opensearch.client.Request("PUT", "/_index_template/zero-replicas-default");
            tpl.setJsonEntity("""
                {
                  "index_patterns": ["*"],
                  "priority": 0,
                  "template": {
                    "settings": { "number_of_replicas": 0 }
                  }
                }
                """);
            restClient.performRequest(tpl);
        } catch (Exception ignored) {}
    }

    public static void main(String[] args) {
        String opensearchUrl = System.getenv().getOrDefault("OPENSEARCH_URL", "http://localhost:9200");

        OpenSearchClientFactory factory = new OpenSearchClientFactory(opensearchUrl);
        ClusterService clusterService   = new ClusterService(factory.client(), factory.restClient());
        IndexService   indexService     = new IndexService(factory.restClient());
        MetricsService metricsService   = new MetricsService(factory.restClient());
        SearchService  searchService    = new SearchService(factory.restClient());

        Javalin app = Javalin.create(config ->
            config.bundledPlugins.enableCors(cors -> cors.addRule(it -> it.anyHost()))
        );

        app.exception(Exception.class, (e, ctx) ->
            ctx.status(500).json(java.util.Map.of("error", e.getMessage()))
        );

        applyZeroReplicas(factory.restClient());

        ClusterRoutes.register(app, clusterService);
        IndexRoutes.register(app, indexService);
        MetricsRoutes.register(app, metricsService);
        SearchRoutes.register(app, searchService);

        app.start(8080);
    }
}
