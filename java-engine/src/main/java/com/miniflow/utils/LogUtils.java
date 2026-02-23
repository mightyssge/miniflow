package com.miniflow.utils;

import java.util.Map;
import java.util.HashMap;
import com.fasterxml.jackson.databind.ObjectMapper;

public class LogUtils {

    private static final ObjectMapper mapper = new ObjectMapper();

    /**
     * Formatea un mapa como un JSON válido en una sola línea de log.
     * Escapa saltos de línea y limita el tamaño de los strings muy largos.
     */
    public static String formatMapForLog(Map<String, Object> map) {
        if (map == null || map.isEmpty())
            return "{}";

        try {
            Map<String, Object> safeMap = new HashMap<>();
            map.forEach((k, v) -> {
                if (v instanceof String) {
                    String str = (String) v;
                    if (str.length() > 5000) {
                        safeMap.put(k, str.substring(0, 5000) + "... [TRUNCATED]");
                    } else {
                        safeMap.put(k, str);
                    }
                } else {
                    safeMap.put(k, v);
                }
            });
            return mapper.writeValueAsString(safeMap);
        } catch (Exception e) {
            return "{\"error\": \"Could not serialize map\"}";
        }
    }
}