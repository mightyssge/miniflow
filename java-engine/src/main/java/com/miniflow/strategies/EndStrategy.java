package com.miniflow.strategies;

import com.miniflow.model.Node;
import com.miniflow.context.ExecutionContext;
import java.util.Map;

public class EndStrategy implements NodeExecutor {
    @Override
    public void execute(Node node, ExecutionContext context) {
        long endTime = System.currentTimeMillis();
        
        // 1. Recuperamos el tiempo que puso el Runner al principio
        Object startObj = context.getVariable("__workflowStartTime");
        long startTime = (startObj instanceof Long) ? (long) startObj : endTime;
        long durationMs = endTime - startTime;

        // ✅ REFACTOR: Toda la metadata se va al NodeOutput (Panel Derecho de la UI)
        context.setNodeOutput(node.id, Map.of(
            "message", "Workflow finished successfully",
            "executionStats", Map.of(
                "startTime", startTime,
                "endTime", endTime,
                "durationMs", durationMs,
                "durationHuman", durationMs + " ms"
            ),
            "finalStatus", "SUCCESS"
        ));

    }
}