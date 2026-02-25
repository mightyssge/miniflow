package com.miniflow.context;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

public class ExecutionContext {
    private final Map<String, Object> variables = new ConcurrentHashMap<>();

    // REFACTOR: Aquí guardamos el "Panel Derecho" indexado por el ID del nodo
    // Esto permite que el modal de n8n diga: "Dame el output del nodo con ID
    // 'http-1'"
    private final Map<String, Object> nodeOutputs = new ConcurrentHashMap<>();

    // Contadores atómicos compartidos entre hilos para sincronizar PARALLEL_JOIN
    private final Map<String, java.util.concurrent.atomic.AtomicInteger> joinCounters;

    public ExecutionContext() {
        this.joinCounters = new ConcurrentHashMap<>();
    }

    private ExecutionContext(Map<String, java.util.concurrent.atomic.AtomicInteger> sharedJoinCounters) {
        this.joinCounters = sharedJoinCounters;
    }

    public int incrementAndGetJoinArrival(String targetJoinNodeId) {
        return joinCounters.computeIfAbsent(targetJoinNodeId, k -> new java.util.concurrent.atomic.AtomicInteger(0))
                .incrementAndGet();
    }

    public void setVariable(String key, Object value) {
        if (key != null)
            variables.put(key, value);
    }

    public Object getVariable(String key) {
        return variables.get(key);
    }

    public Map<String, Object> getVariables() {
        return this.variables;
    }

    public void setNodeOutput(String nodeId, Object output) {
        nodeOutputs.put(nodeId, output);
    }

    public Object getNodeOutput(String nodeId) {
        return nodeOutputs.get(nodeId);
    }

    public void clear() {
        variables.clear();
        nodeOutputs.clear();
        joinCounters.clear();
    }

    public ExecutionContext cloneContext() {
        // Al clonar para hilos hijos, compartimos LA MISMA REFERENCIA de joinCounters
        // para que todos sumen al mismo número. Las variables normales se clonan por
        // valor superficial.
        ExecutionContext clone = new ExecutionContext(this.joinCounters);
        clone.variables.putAll(this.variables);
        clone.nodeOutputs.putAll(this.nodeOutputs);
        return clone;
    }
}