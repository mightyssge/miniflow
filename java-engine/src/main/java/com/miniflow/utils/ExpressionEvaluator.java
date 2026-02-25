package com.miniflow.utils;

import com.miniflow.context.ExecutionContext;
import java.util.Objects;

public class ExpressionEvaluator {

    public static boolean evaluate(String expression, ExecutionContext context) {
        if (expression == null || expression.isBlank())
            return false;

        String s = expression.trim();
        // Soportamos == y !=
        String op = s.contains("==") ? "==" : s.contains("!=") ? "!=" : null;
        if (op == null)
            return false;

        String[] parts = s.split(op, 2);
        if (parts.length != 2)
            return false;

        Object leftValue = resolveLeftOperand(parts[0].trim(), context);
        Object rightValue = TypeConverter.normalize(parts[1].trim().replace("\"", "").replace("'", ""));

        boolean equals = compare(leftValue, rightValue);
        return "==".equals(op) ? equals : !equals;
    }

    private static Object resolveLeftOperand(String key, ExecutionContext context) {
        String cleanKey = key.startsWith("context.") ? key.substring(8) : key;

        // Soporte para variables anidadas (ej: pokeData.name)
        if (cleanKey.contains(".")) {
            String[] tokens = cleanKey.split("\\.");
            Object current = context.getVariable(tokens[0]);
            for (int i = 1; i < tokens.length; i++) {
                if (current instanceof java.util.Map) {
                    current = ((java.util.Map<?, ?>) current).get(tokens[i]);
                } else {
                    return null; // Si no es un mapa y tratamos de sacar prop, falla silencioso
                }
            }
            return current;
        }

        return context.getVariable(cleanKey);
    }

    private static boolean compare(Object a, Object b) {
        if (a == null || b == null)
            return Objects.equals(a, b);

        if (a instanceof Number && b instanceof Number) {
            return Double.compare(((Number) a).doubleValue(), ((Number) b).doubleValue()) == 0;
        }

        return String.valueOf(a).equals(String.valueOf(b));
    }
}