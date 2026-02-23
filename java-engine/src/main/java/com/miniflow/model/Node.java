package com.miniflow.model;

import java.util.Collections;
import java.util.Map;

public class Node {
    public String id;
    public String type;
    public Map<String, Object> data; 
    
    public Map<String, Object> position;
    public Integer width;
    public Integer height;

    // --- Getters Básicos ---
    
    public String getId() {
        return id;
    }

    public String getType() {
        return type != null ? type : "unknown";
    }

    /**
     * REFACTOR: Encapsulamiento de la configuración.
     */
    @SuppressWarnings("unchecked")
    public Map<String, Object> getConfig() {
        if (data == null) return Collections.emptyMap();
        
        Object config = data.get("config");
        if (config instanceof Map) {
            return (Map<String, Object>) config;
        }
        return data;
    }

    public String getErrorPolicy() {
        Map<String, Object> config = getConfig();
        Object policy = config.getOrDefault("errorPolicy", config.get("onError"));
        return policy != null ? String.valueOf(policy).toUpperCase() : "STOP";
    }

    public String getLabel() {
        return data != null ? String.valueOf(data.getOrDefault("label", id)) : id;
    }
}