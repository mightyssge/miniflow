package com.miniflow.model;

/**
 * Representa un "Edge" en React Flow.
 */
public class Connection {
    public String source;
    public String target;
    public String label;        // "TRUE", "FALSE", etc.
    public String sourceHandle; // ID del puerto de salida en la UI

    public boolean matchesBranch(String branchName) {
        if (branchName == null) return true;
        return branchName.equalsIgnoreCase(label) || branchName.equalsIgnoreCase(sourceHandle);
    }
}