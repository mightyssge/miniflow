package com.miniflow.utils;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Map;

public class JsonUtils {
    private static final ObjectMapper mapper = new ObjectMapper();

    public static Object tryParse(String body) {
        try {
            if (body == null || body.isBlank()) return null;
            return mapper.readValue(body, Object.class);
        } catch (Exception ignored) {
            return null;
        }
    }

    public static Object extractByPath(Object parsed, String path) {
        if (parsed == null || path == null || path.isBlank()) return null;
        if (path.startsWith("$.")) path = path.substring(2);
        
        String[] parts = path.split("\\.");
        Object current = parsed;

        for (String part : parts) {
            if (current instanceof Map<?, ?> m) {
                current = m.get(part);
            } else {
                return null;
            }
        }
        return current;
    }
}