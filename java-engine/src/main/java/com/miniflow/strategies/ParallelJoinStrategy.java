package com.miniflow.strategies;

import com.miniflow.context.ExecutionContext;
import com.miniflow.model.Node;
import com.miniflow.model.Workflow;
import java.util.Map;

/**
 * Patrón Fork/Join: Barrera de sincronización.
 * Los hilos paralelos mueren aquí, excepto el último en llegar, el cual
 * revive el hilo principal para continuar la ejecución secuencial.
 */
public class ParallelJoinStrategy implements NodeExecutor {

    @Override
    public void execute(Node node, ExecutionContext context) throws Exception {
        Object scopeObj = context.getVariable("__workflowScope");
        if (!(scopeObj instanceof Workflow workflow)) {
            throw new RuntimeException("No se encontró el Scope del Workflow en la barrera");
        }

        // 1. Calcular cuántos cables ENTRAN a este nodo Join en la topología global
        long requiredArrivals = workflow.edges.stream()
                .filter(e -> e.target != null && e.target.equals(node.id))
                .count();

        if (requiredArrivals == 0) {
            System.out.println("[PARALLEL-JOIN] No se requieren llegadas. Continuando flujo.");
            return;
        }

        // 2. Reportar la llegada de este Hilo al contador atómico (Thread-Safe)
        int currentArrivals = context.incrementAndGetJoinArrival(node.id);

        System.out.println(String.format("[PARALLEL-JOIN] Hilo %s reportó llegada al JOIN '%s' (%d/%d)",
                Thread.currentThread().getName(), node.id, currentArrivals, requiredArrivals));

        // 3. Evaluar si debe sobrevivir o morir
        if (currentArrivals < requiredArrivals) {
            // Este hilo no es el último. Matamos silenciosamente su ejecución en
            // NodeResolver
            context.setNodeOutput(node.id, Map.of(
                    "status", "WAITING",
                    "message", "Hilo destruido. Esperando a los demás",
                    "arrivals", currentArrivals));

            throw new BarrierHaltException();
        } else {
            // ¡Soy el último hilo en llegar! Continúo.
            System.out.println("[PARALLEL-JOIN] Todos los hilos llegaron. ¡Barrera superada!");
            context.setNodeOutput(node.id, Map.of(
                    "status", "COMPLETED",
                    "message", "Barrera superada. Se reinicia el hilo principal.",
                    "arrivals", currentArrivals));
        }
    }

    // Excepción de control interno para detener el ExecutionRunner limpiamente
    public static class BarrierHaltException extends RuntimeException {
        public BarrierHaltException() {
            super("HALT_THREAD", null, false, false);
        }
    }
}
