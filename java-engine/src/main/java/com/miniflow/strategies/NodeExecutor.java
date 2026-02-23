package com.miniflow.strategies;

import com.miniflow.model.Node;
import com.miniflow.context.ExecutionContext;

/**
 * REFACTOR: Aplicación del Strategy Pattern.
 * Define la unidad mínima de ejecución de un nodo.
 */
public interface NodeExecutor {
    /**
     * Ejecuta la lógica del nodo.
     * @param node El modelo del nodo con su configuración (config).
     * @param context El contexto compartido del workflow.
     * @throws Exception Si el nodo falla y la política es STOP_ON_FAIL.
     */
    void execute(Node node, ExecutionContext context) throws Exception;
}