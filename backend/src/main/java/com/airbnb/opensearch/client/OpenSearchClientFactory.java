package com.airbnb.opensearch.client;

import org.apache.http.HttpHost;
import org.opensearch.client.RestClient;
import org.opensearch.client.json.jackson.JacksonJsonpMapper;
import org.opensearch.client.opensearch.OpenSearchClient;
import org.opensearch.client.transport.rest_client.RestClientTransport;

import java.net.URI;

public class OpenSearchClientFactory {

    private final RestClient restClient;
    private final OpenSearchClient client;

    public OpenSearchClientFactory(String url) {
        URI uri = URI.create(url);
        this.restClient = RestClient.builder(
            new HttpHost(uri.getHost(), uri.getPort(), uri.getScheme())
        ).build();
        RestClientTransport transport = new RestClientTransport(restClient, new JacksonJsonpMapper());
        this.client = new OpenSearchClient(transport);
    }

    public OpenSearchClient client() {
        return client;
    }

    public RestClient restClient() {
        return restClient;
    }
}
