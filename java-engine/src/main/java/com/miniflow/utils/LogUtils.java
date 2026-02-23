package com.miniflow.utils;

import java.util.Map;

public class LogUtils {

    /**
     * Formatea un mapa para que sea legible en una sola línea de log.
     * Escapa saltos de línea y limita el tamaño de valores muy largos.
     */
    public static String formatMapForLog(Map<String, Object> map) {
        if (map == null || map.isEmpty()) return "{}";
        
        StringBuilder sb = new StringBuilder("{");
        map.forEach((k, v) -> {
            String valStr = String.valueOf(v);
            
            // 1. Limpiar saltos de línea para no romper el streaming de Electron
            valStr = valStr.replace("\n", " \\n ").replace("\r", "");
            
            // 2. Truncar si el valor es demasiado pesado (ej. un HTML o JSON gigante)
            if (valStr.length() > 150) {
                valStr = valStr.substring(0, 147) + "...";
            }
            
            sb.append(k).append("=").append(valStr).append(", ");
        });

        if (sb.length() > 1) sb.setLength(sb.length() - 2);
        sb.append("}");
        return sb.toString();
    }
}