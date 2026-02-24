package com.miniflow.core;

import com.miniflow.context.ExecutionContext;
import com.miniflow.model.Connection;
import com.miniflow.model.Node;
import com.miniflow.model.Workflow;
import java.util.Map;
import java.util.Optional;

public class NodeResolver {

    public static Node findStartNode(Workflow workflow) {
        return workflow.nodes.stream()
                .filter(n -> n.type != null && n.type.equalsIgnoreCase("START"))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("No START node found"));
    }

    public static Node resolveNext(Workflow workflow, Node current, ExecutionContext context) {
        if (workflow == null || workflow.nodes == null || workflow.edges == null)
            return null;

        // --- PREVENCIÓN DE DUPLICACIÓN EN PARALLEL ---
        // El nodo PARALLEL se encarga de crear hilos para sus ramas.
        // El hilo padre no debe continuar navegando las ramas para evitar doble
        // ejecución.
        if ("PARALLEL".equalsIgnoreCase(current.type)) {
            return null; // Forzamos el FIN del hilo principal aquí
        }

        String branch = null;
        if ("CONDITIONAL".equalsIgnoreCase(current.type)) {
            // Buscamos en el Output específico del nodo, no en el contexto global
            Object nodeOutput = context.getNodeOutput(current.id);
            if (nodeOutput instanceof Map) {
                Map<?, ?> details = (Map<?, ?>) nodeOutput;
                // Extraemos el branch que guardó la ConditionalStrategy
                Object b = details.get("selectedBranch");
                if (b != null)
                    branch = String.valueOf(b);
            }
        }

        final String finalBranch = branch;

        // Búsqueda del Edge (Conexión)
        Optional<Connection> edge = workflow.edges.stream()
                .filter(e -> e.source != null && e.source.equals(current.id))
                .filter(e -> finalBranch == null ||
                        (e.label != null && e.label.equalsIgnoreCase(finalBranch)) ||
                        (e.sourceHandle != null && e.sourceHandle.equalsIgnoreCase(finalBranch)))
                .findFirst();

        if (edge.isPresent()) {
            String targetId = edge.get().target;
            return workflow.nodes.stream()
                    .filter(n -> n.id.equals(targetId))
                    .findFirst()
                    .orElse(null);
        }
        return null;
    }
}