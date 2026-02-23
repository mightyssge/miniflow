package com.miniflow.utils;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;

public class OSUtils {
    
    public static boolean isWindows() {
        return System.getProperty("os.name").toLowerCase().contains("win");
    }

    public static String quote(String v) {
        if (v == null) return "\"\"";
        v = v.trim();
        if (v.startsWith("\"") && v.endsWith("\"")) return v;
        return "\"" + v.replace("\"", "\\\"") + "\"";
    }

    public static String readStream(java.io.InputStream in) throws Exception {
        StringBuilder sb = new StringBuilder();
        try (BufferedReader br = new BufferedReader(new InputStreamReader(in, StandardCharsets.UTF_8))) {
            String line;
            while ((line = br.readLine()) != null) sb.append(line).append("\n");
        }
        return sb.toString();
    }
}