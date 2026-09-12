load("@rules_java//java:defs.bzl", "java_binary")

java_binary(
    name = "Main",
    srcs = glob(["src/main/java/**/*.java"]),
    main_class = "com.airbnb.opensearch.Main",
    deps = [
        "@maven//:io_javalin_javalin",
        "@maven//:org_opensearch_client_opensearch_java",
        "@maven//:org_opensearch_client_opensearch_rest_client",
        "@maven//:org_apache_httpcomponents_httpcore",
        "@maven//:com_fasterxml_jackson_core_jackson_databind",
        "@maven//:org_slf4j_slf4j_simple",
    ],
)
