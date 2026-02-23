package com.miniflow.utils;

import java.net.URI;
import java.net.http.*;
import java.time.Duration;
import java.util.*;

public class HttpHelper {
    private static final HttpClient CLIENT = HttpClient.newBuilder().build();

    public static HttpResponse<String> executeWithRetries(List<String> urls, String method, String body, 
                                                         Map<String, String> headers, int timeout, int retries) throws Exception {
        Exception lastEx = null;
        for (String url : urls) {
            for (int i = 0; i <= retries; i++) {
                try {
                    return send(url, method, body, headers, timeout);
                } catch (Exception ex) {
                    lastEx = ex;
                }
            }
        }
        throw lastEx != null ? lastEx : new Exception("HTTP Request failed");
    }

    private static HttpResponse<String> send(String url, String method, String body, 
                                            Map<String, String> headers, int timeout) throws Exception {
        HttpRequest.Builder builder = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .timeout(Duration.ofMillis(timeout));

        if (headers != null) headers.forEach(builder::header);

        HttpRequest.BodyPublisher publisher = methodSupportsBody(method) && body != null 
                ? HttpRequest.BodyPublishers.ofString(body) 
                : HttpRequest.BodyPublishers.noBody();

        builder.method(method.toUpperCase(), publisher);
        return CLIENT.send(builder.build(), HttpResponse.BodyHandlers.ofString());
    }

    public static boolean isError(int status) { return status >= 400; }

    public static boolean methodSupportsBody(String method) {
        return method != null && List.of("POST", "PUT", "PATCH").contains(method.toUpperCase());
    }
}