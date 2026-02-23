package com.miniflow.strategies;

import com.miniflow.context.ExecutionContext;
import com.miniflow.model.Node;
import com.miniflow.utils.*;
import java.net.http.HttpResponse;
import java.util.*;

public class HttpRequestStrategy implements NodeExecutor {

    @Override
    public void execute(Node node, ExecutionContext context) throws Exception {
        Map<String, Object> cfg = node.getConfig();
        
        // 1. Resolver parámetros con Template Engine
        String method = TypeConverter.asString(cfg.getOrDefault("method", "GET"));
        List<String> urls = resolveUrls(cfg, context);
        String body = TemplateEngine.render(TypeConverter.asString(cfg.get("body")), context);
        Map<String, String> headers = renderHeaders(cfg, context);

        // 2. Ejecutar vía Helper
        HttpResponse<String> resp = HttpHelper.executeWithRetries(
            urls, method, body, headers, 
            TypeConverter.asInt(cfg.get("timeoutMs"), 5000), 
            TypeConverter.asInt(cfg.get("retries"), 0)
        );

        // 3. Procesar y guardar (Limpieza de contexto)
        processOutput(node.getId(), resp, cfg, context);
    }

    private void processOutput(String nodeId, HttpResponse<String> resp, Map<String, Object> cfg, ExecutionContext ctx) throws Exception {
        int status = resp.statusCode();
        Object parsedBody = JsonUtils.tryParse(resp.body());

        // Snapshot técnico aislado
        ctx.setNodeOutput(nodeId, Map.of("status_code", status, "response", parsedBody));

        // Mapeo inteligente (Cero contaminación)
        Map<String, Object> mapping = (Map<String, Object>) cfg.getOrDefault("map", cfg.get("outputMapping"));
        if (mapping != null && !mapping.isEmpty()) {
            mapping.forEach((k, v) -> ctx.setVariable(k, TypeConverter.normalize(JsonUtils.extractByPath(parsedBody, (String)v))));
        } else {
            ctx.setVariable("lastResponse", Map.of("status_code", status, "response", parsedBody));
        }

        if (HttpHelper.isError(status) && "STOP".equalsIgnoreCase(TypeConverter.asString(cfg.get("errorPolicy")))) {
            throw new Exception("HTTP Error " + status);
        }
    }

    private List<String> resolveUrls(Map<String, Object> cfg, ExecutionContext ctx) {
        List<String> raw = new ArrayList<>();
        Optional.ofNullable(cfg.get("url")).map(String::valueOf).ifPresent(raw::add);
        if (cfg.get("fallbackUrls") instanceof List<?> list) list.forEach(u -> raw.add(String.valueOf(u)));
        return raw.stream().map(u -> TemplateEngine.render(u, ctx)).toList();
    }

    private Map<String, String> renderHeaders(Map<String, Object> cfg, ExecutionContext ctx) {
        Map<String, String> rendered = new HashMap<>();
        if (cfg.get("headers") instanceof Map<?, ?> h) {
            h.forEach((k, v) -> rendered.put(String.valueOf(k), TemplateEngine.render(String.valueOf(v), ctx)));
        }
        return rendered;
    }
}