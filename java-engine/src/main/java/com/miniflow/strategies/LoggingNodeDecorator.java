package com.miniflow.strategies;

import com.miniflow.model.Node;
import com.miniflow.context.ExecutionContext;
import com.miniflow.utils.LogUtils;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;

public class LoggingNodeDecorator implements NodeExecutor {
    private final NodeExecutor wrapped;

    public LoggingNodeDecorator(NodeExecutor wrapped) {
        this.wrapped = wrapped;
    }

    @Override
    @SuppressWarnings("unchecked")
    public void execute(Node node, ExecutionContext context) throws Exception {
        long startTime = System.currentTimeMillis();
        // 1. Filtrar variables internas (__branch, __startTime, etc.)
        // Esto asegura que el usuario solo vea SUS datos.
        Map<String, Object> inputState = filterInternalVars(context.getVariables());

        System.out.println("[JAVA-STDOUT]: ======================");
        System.out.println("[JAVA-STDOUT]: Nodo: " + node.getId() + " [" + node.getType().toUpperCase() + "]");
        System.out.println("[JAVA-STDOUT]:    -> INPUT DATA: " + LogUtils.formatMapForLog(inputState));
        System.out.println("[JAVA-STDOUT]:    -> CONFIG: " + LogUtils.formatMapForLog(node.getConfig()));
        System.out.println("[JAVA-STDOUT]: ");

        try {
            wrapped.execute(node, context);

            // 2. Snapshot de salida filtrado
            Map<String, Object> outputState = filterInternalVars(context.getVariables());

            // 3. Obtener los detalles técnicos (el canal privado)
            Object nodeDetails = context.getNodeOutput(node.getId());

            System.out.println("[JAVA-STDOUT]:    OUTPUT DATA -->: " + LogUtils.formatMapForLog(outputState));

            if (nodeDetails instanceof Map) {
                System.out.println("[JAVA-STDOUT]:    NODE_EXEC_DETAILS -->: "
                        + LogUtils.formatMapForLog((Map<String, Object>) nodeDetails));
            }

            System.out.println("[JAVA-STDOUT]: ");
            System.out.println("[JAVA-STDOUT]: Resultado --> OK");

        } catch (Exception e) {
            String errorDetail = (e.getMessage() != null) ? e.getMessage() : e.toString();
            System.out.println("[JAVA-STDOUT]:    Resultado: ERROR --> " + errorDetail.replace("\n", " "));
            throw e;
        } finally {
            long durationMs = System.currentTimeMillis() - startTime;
            System.out.println("[JAVA-STDOUT]:    DURATION -->: " + durationMs + "ms");
            System.out.println("[JAVA-STDOUT]: ======================");
        }
    }

    /**
     * Filtra el mapa para ocultar variables de sistema que empiezan con __
     */
    private Map<String, Object> filterInternalVars(Map<String, Object> variables) {
        if (variables == null)
            return new HashMap<>();
        return variables.entrySet().stream()
                .filter(entry -> !entry.getKey().startsWith("__"))
                .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));
    }
}