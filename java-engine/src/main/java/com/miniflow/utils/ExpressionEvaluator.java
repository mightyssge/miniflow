package com.miniflow.utils;

import com.miniflow.context.ExecutionContext;
import java.util.Objects;

public class ExpressionEvaluator {

    public static boolean evaluate(String expression, ExecutionContext context) {
        if (expression == null || expression.isBlank()) return false;

        String s = expression.trim();
        // Soportamos == y !=
        String op = s.contains("==") ? "==" : s.contains("!=") ? "!=" : null;
        if (op == null) return false;

        String[] parts = s.split(op, 2);
        if (parts.length != 2) return false;

        Object leftValue = resolveLeftOperand(parts[0].trim(), context);
        Object rightValue = TypeConverter.normalize(parts[1].trim().replace("\"", "").replace("'", ""));

        boolean equals = compare(leftValue, rightValue);
        return "==".equals(op) ? equals : !equals;
    }

    private static Object resolveLeftOperand(String key, ExecutionContext context) {
        String cleanKey = key.startsWith("context.") ? key.substring(8) : key;
        return context.getVariable(cleanKey);
    }

    private static boolean compare(Object a, Object b) {
        if (a == null || b == null) return Objects.equals(a, b);

        if (a instanceof Number && b instanceof Number) {
            return Double.compare(((Number) a).doubleValue(), ((Number) b).doubleValue()) == 0;
        }

        return String.valueOf(a).equals(String.valueOf(b));
    }
}