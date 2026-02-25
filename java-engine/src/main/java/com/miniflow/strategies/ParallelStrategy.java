package com.miniflow.strategies;

import com.miniflow.context.ExecutionContext;
import com.miniflow.core.WorkflowRunner;
import com.miniflow.model.Connection;
import com.miniflow.model.Node;
import com.miniflow.model.Workflow;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.stream.Collectors;

/**
 * Especialista concurrente que divide el flujo del motor en varios hilos
 * Fire-And-Forget.
 */
public class ParallelStrategy implements NodeExecutor {

    // Pool de hilos estático para evitar fugas de memoria por demasiados procesos
    // encolados
    private static final ExecutorService PARALLEL_POOL = Executors.newCachedThreadPool();

    @Override
    public void execute(Node node, ExecutionContext context) throws Exception {
        // En lugar de iterar por un forEach, ramificaremos topológicamente

        Object scopeObj = context.getVariable("__workflowScope");
        if (!(scopeObj instanceof Workflow)) {
            throw new RuntimeException("No se encontró el Scope del Workflow para procesar el paralelismo");
        }

        Workflow workflow = (Workflow) scopeObj;

        // Buscamos TODOS los cables que salen explícitamente desde este PARALLEL
        List<Connection> outEdges = workflow.edges.stream()
                .filter(e -> e.source != null && e.source.equals(node.id))
                .collect(Collectors.toList());

        if (outEdges.isEmpty()) {
            context.setNodeOutput(node.id,
                    Map.of("success", true, "message", "PARALLEL sin ramas de salida. Finalizando rama."));
            return;
        }

        // Para cada cable saliente...
        for (Connection edge : outEdges) {

            // 1. Encontrar cuál es ese nodo destino (recordemos que según validación,
            // forzosamente conectará a un nodo, y ese nodo a un END)
            Optional<Node> targetNodeOpt = workflow.nodes.stream()
                    .filter(n -> n.id.equals(edge.target))
                    .findFirst();

            if (targetNodeOpt.isPresent()) {
                Node branchTarget = targetNodeOpt.get();

                // 2. Clonamos limpiamente la memoria ramificada en este microsegundo (Deep-ish
                // copy del Thread Safe Map)
                ExecutionContext branchContext = context.cloneContext();

                // 3. Disparamos la nueva bifurcación en hilo oculto Fire-And-Forget
                PARALLEL_POOL.submit(() -> {
                    try {
                        WorkflowRunner branchRunner = new WorkflowRunner();
                        // Ejecuta independientemente y no retorna nada al main. (Silencioso).
                        branchRunner.runFromNode(workflow, branchTarget, branchContext);
                    } catch (Exception e) {
                        System.err.println(
                                "[PARALLEL-ERROR] Falló una rama asíncrona (" + edge.target + "): " + e.getMessage());
                    }
                });
            }
        }

        // Finalizamos al instante en el hilo inicial (Padre) devolviendo Control
        // SUCCESS (Fire and forget).
        // ReactFlow marcará el nodo PARALLEL en verde al terminar esta línea
        context.setNodeOutput(node.id, Map.of("success", true, "branches_dispatched", outEdges.size()));
    }
}
