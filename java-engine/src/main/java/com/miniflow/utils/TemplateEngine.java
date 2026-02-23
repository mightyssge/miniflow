package com.miniflow.utils;

import com.miniflow.context.ExecutionContext;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class TemplateEngine {
    private static final Pattern PATTERN = Pattern.compile("\\{\\{\\s*(?:context\\.)?([a-zA-Z0-9_]+)\\s*\\}\\}");

    public static String render(String input, ExecutionContext context) {
        if (input == null || input.isBlank()) return input;

        Matcher matcher = PATTERN.matcher(input);
        StringBuilder sb = new StringBuilder();

        while (matcher.find()) {
            String key = matcher.group(1);
            Object value = context.getVariable(key);
            String replacement = (value == null) ? "" : String.valueOf(value);
            matcher.appendReplacement(sb, Matcher.quoteReplacement(replacement));
        }
        matcher.appendTail(sb);
        return sb.toString();
    }
}