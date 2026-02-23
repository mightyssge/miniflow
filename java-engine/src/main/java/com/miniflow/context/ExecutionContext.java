package com.miniflow.context;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

public class ExecutionContext {
    private final Map<String, Object> variables = new ConcurrentHashMap<>();
    
    // REFACTOR: Aquí guardamos el "Panel Derecho" indexado por el ID del nodo
    // Esto permite que el modal de n8n diga: "Dame el output del nodo con ID 'http-1'"
    private final Map<String, Object> nodeOutputs = new ConcurrentHashMap<>();

    public void setVariable(String key, Object value) {
        if (key != null) variables.put(key, value);
    }

    public Object getVariable(String key) {
        return variables.get(key);
    }

    public Map<String, Object> getVariables() {
        // Devolvemos una copia o el mapa original para lectura
        return this.variables;
    }

    // Para el panel derecho del modal
    public void setNodeOutput(String nodeId, Object output) {
        nodeOutputs.put(nodeId, output);
    }

    public Object getNodeOutput(String nodeId) {
        return nodeOutputs.get(nodeId);
    }

    public void clear() {
        variables.clear();
        nodeOutputs.clear();
    }
}