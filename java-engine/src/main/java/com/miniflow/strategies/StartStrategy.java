package com.miniflow.strategies;

import com.miniflow.model.Node;
import com.miniflow.context.ExecutionContext;
import java.util.Map;

public class StartStrategy implements NodeExecutor {
    @Override
    public void execute(Node node, ExecutionContext context) {
        // Recuperamos el tiempo que el Runner ya marcó al iniciar todo
        Object startTime = context.getVariable("__workflowStartTime");

        // Snapshot para el Panel Derecho (React / n8n style)
        context.setNodeOutput(node.id, Map.of(
            "message", "Workflow execution started",
            "systemStartTime", startTime != null ? startTime : System.currentTimeMillis(),
            "initialState", Map.of(
                "hasPayload", context.getVariable("payload") != null,
                "status", "RUNNING"
            )
        ));
        
        // No llamamos a context.setVariable(...) aquí.
        // Dejamos que el flujo siga limpio.
    }
}