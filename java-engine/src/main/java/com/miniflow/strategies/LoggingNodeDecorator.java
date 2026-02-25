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
    public void execute(Node node, ExecutionContext context) throws Exception {
        long startTime = System.currentTimeMillis();

        // Todo el bloque de impresión debe ser atómico
        synchronized (System.out) {
            Map<String, Object> inputState = filterInternalVars(context.getVariables());
            System.out.println("[JAVA-STDOUT]: [" + node.getId() + "] ======================");
            System.out.println("[JAVA-STDOUT]: [" + node.getId() + "] Nodo: " + node.getId() + " ["
                    + node.getType().toUpperCase() + "]");
            System.out.println(
                    "[JAVA-STDOUT]: [" + node.getId() + "]    -> INPUT DATA: " + LogUtils.formatMapForLog(inputState));
            System.out.println("[JAVA-STDOUT]: [" + node.getId() + "]    -> CONFIG: "
                    + LogUtils.formatMapForLog(node.getConfig()));
            System.out.println("[JAVA-STDOUT]: [" + node.getId() + "] ");
        }

        try {
            wrapped.execute(node, context);

            synchronized (System.out) {
                Map<String, Object> outputState = filterInternalVars(context.getVariables());
                Object nodeDetails = context.getNodeOutput(node.getId());

                System.out.println("[JAVA-STDOUT]: [" + node.getId() + "]    OUTPUT DATA -->: "
                        + LogUtils.formatMapForLog(outputState));
                if (nodeDetails instanceof Map) {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> detailsMap = (Map<String, Object>) nodeDetails;
                    System.out.println("[JAVA-STDOUT]: [" + node.getId() + "]    NODE_EXEC_DETAILS -->: "
                            + LogUtils.formatMapForLog(detailsMap));
                }
                System.out.println("[JAVA-STDOUT]: [" + node.getId() + "] ");
                System.out.println("[JAVA-STDOUT]: [" + node.getId() + "] Resultado --> OK");
            }
        } catch (com.miniflow.strategies.ParallelJoinStrategy.BarrierHaltException e) {
            synchronized (System.out) {
                Map<String, Object> outputState = filterInternalVars(context.getVariables());
                System.out.println("[JAVA-STDOUT]: [" + node.getId() + "]    OUTPUT DATA -->: "
                        + LogUtils.formatMapForLog(outputState));
                System.out.println(
                        "[JAVA-STDOUT]: [" + node.getId() + "]    NODE_EXEC_DETAILS -->: {\"status\": \"HALTED\"}");
                System.out.println("[JAVA-STDOUT]: [" + node.getId() + "] ");
                System.out.println("[JAVA-STDOUT]: [" + node.getId() + "] Resultado --> OK (HALTED)");
            }
            throw e;
        } catch (Exception e) {
            synchronized (System.out) {
                String errorDetail = (e.getMessage() != null) ? e.getMessage() : e.toString();
                System.out.println("[JAVA-STDOUT]: [" + node.getId() + "]    Resultado: ERROR --> "
                        + errorDetail.replace("\n", " "));
            }
            throw e;
        } finally {
            synchronized (System.out) {
                long durationMs = System.currentTimeMillis() - startTime;
                System.out.println("[JAVA-STDOUT]: [" + node.getId() + "]    DURATION -->: " + durationMs + "ms");
                System.out.println("[JAVA-STDOUT]: [" + node.getId() + "] ======================");
            }
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