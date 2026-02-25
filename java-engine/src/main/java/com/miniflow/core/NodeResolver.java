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

        // --- PREVENCIÓN DE DUPLICACIÓN EN PARALLEL Y BARRERAS ---
        // El nodo PARALLEL se encarga de crear hilos para sus ramas.
        // El hilo padre no debe continuar navegando las ramas para evitar doble
        // ejecución.
        if ("PARALLEL".equalsIgnoreCase(current.type)) {
            return null; // Forzamos el FIN del hilo principal aquí
        }

        // Si acabamos de procesar un nodo PARALLEL_JOIN pero la estrategia no lanzó
        // una BarrierHaltException... significa que somos EL ÚLTIMO HILO.
        // Por ende, está perfecto que NodeResolver continúe buscando el `target` de
        // este join
        // para continuar el flujo, comportándose ahora como el Main Thread.

        String branch = getBranchFlag(current, context);

        Optional<Connection> edge = workflow.edges.stream()
                .filter(e -> e.source != null && e.source.equals(current.id))
                .filter(e -> branch == null ||
                        (e.label != null && e.label.equalsIgnoreCase(branch)) ||
                        (e.sourceHandle != null && e.sourceHandle.equalsIgnoreCase(branch)))
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

    private static String getBranchFlag(Node current, ExecutionContext context) {
        if (!"CONDITIONAL".equalsIgnoreCase(current.type)) {
            return null;
        }
        Object nodeOutput = context.getNodeOutput(current.id);
        if (nodeOutput instanceof Map<?, ?> details) {
            Object selected = details.get("selectedBranch");
            if (selected != null) {
                return String.valueOf(selected);
            }
        }
        return null;
    }
}