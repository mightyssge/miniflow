package com.miniflow.utils;

public class TypeConverter {
    public static String asString(Object v) {
        return v == null ? null : String.valueOf(v);
    }

    public static Integer asInt(Object v, Integer defaultValue) {
        if (v == null) return defaultValue;
        if (v instanceof Number n) return n.intValue();
        try {
            return Integer.parseInt(String.valueOf(v).trim());
        } catch (Exception e) {
            return defaultValue;
        }
    }

    public static Object normalize(Object value) {
        if (!(value instanceof String s)) return value;
        String t = s.trim();
        try {
            if (t.matches("^-?\\d+$")) return Integer.parseInt(t);
            if (t.matches("^-?\\d+\\.\\d+$")) return Double.parseDouble(t);
        } catch (Exception ignored) {}
        return s;
    }
}
