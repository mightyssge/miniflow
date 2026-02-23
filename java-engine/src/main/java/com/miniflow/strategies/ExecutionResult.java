package com.miniflow.strategies;

/**
 * REFACTOR: Esta clase encapsula el resultado de cualquier nodo.
 * Fundamental para mostrar el "Output" en el panel derecho de la UI tipo n8n.
 */
public class ExecutionResult {
    private final boolean success;
    private final String summary;
    private final Object outputData;
    private final String error;

    public ExecutionResult(boolean success, String summary, Object outputData, String error) {
        this.success = success;
        this.summary = summary;
        this.outputData = outputData;
        this.error = error;
    }

    public static ExecutionResult success(String summary, Object data) {
        return new ExecutionResult(true, summary, data, null);
    }

    public static ExecutionResult fail(String error) {
        return new ExecutionResult(false, "ERROR: " + error, null, error);
    }

    public boolean isSuccess() { return success; }
    public String getSummary() { return summary; }
    public Object getOutputData() { return outputData; }
    public String getError() { return error; }
}