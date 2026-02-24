package com.miniflow.factory;

import com.miniflow.strategies.*;
import com.miniflow.strategies.TimerStrategy;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * REFACTOR: Cache de Estrategias Decoradas.
 * Ahora no solo cacheamos la estrategia, sino la versión decorada para que
 * el motor siempre tenga logging sin costo de instanciación extra.
 */
public class ExecutorFactory {

    private static final Map<String, NodeExecutor> STRATEGIES = new ConcurrentHashMap<>();

    public static NodeExecutor getExecutor(String type) {
        String t = (type == null) ? "" : type.toUpperCase().trim();

        return STRATEGIES.computeIfAbsent(t, key -> {
            // 1. Creamos la estrategia concreta
            NodeExecutor rawStrategy = switch (key) {
                case "START" -> new StartStrategy();
                case "CREATE_FOLDER" -> new CreateFolderStrategy();
                case "HTTP_REQUEST" -> new HttpRequestStrategy();
                case "COMMAND" -> new CommandStrategy();
                case "CONDITIONAL" -> new ConditionalStrategy();
                case "END" -> new EndStrategy();
                case "TIMER" -> new TimerStrategy();
                default -> throw new IllegalArgumentException("Unknown node type: " + key);
            };

            // 2. La envolvemos en el Decorador una sola vez
            // De esta forma, cada vez que pidan "HTTP_REQUEST",
            // recibirán la misma instancia del decorador que envuelve a la misma
            // estrategia.
            return new LoggingNodeDecorator(rawStrategy);
        });
    }
}