package com.miniflow.strategies;

import com.miniflow.context.ExecutionContext;
import com.miniflow.core.WorkflowRunner;
import com.miniflow.model.Connection;
import com.miniflow.model.Node;
import com.miniflow.model.Workflow;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.CompletableFuture; 
import java.util.concurrent.ExecutorService;    
import java.util.concurrent.Executors;          
import java.util.stream.Collectors;

public class ParallelStrategy implements NodeExecutor {

    // ThreadPool con hilos Daemon para no bloquear el cierre de la JVM
    private static final ExecutorService PARALLEL_POOL = Executors.newCachedThreadPool(r -> {
        Thread t = new Thread(r);
        t.setDaemon(true); 
        return t;
    });

    @Override
    public void execute(Node node, ExecutionContext context) throws Exception {
        Object scopeObj = context.getVariable("__workflowScope");
        if (!(scopeObj instanceof Workflow)) {
            throw new RuntimeException("No se encontró el Scope del Workflow");
        }

        Workflow workflow = (Workflow) scopeObj;

        List<Connection> outEdges = workflow.edges.stream()
                .filter(e -> e.source != null && e.source.equals(node.id))
                .collect(Collectors.toList());

        if (outEdges.isEmpty()) {
            context.setNodeOutput(node.id, Map.of("success", true, "message", "No hay ramas"));
            return;
        }

        // Crear las tareas asíncronas
        List<CompletableFuture<Void>> branchTasks = outEdges.stream().map(edge -> 
            CompletableFuture.runAsync(() -> {
                try {
                    Optional<Node> targetNodeOpt = workflow.nodes.stream()
                            .filter(n -> n.id.equals(edge.target))
                            .findFirst();

                    if (targetNodeOpt.isPresent()) {
                        ExecutionContext branchContext = context.cloneContext();
                        // Nueva instancia de runner para ejecución aislada
                        new WorkflowRunner().runFromNode(workflow, targetNodeOpt.get(), branchContext);
                    }
                } catch (Exception e) {
                    System.err.println("[PARALLEL-ERROR]: " + e.getMessage());
                }
            }, PARALLEL_POOL)
        ).collect(Collectors.toList());

        // Esperar a que todas las ramas terminen su recorrido
        CompletableFuture.allOf(branchTasks.toArray(new CompletableFuture[0])).join();

        context.setNodeOutput(node.id, Map.of("success", true, "branches_dispatched", outEdges.size()));
    }
}