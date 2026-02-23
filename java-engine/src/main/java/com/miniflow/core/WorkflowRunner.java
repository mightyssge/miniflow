package com.miniflow.core;

import com.miniflow.context.ExecutionContext;
import com.miniflow.factory.ExecutorFactory;
import com.miniflow.model.Node;
import com.miniflow.model.Workflow;
import com.miniflow.strategies.NodeExecutor;
import java.util.Map;

/**
 * Motor principal encargado de navegar el grafo del workflow
 * y ejecutar las estrategias correspondientes.
 */
public class WorkflowRunner {

    public void run(Workflow workflow) {
        ExecutionContext context = new ExecutionContext();
        
        // 1. Marcar inicio GLOBAL (Invisible para el OUTPUT DATA del log)
        long startTime = System.currentTimeMillis();
        context.setVariable("__workflowStartTime", startTime);

        boolean hasErrors = false;
        String name = (workflow != null && workflow.name != null) ? workflow.name : "Workflow";
        System.out.println("[JAVA-STDOUT]: Iniciando: " + name);

        Node currentNode = NodeResolver.findStartNode(workflow);

        while (currentNode != null) {
            String nodeId = currentNode.id;
            try {
                NodeExecutor executor = ExecutorFactory.getExecutor(currentNode.type);
                executor.execute(currentNode, context);
                
            } catch (Exception e) {
                hasErrors = true;
                String errorMsg = (e.getMessage() == null) ? e.getClass().getSimpleName() : e.getMessage();
                
                context.setVariable("__lastError", errorMsg);
                context.setNodeOutput(nodeId, Map.of("error", errorMsg, "success", false));
                
                if (isStopPolicyActive(currentNode)) break;
            }

            if ("END".equalsIgnoreCase(currentNode.type)) break;
            currentNode = NodeResolver.resolveNext(workflow, currentNode, context);
        }

        // 2. Cálculo final centralizado
        long duration = System.currentTimeMillis() - startTime;
        
        // 3. Reporte final para humanos
        System.out.println("[JAVA-STDOUT]: ============= ");
        System.out.println("[JAVA-STDOUT]: Finalizado en: " + duration + " ms");
        System.out.println("[JAVA-STDOUT]: Estado final: " + (hasErrors ? "CON ERRORES" : "EXITOSO"));
        
        // 4. Reporte final estructurado para Electron (JSON puro)
        String status = hasErrors ? "FAILED" : "SUCCESS";
        System.out.println(String.format("{\"event\": \"WORKFLOW_FINISHED\", \"status\": \"%s\", \"duration\": %d}", status, duration));
    }

    private boolean isStopPolicyActive(Node node) {
        try {
            Map<String, Object> cfg = node.getConfig();
            if (cfg == null || cfg.isEmpty()) return true;
            
            // Buscamos la política en config.errorPolicy o config.onError
            String p = String.valueOf(cfg.getOrDefault("errorPolicy", cfg.getOrDefault("onError", "STOP")));
            return p.toUpperCase().contains("STOP");
        } catch (Exception e) {
            return true;
        }
    }
}